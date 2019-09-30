var client=require ('./connection.js');
var getJSON = require('get-json');

function results (constitLookup,callback) {
  client.search({
    index: 'gov',
    type: 'petitions',
    _source: ['signature_count','action'],
    body: {
      query: {
        bool: {
          must: [
            { match: { 'state': 'open' }},
            { range : {
                  'signature_count' : {
                      'gte' : 10000
                  }
              }
            },
            { nested: {
              path: 'signatures_by_constituency',
              query: {
                bool: {
                  must: [
                    { 'match': { 'signatures_by_constituency.name': constitLookup }}
                  ]
                }
              }
            }}
          ]
        }
      },
      sort: {
        'signatures_by_constituency.importance' : {
          order: 'desc',
          nested_path: 'signatures_by_constituency',
          nested_filter: {
            query: {
              bool: {
                must: [
                  { 'match': { 'signatures_by_constituency.name': constitLookup }}
                ]
              }
            }
          }
        },
        'signatures_by_constituency.signature_count' : {
          order: 'desc',
          nested_path: 'signatures_by_constituency',
          nested_filter: {
            query: {
              bool: {
                must: [
                  { 'match': { 'signatures_by_constituency.name': constitLookup }}
                ]
              }
            }
          }
        }
      }
    }
  },function (error, response, status) {
      if (error){
        console.log("search error: "+error)
      }
      else {
          makeHtmlList(constitLookup,response.hits.hits,function(response){
          callback(response);
        });
      }
    });
}

function getConstituency(postcode,callback) {
  getJSON('https://api.postcodes.io/postcodes/'+postcode, function(error, response){
    if(error) {
      console.log(error);
    }
    else {
      results(response.result.parliamentary_constituency,function(response){
        callback(response);
      });

    }
  });
}

function validatePostcode(postcode, callback) {
  getJSON('https://api.postcodes.io/postcodes/'+postcode+'/validate',function(error,response){
      if(response.result){
        getConstituency(postcode,function(response){
          callback(response);
        });
      }
      else {
        console.log("Please enter a valid postcode");
      }
  });
}

function getResults(userinput, cb) {
  console.log("results starting...");
  var results = validatePostcode(userinput,function(response){
    cb(response);
  });
}

function makeHtmlList(constituency,results,callback) {
  var htmllist = '<h2>Results for '+constituency+'</h2><ol class="petition-results">';
  results.forEach(function(petitiondetails){
    htmllist+='<li><span class="list-item-head"><a href="https://petition.parliament.uk/petitions/'+petitiondetails._id+'">'+petitiondetails._source.action+'</a></span><span class="list-item-info">'+petitiondetails.sort[1]+' signatures from a total of '+petitiondetails._source.signature_count+' </span></li>';
  })
  htmllist+='</ol>';
  callback(htmllist);
}

function getConstituencies(callback){
  client.search({
    index: 'gov',
    type: 'constituencies',
    size: 650,
    _source: 'constituencyname',
    body: {
      sort:
        {
          "constituencyname": {
            order: "asc"
          }
        }
    }
  },function (error, response,status) {
      if (error){
        console.log("search error: "+error)
      }
      if (response){
        var constitList = [];
        response.hits.hits.forEach(function(hit){
          constitList.push(hit._source.constituencyname);
        })
        callback(constitList.sort());
      }
      else {
        console.log("<p>No results</p>");
      }
  });
}


module.exports = {
  getResults: getResults,
  getConstituencies: getConstituencies,
  results: results
};
