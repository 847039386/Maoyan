import mongoose = require('mongoose');

interface ICatEyeMovieModel {
    id : number,    //编号
    name : string,  //姓名
    score : number,   //观众评分
    z_score : number,    //专家评分
    total_bo : number,  //累计票房
    week_bo : number,    //首周票房
    day_bo  :number     //首日票房
    release_time :string //上映时间
}
export interface ICatEyeMovie extends ICatEyeMovieModel, mongoose.Document { }

const MovieSchema = new mongoose.Schema({
    id : Number,    //编号
    name : String,  //姓名
    score : Number,   //观众评分
    z_score : Number,    //专家评分
    total_bo : Number,  //累计票房
    week_bo : Number,    //首周票房
    day_bo  :Number ,    //首日票房
    release_time : String //上映时间


});
export const CatEye = mongoose.model<ICatEyeMovie>("CatEyeMovie", MovieSchema);

