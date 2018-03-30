/**
 * Created by HP on 2018/3/19.
 */
var http = require('http');
var fs = require('fs');
var request = require('superagent');
require('superagent-charset')(request);
var cheerio = require('cheerio');
var db = require('./db');
// function getData() {
//     var reptileUrl = "http://xueshu.baidu.com/s?wd=information%20search&pn=0&tn=SE_baiduxueshu_c1gjeupa&ie=utf-8&sc_f_para=sc_tasktype%3D%7BfirstSimpleSearch%7D&sc_hit=1";
//     var data = [];
//     writeData(reptileUrl,0,data,function () {
//         console.log(data);
//     });
// }
var data = [];
var str = '';
function getKeyword() {
    var sql = `SELECT * FROM titles WHERE 1`;
    var connection = db.connection();
    db.query(connection,sql,function (code,results) {
        if(code===1){
            console.log('dataBaseError');
        }
        else if(code===2){
            writeData(results,0,results.length);
            db.close(connection);
        }
    })
}
function writeData(result,num,len) {
    var keyword = result[num]['title'];
    console.log(keyword);
    keyword = keyword.split(' ').join('%20');
    var url = `http://xueshu.baidu.com/s?wd=${keyword}&tn=SE_baiduxueshu_c1gjeupa&cl=3&ie=utf-8&bs=${keyword}&f=8&rsv_bp=1&rsv_sug2=1&sc_f_para=sc_tasktype%3D%7BfirstSimpleSearch%7D`;
    // var url = `http://xueshu.baidu.com/s?wd=asd&pn=0&tn=SE_baiduxueshu_c1gjeupa&ie=utf-8&sc_f_para=sc_tasktype%3D%7BfirstSimpleSearch%7D&sc_hit=1`
    request.get(url).charset('utf-8').end(function(err,res){
        if(err){
            throw Error(err);
        }
        var $ = cheerio.load(res.text);
        if($('#container').find('#dtl_l').length===1){
            var _this = $('#dtl_l div').first();
            data.push({
                keyword:result[num]['title'],
                title:replaceText(_this.find('h3 a').text().trim()),
                author:_this.find('.author_text a').first().text().trim(),
                date:_this.find('.publish_text span').first().text().trim(),
                times:_this.find('.ref_wr a').text().trim(),
                href:_this.find('h3 a').attr('href')
            });
            if(num<len-1){
                writeData(result,num+1,len)
            }
            else {
                data.forEach(function (item) {
                    str+=`${item.keyword}|${item.title}|${item.author}|${item.date}|${item.times}|${item.href}!`;
                });
                str = str.slice(0,str.length-1);
                fs.appendFileSync('./data/message.txt',str);
            }
        }
        else{
            url = `http://xueshu.baidu.com/s?wd=${keyword}&pn=0&tn=SE_baiduxueshu_c1gjeupa&ie=utf-8&sc_f_para=sc_tasktype%3D%7BfirstSimpleSearch%7D&sc_hit=1`;
            request.get(url).charset('utf-8').end(function(err,res){
                if(err){
                    throw Error(err);
                }
                var _this = $('.sc_content').first();
                data.push({
                    keyword:result[num]['title'],
                    title:replaceText(_this.find('h3 a').text().trim()),
                    author:_this.find('.sc_info span').first().find('a').first().text().trim(),
                    date:_this.find('.sc_time').text().trim(),
                    times:_this.find('.sc_info span').last().find('a').text().trim(),
                    href:_this.find('h3 a').attr('href')
                });
                if(num<len-1){
                    writeData(result,num+1,len)
                }
                else {
                    data.forEach(function (item) {
                        str+=`${item.keyword}|${item.title}|${item.author}|${item.date}|${item.times}|${item.href}!`;
                    });
                    str = str.slice(0,str.length-1);
                    fs.writeFileSync('./data/message.txt',str);
                }
            });
        }

    });
}
function replaceText(text){
    return text.replace(/\n/g, "");
}
// writeData([{title:'A bayesian learning approach to promoting diversity in ranking for biomedical information retrieval'}],0,1);
getKeyword();
//load data infile "C:/users/hp/desktop/data/spider/spider/data/message.txt" replace into table article fields terminated by '|' lines terminated by '!'
