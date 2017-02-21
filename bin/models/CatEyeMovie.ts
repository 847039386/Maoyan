import mongoose = require('mongoose');

interface ICatEyeMovieModel {
    id : number,    //编号
    name : string,  //姓名
    score : string,   //观众评分
    z_score : string,    //专家评分
    total_bo : string,  //累计票房
    week_bo : string,    //首周票房
    day_bo  :string     //首日票房
    release_time :string //上映时间
}
export interface ICatEyeMovie extends ICatEyeMovieModel, mongoose.Document { }

const MovieSchema = new mongoose.Schema({
    id : Number,    //编号
    name : String,  //姓名
    score : String,   //观众评分
    z_score : String,    //专家评分
    total_bo : String,  //累计票房
    week_bo : String,    //首周票房
    day_bo  :String ,    //首日票房
    release_time : String //上映时间


});
export const CatEye = mongoose.model<ICatEyeMovie>("CatEyeMovie", MovieSchema);

