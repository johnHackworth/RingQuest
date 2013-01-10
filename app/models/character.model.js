(function() {
  var base = window.ringQuest;

  base.models.character = base.models.model.extend({
    strenght: 5,
    stealth: 5,
    health: 5,
    speed: 5,
    maxHealth: 1,
    alignment: 'neutral',
    followers: [],
    type: 'character',

    perks: [],
    inventory: [],
    pathLimits: null,
    initialize: function(options) {
      var self = this;
      this.followers = [];
      this.perks = [];
      this.inventory = [];
      this.name = options.name;
      this.strenght = options.strength? options.strength : 0;
      this.stealth = options.stealth? options.stealth : 0;
      this.maxHealth = options.maxHealth? options.maxHealth : 0;
      this.map = options.map;
      this.map.on('checkEncounter', this.respondEncounter.bind(this));
      this.position = {lat: options.lat, lng: options.lng}
      this.getPath = this.getPath.bind(this);
    },
    respondEncounter: function(ev,  other) {
      if(other != this && other.followers.indexOf(this) <0 && this.followers.indexOf(other) < 0) {
        var pos = new L.LatLng(this.position.lat, this.position.lng)
        var posOther = new L.LatLng(other.position.lat, other.position.lng)
        if(pos.distanceTo(posOther) < 200000) {
          this.manageSeeing(other);
        }
        if(pos.distanceTo(posOther) < 20000) {
          this.manageEncounter(other);
        }
      }
    },
    manageEncounter: function(other) {
      this.trigger('alert', 'encounter between '+this.name + ' and '+ other.name);
    },
    manageSeeing: function(other) {
      this.trigger('alert', other.name + ' see ' + this.name + 'from afar');
    },
    checkEncounter: function() {
      this.map.trigger('checkEncounter', this);
    },
    getDestination: function() {
      var self = this;
      var x, y;
      if(this.pathLimits != null) {
        x = Math.floor(Math.random()*(this.pathLimits.maxTileX - this.pathLimits.minTileX) + this.pathLimits.minTileX);
        y = Math.floor(Math.random()*(this.pathLimits.maxTileY - this.pathLimits.minTileY) + this.pathLimits.minTileY);
        console.log(x,y);
      } else {
        x = Math.floor(Math.random()*this.map.maxX);
        y = Math.floor(Math.random()*this.map.maxY);
      }

      this.destination = this.map.grid[x][y];
      this.getPath(this.position, this.destination.getLatLng())
      this.trigger('path:changed');
    },
    setPathOther: function(other) {
      other.path = this.path;
      other.trigger('path:changed');
    },
    setPathOtherPos: function(other) {
      this.getPath(this.position, other.position)
    },
    setDestination: function(end, latlng) {
      latlng = latlng || end.getLatLng();
      this.destination = end;
      this.destinationLatLng = latlng;
    },
    setPosition: function(pos) {
      this.position = pos;
      this.checkEncounter();
    },
    getPath: function(a, b, append) {
      var self = this;
      if(a.getLatLng) {
        a = a.getLatLng();
      }
      var origin = this.map.getTile(a);
      var end = this.map.getTile(b);
      this.setDestination(end, b);
      $.when(this.map.getPath(origin, end)).done(function(newpath, res2) {
        if(!newpath.length) {
          return false;
        };
        if(append) {
          self.path.push.apply(self.path, newpath);
        } else {
          self.path = newpath;
        }

        if(self.path[self.path.length -1] == end) {
          self.path.push(b);
        }
        self.trigger('path:changed');

        var i = 1;
        for(var f in self.followers) {
          setTimeout((function() { this.setPathOther(this.followers[f]) }).bind(self), 300*i++);
        }
      })
    },
    arrived: function() {
      if(this.auto) {
        this.getDestination();
      }
    },
    automove: function() {
      this.auto = true;
      this.getDestination();
    },
    pathAsArray: function() {
      var pathArray = [];
      for(var i in this.path) {
        var next = this.path[i].getLatLng? this.path[i].getLatLng() : this.path[i];
        pathArray.push(next);
      }
      return pathArray;
    }
  });
})()
