(function() {
  var base = window.ringQuest;


  base.controllers.mainMap = base.controllers.controller.extend({
    baseMap: 'http://johnhackworth.github.com/middle-earth-tiles/{z}/{x}/{y}.jpg',
    // baseMap: 'http://localhost:8000/map/{z}/{x}/{y}.jpg',
    topY: -45,
    bottomY: -85,
    initialize: function(options) {
      var self = this;
      this.mapContainer = options.element
      this.mapOptions = options.options
      this.model = options.model
      this.boundaries = options.boundaries;
      // this.addLeafletProjection();
      this.addMap();
      this.addBaseLayer();
      this.map._initPathRoot()
    },
    addLeafletProjection: function() {
      L.Projection.NoWrap = {
          project: function (latlng) {
              return new L.Point(latlng.lng, latlng.lat);
          },

          unproject: function (point, unbounded) {
              return new L.LatLng(point.y, point.x, true);
          }
      };

      L.CRS.Direct = L.Util.extend({}, L.CRS, {
          code: 'Direct',

          projection: L.Projection.LonLat,
          transformation: new L.Transformation(1, 0, 1, 0)
      });
    },
    addMap: function() {
      this.mapOptions = $.extend({
        center: [-60, -90],
        // center: [0,0],
        maxBounds: this.boundaries,
        zoom: 6,
        maxZoom:6,
        minZoon:6,
        fadeAnimation: true,
        panAnimation: true,
        // continuousWorld: true,
        // worldCopyJump: false
      }, this.mapOptions);

      this.map = L.map(this.mapContainer, this.mapOptions)
      this.map.on("viewreset", this.refreshCharacters.bind(this));
    },
    addBaseLayer: function() {
      this.baseLayer = L.tileLayer(this.baseMap, {
        attribution: '',
        // continuousWorld: true
      });
      this.baseLayer.addTo(this.map);
    },
    latLngToLayerPoint: function(param) {
      return this.map.latLngToLayerPoint(param);
    },
    getTileClick: function() {
      var self = this;
      this.map.on('click', function(ev) {
        var tile = self.model.getTile(ev.latlng);
      });
    },
    getGeoClick: function() {
      this.map.on('click', function(ev) {
        console.log(ev.latlng);
      });

    },
    showTiles: function(type) {
      var self = this;
      if(type === undefined) type = 1;
      self.newType = type;

      this.grid = []
      for(var x = 0; x < this.model.maxX; x++) {
        this.grid[x] = [];
        for(var y = 0; y < this.model.maxY; y++) {

          var circ = this.createCircle(5  ,
            this.model.grid[x][y].getLatLng().lat,
            this.model.grid[x][y].getLatLng().lng,
            this.mapContainer);
          circ.tile =  this.model.grid[x][y]
          circ.attr('marker-fill', this.getColor(this.model.grid[x][y].type));
          circ.attr('stroke-width', '1');
          circ.attr('stroke-fill', this.getColor(this.model.grid[x][y].type));
          circ.attr('class', 'tile '+ this.model.grid[x][y].type);
          circ.attr('fill-opacity','0.1');
          circ.attr('fill','#FFF');
          circ.attr('stroke',this.getColor(this.model.grid[x][y].type));

          this.grid[x][y] = circ;
          this.grid[x][y].move();
          this.grid[x][y].on('mouseover', (function(ev) {
            if(self.saving) {
              var x = this.tile.x;
              var y = this.tile.y;
              self.model.grid[this.tile.x][this.tile.y].type = self.newType;
              this.attr('stroke',self.getColor(self.model.grid[x][y].type));
              this.attr('stroke-fill',self.getColor(self.model.grid[x][y].type));
            }
          }).bind(this.grid[x][y]))
          $(document).on('keydown', function() {
            self.saving = true;
          })
          $(document).on('keyup', function() {
            self.saving = false;
          })
          // this.grid[x][y].attr('stroke-width', '1px')
        }
      }
    },
    exportTilesType: function() {
      var arr = [];
      for(var x = 0; x < this.model.maxX; x++) {
        arr[x] = [];
        for(var y = 0; y < this.model.maxY; y++) {
          arr[x][y] = this.model.grid[x][y].type;
        }
      }
      return arr;
    },
    getColor: function(type) {
      var colors = {
        0: 'blue',
        1: 'yellow',
        2: 'grey',
        3: '#6C6',
        4: 'green',
        5: '#000',
        6: '#AAF',
        7: '#631'
      }
      var color = colors[type]
      if(color === undefined) {
        return '#CCC';
      }
      return color;
    },
    getPath: function(a, b) {
      var origin = this.model.getTile(a);
      var end = this.model.getTile(b);
      return this.model.getPath(origin, end);
    },
    test: function() {
      var self = this;
      this.map.on('click', function(ev) {
        alert(self.translate(ev.latlng.lat))
      });
    },
    refreshCharacters: function() {
      this.trigger('zoom:changed')
    }
  });
})()
