(function() {
  var base = window.ringQuest;
  base.controllers.controller = Seed.extend({
    trigger: function(event, params) {
      $(this).trigger(event, params)
    },
    on: function(event, method) {
      $(this).on(event, method);
    },
    createCircle: function(radio, lat, lng, mapContainer, label) {
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
      if(label) {
        feature.label = this.createLabel(svg, lat, lng, label);
      }
      feature.update = (function() {
        this
          .attr("cx",function(d) { return self.map.latLngToLayerPoint(d).x})
          .attr("cy",function(d) { return self.map.latLngToLayerPoint(d).y})
        if(this.label) {
          this.label.data(this.data());
          this.label.update();
        }
      }).bind(feature)
      feature.move = (function() {
        this
          .transition()
          .attr("cx",function(d) { return self.map.latLngToLayerPoint(d).x})
          .attr("cy",function(d) { return self.map.latLngToLayerPoint(d).y})
          .duration(self.getCurrentSpeed())
          .delay(0)
          .ease('linear');
        if(this.label) {
          this.label.data(this.data());
          this.label.move();
        }
      }).bind(feature)
      feature.stop = (function() {
        this.transition();
      }).bind(feature);
      return feature;
    },
    createLabel: function(svg, lat, lng, text, radio) {
      if(!radio) { radio = 20 } else { radio = radio * 2; };
      var self = this;
      var className = text + ' charLabel ';//zoom' + this.map.getZoom();
      var label = svg.append("svg:text")
      .data([[lat, lng]])
      .attr("transform", function(d) { return "translate(" +
                            (self.map.latLngToLayerPoint(d).x - radio) + "," +
                            (self.map.latLngToLayerPoint(d).y + radio - 5) + ")";
       })
      .attr("dy", ".35em")
      .attr("text-anchor", "middleclss")
      .attr('class', className)
      .text(function(d) { return text });
      label.update = (function() {
        this.attr("transform", function(d) { return "translate(" +
                            (self.map.latLngToLayerPoint(d).x - radio) + "," +
                            (self.map.latLngToLayerPoint(d).y + radio - 5) + ")"; })
      }).bind(label)
      label.move = (function() {
        this
          .transition()
          .attr("transform", function(d) { return "translate(" +
                            (self.map.latLngToLayerPoint(d).x - radio) + "," +
                            (self.map.latLngToLayerPoint(d).y + radio - 5) + ")"; })
          .duration(self.getCurrentSpeed())
          .delay(0)
          .ease('linear')
      }).bind(label)

      return label;
    },
    createLine: function(points, map, options) {
      map = map || this.map;
      options = options || {};
      var color = options.color || 'red';
      var smooth = options.smooth || 0.6;
      var dashArray = options.dashArray || '1, 0'
      var polyline = L.polyline(points, {
        color: color,
        smoothFactor: smooth,
        dashArray: dashArray,
      }).addTo(map);
      return polyline;
    }
  });
})()
