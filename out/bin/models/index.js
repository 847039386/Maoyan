"use strict";
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/douban_data');
var BoxOffice_1 = require("./BoxOffice");
exports.BoxOffice = BoxOffice_1.BoxOffice;
var CatEyeMovie_1 = require("./CatEyeMovie");
exports.CatEye = CatEyeMovie_1.CatEye;
