require('coffee-script');
require('coffee-script/register');
var fs = require('fs');
var csv = require('fast-csv');

var User = require('./entities/users/model');

var idColumn = "email";

//Total list of user ids
//Must match the form they are on the application
var totalList = [];
//The team being processed
var currentTeam = [];
//Array of team arrays
var totalTeams = [];
//People who haven't applied yet
var nonApplicants = [];

var sumTeamSize = 0.0;

//Add all not-deleted users to master list
User
.find({deleted: { $ne: true }})
.select(idColumn)
.exec(function(err, users) {
  //Add all of the user ids to the list
  users.forEach(function(user) {
    totalList.push(user[idColumn]);
  });

  function writeToCSV() {
    console.log("Writing to file");
    var csvStream = csv
      .createWriteStream({headers: true});
    var writableStream = fs.createWriteStream("teams.csv");

    writableStream.on("finish", function() {
      console.log("Finished writing to file");
    });

    csvStream.pipe(writableStream);

    //Put each of the teams into objects with headers
    for(var teamIndex = 0; teamIndex < totalTeams.length; teamIndex++) {
      var team = totalTeams[teamIndex];
      var teamObject = {};
      for(var i = 0; i < team.length; i++) {
        teamObject["Teammember " + i] = team[i];
      }
      //Write each team object to the CSV
      csvStream.write(teamObject);
    }
    csvStream.end();
  }

  function writeNonApplicantsCSV() {
    console.log("Writing non-applicants");
    var csvStream = csv
      .createWriteStream({headers: true});
    var writableStream = fs.createWriteStream("non-applicants.csv");

    writableStream.on("finish", function() {
      console.log("Finished writing non-applicants");
    });

    csvStream.pipe(writableStream);

    for(var applicantIndex = 0; applicantIndex < nonApplicants.length; applicantIndex++) {
      csvStream.write({email: nonApplicants[applicantIndex]});
    }

    csvStream.end();
  }

  //Completed all users
  function finishedUsers() {
    //Show statistics
    console.log("Total Teams", totalTeams.length);
    console.log("Average Team Size", sumTeamSize / totalTeams.length);
    console.log("Total Non-Applicants", nonApplicants.length);

    writeToCSV();
    writeNonApplicantsCSV();
  }

  //Get the next user in the list
  function nextUser() {
    if(totalList.length === 0) {
      return finishedUsers();
    }

    //Rewrite line
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Remaining Users: " + totalList.length);

    //Process this user's team
    processUser(totalList[0], [], function(newTeam) {
      //Add the new team to the list 
      totalTeams.push(newTeam);

      //Add to the averages
      sumTeamSize += newTeam.length;

      nextUser();
    });
  };

  //Start the chain off
  nextUser();
});

function processUser(id, team, callback) {
  //The index of the user in the master list
  var masterIndex = totalList.indexOf(id);

  //Make a query for the user
  var search = {};
  search[idColumn] = id;

  //User isn't in the database
  if(masterIndex === -1) {
    //If they don't exist, add their ID to the list of non-applicants
    return User.findOne(search, function(err, user) {
      if(err || user === null) {
        nonApplicants.push(id);
      }
      callback(team);
    });
  }

  team.push(id);
  totalList.splice(masterIndex, 1);

  //Get the information about the current user
  User.findOne(search, function(err, user) {
    //If that user doesn't exist
    if(err || user === null) {
      nonApplicants.push(id);
      callback(team);
    }

    function recurseTeammate() {
      if(user.teammates === undefined || user.teammates.length === 0) {
        return callback(team);
      }

      //Remove the first roommate
      processUser(user.teammates[0], team, function() {
        user.teammates.splice(0, 1);
        recurseTeammate();
      });
    }

    recurseTeammate();
  });
}