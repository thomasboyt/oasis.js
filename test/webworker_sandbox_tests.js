import Oasis from "oasis";
import webworkerAdapter from "oasis/webworker_adapter";

module('Webworker Sandboxes', {
  setup: function() {
    oasis.reset();
  }
});

test("throws an error if the sandbox type is html", function() {
  raises(function() {
    oasis.createSandbox({
      url: "fixtures/html_sandbox.html",
      type: 'html',
      adapter: webworkerAdapter,
      capabilities: ['assertions'],
      services: {
        assertions: Oasis.Service
      }
    });
  }, Error, "Creating a sandbox with type: html but adapter: webworker fails.");
});
