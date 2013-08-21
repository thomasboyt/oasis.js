/*global self, postMessage, importScripts */

import RSVP from "rsvp";
import Logger from "oasis/logger";
import { assert, extend } from "oasis/util";
import { configuration } from "oasis/config";
import { a_forEach } from "oasis/shims";

import {  PostMessageMessageChannel } from 'oasis/message_channel';
import BaseAdapter from "oasis/base_adapter";

function InlineSandbox(options) {
  // assert a port
  this.port = options.port;
}

InlineSandbox.prototype = {
  port: undefined
};

function fetchRuntime(url) {
  return RSVP.Promise(function(resolve, reject){
    // TOOD: i don't think oasis has a jQuery dep
    $.ajax(url, {
      dataType: 'text',
      success: function(data){
        var script = '"use strict";' + data;
        resolve(new Function(script));
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

    // phase 2: everything is ready external things to interact with the
    // sandbox
    sandbox._waitForLoadDeferral().resolve(this.waitForPorts());

    // phase 1: the runtime is ready.
    return loadRuntime();

    function appendRuntimeToSandbox(runtime) {
      Logger.log("inline sandbox initialized");
      // invoke the runtime..
      runtime();
      return sandbox;
    }

    function loadRuntime() {
      return new RSVP.Promise(function(resolve, reject) {
        resolve(fetchRuntime(sandbox.options.url).then(appendRuntimeToSandbox));
      });
    }
  },

  waitForPorts: function(){
    var deferred = RSVP.defer();

    this.deferUntilPortsConnected = deferred;

    return deferred.promise;
  },

  startSandbox: function(sandbox) { },

  terminateSandbox: function(sandbox) {
    var rootElement = sandbox.rootElement;
    // cleanup?
  },

  connectPorts: function(sandbox, ports) {
    var rawPorts = ports.map(function(port) { return port.port; }),
        message = this.createInitializationMessage(sandbox);

    // this.runtime.connectPorts(ports);
    // where put rawPorts
    this.deferUntilPortsConnected.resolve(sandbox);
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
