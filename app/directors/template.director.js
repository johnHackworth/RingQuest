(function() {
  var base = window.ringQuest;
  base.directors.template = Seed.extend({
    basePath: '/app/views/',
    templates: {},
    initialize: function() {
      this.getSubtemplate = this.getSubtemplate.bind(this);
    },
    get: function(template, id) {
      var dfd = $.Deferred();
      var self = this;
      if(this.templates.template) {
        dfd.resolve(self.getSubtemplate(template, id));
      } else {
        $.ajax({
          url: this.basePath + template + '.html',
          success: function(res) {
            self.templates[template] = res;
            dfd.resolve(self.getSubtemplate(template, id));
          }
        })
      }

      return dfd.promise();
    },
    getSubtemplate: function(template, id) {
      if(!id) {
        return this.templates[template];
      } else {
        var domTemplate = $(this.templates[template]);
        var element = domTemplate.find('#'+id);
        if(element.length) {
          return element.html();
        } else {
          return '';
        }
      }
    }
  });
})()
