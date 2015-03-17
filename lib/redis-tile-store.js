/*!
 * Redis tile store, based on:
 *
 * Connect - Redis
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var debug = require('debug')('redis-tile-store');
var redis = require('redis');
var default_port = 6379;
var default_host = '127.0.0.1';
var noop = function(){};



/**
 * Initialize RedisStore with the given `options`.
 *
 * @param {Object} options
 * @api public
 */
RedisStore = module.exports = function (options) {

  if(!(this instanceof RedisStore)) {
    return new RedisStore(options);
  }
  var self = this;

  options = options || {};
  // Store.call(this, options);
  this.prefix = options.prefix == null
    ? 'tile:'
    : options.prefix;

  /* istanbul ignore next */
  if (options.url) {
    console.error('Warning: "url" param is deprecated and will be removed in a later release: use redis-url module instead');
    var url = require('url').parse(options.url);
    if (url.protocol === 'redis:') {
      if (url.auth) {
        var userparts = url.auth.split(':');
        options.user = userparts[0];
        if (userparts.length === 2) {
          options.pass = userparts[1];
        }
      }
      options.host = url.hostname;
      options.port = url.port;
      if (url.pathname) {
        options.db = url.pathname.replace('/', '', 1);
      }
    }
  }

  // convert to redis connect params
  if (options.client) {
    this.client = options.client;
  }
  else if (options.socket) {
    this.client = redis.createClient(options.socket, options);
  }
  else if (options.port || options.host) {
    this.client = redis.createClient(
      options.port || default_port,
      options.host || default_host,
      options
    );
  }
  else {
    this.client = redis.createClient(options);
  }

  if (options.pass) {
    this.client.auth(options.pass, function (err) {
      if (err) {
        throw err;
      }
    });
  }

  this.ttl = options.ttl;
  this.disableTTL = options.disableTTL || true;

  if (options.unref) this.client.unref();

  if ('db' in options) {
    if (typeof options.db !== 'number') {
      console.error('Warning: connect-redis expects a number for the "db" option');
    }

    self.client.select(options.db);
    self.client.on('connect', function () {
      self.client.send_anyways = true;
      self.client.select(options.db);
      self.client.send_anyways = false;
    });
  }

  // because i'm not extending an implementation of EventEmitter
  // i can't use emit here. Check this.
  self.client.on('error', function (er) {
    // self.emit('disconnect', er);
  });

  self.client.on('connect', function () {
    // self.emit('connect');
  });
}

/**
 * Attempt to fetch tile data by the given `hash`.
 *
 * @param {String} hash
 * @param {Function} fn
 * @api public
 */

RedisStore.prototype.get = function (hash, fn) {
  var store = this;
  var phash = store.prefix + hash;
  if (!fn) fn = noop;
  debug('GET "%s"', hash);

  store.client.get(phash, function (er, data) {
    if (er) return fn(er);
    if (!data) return fn();

    var result;
    data = data.toString();
    debug('GOT %s', data);

    try {
      result = JSON.parse(data);
    }
    catch (er) {
      return fn(er);
    }
    return fn(null, result);
  });
};

/**
 * Commit the given `details` object associated with the given `hash`.
 *
 * @param {String} hash
 * @param {Session} details
 * @param {Function} fn
 * @api public
 */

RedisStore.prototype.set = function (hash, details, fn) {
  var store = this;
  var phash = store.prefix + hash;
  if (!fn) fn = noop;

  try {
    var jdetails = JSON.stringify(details);
  }
  catch (er) {
    return fn(er);
  }

  // if (store.disableTTL) {
    debug('SET "%s" %s', hash, jdetails);
    store.client.set(phash, jdetails, function (er) {
      if (er) return fn(er);
      debug('SET complete');
      fn.apply(null, arguments);
    });
};

RedisStore.prototype.clear = function() {
  //borrar todos con el prefix
}

/**
 * Destroy the session associated with the given `sid`.
 *
 * @param {String} sid
 * @api public
 */

RedisStore.prototype.destroy = function (sid, fn) {
  sid = this.prefix + sid;
  debug('DEL "%s"', sid);
  this.client.del(sid, fn);
};


