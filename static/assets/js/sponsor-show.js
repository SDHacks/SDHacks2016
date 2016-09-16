UNIVERSITY = "university";
MAJOR = "major";

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
  var recentDownloadId, downloadInterval;

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

      total.majors = _.map(totalApplicants, function(user) {
        return user.categories;
      });
      total.majors = _.flatten(total.majors);
      total.majors = _.uniq(total.majors);
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

      //Generate state holders
      createUniData(totalApplicants);
      createMajorData(totalApplicants);

      //Add UI elements for each
      createFilterUI(null);

      //Update total
      $("#js-filter-total").text(data.length);

      //Select everything initially
      $(".resume-browser input").prop("checked", true);
      //Filter the results
      updateFilters();

      addClickListeners();
    
      $("label").click(function() {
        updateFilters();
      });

      //Hide filters by default
      $("#university-wrapper").css("display", "none");
      $("#major-wrapper").css("display", "none");
      $("#graduation-wrapper").css("display", "none");
      $("#gender-wrapper").css("display", "none");
    });
  };

  //Holds data of universities and majors
  var uniData = {};
  var majorData = {};

  //Builds a sorted university data for filtering purposes
  var createUniData = function (applicants) {
    _.each(applicants, function(applicant) {
      if (uniData[applicant.university]) 
        uniData[applicant.university].students++;
      else 
        uniData[applicant.university] = { students: 1, name: applicant.university, checked: false };
    });
  };

  //Builds sorted array of major data for filtering purposes
  var createMajorData = function(applicants) {
    _.each(applicants, function(applicant) {
      _.each(applicant.categories, function(major) {
        if (majorData[major]) 
          majorData[major].students++;
        else 
          majorData[major] = { students: 1, name: major, checked:false };
      });
    });
  };

  //Sort functions
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
  };
  var sortByAlphabet = function(a, b) {
    return a.innerText.localeCompare(b.innerText);
  };
  var filterUniversityByStudents = function() {
    var parentNode = universityFilter[0];
    var arr = [].slice.call(parentNode.children);
    arr.sort(sortByNumber).forEach(function(val, index) {
      parentNode.appendChild(val);
    });
  };
  var filterUniversityByAlphabet = function() {
    var parentNode = universityFilter[0];
    var arr = [].slice.call(parentNode.children);
    var sorted = arr.sort(sortByAlphabet);
    sorted.forEach(function(val, index) {
      parentNode.appendChild(val);
    });
  };
  var filterMajorByStudents = function() {
    var parentNode = majorFilter[0];
    var arr = [].slice.call(parentNode.children);
    var sorted = arr.sort(sortByNumber);
    sorted.forEach(function(val, index) {
      parentNode.appendChild(val);
    });
  };
  var filterMajorByAlphabet = function() {
    var parentNode = majorFilter[0];
    var arr = [].slice.call(parentNode.children);
    arr.sort(sortByAlphabet).forEach(function(val, index) {
      parentNode.appendChild(val);
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

      if(!_.some(user.categories, function(major) {
        return _.contains(filters.majors, major.toLowerCase());
      }))
        return false;

      if(!_.contains(filters.graduatingYears, user.year.toString())) {
        return false;
      }

      if(!_.contains(filters.genders, user.gender.toLowerCase())) {
        return false;
      }

      return true;
    });

    $("#js-filter-selected").text(filteredApplicants.length);
    checkFilters();
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
      .text(text);

    if (occurrences) label.attr('data-occurrences', occurrences);

    div.append(input);
    div.append(label);

    unis.push({text: div});
    return div;
  };

  //Renders filter fields, based on params. 
  //Possible: "university", "year", "major", "gender". Accepts lists or
  // individual strings
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
      if(data.error || !data.zipping) {
        console.error('Could not download selected applicants');
        return;
      }

      recentDownloadId = data.zipping;
      downloadInterval = setInterval(getDownload, 5000);
    }, "json");

    $("#download-msg").html('<p>Files are being zipped. This may take up to 30 seconds</p>');
    $(this).attr('value', 'Please wait');
  });

  function getDownload() {
    $.getJSON("/sponsors/download/" + recentDownloadId, function(data) {
      if(data.error || !data.url) {
        return;
      }
      $("#js-filter-download").attr('value', 'Download');
      $("#download-msg").html('');

      clearInterval(downloadInterval);
      top.location.href = data.url;
    });
  }

  if($("#js-filter-download").length) {
    getApplicants();
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
  };

  $("#js-university-most-common").click(function() {
    $(this).toggleClass("inactive");
    $("#js-university-alphabetical").addClass("inactive");
    filterUniversityByStudents();
    $("#js-university-search").val("");
  });

  $("#js-university-alphabetical").click(function() {
    $(this).toggleClass("inactive");
    $("#js-university-most-common").addClass("inactive");
    filterUniversityByAlphabet();
    $("#js-university-search").val("");
  });

  $("#js-major-alphabetical").click(function() {
    $(this).toggleClass("inactive");
    $("#js-major-most-common").addClass("inactive");
    filterMajorByAlphabet();
    $("#js-major-search").val("");
  });

  $("#js-major-most-common").click(function() {
    $(this).toggleClass("inactive");
    $("#js-major-alphabetical").addClass("inactive");
    filterMajorByStudents();
    $("#js-major-search").val("");
  });

  // Methods for highlighting all or none
  $("#js-university-select-all").click(function() {
    $("#js-filter-university input").prop("checked", true);
    updateChecked(UNIVERSITY);
  });

  $("#js-university-select-none").click(function() {
    $("#js-filter-university input").prop("checked", false);
    updateChecked(UNIVERSITY);
  });

  $("#js-major-select-all").click(function() {
    $("#js-filter-major input").prop("checked", true);
    updateChecked(MAJOR);
  });

  $("#js-major-select-none").click(function() {
    $("#js-filter-major input").prop("checked", false);
    updateChecked(MAJOR);
  });

  $("#js-select-everything").click(function() {
    $(".resume-browser input").prop("checked", true);
    updateChecked(MAJOR);
  });

  $("#js-select-nothing").click(function() {
    $(".resume-browser input").prop("checked", false);
    updateChecked(MAJOR);
  });

  $("#js-year-select-all").click(function() {
    $("#js-filter-year input").prop("checked", true);
  });

  $("#js-year-select-none").click(function() {
    $("#js-filter-year input").prop("checked", false);
  });

  $("#js-gender-select-all").click(function() {
    $("#js-filter-gender input").prop("checked", true);
  });

  $("#js-gender-select-none").click(function() {
    $("#js-filter-gender input").prop("checked", false);
  });

  $("a.button").click(function() {
    updateFilters();
    updateChecked(UNIVERSITY);
    updateChecked(MAJOR);
    checkFilters();
  });

  //Show/hide different filters
  $("#js-show-university").click(function() {
    $(this).toggleClass("inactive");
    var display = ($("#university-wrapper").css("display") === "block") ? "none" : "block";
    $("#university-wrapper").css("display", display);
    checkFilters();
  });
  $("#js-show-major").click(function() {
    $(this).toggleClass("inactive");
    var display = ($("#major-wrapper").css("display") === "block") ? "none" : "block";
    $("#major-wrapper").css("display", display);
    checkFilters();
  });
  $("#js-show-year").click(function() {
    $(this).toggleClass("inactive");
    var display = ($("#graduation-wrapper").css("display") === "block") ? "none" : "block";
    $("#graduation-wrapper").css("display", display);
    checkFilters();
  });
  $("#js-show-gender").click(function() {
    $(this).toggleClass("inactive");
    var display = ($("#gender-wrapper").css("display") === "block") ? "none" : "block";
    $("#gender-wrapper").css("display", display);
    checkFilters();
  });

  //Double checks and displays the number of elements in each filter selected
  //ie - you have 1 university selected
  var checkFilters = function() {
    $("#js-show-university .selected").text(" (" + filters.universities.length.toString() + ")");
    $("#js-show-major .selected").text(" (" + filters.majors.length.toString() + ")");
    $("#js-show-year .selected").text(" (" + filters.graduatingYears.length.toString() + ")");
    $("#js-show-gender .selected").text(" (" + filters.genders.length.toString() + ")");

    if (filters.universities.length === 0) $("#js-show-university").addClass("error");
    else $("#js-show-university").removeClass("error");
    if (filters.majors.length === 0) $("#js-show-major").addClass("error");
    else $("#js-show-major").removeClass("error");
    if (filters.graduatingYears.length === 0) $("#js-show-year").addClass("error");
    else $("#js-show-year").removeClass("error");
    if (filters.genders.length === 0) $("#js-show-gender").addClass("error");
    else $("#js-show-gender").removeClass("error");
  };

  var updateChecked = function(type) {
    if (type == UNIVERSITY) {
      $("#js-filter-university .filter-wrap label").each(function () {
        uniData[$(this)[0].innerText].checked = $("#" + $(this).attr('for')).prop('checked');
      });
    }
    if (type == MAJOR) {
      $("#js-filter-major .filter-wrap label").each(function () {
        majorData[$(this)[0].innerText].checked = $("#" + $(this).attr('for')).prop('checked');
      });
    }
  };

  // Search functionality
  var regex;
  var regexMatch = function(reg) {
    return reg.toLowerCase().match(regex);
  };
  $("#js-university-search").on("input", function() {
    // Update the list of universities and re-render
    regex = new RegExp(".*" + $(this).val().toLowerCase() + ".*");
    total.universities = all.universities.filter(regexMatch);
    updateFilterUI("university");
  });

  $("#js-major-search").on("input", function() {
    // Update the list of universities and re-render
    regex = new RegExp(".*" + $(this).val().toLowerCase() + ".*");
    total.majors = all.majors.filter(regexMatch);
    updateFilterUI("major");
  });

  //Keep track of checked and shown filters
  $("label").click(function() {
    updateFilters();
    checkFilters();
  });

  //Keeps track of checked elements
  var addClickListeners = function () {
    $("#js-filter-university .filter-wrap label").click(function() {
      uniData[$(this)[0].innerText].checked = !uniData[$(this)[0].innerText].checked;
    });
    $("#js-filter-major .filter-wrap label").click(function() {
      majorData[$(this)[0].innerText].checked = !majorData[$(this)[0].innerText].checked;
    }); 
  };
});