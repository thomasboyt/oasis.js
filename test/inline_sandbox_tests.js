import Oasis from "oasis";
import InlineAdapter from "oasis/inline_adapter";

module('Inline Sandboxes', {
  setup: function() {
    Oasis.reset();
  }
});

test("it exists", function() {
  ok(InlineAdapter, 'namespace is present');
});

function sandbox(something) {
  'use strict';

  return {};
}

test("can be created", function() {
  var sandbox = Oasis.createSandbox({
    url: 'fixtures/simple_value.js',
    adapter: InlineAdapter,
    capabilities: ['assertions'],
    services: {
      assertions: Oasis.Service
    }
  });

  ok(sandbox, 'expected sandbox to be created');
});

test("communication", function(){
  expect(1);
  stop();

  window.Oasis = requireModule('oasis');
  var PingPongService = Oasis.Service.extend({
    initialize: function(port, capability) {
      port.request('ping').then(function(data) {
        start();

        equal(data, 'pong', "promise was resolved with expected value");
      });
    }
  });

  var sandbox = Oasis.createSandbox({
    url: 'fixtures/simple_value.js',
    adapter: InlineAdapter,
    capabilities: ['pong'],
    services: {
      pong: PingPongService
    }
  });

  sandbox.start();
  // start the sandbox
  // container -> sanbox: message: "hello"
  // sanbox -> container: message: 'world'
});
