/* Settings */
var spreadsheet = SpreadsheetApp.openById("1QBxOkjOomioyuBuABEHcQwXLFBUMmY-SrrKKK11uUuc") //document ID for Anmälan
var sheet = spreadsheet.getSheetByName("Anmälan"); 
var link = spreadsheet.getUrl();

var participationRange = spreadsheet.getRangeByName("participationRange"); // select the range where participants answer yes/no
var dateRange = spreadsheet.getRangeByName("dateRange"); // select the row containing the dojo dates
var numberCoachesRange = spreadsheet.getRangeByName("numberCoachesRange"); // select the row containing the number of coaches per dojo
var coachRange = spreadsheet.getRangeByName("coachRange"); //select the range where coach names and email address is placed
var reminderStatusRange = spreadsheet.getRangeByName("reminderStatusRange"); // select the row containing the information if the reminder for the dojo has been sent
var recommendedNumberOfParticipantsRange = spreadsheet.getRangeByName("recommendedNumberOfParticipants"); // recommended number of participants (total and newcomers)
var coachPropertiesRange = spreadsheet.getRangeByName("coachProperties"); //select the range where coach names and email address is placed

var operatorEmail = "mail@nilsbreyer.eu"; //This email adress will be notified about errors


//Badge codes are to be placed in soperate file containing an object badgeCodes (example with fake codes below):
/*var badgeCodes = {
  "firstDojo": "24xsbffs",
  "aktivCoach": "bvgsfw"
};*/

function getAnswerReminderMessage(coachName, dojoDate, numberCoaches) {
  var message = "";
  message += "På lördag den " + dojoDate.getDate() + "/" + (dojoDate.getMonth()+1) + " är det dags för CoderDojo igen och och det skulle vara jätteroligt att ha med dig som coach! ";
  message += "För tillfället är vi " + numberCoaches + " coacher som är anmälda och vi skulle behöva fler som kan vara med. \n";
  message += "Om du kan vara med skriver du 'y' i anmälningslistan och om du inte kan vara med skriver du 'n'.";
  message += "Vi ditt svar allra senast onsdagen innan dojon kl. 17, men helst en vecka innan dojo. Ju tidigare du svara desto lättare blir det för oss att planera antal platser."+ "\n" + "\n";
  
  return message;
}

function getParticipationReminderMessage(coachName, dojoDate, numberCoaches) {
  var message = "";
  message += "Vi är glada att du är med som coach på dojon imorgon! ";
  message += "Vi kommer totalt att vara " + numberCoaches + " coacher. Nedan kommer lite praktisk info om dojon.\n\n";

  return message;
}

function getEarlyRegistrationReminderMessage(coachName, dojoDate, numberCoaches) {
  var message = "";
  message += "Vi är glada att du har anmält dig som coach till dojon den " + dojoDate.getDate() + "/" + (dojoDate.getMonth()+1) + "! ";
  message += "Eftersom vi har fått din anmälan mer än en vecka i förväg vill vi be dig att dubbelkolla om du fortfarande kan delta. ";
  message += "Vänligen kontrollera ditt svar i anmälningslistan senast onsdag kl. 17. \n";
  message += "Vi ser fram emot att se dig på dojon!\n";
  
  return message;
}

function getBadgeMessage(coachName, dojoDate, numberCoaches) {
  var message = "";
  message += "Vi hoppas att du har haft kul på dojon idag! \n";
  message += "Vi tackar för ditt engagement och tycker du har väl förtjänat dig en badge för det. \n";
  message += "Hämta din badge genom att använda koden nedan med hjälp av Badgecraft eller Badge Wallet appen. \n";

  return message;
}


