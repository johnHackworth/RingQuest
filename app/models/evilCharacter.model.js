(function() {
  var base = window.ringQuest;

  base.models.evilCharacter = base.models.character.extend({
    alignment: 'evil',
    speed: 8,

    manageEncounter: function(other) {
      console.log('free?')
      if(this.freezed) {
        return ;
      }
      if(other.alignment == 'good') {
        console.log('freezed', this.freezed)
        var attackers = [this];
        var defenders = [other];

        this.trigger('attack', {'offensive': attackers, 'defensive': defenders});
      }
    },
    manageSeeing: function(other) {
      if(other.ringBearer) {
        this.setPathOtherPos(other);
      }
    },
    getCombatAction: function() {
      return 'attack'
    }
  })
})()
