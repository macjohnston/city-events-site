async function loadEvents(city) {
  try {
    let rssUrl = 'https://www.pdxpipeline.com/feed/'; // Portland RSS
    const response = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(rssUrl));
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const items = xmlDoc.getElementsByTagName('item');
    const events = [];

    for (let item of items) {
      const title = item.getElementsByTagName('title')[0]?.textContent || 'Untitled Event';
      const link = item.getElementsByTagName('link')[0]?.textContent || '';
      const description = item.getElementsByTagName('description')[0]?.textContent || '';
      const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent || '';
      const date = new Date(pubDate).toISOString().split('T')[0]; // YYYY-MM-DD
      const time = new Date(pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // HH:MM 24hr

      const venueMatch = description.match(/@ ([\w\s.,]+?)(?=\s*\|)/i);
      const venue = venueMatch ? venueMatch[1].trim() : 'Venue TBD';

      if (new Date(date) >= new Date().toISOString().split('T')[0]) {
        events.push({
          name: title,
          date: date,
          time: time,
          venue: venue,
          description: description.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
          links: [link]
        });
      }
    }

    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    const container = document.getElementById('events-container');
    if (events.length === 0) {
      container.innerHTML = '<p>No upcoming events found for this city.</p>';
      return;
    }

    events.slice(0, 10).forEach(event => {
      const div = document.createElement('div');
      div.className = 'event';
      div.innerHTML = `
        <strong>${event.date} ${event.time ? `@ ${event.time}` : ''} - ${event.name}</strong><br>
        Venue: ${event.venue}<br>
        ${event.description}<br>
        <a href="${event.links[0]}">More info</a>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error loading events:', error);
    document.getElementById('events-container').innerHTML = '<p>Error loading events. Check console for details.</p>';
  }
}
