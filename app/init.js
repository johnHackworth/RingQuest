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
  var bounds =  [[-85.02070, -179.648438], [-43.068888, 83.847656]];
  window.ringQuest.app.models['map'] = new ringQuest.models.map({boundaries: bounds})
  window.ringQuest.app.controllers['mainMap'] = new ringQuest.controllers.mainMap({element:"mainMap", model: ringQuest.mdl('map'), boundaries: bounds})
  window.ringQuest.app.models['frodo'] = new ringQuest.models.character({name:"frodo"});
  window.ringQuest.app.controllers['frodo'] = new ringQuest.controllers.character({model: ringQuest.mdl('frodo'), map: ringQuest.app.controllers['mainMap']})
  window.ringQuest.app.controllers['frodo'].addToMap();
});

