$(document).ready(function() {
  //Load the application form
  var applyForm = $(".apply-form");

  function mustMatch(event, ui) {
    var source = $(this).val();
    var temp = $(".ui-autocomplete li").map(function () { return $(this).text(); }).get();
    var found = $.inArray(source, temp);

    if(found < 0) {
        $(this).val('');
    }
  }

  //Load in the autocomplete values
  $.getJSON("/assets/schools.json").done(function(data) {
    $(".js-apply-form__universities").autocomplete({
      source: data,
      change: mustMatch
    });
    //CSS fix for Foundation
    $('.ui-autocomplete').addClass('dropdown menu').attr("data-dropdown-menu", "");

    new Foundation.DropdownMenu($('.ui-autocomplete'), {});
  });

  $.getJSON("/assets/majors.json").done(function(data) {
    $(".js-apply-form__majors").autocomplete({
      source: data,
      change: mustMatch
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
      $("input:visible:first", applyForm).focus();
    });

    //Ensure it only opens once
    if(!applyForm.hasClass("js-apply-form__orbit")) {
      new Foundation.Orbit(applyForm);
      applyForm.addClass("js-apply-form__orbit");
    }
  });

  $(".js-apply-form__close").click(function(e) {
    applyForm.slideUp(500, function() {
      $('html,body').animate({
        scrollTop: 0
      }, 150, 'swing');
    });
  });

  var showError = function(message) {
    $(".js-apply-form__error--message").text(message);
    $(".js-apply-form__error").css('display', 'block');
  };

  $(".apply-form").submit(function(e) {
    return false;
  });

  $(".js-apply-form__button--final").click(function(e) {
    var form = $(".apply-form");
    if ((typeof(form[0].checkValidity) == "function" ) && !form[0].checkValidity()) {
      showError('Please fill out all required fields');
      return form.submit();
    }
    showError("");
    $(".spinner", applyForm).css('display', 'inline-block');

    var formData = new FormData(form[0]);

    $.ajax({
      url: '/api/register',
      type: 'POST',
      data: formData,
      async: true,
      success: function (data) {
        ga('send', 'event', 'Registration', 'registered');

        $("#js-apply-form__email").text(data.email);
        
        $(".spinner", applyForm).css('display', 'none');
        $(".apply-form__container").css('height', '');

        applyForm.foundation('changeSlide', true, $('.js-apply-form__confirm-slide'));
        $('html,body').animate({
          scrollTop: applyForm.offset().top
        }, 150, 'swing');
      },
      error: function(data) {
        $(".spinner", applyForm).css('display', 'none');
        data = data.responseJSON;
        if(data.error) {
          showError(data.error);
        }
      },
      cache: false,
      contentType: false,
      processData: false
    });
  });

  jQuery.ui.autocomplete.prototype._resizeMenu = function () {
    var ul = this.menu.element;
    ul.outerWidth(this.element.outerWidth());
  };

  $("#instituton-radio").change(function() {
    var uni = $("#institution-uni");
    var hs = $("#institution-hs");

    var hide = null, show = null, label = null, majorRequired = false;
    if($("#institution-radio-uni").is(':checked')) {
      hide = hs;
      show = uni;
      label = "University";
      majorRequired = true;
    } else {
      show = hs;
      hide = uni;
      label = "High School";
      majorRequired = false;
    }

    show.css('display', 'block');
    show.attr('name', 'university');
    show.attr('required', true);

    hide.css('display', 'none');
    hide.attr('name', '');
    hide.attr('required', false);

    if(majorRequired) {
      $("#major").attr('required', true);
      $("#major-label").addClass("apply-form__required");
    } else {
      $("#major").attr('required', false);
      $("#major-label").removeClass("apply-form__required");
    }

    $("#institution-label").text(label);
  });

  $("#outofstate").change(function() {
    var outOfState = $("input[type=radio]:checked", this).val() === 'true';
    if(outOfState) 
      $("#city").attr('disabled', false);
    else
      $("#city").attr('disabled', true);
  });

  $("#js-apply-form__next").click(function() {
    var valid = true;
    $.each($("input, select", $("#apply-form__slide-1")), function() {
      var input = $(this);
      var visible = input.is(":visible");
      if(this.validity && visible && !this.validity.valid) {
        valid = false;
      }
    }).promise().done(function() {
      if(valid) {
        applyForm.foundation('changeSlide', true, $("#apply-form__slide-2"));
      }
    });
  });

  $("#js-apply-form__previous").click(function() {
    applyForm.foundation('changeSlide', false, $("#apply-form__slide-1"));
  });
});