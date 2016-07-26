$(document).ready(function() {
  //Load the application form
  var applyForm = $(".apply-form");

  //Load in the autocomplete values
  $.getJSON("/assets/schools.json").done(function(data) {
    $(".js-apply-form__universities").autocomplete({
      source: data,
      appendTo: "#applyModal"
    });
    //CSS fix for Foundation
    $('.ui-autocomplete').addClass('dropdown menu').attr("data-dropdown-menu", "");

    new Foundation.DropdownMenu($('.ui-autocomplete'), {});
  });

  $.getJSON("/assets/majors.json").done(function(data) {
    $(".js-apply-form__majors").autocomplete({
      source: data,
      appendTo: "#applyModal"
    });
    //CSS fix for Foundation
    $('.ui-autocomplete').addClass('dropdown menu').attr("data-dropdown-menu", "");

    new Foundation.DropdownMenu($('.ui-autocomplete'), {});
  });

  $(".js-apply-form__open").click(function(e) {
    applyForm.slideDown(500, function() {
      $('html,body').animate({
        scrollTop: applyForm.offset().top
      }, 150, 'swing');
    });

    //Ensure it only opens once
    if(!applyForm.hasClass("js-apply-form__orbit")) {
      new Foundation.Orbit(applyForm);
      applyForm.addClass("js-apply-form__orbit");
    }
  });

  $(".apply-form").submit(function(e) {
    e.preventDefault();
    $(".js-apply-form__error").css('display', 'none');
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
        
        applyForm.foundation('changeSlide', $('.js-apply-form__confirm-slide'));
      },
      error: function(data) {
        data = data.responseJSON;
        if(data.error) {
          $(".js-apply-form__error--message").text(data.error);
          $(".js-apply-form__error").css('display', 'block');
        }
      },
      cache: false,
      contentType: false,
      processData: false
    });
  });
});