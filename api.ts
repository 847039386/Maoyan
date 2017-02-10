import { DealDate } from "./util/dealDate"
import * as cheerio from 'cheerio';
import * as agent from 'superagent';



class MaoYan {
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
        let name ,randay ,maoyan_score,total_bo ,week_bo ,day_bo ,url ,res ,$
        url = this.reptile_url + "movie/"+ id +"?_v_=yes"
        res = await agent("GET",url);
        $ = cheerio.load(res.text);
        name = $(".info-detail .info-title").text();
        maoyan_score = $("p.score-num ").text();
        console.log(name,maoyan_score)
        return name;
    }

    test(){
        this.start()
    }

}

var maoyan = new MaoYan();
maoyan.test();






