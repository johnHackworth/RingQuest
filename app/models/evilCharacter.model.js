(function() {
  var base = window.ringQuest;

  base.models.evilCharacter = base.models.character.extend({
    alignment: 'evil',
    speed: 8,

    manageEncounter: function(other) {
      if(this.freezed) {
        return ;
      }

      if(other.alignment == 'good') {
        var attackers = this.map.getSurrondingCharsAsArray(this.tile,0,'evil', true);
        var defenders = this.map.getSurrondingCharsAsArray(this.tile,0,'good', true);
        this.trigger('attack', {'offensive': attackers, 'defensive': defenders});
      }
    },
    manageSeeing: function(other) {
      if(other.alignment === 'good') {
        console.log(other.ringBearer)
        if(other.ringBearer) {
          if(!this.rush) this.rushOn();
          console.log(other.name, this.name)
          this.setPathOtherPos(other);
        }
      }
    },
    getCombatAction: function() {
      return 'attack'
    }
  })
})()
