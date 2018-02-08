/* Settings */

var spreadsheet = SpreadsheetApp.openById("1kGyWPTnUEU7JUTkTI9XEnMp8AQE_sMIqokoVn7S6tPQ") //get Anmälan VT18
var sheet = spreadsheet.getSheetByName("Anmälan"); 
var link = spreadsheet.getUrl();

var participationRange = sheet.getRange(4, 7, 13, 8); // select the range where participants answer yes/no
var dateRange = sheet.getRange(1, 7, 1, 8); // select the row containing the dojo dates
var numberCoachesRange = sheet.getRange(2, 7, 1, 8); // select the row containing the number of coaches per dojo
var coachRange = sheet.getRange(4, 1, 13, 5); //selet the range where coach names and email address is placed
var reminderStatusRange = sheet.getRange(50, 7, 1, 8); // select the row containing the information if the reminder for the dojo has been sent

function sendAnswerReminder(coachName, coachEmail, dojoDate, numberCoaches) {
  var subject = "[CoderDojo Norrköping] Påminnelse";
  
  var message = "Hej " + coachName + "!" + "\n" + "\n";
  message += "Nu på lördag (" + dojoDate.getDate() + "/" + (dojoDate.getMonth()+1) + ") är det dags för CoderDojo igen och vi saknar ditt svar på anmälingslistan för coacher. ";
  message += "För tillfället är vi " + numberCoaches + " coacher som är anmälda, men vi skulle behöva fler som kan vara med.\n";
  message += "Vänligen gå in på " + link + " och ange 'y' om du är med som coach eller 'n' om du inte vill vara med. Vi behöver ditt svar senast onsdag kl. 17."+ "\n" + "\n";

  
  message += "Hälsningar," + "\n";
  message += "CoderDojo Norrköping" + "\n" + "\n";
  
  message += "Du får detta mejl eftersom du är registrerad som coach. Vill du inte få påminnelser i framtiden skriver du 'n' i kolumnen 'Påminn?' efter ditt namn.\n";
  
  MailApp.sendEmail(coachEmail, subject, message);
  
  Logger.log("Reminder sent to " + coachEmail);
}

function sendParticipationReminder(coachName, coachEmail, dojoDate, numberCoaches) {
  var subject = "[CoderDojo Norrköping] Påminnelse";
  
  var message = "Hej " + coachName + "!" + "\n" + "\n";
  message += "Vi är glada att du är med som coach på dojon imorgon!";
  message += "Vi kommer totalt att vara " + numberCoaches + " coacher.\n\n";
  message += "Några saker att tänka på:\n";
  message += "* Vi träffas vid entrén till Demola/Coffice (om inget annat har angetts i anmälningslistan), adressen är Laxholmstorget 3\n"
  message += "* Coacherna träffas 10.30, det är viktigt att komma i tid så att vi kan förbereda och släppa in deltagarna i tid\n"
  message += "* Skulle du få förhinder är det jätteviktigt att meddela via Facebook eller till nils@coderdojonkpg.se omedelbart så att vi kan försöka hitta en ersättare eller begränsa platserna! \n"

  message += ""+ "\n" + "\n";
  
  message += "Hälsningar," + "\n";
  message += "CoderDojo Norrköping" + "\n" + "\n";
  
  message += "Du får detta mejl eftersom du är registrerad som coach. Vill du inte få påminnelser i framtiden skriver du 'n' i kolumnen 'Påminn?' efter ditt namn.\n";
  
  MailApp.sendEmail(coachEmail, subject, message);
  
  Logger.log("Reminder sent to " + coachEmail);
}

function sendEarlyRegistrationReminder(coachName, coachEmail, dojoDate, numberCoaches) {
  var subject = "[CoderDojo Norrköping] Påminnelse";
  
  var message = "Hej " + coachName + "!" + "\n" + "\n";
  message += "Vi är glada att du har anmält dig som coach till dojon den " + dojoDate.getDate() + "/" + (dojoDate.getMonth()+1) + "!";
  message += "Eftersom vi har fått din anmälan mer än en vecka i förväg vill vi be dig att dubbelkolla om du fortfarande kan delta.";
  message += "Vänligen kontrollera ditt svar i anmälningslistan senast onsdag kl. 17 på " + link + "\n";
  message += "Vi ser fram emot att se dig på dojon!\n"
  

  message += ""+ "\n" + "\n";
  
  message += "Hälsningar," + "\n";
  message += "CoderDojo Norrköping" + "\n" + "\n";
  
  message += "Du får detta mejl eftersom du är registrerad som coach. Vill du inte få påminnelser i framtiden skriver du 'n' i kolumnen 'Påminn?' efter ditt namn.\n";
  
  MailApp.sendEmail(coachEmail, subject, message);
  
  Logger.log("Reminder sent to " + coachEmail);
}

