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
    movable: true,
    currentSpeed: 300,
    initialize: function(options) {
      var self = this;
      this.model = options.model
      this.map = options.map;
      this.model.on('path:changed', this.pathChanged.bind(this));
      this.model.on('char:dead', this.remove.bind(this));
      this.model.on('added:party', this.remove.bind(this));
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
    getRandomColor: function() {
      return '#'+'0123456789abcdef'.split('').map(function(v,i,a){
                                                    return i>5 ? null : a[Math.floor(Math.random()*16)]
                                              }).join('');
    },
    getColor: function() {
      var c1;
      if(this.alignment === 'evil') {
        c1 = '#333';
      } else {
        c1 = '#'
      }

      return c1;
    },
    addToMap: function() {
      this.view = this.createCircle(4,
        this.model.position.lat,
        this.model.position.lng,
        false,
        this.model.name
      );
      if(!self.color) {self.color = this.getColor()};
      if(!self.color2) {self.color2 = this.getRandomColor()};
      this.view.attr('fill',self.color2)
            .attr('stroke',self.color)
            .attr('line-color', self.color2)
            .attr('class','character ' + this.model.type + ' '+this.model.alignment)
            .attr('name', this.model.name)
      this.view.update();
      // setTimeout(this.move.bind(this),25);
    },
    moveTo: function(latLng) {
      if(this.view) {
        this.view.data([latLng]);
        this.view.move();

        if(this.fog) {
          this.fog.data([latLng]);
          this.fog.move();
        }
      }
    },
    playerControlled: function() {
      this.mapEvent = this.map.map.on('click', this.moveToClick.bind(this));
      if(this.view) {
        var currentClass = this.view.attr('class');
        if(currentClass.indexOf('selected') < 0) {
          currentClass += ' selected';
           this.view.attr('class', currentClass)
        }
        this.model.playerControlled = true;
        this.fogOfWar();
      }
    },
    computerControlled: function() {
      if(this.mapEvent) this.map.map.off(this.mapEvent);
      this.model.playerControlled = false;
      if(this.fog) this.fog.remove();
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
    fogOfWar: function() {
      this.fog = this.createCircle(2200,
        this.model.position.lat,
        this.model.position.lng
      );
      this.fog.attr('fill','transparent')
            .attr('stroke', '#333')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 4000)
            .attr('line-color', '#333')
            .attr('name', this.model.name)
      this.fog.update();
    },
    move: function() {
      if(this.model.freezed > 0) {
        this.model.freezed--;
        // this.moveTimeout = setTimeout(this.move.bind(this), this.getCurrentSpeed());
      } else {

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
          if(this.model.rush > 0) {
            this.model.rush--;
            if(this.model.path.length > 0) {
              next = this.model.path.shift();
            }
          }
          var nextPos = next.getLatLng? next.getLatLng() : next;
          this.currentPos = this.nextPos;
          this.nextPos = nextPos;
          this.moveTo(nextPos);
          this.posTimeout = setTimeout(this.setModelPosition.bind(this), 100)
          // this.moveTimeout = setTimeout(this.move.bind(this), this.getCurrentSpeed());
        } else {
          this.model.arrived();
          this.removeLinePath();
        }
      }
    },
    getCurrentSpeed: function() {
      return this.currentSpeed;
      // var speed1 = (this.nextPos && this.nextPos.getBaseSpeed) ? this.nextPos.getBaseSpeed() : 1;
      // var speed2 = (this.currentPos && this.currentPos.getBaseSpeed) ? this.currentPos.getBaseSpeed() : 1;
      // var baseTerrain = speed1 + speed2;
      // return 100 * baseTerrain * this.model.speed;
    },
    stop: function() {
      clearTimeout(this.moveTimeout);
      clearTimeout(this.posTimeout);
      this.view.stop();
      this.view.update();
    },
    setModelPosition: function() {
      this.model.setPosition(this.view.data()[0]);
    },
    removeLinePath: function() {
      if(this.linePath) this.map.map.removeLayer(this.linePath);
    },
    remove: function() {
      if(this.view) {
        // if(this.playerControlled) this.computerControlled();
        this.view.remove();
        delete this.view;
      }

    }

  });
})()
