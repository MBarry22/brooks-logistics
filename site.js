document.querySelectorAll('.yr').forEach(el => el.textContent = new Date().getFullYear());

const form = document.getElementById('req');
if (form) {
  const status = document.getElementById('status');
  const btn = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.querySelectorAll('input').forEach(el => el.style.borderColor = '');
    status.classList.remove('show');
    const missing = [...form.querySelectorAll('[required]')].filter(el => !el.value.trim() || (el.type === 'email' && !el.validity.valid));
    if (missing.length) {
      missing.forEach(el => el.style.borderColor = '#b3261e');
      status.textContent = 'Fill in ' + missing.map(el => form.querySelector('label[for="' + el.id + '"]').textContent.replace(' *', '').toLowerCase()).join(', ') + ' so we can quote it.';
      status.classList.add('show'); missing[0].focus(); return;
    }
    const lb = parseInt((form.weight.value || '').replace(/[^0-9]/g, ''), 10);
    if (lb > 3000) {
      form.weight.style.borderColor = '#b3261e';
      status.textContent = 'The van carries up to 3,000 lb. Call us at 478-538-4743 to talk it through.';
      status.classList.add('show'); form.weight.focus(); return;
    }
    btn.textContent = 'Sending…'; btn.disabled = true;
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Request failed');
      location.href = 'thanks.html';
    } catch (err) {
      btn.textContent = 'Send'; btn.disabled = false;
      status.textContent = 'Your request didn’t go through. Try again, or call 478-538-4743.';
      status.classList.add('show');
    }
  });
}

// Service-area map (Leaflet + CARTO light basemap)
const mapEl = document.getElementById('map');
if (mapEl && window.L) {
  const towns = [
    ['Juliette (base)', 33.105, -83.796, true], ['Macon', 32.840, -83.632], ['Warner Robins', 32.615, -83.627],
    ['Perry', 32.458, -83.731], ['Byron', 32.654, -83.760], ['Forsyth', 33.034, -83.938], ['Gray', 33.009, -83.534],
    ['Milledgeville', 33.080, -83.232], ['Fort Valley', 32.554, -83.887], ['Dublin', 32.540, -82.904]
  ];
  const map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, className: 'tiles-muted',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
  const pts = towns.map(t => [t[1], t[2]]);
  L.polygon(hull(pts), { color: '#34465E', weight: 2, fillColor: '#34465E', fillOpacity: 0.08, dashArray: '6 6', interactive: false }).addTo(map);
  towns.forEach(([name, lat, lon, home]) => {
    const icon = L.divIcon({ className: '', html: '<div class="pin' + (home ? ' home' : '') + '"></div>', iconSize: home ? [20, 20] : [14, 14], iconAnchor: home ? [10, 10] : [7, 7] });
    L.marker([lat, lon], { icon, keyboard: false }).addTo(map)
      .bindTooltip(name, { permanent: true, direction: 'right', offset: [8, 0], className: 'town-label' + (home ? ' home' : '') });
  });
  map.fitBounds(L.latLngBounds(pts).pad(0.12));
  // Convex hull (monotone chain) so the shaded zone wraps every town
  function hull(p) {
    const a = p.map(([la, lo]) => [lo, la]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    const cross = (o, b, c) => (b[0] - o[0]) * (c[1] - o[1]) - (b[1] - o[1]) * (c[0] - o[0]);
    const lower = [], upper = [];
    for (const q of a) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
    for (const q of a.slice().reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
    return lower.slice(0, -1).concat(upper.slice(0, -1)).map(([lo, la]) => [la, lo]);
  }
}
