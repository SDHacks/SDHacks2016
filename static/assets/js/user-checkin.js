$(document).ready(function() {
  if($(".user-checkin__emails").length === 0) return;
  var currentCheckin = null, checkinParent = null;

  var acceptModal = new Foundation.Reveal($("#user-checkin-accept-modal"), {});
  
  $(".user-checkin__emails--suggestion").hide();
  $(".user-checkin__suggestion").show();
  $(".js-user-checkin__email").on('input', function() {
    var input = $(this).val().toLowerCase();
    if(input.length === 0) {
      return $(".user-checkin__emails--suggestion").hide();
    }
    $.each($(".user-checkin__emails--suggestion"), function(i, suggestion) {
      var email = $(".user-checkin__emails--email", suggestion).text().toLowerCase();
      var name = $(".user-checkin__emails--name", suggestion).text().toLowerCase();
      if(email.startsWith(input) || name.startsWith(input)) {
        $(suggestion).addClass("user-checkin__emails--bordered");
        $(suggestion).show();
      } else {
        $(suggestion).removeClass("user-checkin__emails--bordered");
        $(suggestion).hide();
      }
    }).promise().done(function() {
      $(".user-checkin__emails--suggestion:visible:last").removeClass("user-checkin__emails--bordered");
    });
  });

  $(".js-user-checkin").click(function() {
    currentCheckin = $(this).attr('data-email');
    checkinParent = $(this).parent().parent(); //Double parent to escape column
    $("#user-checkin-accept-modal__name").text($(this).attr('data-name'));
    $("#user-checkin-accept-modal").foundation('open');
  });

  $("#js-user-accept").click(function() {
    $.post("/users/admin/checkin", {email: currentCheckin}, function(data) {
      checkinParent.hide('fast', function() {
        checkinParent.remove();
      });
    }, 'json');
  });
});