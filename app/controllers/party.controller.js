(function() {
  var base = window.ringQuest;

  base.controllers.party = base.controllers.controller.extend({

    template: 'nil',
    actions: [],
    initialize: function(options) {
      var dfd = $.Deferred();
      this.ready = dfd.promise();

      var self = this;
      this.element = options.element;
      this.model = options.party;
      this.templateDirector = options.templateDirector;
      this.characterSheet = options.characterSheet;
      $.when(this.templateDirector.get('party')).done(function(res, res2) {
        self.frameTemplate = self.templateDirector.getSubtemplate('party', 'frame');
        self.buttonsTemplate = self.templateDirector.getSubtemplate('party', 'buttons');
        self.membersTemplate = self.templateDirector.getSubtemplate('party', 'members');
        dfd.resolve();
      })
      this.element.on('click', 'a.sneak', this.listenSneak.bind(this));
      this.element.on('click', '.charInfo', this.listenChar.bind(this));
    },
    renderAndFill: function() {
      this.render();
      this.updateView();
    },
    render: function() {
      this.element.html(this.frameTemplate);
    },
    updateView: function() {
      this.element.find('.partyMembers').html(_.template(this.membersTemplate, this.model))
      this.element.find('.partyActions').html(_.template(this.buttonsTemplate, this.model))
    },
    listenSneak: function(ev) {
      this.element.find('a.sneak').toggleClass('selected');
      this.model.toggleSneak();
    },
    listenChar: function(ev) {
      var charName = $(ev.currentTarget).data('char')
      var character = this.model.getMember(charName);
      if(character) {
        this.characterSheet.render(character);
      }
    }
  })
})()
