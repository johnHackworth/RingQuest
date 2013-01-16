(function() {
  var base = window.ringQuest;

  base.models.party = base.models.character.extend({
    type: 'party',
    alignment: 'good',
    speed: 8,
    ringBearer: false,
    members: [],
    initialize: function(options) {
      this.parent('initialize', options);
      this.members = [];
    },
    addMember: function(char) {
      this.members.push(char);
      this.calculateStats();
    },
    removeMember: function(charName) {
      for(var i in this.members) {
        if(this.members[i].name === charName) {
          this.members.splice(i,1);
        }
      }
    },
    calculateStats: function() {
      this.speed = 0;
      this.vision = 0;
      this.stealth = 0;
      var cumulativeSpeed = 0;
      var cumulativeStealth = 0;
      for(var i in this.members) {
        var char = this.members[i];
        cumulativeSpeed += char.speed;
        cumulativeStealth += char.stealth;
        if(char.vision > this.vision) this.vision = char.vision
      }
      this.speed = cumulativeSpeed  / this.members.length;
      this.stealth = cumulativeStealth  / this.members.length;
    }

  })
})()
