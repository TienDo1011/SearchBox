var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var async = require('async');
var DictData = require('./models/dict-data');
require('./models/db');

var no = 0;
var numberOfWordAdded = 0;

fs.readFile('./american-english', 'utf8', (err, data) => {
  if (err) throw err;
  var arr = data.split('\n');
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
              request(url1, function(error, response, html) {
                if(!error) {
                  var $ = cheerio.load(html);
                  callback(null, $.html('.h-g'));
                }
              });
            },
            function(callback) {
              request({
                method: 'GET',
                url: url2,
                gzip: true
              }, function(error, response, html) {
                if(!error) {
                  var $ = cheerio.load(html);
                  callback(null, $('#content_selectable .content').first().html());
                }
              });
            }
          ], function(err, results) {
            if (no === 99171) {
              fs.writeFile('done.txt', `It's done, sir, number of item read ${no}`, (err) => {
                if (err) throw err;
              });
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
