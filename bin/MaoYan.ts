import { DealDate } from "./util/dealDate"
import * as cheerio from 'cheerio';
import * as agent from 'superagent';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import { Movie ,IMovie } from "./models/Movie"
mongoose.connect('mongodb://127.0.0.1/douban_data')




export class MaoYan {
    private dealDate : DealDate;    //封装的方法。
    private reptile_url : string;   //爬虫网站
    constructor(){
        this.dealDate = new DealDate("2016-11-07");
        this.reptile_url = "http://piaofang.maoyan.com/";
    }
    async start(){
        this.dealDate.getDaysData();
        await this.getListDate(this.dealDate.cur_reptile_dates.currentDates)
        //以下循环 ，暂且搁置  华丽分割线 ---------------------------------------------------------
        this.dealDate.changeTime();
        let over = this.dealDate.isOver();
        if(over){
            await this.start();
        }

    }
    async getListDate(dates : any[]){
        for(let i=0; i<dates.length; i++){
            await this.dealDate.wait_seconds(5);
            let url = this.reptile_url + "?date=" + dates[i];
            let listHtml = await agent("GET",url);
            let list = this.getIDLists(listHtml)
            console.log("当前日期--------  ： " +dates[i])
            await this.resolveList(list)
            console.log("-----------------------------")
        }
    }
    getIDLists(res : any){
        let $ : any , cur_list :any[] = [];
        $ = cheerio.load(res.text);
        $("#ticket_tbody ul.canTouch").each((idx :number , ele : any) => {
            let id = $(ele).attr("data-com");
            let reg = /([1-9]\d*\.?\d*)|(0\.\d*[1-9])/
            if(id.match(reg)[0]){
                cur_list.push(id.match(reg)[0])
            }
        })
        return cur_list;
    }
    async resolveList(list : any[]){
        for(let i=0; i<list.length; i++){
            let content = await this.resolveDetail(list[i]);

        }
    }
    async resolveDetail(id : number){
        let html ,name ,randay ,maoyan_score,total_bo ,week_bo ,day_bo ,url ,res ,$ ,reg
        url = this.reptile_url + "movie/"+ id +"?_v_=yes"
        reg = /\/(\w*)\.ttf/;
        await this.dealDate.wait_seconds(0.5);
        res = await agent("GET",url);
        html = await this.clTts(reg.exec(res.text)[1] + ".ttf",res.text);
        $ = cheerio.load(html.toString());
        name = $(".info-detail .info-title").text();
        maoyan_score = $("p.score-num ").text();
        console.log(name,maoyan_score);
        return name;
    }

    anaTts(str :string ,ttf :string){
        let arr = ttf.match(/uni(\w{4})/g);
        if (arr && arr.length && arr.length === 10) {
            for (let i = 0; i < arr.length; i++) {
                str = str.replace(new RegExp(arr[i].toLowerCase().replace('uni', '&#x') + ';', 'g'), i.toString());
            }
        }
        return str;
    }
    downFile(filename : string){
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
    clTts(filename :string ,str :string){
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
    updateMovie(name){
        return Movie.update({ name: name },{  }).exec();
    }
    async test(){
        await this.start()        //抓取所有电影
    }

}










