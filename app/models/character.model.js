(function() {
  var base = window.ringQuest;

  base.models.character = base.models.model.extend({
    strenght: 5,
    agility: 5,
    stealth: 5,
    vision: 5,
    health: 5,
    maxHealth: 10,
    speed: 5,
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
      this.strenght = options.strength? options.strength : this.strenght;
      this.stealth = options.stealth? options.stealth : this.stealth;
      this.maxHealth = options.maxHealth? options.maxHealth : this.maxHealth;
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
        if(this.pathLimits.center) {
          var maxTileX = this.pathLimits.center.x + this.pathLimits.radius;
          var minTileX = this.pathLimits.center.x - this.pathLimits.radius;
          var maxTileY = this.pathLimits.center.y + this.pathLimits.radius;
          var minTileY = this.pathLimits.center.y - this.pathLimits.radius;
          x = Math.floor(Math.random()*(maxTileX - minTileX) + minTileX);
          y = Math.floor(Math.random()*(maxTileY - minTileY) + minTileY);
        } else {
          x = Math.floor(Math.random()*(this.pathLimits.maxTileX - this.pathLimits.minTileX) + this.pathLimits.minTileX);
          y = Math.floor(Math.random()*(this.pathLimits.maxTileY - this.pathLimits.minTileY) + this.pathLimits.minTileY);
        }
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
      this.getPath(this.position, other.getNextStep())
    },
    setDestination: function(end, latlng) {
      latlng = latlng || end.getLatLng();
      this.destination = end;
      this.destinationLatLng = latlng;
    },
    setPosition: function(pos) {
      this.position = pos;

    },
    getNextStep: function() {
      for(var n in this.path) {
        if(this.path[n].step) {
          return this.path[n]
        }
      }
      return this.path[this.path.length - 1]
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
          newpath = self.transformPathToSpeed(newpath, self.path[self.path.length - 1])
          self.path.push.apply(self.path, newpath);
        } else {
          newpath = self.transformPathToSpeed(newpath, self.position)
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
    transformPathToSpeed: function(path, origin) {
      var transformSpeed = (10 - this.speed) + 1
      console.log(transformSpeed)
      var wholePath = [];
      var current = origin;
      for(var i in path) {
        var baseLat = path[i].lat ? path[i].lat : path[i].getLatLng().lat;
        var baseLng = path[i].lng ? path[i].lng : path[i].getLatLng().lng;
        var distanceLat = baseLat - current.lat
        var distanceLng = baseLng - current.lng
        var stepLat = distanceLat / transformSpeed
        var stepLng = distanceLng / transformSpeed
        for(var j = 0; j<transformSpeed; j++) {
          current = {lat : current.lat + stepLat, lng: current.lng + stepLng}
          wholePath.push({lat: current.lat, lng: current.lng, step: (j==0)});
        }
      }
      return wholePath
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
    },

    getCombatAction: function() {
      if(this.selectedCombatAction) {
        return this.selectedCombatAction;
      }
      return 'defend'
    },
    getAttackValue: function() {
      return this.strenght * this.agility;
    },
    getDefendValue: function() {
      return this.speed * this.stealth;
    },
    freeze: function() {
      this.freezed = 2;
    }
  });
})()
