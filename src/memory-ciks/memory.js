exports.storage = function() {
    this.dbcache = {};

    this.init = function () {
        this.dbcache = {};
    };

    this.store = function (alias, options, data, ttl) {
        this.dbcache[alias] = this.dbcache[alias] || [];
        var created_at = new Date();
        var document = {
            created_at: created_at,
            expired_in: ttl,
            options: options,
            data: data
        };

        this.dbcache[alias].push(document);
        this.dbcache[alias].sort(function(a,b) { return (a.expired_in - b.expired_in); });
    };

    this.get = function (alias, options, promise) {
        var value = [];

        if (this.dbcache[alias]) {
            value = this.dbcache[alias].filter(function(element) {
                return (element.options == options);
            });
        }

        promise.resolve(value[0]);
    };

    this.clear = function () {
        var date = new Date();

        for(var alias in this.dbcache) {
            this.dbcache[alias] = this.dbcache[alias].filter(function(element) {
                return (element.expired_in > date.getTime() - element.created_at.getTime());
            });
        }
    };
};