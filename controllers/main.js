var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var async = require("async");
var DictData = require("../models/dict-data");

var data = "";

var sendResponse = function(res, status, content) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.end(content);
};

exports.dict = function(req, res, next) {
  var wordRequest = req.query.search;
  DictData.findOne({ word: wordRequest }).exec(function(err, word) {
    console.log("looked for word");
    if (word) {
      sendResponse(res, 200, JSON.stringify(word));
    } else {
      console.log("make request call to oald & 1tudien");
      var oaldWordRequest = wordRequest.replace(/'/g, "-");
      var url1 =
        "http://www.oxfordlearnersdictionaries.com/definition/english/" +
        oaldWordRequest;
      var url2 = "http://dict.laban.vn/find?type=1&query=" + wordRequest;

      async.parallel(
        [
          function(callback) {
            request(url1, function(error, response, html) {
              if (!error) {
                var $ = cheerio.load(html);
                callback(null, $.html(".h-g"));
              }
            });
          },
          function(callback) {
            request(
              {
                method: "GET",
                url: url2,
                gzip: true
              },
              function(error, response, html) {
                if (!error) {
                  var $ = cheerio.load(html);
                  callback(
                    null,
                    $("#content_selectable .content").first().html()
                  );
                }
              }
            );
          }
        ],
        function(err, results) {
          DictData.create(
            {
              word: wordRequest,
              oaldData: results[0],
              evData: results[1]
            },
            function(err, data) {
              sendResponse(res, 200, JSON.stringify(data));
            }
          );
        }
      );
    }
  });
};

exports.suggestion = function(req, res, next) {
  var wordRequest = req.query.search;
  const url1 = `http://google.com/complete/search?client=firefox&q=${wordRequest}`;
  request(url1, function(error, response, html) {
    if (!error) {
      const responseObject = JSON.parse(response.body);
      sendResponse(res, 200, JSON.stringify(responseObject[1][0]));
    }
  });
};
