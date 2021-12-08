var mongoose = require('mongoose')
  , lib = require('../lib/explorer')
  , db = require('../lib/database')
  , settings = require('../lib/settings')
  , request = require('request');

var COUNT = 5000; //number of blocks to index

function exit() {
  mongoose.disconnect();
  process.exit(0);
}

var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;

mongoose.connect(dbString, function(err) {
  if (err) {
    console.log('Unable to connect to database: %s', dbString);
    console.log('Aborting');
    exit();
  } else {
    request({uri: 'http://127.0.0.1:' + settings.port + '/api/getpeerinfo', json: true}, function (error, response, body) {
      lib.syncLoop(body.length, function (loop) {
        var i = loop.iteration();
        var portSplit = body[i].addr.lastIndexOf(":");
        var port = "";
        if (portSplit < 0) {
          portSplit = body[i].addr.length;
        } else {
          port = body[i].addr.substring(portSplit+1);
        }
        var address = body[i].addr.substring(0,portSplit);
        db.find_peer(address, function(peer) {
          if (peer) {
            if (isNaN(peer['port']) || peer['port'].length < 2 || peer['country'].length < 1 || peer['country_code'].length < 1) {
              db.drop_peer(address, function() {
                console.log(`Peer ${address} dropped`);
                //exit();
              });
            }
            //peer already exists
            loop.next();
          } else {
            request({uri: `https://api.freegeoip.app/json/${address}?apikey=d6827f20-4479-11ec-bc96-df369884923a`, json: true}, function (error, response, geo) {
              db.create_peer({
                address: address,
                port: port,
                protocol: body[i].version,
                version: body[i].subver.replace('/', '').replace('/', ''),
                latitude: geo.latitude,
                longitude: geo.longitude,
                city: geo.city,
                regionname: geo.region_name,
                country: geo.country_name,
                country_code: geo.country_code
              }, function(){
                loop.next();
              });
            });
          }
        });
      }, function() {
        exit();
      });
    });
  }
});