Routine
=======

A simple routing engine based on Backbone's routing engine.

This library does not listen for hash changes or history
updates. Instead, this library expects to be injected an
event emitter that emits a `change` event that includes
the new route. One such library is
[chronicler](https://github.com/kjbekkelund/chronicler),
which listens for `onhashchange`.

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
```

Installation
------------

```
npm install routine
```

