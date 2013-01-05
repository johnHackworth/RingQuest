(function() {
  var base = window.ringQuest;

  base.models.goodCharacter = base.models.character.extend({
    alignment: 'good',

    manageEncounter: function(other) {
      if(other.alignment == 'evil') {
        thiis.trigger('alert', this.name + ' flee from '+ other.name);
      } else if(other.alignment == 'good') {
        if(other.playerControlled) {
          if(confirm('do you want '+this.name + ' in your group?')) {
            other.followers.push(this);
          }
        }
      }


    }
  })
})()
