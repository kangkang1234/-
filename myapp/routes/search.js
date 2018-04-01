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
    var sql1 = `SELECT * FROM keywords WHERE keyword='${keyword}'`;
    db.query(connection,sql1,function(code,results){
        switch (code){
            case 1:res.send("数据库连接失败！sql1");break;
            case 2:
                if(results.length==0){
                    res.send("关键词不存在");
                    return;
                }
                var id=results[0]['_id'];
                var sql2 = `SELECT _id,fah,chd,extent,intent FROM points WHERE intent LIKE '%${id}%'`;
                var sql3 = `SELECT _id,keyword FROM keywords WHERE 1`;
                db.query(connection,sql2,function(code,results){
                    switch (code){
                        case 1:res.send("数据库连接失败!sql2");break;
                        case 2:
                            results = results.filter(function(item){
                                return item.intent.split(',').map(function(item){return Number(item)}).indexOf(Number(id))!==-1;
                            });//因为是text储存点的，所以要筛选一下点。
                            allPoint = results;//allPoint是包括父节点在内的所有包含关键词的点
                            db.query(connection,sql3,function(code,allKeywords){
                                allKey = allKeywords;
                                switch (code){
                                    case 1:res.send('数据库连接失败！sql3');break;
                                    case 2:
                                        var pointArr=[];
                                        pointArr[0] = results.filter(function(item1,index,array){
                                            return array.every(function(item2){
                                                return item2['chd'].split(',').map(function(item){
                                                    return Number(item)
                                                }).indexOf(Number(item1['_id']))===-1;//求出第一个点
                                            })
                                        });
                                        getSearchResult(pointArr[0][0]['_id'],res);
                                }
                            });
                            db.close(connection);
                    }
                });
        }
    });
});
router.get('/next',function (req, res) {
    var id = req.query.id;
    getSearchResult(id,res);
});
function getSearchResult(id,res) {
    var connection = db.connection();
    var sql1 = `SELECT extent FROM points WHERE _id=${id}`;
    db.query(connection,sql1,function (code,result) {
        switch (code){
            case 1:console.log("数据库连接失败!");break;
            case 2:
                console.log(result);
                if(result[0]['extent']===''){
                    res.send([]);
                    return;
                }
                var sql2 = `SElECT searchTitle,author,date,times,href FROM titles NATURAL JOIN article WHERE _id IN(${result[0]['extent']})`;
                db.query(connection,sql2,function (code,result) {
                    switch (code){
                        case 1:console.log("数据库连接失败!sql2");break;
                        case 2:
                            res.send(result);
                    }
                });
                db.close(connection);
        }
    })
}
module.exports = router;