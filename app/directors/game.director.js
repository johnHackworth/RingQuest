(function() {
  var base = window.ringQuest;
  base.directors.game = Seed.extend({
    mapBounds: [[-85.02070, -160.648438], [-43.068888, 83.847656]],
    models: {},
    controllers: {},
    characters: {},
    templateDirector: null,
    initialize: function() {
      this.templateDirector = new base.directors.template({});
      this.bindMethods();
      this.initializeLog();
      this.initializeMap();
      this.initializeRingBearer();
      this.initializePlayableCharacters();
      this.initializeEvilMainCharacters();
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
    initializePlayableCharacters: function() {
       var aragorn = this.initializeChar({name: 'aragorn', lat: -60, lng: -86})
      aragorn.controller.addToMap();
    },
    initializeRingBearer: function() {
      var frodo = this.initializeChar({name: 'frodo', lat: -60, lng: -96})
      frodo.controller.addToMap();
      frodo.controller.playerControlled();
      frodo.model.ringBearer = true;
    },
    initializeEvilMainCharacters: function() {
      var nNazgul = 5;
      var nazgul = [];
      for(var i = 0; i<nNazgul; i++) {
        nazgul[i] = this.initializeChar({name: 'nazgul' + i, lat: -80+(0.01*i), lng: -70, type: 'evil'})
        nazgul[i].controller.addToMap();
        nazgul[i].model.pathLimits = {
          maxTileX: 93,
          minTileX: 50,
          maxTileY: 86,
          minTileY: 50
        }
        nazgul[i].model.automove();
      }
    },
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

      this.characters[char.name].on('alert', this.listenCharacterLog)
      this.characters[char.name].on('attack', this.listenAttack)
      this.characters[char.name].on('meet', this.listenMeet)

      var controller = new ringQuest.controllers.character({
        model: ringQuest.mdl(char.name),
        map: this.controllers.map
      })
      window.ringQuest.app.controllers[char.name] = controller;
      this.controllers[char.name] = controller;

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
    listenCharacterLog: function(ev, text) {
      this.logger.log(text)
    },
    listenAttack: function(ev, combattants) {

    },
    listenMeet: function(ev, char) {
      this.logger.log('The ring bearer has meet '+char.name)
    }
  })
})()
