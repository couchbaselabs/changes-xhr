## Couchbase Lite changes listener for JavaScript XHR

Does this:

* getting the current sequence from the database to avoid massive backfill on launch
* setting up a longpoll connection
* fetching the document asynchronously if the doc field is null (workaround for null docs in feed)
* presents the output as an event api.

Uses rudimentary event handler facade (no removal, etc) so maybe patch it with your favorite event system.

How to subscribe to changes:

```javascript
var Changes = require("changes-xhr");
var url = "http://localhost:4985/test/"

var connection = new Changes(url)
connection.on("change", function(doc){
    console.log("changed document", doc)
})
connection.start()
```

You can also call it with `connection.start(0)` to force a backfill.

### XHR utility function attached.

Get a document:

```
var id = "ace"
Changes.jsonxhr("GET", url + id, function(error, doc){
    console.log("document", doc)
})
```

POST JSON to create a document:

```
Changes.jsonxhr("POST", url, function(error, ok){
    console.log("created", ok.id)
}, {random : Math.random()})
```

### How to run tests

```sh
npm install
node test/test.js -b
```

