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

  var occurrences;

  //Stores copy of total for later
  var all;

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

      all = {
        universities: total.universities,
        majors: total.majors,
        graduatingYears: total.graduatingYears,
        genders: total.genders
      };

      createUniArray(totalApplicants);
      createMajorArray(totalApplicants);

      //Add UI elements for each
      createFilterUI();

      //Update total
      $("#js-filter-total").text(data.length);

      //Filter the results
      updateFilters();

      addClickListeners();
    });
  };

  //Lists for holding sorted data for filtering
  var uniArr;
  var majorArr;

  var uniData = {};
  var majorData = {};

  //Builds a sorted university data for filtering purposes
  var createUniArray = function (applicants) {
    _.each(applicants, function(applicant) {
      if (uniData[applicant.university]) 
        uniData[applicant.university].students++;
      else 
        uniData[applicant.university] = { students: 1, name: applicant.university };
    });
  }

  //Builds sorted array of major data for filtering purposes
  var createMajorArray = function(applicants) {
    _.each(applicants, function(applicant) {
      if (majorData[applicant.major]) 
        majorData[applicant.major].students++;
      else 
        majorData[applicant.major] = { students: 1, name: applicant.major };
    });
  }

  // We want it sorted backwards (most students to least) hence the negative
  var compareStudents = function (uniA, uniB) {
    return -(uniA.students - uniB.students);
  }
  var compareAlphabet = function (uniA, uniB) {
    return uniA.name.localeCompare(uniB.name);
  } 
  var sortByNumber = function(a, b) {
    var classA = a.getElementsByTagName('label')[0].getAttribute('data-occurrences');
    var classB = b.getElementsByTagName('label')[0].getAttribute('data-occurrences');
    var matchesA = classA.match(/\d+$/);
    if (matchesA)
      numberA = parseInt(matchesA[0], 10);
    var matchesB = classB.match(/\d+$/);
    if (matchesB)
      numberB = parseInt(matchesB[0], 10);
    return numberB - numberA;
  }
  var sortByAlphabet = function(a, b) {
    return a.innerText.localeCompare(b.innerText);
  }
  var filterUniversityByStudents = function() {
    var parentNode = universityFilter[0];
    var arr = [].slice.call(parentNode.children);
    arr.sort(sortByNumber).forEach(function(val, index) {
      parentNode.appendChild(val);
    });
  }
  var filterUniversityByAlphabet = function() {
    var parentNode = universityFilter[0];
    var arr = [].slice.call(parentNode.children);
    var sorted = arr.sort(sortByAlphabet);
    sorted.forEach(function(val, index) {
      parentNode.appendChild(val);
    });
  }
  var filterMajorByStudents = function() {
    var parentNode = majorFilter[0];
    var arr = [].slice.call(parentNode.children);
    var sorted = arr.sort(sortByNumber);
    sorted.forEach(function(val, index) {
      parentNode.appendChild(val);
    });
  }
  var filterMajorByAlphabet = function() {
    var parentNode = majorFilter[0];
    var arr = [].slice.call(parentNode.children);
    arr.sort(sortByAlphabet).forEach(function(val, index) {
      parentNode.appendChild(val);
    });
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
  var check_ctr = 0;

  var createFilterElement = function (value, text, checked, occurrences) {
    var div = $("<div class='filter-wrap' id='filter-wrap-" + checkElem + "'></div>")
      .addClass('sponsor-show__filter-option');
    var input = $("<input />")
      .attr('type', 'checkbox')
      .attr('value', value)
      .attr('id', 'filter-check-' + checkElem)
      .attr('checked', checked);
    var label = $("<label></label>")
      .attr('for', 'filter-check-' + checkElem++)
      // .attr('class', 'check-ctr-' + check_ctr++)
      .text(text);

    if (occurrences) label.attr('data-occurrences', occurrences)

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
  var first_filter = true;
  var createFilterUI = function(option) {
    if (!option) option = ["university", "year", "major", "gender"];
    else if (typeof option === String) option = [option];
    
    if (option.indexOf("university") !== -1) {
      _.each(total.universities, function(university) {
        if(typeof university === "undefined") return;

        var element = createFilterElement(university.toLowerCase(), university, uniData[university].checked, uniData[university].students);
        universityFilter.append(element);
      });
    }

    check_ctr = 0;
    if (option.indexOf("year") !== -1) {
      _.each(total.graduatingYears, function(year) {
        if(typeof year === "undefined") return;

        var element = createFilterElement(year, year, true);
        yearFilter.append(element);
      });
    }

    check_ctr = 0;
    if (option.indexOf("major") !== -1) {
      _.each(total.majors, function(major) {
        if(typeof major === "undefined") return;

        var element = createFilterElement(major.toLowerCase(), major, majorData[major].checked, majorData[major].students);
        majorFilter.append(element);
      });
    }

    check_ctr = 0;
    if (option.indexOf("gender") !== -1) {
      _.each(total.genders, function(gender) {
        if(typeof gender === "undefined") return;

        var element = createFilterElement(gender.toLowerCase(), gender, true);
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
    addClickListeners();
  }

  // TODO: implement caching state
  $("#js-university-most-common").click(function() {
    $(this).toggleClass("inactive");
    $("#js-university-alphabetical").addClass("inactive");
    filterUniversityByStudents();
    updateFilterUI("university");
    $("#js-university-search").val("");
  });

  $("#js-university-alphabetical").click(function() {
    $(this).toggleClass("inactive");
    $("#js-university-most-common").addClass("inactive");
    filterUniversityByAlphabet();
    updateFilterUI("university");
    $("#js-university-search").val("");
  });

  $("#js-major-alphabetical").click(function() {
    $(this).toggleClass("inactive");
    $("#js-major-most-common").addClass("inactive");
    filterMajorByAlphabet();
    updateFilterUI("major");
    $("#js-major-search").val("");
  });

  $("#js-major-most-common").click(function() {
    $(this).toggleClass("inactive");
    $("#js-major-alphabetical").addClass("inactive");
    filterMajorByStudents();
    updateFilterUI("major");
    $("#js-major-search").val("");
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
  });

  // Search functionality
  var prefix;
  var prefixMatch = function(str) {
    return str.startsWith(prefix);
  }
  $("#js-university-search").on("input", function() {
    // Update the list of universities and re-render
    prefix = $(this).val();
    total.universities = all.universities.filter(prefixMatch);
    updateFilterUI("university");
  });

  $("#js-major-search").on("input", function() {
    // Update the list of universities and re-render
    prefix = $(this).val();
    total.majors = all.majors.filter(prefixMatch);
    updateFilterUI("major");
  });

  //Keeps track of checked elements
  var addClickListeners = function () {
    $("#js-filter-university .filter-wrap label").click(function() {
      uniData[$(this)[0].innerText].checked = !uniData[$(this)[0].innerText].checked;
      console.log(uniData);
    });
    $("#js-filter-major .filter-wrap label").click(function() {
      majorData[$(this)[0].innerText].checked = !majorData[$(this)[0].innerText].checked;
    });  
  }
});