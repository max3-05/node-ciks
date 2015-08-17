exports.storage = function() {
    this.dbcache = null;

    this.init = function (connection) {
        this.dbcache = connection;
    };

    this.store = function (alias, options, data, ttl) {
        var opt = JSON.parse(JSON.stringify(options).replace(/\./g, '_'));

        var collection = this.dbcache.collection(alias);
        var created_at = new Date();
        var document = {
            created_at: created_at,
            expired_in: ttl || new Date(created_at.getTime() + (30 * 60 * 1000)),
            options: opt,
            data: data
        };

        collection.insert([document], function (err, result) {
            if (err) {
                throw err;
            }
        });
    };

    this.get = function (alias, options, promise) {
        var opt = JSON.parse(JSON.stringify(options).replace(/\./g, '_'));
        var collection = this.dbcache.collection(alias);
        collection.findOne({$query: {options: opt}, $orderby: {expired_in: -1}}, function (err, document) {
            if (err) {
                promise.reject(err);
                console.error(err);
            } else {
                promise.resolve(document);
            }
        });
    };

    this.clear = function () {
        var self = this;
        var date = new Date().getTime();
        this.dbcache.listCollections().toArray(function (err, result) {
            if (err) {
                console.log(err);
                throw  err;
            }

            for (var i = 0; i < result.length; i++) {
                self.dbcache.collection(result[i].name).remove({expired_in: {$lte: new Date() - created_at}});
            }
        });
    };
};
