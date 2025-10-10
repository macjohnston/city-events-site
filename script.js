async function loadEvents(city) {
  try {
    const rssUrl = 'https://www.pdxpipeline.com/feed/'; // Portland RSS - replace for other cities later
    const response = await fetch(rssUrl); // Add CORS proxy if needed: 'https://cors-anywhere.herokuapp.com/' + rssUrl
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
      const time = new Date(pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // HH:MM

      // Extract venue/time from description if available (basic regex - tweak as needed)
      const venueMatch = description.match(/@ ([\w\s.,]+?)(?=\s*\|)/i); // e.g., "@ Bunk Bar"
      const venue = venueMatch ? venueMatch[1] : 'TBD';

      events.push({
        name: title,
        date: date,
        time: time,
        venue: venue,
        description: description.substring(0, 200) + '...', // Truncate for brevity
        links: [link]
      });
    }

    // Sort by date ascending
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    const container = document.getElementById('events-container');
    if (events.length === 0) {
      container.innerHTML = '<p>No events found for this city.</p>';
      return;
    }

    events.forEach(event => {
      const div = document.createElement('div');
      div.className = 'event';
      div.innerHTML = `
        <strong>${event.date} ${event.time ? `@ ${event.time}` : ''} - ${event.name}</strong><br>
        Venue: ${event.venue}<br>
        ${event.description}<br>
        ${event.links ? 'Links: ' + event.links.map(link => `<a href="${link}">${link}</a>`).join(' | ') : ''}
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error loading events:', error);
  }
}
