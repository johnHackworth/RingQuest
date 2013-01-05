window.ringQuest = {}
window.ringQuest.controllers = {}
window.ringQuest.models = {}
window.ringQuest.app = {}
window.ringQuest.app.controllers = {};
window.ringQuest.app.models = {};
window.ringQuest.mdl = function(name) {
  return this.app.models[name]
}
window.ringQuest.ctrl = function(name) {
  return this.app.controllers[name]
}

$(document).ready(function() {
  var bounds = [[-85.02070, -160.648438], [-43.068888, 83.847656]];
  window.ringQuest.app.models['map'] = new ringQuest.models.map({boundaries: bounds})
  window.ringQuest.app.controllers['mainMap'] = new ringQuest.controllers.mainMap({element:"mainMap", model: ringQuest.mdl('map'), boundaries: bounds})
  window.ringQuest.app.models['frodo'] = new ringQuest.models.goodCharacter({name:"frodo", map: ringQuest.mdl('map'), lat: -60, lng: -96});
  window.ringQuest.app.controllers['frodo'] = new ringQuest.controllers.character({model: ringQuest.mdl('frodo'), map: ringQuest.app.controllers['mainMap']})
  window.ringQuest.app.controllers['frodo'].addToMap();
  window.ringQuest.app.controllers['frodo'].playerControlled();
  window.ringQuest.app.models['frodo'].on('alert', notify);
  window.ringQuest.app.models['aragorn'] = new ringQuest.models.goodCharacter({name:"aragorn", map: ringQuest.mdl('map'), lat: -60, lng: -86});
  window.ringQuest.app.controllers['aragorn'] = new ringQuest.controllers.character({model: ringQuest.mdl('aragorn'), map: ringQuest.app.controllers['mainMap']})
  window.ringQuest.app.controllers['aragorn'].addToMap();
  var nNazgul = 5;
  for(var i = 0; i<nNazgul; i++) {
    window.ringQuest.app.models['nazgul'+i] = new ringQuest.models.evilCharacter({name:"nazgul "+i, map: ringQuest.mdl('map'), lat: -50+i, lng: -76});
    window.ringQuest.app.controllers['nazgul'+i] = new ringQuest.controllers.character({model: ringQuest.mdl('nazgul'+i), map: ringQuest.app.controllers['mainMap']})
    window.ringQuest.app.controllers['nazgul'+i].addToMap();
    window.ringQuest.mdl('nazgul'+i).automove();
  }

  var notify = function(ev, param) {
    alert(param);
  }

});

