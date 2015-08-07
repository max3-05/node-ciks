var chai = require('chai');
var sinon = require('sinon');
var defer = require('node-promise').defer;
var ciks = require('../src/ciks').cache;
var mdbstorage = require('../src/mongodb-ciks/mongodb.js').storage;


var stubCalls = function(object, functionName, callback) {
    this.calls = 0;
    this.args = [];
    this.object = object;
    this.functionName = functionName;

    var self = this;

    sinon.stub(object, functionName, function() {
        self.calls++;
        self.args.push(arguments);
        callback.apply(this, arguments);
    });

    this.restore = function() {
        this.object[this.functionName].restore();
    };
};

var producer = function(max, promise) {
    var result = Math.random() * max;
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
        var cache = new ciks();
        var storage = new mdbstorage();
        cache.storage(storage);

        sinon.stub(storage, 'clear');

        var populateSpy = sinon.spy(cache, "populate");
        var producerSpy = sinon.spy(producer);

        var storageGetStub = new stubCalls(storage, 'get', function(alias, options, promise) {
            promise.resolve(null);
        });

        var storageStoreStub = new stubCalls(storage, 'store', function(alias, options, data, ttl) {});


        var alias = '#get.producer';
        cache.register(alias, producerSpy, ttlProducer);

        var options = 10;
        var d = defer();

        d.promise.then(function(data) {
            chai.assert.isTrue(data <= options, 'Checking returned value.');
            chai.assert.equal(storageGetStub.calls, 1, 'Storage store function should be called ONCE!');
            chai.assert.equal(storageGetStub.args[0][0], alias, 'Storage get should be called with defined alias');
            chai.assert.equal(storageGetStub.args[0][1], options, 'Storage get should be called with defined options');

            //chai.assert.isTrue(producerSpy.called, 'Producer should be called.');
            chai.assert.equal(producerSpy.callCount, 1, 'Producer should be called ONCE!');

            //chai.assert.isTrue(populateSpy.called, 'Populate function should be called.');
            chai.assert.equal(populateSpy.callCount, 1, 'Populate function should be called ONCE!');

            chai.assert.equal(storageStoreStub.calls, 1, 'Storage store function should be called ONCE!');

            chai.assert.equal(storageStoreStub.args[0][0], alias, 'Alias should be the same when store a cache value');
            chai.assert.equal(storageStoreStub.args[0][1], options, 'Options should be the same when store a cache value');
            chai.assert.equal(storageStoreStub.args[0][2], data, 'Data should be the same when store a cache value');
            chai.assert.equal(storageStoreStub.args[0][3], ttlProducer(options), 'TTL should be the same when store a cache value');

            storageGetStub.restore();
            storageStoreStub.restore();
            populateSpy.restore();

            done();
        }, function(error) {
            chai.assert.fail(null, null, error);
        });

        cache.get(alias, options, d);
    });

    it('Get from populated cache', function(done) {
        var cache = new ciks();
        var storage = new mdbstorage();
        var created_at = new Date();

        var storageCachedValue = {
            created_at: created_at,
            expired_in: new Date(created_at.getTime() + (60 * 1000)),
            options: 10,
            data: 5
        };

        cache.storage(storage);

        sinon.stub(storage, 'clear');

        var populateSpy = sinon.spy(cache, "populate");
        var producerSpy = sinon.spy(producer);

        var storageGetStub = new stubCalls(storage, 'get', function(alias, options, promise) {
            promise.resolve(storageCachedValue);
        });

        var storageStoreStub = new stubCalls(storage, 'store', function(alias, options, data, ttl) {});


        var alias = '#get.producer';
        cache.register(alias, producerSpy, ttlProducer);

        var options = 10;
        var d = defer();

        d.promise.then(function(data) {
            chai.assert.equal(data, storageCachedValue.data, 'Checking returned value.');
            chai.assert.equal(storageGetStub.calls, 1, 'Storage store function should be called ONCE!');
            chai.assert.equal(storageGetStub.args[0][0], alias, 'Storage get should be called with defined alias');
            chai.assert.equal(storageGetStub.args[0][1], options, 'Storage get should be called with defined options');

            //chai.assert.isTrue(producerSpy.called, 'Producer should be called.');
            chai.assert.equal(producerSpy.callCount, 0, 'Producer should be called ONCE!');

            //chai.assert.isTrue(populateSpy.called, 'Populate function should be called.');
            chai.assert.equal(populateSpy.callCount, 0, 'Populate function should be called ONCE!');

            chai.assert.equal(storageStoreStub.calls, 0, 'Storage store function should be called ONCE!');

            storageGetStub.restore();
            storageStoreStub.restore();
            populateSpy.restore();

            done();
        }, function(error) {
            chai.assert.fail(null, null, error);
        });

        cache.get(alias, options, d);
    });
    it('Concurrent cache population', function(done) {
        done();
    });
});