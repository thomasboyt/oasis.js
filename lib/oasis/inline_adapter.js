/*global self, postMessage, importScripts */

import RSVP from "rsvp";
import Logger from "oasis/logger";
import { assert, extend } from "oasis/util";
import { configuration } from "oasis/config";
import { a_forEach } from "oasis/shims";

import {  PostMessageMessageChannel } from 'oasis/message_channel';
import BaseAdapter from "oasis/base_adapter";

var sessionId = 0;

function InlineSandbox(options) {
  // assert a port
  this.port = options.port;

  this._portsProvidedDefered = RSVP.defer();
}

InlineSandbox.prototype = {
  waitForPorts: function(){
    return this._portsProvidedDefered.promise;
  },
  port: undefined,
  _portsProvidedDefered: undefined,
  portsWhereProvided: function() {
    this._portsProvidedDefered.resolve(this);
  }
};

function fetchRuntime(url) {
  return RSVP.Promise(function(resolve, reject){
    // TOOD: i don't think oasis has a jQuery dep
    $.ajax(url, {
      dataType: 'text',
      success: function(data){
        var script = '"use strict";' + data;

        resolve(new Function("Oasis", script));
      }, 
      error: function(jqxhr, status, error) {
        jqxhr.then = undefined;
        reject(error || jqxhr);
      }
    });
  });
}

var InlineAdapter = extend(BaseAdapter, {
  //-------------------------------------------------------------------------
  // Environment API

  initializeSandbox: function(sandbox) {
    var oasisURL = this.oasisURL(sandbox);

    var channel = new PostMessageMessageChannel();

    this.port = channel.port2;

    sandbox.sandbox = new InlineSandbox({
      port: channel.port1
    });
    sandbox.sessionId = sessionId;
    sessionId++;

    // phase 2: everything is ready external things to interact with the
    // sandbox
    sandbox._waitForLoadDeferral().resolve(sandbox.sandbox.waitForPorts());

    // phase 1: the runtime is ready.
    return loadRuntime();

    function appendRuntimeToSandbox(runtime) {
      Logger.log("inline sandbox initialized");
      // invoke the runtime..

      var Oasis = requireModule('oasis', sandbox.sessionId);
      Oasis.sessionId = sandbox.sessionId; // debugging/sanity
      runtime(Oasis);
      return sandbox;
    }

    function loadRuntime() {
      return new RSVP.Promise(function(resolve, reject) {
        resolve(fetchRuntime(sandbox.options.url).then(appendRuntimeToSandbox));
      });
    }
  },
 
  startSandbox: function(sandbox) { },

  terminateSandbox: function(sandbox) {
    var rootElement = sandbox.rootElement;
    // cleanup?
  },
  oasisLoaded: function() {
  },

  connectPorts: function(sandbox, ports) {
    var rawPorts = ports.map(function(port) { return port.port; }),
        message = this.createInitializationMessage(sandbox);

    // should really be called from within 'sessionId' subgraph
    var connectCapabilities = requireModule("oasis/connect", sandbox.sessionId).connectCapabilities;

    connectCapabilities(message.capabilities, rawPorts);
    sandbox.sandbox.portsWhereProvided();
  },

  connectSandbox: function(ports) {
    return BaseAdapter.prototype.connectSandbox.call(this, self, ports);
  },

  //-------------------------------------------------------------------------
  // Sandbox API

  loadScripts: function (base, scriptURLs) {
    var hrefs = [];
    a_forEach.call(scriptURLs, function (scriptURL) {
      hrefs.push( base + scriptURL );
    });

    importScripts.apply(undefined, hrefs);
  }
});

var inlineAdapter = new InlineAdapter();

export default inlineAdapter;
