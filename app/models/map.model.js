(function() {
  var base = window.ringQuest;

  base.models.map = base.models.model.extend({
    maxX: 100,
    maxY: 50,
    grid: [],
    tileClass: base.models.tile,
    initialize: function(options) {
      this.boundaries = options.boundaries;
      this.stepY = (this.boundaries[1][0] - this.boundaries[0][0]) / this.maxY;
      this.stepX = (this.boundaries[1][1] - this.boundaries[0][1]) / this.maxX;
      this.baseY = this.boundaries[0][0];
      this.baseX = this.boundaries[0][1];
      for(var x = 0; x< this.maxX; x++) {
        this.grid[x] = [];
        for(var y = 0; y< this.maxY; y++) {
          this.grid[x][y] = new this.tileClass({
            x: x,
            y: y,
            stepX: this.stepX,
            stepY: this.stepY,
            baseX: this.baseX,
            baseY: this.baseY
          });
        }
      }
    },
    getTile: function(latlng) {
      var y = Math.floor((latlng.lat - this.boundaries[0][0] ) / this.stepY)
      var x = Math.floor((latlng.lng - this.boundaries[0][1] ) / this.stepX);
      console.log(x,y)
      return this.grid[y][x];
    },
    getPath: function(origin, end) {
      var path = [];
      console.log(origin.x, origin.y, end.x, end.y)
      path = this.getPathRecursive(origin, end, path);
      return path;
    },
    getPathRecursive: function(origin, end, path) {

      if(path.indexOf(origin) >= 0) {
        return path;
      } else {
        console.log(origin.x, origin.y)
        path.push(origin);
      }

      if(origin == end) {
        return path;
      }

      var dirX, dirY;
      if(origin.x == end.x) {
        dirX = 0
      } else {
        dirX = origin.x > end.x ? -1 : 1;
      }
      if(origin.y == end.y) {
        dirY = 0
      } else {
        dirY = origin.y > end.y ? -1 : 1;
      }

      var nextX = origin.x+dirX;
      nextX = nextX > this.maxX? this.maxX : nextX;
      nextX = nextX < 0 ? 0 : nextX;
      var nextY = origin.y+dirY
      nextY = nextY > this.maxY? this.maxY : nextY;
      nextY = nextY < 0 ? 0 : nextY;

      return this.getPathRecursive(this.grid[nextX][nextY], end, path)


    }

  });
})()
