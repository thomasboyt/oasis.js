var AssertionsConsumer = Oasis.Consumer.extend({
  initialize: function() {
    Oasis.consumers.assertions.send('ok');
  }
});

oasis.connect({
  consumers: {
    assertions: AssertionsConsumer
  }
});
