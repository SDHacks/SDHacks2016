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

      document.getElementById('hex-hr').innerHTML = 0 + '<p>Hours</p>';
      document.getElementById('hex-min').innerHTML = 0 + '<p>Minutes</p>';
      document.getElementById('hex-sec').innerHTML = 0 + '<p>Seconds</p>';
  }

  timer = setInterval(showRemaining, 1000);
});
