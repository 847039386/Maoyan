"use strict";
const IReptileDates_1 = require("./Interface/IReptileDates");
class DealDate {
    constructor() {
        this.wait_seconds = function (senconds) {
            return new Promise(resolve => setTimeout(resolve, senconds * 1000));
        };
        this.start_date = "2017-2-5";
    }
    isOverToday(date) {
        var today = new Date();
        var y_today = today.getFullYear();
        var m_today = today.getMonth();
        var d_today = today.getDate();
        if (date.getFullYear() == y_today && date.getMonth() == m_today) {
            return d_today;
        }
        else if (date.getFullYear() > y_today || date.getFullYear() == y_today && date.getMonth() > m_today) {
            return 0;
        }
    }
    getDaysData(date) {
        var end_day;
        var currentDate = new Date(date);
        end_day = this.isOverToday(currentDate);
        var currentDay = currentDate.getDate();
        var currentMonth = currentDate.getMonth();
        currentDate.setMonth(currentMonth + 1);
        currentDate.setDate(0);
        var days = this.dealtDays(currentDate.getFullYear(), currentMonth + 1, currentDay, end_day || currentDate.getDate());
        var cur_dates = new IReptileDates_1.ReptileDates();
        cur_dates.init(currentDate.getFullYear(), currentMonth + 1, currentDay, days);
        this.cur_reptile_dates = cur_dates;
        console.log(cur_dates);
    }
    dealtDays(year, month, start, end) {
        var days = [];
        for (var i = start; i <= end; i++) {
            days.push(year + "-" + month + "-" + i);
        }
        return days;
    }
    changeTime() {
        var o_date_y = this.cur_reptile_dates.currentYear;
        var o_date_m = this.cur_reptile_dates.currentMonth;
        if (o_date_m >= 12) {
            o_date_y += 1;
            o_date_m = 1;
        }
        else {
            o_date_m += 1;
        }
        var c_date = o_date_y + "-" + o_date_m;
        this.getDaysData(c_date);
    }
}
//async test(){
//    this.getDaysData(this.start_date);
//    for(var i=0;i<30;i++){
//        await this.wait_seconds(2);
//        this.changeTime(this.cur_reptile_dates)
//    }
//}
