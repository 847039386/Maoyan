"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Util_1 = require("./util/Util");
const cheerio = require("cheerio");
const agent = require("superagent");
const fs = require("fs");
const index_1 = require("./models/index");
const IMaoYanData_1 = require("./Interface/IMaoYanData");
const IMYOffice_1 = require("./Interface/IMYOffice");
const schedule = require('node-schedule');
class MaoYan {
    constructor(start) {
        this.mz_Util = new Util_1.Util(start);
        this.reptile_url = "http://piaofang.maoyan.com/";
        this.maoyan_detail_list = [];
        this.cache = 100;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mz_Util.getDaysData();
            yield this.getListDate(this.mz_Util.cur_reptile_dates.currentDates);
            //以下循环 ，暂且搁置  华丽分割线 ---------------------------------------------------------
            this.mz_Util.changeTime();
            let over = this.mz_Util.isOver();
            if (over) {
                yield this.start();
            }
            else {
                //为了优化数据减少重复入库。。所以当时间走到今日的时候。爬虫爬的的年份停止，爬虫所爬取的list页面结束。。将剩余的文章页的内容爬入数据库。
                yield this.resolveListToDetail(this.maoyan_detail_list);
            }
            console.log("爬虫程序，已爬得该网站上的所有数据，本程序将自动在每天的00：00进行对网站的跟踪爬虫。");
        });
    }
    getListDate(dates) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < dates.length; i++) {
                yield this.resolveList(dates[i]);
            }
        });
    }
    getIDLists(mos) {
        let cur_list = [];
        mos.forEach(m => {
            cur_list.push(m.id);
        });
        return cur_list;
    }
    resolveListToDetail(list) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("---------------------华丽的分割线--------------------");
            console.log("以下将爬取内容页，即将添加CatEyeMovie表！");
            for (let i = 0; i < list.length; i++) {
                yield this.resolveDetail(list[i]); //处理内容页
            }
        });
    }
    resolveList(date, necn) {
        return __awaiter(this, void 0, void 0, function* () {
            this.debug_Date(date); //debug --- 输出当前时间
            let html = yield this.getHtmlList(date); //获取选定时间的列表Html
            if (html) {
                let mos = yield this.listDetail(date, html); //获取list的爬虫数据 ，这是一个数组，有爬虫的所有数据
                yield this.saveBoxOffices(mos, necn); //列表数据入库。
                let list = this.getIDLists(mos); //利用正则匹配每个电影的编号。这是一个数组，只有id的数组
                this.sortDetailList(list); //整理 电影编号。。将重复的电影去除。。并存放在该对象的属性里。
                if (necn) {
                    yield this.resolveListToDetail(list); //直接循环本页数据
                }
                else {
                    yield this.madeDetailList(); //循环存储电影属性中所有电影，并到每个页面拿到数据，并且做存库操作。他是一个void类型的方法。
                }
            }
        });
    }
    sortDetailList(arr) {
        let _this = this;
        let arr_concat = [];
        arr_concat = arr.concat(_this.maoyan_detail_list);
        this.maoyan_detail_list = this.mz_Util.uniqueArray(arr_concat);
    }
    madeDetailList() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("当前存放电影数组的条数：---------------" + this.maoyan_detail_list.length);
            if (this.maoyan_detail_list.length > this.cache) {
                yield this.resolveListToDetail(this.maoyan_detail_list);
                this.maoyan_detail_list = [];
            }
            else {
                console.log("当前重复电影并没有到达" + this.cache + "条，将不用存放到数据库。");
            }
        });
    }
    resolveDetail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let html = yield this.getHtmlDetail(id); //获取内容页的Html并转义。
            if (html) {
                let maoyan_data = this.getMaoyanDetail(id, html); //获取内容页的数据。
                this.debug_MaoyanData(maoyan_data); //debug ----- 输出数据
                this.saveCatEyeMovie(maoyan_data); //入库并提示。
            }
        });
    }
    listDetail(date, html) {
        return __awaiter(this, void 0, void 0, function* () {
            let reg = /\/(\w*)\.ttf/;
            let reg_id = /([1-9]\d*\.?\d*)|(0\.\d*[1-9])/;
            let mos = [];
            html = yield this.clTts(reg.exec(html)[1] + ".ttf", html);
            let $ = cheerio.load(html);
            $("#ticket_tbody ul.canTouch").each((idx, ele) => {
                let myoffice = new IMYOffice_1.MYOffice();
                myoffice.box_date = date;
                myoffice.id = $(ele).attr("data-com").match(reg_id)[0];
                myoffice.name = $(ele).find("li.c1 b").text();
                myoffice.film_realTime = $(ele).find("li.c2 b i.cs").text();
                myoffice.film_zb = $(ele).find("li.c3 i.cs").text();
                myoffice.paipian_zb = $(ele).find("li.c4 i.cs").text();
                myoffice.attendance = $(ele).find("li.c5 i.cs").text();
                myoffice.film_days = $(ele).find("li.c1 em").first().text();
                mos.push(myoffice);
            });
            return new Promise(resolve => { resolve(mos); });
        });
    }
    getHtmlList(date) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mz_Util.wait_seconds(2);
            let url = this.reptile_url + "?date=" + date;
            let html = yield this.mz_Util.getAgent(url);
            return new Promise((resolve, reject) => {
                if (html) {
                    resolve(html.text);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    getHtmlDetail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let html, url, res, reg;
            url = this.reptile_url + "movie/" + id + "?_v_=yes";
            reg = /\/(\w*)\.ttf/;
            yield this.mz_Util.wait_seconds(0.5);
            res = yield this.mz_Util.getAgent(url);
            if (res) {
                html = yield this.clTts(reg.exec(res.text)[1] + ".ttf", res.text);
            }
            else {
                html = null;
            }
            return new Promise((resolve, reject) => {
                resolve(html);
            });
        });
    }
    getMaoyanDetail(id, html) {
        let $;
        $ = cheerio.load(html);
        let maoyan_data = new IMaoYanData_1.MaoYanData();
        maoyan_data.id = id;
        maoyan_data.name = $(".info-detail .info-title").text();
        maoyan_data.score = this.deleteSpace($(".info-score .left p.score-num ").text());
        maoyan_data.z_score = this.deleteSpace($(".info-score .right p.score-num ").text());
        maoyan_data.release_time = ($(".info-detail .info-release").text()).match(/\d.*\d/)[0];
        $(".box-summary .box-detail").each((idx, ele) => {
            let piaofang = this.deleteSpace($(ele).find(".cs").text());
            let unit = $(ele).find(".box-unit").text();
            let result = piaofang * (unit ? 10000 : 1);
            switch (idx) {
                case 0:
                    maoyan_data.total_bo = result;
                    break;
                case 1:
                    maoyan_data.week_bo = result;
                    break;
                case 2:
                    maoyan_data.day_bo = result;
                    break;
            }
        });
        return maoyan_data;
    }
    debug_MaoyanData(my) {
        console.log("----------------------------------------------------");
        console.log("编号：" + my.id);
        console.log("名字：" + my.name);
        console.log("观众：" + my.score);
        console.log("专家：" + my.z_score);
        console.log("累计：" + my.total_bo);
        console.log("首周：" + my.week_bo);
        console.log("首日：" + my.day_bo);
        console.log("上映时间：" + my.release_time);
    }
    debug_Date(date) {
        console.log("----------------------------------------------------");
        console.log("                      " + date);
        console.log("----------------------------------------------------");
    }
    deleteSpace(str) {
        let result = str.replace(/(^\s+)|(\s+$)/g, "");
        result = parseFloat(result) ? parseFloat(result) : 0;
        return result;
    }
    anaTts(str, ttf) {
        let arr = ttf.match(/uni(\w{4})/g);
        if (arr && arr.length && arr.length === 10) {
            for (let i = 0; i < arr.length; i++) {
                str = str.replace(new RegExp(arr[i].toLowerCase().replace('uni', '&#x') + ';', 'g'), i.toString());
            }
        }
        return str;
    }
    downFile(filename) {
        const font_url = 'http://p0.meituan.net/colorstone/' + filename;
        const stream = fs.createWriteStream("./bin/font/" + filename);
        const req = agent.get(font_url);
        let pro = new Promise((resolve, reject) => {
            req.on("error", err => { console.log("下载出错"); reject(err); })
                .pipe(stream)
                .on("close", () => { resolve(true); });
        });
        return pro;
    }
    clTts(filename, str) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let pro = new Promise((resolve, reject) => {
                fs.readFile("./bin/font/" + filename, { encoding: 'utf-8' }, (err, data) => {
                    err ? reject(err) : resolve(this.anaTts(str, data));
                });
            });
            pro.then(data => {
                resolve(data);
            }, () => __awaiter(this, void 0, void 0, function* () {
                yield this.downFile(filename);
                fs.readFile("./bin/font/" + filename, { encoding: 'utf-8' }, (err, data) => {
                    resolve(this.anaTts(str, data));
                });
            }));
        }));
    }
    saveCatEyeMovie(maoyan_data) {
        return new Promise((resolve, reject) => {
            index_1.CatEye.findOne({ id: maoyan_data.id }).exec(function (err, data) {
                if (!data) {
                    let cat = new index_1.CatEye();
                    cat.id = maoyan_data.id;
                    cat.name = maoyan_data.name;
                    cat.score = maoyan_data.score;
                    cat.z_score = maoyan_data.z_score;
                    cat.total_bo = maoyan_data.total_bo;
                    cat.week_bo = maoyan_data.week_bo;
                    cat.day_bo = maoyan_data.day_bo;
                    cat.release_time = maoyan_data.release_time;
                    cat.save(function (err, data) {
                        resolve();
                    });
                }
                else {
                    index_1.CatEye.findByIdAndUpdate(data._id, maoyan_data, function (err, data) {
                        resolve();
                    });
                }
            });
        });
    }
    saveBoxOffice(moc, up) {
        return new Promise((res, rej) => {
            index_1.BoxOffice.findOne({ id: moc.id, box_date: moc.box_date }).exec(function (err, bofs) {
                if (!bofs) {
                    let ibo = new index_1.BoxOffice();
                    ibo.id = moc.id;
                    ibo.name = moc.name;
                    ibo.box_date = moc.box_date;
                    ibo.film_realTime = moc.film_realTime;
                    ibo.film_zb = moc.film_zb;
                    ibo.paipian_zb = moc.paipian_zb;
                    ibo.attendance = moc.attendance;
                    ibo.film_days = moc.film_days;
                    ibo.save(function (err, data) {
                        console.log("编号：" + moc.id + "-- 名称：" + moc.name + "        --------已入库");
                        res();
                    });
                }
                else {
                    if (up) {
                        index_1.BoxOffice.findByIdAndUpdate(bofs._id, {
                            film_realTime: moc.film_realTime,
                            film_zb: moc.film_zb,
                            paipian_zb: moc.paipian_zb,
                            attendance: moc.attendance
                        }).exec(() => {
                            console.log("编号：" + moc.id + "-- 名称：" + moc.name + "        --------已重复，更新数据");
                            res();
                        });
                    }
                    else {
                        console.log("编号：" + moc.id + "-- 名称：" + moc.name + "        --------已重复");
                        res();
                    }
                }
            });
        });
    }
    saveBoxOffices(mocs, up) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < mocs.length; i++) {
                yield this.mz_Util.wait_seconds(0.5);
                yield this.saveBoxOffice(mocs[i], up);
            }
        });
    }
    //爬取今天的电影。
    repltileToday() {
        return __awaiter(this, void 0, void 0, function* () {
            let today = new Date();
            let y_today = today.getFullYear();
            let m_today = today.getMonth();
            let d_today = today.getDate();
            d_today = d_today < 10 ? "0" + d_today : d_today;
            m_today = (m_today + 1) < 10 ? "0" + (m_today + 1) : (m_today + 1);
            let date = y_today + "-" + m_today + "-" + d_today;
            yield this.resolveList(date, true);
            console.log(date + "---数据爬取完毕");
            console.log("----------------------------------------------------");
        });
    }
    //爬取日期需要的所有电影
    reptileAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.start(); //抓取所有电影
            yield this.scheduleReptile(); //抓取完毕之后开启定时任务。
        });
    }
    //定时任务爬取每天电影
    scheduleReptile() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("开启定时任务");
            //var rule = new schedule.RecurrenceRule();
            //rule.minute = 26;
            //schedule.scheduleJob(rule,async () => {
            //    await this.repltileToday()
            //});
            yield this.repltileToday();
        });
    }
    getYear(date) {
        return __awaiter(this, void 0, void 0, function* () {
            let reg = /^\d{4}-[0-1][0-9]-[0-3][0-9]$/;
            if (reg.test(date)) {
                yield this.resolveList(date, true);
                console.log("---------------------" + date + "---------------------------");
                console.log("爬虫完毕");
            }
            else {
                console.log("");
                console.log("不合格的语法。例如：<--  node out/app -y 2017-01-01  -->");
            }
            process.exit();
        });
    }
    getId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.resolveDetail(id);
            console.log("----------------------------------------------------");
            process.exit();
        });
    }
    test() {
        console.log("这是测试代码");
    }
}
exports.MaoYan = MaoYan;
