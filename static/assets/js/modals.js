$(document).ready(function() {
  new Foundation.Reveal($("#applyModal"), {});
  new Foundation.Reveal($("#applyNextModal"), {});
  new Foundation.Reveal($("#applyDoneModal"), {});

  $(window).on('open.zf.reveal', function(e) {
    if($("#applyModal").is(e.target)) {
      ga('send', 'event', 'Registration', 'apply');
    }
  });

  $("#applyForm").submit(function(e) {
    e.preventDefault();
    var finalSubmit = $(document.activeElement).hasClass("js-final");

    if(!finalSubmit) {
      $("#applyNextModal").foundation('open');
    } else {
      var formData = new FormData($(this)[0]);

      $.ajax({
        url: '/api/register',
        type: 'POST',
        data: formData,
        async: true,
        success: function (data) {
          //JWT Token
          var token = data.token;
          ga('send', 'event', 'Registration', 'registered');
          $("#applyNextModal").foundation('close');
          $("#applyDoneModal").foundation('open');
        },
        cache: false,
        contentType: false,
        processData: false
      });
    }
  });
});
