import mongoose = require('mongoose');
//票房数据表，抓取自http://piaofang.maoyan.com/?date=2016-11-16

export interface IBoxOfficeModel {
    id :number;        //编号
    name : string;    //电影名称
    box_date : string   //时间
    film_realTime : string    //实时票房
    film_zb :string;      //票房占比
    paipian_zb :string       //拍片占比
    attendance :string        //上座率
    film_days :string    //上映天数。。。
}
export interface IBoxOffice extends IBoxOfficeModel, mongoose.Document { }

const BoxOfficeSchema = new mongoose.Schema({
    id:{type:Number},
    name:{type:String},
    box_date:{type:String},
    film_realTime:{type:String},
    film_zb:{type:String},
    paipian_zb:{type:String},
    attendance:{type:String},
    film_days: { type: String },
});

export const BoxOffice = mongoose.model<IBoxOffice>("BoxOffice", BoxOfficeSchema);
