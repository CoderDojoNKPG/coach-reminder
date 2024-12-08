function myFunction() {
  Logger.log(EVENTBRITE_KEY)
}

function get_event(date) {
  // Format date as YYYY-MM-DD for Eventbrite API
  const formattedDate = Utilities.formatDate(date, 'UTC', 'yyyy-MM-dd');
  
  // Construct the API URL with date filters
  const baseUrl = 'https://www.eventbriteapi.com/v3/organizations/me/events';
  const params = {
    'start_date.range_start': `${formattedDate}T00:00:00Z`,
    'start_date.range_end': `${formattedDate}T23:59:59Z`,
    'page_size': 1  // We only need the first event
  };
  
  // Build the query string
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  // Make the API request
  const options = {
    'method': 'get',
    'headers': {
      'Authorization': `Bearer ${EVENTBRITE_KEY}`
    }
  };
  
  try {
    const response = UrlFetchApp.fetch(`${baseUrl}?${queryString}`, options);
    const data = JSON.parse(response.getContentText());
    
    // Return the first event if exists, otherwise null
    return data.events && data.events.length > 0 ? data.events[0] : null;
  } catch (error) {
    Logger.log('Error fetching event: ' + error.toString());
    return null;
  }
}
