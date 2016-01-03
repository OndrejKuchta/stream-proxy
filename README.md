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




