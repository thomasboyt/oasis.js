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
  sandbox.start();

  ok(sandbox.el instanceof HTMLElement, 'has DOM element');
});

test("communication", function(){
  expect(1);
  stop();

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
});

test("2 sandboxes", function(){
  expect(3);

  var PingPongService1 = Oasis.Service.extend({
     name: 'pingpong1'
  });

  var PingPongService2 = Oasis.Service.extend({
     name: 'pingpong2'
  });

  var sandbox1 = Oasis.createSandbox({
    url: 'fixtures/simple_value.js',
    adapter: InlineAdapter,
    capabilities: ['pong'],
    services: {
      pong: PingPongService1
    }
  });

  var sandbox2 = Oasis.createSandbox({
    url: 'fixtures/simple_value_with_args.js',
    adapter: InlineAdapter,
    capabilities: ['pong'],
    services: {
      pong: PingPongService1
    }
  });

  stop();
  var RSVP = requireModule('rsvp');
  RSVP.all([sandbox1.waitForLoad(), sandbox2.waitForLoad()]).then(function (value) {
    start();
    stop();
    stop();

    var request1 = sandbox1.capabilities.pong.port.request('ping').then(function(data) {
      start();
      equal(data, 'pong', "promise was resolved with expected value");
    }, function (reason) {
      start();
      ok(false, reason);
    });

    // the second service requires arguments: 'first', 'second' or it
    // will return undefined;
    var request2 = sandbox2.capabilities.pong.port.request('ping').then(function(data) {
      start();
      equal(data, 'not-pong', "promise was resolved without data, as it did not provide the correct arugments");
    }, function (reason) {
      start();
      ok(false, reason);
    });

    var request3 = sandbox2.capabilities.pong.port.request('ping', 'first', 'second').then(function(data) {
      start();
      equal(data, 'pong', "promise was resolved without data, as it did not provide the correct arugments");
    }, function (reason) {
      start();
      ok(false, reason);
    });

    return RSVP.all([request1, request2, request3]);
  }, function (reason) {
    start();
    ok(false, reason);
  });

  sandbox1.start();
  sandbox2.start();
});
