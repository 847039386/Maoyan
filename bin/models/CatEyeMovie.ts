import mongoose = require('mongoose');

interface ICatEyeMovieModel {
    id : number,    //���
    name : string,  //����
    score : string,   //��������
    z_score : string,    //ר������
    total_bo : string,  //�ۼ�Ʊ��
    week_bo : string,    //����Ʊ��
    day_bo  :string     //����Ʊ��
    release_time :string //��ӳʱ��
}
export interface ICatEyeMovie extends ICatEyeMovieModel, mongoose.Document { }

const MovieSchema = new mongoose.Schema({
    id : Number,    //���
    name : String,  //����
    score : String,   //��������
    z_score : String,    //ר������
    total_bo : String,  //�ۼ�Ʊ��
    week_bo : String,    //����Ʊ��
    day_bo  :String ,    //����Ʊ��
    release_time : String //��ӳʱ��


});
export const CatEye = mongoose.model<ICatEyeMovie>("CatEyeMovie", MovieSchema);

