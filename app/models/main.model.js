(function() {
  var base = window.ringQuest;
  base.models.model = Seed.extend({
    trigger: function(event, params) {
      $(this).trigger(event, params)
    },
    on: function(event, method) {
      $(this).on(event, method);
    },
    translate: function(x) {
      var y = -(x*x) / 20 - 5 * x  - 255/4
      return y;
    },
    untranslate: function(x) {
      return  x * x /135 + 0.2222 * x -85
    }
  });
})()
