(function() {
  var base = window.ringQuest;

  base.models.goodCharacter = base.models.character.extend({
    alignment: 'good',

    manageEncounter: function(other) {
      if(other.alignment == 'evil') {
        this.trigger('alert', this.name + ' flee from '+ other.name);
      } else if(other.alignment == 'good') {
        if(other.playerControlled) {
          this.trigger('meet', this);
        }
      }
    },
    addToFellowship: function(other) {
      other.followers.push(this);
    }
  })
})()
