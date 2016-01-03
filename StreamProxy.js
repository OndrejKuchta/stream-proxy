/*
Streaming Proxy
*/

'use strict';

var http = require('http')
    , icecast = require('icecast')
    , url = require('url')
    , fs = require('fs')
    , net = require('net')
    , xml2js = require('xml2js')
    , util = require('util')
    , RingBuffer = require('./RingBuffer');


var stream_port;
var server;
var icy_header = {};

var parser = new xml2js.Parser();
global.xmlDataStore = "GlobalXML";

//XML streaming servers list
var options_proxy = {
  host: 'your address here.com',
  path: '/proxy/proxy.xml'
};

initProxy();

//Array of all connected clients - sockets
var stream_clients = {};
//Array of all icecast streams - just ID's from XML file
var streams = [];
// All open icecast streams - sockets
var icecast_streams = {};
//Number of connected clients
var clients_connected = 0;
//Array which holds status of every icecast connection
var stream_status = {};
//Buffer which is send initialy to clients for faster loading
var music_buffer = {};

function initProxy() {

  parseProxySettings(function(result){
    //proxy settings

    if(result != null) {
      stream_port = result.proxy_settings.streaming_port[0];
      stream_port = 999
      //set and start the icecast streams
      for(var i=0; i<result.proxy_settings.streams[0].stream.length; i++ ){

        stream_status[result.proxy_settings.streams[0].stream[i].id[0]] = { 'streamid': result.proxy_settings.streams[0].stream[i].id[0], 'streamurl': result.proxy_settings.streams[0].stream[i].url+result.proxy_settings.streams[0].stream[i].path, 'status' : 0 };
        startListeningToIcecastStream(result.proxy_settings.streams[0].stream[i].url+result.proxy_settings.streams[0].stream[i].path, result.proxy_settings.streams[0].stream[i].id);
        streams.push(result.proxy_settings.streams[0].stream[i].id[0]);

      }

      //Start server for incoming users
      startServer();
      setTimeout(streamMonitor,10000);
      setTimeout(dumpCollector,1000);

    }

  });

}


// -- Accepting incomming users --
//HTTP Server listening for incomming clients

function startServer() {

  server = http.createServer(function(request, response) {

  //Push the client to the right array
  request.on("close", function() {
      // request closed unexpectedly, delete user stream
       deleteFromArray(response);
       clients_connected--;
    });

    request.on("end", function() {
      // request ended normally, delete user stream
       //deleteFromArray(response);

    });

}).listen(stream_port);

//Incoming request from new client

server.on('request', function(req, res) {

  var url_parts = url.parse(req.url, true);
  var paramsArray = url_parts.pathname.split('/');

  var params = {};
  params['streamid'] = paramsArray[1];

//Return server live statistics
  if(paramsArray[1] == 'stats') {
    //Return server stats
    res.write(JSON.stringify({'live_clients': clients_connected}));
    res.write(JSON.stringify(stream_status));
    res.end();
    return;
  }

  if(paramsArray[1] == 'running') {
    //Return server stats
    res.write('<proxy>true</proxy>');
    res.end();
    return;
  }

  if(params.streamid == undefined) {
    res.writeHead(404, {"Content-Type": "text/plain"});
    res.end();
  }


    //Does requested stream exist?
    if( checkStreamId(params.streamid ) ){

        if(stream_clients[params.streamid] == undefined){
          stream_clients[params.streamid] = [];
        }

        res['streamid'] = params.streamid;

        //Write the correct HTTP response head
        delete icy_header[params.streamid]['icy-metaint'];
        res.writeHead(200,'OK',icy_header[params.streamid]);

        //Add client to the qeue
        stream_clients[params.streamid].push(res);
        clients_connected++;

        /*

        New client is connected. All clients are stored in stream_clients object where every stream has
        his own array of clients. Number of connected clients can be read in clients_connected.

        I'm sending the initial buffer for the first time. This is really good optimalization especialy for music,
        becuase lot of music players in browsers but also in iOS and Android devices are buffering initial frame before they
        start playing, which is annoying. This is the solution. Music starts playing immidiatelly.

        */

        if(params['buffer'] == undefined || params['buffer'] == 'bufferon'){
          sendInitialBuffer(res, params.streamid);
        }

    }
    else{
      //end connection with unsuccesfull login message
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.end();

    }

});

}

process.on('uncaughtException', function (err) {
    console.log(err);
});


function checkStreamId(streamid) {

  if(streams.indexOf(streamid) != -1 ){
    return true;
  }
  else{
    return false;
  }
}

// -- CONNECTION TO THE REMOTE ICACAST STREAM --
// Icecast module used

