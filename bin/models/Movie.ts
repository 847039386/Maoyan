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
    ranking: number;//���������ݿ�
    increase_rate_discover_pass_hour:string;//���������ݿ�
    sub_score:number;//���������ݿ�
    maoyan : {
        id : number,    //���
        name : string,  //����
        score : string,   //��������
        z_score : string,    //ר������
        total_bo : string,  //�ۼ�Ʊ��
        week_bo : string,    //����Ʊ��
        day_bo  :string     //����Ʊ��
        release_time :string //��ӳʱ��
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
    score: { type: Number },//��������
    rate_count: { type: Number },//��������
    year: { type: Number },
    url: { type: String },
    poster_url: { type: String },
    summary: { type: String },
    douban_id: { type: Number },
    episode_count: { type: Number }, //���Ӿ�ļ���
    season_count: { type: Number },//���Ӿ�ļ���
    duration_per: { type: String },//����Ƭ��
    is_series: { type: Boolean },//�Ƿ�缯
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
        id : Number,    //���
        name : String,  //����
        score : String,   //��������
        z_score : String,    //ר������
        total_bo : String,  //�ۼ�Ʊ��
        week_bo : String,    //����Ʊ��
        day_bo  :String ,    //����Ʊ��
        release_time : String //��ӳʱ��

    }
});
//MovieSchema.virtual('ranking')
MovieSchema.index({ douban_id: 1 });
export const Movie = mongoose.model<IMovie>("Movie", MovieSchema);

