window.ringQuest = {}
window.ringQuest.controllers = {}
window.ringQuest.models = {}
window.ringQuest.directors = {}
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
  window.jackson = new ringQuest.directors.game({});
});

