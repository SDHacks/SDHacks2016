$(document).ready(function() {
  $(".js-delete-user").click(function() {
    var user_id = $(this).attr('data-user');
    var currentRow = $(this).closest('tr');
    $.getJSON("/users/" + user_id + "/delete", {}, function(data) {
      currentRow.hide("fast", function() {
        currentRow.remove();
      });
    });
  });

  $(".js-accept-user").click(function() {
    var user_id = $(this).attr('data-user');
    var currentRow = $(this).closest('tr');
    $.getJSON("/users/" + user_id + "/unwaitlist", {}, function(data) {
      currentRow.hide("fast", function() {
        currentRow.remove();
      });
    });
  });
});