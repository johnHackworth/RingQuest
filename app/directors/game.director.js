
(function() {
  var base = window.ringQuest;
  base.directors.game = Seed.extend({
    mapBounds: [[-85.02070, -160.648438], [-43.068888, 83.847656]],
    models: {},
    controllers: {},
    characters: {},
    parties: {},
    templateDirector: null,
    gameSpeed: 300,
    initialize: function() {
      this.templateDirector = new base.directors.template({});
      this.injectConstants();
      this.bindMethods();
      this.initializeLog();
      this.initializeMap();
      this.initializeCombat();
      this.initializeCharacterSheet();
      this.initializeActions();
      this.initializeConversation();
      this.initializeRingBearer();
      this.initializePlayableCharacters();
      this.initializeEvilMainCharacters();
      this.initializePartyStatus();
      this.runTime();
    },
    injectConstants: function() {
      base.controllers.character.prototype.currentSpeed = this.gameSpeed;
    },
    bindMethods: function() {
      this.listenCharacterLog = this.listenCharacterLog.bind(this);
    },
    initializeMap: function() {
      var boundaries = $.extend(true, [], this.mapBounds);
      this.models.map = new ringQuest.models.map({boundaries: boundaries})
      boundaries = $.extend(true, [], this.mapBounds);
      this.controllers.map = new ringQuest.controllers.mainMap({element:"mainMap", model: this.models.map, boundaries: boundaries})
    },
    initializePartyStatus: function() {
      this.partyStatus = new ringQuest.controllers.party({
        templateDirector: this.templateDirector,
        party: this.models.fellowship,
        characterSheet: this.characterSheet,
        element: $('#partyStatus')
      });
      $.when(this.partyStatus.ready).done(this.partyStatus.renderAndFill.bind(this.partyStatus));
      this.models.fellowship.on('party:updated', this.partyStatus.updateView.bind(this.partyStatus));

    },
    initializeActions: function() {
      this.actions = new ringQuest.controllers.actions({
        templateDirector: this.templateDirector,
        characterSheet: this.characterSheet,
        element: $('#availableActions')
      });
      $.when(this.actions.ready).done(this.actions.render.bind(this.actions));
      this.actions.on('talkCharacter', this.listenTalk.bind(this));
      this.actions.on('examineCharacter', this.listenExamine.bind(this));
      // this.on('actions:update', this.setAvailableActions.bind(this));
    },
    initializePlayableCharacters: function() {
      var aragorn = this.initializeChar({name: 'aragorn', lat: -60, lng: -86})
      aragorn.model.img = '/assets/sprites/aragorn.gif';
      aragorn.controller.addToMap();
    },
    initializeRingBearer: function() {
      var frodo = this.initializeChar({name: 'frodo', lat: -60, lng: -96})
      frodo.model.speed = 10;
      frodo.model.ringBearer = true;
      frodo.model.img = '/assets/sprites/frodo.gif';
      this.ringBearer = frodo.model;
      var sam = this.initializeChar({name: 'sam', lat: -60, lng: -95})
      sam.model.speed = 8;
      sam.model.img = '/assets/sprites/sam.gif';
      sam.controller.addToMap();


      var fellowship = this.initializeParty({name: 'fellowship', lat: -60, lng: -96});
      fellowship.controller.addToMap();
      fellowship.controller.playerControlled();
      fellowship.model.ringBearer = true;
      fellowship.model.addMember(frodo.model);
      fellowship.model.on('playerPosition:updated', this.setAvailableActions.bind(this));
    },
    initializeEvilMainCharacters: function() {
      var nNazgul = 5;
      var nazgul = [];
      for(var i = 0; i<nNazgul; i++) {
        nazgul[i] = this.initializeChar({name: 'nazgul' + i, lat: -80+(0.01*i)  , lng: -70, type: 'evil'})
        nazgul[i].controller.addToMap();
        nazgul[i].model.pathLimits = {
          maxTileX: 93,
          minTileX: 50,
          maxTileY: 86,
          minTileY: 50
        }
        nazgul[i].model.speed = 8;
        nazgul[i].model.img = '/assets/sprites/nazgul.gif';

        nazgul[i].model.automove();
      }
      for(var i = 5; i<9; i++) {
        nazgul[i] = this.initializeChar({name: 'nazgul' + i, lat: -80+(0.01*i)  , lng: -70, type: 'evil'})
        nazgul[i].controller.addToMap();
        nazgul[i].model.pathLimits = {
          center: {
            x: 68,
            y: 68
          },
          radius:4
        }
        nazgul[i].model.img = '/assets/sprites/nazgul.gif';
        nazgul[i].model.automove();
      }
      nazgul[0].model.img = '/assets/sprites/witch_king.gif';
      var wraith = this.initializeChar({name: 'wraith', lat: -60  , lng: -90, type: 'evil'})
      wraith.model.img = '/assets/sprites/wraith.png';
      wraith.controller.addToMap();

      var oldTree = this.initializeChar({name: 'old_willow_tree', lat: -61  , lng: -92, type: 'evil'})
      oldTree.model.img = '/assets/sprites/eviltree.png';
      oldTree.controller.addToMap();}
    ,
    initializeChar: function(char) {
      var classFactory = {
        'good': ringQuest.models.goodCharacter,
        'evil': ringQuest.models.evilCharacter,
      }
      if(!char.type) char.type = 'good';
      var model = new classFactory[char.type]({
          name:char.name,
          map: this.models.map,
          lat: char.lat, lng: char.lng});
      window.ringQuest.app.models[char.name] = model;
      this.models[char.name] = model;
      this.characters[char.name] = model;

      this.characters[char.name].on('alert', this.listenCharacterLog.bind(this))
      this.characters[char.name].on('attack', this.listenAttack.bind(this))
      this.characters[char.name].on('character:meet', this.listenMeet.bind(this))
      this.characters[char.name].on('death', this.characterDeath.bind(this))
      var controller = new ringQuest.controllers.character({
        model: ringQuest.mdl(char.name),
        map: this.controllers.map
      })
      this.controllers[char.name] = controller;
      return {'model': model, 'controller': controller}

    },
    initializeParty: function(party) {
      var model = new ringQuest.models.party({
          name:party.name,
          map: this.models.map,
          lat: party.lat, lng: party.lng});
      window.ringQuest.app.models[party.name] = model;
      this.models[party.name] = model;
      this.parties[party.name] = model;

      this.parties[party.name].on('alert', this.listenCharacterLog.bind(this))
      this.parties[party.name].on('attack', this.listenAttack.bind(this))
      this.parties[party.name].on('character:meet', this.listenMeet.bind(this))

      var controller = new ringQuest.controllers.character({
        model: ringQuest.mdl(party.name),
        map: this.controllers.map
      })
      this.controllers[party.name] = controller;
      return {'model': model, 'controller': controller}

    },
    initializeLog: function() {
      var self = this;
      this.logger = new base.controllers.log({
        templateDirector: this.templateDirector,
        element: $('#mainLog')
      });
      $.when(this.logger.ready).done(function() {
        self.logger.render();
      })

      for(var name in this.characters) {
        this.characters[name].on('alert', this.listenCharacterLog)
      }
    },
    initializeCombat: function() {
      this.combat = new ringQuest.controllers.combat({
        templateDirector: this.templateDirector,
        element: $('#combatWindow')
      });
      this.combat.on('combatClose', this.runTime.bind(this))
    },
    initializeConversation: function() {
      this.conversation = new ringQuest.controllers.conversation({
        templateDirector: this.templateDirector,
        element: $('#conversationWindow')
      });
      this.conversation.on('conversationClose', this.runTime.bind(this))
      this.conversation.on('joinParty', this.listenJoin.bind(this));
    },
    initializeCharacterSheet: function() {
      this.characterSheet = new ringQuest.controllers.sheet({
        templateDirector: this.templateDirector,
        element: $('#sheetWindow')
      });
      this.characterSheet.on('dialogClose', this.runTime.bind(this))
    },
    listenCharacterLog: function(ev, text) {
      this.logger.log(text)
    },
    listenAttack: function(ev, combattants) {
      this.freezeTime();
      this.combat.initCombat(combattants.offensive,
        combattants.defensive)
    },
    listenTalk: function(ev, char) {
      this.freezeTime();
      this.conversation.talkWith(this.models[char])
    },
    listenExamine: function(ev, char) {
      this.freezeTime();
      this.characterSheet.render(this.models[char])
    },

    listenJoin: function(ev, char) {
      this.parties.fellowship.addMember(char);
    },
    listenMeet: function(ev, char) {
      if(char && (!char.inParty && !char.hasMeet)) {
        char.hasMeet = true;
        this.logger.log('The ring bearer has meet '+char.name)
      }

    },

    characterDeath: function(ev, char) {
      this.logger.log(char.name + ' IS DEAD!!!!')
    },
    freezeTime: function() {
      clearInterval(this.timeInterval)
    },
    runTime: function() {
      this.timeInterval = setInterval(this.tick.bind(this), this.gameSpeed)
    },
    tick: function() {
      for(var name in this.controllers) {
        if(this.controllers[name].movable) {
          this.controllers[name].move();
        }
      }
      for(var name in this.models) {
        if(this.models[name].type == 'character' || this.models[name].type == 'party') {
         setTimeout(this.models[name].checkSurrondings.bind(this.models[name]), (this.gameSpeed / 2));
        }
      }

    },
    setAvailableActions: function() {
      var surrondingChars = this.models.map.getSurrondingChars(this.ringBearer.tile,1);
      var oposition = false;
      this.actions.cleanButtons();
      for(var i in surrondingChars) {
        if(surrondingChars[i].alignment == 'evil') {
          oposition  = true;
        };
        if(surrondingChars[i].type == 'character' && !surrondingChars[i].inParty) {
          this.actions.addAction('examine', surrondingChars[i]);
        }
        if(surrondingChars[i].type == 'character' && surrondingChars[i].alignment == 'good' && !surrondingChars[i].inParty) {
          this.actions.addAction('talk', surrondingChars[i]);
        }
      }
      if(oposition) {
        this.actions.addAction('attack');
      }

      this.actions.refreshButtons();
    }
  })
})()
