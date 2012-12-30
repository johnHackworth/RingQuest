(function() {
  var base = window.ringQuest;

  base.controllers.mainMap = base.controllers.controller.extend({
    baseMap: 'http://johnhackworth.github.com/middle-earth-tiles/{z}/{x}/{y}.jpg',
    initialize: function(options) {
      var self = this;
      this.mapContainer = options.element
      this.mapOptions = options.options
      this.model = options.model
      this.boundaries = options.boundaries;
      this.addMap()
      this.addBaseLayer();
      this.map._initPathRoot()
    },
    addMap: function() {
      this.mapOptions = $.extend({
        center: [-65, -125],
        maxBounds: this.boundaries,
        zoom: 4,
        maxZoom:7,
        minZoon:2,
        fadeAnimation: true,
        panAnimation: true,

      }, this.mapOptions);
      this.map = L.map(this.mapContainer, this.mapOptions)
    },
    addBaseLayer: function() {
      this.baseLayer = L.tileLayer(this.baseMap, {
        attribution: ''
      });
      this.baseLayer.addTo(this.map);
    },
    latLngToLayerPoint: function(param) {
      return this.map.latLngToLayerPoint(param);
    },
    getTileClick: function() {
      // this.map.on('click', function(ev) { return ringQuest.mdl('map').getTile(ev.latlng));})
    },
    showTiles: function() {
      this.grid = []
      var baseX = this.boundaries[0][0];
      var baseY = this.boundaries[1][1];
      for(var x = 0; x < this.model.maxX; x++) {
        this.grid[x] = [];
        for(var y = 0; y < this.model.maxY; y++) {
          this.grid[x][y] = this.createCircle(30,
            (x*this.model.stepX + baseX),
            (y*this.model.stepY + baseY),
            this.mapContainer);
          this.grid[x][y].move();
          this.grid[x][y].attr('stroke-width', '1px')
        }
      }
    },
    getPath: function(a, b) {
      var origin = this.model.getTile(a);
      var end = this.model.getTile(b);
      return this.model.getPath(origin, end);
    }
  });
})()
