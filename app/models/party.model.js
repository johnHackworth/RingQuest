(function() {
  var base = window.ringQuest;

  base.models.party = base.models.character.extend({
    type: 'party',
    alignment: 'good',
    speed: 8,
    ringBearer: false,
    members: [],
    cacheMembers: {},
    initialize: function(options) {
      this.parent('initialize', options);
      this.members = [];
    },
    addMember: function(char) {
      this.invalidateCacheMembers();
      this.members.push(char);
      char.addedToParty();
      this.calculateStats();
    },
    removeMember: function(char) {
      for(var i in this.members) {
        if(this.members[i].name === char.name) {
          this.invalidateCacheMembers();
          this.members.splice(i,1);
          char.inParty = false;
        }
      }
    },
    invalidateCacheMembers: function() {
      this.cacheMembers = {};
    },
    isMember: function(char) {
      if(!char.name in this.cacheMembers) {
        var isMember = false;
        for(var i in this.members) {
          if(this.members[i].name === char.name) {
            isMember = true;
          }
        }
        this.cacheMembers[char.name] = isMember;

      }
      return this.cacheMembers[char.name];
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
    },
    setPosition: function(pos) {
      this.parent("setPosition", pos);
      for(var n in this.members) {
        this.members[n].setPosition(pos);
      }
    }

  })
})()
