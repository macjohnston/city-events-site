async function loadEvents(city) {
  const errorDiv = document.getElementById('error-message');
  try {
    errorDiv.innerText = 'Fetching events...'; // Show progress
    let apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.pdxpipeline.com%2Ffeed%2F';
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Fetch failed: HTTP ' + response.status);
    }
    const data = await response.json();
    const events = [];

    if (data.status !== 'ok' || !data.items) {
      throw new Error('Invalid RSS data: ' + (data.error || 'No items'));
    }

    data.items.forEach(item => {
      const pubDate = new Date(item.pubDate);
      const date = pubDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const time = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // HH:MM

      const venueMatch = (item.title + ' ' + item.description).match(/@ ([\w\s.,]+?)(?=\s*\|)/i);
      const venue = venueMatch ? venueMatch[1].trim() : 'Venue TBD';

      if (pubDate >= new Date()) {
        events.push({
          name: item.title,
          date: date,
          time: time,
          venue: venue,
          description: item.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
          links: [item.link]
        });
      }
    });

    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    const container = document.getElementById('events-container');
    if (events.length === 0) {
      container.innerHTML = '<p>No upcoming events found for this city.</p>';
      errorDiv.innerText = '';
      return;
    }

    container.innerHTML = ''; // Clear loading
    events.slice(0, 10).forEach(event => {
      const div = document.createElement('div');
      div.className = 'event';
      div.innerHTML = `
        <strong>${event.date} @ ${event.time} | ${event.name} @ ${event.venue}</strong><br>
        ${event.description}<br>
        <a href="${event.links[0]}" target="_blank">More info</a>
      `;
      container.appendChild(div);
    });
    errorDiv.innerText = ''; // Clear errors on success
  } catch (error) {
    errorDiv.innerText = 'Error loading events: ' + error.message;
  }
}
