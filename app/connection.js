var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client(
  {
      host: 'http://localhost:9200',
      log: 'trace',
      keepAlive: false
  }
);

module.exports = client;
