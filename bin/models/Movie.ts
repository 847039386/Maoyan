import mongoose = require('mongoose');

interface IMovieModel {
    name: string;
    other_name: string;
    other_names: string[];
    writers: string[];
    directors: string[];
    stars: string[];
    types: string[];
    regions: string[];
    languages: string[];
    time_length: string;
    imdb_link: string;
    imdb_score: number;
    imdb_rate_count: number;
    metacriticScore: number;
    score: number;
    rate_count: number;
    year: number;
    url: string;
    poster_url: string;
    summary: string;
    douban_id: number;
    episode_count: number;
    season_count: number;
    duration_per: string;
    is_series: boolean;
    create_at: Date;
    last_crawl_at: Date;
    increase_rate_count: number;
    increase_rate_discover_at: Date;
    last_increase_rate_discover_at: Date;
    increase_score: number;
    increase_score_discover_at: Date;
    last_increase_score_discover_at: Date;
    crawl_results: Array<{ crawl_at: Date, score: number, rate_count: number }>;
    ranking: number;//不存入数据库
    increase_rate_discover_pass_hour:string;//不存入数据库
    sub_score:number;//不存入数据库
    maoyan : {
        id : number,    //编号
        name : string,  //姓名
        score : string,   //观众评分
        z_score : string,    //专家评分
        total_bo : string,  //累计票房
        week_bo : string,    //首周票房
        day_bo  :string     //首日票房
        release_time :string //上映时间
    }
}
export interface IMovie extends IMovieModel, mongoose.Document { }

const MovieSchema = new mongoose.Schema({
    name: { type: String },
    other_name: { type: String },
    other_names: [String],
    writers: [String],
    directors: [String],
    stars: [String],
    types: [String],
    regions: [String],
    languages: [String],
    time_length: { type: String },
    imdb_link: { type: String },
    imdb_score: { type: Number },
    imdb_rate_count: { type: Number },
    metacriticScore: { type: Number },
    score: { type: Number },//豆瓣评分
    rate_count: { type: Number },//评分人数
    year: { type: Number },
    url: { type: String },
    poster_url: { type: String },
    summary: { type: String },
    douban_id: { type: Number },
    episode_count: { type: Number }, //电视剧的集数
    season_count: { type: Number },//电视剧的季数
    duration_per: { type: String },//单集片长
    is_series: { type: Boolean },//是否剧集
    create_at: { type: Date, default: Date.now },
    increase_rate_count: { type: Number },
    increase_rate_discover_at: { type: Date },
    last_increase_rate_discover_at: { type: Date },
    increase_score: { type: Number },
    increase_score_discover_at: { type: Date },
    last_increase_score_discover_at: { type: Date },
    last_crawl_at: { type: Date },
    crawl_results: [{
        crawl_at: Date,
        score: Number,
        rate_count: Number
    }],
    maoyan : {
        id : Number,    //编号
        name : String,  //姓名
        score : String,   //观众评分
        z_score : String,    //专家评分
        total_bo : String,  //累计票房
        week_bo : String,    //首周票房
        day_bo  :String ,    //首日票房
        release_time : String //上映时间

    }
});
//MovieSchema.virtual('ranking')
MovieSchema.index({ douban_id: 1 });
export const Movie = mongoose.model<IMovie>("Movie", MovieSchema);

