"use strict";
const mongoose = require("mongoose");
const BoxOfficeSchema = new mongoose.Schema({
    id: { type: Number },
    name: { type: String },
    box_date: { type: String },
    film_realTime: { type: String },
    film_zb: { type: String },
    paipian_zb: { type: String },
    attendance: { type: String },
    film_days: { type: String },
});
exports.BoxOffice = mongoose.model("BoxOffice", BoxOfficeSchema);
