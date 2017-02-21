import { MaoYan } from './bin/MaoYan';
import program = require('commander');

var api = new MaoYan("2011-01-01");
export class App{
    reptileAll(){
        api.reptileAll();
    }
    scheduleReptile(){
        api.scheduleReptile()
    }
}
var app = new App();



program
    .version('0.0.1')
    .option('-a, --all', '抓取所有电影', app.reptileAll)
    .option('-s, --schedule', '定时抓取电影', app.scheduleReptile)
    .parse(process.argv);






