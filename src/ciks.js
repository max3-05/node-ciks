var defer = require("node-promise").defer;
var uuid  = require('uuid');

var storage;

var promises = [];

var sources = [];

exports.get = function(alias, options, promise) {
    var d = defer();
    d.promise.then(function(data) {
        if (!data || data.expired_in < new Date()) {
            exports.populate(alias, options, promise);
        } else {
            promise.resolve(data.data);
        }
    });

    storage.get(alias, options, d);
};

exports.populate = function(alias, options, promise) {
    var key = JSON.stringify(options);
    var id  = uuid.v1();

    if (!promises[alias][key]) {
        promises[alias][key] = defer();
        promises[alias][key].id = id;
    }

    if (promises[alias][key].id == id) {
        sources[alias].producer(options, promises[alias][key]);
    }

    promises[alias][key].promise.then(function(data) {
        var ttl = sources[alias].ttlProducer(options);
        storage.store(alias, options, data, ttl);
        promise.resolve(data);
    });
};

exports.register = function(alias, callback, ttlCallback) {
    sources[alias] = {"producer": callback, "ttlProducer": ttlCallback || function(options) { return 30 * 60 * 100; }};
    promises[alias] = [];
};

exports.storage = function(store) {
    storage = store;
    setInterval(function() {storage.clear();}, 1000 * 60);
};