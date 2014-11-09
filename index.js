var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

module.exports = function(history) {
    var handlers = [];

    history && start();

    return {
        on: on,
        goTo: goTo,
        start: start,
        stop: stop
    };

    function on(route, cb) {
        if (!isRegExp(route)) {
            route = routeToRegExp(route);
        }
        handlers.push({
            route: route,
            callback: callWithParams(route, cb)
        });
    }

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

