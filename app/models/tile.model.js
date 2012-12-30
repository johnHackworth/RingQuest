(function() {
  var base = window.ringQuest;

  base.models.tile = base.models.model.extend({
    initialize: function(options) {
      this.name = options.name;
      this.type = options.type;
      this.x = options.x;
      this.y = options.y;
      this.stepX = options.stepX;
      this.stepY = options.stepY;
      this.baseX = options.baseX;
      this.baseY = options.baseY;
    },
    getLatLng: function() {
      var lng = (this.x * this.stepX ) + this.baseX;
      var lat = this.baseY + (this.y * this.stepY );
      return {'lat': lat, 'lng': lng};
    }
  });
})()
