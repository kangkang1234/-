var fs = require('fs');
var db = require('./db');
var connection = db.connection();
function titles(){
    fs.readFile('C:/users/hp/desktop/data/datanew/693doc.txt','utf8',function(err,data){
        if(err){
            return;
        }
        data = data.replace(/\n/g,'');
        data = data.replace(/\r/g,'');
        data = data.replace(/\}\}Keywords = \{\{/g,'|');
        data = data.replace(/\}\}Title = \{\{|Title = \{\{/g,'!');
        data = data.replace(/\}\}/g,'');
        data = data.split('!');
        data = data.slice(1,data.length);
        data = data.map(function (item,index) {
            return index+'|'+item+'!';
        });
        data = data.join('');
        data = data.slice(0,data.length-1);
        //data = data.replace(/Keywords = \{\{/g,',');
        //data = data.replace(/\}\}/g,'');
        //data = data.replace(/Title = \{\{/g,'!');
        //var dataArr = data.split('!');
        //var dataStr = '';
        //for(var i=0,len=dataArr.length;i<len;i++){
        //    dataStr+=dataArr[i]+'!'+i+',';
        //}
        //dataStr = dataStr.replace(/!/,'');
        fs.writeFile('C:/users/hp/desktop/data/datanew/titles.txt',data);
        db.query(connection,`load data infile "C:/users/hp/desktop/data/datanew/titles.txt" replace into table titles fields terminated by '|' lines terminated by '!';`,function(code){
           if(code===2){
               console.log("success");
           }
           if(code===1){
               console.log("failure");
           }
           db.close(connection);
        });
    });
}
function points(){
    fs.readFile('C:/users/hp/desktop/data/datanew/693cl.txt','utf8',function(err,data){
        if(err){
            return;
        }
        data = data.replace(/ID:/g,'');
        data = data.replace(/extent=/g,'');
        data = data.replace(/intent=/g,'');
        data = data.replace(/fah=/g,'');
        data = data.replace(/chd=/g,'');
        data = data.replace(/\[/g,'');
        data = data.replace(/\]/g,'');
        data = data.replace(/\r/g,'');
        data = data.replace(/\n/g,'!');
        data = data.replace(/\s/g,'');
        data = data.slice(0,data.length-1);
        console.log(data[data.length-1]);
        fs.writeFileSync('C:/users/hp/desktop/data/datanew/points.txt',data);
        db.query(connection,`load data infile "C:/users/hp/desktop/data/datanew/points.txt" replace into table points fields terminated by '||' lines terminated by '!';`,function(code){
            if(code===2){
                console.log("success");
            }
            if(code===1){
                console.log("failure");
            }
            db.close(connection);
        });
    })
}
function keyword(){
    fs.readFile('C:/users/hp/desktop/data/datanew/693keywords.txt', 'utf8', function(err, data){
        data = data.split('\n');
        data = data.slice(0,data.length-1).map(function(item,index){
            return index+','+item+'!';
        }).join('');
        data = data.slice(0,data.length-1);
        fs.writeFileSync('C:/users/hp/desktop/data/datanew/keywords.txt',data);
        db.query(connection,`SELECT COUNT(_id) FROM keywords`,function(code,count){
            console.log(count);
            if(code==1){
                console.log("failure");
                db.close(connection);
            }
            if(code==2){
                console.log('success');
                if(count[0]['COUNT(_id)']===0){
                    db.query(connection,`load data infile "C:/users/hp/desktop/data/datanew/keywords.txt" replace into table keywords fields terminated by ',' lines terminated by '!';`,function(code){
                        if(code===2){
                            console.log("success");
                        }
                        if(code===1){
                            console.log("failure");
                        }
                        db.close(connection);
                    });
                }
                else{
                    db.close(connection);
                }
            }
        })
    });
}
titles();
//points();
//keyword();
