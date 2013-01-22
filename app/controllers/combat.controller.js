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
    },
    bindButtons: function() {
      this.element.find('.buttons .setAttack').on('click', this.listenAttackButton.bind(this));
      this.element.find('.buttons .setDefend').on('click', this.listenDefendButton.bind(this));
      this.element.find('.buttons .setFlee').on('click', this.listenFleeButton.bind(this));
      this.element.find('.fight').on('click', this.turn.bind(this));

    },
    initCombat: function(attackers, defenders) {
      this.render();
      this.attackers = attackers;
      this.defenders = defenders;
      if(this.attackers[0].playerControlled) {
        this.playerFaction = this.attackers;
        this.attackers.playable = true;
      } else {
        this.playerFaction = this.defenders;
        this.defenders.playable = true;
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
      this.bindButtons();
      this.assignTop();
    },
    assignTop: function() {
      for(var i in this.defenders) {
        console.log(this.defenders[i])
        var defender = this.element.find('.characterAvatar.'+this.defenders[i].name)
        defender.css({top: (30*i)})
        defender.data('rest-position', 30*i)
        defender.data('combat-position', ""+(20+8*i)+"%")
      }
      for(var i in this.attackers) {
        console.log(this.attackers[i].name);
        var attacker = this.element.find('.characterAvatar.'+this.attackers[i].name);
        attacker.css({top: (30*i)})
        attacker.data('rest-position', 30*i)
        attacker.data('combat-position', ""+(20+8*i)+"%")

      }

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
      var attacks = [];
      var defenses = [];
      for(var i in this.attackers) {
        if(typeof this.attackers[i] === 'object') {
          if(this.attackers[i].health > 0) {
            attacks.push({
              char: this.attackers[i],
              action: this.attackers[i].getCombatAction()
            })
          }
        }
      }
      for(var i in this.defenders) {
        if(typeof this.defenders[i] === 'object') {
          if(this.defenders[i].health > 0) {
            defenses.push({
              char: this.defenders[i],
              action: this.defenders[i].getCombatAction()
            })
          }
        }
      }
      var activity = [];
      for(var i in attacks) {
        var randDef = Math.floor(self.defenders.length * Math.random());
        activity.push(actions[attacks[i].action](attacks[i].char, self.defenders[randDef], attacks[i].action, defenses[randDef]));
      }
      $.when.apply(this, activity).done( function() {
        for(var i in defenses) {
          var randAtt = Math.floor(self.attackers.length * Math.random());
          actions[defenses[i].action](self.defenders[i], self.attackers[randAtt], defenses[i].action, attacks[randAtt]);
        }

      })

    },

    listenAttackButton: function(ev) {
      var button = $(ev.currentTarget);
      button.parents('.buttons').find('a').removeClass('selected')
      button.addClass('selected');
      var charName = $(ev.currentTarget).data('char');
      for(var i in this.playerFaction) {

        if(this.playerFaction[i].name == charName) {
          this.playerFaction[i].selectedCombatAction = 'attack';
        }
      }
    },
    listenDefendButton: function(ev) {
      var button = $(ev.currentTarget);
      button.parents('.buttons').find('a').removeClass('selected')
      button.addClass('selected');
      var charName = $(ev.currentTarget).data('char');
      for(var i in this.playerFaction) {
        if(this.playerFaction[i].name == charName) {
          this.playerFaction[i].selectedCombatAction = 'defend';
        }
      }    },
    listenFleeButton: function(ev) {
      var button = $(ev.currentTarget);
      button.parents('.buttons').find('a').removeClass('selected')
      button.addClass('selected');
      var charName = $(ev.currentTarget).data('char');
      for(var i in this.playerFaction) {
        if(this.playerFaction[i].name == charName) {
          this.playerFaction[i].selectedCombatAction = 'flee';
        }
      }
    },
    fight: function(attacker, defender, attackerAction, defenderAction) {
      var dfd = $.Deferred();
      var self = this;

      if(this.closing) return;
      if(attacker.health < 1) return;

      var attackerAvatar = this.element.find('.characterAvatar.'+attacker.name);
      var defenderAvatar = this.element.find('.characterAvatar.'+defender.name);
      attackerAvatar.css({left: "48%", top: attackerAvatar.data('combat-position')});
      setTimeout(function(){attackerAvatar.addClass('fighting')},1500)
      defenderAvatar.css({left: "52%", top: defenderAvatar.data('combat-position')});
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
          defender.takeDamage(damage);
          self.updateStatus(defender, damage);
          if(defender.health <= 0) {
            setTimeout(self.checkEnd.bind(self), 2000)
            defenderAvatar.addClass('dead')
            defender.dead();
          }
        }

        if(counterStrike > attackForce) {
          var damage = Math.floor(counterStrike / attackForce);
          attacker.takeDamage(damage);
          self.updateStatus(attacker, damage);
          if(attacker.health <= 0) {
            setTimeout(self.checkEnd.bind(self), 2000)
            attackerAvatar.addClass('dead')
            attacker.dead();
          }
        }

        attackerAvatar.css({left: '', top: attackerAvatar.data('rest-position')});
        defenderAvatar.css({left: '', top: defenderAvatar.data('rest-position')});
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

      if(fleeAttemp > chaseAttemp) {
        attacker.fleed = true;
      }
      this.checkEnd();
    },
    defend: function(attacker, defender, attackerAction, defenderAction) {

    },
    checkEnd: function() {
      var defendersLeft = false;
      var defendersFlee = false;
      var attackersLeft = false;
      var attackersFlee = false;
      for(var i = 0; i < this.attackers.length; i++) {
        if(this.attackers[i].health > 0 && !this.attackers[i].fleed) {
          attackersLeft = true;
        }
        if(this.attackers[i].fleed) {
          attackersFlee = true;
        }
      }
      for(var i = 0; i < this.defenders.length; i++) {
        if(this.defenders[i].health > 0 && !this.defenders[i].fleed) {
          defendersLeft = true;
        }
        if(this.defenders[i].fleed) {
          defendersFlee = true;
        }
      }

      if(!defendersLeft || !attackersLeft) {
        if(defendersFlee) {
          for(var i=0;i<this.attackers.length;i++) {
            this.attackers[i].freeze();
          }
        }
        if(attackersFlee) {
          for(var i=0;i<this.defenders.length;i++) {
            this.defenders[i].freeze();
          }
        }
        this.close();
      }
    },
    close: function() {
      this.closing = true;
      this.trigger('combatClose');
      this.element.fadeOut();
    }



  });
})();
