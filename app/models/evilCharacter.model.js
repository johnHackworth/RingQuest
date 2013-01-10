(function() {
  var base = window.ringQuest;

  base.models.evilCharacter = base.models.character.extend({
    alignment: 'evil',
    speed: 8,

    manageEncounter: function(other) {
      if(other.alignment == 'good') {
        this.trigger('attack', {'offensive': this.name, 'defensive': other.name});
      }
    },
    manageSeeing: function(other) {
      if(other.ringBearer) {
        this.setPathOtherPos(other);
      }
    }
  })
})()
