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
      //Ensure it only opens once
      if(!applyForm.hasClass("js-apply-form__orbit")) {
        $(".slick-container").slick({
          infinite: false,
          draggable: false,
          arrows: false,
          swipe: false,
          touchMove: false,
          adaptiveHeight: true
        });
        $('#outcomeStmt').restrictLength( $('#outcomeStmt-length-element') );
        applyForm.addClass("js-apply-form__orbit");

        $.validate({
          modules : 'file',
          scrollToTopOnError : false
        });
      }
      $('html,body').animate({
        scrollTop: applyForm.offset().top
      }, 150, 'swing');
      $("input:visible:first", applyForm).focus();
    });
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

  // Disable the Major selection for High Schools
  $("input[type=radio]").on("change", function(e) {
    if (this.value === "hs") {
      $("#major").val("");
      $("#major-error-message").text("");
      $("#major").css("border-color", "#cacaca");
      $("#major").prop("data-validation", "");
      $("#major").prop("disabled", true);
    } else {
      $("#major").prop("disabled", false);
      $("#major").prop("data-validation", "required")
    }
  });

  $("#select-month,#select-date,#select-year").each(function() {
    $(this).on("change", function(e) {
      validateUniYear(e); 
    });
  });
  $("#institution-uni").on("input", function(e) {
    validateUniYear(e);
  });

  // TODO: Add an event that listens for jquery autofill being used

  function validateUniYear (e) {
    // Can be any age
    if ($("#institution-uni").val().indexOf("The University of California") !== -1) {
      // All ages allowed
      $("#select-year").attr("data-validation-allowing", "")
      $("#age-error-message").text("");
      $("#select-year").css("border-color", "#cacaca");
    }
    else {
      // Needs to be over 18 - check age
      $("#select-year").attr("data-validation-allowing", "range[1980;1998]")
      // TODO: Make it work for specific month and date (sept 30)
    }
  }

  $(".js-apply-form__button--final").click(function(e) {
    var form = $(".apply-form");
    if (!$("#apply-form__slide-2").isValid()) {
      return false;
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

        $(".slick-container").slick('slickNext');
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
    show.attr('data-validation', 'required');

    hide.css('display', 'none');
    hide.attr('name', '');
    hide.attr('data-validation', '');

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
    if($("#apply-form__slide-1").isValid()) {
      $(".slick-container").slick('slickNext');
    }
  });

  $("#js-apply-form__previous").click(function() {
    $(".slick-container").slick('slickPrev');
  });
});
