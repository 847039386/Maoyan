import mongoose = require('mongoose');

interface ICatEyeMovieModel {
    id : number,    //���
    name : string,  //����
    score : number,   //��������
    z_score : number,    //ר������
    total_bo : number,  //�ۼ�Ʊ��
    week_bo : number,    //����Ʊ��
    day_bo  :number     //����Ʊ��
    release_time :string //��ӳʱ��
}
export interface ICatEyeMovie extends ICatEyeMovieModel, mongoose.Document { }

const MovieSchema = new mongoose.Schema({
    id : Number,    //���
    name : String,  //����
    score : Number,   //��������
    z_score : Number,    //ר������
    total_bo : Number,  //�ۼ�Ʊ��
    week_bo : Number,    //����Ʊ��
    day_bo  :Number ,    //����Ʊ��
    release_time : String //��ӳʱ��


});
export const CatEye = mongoose.model<ICatEyeMovie>("CatEyeMovie", MovieSchema);

