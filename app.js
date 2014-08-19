var hls = require('hls-buffer');
var http = require('http');
var crypto = require('crypto');
var path = require('path');
var url = require('url');
var queue = {};
var host = 'http://media.movideo.us';
var md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
};


var NginxParser = require('nginxparser');

var parser = new NginxParser('$remote_addr - $remote_user [$time_local] '
    + '"$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"');

//parser.read("/home/log/nginx/access/media.m3u8.movideo.access.log",  { tail: true }, function (row) {
//    console.log(row);
//}, function (err) {
//    if (err) throw err;
//    console.log('Done!')
//});
//


var processUrl = function (requestUrl) {
    var myurl = url.parse(requestUrl).pathname;
//    console.log('myurl:' + myurl);
    if (/\.m3u8$/.test(myurl)) {
        var mydir = path.dirname(myurl);
        var urlmd5 = md5(mydir);
        if (!queue[urlmd5]) {
            var origurl = host + myurl;
            queue[urlmd5] = hls(origurl);
        }
        queue[urlmd5].playlist(function () {
        });
    }
}

Tail = require('tail').Tail;

tail = new Tail("/home/log/nginx/access/media.m3u8.movideo.access.log");

tail.on("line", function (data) {
//    console.log(data);
    parser.parseLine(data, function (row) {
//        console.log(row);
        if (row.request && row.request.length > 0) {
            var requestArr = row.request.split(' ');
            if (requestArr[0] == 'GET') {
                var path = requestArr[1];
//                processUrl(path);
                console.log(path);
            }
        }
    })
});

tail.on("error", function (error) {
    console.log('ERROR: ', error);
});


//var server = http.createServer(function (request, response) {
//    var myurl = url.parse(request.url).pathname;
////    console.log('myurl:' + myurl);
//
//
//    if (/\.m3u8$/.test(myurl)) {
//        var mydir = path.dirname(myurl);
//        var urlmd5 = md5(mydir);
//        if(!queue[urlmd5]) {
//            var origurl = + myurl;
//            queue[urlmd5] = hls(origurl, {max: 2});
//        }
//
//        queue[urlmd5].playlist(function (err, pl) {
//            response.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
//            response.end(pl);
//        });
//        console.log(Object.keys(queue));
//    }
//    else {
//        console.log('.ts');
//        var mydir = path.basename(myurl);
//        var urlmd5 = mydir.split('.')[0];
//        var stream = queue[urlmd5].segment(mydir);
//        response.setHeader('Content-Type', 'video/mp2s');
//        stream.pipe(response);
//    }
//});

//server.listen(80);