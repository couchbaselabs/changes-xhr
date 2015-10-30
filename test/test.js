var test = require('prova')

var Changes = require("../lib/changes")
var TEST_URL = "http://localhost:4984/test/"


test('basic usage', function (t) {
  t.plan(3)
  t.equal(typeof Changes, 'function')
  var connection = new Changes(TEST_URL)
  connection.on("change", function(doc){
    if (doc._id == "ace") {
      t.equal(doc._id, "ace")
    }
  })
  connection.start();
  Changes.jsonxhr("GET", TEST_URL + "ace", function(error, doc){
    if (error) {
      doc = {_id : "ace"};
    }
    Changes.jsonxhr("PUT", TEST_URL + "ace", function(error, data){
      t.equal(data.id, "ace")
    },doc)
  })
})


function xhr(callback) {
            var that = this;
            var poller = function (cseq) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4 && xmlhttp.status < 300) {
                        setTimeout(function () {
                            var jsonObj = JSON.parse(xmlhttp.response);
                            poller(jsonObj.last_seq);
                            return callback(false, jsonObj);
                        }, 10);
                    } else {
                      callback(xmlhttp)
                    }
                };
                xmlhttp.open("GET", fullUrl + "_changes?include_docs=true&feed=longpoll&since=" + cseq, true);
                xmlhttp.send();
                xhrChangeObj = xmlhttp;
            };
            poller(0);
        };
