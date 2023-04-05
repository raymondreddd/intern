// here is schema defined
// {
//     "_id": ObjectId("..."),
//     "value": 5,
//     "left": ObjectId("..."),
//     "right": ObjectId("...")
// }

const express = require('express');
const async = require('async');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const url = 'mongodb://localhost:27017/myproject';
const app = express();

//  request handler for the '/search/:start' route, here start contains the starting point objectId
app.get('/search/:start', function(req, res) {
  const start = req.params.start;

  MongoClient.connect(url, function(err, client) {
    if (err) throw err;

    const db = client.db('myproject');
    const collection = db.collection('nodes');
    const queue = [start];
    const results = [];

    async.whilst(
      function() { return queue.length > 0; },
      function(callback) {
        const node = queue.shift();

        collection.findOne({ _id: ObjectId(node) }, function(err, doc) {
          if (err) return callback(err);
          if (!doc) return callback(new Error(`Node not found: ${node}`));

          results.push(doc);

          if (doc.left) queue.push(doc.left.toString());
          if (doc.right) queue.push(doc.right.toString());

          callback();
        });
      },
      function(err) {
        if (err) throw err;

        res.json(results);
        client.close();
      }
    );
  });
});

// Start listening for incoming requests on port 3000
app.listen(3000, function() {
  console.log('Server listening on port 3000');
});




