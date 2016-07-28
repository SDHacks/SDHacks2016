$(document).ready(function() {
  $('.user-show__answer:not(.user-show__answer--file), .editable').editable('/users/' + user_id + '/edit', {
    indicator: 'Saving...',
    tooltip: 'Click to edit'
  });
})