var test = require('tape');
var routine = require('./');
var EventEmitter = require('events').EventEmitter;

var urlHandler = new EventEmitter();
var routes = routine(urlHandler);
routes.start();

test('empty route', function(t) {
    t.plan(1);

    routes.on("", function() {
        t.pass();
    });

    urlHandler.emit("change", "");
});

test('simple route', function(t) {
    t.plan(3);

    routes.on("counter", function() {
        t.pass();
    });

    urlHandler.emit("change", "counter");
    urlHandler.emit("change", "counter");
    urlHandler.emit("change", "counter");
});

test('simple query', function(t) {
    t.plan(1);

    routes.on("search/:query", function(query) {
        t.equal(query, "test");
    });

    urlHandler.emit("change", "search/test");
});

test('simple query with unicode', function(t) {
    t.plan(1);

    routes.on("new-search/:query", function(query) {
        t.equal(query, "тест");
    });

    urlHandler.emit("change", "new-search/тест");
});

test('route with two parts', function(t) {
    t.plan(2);

    routes.on("search/:query/p:page", function(query, page) {
        t.equal(query, "oslo");
        t.equal(page, "19");
    });

    urlHandler.emit("change", "search/oslo/p19");
});

test('route precedens', function(t) {
    t.plan(3);

    routes.on("contacts", once(function() {
        t.pass();
    }));
    routes.on("contacts/new", once(function() {
        t.pass();
    }));
    routes.on("contacts/:id", once(function(id) {
        t.equal(id, 'foo');
    }));

    urlHandler.emit("change", "contacts");
    urlHandler.emit("change", "contacts/new");
    urlHandler.emit("change", "contacts/foo");
});

test("route with splat", function(t) {
    t.plan(1);

    routes.on("splat/*args/end", function(args) {
        t.equal(args, "long-list/of/splatted_99args");
    });

    urlHandler.emit("change", "splat/long-list/of/splatted_99args/end");
});

test("github style route", function(t) {
    t.plan(3);

    routes.on(":repo/compare/*from...*to", function(repo, from, to) {
        t.equal(repo, "kjbekkelund");
        t.equal(from, "1.0");
        t.equal(to, "kjbekkelund:with/slash");
    });

    urlHandler.emit("change", "kjbekkelund/compare/1.0...kjbekkelund:with/slash");
});

test("route with optional part", function(t) {
    t.plan(2);

    routes.on("optional1(/:item)", function(arg) {
        t.equal(arg, null);
    });
    routes.on("optional2(/:item)", function(arg) {
        t.equal(arg, "kim");
    });

    urlHandler.emit("change", "optional1");
    urlHandler.emit("change", "optional2/kim");
});

test('complex route', function(t) {
    t.plan(3);

    routes.on("*first/complex-*part/*rest", function(first, part, rest) {
        t.equal(first, "one/two/three");
        t.equal(part, "part");
        t.equal(rest, "four/five/six/seven");
    });

    urlHandler.emit("change", "one/two/three/complex-part/four/five/six/seven");
});

test('route with query', function(t) {
    t.plan(2);

    routes.on("query/:entity", function(entity, queryParams) {
        t.equal(entity, "mandel");
        t.equal(queryParams, "a=b&c=d");
    });

    urlHandler.emit("change", "query/mandel?a=b&c=d");
});

test('route with utf8', function(t) {
    t.plan(2);

    routes.on("charñ", once(function() {
        t.pass();
    }));
    routes.on("char%C3%B1", once(function() {
        t.pass();
    }));

    urlHandler.emit("change", "charñ");
    urlHandler.emit("change", "char%C3%B1");
});

test('decode named parameters, not splats', function(t) {
    t.plan(2);

    routes.on("decode/:named/*splat", function(named, splat) {
        t.equal(named, "a/b");
        t.equal(splat, "c/d/e");
    });

    urlHandler.emit("change", "decode/a%2Fb/c%2Fd/e");
});

test('can stop routing', function(t) {
    t.plan(1);

    var urlHandler = new EventEmitter();
    var routes = routine(urlHandler);
    routes.start();

    routes.on("stop", function() {
        t.pass();
    });

    urlHandler.emit("change", "stop");

    routes.stop();

    urlHandler.emit("change", "stop");
});

test('route anything', function(t) {
    t.plan(1);

    routes.on("*anything", function(arg) {
        t.equal(arg, "doesnt-match-a-route");
    });

    urlHandler.emit("change", "doesnt-match-a-route");
});

function once(fn) {
    var done = false;

    return function() {
      if (done) return;
      done = true;
      fn.apply(this, arguments);
    }
}

