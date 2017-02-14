import { MaoYan } from './bin/MaoYan';
import program = require('commander');

var api = new MaoYan();





program
    .version('0.0.1')


    .option('-a, --all', '抓取所有电影', api.updateMovie)

    .parse(process.argv);