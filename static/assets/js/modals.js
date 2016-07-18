$(document).ready(function() {
  new Foundation.Reveal($("#applyModal"), {});
  new Foundation.Reveal($("#applyNextModal"), {});

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
      $.ajax({
        type: "POST",
        url: "/api/register",
        data: $("#applyForm").serialize(),
        success: function(data) {
          //JWT Token
          var token = data.token;
          ga('send', 'event', 'Registration', 'registered');
        },
        error: function(data) {
          //Incorrect form data
          alert('error');
        }
      });
    }
  });
});
