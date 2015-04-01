## redis-tile-store
 
A module to extend [express-tile-cache](https://github.com/CGastrell/express-tile-cache) memory cache to use Redis. 


## Overview

**redis-tile-store** is based on the conception of TJ's [connect-redis](https://github.com/tj/connect-redis) and provides redis store functionality to a tile source in [express-tile-cache](https://github.com/CGastrell/express-tile-cache)

    
    var redisTileStore = require("redis-tile-store");

It also supports key pairs expiring, disabled by default. Invoke `setTtl(###)` to enable.

## Installation 

    npm install redis-tile-store --save

## Usage

Create a new instance of the storage object with S3 configuration and assign it to a tile source configuration:

    var express = require("express"),
      tilecache = require("express-tile-cache"),
      redisTileStore = require("redis-tile-store"),
      app = express();

    var redisStore = redisTileStore({
      port: 6379,
      host: "redis-url-here",
      prefix: "tiles" //should you need one
    })
    var argenmaptiles = {
      urlTemplate: "http://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0",
      store: redisStore
    }

    app.use(tilecache(argenmaptiles));


## Inner workings

Uses [AWS-SDK](https://www.npmjs.com/package/aws-sdk) to instance S3 object and upload. You need to have access to an AWS account and have a configured and working S3 bucket.


## API

### Module

The **redis-tile-store** module returns a function. 

    var redisTileStore = require("redis-tile-store");

#### redis-tile-store.set(hash, data, callback)

**Arguments**

* `hash` - *{String}* **Required**: Identifier string for the tile to store

* `data` - *{Object}* **Required**: related dataset of the tile.

* `callback` - *{Function}* 

#### redis-tile-store.get(hash, callback)

**Arguments**

* `hash` - *{String}* **Required**: Identifier string for the tile to store

* `callback` - *{Function}* **Required** {Function}. This function will bring back the properties reported by S3 after uploading the file:

  * Location: 'https://bucketName.s3.amazonaws.com/filename.ext',
  * Bucket: 'bucketName',
  * Key: 'filename.ext',
  * ETag: 'bf2acbedf84207d696c8da7dbb205b9f-5'

#### redis-tile-store.setTtl(minutes)

Enables TTL and sets expiring time. Calling this method enables TTL usage, off by default.

  * `minutes` *{Number}*: minutes the key pair kept alive

# Changelog

### 1.1.0

  * Implementation of SETEX command, setting TTL enables key pairs expire

#License 

The MIT License (MIT)

Copyright (c) 2015 Christian Gastrell &lt;cgastrell@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.