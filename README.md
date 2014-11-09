Routine
=======

A simple routing engine based on Backbone's routing engine.

```javascript
var routes = routine();

routes.on("", function() {
    console.log("root");
});

// A :param matches a single URL component between slashes
routes.on("search/:query", function(query) {
    // e.g. search/test
    console.log("searching", query);
});
```

This library does not listen for hash changes or history updates. You can
either invoke the engine on your own, e.g. on hash change:

```javascript
window.addEventListener("hashchange", function() {
    var match = window.location.href.match(/#(.*)$/);
    var hash = match ? match[1] : '';

    // invoke the matching route
    routes.goTo(hash);
});
```

Or, better, inject an event emitter that abstracts listening to url changes.
One such library is [chronicler](https://github.com/kjbekkelund/chronicler),
which emits `change` events when the url changes.

```javascript
var history = chronicler();
var routes = routine(history);
```

Example
-------

```javascript
var history = chronicler();
var routes = routine(history);

routes.on("", function() {
    console.log("root");
});

// A :param matches a single URL component between slashes
routes.on("search/:query", function(query) {
    // e.g. search/test
    console.log("searching", query);
});

routes.on("search/:query/p:page", function(query, page) {
    // e.g. search/test/p2
});

// Part of a route can be made optional by surrounding
// it in parentheses (/:optional)
routes.on("search/:query(/p:page)", function(query, page) {
    // e.g. both search/test and search/test/p2
});

// Splats (*splat) can match any number of URL
// components.
routes.on(":repo/compare/*from...*to", function(repo, from, to) {
    // e.g. kjbekkelund/compare/1.0...kjbekkelund:with/slash
});

// Route can be a regexp
routes.on(/regexp$/, function() {
    // e.g. ends/with/regexp
});

// At some point if we want to stop matching routes:
routes.stop();

// We can also start listening again:
routes.start();

// Invoke a matching route
routes.goTo("some/route");
```

Installation
------------

```
npm install routine
```

Or download from `dist` folder.
