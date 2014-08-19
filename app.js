var hls = require('hls-buffer');
var http = require('http');
var crypto = require('crypto');
var path = require('path');
var url = require('url');
var queue = {};
var md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
};


var server = http.createServer(function (request, response) {
    var myurl = url.parse(request.url).pathname;
    var origurl = 'http://media.movideo.us' + myurl;
    var mydir = path.dirname(myurl);
    var urlmd5 = md5(mydir);
    if(!queue[urlmd5]) {
        queue[urlmd5] = hls(origurl, {max: 2});
    }
    if (/\.m3u8$/.test(myurl)) {
        queue[urlmd5].playlist(function (err, pl) {
            response.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            response.end(pl);
        });
        console.log(Object.keys(queue));
    }
    else {
        var stream = queue[urlmd5].segment(request.url);
        response.setHeader('Content-Type', 'video/mp2s');
        stream.pipe(response);
    }
});

server.listen(8080);