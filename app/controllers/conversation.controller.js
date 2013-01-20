(function() {
  var base = window.ringQuest;

  base.controllers.conversation = base.controllers.controller.extend({

    template: 'nil',
    initialize: function(options) {
      var dfd = $.Deferred();
      this.ready = dfd.promise();

      var self = this;
      this.element = options.element;
      this.templateDirector = options.templateDirector;
      $.when(this.templateDirector.get('conversation')).done(function(res, res2) {
        self.frameTemplate = self.templateDirector.getSubtemplate('conversation', 'frame');
        self.buttonsTemplate = self.templateDirector.getSubtemplate('conversation', 'buttons');
        self.optionsTemplate = self.templateDirector.getSubtemplate('conversation', 'options');
        dfd.resolve();
      });

      this.element.on('click', 'a.join', this.join.bind(this));
      this.element.on('click', 'a.close', this.close.bind(this));
    },
    render: function() {
      this.element.html(this.frameTemplate);
      this.paintButtons();
      this.element.fadeIn();
    },
    paintButtons: function() {
      this.element.find('.buttons').html(this.buttonsTemplate);

    },
    talkWith: function(char) {
      this.interlocutor = char;
      this.render();
      this.element.find('.options').html(_.template(this.optionsTemplate, {char: char}));
    },
    join: function() {
      this.trigger('joinParty', this.interlocutor);
      this.close();
    },
    close: function() {
      this.trigger('conversationClose');
      this.element.fadeOut();
    }
  })
})();
