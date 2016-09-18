$(document).ready(function() {
  //Check we are on the right page
  if(typeof user_id !== 'undefined') {
    new Foundation.Reveal($("#user-show-accept-modal"), {});
    new Foundation.Reveal($("#user-show-decline-modal"), {});

    var changeStatus = function(status) {
      $.getJSON("/users/"+user_id+"/accept", {
          status: status
        },function(data) {
        if(data.error) {
          return console.error("There was an error accepting the invitation");
        }

        location.reload();
      });
    };

    $("#js-user-accept").click(function() {
      changeStatus(true);
    });

    $("#js-user-decline").click(function() {
      changeStatus(false);
    });

    $('.user-show__answer:not(.user-show__answer--not-editable), .user-show__editable').editable('/users/' + user_id + '/edit', {
      indicator: 'Saving...',
      tooltip: 'Click to edit'
    });

    $.validate({
      modules : 'file',
      scrollToTopOnError : false
    });

    $("#upload-form").submit(function(e) {
      e.preventDefault();

      var formData = new FormData($(this)[0]);
      var error = $("#upload-form-error");
      //Clear the error text
      error.text('');
      error.removeClass();

      //Show the spinner
      $(".spinner").css('display', 'inline-block');

      $.ajax({
        url: '/api/upload',
        type: 'POST',
        data: formData,
        async: true,
        success: function (data) {
          $(".spinner").css('display', 'none');

          error.addClass("user-show__answer--success");
          error.text("Resume successfully updated");
          $("#resume").attr('href', data.url);

          $("input[type=file]", $("#upload-form")).val('');
        },
        error: function(data) {
          $(".spinner").css('display', 'none');
          error.addClass("user-show__answer--error");
          error.text("Resume update threw an error");
        },
        cache: false,
        contentType: false,
        processData: false
      });
    });
  }
});