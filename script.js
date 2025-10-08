async function loadEvents(city) {
  try {
    const response = await fetch('data/events.json');
    const data = await response.json();
    const events = data.events
      .filter(event => event.city.toLowerCase() === city.toLowerCase())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const container = document.getElementById('events-container');
    if (events.length === 0) {
      container.innerHTML = '<p>No events found for this city.</p>';
      return;
    }
    events.forEach(event => {
      const div = document.createElement('div');
      div.className = 'event';
      div.innerHTML = `
        <strong>${event.date} ${event.time ? `@ ${event.time}` : ''} - ${event.name || 'Untitled Event'}</strong><br>
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
