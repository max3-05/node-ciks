# node-ciks
Cache (library and service) implementation for nodejs.

## Install

```bash
$ npm install node-ciks
```

## Usage

```js
var mongo = require('mongodb');
var defer = require("node-promise").defer;

var kache = require('node-ciks');
var storage = require('mongodb-ciks');

var producer = function(options, promise) {
    /// Some long data calculation.
    setTimeout(function() {promise.resolve('Some data' + options.date);}, 30 * 1000);
};

var ttlProducer = function(options) {
    /// If options contains today date, cache TTL should be 1 min otherwise 1 hour
    if ( (new Date().getTime()) - options.date.getTime() < 24 * 60 * 60 * 1000) {
        return 60 * 1000;
    } else {
        return 60 * 60 * 1000;
    }
};

/// Initializes MongoDB connection and initialize cache storage
mongo.connect("mongodb://mongodb:27017/cache", function (err, db) {
    if (err == null && db != null) {
        storage.init(db);

        /// Sets storage to store cached values
        kache.storage(storage);

        /// Registers producer function with TTL callback function.
        kache.register('test.producer', producer, ttlProducer);

        /// Populates value and output it to console
        var promise = defer();
        console.info(new Date() + ": Calling not populated cache");
        kache.get('test.producer', {date: new Date()}, promise);
        promise.then(function(data) {console.info(new Date() + ": Output data (cache no populated): " + data);});

        /// Gets value from cache and output it to console
        var promiseCached = defer();
        console.info(new Date() + ": Calling populated cache");
        kache.get('test.producer', {date: new Date()}, promiseCached);
        promiseCached.then(function(data) {console.info(new Date() + ": Output data from cache: " + data);});

        /// Exiting application
        Promise.all([promiseCached, promise]).then(function() {
            process.exit();
        });
    } else {
        throw err;
    }
});
```

## Functions

### ciks.storage(storage)
Sets cache storage.
Params:
- storage — Instance of one of storage class. Currently only [MongoDB](https://github.com/max3-05/node-ciks/tree/master/src/mongodb-ciks) storage supported.

### ciks.register(alias, producer, ttlProducer)
Registers new data producer function.
Params:
- alias — Producer function alias.
- producer — Callable producer function.
- ttlProducer — Callable function that produces cache TTL based on options passed to producer function.

### ciks.get(alias, options, promise)
Gets data from cache or populate it.
- alias — Producer function alias.
- options — Options to pass to producer function to populate data.
- promise — Promise to resolve when data is populated.

### ciks.populate(alias, options, promise)
Populates new data and store it to cache.
- alias — Producer function alias.
- options — Options to pass to producer function to populate data.
- promise — Promise to resolve when data is populated.