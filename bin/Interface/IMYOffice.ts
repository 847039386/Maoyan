interface IMYOffice {
    id :number;        //编号
    name : string;    //电影名称
    box_date : string   //时间
    film_realTime : string    //实时票房
    film_zb :string;      //票房占比
    paipian_zb :string       //拍片占比
    attendance :string        //上座率
    film_days :string    //上映天数。。。
}

export class MYOffice implements IMYOffice {
    id :number;        //编号
    name : string;    //电影名称
    box_date : string   //时间
    film_realTime : string    //实时票房
    film_zb :string;      //票房占比
    paipian_zb :string       //拍片占比
    attendance :string        //上座率
    film_days :string    //上映天数。。。
}


