import axios from 'axios';
import env from '../config/env';
import py from './py.js'

let util = {

};
util.title = function(title) {
    title = title ? title + ' - Home' : 'iView project';
    window.document.title = title;
};

const ajaxUrl = env === 'development' ?
    'http://127.0.0.1:8888' :
    env === 'production' ?
    'https://www.url.com' :
    'https://debug.url.com';

util.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000
});

util.py = function (text) {
    console.log(env);
    console.log(py);
    const normalStyle = {style: py.pinyin.STYLE_NORMAL};
    try {
        let result = py.pinyin(text, normalStyle).join('');
        return result;
    } catch (err) {
        console.log(err);
        return '*_*';
    }
}

export default util;