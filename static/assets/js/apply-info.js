$(document).ready(function() {
  //Load in the autocomplete values
  $.getJSON("/assets/schools.json").done(function(data) {
    $(".js-applyForm__universities").autocomplete({
      source: data,
      appendTo: "#applyModal"
    });
    //CSS fix for Foundation
    $('.ui-autocomplete').addClass('dropdown menu').attr("data-dropdown-menu", "");

    new Foundation.DropdownMenu($('.ui-autocomplete'), {});
  });

  $.getJSON("/assets/majors.json").done(function(data) {
    $(".js-applyForm__majors").autocomplete({
      source: data,
      appendTo: "#applyModal"
    });
    //CSS fix for Foundation
    $('.ui-autocomplete').addClass('dropdown menu').attr("data-dropdown-menu", "");

    new Foundation.DropdownMenu($('.ui-autocomplete'), {});
  });
});