# Storage

## Install
If you want to use In-Memory storage you may install the package by following:
```bash
$ npm install memory-ciks
```

## Functions
### storage.init(connection)
Initializes storage object.

### storage.store(alias, options, data, ttl)
Stores calculated data to cache.
Params:
- alias — alias of the producer function used to calculate the data;
- options — options passed to the producer function;
- data — calculated data;
- ttl — time to live for the cache.

### storage.get(alias, options)
Gets cached value.
Params:
- alias — alias of the producer function;
- options — options passed to the producer function;

### storage.clear()
Clears all expired caches in the storage.
