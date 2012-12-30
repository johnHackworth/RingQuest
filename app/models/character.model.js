(function() {
  var base = window.ringQuest;

  base.models.character = base.models.model.extend({
    strenght: 0,
    stealth: 0,
    health: 1,
    maxHealth: 1,

    perks: [],
    inventory: [],

    initialize: function(options) {
      var self = this;
      this.name = options.name;
      this.strenght = options.strength? options.strength : 0;
      this.stealth = options.stealth? options.stealth : 0;
      this.maxHealth = options.maxHealth? options.maxHealth : 0;
    }
  });
})()
