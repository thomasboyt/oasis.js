Oasis.connect('assertions').then(function(port) {
  var popup = window.open('fixtures/popup.html', 'popopopop'),
      popupOpened = !!popup;

  port.send('ok', popupOpened);
});
