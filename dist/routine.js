!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.routine=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

module.exports = function(history) {
    var handlers = [];

    history && start();

    return {
        on: function(route, cb) {
            if (!isRegExp(route)) {
                route = routeToRegExp(route);
            }
            handlers.push({
                route: route,
                callback: callWithParams(route, cb)
            });
        },
        goTo: goTo,
        start: start,
        stop: stop
    };

    function goTo(url) {
        handlers.some(function(handler) {
            if (handler.route.test(url)) {
                handler.callback(url);
                return true;
            }
        });
    }

    function start() {
        history.on('change', goTo);
    }
    function stop() {
        history.removeListener('change', goTo);
    }
};

function isRegExp(obj) {
    return obj instanceof RegExp;
}

function callWithParams(route, cb) {
    return function(url) {
        var args = extractParameters(route, url);
        cb.apply(null, args);
    }
}

function routeToRegExp(route) {
    route = route.replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, function(match, optional) {
            return optional ? match : '([^/?]+)';
        })
        .replace(splatParam, '([^?]*?)');

    return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
}

function extractParameters(route, url) {
    var params = route.exec(url).slice(1);

    return params.map(function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;

        return param
            ? decodeURIComponent(param)
            : null;
    });
}


},{}]},{},[1])(1)
});
