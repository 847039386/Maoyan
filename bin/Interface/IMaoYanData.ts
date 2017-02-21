interface IMaoYanData {
    id : number;    //电影Id
    name :string;        //电影名称
    score : any   //猫眼评分
    z_score : any //专家平分
    total_bo : any   //累计票房
    week_bo : any    //首周票房
    day_bo :any  //首日票房
    release_time : any; //上映时间
}

export class MaoYanData implements IMaoYanData {
    id : number;    //电影Id
    name :string;        //电影名称
    score : any   //猫眼评分
    z_score : any //专家平分
    total_bo : any   //累计票房
    week_bo : any    //首周票房
    day_bo :any  //首日票房
    release_time : any; //上映时间
}


