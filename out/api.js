"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const dealDate_1 = require("./util/dealDate");
const cheerio = require("cheerio");
const agent = require("superagent");
class MaoYan {
    constructor() {
        this.dealDate = new dealDate_1.DealDate("2016-11-07");
        this.reptile_url = "http://piaofang.maoyan.com/";
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dealDate.getDaysData();
            this.getListDate(this.dealDate.cur_reptile_dates.currentDates);
            //以下循环 ，暂且搁置  华丽分割线 ---------------------------------------------------------
            this.dealDate.changeTime();
            let over = this.dealDate.isOver();
            if (over) {
                yield this.start();
            }
        });
    }
    getListDate(dates) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < dates.length; i++) {
                yield this.dealDate.wait_seconds(5);
                let url = this.reptile_url + "?date=" + dates[i];
                let listHtml = yield agent("GET", url);
                let list = this.getIDLists(listHtml);
                console.log("当前日期--------  ： " + dates[i]);
                yield this.resolveList(list);
                console.log("-----------------------------");
            }
        });
    }
    getIDLists(res) {
        let $, cur_list = [];
        $ = cheerio.load(res.text);
        $("#ticket_tbody ul.canTouch").each((idx, ele) => {
            let id = $(ele).attr("data-com");
            let reg = /([1-9]\d*\.?\d*)|(0\.\d*[1-9])/;
            if (id.match(reg)[0]) {
                cur_list.push(id.match(reg)[0]);
            }
        });
        return cur_list;
    }
    resolveList(list) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < list.length; i++) {
                let content = yield this.resolveDetail(list[i]);
                console.log(content);
            }
        });
    }
    resolveDetail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let name, randay, total_bo, week_bo, day_bo, url, res, $;
            url = this.reptile_url + "movie/" + id + "?_v_=yes";
            res = yield agent("GET", url);
            $ = cheerio.load(res.text);
            name = $(".info-detail .info-title").text();
            return name;
        });
    }
    test() {
        this.start();
    }
}
var maoyan = new MaoYan();
maoyan.test();
