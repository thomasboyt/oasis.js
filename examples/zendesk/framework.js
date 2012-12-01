/*global App:true Handlebars I18n:true _ jQuery RSVP Oasis*/

I18n = {
  t: function(key, options) {
    var parts = key.split("."),
        value = App.strings;

    for (var i=0, l=parts.length; i<l; i++) {
      value = value[parts[i]];
    }

    var template = Handlebars.compile(value);
    return template(options);
  }
};

function App(ports) {
  var prop;

  for (prop in ports) {
    if (!this.hasOwnProperty(prop)) { continue; }
    this[prop] = ports[prop];
  }

  var events = this.events;

  for (prop in events) {
    if (!events.hasOwnProperty(prop)) { continue; }
    if (prop.indexOf(' ')) { delegate(this, prop, events[prop]); }
    else { addListener(this, prop, events[prop]); }
  }

  this.initialize.apply(this, arguments);
}

function delegate(app, prop, func) {
  var eventParts = prop.split(' '),
      eventName = eventParts[0],
      selector = eventParts[1];

  if (typeof func === 'string') {
    func = app[func];
  }

  func = _.bind(func, app);

  jQuery(selector).on(eventName, func);
}

function addListener(app, eventName, func) {
  if (typeof func === 'string') {
    func = app[func];
  }

  app.on(eventName, func, app);
}

App.define = function(literal) {
  for (var prop in literal) {
    if (!literal.hasOwnProperty(prop)) { continue; }
    App.prototype[prop] = literal[prop];
  }
};

RSVP.EventTarget.mixin(App.prototype);

App.prototype.notify = function(key, options) {
  this.zendesk.send('notify', { string: I18n.t(key, options) });
};

App.prototype.notifyError = function(key, options) {
  this.zendesk.send('notify', { string: I18n.t(key, options), error: true });
};

App.prototype.render = function(templateName, options) {
  var template = Handlebars.compile(App.templates[templateName]),
      html = template(options);

  jQuery('body').html(html);
};

// run this code after app.js has executed

Oasis.connect('ajax', 'zendesk').then(function(ports) {
  var app = new App(ports);
  ports.zendesk.on('activated', function(event) {
    app.ticket = event.detail.ticket;
    app.send('activate', event);
  });
});

