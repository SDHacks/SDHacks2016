$(document).ready(function() {
  if($(".countdown-hexes").length < 1) return;
  
  var end = new Date('Sun, 02 Oct 2016 10:00:00 GMT-0700');
  var _second = 1000;
  var _minute = _second * 60;
  var _hour = _minute * 60;
  var _day = _hour * 24;
  var timer;

  function showRemaining() {
      var now = new Date();
      var distance = end - now;
      var days = Math.floor(distance / _day);
      var hours = days*24 + Math.floor((distance % _day) / _hour);
      var minutes = Math.floor((distance % _hour) / _minute);
      var seconds = Math.floor((distance % _minute) / _second);

      document.getElementById('hex-hr').innerHTML = hours + '<p>Hours';
      document.getElementById('hex-min').innerHTML = minutes + '<p>Minutes';
      document.getElementById('hex-sec').innerHTML = seconds + '<p>Seconds';
  }

  timer = setInterval(showRemaining, 1000);
});
