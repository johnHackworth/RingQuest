(function() {
  var base = window.ringQuest;

  base.models.evilCharacter = base.models.character.extend({
    alignment: 'evil',

    manageEncounter: function(other) {
      if(other.alignment == 'good') {
        this.trigger('alert', this.name + ' attacks '+ other.name);
      }
    }
  })
})()