function startListeningToIcecastStream(url_stream, id_stream) {

 console.log('Start icecast : ' + id_stream);

  icecast.get(url_stream, function (res) {

  // log the HTTP response headers
  //console.error(res.headers);

  res.on('metadata', function(meta){
    //sendData(id_stream, meta);
    //console.log('META: '+meta);
  });

  res['streamid'] = id_stream;

 //If stream for the same icecast already running, kill it
  if(icecast_streams[id_stream] != undefined) {
    icecast_streams[id_stream] == undefined;
  }

  icecast_streams[id_stream] = res;

  icy_header[id_stream] = res.headers;

  res.on('data', function(data) {

      if(stream_status[id_stream] != undefined) {
        //stream is ON
        stream_status[id_stream].status = 1;

      }

      sendData(id_stream, data, res);

  });

  res.on('end', function() {
    console.log('end');

    //Error Icecast connection END

    //restart connection
    /*
    setTimeout(function() {
      startListeningToIcecastStream(url_stream, id_stream);
    },5000);
    */

    if(stream_status[id_stream] != undefined) {
        //stream is OFF
        stream_status[id_stream].status = 0;
    }

  });

  res.on('closed', function() {
    console.log('closed');

    //Error Icecast connection closed , url_stream, id_stream

    //restart connection
    /*
    setTimeout(function() {
      startListeningToIcecastStream(url_stream, id_stream);
    },5000);
    */

    if(stream_status[id_stream] != undefined) {
        //stream is OFF
        stream_status[id_stream].status = 0;
      }

  });

});

}


function sendInitialBuffer(client, id_stream) {

//send init frame  mp3frame
var buf_size = music_buffer[id_stream].remaining();
    var mp3frame = new Buffer(buf_size);
    music_buffer[id_stream].peek(mp3frame,  buf_size);

          client.write(mp3frame);

}

//Send data to all clients of given strem
function sendData(id_stream, data, res){

  //If the res is not the current res (old res) do not send the data
  if(icecast_streams[id_stream] != res) {
    return;
  }

  dataMonitor(id_stream, data);

  if(music_buffer[id_stream] == undefined ) {
    music_buffer[id_stream] = new RingBuffer(131072);
  }

  music_buffer[id_stream].put(data);

  if(stream_clients[id_stream] != undefined){
      stream_clients[id_stream].forEach(function(client) {
        client.write(data);
      });
  }
}


// ------- Parsing configuration XML ------

function parseProxySettings(callback) {

http.get(options_proxy, function(res) {
  var data = '';
  res.on('data', function(chunk) {
    data += chunk.toString();
  })
  .on('error', function (err) {
    console.err('Error retreiving XML file');
    throw err;
  })
  .on('end', function() {
    //Parse XML to JSON
    parser.parseString(data, function (err, result) {
        //XML parsed, create offerObject for clients
        if(err == null) {

          callback(result);
        }
        else{
          //Parsing error
          callback(null);
        }
    });
  });
 });

}


// ------ Monitoring functions --------


function streamMonitor() {

  setTimeout(streamMonitor, 10000);

  console.log('stream monitor check');
  for(var stream in stream_status){

    var timeNow = Date.now();

    if(stream_status[stream]['lastTime'] == undefined ){

      stream_status[stream]['lastTime'] = 0;
    }

   if(stream_status[stream]['lastTime'] < (timeNow - 3000) || stream_status[stream].status == 0) {
          console.log('stream not running : ' + stream_status[stream].streamid);
          //stream is not running and needs restart
          startListeningToIcecastStream(stream_status[stream].streamurl, stream_status[stream].streamid);
    }

  }//for
}


function dataMonitor(streamid, data) {
  //Sometimes the stream is connected, but it does'nt send any data
  //If no data are send from given stream, we need to restart it

  /*
  It will add timestamp when last data was send and then the stream monitor will check it once per 10s
  If the timestamp is older than 2 seconds we need to restart the connection to the Icecast stream
  */

  if(data != undefined && data.length > 0) {
    stream_status[streamid]['lastTime'] = Date.now();
  }

}

function dumpCollector() {

  setTimeout(dumpCollector, 60000);

  var tmpDump = " connected clients : "+clients_connected+ "\n";

  for(var stream in stream_status){

    if(stream_status[stream].status == 0) {
      tmpDump += ' stream not running : ' + stream_status[stream].streamid+ "\n";
    }
    else if(stream_status[stream].status == 1){
      tmpDump += ' stream running : ' + stream_status[stream].streamid+ "\n";
    }
    else{
      tmpDump += ' stream in undefined state : ' + stream_status[stream].streamid+ "\n";
    }
  }

}

// ------ Helper functions --------

function deleteFromArray(response) {

  if(response['streamid'] != undefined){

    var position = stream_clients[response['streamid']].indexOf(response);
    stream_clients[response['streamid']].splice(position, 1);

    console.log('deleted ' +stream_clients[response['streamid']].length);
  }

}
