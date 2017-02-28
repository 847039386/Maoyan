"use strict";
const IReptileDates_1 = require("../Interface/IReptileDates");
const superAgent = require("superagent");
class Util {
    constructor(date) {
        this.start_date = date;
    }
    isOver() {
        let today = new Date();
        let currentDate = new Date(this.start_date);
        let y_today = today.getFullYear();
        let m_today = today.getMonth();
        if (currentDate.getFullYear() > y_today || currentDate.getFullYear() == y_today && currentDate.getMonth() > m_today) {
            return false;
        }
        return true;
    }
    isOverToday(date) {
        let today = new Date();
        let y_today = today.getFullYear();
        let m_today = today.getMonth();
        let d_today = today.getDate();
        if (date.getFullYear() == y_today && date.getMonth() == m_today) {
            return d_today;
        }
        else if (date.getFullYear() > y_today || date.getFullYear() == y_today && date.getMonth() > m_today) {
            return 0;
        }
    }
    getDaysData() {
        let end_day;
        let currentDate = new Date(this.start_date);
        end_day = this.isOverToday(currentDate);
        let currentDay = currentDate.getDate();
        let currentMonth = currentDate.getMonth();
        currentDate.setMonth(currentMonth + 1);
        currentDate.setDate(0);
        let days = this.dealtDays(currentDate.getFullYear(), currentMonth + 1, currentDay, end_day || currentDate.getDate());
        let cur_dates = new IReptileDates_1.ReptileDates();
        cur_dates.init(currentDate.getFullYear(), currentMonth + 1, currentDay, days);
        this.cur_reptile_dates = cur_dates;
    }
    dealtDays(year, month, start, end) {
        let days = [];
        let x_month = month < 10 ? "0" + month : month;
        for (let i = start; i <= end; i++) {
            let d = i < 10 ? "0" + i : i;
            days.push(year + "-" + x_month + "-" + d);
        }
        return days;
    }
    changeTime() {
        let o_date_y = this.cur_reptile_dates.currentYear;
        let o_date_m = this.cur_reptile_dates.currentMonth;
        if (o_date_m >= 12) {
            o_date_y += 1;
            o_date_m = 1;
        }
        else {
            o_date_m += 1;
        }
        let c_date = o_date_y + "-" + o_date_m;
        this.start_date = c_date;
        this.getDaysData();
    }
    wait_seconds(senconds) {
        return new Promise(resolve => setTimeout(resolve, senconds * 1000));
    }
    uniqueArray(arr) {
        var tmp = [];
        for (var i in arr) {
            if (tmp.indexOf(arr[i]) == -1) {
                tmp.push(arr[i]);
            }
        }
        return tmp;
    }
    getAgent(url) {
        return new Promise((resolve, reject) => {
            superAgent("get", url).end((err, data) => {
                if (err) {
                    resolve(null);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
}
exports.Util = Util;
