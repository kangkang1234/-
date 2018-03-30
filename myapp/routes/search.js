var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var db = require('./db');
var app = express();
/* GET home page. */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

router.get('/',function (req, res) {
    var connection = db.connection();
    var keyword = req.query.keyword;
    var sql = `SELECT searchTitle,date,times,author,href FROM \`titles\` NATURAL JOIN article WHERE keywords LIKE '%${keyword}%'`;
    db.query(connection,sql,function (code,results) {
        switch (code) {
            case 1:
                res.send('数据库连接失败！sql');
                break;
            case 2:
                res.send(results);
        }
    })
});

module.exports = router;