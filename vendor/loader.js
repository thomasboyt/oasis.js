if (typeof define !== 'function' && typeof requireModule !== 'function') {
  var define, requireModule;

  (function() {
    var registry = {}, seen = {};

    define = function(name, deps, callback) {
      registry[name] = { deps: deps, callback: callback };
    };

    requireModule = function(name, sessionId) {
      var sessionId = sessionId === undefined ? 'global' : sessionId;
      var key = sessionId.toString() + '|' + name;
      if (seen[key]) { return seen[key]; }

      var mod = registry[name];

      if (!mod) {
        throw new Error("Module: '" + name + "' not found.");
      }

      var deps = mod.deps,
          callback = mod.callback,
          reified = [],
          exports;

      for (var i=0, l=deps.length; i<l; i++) {
        if (deps[i] === 'exports') {
          reified.push(exports = {});
        } else {
          reified.push(requireModule(deps[i], sessionId));
        }
      }

      var value = callback.apply(this, reified);

      return seen[key] = exports || value;
    };

    define.registry = registry;
    define.seen = seen;
  })();
}
