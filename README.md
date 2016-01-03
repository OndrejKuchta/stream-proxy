# StreamProxy
Proxy for real-time music re-streaming.

It's stream proxy server which can be used to amplify ICY streams (commonly SHOUTcast or Icecast broadcasts).
Now it's tested in production with Icecast as a source of stream in mp3 format. One instance can handle 1000+ concurent clients and dozens of Icacest sources on one single share VPS instance with 512MB. It's compatible with all browsers, iOS and Android devices. We are using it for our mobile and web app, [GYM Radio](http://www.gymradio.com).

##Installation

```
npm install
node StreamProxy.js
```

##Configuration (XML)
Configuration is through XML file, where you have to specify streaming_port (80) and all Icecast streams that you want to proxy.
This file has to be accessible somewhere online (HTTP server), because all your Proxy instances will use it.

**Do not forget** to change the URL in StreamProxy.js (line 25) for accessing the XML file
```
var options_proxy = {
  host: 'your address here.com',
  path: '/proxy/proxy.xml'
};
```

The XML file has 2 main nodes, one is streaming_port, which you have to set to desired number, prefered is 80.
The Streams array contains objects (stream) which describes the stream, which the Proxy server will connect to. The "id" tag is very important to be unique, because clients are accessing the streams using this "id" as a parameter for the request.

```
<proxy_settings>
	<streaming_port>80</streaming_port>
<streams>

	<stream>
		<id>CAR1</id>
		<name>Radio1</name>
		<url>http://46.28.108.97:8002</url>
		<path>/stream</path>
		<port>8002</port>
	</stream>

	<stream>
		<id>CAR2</id>
		<name>Radio2</name>
		<url>http://46.28.108.97:8004</url>
		<path>/stream</path>
		<port>8004</port>
	</stream>
	
	</streams>
</proxy_settings>
```

##How to connect to the Proxy.
The "API" is very simple. To access specific stream, you have to know it's ID (configured in XML).
Visit the "http://proxy_ip:proxy_port/Radio1" for accessing the "Radio1" stream from XML example.

Modules used:
* [Icecast](https://github.com/TooTallNate/node-icy) (icecast@1.3.1)
* [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) (xml2js@0.4.15) 










