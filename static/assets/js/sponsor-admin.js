$(document).ready(function() {
  var deleteSponsor = function() {
    var sponsor_id = $(this).attr('data-sponsor');
    var currentRow = $(this).closest('tr');
    $.getJSON("/sponsors/" + sponsor_id + "/delete", {}, function(data) {
      currentRow.hide("fast", function() {
        currentRow.remove();
      });
    });
  };

  $(".js-delete-sponsor").click(deleteSponsor);

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
        var row = $("<tr></tr>");
        row.append($("<td></td>")
          .addClass("text-center")
          .append($("<a></a>")
            .addClass("js-delete-sponsor")
            .attr('data-sponsor', data.sponsor._id)
            .html('<i class="fa fa-trash"></i>')
          ));
        row.append($("<td></td>")
          .text('a few seconds ago'));
        row.append($("<td></td>")
          .text(data.sponsor.companyName));
        row.append($("<td></td>")
          .append($("<a></a>")
            .attr('href', '/sponsors')
            .text(data.sponsor.login.username)
          ));
        $("#sponsor-table tr:first").after(row);

        $("#js-company-output").text(data.password);

        //Reinitialise event
        $(".js-delete-sponsor").click(deleteSponsor);
      },
      error: function(data) {
        alert('Something went wrong');
      },
      cache: false
    });
  });
});