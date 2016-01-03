# StreamProxy
Proxy for real-time music re-streaming.

It's stream proxy server which can be used to amplify Icecast or Shoutcast (mp3,mp4,ogg) streams.
Now it's tested in production with Icecast as a source of stream in mp3 format. One instance can handle 1000+ concurent clients and dozens of Icacest sources
on one single share VPS instance with 512MB.

Installation

```
npm install
node StreamProxy.js
```

Configuration (XML)
Configuration is through XML file, where you have to specify streaming_port (80) and all Icecast streams that you want to proxy.
This file has to be accessible somewhere online (HTTP server), because all your Proxy instances will use it.

Do not forget to change the URL in proxy code for accessing the XML file
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

How to connect to the Proxy
The "API" is very simple.













