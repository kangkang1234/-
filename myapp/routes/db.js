/**
 * Created by HP on 2018/3/11.
 */
var mysql = require('mysql');
var db = {};
db.query = function(connection, sql ,callback){
    connection.query(sql, function (error, results, fields) {
        if (error){
            callback(1);
            throw error;
        }
        callback(2,results);//返回插入的id
    });
};
db.close = function(connection){
    //关闭连接
    connection.end(function(err){
        if(err){
            return;
        }else{
            console.log('关闭连接');
        }
    });
};
db.connection = function(){
    //数据库配置
    var connection = mysql.createConnection({
        host:'localhost',
        user:'kangshijie',
        password:'',
        database:'waibao1',
        port:3306
    });
    //数据库连接
    connection.connect(function(err){
        if(err){
            console.log(err);
            return;
        }
    });
    return connection;
};
module.exports = db;