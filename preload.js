var hls = require('hls-buffer');
//var buffer = hls('http://media.movideo.us/2014/08/18/Nightfall_2012/playlist.m3u8');
var http = require('http');
var crypto = require('crypto');
var path = require('path');
var url = require('url');
var queue = {};
var md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
};


var server = http.createServer(function (request, response) {
    console.log('request.url:' + request.url);

    if (/\.m3u8$/.test(request.url)) {
        var myurl = 'http://media.movideo.us' + request.url;
        var mydir = path.dirname(url.parse(myurl).path);
        var urlmd5 = md5(mydir);
        console.log(myurl);
        console.log(urlmd5);
        queue[urlmd5] = hls(myurl, {max:2});
        queue[urlmd5].playlist(function (err, pl) {
            response.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            response.end(pl);
        });
    }
    else {
        var mydir = path.dirname(request.url);
        var urlmd5 = md5(mydir);
        // else return the linked segment
        var stream = queue[urlmd5].segment(request.url);
        response.setHeader('Content-Type', 'video/mp2s');
        stream.pipe(response);
    }
});

server.listen(8080);