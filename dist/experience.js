(() => {
  const form = document.querySelector('#journey-form');
  const destination = document.querySelector('#destination');
  const pickup = document.querySelector('#pickup');
  const summary = document.createElement('div');
  summary.className = 'journey-preview';
  summary.setAttribute('aria-live', 'polite');
  summary.setAttribute('aria-atomic', 'true');
  const caption = document.createElement('span'); caption.className = 'journey-preview-label'; caption.textContent = 'YOUR JOURNEY, AT A GLANCE';
  const route = document.createElement('strong');
  const details = document.createElement('span'); details.className = 'journey-preview-details';
  summary.append(caption, route, details); form.after(summary);
  function updateSummary() {
    route.textContent = `${pickup.value.trim() || 'Your doorstep'} → ${destination.value.trim() || 'Your next destination'}`;
    const count = document.querySelector('#passengers').value;
    const date = document.querySelector('#departure').value;
    const returning = document.querySelector('[data-trip="return"]').getAttribute('aria-pressed') === 'true';
    const formatted = date ? new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'long'}).format(new Date(date + 'T12:00:00')) : 'Choose your date';
    details.textContent = `${formatted} · ${count} passenger${count === '1' ? '' : 's'} · ${returning ? 'Return journey' : 'One way'}`;
  }
  form.addEventListener('input', updateSummary);
  form.addEventListener('change', updateSummary);
  form.addEventListener('click', () => queueMicrotask(updateSummary));
  document.querySelector('#airport-quote').addEventListener('click', updateSummary);
  updateSummary();

  // Give every service selection visible context in the enquiry, as well as the email.
  const serviceLabel = document.createElement('span'); serviceLabel.className = 'selected-service'; serviceLabel.hidden = true;
  document.querySelector('.planner-heading > div').append(serviceLabel);
  document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
    serviceLabel.textContent = `${button.dataset.service} · Tailored to you`; serviceLabel.hidden = false;
  }));
  document.querySelector('#airport-quote').addEventListener('click', () => {
    serviceLabel.textContent = 'Airport transfer · Tailored to you'; serviceLabel.hidden = false;
  });

  // Track the section in view without taking control of native scrolling.
  const links = [...document.querySelectorAll('.navigation a')];
  let pending = false;
  function highlightSection() {
    pending = false;
    const threshold = document.querySelector('.header').offsetHeight + 160;
    let active = null;
    for (const link of links) {
      const section = document.querySelector(link.getAttribute('href'));
      if (section && section.getBoundingClientRect().top <= threshold) active = link;
    }
    links.forEach(link => { if (link === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(highlightSection); } }, {passive:true});
  highlightSection();
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const toggle = document.querySelector('.menu-toggle');
    if (toggle.getAttribute('aria-expanded') === 'true') { toggle.click(); toggle.focus(); }
  });

  // A soft arrival cue keeps long-page navigation easy to follow.
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = document.getElementById(link.hash.slice(1));
    const heading = target?.querySelector('h2');
    if (heading) heading.animate([{opacity:.45,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}], {duration:700,delay:220,easing:'cubic-bezier(.22,1,.36,1)'});
  }));
})();
