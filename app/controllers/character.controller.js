(function() {
  var base = window.ringQuest;

  base.controllers.character = base.controllers.controller.extend({
    _TRANSITION_SPEED: 500,
    radio: 10,
    lat: -60,
    lng: -98,
    color: '#FFF',
    color2: '#000',
    type: 'char',
    path: [],
    initialize: function(options) {
      var self = this;
      this.model = options.model
      this.map = options.map
    },
    addToMap: function() {
      this.view = this.createCircle();
      this.view.attr('fill',self.color)
            .attr('stroke',self.color2)
            .attr('class',self.type)
            .attr('name', this.model.name)
      this.view.update();
    },
    moveTo: function(latLng) {
      this.view.data([latLng]);
      this.view.move();
    },
    playerControlled: function() {
      this.map.map.on('click', this.moveToClick.bind(this));
    },
    moveToClick: function(ev) {
      // var latlng = ev.latlng;
      // this.moveTo(latlng);
      var originLatLng = {'lat': this.view.data()[0][0], 'lng': this.view.data()[0][1]};
      this.path = this.map.getPath(originLatLng, ev.latlng);
      return this.path;
    },
    move: function() {
      if(this.path.length) {
        var next = this.path.pop();
        this.moveTo(next.getLatLng());
      }
    }

  });
})()
