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
        url: "/register",
        data: $("#applyForm").serialize(),
        success: function(data) {
            alert(data);
        }
      });
    }
  });
});
