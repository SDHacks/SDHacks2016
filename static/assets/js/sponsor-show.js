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

  /*
  Best way to filter this: how to do it?

  Look at totalApplicants (list of all applicants) and make json regarding
  the number of occurences.

  */

  //Filter fields
  var universityFilter = $("#js-filter-university");
  var yearFilter = $("#js-filter-year");
  var majorFilter = $("#js-filter-major");
  var genderFilter = $("#js-filter-gender");

  var uniData = {};
  var majorData = {};

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

      sortUniArray(totalApplicants);
      sortMajorArray(totalApplicants);
    });
  };

  //Lists for holding sorted data for filtering
  var uniArr;
  var majorArr;

  //Builds a sorted university data for filtering purposes
  var sortUniArray = function (applicants) {
    _.each(applicants, function(applicant) {
      if (uniData[applicant.university]) 
        uniData[applicant.university].students++;
      else 
        uniData[applicant.university] = { students: 1, name: applicant.university };
    });

    uniArr = $.map(uniData, function(el) { return el });
    uniArr.sort(compareStudents);
  }

  //Builds sorted array of major data for filtering purposes
  var sortMajorArray = function(applicants) {
    _.each(applicants, function(applicant) {
      if (majorData[applicant.major]) 
        majorData[applicant.major].students++;
      else 
        majorData[applicant.major] = { students: 1, name: applicant.major };
    });

    majorArr = $.map(majorData, function(el) { return el });
    majorArr.sort(compareStudents);
  }

  // We want it sorted backwards (most students to least) hence the negative
  var compareStudents = function (uniA, uniB) {
    return -(uniA.students - uniB.students);
  }
  var compareAlphabet = function (uniA, uniB) {
    return uniA.name.localeCompare(uniB.name);
  } 
  var filterUniversityByStudents = function() {
    uniArr.sort(compareStudents);
    total.universities = []
    for (var i=0; i<uniArr.length; i++) {
      total.universities.push(uniArr[i].name);
    }
  }
  var filterUniversityByAlphabet = function() {
    uniArr.sort(compareAlphabet);
    total.universities = []
    for (var i=0; i<uniArr.length; i++) {
      total.universities.push(uniArr[i].name);
    }
  }
  var filterMajorByStudents = function() {
    majorArr.sort(compareStudents);
    total.majors = []
    for (var i=0; i<majorArr.length; i++) {
      total.majors.push(majorArr[i].name);
    }
  }

  var filterMajorByAlphabet = function() {
    majorArr.sort(compareAlphabet);
    total.majors = []
    for (var i=0; i<majorArr.length; i++) {
      total.majors.push(majorArr[i].name);
    }
  }

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
  var unis = [];

  var createFilterElement = function (value, text) {
    var div = $("<div></div>")
      .addClass('sponsor-show__filter-option');
    var input = $("<input />")
      .attr('type', 'checkbox')
      .attr('value', value)
      .attr('id', 'filter-check-' + checkElem);
    var label = $("<label></label>")
      .attr('for', 'filter-check-' + checkElem++)
      .text(text);

    div.append(input);
    div.append(label);

    unis.push({text: div});
    return div;
  };

  //This will render all filter fields
  var createFilterUI = function() {
    createFilterUI(null);
  }
  //Renders filter fields, based on params. 
  //Possible: "university", "year", "major", "gender". Accepts lists or
  // individual strings
  var createFilterUI = function(option) {
    if (!option) option = ["university", "year", "major", "gender"];
    else if (typeof option === String) option = [option];
    
    if (option.indexOf("university") !== -1) {
      _.each(total.universities, function(university) {
        if(typeof university === "undefined") return;

        var element = createFilterElement(university.toLowerCase(), university);
        universityFilter.append(element);
      });
    }

    if (option.indexOf("year") !== -1) {
      _.each(total.graduatingYears, function(year) {
        if(typeof year === "undefined") return;

        var element = createFilterElement(year, year);
        yearFilter.append(element);
      });
    }

    if (option.indexOf("major") !== -1) {
      _.each(total.majors, function(major) {
        if(typeof major === "undefined") return;

        var element = createFilterElement(major.toLowerCase(), major);
        majorFilter.append(element);
      });
    }

    if (option.indexOf("gender") !== -1) {
      _.each(total.genders, function(gender) {
        if(typeof gender === "undefined") return;

        var element = createFilterElement(gender.toLowerCase(), gender);
        genderFilter.append(element);
      });
    }

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

  //Clears all filter areas for re-rendering
  var updateFilterUI = function() {
    updateFilterUI(null);
  }
  //Clears filter areas (based on params) for re-rendering.
  //Same params as createFilterUI()
  var updateFilterUI = function(option) {
    //Clear filters
    if (!option) option = ["university", "year", "major", "gender"];
    else if (typeof option === "string") option = [option];

    if (option.indexOf("university") !== -1) universityFilter.html("");
    if (option.indexOf("year") !== -1) yearFilter.html("");
    if (option.indexOf("gender") !== -1) genderFilter.html("");
    if (option.indexOf("major") !== -1) majorFilter.html("");
    createFilterUI(option);
  }

  $("#js-university-most-common").click(function() {
    $(this).toggleClass("inactive");
    $("#js-university-alphabetical").addClass("inactive");
    filterUniversityByStudents();
    updateFilterUI("university");
  });

  $("#js-university-alphabetical").click(function() {
    $(this).toggleClass("inactive");
    $("#js-university-most-common").addClass("inactive");
    filterUniversityByAlphabet();
    updateFilterUI("university");
  });

  $("#js-major-alphabetical").click(function() {
    $(this).toggleClass("inactive");
    $("#js-major-most-common").addClass("inactive");
    filterMajorByAlphabet();
    updateFilterUI("major");
  });

  $("#js-major-most-common").click(function() {
    $(this).toggleClass("inactive");
    $("#js-major-alphabetical").addClass("inactive");
    filterMajorByStudents();
    updateFilterUI("major");
  });

  // Methods for highlighting all or none
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

  $("#js-select-everything").click(function() {
    $(".resume-browser input").prop("checked", true);
  });

  $("#js-select-nothing").click(function() {
    $(".resume-browser input").prop("checked", false);
  });

  //Select everything initially
  $(".resume-browser input").prop("checked", true);

  $("a.button").click(function() {
    updateFilters();
  })

});