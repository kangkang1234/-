/**
 * Created by HP on 2018/3/11.
 */
/**
 * Created by HP on 2018/3/5.
 */
/**
 * Created by HP on 2018/3/5.
 */
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var db = require('./db');
var app = express();
var allPoint;
var allKey;
/* GET home page. */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
router.get('/getPointNext',function(req,res,next){
    var connection = db.connection();
    var id = req.query.keyword;
    var depth = req.query.depth;
    var width = req.query.width;
    var data = {};
    var sql = `SELECT _id,fah,chd,extent,intent FROM points WHERE _id=${id}`;
    db.query(connection,sql, function (code,results) {
        switch (code){
            case 1:res.send('数据库连接失败！sql');break;
            case 2:
                var pointArr=[];
                pointArr[0] = results;
                console.log(pointArr[0]);
                pointArr[1] = getFirstChild(pointArr[0],allPoint,width);
                getGraph(1,pointArr,allPoint);
                deleteTheSame(pointArr);
                pointArr = pointArr.slice(0,depth);//只显示需要显示的层数
                data.secondLayKeyword = getLeftKeyword(pointArr,allKey);
                data.data = getPointsData(pointArr,allKey);
                data.links = getLink(pointArr);
                //if(data.data.length===1){
                //    data.data[0].x = 300;
                //    data.data[0].y = 550;
                //}
                res.send(data);
        }
    });
    db.close(connection);
});
router.get('/getPoint', function(req, res, next) {
    var connection = db.connection();
    var keyword = req.query.keyword;
    var depth = req.query.depth;
    var width = req.query.width;
    var data = {};
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
                                        pointArr[1] = getFirstChild(pointArr[0],allPoint,width);
                                        getGraph(1,pointArr,allPoint);
                                        deleteTheSame(pointArr);
                                        pointArr = pointArr.slice(0,depth);//只显示需要显示的层数
                                        data.secondLayKeyword = getLeftKeyword(pointArr,allKeywords);
                                        data.data = getPointsData(pointArr,allKeywords);
                                        data.links = getLink(pointArr);
                                        res.send(data);
                                }
                            });
                            db.close(connection);
                    }
                });
        }
    });
});
function getLeftKeyword(pointA,allK) {
    if(pointA.length<=1){
        return [];
    }
    var arr = [];
    var hadExist = [];
    for(var i=0;i<2;i++){
        pointA[i].forEach(function (item) {
            arr.push(changeToKeyword(item,allK,hadExist));
        })
    }
    arr = arr.slice(1,arr.length);
    var len = arr.length;
    for(var i=0;i<len;i++){
        arr[i].split('\n').forEach(function (item) {
            arr.push(item);
        });
    }
    arr = arr.slice(len,arr.length);
    return arr;
}
function getLink(pA){//得到点与点之间连线的关系
    var allLink = [];
    var linkObj ={};
    pA.forEach(function(item1){
        item1.forEach(function(item2){
            item2['chd'].split(',').forEach(function(item3){
                linkObj.source=item2['_id']+'';
                linkObj.target=item3;
                allLink.push(linkObj);
                linkObj={};
            })
        })
    });
    return allLink;
}
function deleteTheSame(pointArr){//删除相同的点
    var aim=[];//合格的点
    var market = [];//需要删掉的点在pointArr中的位置
    for(var len1=pointArr.length,m=len1-1;m>=0;m--){
        for(var len2=pointArr[m].length,n=len2-1;n>=0;n--){
            if(aim.indexOf(pointArr[m][n]['_id'])===-1){
                aim.push(pointArr[m][n]['_id']);
            }
            else{
                market.push(m+','+n);
            }
        }
    }
    market.forEach(function(item){
        var arr = item.split(',');
        pointArr[arr[0]].splice(arr[1],1);
    });
    pointArr.forEach(function (item,index,arr) { //去掉空数组
        if(item.length==0){
            arr.splice(index,1);
        }
    })
}
function getPointsData(pointArr,allKey){ //得到要发送的点的数据
    var data = [];
    var dataObj = {};
    var hadExist = [];
    pointArr.forEach(function(item1,index1,array1){
        item1.forEach(function(item2,index2,array2){
            dataObj.name=changeToKeyword(item2,allKey,hadExist);  //删除掉已经存在的点
            dataObj.x = parseInt(300+500/(array2.length+1)*(index2+1));
            dataObj.y=parseInt(100+400/(array1.length+1)*(index1+1));
            dataObj.value=item2['_id']+'';
            data.push(dataObj);
            dataObj={};
        })
    });
    data[0].itemStyle = {color:'green'};
    data[data.length-1]['name'] = '';
    return data;
}
function changeToKeyword(item,allKey,hadExi){//将id映射到keyword并删除掉已经存在的keyword
    var key;
    return item['intent'].split(',').map(function(item0){
        key='';
        allKey.forEach(function(item1){
            if(item1['_id']==item0&&hadExi.indexOf(item1['keyword'])===-1){
                hadExi.push(item1['keyword']);
                key = item1['keyword'];
            }
        });
        return key;
    }).filter(function (item2) {
        if(item2.length!=0){
            return true;
        }
    }).join('\n');
}
function getGraph(depth,pointArr,allPoint){//得到一层一层的图，这是一个二维数组
    if(pointArr[depth].length==0){
        return;
    }
    var pointLayer = allPoint.filter(function(item1){//放每一次递归的结果
        return pointArr[depth].some(function (item2) {
            return item2['chd'].split(',').some(function(item3){
                if(item1['_id']==item3){
                    return true;
                }
            })
        })
    });
    pointArr.push(pointLayer);
    getGraph(depth+1,pointArr,allPoint);
}
function getFirstChild(fp,ap,width){ //根据相似度得到第一代子节点
    var fpChild = [];
    fpChild = ap.filter(function(item){
        if(fp[0]['chd'].split(',').indexOf(''+item['_id'])!==-1){
            return true;
        }
    });
    var fpExLen = fp[0]['extent'].split(',').length;//父title数
    var fpInLen = fp[0]['intent'].split(',').length;//父keyword数
    var maxA;//父子间title最大值
    var maxB;//父子间keyword最大值
    var aij;//父子间title相似数量
    var bij;//父子间keyword相似数量
    var sim;//相似度
    fpChild.forEach(function(item,index,array){
        maxA = item['extent'].split(',').length>fpInLen?item.extent.split.length:fpInLen;
        maxB = item.intent.split.length>fpInLen?item.intent.split.length:fpInLen;
        aij = intersection(fp[0].extent.split(','),item.extent.split(','));
        bij = intersection(fp[0].intent.split(','),item.intent.split(','));
        sim = (aij/maxA+bij/maxB)/2;
        array[index].sim = sim;
    });
    fpChild.sort(function(a,b){//相似度排序
        return b.sim-a.sim;
    });
    fpChild = fpChild.slice(0,width);
    return fpChild;
}

function intersection(a,b){  //得到a与b的交集
    return a.filter(function(item){
        return b.indexOf(item)!==-1;
    }).length;
}
function sqlStr(sql,obj){ //拼接sql语言
    for(variable in obj){
        sql = sql.replace(variable+"=",variable+"="+"'"+obj[variable]+"'")
    }
    return sql;
}

module.exports = router;