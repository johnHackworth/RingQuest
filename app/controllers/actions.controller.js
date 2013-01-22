(function() {
  var base = window.ringQuest;

  base.controllers.actions = base.controllers.controller.extend({

    template: 'nil',
    actions: [],
    initialize: function(options) {
      var dfd = $.Deferred();
      this.ready = dfd.promise();

      var self = this;
      this.element = options.element;
      this.templateDirector = options.templateDirector;
      this.characterSheet = options.characterSheet;
      $.when(this.templateDirector.get('actions')).done(function(res, res2) {
        self.frameTemplate = self.templateDirector.getSubtemplate('actions', 'frame');
        self.buttonTemplate = self.templateDirector.getSubtemplate('actions', 'button');
        dfd.resolve();
      })
      this.actions = [];
      this.element.on('click', 'a.talk', this.talk.bind(this));
      this.element.on('click', 'a.examine', this.examine.bind(this));
    },
    render: function() {
      this.element.html(this.frameTemplate);

    },
    cleanButtons: function() {
      this.actions = [];
    },
    refreshButtons: function() {
      var container = this.element.find('.actionsDialog');
      container.html('');
      for(var n in this.actions) {
        container.append(_.template(this.buttonTemplate, this.actions[n]));
      }
    },
    addAction: function(action, character) {
      this.actions.push({'action': action, 'char': character})
    },

    talk: function(ev) {
      var character = $(ev.currentTarget).data('character')
      this.trigger('talkCharacter', character)
    },

    examine: function(ev) {
      var character = $(ev.currentTarget).data('character')
      this.trigger('examineCharacter', character);
    }
  });
})();
