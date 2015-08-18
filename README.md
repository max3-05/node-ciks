# node-ciks
Cache (library and service) implementation for nodejs.

## Install

```bash
$ npm install node-ciks
```

## Usage

```js
var ciks = require('../src/ciks').cache;
var mstorage = require('../src/memory-ciks/memory.js').storage;

var cache = new ciks();
var storage = new mstorage();
cache.storage(storage);

/// Now you can register cache producers, populate values and get cached ones.
```
For more use detailed cases please refer to [example](https://github.com/max3-05/node-ciks/tree/master/docs/examples/example.js)

## Functions

### ciks.storage(storage)
Sets cache storage.
Params:
- storage — Instance of one of storage class. Currently only [MongoDB](https://github.com/max3-05/node-ciks/tree/master/src/mongodb-ciks) and [In-Memory](https://github.com/max3-05/node-ciks/tree/master/src/memory-ciks) storage supported.

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