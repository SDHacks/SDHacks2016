$(document).ready(function() {
  var totalApplicants = [];
  var filteredApplicants = [];
  //All distinct elements
  var total = {
    universities: [],
    graduatingYears: [],
    majors: []
  };

  var filters = {
    universities: [],
    graduatingYears: [],
    majors: []
  };

  //Filter fields
  var universityFilter = $("#js-filter-university");
  var yearFilter = $("#js-filters-year");
  var majorFilter = $("#js-filter-major");

  $.getJSON('/sponsors/applicants', function(data) {
    totalApplicants = data;

    //Get distinct elements for each of the fields
    total.universities = _.uniq(totalApplicants, function(x) {
      return x.university.toLowerCase();
    }).map(function(user) {
      return user.university;
    });
    total.universities = _.sortBy(total.universities);

    total.graduatingYears = _.uniq(totalApplicants, 'year')
    .map(function(user) {
      return user.year;
    });
    total.graduatingYears = _.sortBy(total.graduatingYears);

    total.majors = _.uniq(totalApplicants, 'major')
    .map(function(user) {
      return user.major;
    });
    total.majors = _.sortBy(total.majors);

    //Add UI elements for each
    createFilterUI();

    //Update total
    $("#js-filter-total").text(data.length);

    //Filter the results
    updateFilters();
  });

  var updateFilters = function() {
    filters.universities = _.map($("input:checked", universityFilter), function(input) {
      return $(input).val();
    });
    filters.graduatingYears = _.map($("input:checked", yearFilter), function(input) {
      return $(input).val();
    });
    filters.majors = _.map($("input:checked", majorFilter), function(input) {
      return $(input).val();
    });

    //Filter applicants
    filteredApplicants = _.filter(totalApplicants, function(user) {
      if(!_.contains(filters.universities, user.university.toLowerCase())) {
        return false;
      }

      if(!_.contains(filters.majors, user.major.toLowerCase())) {
        return false;
      }

      if(!_.contains(filters.graduatingYears, user.year.toString())) {
        return false;
      }

      return true;
    });

    $("#js-filter-selected").text(filteredApplicants.length);
  };

  var checkElem = 0;
  var createFilterElement = function (value, text) {
    var div = $("<div></div>")
        .addClass('sponsor-show__filter-option');
      var input = $("<input />")
        .attr('type', 'checkbox')
        .attr('value', value)
        .attr('checked', true)
        .attr('id', 'filter-check-' + checkElem);
      var label = $("<label></label>")
        .attr('for', 'filter-check-' + checkElem++)
        .text(text);

      div.append(input);
      div.append(label);
      return div;
  };

  var createFilterUI = function() {
    _.each(total.universities, function(university) {
      if(typeof university === "undefined") return;

      var element = createFilterElement(university.toLowerCase(), university);
      universityFilter.append(element);
    });

    _.each(total.graduatingYears, function(year) {
      if(typeof year === "undefined") return;

      var element = createFilterElement(year, year);
      yearFilter.append(element);
    });

    _.each(total.majors, function(major) {
      if(typeof major === "undefined") return;

      var element = createFilterElement(major.toLowerCase(), major);
      majorFilter.append(element);
    });

    $(".sponsor-show__filter-option > :input").change(function() {
      updateFilters();
    });
  };
});