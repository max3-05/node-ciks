# Storage

## Install
If you want to use MongoDB storage you may install the package by following:
```bash
$ npm install mongodb-ciks
```

## Functions
### storage.init(connection)
Initializes storage object.
Params:
- connection — MongoDB connection retrieved by ```mongo.connect```

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
Clears all cache in the storage.
