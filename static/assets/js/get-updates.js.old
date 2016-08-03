button_status = false;

$(document).ready(function() {

  // Safari 
  // if (navigator.userAgent.indexOf('Safari') != -1 && 
  //   navigator.userAgent.indexOf('Chrome') == -1) {
  //   $("#sdhx-subscribe").css('right', '-2px');
  // }

  $("#sdhx-subscribe, #sdhx-email").click(function(event) {
    event.stopPropagation();
    // Block submission and open textbox
    if (button_status === false) {
      event.preventDefault();
      button_status = true;
      $("#sdhx-subscribe").css('min-width', '30%');
      $("#sdhx-subscribe").attr("value", "Go!");
      $("#sdhx-email").focus();
      $("#sdhx-subscribe").css('min-width', '30%');
    }
    // Trigger the submission when button is filled
    else {
      return true;
    }
  });

  // Close button when clicked outside
  $('html').click(function() {
    if(!(document.getElementById("sdhx-email").value)) {
      button_status = false;
      $("#sdhx-subscribe").css('min-width', '100%');
      setTimeout(function() {
      $("#sdhx-subscribe").attr("value", "Get Updates!");
      }, 250);
    } else {
      button_status = true;
    }
  });
});