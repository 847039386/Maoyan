import { Util } from "./util/Util"
import * as cheerio from 'cheerio';
import * as agent from 'superagent';

import * as fs from 'fs';
import { Movie ,IMovie ,BoxOffice  } from "./models/index"
import { MaoYanData } from "./Interface/IMaoYanData"
import { MYOffice } from "./Interface/IMYOffice"

const schedule = require('node-schedule');





export class MaoYan {
    private mz_Util : Util;    //封装的方法。
    private reptile_url : string;   //爬虫网站
    private maoyan_detail_list : any [];
    constructor(){
        this.mz_Util = new Util("2017-2-17");
        this.reptile_url = "http://piaofang.maoyan.com/";
        this.maoyan_detail_list = [];
    }
    async start(){
        this.mz_Util.getDaysData();
        await this.getListDate(this.mz_Util.cur_reptile_dates.currentDates)
        //以下循环 ，暂且搁置  华丽分割线 ---------------------------------------------------------
        this.mz_Util.changeTime();
        let over = this.mz_Util.isOver();
        if(over){
            await this.start();
        }else{
            //为了优化数据减少重复入库。。所以当时间走到今日的时候。爬虫爬的的年份停止，爬虫所爬取的list页面结束。。将剩余的文章页的内容爬入数据库。
            await this.resolveListToDetail(this.maoyan_detail_list);
        }
        console.log("爬虫程序，已爬得该网站上的所有数据，本程序将自动在每天的00：00进行对网站的跟踪爬虫。")




    }
    async getListDate(dates : any[]){
        for(let i=0; i<dates.length; i++){
            await this.resolveList(dates[i])
        }
    }
    getIDLists(mos : MYOffice[]) :any[] {
        let cur_list :any[] = [];
        mos.forEach(m => {
            cur_list.push(m.id);
        })
        return cur_list;
    }
    async resolveListToDetail(list : any[])  {
        console.log("---------------------华丽的分割线--------------------")
        console.log("以下将爬取内容页，即将修改Movie表！")
        for(let i=0; i<list.length; i++){
           await this.resolveDetail(list[i]);        //处理内容页
        }
    }
    async resolveList(date :string ,necn? : boolean) {
        this.debug_Date(date)                            //debug --- 输出当前时间
        let html = await this.getHtmlList(date)         //获取选定时间的列表Html
        let mos = await this.listDetail(date,html)      //获取list的爬虫数据 ，这是一个数组，有爬虫的所有数据
        await this.saveBoxOffices(mos,necn)                   //列表数据入库。
        let list = this.getIDLists(mos)                 //利用正则匹配每个电影的编号。这是一个数组，只有id的数组
        this.sortDetailList(list)                       //整理 电影编号。。将重复的电影去除。。并存放在该对象的属性里。
        if(necn){
            await this.resolveListToDetail(list);       //直接循环本页数据
        }else{
            await this.madeDetailList(100)                     //循环存储电影属性中所有电影，并到每个页面拿到数据，并且做存库操作。他是一个void类型的方法。
        }
    }
    sortDetailList(arr : any []){
        let _this = this;
        let arr_concat : any [] = [];
        arr_concat = arr.concat(_this.maoyan_detail_list);
        this.maoyan_detail_list = this.mz_Util.uniqueArray(arr_concat);
    }
    async madeDetailList(condition : number){
        console.log("当前存放电影数组的条数：---------------"+this.maoyan_detail_list.length)
        if(this.maoyan_detail_list.length > condition){
            await this.resolveListToDetail(this.maoyan_detail_list);
            this.maoyan_detail_list = [];
        }else{
            console.log("当前重复电影并没有到达"+ condition +"条，将不用存放到数据库。")
        }
    }
    async resolveDetail(id : number)  {
        let html = await this.getHtmlDetail(id)                                 //获取内容页的Html并转义。
        let maoyan_data : MaoYanData =  this.getMaoyanDetail(id,html);         //获取内容页的数据。
        this.debug_MaoyanData(maoyan_data);                                    //debug ----- 输出数据
        this.updateMovie(maoyan_data.name,maoyan_data);                       //入库并提示。
    }


