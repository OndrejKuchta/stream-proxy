# Stream-Proxy
Proxy for real-time music re-streaming.

Stream proxy server which can be used to amplify ICY streams (commonly SHOUTcast or Icecast broadcasts).
It's tested in production with Icecast as a source of stream (Centova Cast) in mp3 format. One instance can handle 1000+ concurent clients and dozens of Icacest sources on one single shared VPS instance with 512MB. It's compatible with all browsers, iOS and Android devices. We are using it for our mobile and web app, [GYM Radio](http://www.gymradio.com).

###Extra Features
Ring buffer for initial stream data boost. Player starts playing music almost immidiately and user doesn't have to wait for pre-buffering. Great user experince.

##Installation

```
npm install
node StreamProxy.js
```
But i strongly recommend using the [Forever](https://github.com/foreverjs/forever) for running this in production.


##Configuration
Configuration is through XML file, where you have to specify streaming_port (80) and all Icecast streams that you want to proxy.
This file has to be accessible somewhere online (HTTP server), because all your proxy instances will use it.

**Do not forget** to change the URL in StreamProxy.js (line 25) for accessing the XML file
```
var options_proxy = {
  host: 'your address here.com',
  path: '/proxy/proxy.xml'
};
```

The XML file has 2 main nodes, one is streaming_port, which you have to set to desired number, prefered is 80.
The Streams array contains objects (stream) which describes the stream, which the proxy server will connect to. The "id" tag is very important to be unique, because clients are accessing the streams using this "id" as a parameter for the request.

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

##Connecting to the proxy
The request is very simple. To access specific stream, you have to know it's ID (configured in XML), proxy IP and port.
``` http://proxy_ip:proxy_port/id ```

Visit the ``` http://proxy1.gymradio.cz/GYM0 ``` for accessing our GYM stream from the [GYM Radio](http://www.gymradio.com).


##Modules
* [Icecast](https://github.com/TooTallNate/node-icy) (icecast@1.3.1)
* [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) (xml2js@0.4.15) 


##The MIT License

Copyright (c) 2016 GYM Team s.r.o. http://www.gymradio.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
