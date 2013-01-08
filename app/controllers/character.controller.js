(function() {
  var base = window.ringQuest;

  base.controllers.character = base.controllers.controller.extend({
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
      this.map = options.map;
      this.model.on('path:changed', this.pathChanged.bind(this));
      this.map.on('zoom:changed', this.redraw.bind(this));
    },
    redraw: function() {
      this.stop();
      this.view.remove();
      this.addToMap();
      // this.move();
    },
    pathChanged: function() {
      clearTimeout(this.moveTimeout);
      clearTimeout(this.posTimeout);
      this.move();
    },
    addToMap: function() {
      this.view = this.createCircle(10,
        this.model.position.lat,
        this.model.position.lng
      );
      this.view.attr('fill',self.color)
            .attr('stroke',self.color2)
            .attr('fill', 'red')
            .attr('line-color', 'blue')
            .attr('class','character ' + this.model.type + ' '+this.model.alignment)
            .attr('name', this.model.name)
      this.view.update();
      setTimeout(this.move.bind(this),25);
    },
    moveTo: function(latLng) {
      this.view.data([latLng]);
      this.view.move();
    },
    playerControlled: function() {
      this.map.map.on('click', this.moveToClick.bind(this));
      var currentClass = this.view.attr('class');
      if(currentClass.indexOf('selected') < 0) {
        currentClass += ' selected';
        this.view.attr('class', currentClass)
      }
      this.model.playerControlled = true;
    },
    moveToClick: function(ev) {
      // var latlng = ev.latlng;
      // this.moveTo(latlng);
      clearTimeout(this.moveTimeout);
      clearTimeout(this.posTimeout);
      var data = this.view.data();
      var lat =  data[0].length? data[0][0] : data[0].lat;
      var lng =  data[0].length? data[0][1] : data[0].lng;

      var originLatLng = {
        'lat': lat,
        'lng': lng
      };
      if(ev.originalEvent.ctrlKey && this.model.path && this.model.path.length > 0) {
        var newpath = this.model.getPath(this.model.path[this.model.path.length -1], ev.latlng, true);
        // this.path.push(newpath)
      } else {
        var newpath = this.model.getPath(originLatLng, ev.latlng);
      }
    },
    move: function() {
      if(this.model.path && this.model.path.length) {
        if(this.model.playerControlled) {
          this.removeLinePath();
          this.linePath = this.createLine(this.model.pathAsArray(),
            this.map.map,
            {
              dashArray: '5, 10',
              color: '#641'
            });
        }
        var next = this.model.path.shift();
        var nextPos = next.getLatLng? next.getLatLng() : next;
        this.currentPos = this.nextPos;
        this.nextPos = nextPos;
        this.moveTo(nextPos);
        this.posTimeout = setTimeout(this.setModelPosition.bind(this), Math.floor(this.getCurrentSpeed()/2))
        this.moveTimeout = setTimeout(this.move.bind(this), this.getCurrentSpeed());
      } else {
        this.model.arrived();
        this.removeLinePath();
      }
    },
    getCurrentSpeed: function() {
      var speed1 = (this.nextPos && this.nextPos.getBaseSpeed) ? this.nextPos.getBaseSpeed() : 1;
      var speed2 = (this.currentPos && this.currentPos.getBaseSpeed) ? this.currentPos.getBaseSpeed() : 1;
      var baseTerrain = speed1 + speed2;
      return 100 * baseTerrain * this.model.speed;
    },
    stop: function() {
      clearTimeout(this.moveTimeout);
      clearTimeout(this.posTimeout);
      this.view.stop();
      this.view.update();
    },
    setModelPosition: function() {
      this.model.setPosition(this.view.data()[0])
    },
    removeLinePath: function() {
      if(this.linePath) this.map.map.removeLayer(this.linePath);
    }

  });
})()
