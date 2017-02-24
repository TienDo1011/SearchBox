var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var DictData = require('./models/dict-data');

fs.readFile('./american-english', 'utf8', (err, data) => {
  if (err) throw err;
  var arr = data.split('\n');
  console.log(arr[0]);
  arr.forEach(function(item) {
    DictData
      .findOne({word: item})
      .exec(function(err, word) {
        console.log('run here');
        console.log('looked for word:' + word);
        if(!word) {
          console.log('make request call to oald & 1tudien');
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
            if(results[0] !== "" || results[1] !== "") {
              DictData.create({
                word: item,
                oaldData: results[0],
                evData: results[1]
              });
            }
          });
        }
      });
      console.log('get here');
    });
});
