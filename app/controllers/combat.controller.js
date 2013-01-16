(function() {
  var base = window.ringQuest;

  base.controllers.combat = base.controllers.controller.extend({

    template: 'nil',
    initialize: function(options) {
      var dfd = $.Deferred();
      this.ready = dfd.promise();

      var self = this;
      this.element = options.element;
      this.templateDirector = options.templateDirector;
      $.when(this.templateDirector.get('combat')).done(function(res, res2) {
        self.frameTemplate = self.templateDirector.getSubtemplate('combat', 'frame');
        self.buttonsTemplate = self.templateDirector.getSubtemplate('combat', 'buttons');
        self.actionTemplate = self.templateDirector.getSubtemplate('combat', 'action');
        self.combatantsTemplate = self.templateDirector.getSubtemplate('combat', 'combatants');
        dfd.resolve();
      })
    },
    avatar: function(name) {
      return this.element.find('.characterAvatar.'+name);
    },
    showDamage: function(name, damage) {
      var avatar = this.avatar(name);
      var damageContainer = avatar.find('.damage');
      damageContainer.html(damage);
      setTimeout(function() {
        damageContainer.html('');
      },3000)
    },
    showStatus: function(name, status) {
      var statusContainer = this.avatar(name).find('.status');
      statusContainer.html(status);
    },
    render: function() {
      this.element.html(this.frameTemplate);
      this.paintButtons();
      this.element.fadeIn();
    },
    paintButtons: function() {
      this.element.find('.buttons').html(this.buttonsTemplate);
      this.element.find('.buttons .attack').on('click', this.listenAttackButton.bind(this));

      this.element.find('.buttons .defend').on('click', this.listenDefendButton.bind(this));
      this.element.find('.buttons .flee').on('click', this.listenFleeButton.bind(this));
    },
    initCombat: function(attackers, defenders) {
      this.render();
      this.attackers = attackers;
      this.defenders = defenders;
      if(this.attackers[0].playerControlled) {
        this.playerFaction = this.attackers;
      } else {
        this.playerFaction = this.defenders;
      }
      this.element.find('.combatants').html(
        _.template(this.combatantsTemplate, {
          attackers: attackers,
          defenders: defenders
        })
      );
      this.element.find('.simulation').html(
        _.template(this.actionTemplate, {
          attackers: attackers,
          defenders: defenders
        })
      );
    },

    log: function(text) {
      this.logElement.prepend(_.template(this.entryTemplate, {entryClass:'', entryText: text}))
    },

    turn: function() {
      var self = this;
      var actions = {
        'attack': this.fight.bind(this),
        'flee': this.flee.bind(this),
        'defend': this.defend.bind(this)
      }
      var attackerAction = this.attackers[0].getCombatAction();
      var defenderAction = this.defenders[0].getCombatAction();

      $.when(
        actions[attackerAction](self.attackers[0], self.defenders[0], attackerAction, defenderAction)
      ).done(
        function() {
        actions[defenderAction](self.defenders[0], self.attackers[0], defenderAction, attackerAction);
      })
    },

    listenAttackButton: function() {
      this.playerFaction[0].selectedCombatAction = 'attack';
      this.turn();
    },
    listenDefendButton: function() {
      this.playerFaction[0].selectedCombatAction = 'defend';
      this.turn();
    },
    listenFleeButton: function() {
      this.playerFaction[0].selectedCombatAction = 'flee';
      this.turn();
    },
    fight: function(attacker, defender, attackerAction, defenderAction) {
      var dfd = $.Deferred();
      if(this.closing) return;
      var self = this;
      console.log('fight')
      if(attacker.health < 1) return;
      var attackerAvatar = this.element.find('.characterAvatar.'+attacker.name);
      var defenderAvatar = this.element.find('.characterAvatar.'+defender.name);
      attackerAvatar.css({left: "48%", top:"40%"});
      setTimeout(function(){attackerAvatar.addClass('fighting')},1500)
      defenderAvatar.css({left: "52%", top:"40%"});
      setTimeout(function(){defenderAvatar.addClass('fighting')},1500)

      var attackForce = attacker.getAttackValue() * Math.random();
      var defenseForce = defender.getDefendValue() * Math.random();
      var counterStrike = defender.getAttackValue() * Math.random() / 4;
      if(defenderAction === 'defend') {
        defenseForce = defenseForce * 2;
        counterStrike = counterStrike * 2;
      }
      if(defenderAction === 'flee') {
        defenseForce = defenseForce * 0.6;
        counterStrike = counterStrike * 0.2;
      }
      setTimeout(function() {

        if(attackForce > defenseForce) {
          var damage = Math.floor(attackForce / defenseForce);
          defender.trigger('damage', defender, damage);
          defender.health -= damage;
          self.updateStatus(defender, damage);
          if(defender.health <= 0) {
            defender.trigger('death', defender);
            defenderAvatar.addClass('dead')
            setTimeout(self.close.bind(self), 2000)
          }
        }

        if(counterStrike > attackForce) {
          var damage = Math.floor(counterStrike / attackForce);
          defender.trigger('damage', attacker, damage);
          attacker.health -= damage;
          self.updateStatus(attacker, damage);
          if(attacker.health <= 0) {
            attacker.trigger('death', attacker);
            attackerAvatar.addClass('dead')
            setTimeout(self.close.bind(self), 2000)
          }
        }

        console.log('fight emd')
        attackerAvatar.css({left: '', top: ''});
        defenderAvatar.css({left: '', top: ''});
        setTimeout(function() { attackerAvatar.removeClass('fighting')}, 200);
        setTimeout(function() { attackerAvatar.addClass('fighting')}, 400);
        setTimeout(function() { attackerAvatar.removeClass('fighting')}, 600);
        setTimeout(function() { defenderAvatar.removeClass('fighting')}, 250);
        setTimeout(function() { defenderAvatar.addClass('fighting')}, 450);
        setTimeout(function() { defenderAvatar.removeClass('fighting')}, 650);
        dfd.resolve();
      }, 2400);

      return dfd.promise();

    },
    updateStatus: function(char, damage) {

      this.showDamage(char.name, damage);
      this.updateHealth(char);
      if(char.health < char.maxHealth / 2) {
        this.showStatus(char.name, 'injured');
      }
      if(char.health < char.maxHealth / 4) {
        this.showStatus(char.name, 'near death');
      }
      if(char.health <= 0) {
       this.showStatus(char.name, 'death');
      }
    },
    updateHealth: function(char) {
      this.element.find('.charInfo.'+char.name+ ' .currentHealth').html(char.health);
    },
    flee: function(attacker, defender, attackerAction, defenderAction) {
      if(attacker.health < 1) return;
      var fleeAttemp = attacker.stealth * Math.random();
      var chaseAttemp = defender.speed * Math.random();
      console.log(fleeAttemp, chaseAttemp)
      if(fleeAttemp > chaseAttemp) {
        defender.freeze();
        this.close();
      }
    },
    defend: function(attacker, defender, attackerAction, defenderAction) {

    },

    close: function() {
      this.closing = true;
      this.trigger('combatClose');
      this.element.fadeOut();
    }



  });
})();
