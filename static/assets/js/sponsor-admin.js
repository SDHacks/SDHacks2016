$(document).ready(function() {
  $(".js-delete-sponsor").click(function() {
    var sponsor_id = $(this).attr('data-sponsor');
    var currentRow = $(this).closest('tr');
    $.getJSON("/sponsors/" + sponsor_id + "/delete", {}, function(data) {
      currentRow.hide("fast", function() {
        currentRow.remove();
      });
    });
  });

  $("#js-create-sponsor").submit(function(e) {
    e.preventDefault();
    var data = $(this).serialize();

    $.ajax({
      url: '/sponsors/create',
      type: 'POST',
      data: data,
      async: true,
      success: function (data) {
        $("#js-company-name").val('');
        $("#js-company-output").text(data.login.password);
      },
      error: function(data) {
        alert('Something went wrong');
      },
      cache: false
    });
  });
});