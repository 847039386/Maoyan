"use strict";
const mongoose = require("mongoose");
const MovieSchema = new mongoose.Schema({
    id: Number,
    name: String,
    score: Number,
    z_score: Number,
    total_bo: Number,
    week_bo: Number,
    day_bo: Number,
    release_time: String //��ӳʱ��
});
exports.CatEye = mongoose.model("CatEyeMovie", MovieSchema);
