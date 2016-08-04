$(document).ready(function() {
  //Check we are on the right page
  if(typeof user_id !== 'undefined') {
    $('.user-show__answer:not(.user-show__answer--file), .editable').editable('/users/' + user_id + '/edit', {
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

      $.ajax({
        url: '/api/upload',
        type: 'POST',
        data: formData,
        async: true,
        success: function (data) {
          error.addClass("user-show__answer--success");
          error.text("Resume successfully updated");

          $("input[type=file]", $("#upload-form")).val('');
        },
        error: function(data) {
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