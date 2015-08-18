var chai = require('chai');
var sinon = require('sinon');
var defer = require('node-promise').defer;
var mstorage = require('../src/memory-ciks/memory.js').storage;

describe('Cache in-memory storage tests', function() {
    it('Store document value', function(done) {
        var storage = new mstorage();
        storage.init();

        var alias = 'test.producer';
        var options = {"method": 'GET', "url": "http://develab.me"};
        var data = "Some data to store";
        var ttl  = 1000;

        storage.store(alias, options, data, ttl);

        chai.assert.equal(Object.keys(storage.dbcache).length, 1, 'Storage should contain only one alias');
        chai.assert.equal(storage.dbcache[alias].length, 1, 'Storage should contain only one value');



        var document = storage.dbcache[alias][0];

        chai.assert.equal(document.expired_in, ttl, 'Stored value TTL should be equal');
        chai.assert.equal(document.options, options, 'Stored value options should be equal');
        chai.assert.equal(document.data, data, 'Stored value data should be equal');

        done();
    });

    it('Get value that is not cached yet', function(done) {
        var storage = new mstorage();
        storage.init();

        var alias = 'test.producer';
        var options = {"method": 'GET', "url": "http://develab.me"};

        var promise = defer();
        promise.then(function(data) {
                chai.assert.isTrue(data == null, 'Data should be undefined unless stored.');
                done();
            },
            function(err) {chai.assert.fail(err); done();}
        );
        storage.get(alias, options, promise);
    });

    it('Get cached value from storage', function(done) {
        var storage = new mstorage();
        storage.init();

        var alias = 'test.producer';
        var options = {"method": 'GET', "url": "http://develab.me"};
        var data = "Some data to store";
        var ttl  = 10000;

        storage.store(alias, options, data, ttl);

        var promise = defer();
        promise.then(function(document) {
                chai.assert.equal(document.expired_in, ttl, 'Stored value TTL should be equal');
                chai.assert.equal(document.options, options, 'Stored value options should be equal');
                chai.assert.equal(document.data, data, 'Stored value data should be equal');
                done();
            },
            function(err) {chai.assert.fail(err); done();}
        );
        storage.get(alias, options, promise);
    });

    it('Check clear function', function(done) {

        var storage = new mstorage();
        storage.init();

        var valid = {};

        for (var i = 0; i < 10; i++) {
            var alias = 'test.producer' + i;
            valid[alias] = [];

            for (var p = 0; p < 10; p++) {
                var rnd = Math.random() - 0.5;

                var document = {
                    alias: 'test.producer' + i,
                    options: {"method": 'GET', "url": "http://develab.me", iteration: i},
                    data: "Some data to store"
                };

                if (rnd > 0) {
                    document.ttl = 100000;
                    valid[alias].push(document);
                } else {
                    document.ttl = -100000;
                }

                storage.store(document.alias, document.options, document.data, document.ttl);
            }
        }

        storage.clear();

        for (var alias in valid) {
            chai.assert.equal(storage.dbcache[alias].length, valid[alias].length, 'Checking values count after cleaning.');
            valid[alias].sort(function(a,b) { return (a.expired_in - b.expired_in); });

            for (var i = 0; i < valid[alias].length; i++) {
                var document = storage.dbcache[alias][i];

                chai.assert.equal(document.expired_in, valid[alias][i].ttl, 'Stored value TTL should be equal');
                chai.assert.equal(document.options, valid[alias][i].options, 'Stored value options should be equal');
                chai.assert.equal(document.data, valid[alias][i].data, 'Stored value data should be equal');            }
        }

        done();
    });
});
