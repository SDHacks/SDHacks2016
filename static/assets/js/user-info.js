$(document).ready(function() {
  //Check we are on the right page
  if(typeof user_id !== 'undefined') {
    $('.user-show__answer:not(.user-show__answer--file), .editable').editable('/users/' + user_id + '/edit', {
      indicator: 'Saving...',
      tooltip: 'Click to edit'
    });
  }
});