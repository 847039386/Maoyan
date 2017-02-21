const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://127.0.0.1/douban_data')

export { BoxOffice, IBoxOffice } from './BoxOffice';
export { CatEye } from './CatEyeMovie'