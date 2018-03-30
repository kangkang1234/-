module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('home',{});
    });
    app.get('/echarts',function(req,res){
        res.render('echartsTest');
    });
    app.use('/knowMap',require('./knowMap'));
    app.use('/search',require('./search'))
};
