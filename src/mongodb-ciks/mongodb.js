var dbcache;

exports.init = function(connection) {
    dbcache = connection;
};

exports.store = function(alias, options, data, ttl) {
    var opt = JSON.parse(JSON.stringify(options).replace(/\./g, '_'));

    var collection = dbcache.collection(alias);
    var created_at = new Date();
    var document = {
        created_at: created_at,
        expired_in: ttl || new Date(created_at.getTime() + (30 * 60 * 1000)),
        options: opt,
        data: data
    };

    collection.insert([document], function(err, result) {
        if (err) {
            throw err;
        }
    });
};

exports.get = function(alias, options, promise) {
    var opt = JSON.parse(JSON.stringify(options).replace(/\./g, '_'));
    var collection = dbcache.collection(alias);
    collection.findOne({ $query: {options: opt}, $orderby: { expired_in : -1 } }, function (err, document) {
        if (err) {
            promise.reject(err);
            console.error(err);
        } else {
            promise.resolve(document);
        }
    });
};

exports.clear = function() {
    dbcache.listCollections().toArray(function(err, result) {
        if (err) {
            console.log(err);
            throw  err;
        }

        for(var i = 0; i < result.length; i++) {
            dbcache.collection(result[i].name).remove({expired_in: {$lte: new Date()}});
        }
    });
};
