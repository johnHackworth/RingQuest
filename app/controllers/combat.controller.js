(function() {
  var base = window.ringQuest;

  base.controllers.combat = base.controllers.controller.extend({

    initialize: function(options) {
      this.attacker = options.attacker;
      this.defender = options.defender;
      this.element = options.element;
    },
    render: function() {

    }

  });
})();
