$(document).ready(function() {
  var totalApplicants = [];
  var filteredApplicants = [];
  //All distinct elements
  var total = {
    universities: [],
    graduatingYears: [],
    majors: [],
    genders: []
  };

  var filters = {
    universities: [],
    graduatingYears: [],
    majors: [],
    genders: []
  };

  //Filter fields
  var universityFilter = $("#js-filter-university");
  var yearFilter = $("#js-filter-year");
  var majorFilter = $("#js-filter-major");
  var genderFilter = $("#js-filter-gender");

  var getApplicants = function() {
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

      total.genders = _.uniq(totalApplicants, 'gender')
      .map(function(user) {
        return user.gender;
      });
      total.genders = _.sortBy(total.genders);

      //Add UI elements for each
      createFilterUI();

      //Update total
      $("#js-filter-total").text(data.length);

      //Filter the results
      updateFilters();
    });
  };

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
    filters.genders = _.map($("input:checked", genderFilter), function(input) {
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

      if(!_.contains(filters.genders, user.gender.toLowerCase())) {
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

    _.each(total.genders, function(gender) {
      if(typeof gender === "undefined") return;

      var element = createFilterElement(gender.toLowerCase(), gender);
      genderFilter.append(element);
    });

    $(".sponsor-show__filter-option > :input").change(function() {
      updateFilters();
    });
  };

  $("#js-filter-download").click(function() {
    var applicants = _.map(filteredApplicants, function(user) {
      return user._id;
    });

    $.post('/sponsors/applicants/download', {'applicants': applicants}, function(data) {
      if(data.error || !data.file) {
        console.error('Could not download selected applicants');
        return;
      }

      top.location.href = data.file;
    }, "json");
  });

  if($("#js-filter-download").length) {
    getApplicants();
  }

  $("#js-university-most-common").click(function() {
    console.log(total.universities);
  });

  $("#js-university-select-all").click(function() {
    $("#js-filter-university input").prop("checked", true);
  });

  $("#js-university-select-none").click(function() {
    $("#js-filter-university input").prop("checked", false);
  });

  $("#js-major-select-all").click(function() {
    $("#js-filter-major input").prop("checked", true);
  });

  $("#js-major-select-none").click(function() {
    $("#js-filter-major input").prop("checked", false);
  });

});