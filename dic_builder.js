var fs = require('fs');
var http = require('http');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var async = require('async');
var DictData = require('./models/dict-data');
require('./models/db');
var pool = new http.Agent;
pool.maxSockets = 100;

var no = 0;
var numberOfWordAdded = 0;

fs.readFile('./dicList/5.txt', 'utf8', (err, data) => {
  if (err) throw err;
  var arr = data.split(',');
  arr.forEach(function(item) {
    no += 1;
    DictData
      .findOne({word: item})
      .exec(function(err, word) {
        if(!word) {
          var oaldWordRequest = item.replace(/'/g, '-');
          var url1 = 'http://www.oxfordlearnersdictionaries.com/definition/english/' + oaldWordRequest;
          var url2 = 'http://dict.laban.vn/find?type=1&query=' + item;

          async.parallel([
            function(callback) {
              request({url: url1,
                pool: pool
              }, function(error, response, html) {
                if(!error) {
                  console.log('Response 1');
                  var $ = cheerio.load(html);
                  callback(null, $.html('.h-g'));
                }
              });
            },
            function(callback) {
              request({
                method: 'GET',
                url: url2,
                pool: pool,
                gzip: true
              }, function(error, response, html) {
                if(!error) {
                  console.log('Response 2');
                  var $ = cheerio.load(html);
                  callback(null, $('#content_selectable .content').first().html());
                }
              });
            }
          ], function(err, results) {
            if (no === 20000) {
              // fs.writeFile('done.txt', `It's done, sir, number of item read ${no}`, (err) => {
              //   if (err) throw err;
              // });
              console.log('done');
            }
            if(results[0] !== "" || results[1] !== null) {
              DictData.create({
                word: item,
                oaldData: results[0],
                evData: results[1]
              });
            }
          });
        }
      });
    });
});
