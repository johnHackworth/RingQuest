(function() {
  var base = window.ringQuest;

  base.models.party = base.models.character.extend({
    type: 'party',
    alignment: 'good',
    speed: 8,
    ringBearer: false,
    members: [],
    cacheMembers: {},
    sneaking: false,
    initialize: function(options) {
      this.parent('initialize', options);
      this.members = [];
    },
    addMember: function(char) {
      this.invalidateCacheMembers();
      this.members.push(char);
      char.addedToParty();
      char.on('char:damaged', this.triggerUpdate.bind(this));
      char.on('char:dead', this.memberDead.bind(this));
      this.triggerUpdate();
      this.calculateStats();
    },
    triggerUpdate: function() {
      this.trigger('party:updated');
    },
    memberDead: function(ev, char) {
      this.removeMember(char.name);
    },
    removeMember: function(char) {
      for(var i in this.members) {
        if(this.members[i].name === char.name) {
          this.invalidateCacheMembers();
          this.members.splice(i,1);
          char.inParty = false;
          this.triggerUpdate();
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
      if(this.sneaking) {
        this.speed = this.speed / 2;
        this.stealth = this.stealh * 2;
      }
    },
    setPosition: function(pos) {
      this.parent("setPosition", pos);
      for(var n in this.members) {
        this.members[n].setPosition(pos);
      }
      if(this.playerControlled) {
        this.trigger('playerPosition:updated')
      }
    },
    toggleSneak: function() {
      var sneak = !this.sneaking;
      this.sneaking = sneak;
      this.trigger('party:sneak');
      this.calculateStats();
    },
    getMember: function(charName) {
      for(var i in this.members) {
        if(this.members[i].name == charName) {
          return this.members[i];
        }
      }

    }

  })
})()
