(function() {
  var base = window.ringQuest;

  base.controllers.log = base.controllers.controller.extend({
    template: 'nil',
    initialize: function(options) {
      var dfd = $.Deferred();
      this.ready = dfd.promise();
      var self = this;
      this.element = options.element;
      this.templateDirector = options.templateDirector;
      $.when(this.templateDirector.get('log')).done(function(res, res2) {
        self.logTemplate = self.templateDirector.getSubtemplate('log', 'logTemplate');
        self.entryTemplate = self.templateDirector.getSubtemplate('log', 'logEntry');
        dfd.resolve();
      })
    },
    render: function() {
      this.element.html(this.logTemplate);
      this.logElement = this.element.find('.log');
    },
    log: function(text) {
      this.logElement.prepend(_.template(this.entryTemplate, {entryClass:'', entryText: text}))
    }

  });
})();
