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
    var finalSubmit = $(document.activeElement).hasClass("js-apply-modal__button--final");
    var back = $(document.activeElement).hasClass("js-apply-modal__button--back");

    if(!finalSubmit) {
      if(!back)
        $("#applyNextModal").foundation('open');
      else
        $("#applyModal").foundation('open');
    } else {
      $(".js-apply-modal__error").css('display', 'none');
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
        error: function(data) {
          data = data.responseJSON;
          if(data.error) {
            $(".js-apply-modal__error--message").text(data.error);
            $(".js-apply-modal__error").css('display', 'block');
          }
        },
        cache: false,
        contentType: false,
        processData: false
      });
    }
  });
});
