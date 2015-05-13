$(document).ready(function() {
  var parsePath = /^\/([A-Za-z_]+)\/([A-Za-z0-9 %]+)/
  var pathResults = parsePath.exec(window.location.pathname)
  var username = pathResults[2];
  HABRAB.populateHabitList(username);
});