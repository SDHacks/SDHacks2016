$(document).ready(function() {
  new Foundation.Reveal($("#applyModal"), {});
  new Foundation.Reveal($("#applyNextModal"), {});

  $("#applyModal").validate({
    onsubmit: false,
    onfocusout: true,
    focusInvalid: true,
    onkeyup: true
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
        },
        error: function(data) {
          //Incorrect form data
          alert('error');
        }
      });
    }
  });
});
