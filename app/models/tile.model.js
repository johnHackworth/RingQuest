(function() {
  var base = window.ringQuest;

  base.models.tile = base.models.model.extend({
    type: -1,
    /*
    0: sea
    1: plains
    2: hills
    3: marshes
    4: forest
    5: mountains
    6: river
    7: mountain pass
     */
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
    },
    getBaseSpeed: function() {
      var speeds= {
        0: 0,
        1: 3,
        2: 2,
        3: 1,
        4: 1,
        6: 0,
        7: 0
      }
      var speed = speeds[this.type] || 0;
      return speed;
    }
  });
})()
