(function() {
  var base = window.ringQuest;

  base.controllers.sheet = base.controllers.controller.extend({

    template: 'nil',
    actions: [],
    initialize: function(options) {
      var dfd = $.Deferred();
      this.ready = dfd.promise();

      var self = this;
      this.element = options.element;
      this.model = options.model;
      this.templateDirector = options.templateDirector;
      $.when(this.templateDirector.get('sheet')).done(function(res, res2) {
        self.frameTemplate = self.templateDirector.getSubtemplate('sheet', 'frame');
        self.buttonTemplate = self.templateDirector.getSubtemplate('sheet', 'button');
        dfd.resolve();
      })
      this.element.on('click', 'a.close', this.close.bind(this));
    },

    render: function(model) {
      this.model = model;
      this.element.html(_.template(this.frameTemplate, this.model));
      this.element.fadeIn();
    },
    close: function() {
      this.trigger('dialogClose');
      this.element.fadeOut();
    }
  });
})();