var reminders = [
  {
    daysBefore: 7,
    name: "Early registration reminder",
    checkCondition: function (coachNumber, dojoNumber) {
      if (coachData[coachNumber][0] != "" && coachData[coachNumber][4] == "y" && participationData[coachNumber][dojoNumber] == "y") {
        //coach exists, wants to be reminded and has signed up for dojo
        return true;
      }
    },
    sendReminder: sendEarlyRegistrationReminder
  },
  {
    daysBefore: 5,
    name: "Coach did not answer reminder",
    checkCondition: function (coachNumber, dojoNumber) {
      if (numberCoachesData[0][dojoNumber] >= 2) {
        //don't send if already enough coaches
        return false;
      }
      if (coachData[coachNumber][0] != "" && coachData[coachNumber][4] == "y" && participationData[coachNumber][dojoNumber] == "") {
        //coach exists, wants to be reminded and has not answered yet
        return true; 
      }
    },
    sendReminder: sendAnswerReminder
  },
  {
    daysBefore: 4,
    name: "Coach did not answer reminder",
    checkCondition: function (coachNumber, dojoNumber) {
      if (numberCoachesData[0][dojoNumber] >= 4) {
        //don't send if already enough coaches
        return false;
      }
      if (coachData[coachNumber][0] != "" && coachData[coachNumber][4] == "y" && participationData[coachNumber][dojoNumber] == "") {
        //coach exists, wants to be reminded and has not answered yet
        return true; 
      }
    },
    sendReminder: sendAnswerReminder
  },  
  {
    daysBefore: 3,
    name: "Coach did not answer reminder",
    checkCondition: function (coachNumber, dojoNumber) {
      if (numberCoachesData[0][dojoNumber] >= 5) {
        //don't send if already enough coaches
        return false;
      }
      if (coachData[coachNumber][0] != "" && coachData[coachNumber][4] == "y" && participationData[coachNumber][dojoNumber] == "") {
        //coach exists, wants to be reminded and has not answered yet
        return true; 
      }
    },
    sendReminder: sendAnswerReminder
  },
  {
    daysBefore: 1,
    name: "Participation reminder",
    checkCondition: function (coachNumber, dojoNumber) {
      if (coachData[coachNumber][0] != "" && coachData[coachNumber][4] == "y" && participationData[coachNumber][dojoNumber] == "y") {
        //coach exists, wants to be reminded and has signed up for dojo
        return true;
      }
    },
    sendReminder: sendParticipationReminder
  }
]




/*
  Main logic
*/

var participationData = participationRange.getValues();
var coachData = coachRange.getValues();
var numberCoachesData = numberCoachesRange.getValues();

function getNumberOfDaysBetween(date1, date2) {
  var oneDay = 24*60*60*1000;
  return Math.ceil((date2.getTime() - date1.getTime())/(oneDay)); 
}

function checkAndSendReminders() { //Checks if reminders are due and sends if necesseray
  var dates = dateRange.getValues()[0];

  for (var j = 0; j < dates.length; j++) {
    var daysLeft = getNumberOfDaysBetween(new Date(), new Date(dates[j].getTime()));
    var reminderStatus = reminderStatusRange.getValues();
    
    if ((reminderStatusRange.getCell(0+1,j+1).isBlank()) || (reminderStatus[0][j] > Math.max(daysLeft,0))) {
      //dojo is in future and reminders for current day have not been processed yet
      for (var r = 0; r < reminders.length; r++) {
        if (reminders[r].daysBefore == daysLeft) {
          sendReminder(reminders[r], j, dates[j]);
        }
      }

      reminderStatus[0][j] = Math.max(daysLeft, 0);
      reminderStatusRange.setValues(reminderStatus);
      SpreadsheetApp.flush();
    }
  }
}


function sendReminder(reminder, dojoNumber, dojoDate) {  //Sends out a specific reminder for a given dojo for each coach for which conditions are fulfilled
  var participationData = participationRange.getValues();
  var numberCoachesData = numberCoachesRange.getValues();
  var coachData = coachRange.getValues();
  var namesSent = "";
  
  for (var i = 0; i < participationData.length; i++) {
    try {
      if (reminder.checkCondition(i,dojoNumber)) {
        reminder.sendReminder(coachData[i][0], coachData[i][1], dojoDate, numberCoachesData[0][dojoNumber]);
        namesSent += coachData[i][0] + "\n";
        Logger.log(reminder.name + " sent for " + coachData[i][0]);
      }
    }
    catch (err) {
      namesSent += coachData[i][0] + ": " + err.message + "\n";
      Logger.log("Sending " + reminder.name + " failed for " + coachData[i][0] + ": " + err.message + "\n");
    }
  }
  
  if (namesSent != "") {
    MailApp.sendEmail("mail@nilsbreyer.eu", "[CoderDojo Norrköping] " + reminder.name + " sent", namesSent);
  }
}

