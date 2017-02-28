"use strict";
const MaoYan_1 = require("./bin/MaoYan");
const program = require("commander");
var api = new MaoYan_1.MaoYan("2011-01-01");
class App {
    reptileAll() {
        api.reptileAll();
    }
    scheduleReptile() {
        api.scheduleReptile();
    }
    getYear(date) {
        api.getYear(date);
    }
    getId(id) {
        api.getId(id);
    }
    test() {
        api.test();
    }
}
exports.App = App;
var app = new App();
program
    .version('0.0.1')
    .option('-a, --all', '抓取所有电影', app.reptileAll)
    .option('-s, --schedule', '定时抓取电影', app.scheduleReptile)
    .option('-y, --year <n>', '爬取某年份的电影 参数格式:< 2017-01-01 >', app.getYear)
    .option('-g, --id <n>', '爬取某年份的电影 参数格式', app.getId)
    .option('-t, --test', '这是一个测试', app.test)
    .parse(process.argv);
