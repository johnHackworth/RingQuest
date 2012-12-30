(function() {
  var base = window.ringQuest;
  base.controllers.controller = Seed.extend({
    createCircle: function(radio, lat, lng, mapContainer) {
      radio = radio || this.radio;
      lat = lat || this.lat;
      lng = lng || this.lng;
      mapContainer = mapContainer || this.map.mapContainer;
      var self = this;
      var svg = d3.select("#"+mapContainer).select("svg");
      var g = svg.append("g");
      var feature = g.selectAll("circle")
        .data([[lat, lng]])
        .enter().append("circle")
        .attr("r", radio)
      feature.update = (function() {
        this
          .attr("cx",function(d) { return self.map.latLngToLayerPoint(d).x})
          .attr("cy",function(d) { return self.map.latLngToLayerPoint(d).y})
      }).bind(feature)
      feature.move = (function() {
        this
          .transition()
          .attr("cx",function(d) { return self.map.latLngToLayerPoint(d).x})
          .attr("cy",function(d) { return self.map.latLngToLayerPoint(d).y})
          .duration(self._TRANSITION_SPEED)
          .delay(0)
          .ease('linear')
      }).bind(feature)
      return feature;
    }
  });
})()
