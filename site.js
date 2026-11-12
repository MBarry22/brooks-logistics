document.querySelectorAll('.yr').forEach(el => el.textContent = new Date().getFullYear());

const form = document.getElementById('req');
if (form) {
  const status = document.getElementById('status');
  const next = document.getElementById('next');
  if (next) next.value = location.origin + '/thanks.html';
  form.addEventListener('submit', (e) => {
    form.querySelectorAll('input').forEach(el => el.style.borderColor = '');
    status.classList.remove('show');
    const missing = [...form.querySelectorAll('[required]')].filter(el => !el.value.trim() || (el.type === 'email' && !el.validity.valid));
    if (missing.length) {
      e.preventDefault();
      missing.forEach(el => el.style.borderColor = '#b3261e');
      status.textContent = 'Fill in ' + missing.map(el => form.querySelector('label[for="' + el.id + '"]').textContent.replace(' *', '').toLowerCase()).join(', ') + ' so we can quote it.';
      status.classList.add('show'); missing[0].focus(); return;
    }
    const lb = parseInt((form.weight.value || '').replace(/[^0-9]/g, ''), 10);
    if (lb > 3000) {
      e.preventDefault();
      form.weight.style.borderColor = '#b3261e';
      status.textContent = 'The van carries up to 3,000 lb. Call us at 478-538-4743 to talk it through.';
      status.classList.add('show'); form.weight.focus(); return;
    }
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
  });
}