    async listDetail(date :string ,html :string) : Promise<any> {
        let reg = /\/(\w*)\.ttf/;
        let reg_id = /([1-9]\d*\.?\d*)|(0\.\d*[1-9])/
        let mos : MYOffice[] = []
        html = await this.clTts(reg.exec(html)[1] + ".ttf",html);
        let $ : any = cheerio.load(html);
        $("#ticket_tbody ul.canTouch").each((idx :number,ele :any) => {
            let myoffice = new MYOffice();
            myoffice.box_date = date;
            myoffice.id = $(ele).attr("data-com").match(reg_id)[0];
            myoffice.name = $(ele).find("li.c1 b").text();
            myoffice.film_realTime = $(ele).find("li.c2 b i.cs").text();
            myoffice.film_zb = $(ele).find("li.c3 i.cs").text();
            myoffice.paipian_zb = $(ele).find("li.c4 i.cs").text();
            myoffice.attendance = $(ele).find("li.c5 i.cs").text();
            myoffice.film_days = $(ele).find("li.c1 em").first().text();
            mos.push(myoffice)
        })
        return new Promise(resolve =>{ resolve(mos) });
    }
    async getHtmlList(date : string) : Promise<any> {
        await this.mz_Util.wait_seconds(2);
        let url = this.reptile_url + "?date=" + date;
        let html = await agent("GET",url);
        return new Promise((resolve ,reject) => {
            resolve(html.text)
        })
    }
    async getHtmlDetail(id :number) : Promise<any> {
        let html :any ,url ,res,reg;
        url = this.reptile_url + "movie/"+ id +"?_v_=yes"
        reg = /\/(\w*)\.ttf/;
        await this.mz_Util.wait_seconds(0.5);
        res = await agent("GET",url);
        html = await this.clTts(reg.exec(res.text)[1] + ".ttf",res.text);
        return new Promise((resolve ,reject) => {
            resolve(html)
        })
    }
    getMaoyanDetail(id :number ,html: string) : MaoYanData {
        let $ : any;
        $ = cheerio.load(html);
        let maoyan_data : MaoYanData = new MaoYanData()
        maoyan_data.id = id;
        maoyan_data.name = $(".info-detail .info-title").text();
        maoyan_data.score =  this.deleteSpace($(".info-score .left p.score-num ").text());
        maoyan_data.z_score = this.deleteSpace($(".info-score .right p.score-num ").text())  || "暂无" ;
        $(".box-summary .box-detail").each(( idx : number ,ele :any) => {
            let piaofang = this.deleteSpace($(ele).text())
            switch (idx){
                case 0 :
                    maoyan_data.total_bo = piaofang
                    break;
                case 1 :
                    maoyan_data.week_bo = piaofang
                    break;
                case 2 :
                    maoyan_data.day_bo = piaofang
                    break;
            }
        })
        return maoyan_data
    }
    debug_MaoyanData(my : MaoYanData) : void {
        console.log("----------------------------------------------------")
        console.log("编号：" + my.id)
        console.log("名字：" + my.name)
        console.log("观众：" + my.score)
        console.log("专家：" + my.z_score)
        console.log("累计：" + my.total_bo)
        console.log("首周：" + my.week_bo)
        console.log("首日：" + my.day_bo)
    }
    debug_Date(date : string) : void {
        console.log("----------------------------------------------------")
        console.log("                      " +  date )
        console.log("----------------------------------------------------")
    }
    deleteSpace(str : any) : any {
        return str.replace(/(^\s+)|(\s+$)/g, "")
    }
    anaTts(str :string ,ttf :string) : string{
        let arr = ttf.match(/uni(\w{4})/g);
        if (arr && arr.length && arr.length === 10) {
            for (let i = 0; i < arr.length; i++) {
                str = str.replace(new RegExp(arr[i].toLowerCase().replace('uni', '&#x') + ';', 'g'), i.toString());
            }
        }
        return str;
    }
    downFile(filename : string) : Promise<any> {
        const font_url = 'http://p0.meituan.net/colorstone/' + filename;
        const stream = fs.createWriteStream("./bin/font/" + filename);
        const req = agent.get(font_url);
        let pro =  new Promise((resolve ,reject) => {
            req.on("error",err => { console.log("下载出错"); reject(err) })
                .pipe(stream)
                .on("close",() => { resolve(true) })
        })
        return pro;
    }
    clTts(filename :string ,str :string) : Promise<any> {
        return new Promise(async (resolve ,reject) => {
            let  pro =  new Promise((resolve,reject) => {
                fs.readFile("./bin/font/"+ filename,{ encoding: 'utf-8' } ,(err,data) => {
                    err ?  reject(err) : resolve(this.anaTts(str,data)) ;
                })
            })
            pro.then(data =>{
                resolve(data)
            },async () => {
                await this.downFile(filename)
                fs.readFile("./bin/font/"+ filename,{ encoding: 'utf-8' } ,(err,data) => {
                    resolve(this.anaTts(str,data))
                })
            })
        })
    }
    updateMovie(name :any ,maoyan_data :MaoYanData) : Promise<any> {
       return new Promise((resolve ,reject) => {
           Movie.find({ name : name}).exec((err,data : IMovie[]) => {
               if(data.length == 1 ){
                   Movie.findByIdAndUpdate(data[0]._id,maoyan_data).exec(function(){
                       resolve();
                   })
               }else{
                   resolve()
               }
           })
       })
    }
    saveBoxOffice(moc : MYOffice,up? :boolean) : Promise<any>{
        return new Promise( (res,rej) => {
            BoxOffice.findOne({ id : moc.id ,box_date : moc.box_date }).exec(function(err,bofs){
                if(!bofs){
                    let ibo = new BoxOffice();
                    ibo.id = moc.id;
                    ibo.name = moc.name;
                    ibo.box_date = moc.box_date
                    ibo.film_realTime = moc.film_realTime
                    ibo.film_zb = moc.film_zb;
                    ibo.paipian_zb = moc.paipian_zb
                    ibo.attendance = moc.attendance
                    ibo.film_days = moc.film_days
                    ibo.save(function(err,data){
                        console.log("编号："+ moc.id +"-- 名称："+ moc.name +"        --------已入库")
                        res()
                    });
                }else{
                    if(up){
                        BoxOffice.findByIdAndUpdate(bofs._id,{
                            film_realTime : moc.film_realTime,
                            film_zb :moc.film_zb,
                            paipian_zb :moc.paipian_zb,
                            attendance : moc.attendance
                        }).exec(()=>{
                            console.log("编号："+ moc.id +"-- 名称："+ moc.name +"        --------已重复，更新数据")
                            res()
                        })
                    }else{
                        console.log("编号："+ moc.id +"-- 名称："+ moc.name +"        --------已重复")
                        res()
                    }

                }
            })
        })
    }
    async saveBoxOffices(mocs : MYOffice[],up? :boolean){
        for(let i = 0; i < mocs.length; i++){
            await this.mz_Util.wait_seconds(0.5)
            await this.saveBoxOffice(mocs[i],up)
        }
    }
    //爬取今天的电影。
    async repltileToday(){
        let today = new Date();
        let y_today :any = today.getFullYear();
        let m_today :any = today.getMonth();
        let d_today :any = today.getDate();
        d_today = d_today < 10 ? "0" + d_today : d_today;
        let date = y_today + "-" + (m_today + 1)  + "-" + d_today;
        await this.resolveList(date,true);
        console.log(date + "---数据爬取完毕")
        console.log("----------------------------------------------------")
    }
    //爬取日期需要的所有电影
    async reptileAll(){
        await this.start()        //抓取所有电影
        await this.scheduleReptile()    //抓取完毕之后开启定时任务。
    }
    //定时任务爬取每天电影
    async scheduleReptile(){
        console.log("开启定时任务")
        var rule = new schedule.RecurrenceRule();
        rule.minute = 40;
        var j = schedule.scheduleJob(rule,async () => {
            await this.repltileToday()
        });
    }

}