var reminders = [
  {
    daysBefore: 12,
    name: "Early registration reminder",
    checkCondition: function (coachNumber, dojoNumber) {
      if (coachData[coachNumber][0] != "" && coachData[coachNumber][4].toLowerCase().indexOf("y") >= 0 && participationData[coachNumber][dojoNumber].toLowerCase().indexOf("y") >= 0) {
        //coach exists, wants to be reminded and has signed up for dojo
        return true;
      }
    },
    template: "reminderTemplate",
    getMessage: getEarlyRegistrationReminderMessage,
    getData: getDojoData,
    messageTitle: "Vad roligt att du är med!"
  },
  {
    daysBefore: 10,
    name: "Coach did not answer reminder",
    checkCondition: function (coachNumber, dojoNumber) {
      if (numberCoachesData[0][dojoNumber] >= 4) {
        //don't send if already enough coaches
        return false;
      }
      if (coachData[coachNumber][0] != "" && coachData[coachNumber][4].toLowerCase().indexOf("y") >= 0 && participationData[coachNumber][dojoNumber] == "") {
        //coach exists, wants to be reminded and has not answered yet
        return true; 
      }
    },
    template: "reminderTemplate",
    getMessage: getAnswerReminderMessage,
    getData: getDojoData,
    messageTitle: "Kan du vara med på nästa dojo?"
  },
  {
    daysBefore: 6,
    name: "Status",
    checkCondition: function (coachNumber, dojoNumber) {
      if (coachPropertiesData[coachNumber][0].toLowerCase().indexOf("y") >= 0) {
        //coach is dojoansvarig
        return true; 
      }
    },
    template: "statusTemplate",
    getMessage: function(coachName, dojoDate, numberCoaches) {return "Vi är just nu " + numberCoaches + " coacher (inklusive gästcoacher)."},
    getData: getDojoData,
    messageTitle: "Info till dig som är coach- eller dojoansvarig inför släpp av anmälan"
  }, 
  {
    daysBefore: 6,
    name: "Coach did not answer reminder",
    checkCondition: function (coachNumber, dojoNumber) {
      if (numberCoachesData[0][dojoNumber] >= 2) {
        //don't send if already enough coaches
        return false;
      }
      if (coachData[coachNumber][0] != "" && coachData[coachNumber][4].toLowerCase().indexOf("y") >= 0 && participationData[coachNumber][dojoNumber] == "") {
        //coach exists, wants to be reminded and has not answered yet
        return true; 
      }
    },
    template: "reminderTemplate",
    getMessage: getAnswerReminderMessage,
    getData: getDojoData,
    messageTitle: "Vi behöver fler coacher till nästa dojo"
  }, 
  {
    daysBefore: 4,
    name: "Coach did not answer reminder",
    checkCondition: function (coachNumber, dojoNumber) {
      if (numberCoachesData[0][dojoNumber] >= 3) {
        //don't send if already enough coaches
        return false;
      }
      if (coachData[coachNumber][0] != "" && coachData[coachNumber][4].toLowerCase().indexOf("y") >= 0 && participationData[coachNumber][dojoNumber] == "") {
        //coach exists, wants to be reminded and has not answered yet
        return true; 
      }
    },
    template: "reminderTemplate",
    getMessage: getAnswerReminderMessage,
    getData: getDojoData,
    messageTitle: "Vi saknar ditt svar"
  },  
  {
    daysBefore: 4,
    name: "Status",
    checkCondition: function (coachNumber, dojoNumber) {
      if (coachPropertiesData[coachNumber][0].toLowerCase().indexOf("y") >= 0) {
        //coach is dojoansvarig
        return true; 
      }
    },
    template: "statusTemplate",
    getMessage: function(coachName, dojoDate, numberCoaches) {return "Vi är just nu " + numberCoaches + " coacher (inklusive gästcoacher)."},
    getData: getDojoData,
    messageTitle: "Info till dig som är coach- eller dojoansvarig"
  }, 
  {
    daysBefore: 3,
    name: "Status",
    checkCondition: function (coachNumber, dojoNumber) {
      if (coachPropertiesData[coachNumber][0].toLowerCase().indexOf("y") >= 0) {
        //coach is dojoansvarig
        return true; 
      }
    },
    template: "statusTemplate",
    getMessage: function(coachName, dojoDate, numberCoaches) {return "Vi är just nu " + numberCoaches + " coacher (inklusive gästcoacher)."},
    getData: getDojoData,
    messageTitle: "Info till dig som är coach- eller dojoansvarig"
  }, 
  {
    daysBefore: 3,
    name: "Coach did not answer reminder",
    checkCondition: function (coachNumber, dojoNumber) {
      var newcomerSpaces = recommendedNumberOfParticipantsRange.getValues()[0][dojoNumber];
      var advancedSpaces = recommendedNumberOfParticipantsRange.getValues()[0][dojoNumber]

      if (newcomerSpaces >= 9 && advancedSpaces >= 24) {
        //don't send if already enough coaches
        return false;
      }
      if (coachData[coachNumber][0] != "" && coachData[coachNumber][4].toLowerCase().indexOf("y") >= 0 && participationData[coachNumber][dojoNumber] == "") {
        //coach exists, wants to be reminded and has not answered yet
        return true; 
      }
    },
    template: "reminderTemplate",
    getMessage: getAnswerReminderMessage,
    getData: getDojoData,
    messageTitle: "Vi behöver din hjälp på nästa dojo 😥"
  },
  {
    daysBefore: 1,
    name: "Participation reminder",
    checkCondition: function (coachNumber, dojoNumber) {
      if (coachData[coachNumber][0] != "" && coachData[coachNumber][4].toLowerCase().indexOf("y") >= 0 && participationData[coachNumber][dojoNumber].toLowerCase().indexOf("y") >= 0) {
        //coach exists, wants to be reminded and has signed up for dojo
        return true;
      }
    },
    template: "reminderTemplate",
    getMessage: getParticipationReminderMessage,
    getData: getDojoData,
    messageTitle: "Vi ses imorgon!"
  }//,
  /*{
    daysBefore: 0,
    name: "First dojo badge",
    checkCondition: function (coachNumber, dojoNumber) {
      if (coachData[coachNumber][0] != "" && participationData[coachNumber][dojoNumber].toLowerCase().indexOf("y") >= 0) {
        var participationCount = 0;
        for (var i = 0; i <= dojoNumber; i++) {
          if (participationData[coachNumber][i].toLowerCase().indexOf("y") >= 0) participationCount++;
        }
        //coach exists and just attended first dojo
        return participationCount == 1;
      }
    },
    template: "badgeTemplate",
    getMessage: getBadgeMessage,
    getData: function(){return {"badgeCode": badgeCodes["firstDojo"]}},
    messageTitle: "Du har varit med på din första dojo under terminen!"
  },
  {
    daysBefore: 0,
    name: "Aktiv coach badge",
    checkCondition: function (coachNumber, dojoNumber) {
      if (coachData[coachNumber][0] != "" && participationData[coachNumber][dojoNumber].toLowerCase().indexOf("y") >= 0) {
        var participationCount = 0;
        for (var i = 0; i <= dojoNumber; i++) {
          if (participationData[coachNumber][i].toLowerCase().indexOf("y") >= 0) participationCount++;
        }
        //coach exists and just attended first dojo
        return participationCount == 3;
      }
    },
    template: "badgeTemplate",
    getMessage: getBadgeMessage,
    getData: function(){return {"badgeCode": badgeCodes["aktivCoach"]}},
    messageTitle: "Du är nu aktiv coach under den här terminen!"
  }*/
]



