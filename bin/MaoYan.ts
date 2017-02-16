import { DealDate } from "./util/dealDate"
import * as cheerio from 'cheerio';
import * as agent from 'superagent';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import { Movie ,IMovie } from "./models/Movie"
import { MaoYanData } from "./Interface/IMaoYanData"
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
            await this.dealDate.wait_seconds(2);
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
        let html ,name ,url ,res ,$ : any ,reg
        url = this.reptile_url + "movie/"+ id +"?_v_=yes"
        reg = /\/(\w*)\.ttf/;
        await this.dealDate.wait_seconds(0.5);
        res = await agent("GET",url);
        html = await this.clTts(reg.exec(res.text)[1] + ".ttf",res.text);
        $ = cheerio.load(html.toString());

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
        this.debug(maoyan_data)
    }
    debug(my : MaoYanData){
        console.log("编号：" + my.id)
        console.log("名字：" + my.name)
        console.log("观众：" + my.score)
        console.log("专家：" + my.z_score)
        console.log("累计：" + my.total_bo)
        console.log("首周：" + my.week_bo)
        console.log("首日：" + my.day_bo)
        console.log("----------------------------------------------------")
    }
    deleteSpace(str : any) : any {
        return str.replace(/(^\s+)|(\s+$)/g, "")
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
    updateMovie(name :any){
       return new Promise((resolve ,reject) => {
           Movie.find({ name : name}).exec((err,data : IMovie[]) => {
               if(data.length == 1 ){
                   Movie.findByIdAndUpdate(data[0]._id,{ }).exec()
               }
           })
       })
    }
    async test(){
        await this.start()        //抓取所有电影
    }
}










