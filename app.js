var hls = require('hls-buffer');
var http = require('http');
var crypto = require('crypto');
var path = require('path');
var url = require('url');
var request = require('request');
var queue = {};
var host = 'http://media.movideo.us';
var urlMod = require('url');
var resolveUrl = urlMod.resolve;
var _ = require('lodash');
var md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
};


var NginxParser = require('nginxparser');

var parser = new NginxParser('$remote_addr - $remote_user [$time_local] '
    + '"$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"');

var processTS = function (urls) {
    console.log('processTS');
    var url = urls[0];
    console.log('url:' + url);
    request(url, function (err, response) {
        if (err || response.statusCode !== 200) return;
        urls.splice(0, 1);
        if (urls.length > 0) {
            setTimeout(function () {
                processTS(urls);
            }, 2000);
        }
    });
}
var processPlaylist = function (playlistUrl) {
    console.log('processPlaylist:' + playlistUrl);
    request(playlistUrl, function (err, response) {
        if (err || response.statusCode !== 200) return;

        var body = response.body.toString().trim();

        var urls = body.split('\n').map(function (line) {
            if (line[0] === '#') return false;
            return resolveUrl(playlistUrl, line);
        });
        var myurls = _.compact(urls);
        console.log(myurls);
        processTS(myurls);
    });
}
var processUrl = function (requestUrl) {
    var myurl = url.parse(requestUrl).pathname;

    if (/\.m3u8$/.test(myurl)) {

        var mydir = path.dirname(myurl);
        var urlmd5 = md5(mydir);
        if (!queue[urlmd5]) {
            console.log('myurl:' + myurl);
            var origurl = host + myurl;
            processPlaylist(origurl);
        }
    }
}

Tail = require('tail').Tail;

tail = new Tail("/home/log/nginx/access/media.m3u8.movideo.access.log");

tail.on("line", function (data) {
    parser.parseLine(data, function (row) {
        if (row.request && row.request.length > 0) {
            var requestArr = row.request.split(' ');
            if (requestArr[0] == 'GET') {
                var path = requestArr[1];
                processUrl(path);
            }
        }
    })
});

tail.on("error", function (error) {
    console.log('ERROR: ', error);
});
