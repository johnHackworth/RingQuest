(function() {
  var base = window.ringQuest;

  base.models.evilCharacter = base.models.character.extend({
    alignment: 'evil',
    speed: 8,

    manageEncounter: function(other) {
      if(other.alignment == 'good') {
        this.trigger('alert', this.name + ' attacks '+ other.name);
      }
    },
    manageSeeing: function(other) {
      if(other.ringBearer) {
        this.setPathOtherPos(other);
      }
    }
  })
})()
