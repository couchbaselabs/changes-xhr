function Changes(dbURL) {
  this.url = dbURL;
  this.listeners = [];
  this.includeDocs = true;
}
Changes.prototype.on = function(event, callback) {
  if (event == "change") {
    this.listeners.push(callback)
  }
};
Changes.prototype.emit = function(event, data) {
  if (event == "change") {
    this.listeners.forEach(function(callback) {
      callback(data)
    })
  }
};


var jsonxhr = Changes.jsonxhr = function  (method, URL, callback, body) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status < 300) {
      setTimeout(function () {
        var jsonObj = JSON.parse(xmlhttp.response);
        callback(false, jsonObj)
      }, 10);
    } else if (xmlhttp.readyState == 4) {
      // todo, some kind of automatic reconnect on error?
      // following redirects shouldn't be necessary
      callback(xmlhttp)
    }
  };
  xmlhttp.open(method, URL, true);
  if (method == "POST" || method == "PUT") {
    xmlhttp.setRequestHeader("Content-Type", "application/json")
    xmlhttp.send(JSON.stringify(body));
  } else {
    xmlhttp.send();
  }
}

Changes.prototype.start = function(since) {
  var that = this;
  var changeURL = that.url + "_changes?feed=longpoll";
  if (this.includeDocs) {
   changeURL +=  "&include_docs=true"
  }
  changeURL +=  "&since="
  var getSince = function (cseq) {
    jsonxhr ("GET", changeURL + cseq, function(error, json){
      that.processChanges(json)
      getSince(json.last_seq)
    })
  };
  // do an info request to get start sequence for changes so we only scan
  // changes since about when we started the changes iterator
  // pass in since = 0 to override
  // this will iterate all stored changes on every page launch...
  if (typeof since == "undefined") {
    jsonxhr("GET", that.url, function(error, info){
      getSince(info.update_seq)
    });
  } else {
    getSince(since); 
  }
};

Changes.prototype.loadDoc = function(id, rev, callback) {
  jsonxhr("GET", this.url + id + "?rev=" + rev, callback)
}

Changes.prototype.processChanges = function(response) {
  // console.log("processChanges", response)
  response.results.forEach(function(row){
    if (this.includeDocs && !row.doc && row.changes[0].rev != "") {
      this.loadDoc(row.id, row.changes[0].rev, function(error, doc){
        this.emit("change", doc)
      }.bind(this))
    } else if (row.doc) {
      this.emit("change", row.doc)
    }
  }.bind(this))
}

module.exports = Changes
