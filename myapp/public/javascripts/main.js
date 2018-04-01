window.onload = function () {
    var myChart = echarts.init(document.getElementById('main'));
    var option = {
        title: {
            text: '知识地图'
        },
        tooltip: {},
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series : [
            {
                type: 'graph',
                layout: 'none',
                symbolSize: 30,
                roam: true,
                label: {
                    normal: {
                        show: true,
                        position:'top',
                        distance:10
                    }
                },
                edgeSymbol: ['', ''],
                edgeSymbolSize: [0, 10],
                edgeLabel: {
                    normal: {
                        textStyle: {
                            fontSize: 20
                        }
                    }
                },
                data: [],
//            {
//                name: '2',
//                x: 10,
//                y: 10,
//                value: '2'
//            }, {
//                name: '2',
//                x: 100,
//                y: 100,
//                value: '3',
//                symbolSize: 20,
//                itemStyle: {
//                    color: 'green'
//                }
//            }
                links: [],
//                links: [{
//                    source: '节点1',
//                    target: '节点3'
//                }, {
//                    source: '节点2',
//                    target: '节点3'
//                }, {
//                    source: '节点2',
//                    target: '节点4'
//                }, {
//                    source: '节点1',
//                    target: '节点4'
//                }],
                lineStyle: {
                    normal: {
                        opacity: 0.9,
                        width: 2,
                        curveness: 0
                    }
                }
            }
        ]
    };
    myChart.setOption(option);
    myChart.on('click',function(params){
        if(params.componentType==='series'){
            if(params.seriesType==='graph'){
                if(params.dataType==='node'){
                    var id = parseInt(params.data.value);
                    // var name = params.data.name.split('\n').join(',');
                    // console.log(name);
                    widthValue = width.value;
                    depthValue = depth.value;
                    $.get('/knowMap/getPointNext',{keyword:id,width:widthValue,depth:depthValue},function(data){
                        leftKeyword(data.secondLayKeyword);
                        myChart.setOption({
                            series:[{
                                data:data.data,
                                links:data.links
                            }]
                        });
                    });
                    $.get('/search/next',{id:id},function (data) {
                        search.changeData(data);
                        search.writeTitle();
                        search.dividePage();
                    })
                }
            }
        }
    });
    var input = document.getElementById('info');
    var button = document.getElementById('submit');
    var width = document.getElementById('width'),widthValue;
    var depth = document.getElementById('depth'),depthValue;
    var inputVal;
    button.addEventListener('click',function(e){
        e.preventDefault();
        inputVal = input.value;
        widthValue = width.value;
        depthValue = depth.value;
        $.get('/knowMap/getPoint',{keyword:inputVal,width:widthValue,depth:depthValue},function(data){
            leftKeyword(data.secondLayKeyword);
            myChart.setOption({
                series:[{
                    data:data.data,
                    links:data.links
                }]
            });
        });
        $.get('/search',{keyword:inputVal},function (data) {
            search.changeData(data);
            search.writeTitle();
            search.dividePage();
        })
    });

    var search = (function () {
        function handlerP() {
            search.listenerPre();
        }
        function handlerN() {
            search.listenerNext();
        }
        return search = {
            pre:document.getElementById('prev'),
            next:document.getElementById('next'),
            data:'',
            onePageNum:8,
            totalPage:'',
            curPage:1,
            index:'',
            listenerPre:function () {
                if(this.curPage>1){
                    this.curPage-=1;
                    this.writeTitle();
                    document.getElementById('curPage').value = this.curPage;
                }
            },
            listenerNext:function () {
                if(this.curPage<this.totalPage){
                    this.curPage+=1;
                    this.writeTitle();
                    document.getElementById('curPage').value = this.curPage;
                }
            },
            addListen:function () {
                this.pre.addEventListener('click',handlerP);
                this.next.addEventListener('click',handlerN)
            },
            removeListen:function () {
                this.pre.removeEventListener('click',handlerP);
                this.next.removeEventListener('click',handlerN);
            },
            changeData:function (data) {
                this.index = document.getElementById('searchWay').selectedIndex;
                switch(this.index){
                    case 0:break;
                    case 1:data.sort(function (a,b) {
                        return b.date-a.date;
                    });break;
                    case 2:data.sort(function (a,b) {
                        return b.times-a.times;
                    })
                }
                this.data = data;
                this.curPage = 1;
            },
            writeTitle:function () {
                var data = this.data;
                if(data.length!==0){
                    document.getElementById('page').style.display = 'block';
                }
                document.getElementById('result_num').innerHTML = data.length;
                var oldUl =  document.querySelector('#search ul');
                if(oldUl){
                    oldUl.parentNode.removeChild(oldUl);
                }
                var fragment = document.createDocumentFragment();
                var div = document.getElementById('search');
                var ul = document.createElement('ul');
                var li = null;
                var str = '';
                var item;
                data = data.slice((this.curPage-1)*this.onePageNum,this.curPage*this.onePageNum);
                for(var i=0,len=data.length;i<len;i++){
                    item = data[i];
                    if(item.href.indexOf('http') ===-1){
                        item.href = 'http://xueshu.baidu.com'+item.href;
                    }
                    li = document.createElement('li');
                    str = `<a target="_blank" class="title_a" href="${item.href}">${item.searchTitle}</a><br>
<span>${item.author}</span>-<span>${item.date}</span>-<span>被引量：${item.times}</span>`;
                    li.innerHTML = str;
                    fragment.appendChild(li);
                }
                ul.appendChild(fragment);
                div.insertBefore(ul,div.lastElementChild)
            },
            dividePage:function () {
                var data = this.data;
                this.totalPage = parseInt(data.length/this.onePageNum)+1;
                document.getElementById('totalPage').innerHTML = this.totalPage;
                document.getElementById('curPage').value = this.curPage;
                this.addListen();
            }
        }
    })()
};
function leftKeyword(keyword) {
    if(keyword===undefined){
        return;
    }
    keyword = keyword.slice(0,15);
    var nextLayerKey = document.getElementById('nextLayerKey');
    var fragment = document.createDocumentFragment();
    var ul = document.createElement('ul');
    var li = null;
    keyword.forEach(function (item) {
        li = document.createElement('li');
        li.innerHTML = item;
        fragment.appendChild(li);
    });
    ul.appendChild(fragment);
    if(nextLayerKey.firstChild){
        nextLayerKey.replaceChild(ul,nextLayerKey.firstChild)
    }
    else {
        nextLayerKey.appendChild(ul);
    }
}
