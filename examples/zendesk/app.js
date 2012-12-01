/*global App _*/

App.define({
  events: {
    'click .bookmark': 'addBookmark',
    activated: 'requestBookmarks'
  },

  // On initial activation, or when a bookmark has been successfully
  // added, refresh the bookmarks
  requestBookmarks: function() {
    var request = this.ajax.request('GET', {
      url: '/api/v1/bookmarks.json'
    });

    // When the host app returns a bookmarks.json, re-render the
    // bookmarks into the list
    request.success(this.renderBookmarks, this);
  },

  renderBookmarks: function(data) {
    var bookmarks = data.bookmarks;
    var isBookmarkable = this.ticketIsBookmarkable(bookmarks);

    // Insert the `list` template into the current layout
    this.render('list', { bookmarks: bookmarks, isBookmarkable: isBookmarkable });
  },

  // When the bookmark button is clicked, add the current ticket
  // to the list of bookmarks. When done, always refresh the current
  // list of bookmarks.
  addBookmark: function() {
    var request = this.ajax.request('POST', {
      url: '/api/v1/bookmarks.json',
      data: { ticket_id: this.ticket.id }
    });

    // If the bookmarking is successful, notify the user of the
    // success through the host.
    request.success(function() {
      this.notify('add.done', { id: this.ticket.id });
    }, this);

    // If the bookmarking fails, notify the user of the failure
    // through the host.
    request.failure(function() {
      this.notifyError('add.failed', { id: this.ticket.id });
    }, this);

    // Whether the request succeeds or fails, refresh the bookmarks.
    request.always(this.requestBookmarks, this);
  },

  // helper method
  //
  // For a given list of bookmarks returned from the server, is
  // current ticket bookmarkable.
  //
  // A ticket is bookmarkable when it is not closed and it is
  // not already in the bookmarks list.
  ticketIsBookmarkable: function(bookmarks) {
    var status = this.ticket.status;
    if (status === 'closed') { return false; }

    var ticketId = this.ticket.id;

    return _.all(bookmarks, function(bookmark) {
      return bookmark.ticket.niceId !== ticketId;
    });
  }
});

