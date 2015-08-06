var chai = require('chai');
var sinon = require('sinon');
var defer = require('node-promise').defer;


var stubStore = function() {
    var storage = require('../src/mongodb-ciks/mongodb.js');

    sinon.stub(storage, 'store');
    sinon.stub(storage, 'get');
    sinon.stub(storage, 'clear');

    return storage;
};

var producer = function(max, promise) {
    var result = Math.random() * max;
    console.log(result);
    promise.resolve(result)
};

var slowproducer = function(max, executionTime) {
    setTimeout(function() {promise.resolve(Math.random() * max);}, executionTime);
};

var ttlProducer = function(options) {
    /// If options < 100, cache TTL should be 1 min otherwise 1 hour
    if (options < 100) {
        return 60 * 1000;
    } else {
        return 60 * 60 * 1000;
    }
};

describe('Caching library', function() {
    it('Get from empty cache', function(done) {
        var cache = require('../src/ciks');
        var storage = require('../src/mongodb-ciks/mongodb.js');
        var options = 10;
        var d = defer();
        var p;

        sinon.stub(storage, 'clear');

        var populateSpy = sinon.spy(cache, "populate");

        var getStubCallsCount = 0;
        var getStubCallsParameters = [];

        sinon.stub(storage, 'get', function(alias, options, promise) {
            getStubCallsCount++;
            getStubCallsParameters.push([alias,options,promise]);
            promise.resolve(null);});

        var storeStubCallsCount = 0;
        var storeStubCallsParameters = [];

        sinon.stub(storage, 'store', function(alias, options, data, ttl) {
            storeStubCallsCount++;
            storeStubCallsParameters.push([alias,options,data,ttl]);
        });

        var producerSpy = sinon.spy(producer);

        cache.storage(storage);
        var alias = '#get.producer';
        cache.register(alias, producerSpy, ttlProducer);

        d.promise.then(function(data) {
            chai.assert.isTrue(data <= options, 'Checking returned value.');
            chai.assert.equal(getStubCallsCount, 1, 'Storage store function should be called ONCE!');
            chai.assert.equal(getStubCallsParameters[0][0], alias, 'Storage get should be called with defined alias');
            chai.assert.equal(getStubCallsParameters[0][1], options, 'Storage get should be called with defined options');

            //chai.assert.isTrue(producerSpy.called, 'Producer should be called.');
            chai.assert.equal(producerSpy.callCount, 1, 'Producer should be called ONCE!');

            //chai.assert.isTrue(populateSpy.called, 'Populate function should be called.');
            chai.assert.equal(populateSpy.callCount, 1, 'Populate function should be called ONCE!');

            chai.assert.equal(storeStubCallsCount, 1, 'Storage store function should be called ONCE!');

            chai.assert.equal(storeStubCallsParameters[0][0], alias, 'Alias should be the same when store a cache value');
            chai.assert.equal(storeStubCallsParameters[0][1], options, 'Options should be the same when store a cache value');
            chai.assert.equal(storeStubCallsParameters[0][2], data, 'Data should be the same when store a cache value');
            chai.assert.equal(storeStubCallsParameters[0][3], ttlProducer(options), 'TTL should be the same when store a cache value');

            done();
        }, function(error) {
            chai.assert.fail(null, null, error);
        });

        cache.get(alias, options, d);
    });
});