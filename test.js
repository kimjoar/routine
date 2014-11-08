var test = require('tape');
var routine = require('./');
var EventEmitter = require('events').EventEmitter;

var history = new EventEmitter();
var routes = routine(history);
routes.start();

test('empty route', function(t) {
    t.plan(1);

    routes.on("", function() {
        t.pass();
    });

    history.emit("change", "");
});

test('simple route', function(t) {
    t.plan(2);

    routes.on("counter", function() {
        t.pass();
    });

    history.emit("change", "counter");
    history.emit("change", "counter");
});

test('only call first handler for matching route', function(t) {
    t.plan(1);

    routes.on("route", function() {
        t.pass();
    });
    routes.on("route", function() {
        t.fail();
    });

    history.emit("change", "route");
});

test('simple route with slash', function(t) {
    t.plan(1);

    routes.on("/slash", function() {
        t.pass();
    });
    routes.on("slash", function() {
        t.fail();
    });

    history.emit("change", "/slash");
});

test('simple query', function(t) {
    t.plan(1);

    routes.on("search/:query", function(query) {
        t.equal(query, "test");
    });

    history.emit("change", "search/test");
});

test('simple query with unicode', function(t) {
    t.plan(1);

    routes.on("new-search/:query", function(query) {
        t.equal(query, "тест");
    });

    history.emit("change", "new-search/тест");
});

test('route with two parts', function(t) {
    t.plan(2);

    routes.on("search/:query/p:page", function(query, page) {
        t.equal(query, "oslo");
        t.equal(page, "19");
    });

    history.emit("change", "search/oslo/p19");
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

    history.emit("change", "contacts");
    history.emit("change", "contacts/new");
    history.emit("change", "contacts/foo");
});

test("route with splat", function(t) {
    t.plan(1);

    routes.on("splat/*args/end", function(args) {
        t.equal(args, "long-list/of/splatted_99args");
    });

    history.emit("change", "splat/long-list/of/splatted_99args/end");
});

test("github style route", function(t) {
    t.plan(3);

    routes.on(":repo/compare/*from...*to", function(repo, from, to) {
        t.equal(repo, "kjbekkelund");
        t.equal(from, "1.0");
        t.equal(to, "kjbekkelund:with/slash");
    });

    history.emit("change", "kjbekkelund/compare/1.0...kjbekkelund:with/slash");
});

test("route with optional part", function(t) {
    t.plan(2);

    routes.on("optional1(/:item)", function(arg) {
        t.equal(arg, null);
    });
    routes.on("optional2(/:item)", function(arg) {
        t.equal(arg, "kim");
    });

    history.emit("change", "optional1");
    history.emit("change", "optional2/kim");
});

test('complex route', function(t) {
    t.plan(3);

    routes.on("*first/complex-*part/*rest", function(first, part, rest) {
        t.equal(first, "one/two/three");
        t.equal(part, "part");
        t.equal(rest, "four/five/six/seven");
    });

    history.emit("change", "one/two/three/complex-part/four/five/six/seven");
});

test('route with query', function(t) {
    t.plan(2);

    routes.on("query/:entity", function(entity, queryParams) {
        t.equal(entity, "mandel");
        t.equal(queryParams, "a=b&c=d");
    });

    history.emit("change", "query/mandel?a=b&c=d");
});

test('route with utf8', function(t) {
    t.plan(2);

    routes.on("charñ", once(function() {
        t.pass();
    }));
    routes.on("char%C3%B1", once(function() {
        t.pass();
    }));

    history.emit("change", "charñ");
    history.emit("change", "char%C3%B1");
});

test('decode named parameters, not splats', function(t) {
    t.plan(2);

    routes.on("decode/:named/*splat", function(named, splat) {
        t.equal(named, "a/b");
        t.equal(splat, "c/d/e");
    });

    history.emit("change", "decode/a%2Fb/c%2Fd/e");
});

test('regexp route', function(t) {
    t.plan(1);

    routes.on(/regexp$/, function() {
        t.pass();
    });

    history.emit("change", "ends/with/regexp");
});

test('route anything', function(t) {
    t.plan(1);

    var history = new EventEmitter();
    var routes = routine(history);
    routes.start();

    routes.on("*anything", function(arg) {
        t.equal(arg, "doesnt-match-a-route");
    });

    history.emit("change", "doesnt-match-a-route");
});

test('can stop routing', function(t) {
    t.plan(1);

    var history = new EventEmitter();
    var routes = routine(history);
    routes.start();

    routes.on("stop", function() {
        t.pass();
    });

    history.emit("change", "stop");

    routes.stop();

    history.emit("change", "stop");
});

function once(fn) {
    var done = false;

    return function() {
      if (done) return;
      done = true;
      fn.apply(this, arguments);
    }
}

