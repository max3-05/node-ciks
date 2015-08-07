var defer = require("node-promise").defer;
var uuid  = require('uuid');

exports.cache = function() {
    this.storage = null;

    this.promises = [];

    this.sources = [];

    var self = this;

    this.clearPeriod = 1000 * 60;

    this.get = function (alias, options, promise) {
        var d = defer();
        d.promise.then(function (data) {
            if (!data || data.expired_in < new Date()) {
                self.populate(alias, options, promise);
            } else {
                promise.resolve(data.data);
            }
        });

        self.storage.get(alias, options, d);
    };

    this.populate = function (alias, options, promise) {
        var key = JSON.stringify(options);
        var id = uuid.v1();

        if (!self.promises[alias][key]) {
            self.promises[alias][key] = defer();
            self.promises[alias][key].id = id;
        }

        if (self.promises[alias][key].id == id) {
            self.sources[alias].producer(options, self.promises[alias][key]);
        }

        self.promises[alias][key].promise.then(function (data) {
            var ttl = self.sources[alias].ttlProducer(options);
            self.storage.store(alias, options, data, ttl);
            promise.resolve(data);
        });
    };

    this.register = function (alias, callback, ttlCallback) {
        self.sources[alias] = {
            "producer": callback, "ttlProducer": ttlCallback || function (options) {
                return 30 * 60 * 100;
            }
        };
        self.promises[alias] = [];
    };

    this.storage = function (store) {
        self.storage = store;
        setInterval(function () {
            self.storage.clear();
        }, self.clearPeriod);
    };
};