/*
  Main logic
*/

var participationData = participationRange.getValues();
var coachData = coachRange.getValues();
var coachPropertiesData = coachPropertiesRange.getValues();
var numberCoachesData = numberCoachesRange.getValues();

function getDojoData(dojoNumber, dojoDate, coachNumber) {
  var data = {
              "daysLeft": getNumberOfDaysBetween(new Date(), new Date(dojoDate.getTime())),
              "registrationUrl": link,
    "recommendedNumberOfParticipants": recommendedNumberOfParticipantsRange.getValues()[0][dojoNumber],
    "recommendedNumberOfNewcomers": recommendedNumberOfParticipantsRange.getValues()[1][dojoNumber]
             };
  return data;
}

function getNumberOfDaysBetween(date1, date2) {
  var oneDay = 24*60*60*1000;
  return Math.ceil((date2.getTime() - date1.getTime())/(oneDay)); 
}

function checkAndSendReminders() { //Checks if reminders are due and sends if necesseray
  var dates = dateRange.getValues()[0];

  for (var j = 0; j < dates.length; j++) {
    if (dates[j] == "") {
      continue; //skip if dojo has no date yet
    }
    
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
        var recipient = coachData[i][1];
        var recipientName = coachData[i][0];
        var message = reminder.getMessage(coachData[i][0], dojoDate, numberCoachesData[0][dojoNumber]);
        var data = reminder.getData(dojoNumber, dojoDate, i);

        sendMail(recipient, recipientName, reminder.messageTitle, message, reminder.template, data);
        
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
    MailApp.sendEmail(operatorEmail, "[CoderDojo Norrköping] " + reminder.name + " sent", namesSent);
  }
}

function testSendMail() {
  sendMail(operatorEmail,"test", "Title", "hejhej", "reminderTemplate", {daysLeft:1, registrationurl:"Test"});
}


function sendMail(recipient, recipientName, messageTitle, message, template, data) {
  var template = HtmlService.createTemplateFromFile(template);
  template.data = data;
  template.message = message;
  template.messageTitle = messageTitle;
  template.recipientName = recipientName;
  var htmlBody = template.evaluate().getContent();
  
  var text = "Hej " + recipientName + "!" + "\n" + "\n";
  text += message;
  text += ""+ "\n" + "\n";
  text += "Hälsningar," + "\n";
  text += "CoderDojo Norrköping" + "\n" + "\n";
  
  MailApp.sendEmail(recipient, messageTitle + " - Meddelande från CoderDojo Norrköping", text, {htmlBody: htmlBody});
  Logger.log("Reminder sent to " + recipient);
}