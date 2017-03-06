const request = require("request")
const fs = require("fs")
const unzip = require("unzip");
const node_async = require("async");
import * as agent from 'superagent';


export class OperationFile {
    private cache_path : string ;
    constructor(){
        this.cache_path = "./bin/font"
    }
    //这个参数返回一个request选项，都是配置好了的。
    woffOption(path :any) : any{
        let formData = {
            woff: fs.createReadStream(path),
        };
        let time = new Date().getTime();
        let sub_time = time.toString().slice(0,time.toString().length - 3);
        let options = {
            url: 'http://www.zitikoudai.com/woff-converter/upload.php',
            formData: formData,
            headers: {
                'Host':"www.zitikoudai.com",
                'User-Agent':"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.101 Safari/537.36",
                'Origin':"http://www.zitikoudai.com",
                'Cookie':"fp_ol=1; Hm_lvt_041dff38dd849799aa7787755ee28c78=1488765266; Hm_lpvt_041dff38dd849799aa7787755ee28c78=" + sub_time,
                'Referer': "http://www.zitikoudai.com/woff-converter/",
                'Connection' : "keep-alive",
                'Accept' : "*/*",
                'Accept-Encoding': "gzip, deflate",
                'Accept-Language' : "zh-CN,zh;q=0.8"
            }
        }
        return options;
    }
    getZipFilePath(path :any){
        let _this = this;
        return new Promise(res => {
            request.post(this.woffOption(path), function(err :any, httpResponse :any, body :any) {
                if (err) {
                    res(null)
                }else{
                    let path = "http://www.zitikoudai.com/woff-converter/";
                    let url_obj = JSON.parse(body);
                    let url = url_obj.file ? (path + url_obj.file) : null;
                    res(url)
                }
            });
        })
    }
    downLoadTtfZip(url : any , zip_path : any) : Promise<any> {
        const stream = fs.createWriteStream(zip_path);
        const req = agent.get(url);
        let pro =  new Promise((resolve ,reject) => {
            req.on("error",err => { console.log("下载出错"); resolve(false) })
                .pipe(stream)
                .on("close",() => { resolve(true) })
        })
        return pro;
    }
    decompressionZipToTtf(path : string) : Promise<any>{
        return new Promise(resolve => {
            let bu = fs.createReadStream( path )
            bu.pipe(unzip.Extract({ path: this.cache_path }))
            bu.on("data",function(chunk : any){
                resolve(true);
                console.log("解压完毕")
            })
            bu.on("error",function(err :any){
                resolve(false);
            })
        })
    }
    saveWoff(utf8 :string){
        return new Promise(resolve => {
            let file_name = this.upName(utf8)
            let woff_path = this.cache_path + "/" + file_name + ".woff";
            let zip_path =  this.cache_path + "/" + file_name + ".zip";
            let ttf_path = this.cache_path + "/" + file_name + ".ttf";
            var buffer = new Buffer(utf8, 'base64')
            fs.writeFile(woff_path , buffer, function(err :any){
                err ? resolve(null) : resolve({ fileName: file_name ,woff_path : woff_path ,zip_path:zip_path,ttf_path : ttf_path });
            })
        })
    }
    deleteCacheFile(zip :any ,woff :any){
        return new Promise(resolve => {
            node_async.mapLimit([zip,woff], 5, function (path :any, callback :any) {
                fs.unlink(path,function(err :any){
                    callback(err,path)
                })
            }, function (err :any, result :any) {
                err ? resolve(false) : resolve(true);
            });
        })
    }
    upName(utf8 :any) : any{
        let file_name = utf8.slice(utf8.length - 20, utf8.length);
        file_name = file_name.replace(/\\/g, "ZL")
        file_name = file_name.replace(/\//g, "RP")
        file_name = file_name.replace(/\*/g, "CZ")
        file_name = file_name.replace(/\+/g, "UF")
        file_name = file_name.replace(/\?/g, "MF")
        file_name = file_name.replace(/'/g, "PO")
        file_name = file_name.replace(/"/g, "EO")
        file_name = file_name.replace(/</g, "GT")
        file_name = file_name.replace(/>/g, "LT")
        file_name = file_name.replace(/\|/g, "HH")
        file_name = file_name.replace(/=/g, "DDW")
        return file_name;
    }
    async handleHtml(utf8_woff :any){
        let file_name = this.upName(utf8_woff)
        let real_path = this.cache_path + "/" + file_name + ".ttf";
        return new Promise(resolve => {
            fs.readFile( real_path ,{ encoding: 'utf-8' } , async (err :any,data :any) => {
                if(err){
                        console.log("没有tff文件，即将下载。")
                        let obj : any = await this.saveWoff(utf8_woff);       //通过dataform解析base64并存成woff文件。返回woff文件地址。
                        let _url = await this.getZipFilePath(obj.woff_path)   //通过woff地址 去某网站上 转成tff类型，因为网站的原因，这里返回的是一个文件地址。需要下载。
                        console.log("获取地址。")
                        let down_zip = await this.downLoadTtfZip(_url,obj.zip_path);
                        console.log("下载zip")
                        let unzip = await this.decompressionZipToTtf(obj.zip_path)
                        console.log("解压zip")
                        let del_cache = await this.deleteCacheFile(obj.zip_path,obj.woff_path)
                        console.log("删除多余文件")
                        if( obj && _url && down_zip && unzip ){
                            resolve(obj.fileName)
                        }else{
                            resolve(false)
                        }
                }else{
                    console.log("存在ttf文件。")
                    resolve(file_name)
                }
            })
        })
    }


}




//(async function(){
//    var op = new OperationFile();
//    let a = "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"
//    let b : any = await op.saveWoff(a);       //通过dataform解析base64并存成woff文件。返回woff文件地址。
//    let c = await op.getZipFilePath(b.woff_path)   //通过woff地址 去某网站上 转成tff类型，因为网站的原因，这里返回的是一个文件地址。需要下载。
//    let d = await op.downLoadTtfZip(c,b.zip_path);
//    let f = await op.decompressionZipToTtf(b.zip_path)
//    let e = await op.deleteCacheFile(b.zip_path,b.woff_path)
//})()
