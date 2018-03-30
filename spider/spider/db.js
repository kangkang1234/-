var mysql = require('mysql');
var db = {};
db.query = function (connection,sql,callback) {
    connection.query(sql,function (err,results) {
        if (err){
            callback(1);
            throw err;
        }
        callback(2,results);//返回插入的id
    })
};
db.connection = function () {
    var connection = mysql.createConnection({
        host:'localhost',
        user:'kangshijie',
        password:'',
        database:'waibao1',
        port:3306
    })
    connection.connect(function (err) {
        if(err){
            console.log(err);
        }
    });
    return connection;
};
db.close = function (connection) {
    connection.end(function (err) {
        if(err){
            return;
        }
        else {
            console.log('关闭连接');
        }
    })
}
module.exports = db;