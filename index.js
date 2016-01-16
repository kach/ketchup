var request = require('request');
var FeedParser = require('feedparser');
var RSS = require('rss');
var express = require('express');
var app = express();

var metamap = {
    // TODO docs
    'title': 'title',
    'description': 'description',
    'link': 'site_url',
    'xmlurl': 'feed_url',
    'date': 'pubDate',
    'pubdate': 'pubDate',
    'author': 'managingEditor',
    'language': 'language',
    'image': 'image_url',
    //'favicon': ,
    'copyright': 'copyright',
    //'generator': ,
    'categories': 'categories'
};
var itemmap = {
    'title': 'title',
    'description': 'description',
    //'summary': 'description',
    //'link': 'url',
    //'origlink': 'url',
    'permalink': 'url',
    //'date': ,
    //'pubdate': ,
    'author': 'author',
    'guid': 'guid',
    //'comments': ,
    //'image': ,
    'categories': 'categories',
    //'source': ,
    'enclosures': 'enclosure'
};

app.get('/api/:url/:start/:interval/', function (req, res) {
  var feed;
  var items = [];
  var feedparser = new FeedParser();
  var r = request(req.params.url);
  r.on('response', function (res) {
    var stream = this;
    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
    stream.pipe(feedparser);
  });

  feedparser.on('meta', function() {
    var stream = this;
    var meta = this.meta;
    var item;
    var opts = {};
    Object.keys(metamap).forEach(function(k) {
      opts[metamap[k]] = meta[k];
    });
    opts.generator = 'Ketchup Temporal Proxy (from \''+meta.generator+'\')';
    opts.webMaster = 'Hardmath123';
    feed = new RSS(opts);
  });

  feedparser.on('readable', function() {
    var stream = this;
    var meta = this.meta;
    var item;

    while (item = stream.read()) {
      items.push(item);
    }
  });
  feedparser.on('end', function() {
    items = items.sort(function(a, b) {
      return new Date(a.date) < new Date(b.date) ? -1 : 1;
    });
    for (var i=0; i<items.length; i++) {
      var opts = {};
      var item = items[i];
      Object.keys(itemmap).forEach(function(k) {
        opts[itemmap[k]] = item[k];
      });
      var predict = new Date(
        Number(req.params.start)*1000 + i*Number(req.params.interval)*1000
      );
      if (predict < new Date()) {
        opts.date = predict;
      } else {
        break;
      }
      feed.item(opts);
    }
    res.send(feed.xml({indent: true}));
    res.end();
  });
});

app.use(express.static(__dirname + '/static'));
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// curl http://localhost:3000/api/http%3A%2F%2Fhardmath123.github.io%2Ffeed.xml/1452976795/57/
