import RSVP from "rsvp";
import logger from "oasis/logger";
import Version from "oasis/version";
import { assert } from "oasis/util";
import state from "oasis/state";
import { configuration, configure } from "oasis/config";
import Sandbox from "oasis/sandbox";
import initializeSandbox from "oasis/sandbox_init";

import Service from "oasis/service";
import { registerHandler, connect, portFor } from "oasis/connect";

import iframeAdapter from "oasis/iframe_adapter";
import webworkerAdapter from "oasis/webworker_adapter";
import InlineAdapter from "oasis/inline_adapter";


function Oasis() {
  initializeSandbox();
}

Oasis.Version = Version;
Oasis.Service = Oasis.Consumer = Service;
Oasis.RSVP = RSVP;
Oasis.adapters = {
  iframe: iframeAdapter,
  webworker: webworkerAdapter,
  inline: InlineAdapter
};

Oasis.prototype = {
  logger: logger,
  log: function () {
    this.logger.log.apply(this.logger, arguments);
  },

  /**
    This is the entry point that allows the containing environment to create a
    child sandbox.

    Options:

    * `capabilities`: an array of registered services
    * `url`: a registered URL to a JavaScript file that will initialize the
      sandbox in the sandboxed environment
    * `adapter`: a reference to an adapter that will handle the lifecycle
      of the sandbox. Right now, there are iframe and web worker adapters.

    @param {Object} options
  */
  createSandbox: function (options) {
    return new Sandbox(options);
  },

  /**
    This registers a sandbox type inside of the containing environment so that
    it can be referenced by URL in `createSandbox`.

    Options:

    * `capabilities`: An array of service names that will be supplied when calling
      `createSandbox`
    * `url`: The URL of the JavaScript file that contains the sandbox code

    @param {Object} options
  */
  register: function (options) {
    assert(options.capabilities, "You are trying to register a package without any capabilities. Please provide a list of requested capabilities, or an empty array ([]).");

    packages[options.url] = options;
  },

  configure: configure,

  // TODO: move all of reset to constructor
  //        and all of state for that matter
  reset: function () {
    state.reset();
    packages = state.packages;
    Oasis.consumers = state.consumers;
  },

  // TODO: move handlers to constructor
  registerHandler: registerHandler,
  connect: connect,
  portFor: portFor,

  config: configuration
};

var packages = state.packages;


export default Oasis;
