function myFunction() {
  event = get_event(new Date("2024-12-07"))
  Logger.log(event)
  stats = get_statistics(event.id)
  Logger.log(stats)
}

function get_event(date) {
  // Format date as YYYY-MM-DD for Eventbrite API
  const formattedDate = Utilities.formatDate(date, 'UTC', 'yyyy-MM-dd');
  
  // First, get the organization ID
  const userUrl = 'https://www.eventbriteapi.com/v3/users/me/organizations/';
  const options = {
    'method': 'get',
    'headers': {
      'Authorization': `Bearer ${EVENTBRITE_KEY}`
    }
  };
  
  try {
    // Get organization ID first
    const orgResponse = UrlFetchApp.fetch(userUrl, options);
    const orgData = JSON.parse(orgResponse.getContentText());
    
    if (!orgData.organizations || orgData.organizations.length === 0) {
      Logger.log('No organizations found for this user');
      return null;
    }
    
    const organizationId = orgData.organizations[0].id;
    
    // Now fetch events with the correct organization ID
    const baseUrl = `https://www.eventbriteapi.com/v3/organizations/${organizationId}/events`;
    const params = {
      'start_date.range_start': `${formattedDate}`,
      'start_date.range_end': `${formattedDate}`,
      'page_size': 1
    };
    
    // Build the query string
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    const response = UrlFetchApp.fetch(`${baseUrl}?${queryString}`, options);
    const data = JSON.parse(response.getContentText());
    
    return data.events && data.events.length > 0 ? data.events[0] : null;
  } catch (error) {
    Logger.log('Error fetching event: ' + error.toString());
    return null;
  }
}

function get_statistics(event_id) {
  const options = {
    'method': 'get',
    'headers': {
      'Authorization': `Bearer ${EVENTBRITE_KEY}`
    }
  };
  
  try {
    // First get all ticket classes
    const ticketClassesUrl = `https://www.eventbriteapi.com/v3/events/${event_id}/ticket_classes/`;
    const ticketResponse = UrlFetchApp.fetch(ticketClassesUrl, options);
    const ticketData = JSON.parse(ticketResponse.getContentText());
    
    // Get all questions for the event
    const questionsUrl = `https://www.eventbriteapi.com/v3/events/${event_id}/questions/`;
    const questionsResponse = UrlFetchApp.fetch(questionsUrl, options);
    const questionsData = JSON.parse(questionsResponse.getContentText());
    
    // Filter for both dropdown and single choice questions
    const choiceQuestions = questionsData.questions.filter(q => 
      q.type === 'dropdown' || q.type === 'radio'
    );
    
    // Initialize statistics array
    const stats = [];
    const statsMap = {};
    
    // Process each ticket class
    if (ticketData.ticket_classes) {
      ticketData.ticket_classes.forEach(ticket => {
        const statObject = {
          id: ticket.id,
          name: ticket.name,
          quantity_sold: parseInt(ticket.quantity_sold) || 0,
          questions: []
        };
        
        // Initialize question statistics
        choiceQuestions.forEach(question => {
          const questionStat = {
            id: question.id,
            question_text: question.question.text,
            type: question.type,
            answers: {}
          };
          
          // Initialize counters for each possible answer
          question.choices.forEach(choice => {
            questionStat.answers[choice.text] = 0;
          });
          
          statObject.questions.push(questionStat);
        });
        
        stats.push(statObject);
        statsMap[ticket.id] = statObject;
      });
      
      // Fetch all orders for the event
      let continuation_token = null;
      do {
        const ordersUrl = `https://www.eventbriteapi.com/v3/events/${event_id}/attendees/${continuation_token ? '?continuation=' + continuation_token : ''}`;
        const attendeesResponse = UrlFetchApp.fetch(ordersUrl, options);
        const attendeesData = JSON.parse(attendeesResponse.getContentText());
        
        // Process each attendee
        if (attendeesData.attendees) {
          attendeesData.attendees.forEach(attendee => {
            const ticketStats = statsMap[attendee.ticket_class_id];
            if (ticketStats && attendee.answers) {
              attendee.answers.forEach(answer => {
                // Find matching question in the array
                const question = ticketStats.questions.find(q => q.id === answer.question_id);
                if (question) {
                  const answerText = answer.answer;
                  if (answerText) {
                    const currentCount = question.answers[answerText] || 0;
                    question.answers[answerText] = parseInt(currentCount) + 1;
                  }
                }
              });
            }
          });
        }
        
        continuation_token = attendeesData.pagination.continuation;
      } while (continuation_token);
    }
    
    return stats;
    
  } catch (error) {
    Logger.log('Error fetching statistics: ' + error.toString());
    return null;
  }
}
