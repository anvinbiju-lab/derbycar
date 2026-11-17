const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  $$('.reveal').forEach(el => observer.observe(el));
}
$('#year').textContent = new Date().getFullYear();
$('.menu-toggle').addEventListener('click', () => {
  const open = $('.menu-toggle').getAttribute('aria-expanded') !== 'true';
  $('.menu-toggle').setAttribute('aria-expanded', String(open));
  $('.menu-toggle').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  $('.navigation').classList.toggle('open', open);
});
$$('.navigation a').forEach(link => link.addEventListener('click', () => {
  $('.navigation').classList.remove('open');
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
  $('.menu-toggle').setAttribute('aria-label', 'Open navigation');
}));
let trip = 'single';
let service = 'Private travel';
let airport = 'East Midlands Airport';
let enquiry = '';
const localToday = new Date();
const today = `${localToday.getFullYear()}-${String(localToday.getMonth()+1).padStart(2,'0')}-${String(localToday.getDate()).padStart(2,'0')}`;
$('#departure').min = today;
$('#return-date').min = today;
$$('[data-trip]').forEach(button => button.addEventListener('click', () => {
  trip = button.dataset.trip;
  $$('[data-trip]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  $('#return-wrap').hidden = trip !== 'return';
  $('#return-date').required = trip === 'return';
  $('#return-date').disabled = trip !== 'return';
}));
$('#return-date').disabled = true;
$('#departure').addEventListener('change', () => {
  $('#return-date').min = $('#departure').value || today;
  if ($('#return-date').value && $('#return-date').value < $('#departure').value) $('#return-date').value = '';
});
$('.swap-button').addEventListener('click', () => { const from = $('#pickup').value; $('#pickup').value = $('#destination').value; $('#destination').value = from; });
const focusPlanner = () => { $('#journey').scrollIntoView({behavior:reducedMotion?'instant':'smooth'}); $('#destination').focus({preventScroll:true}); };
$$('[data-service]').forEach(button => button.addEventListener('click', () => { service=button.dataset.service; focusPlanner(); }));
$$('[data-airport]').forEach(button => button.addEventListener('click', () => {
  airport=button.dataset.airport;
  $$('[data-airport]').forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  $('#airport-code').textContent=button.dataset.code;
  $('#airport-name').textContent=airport;
}));
$('#airport-quote').addEventListener('click', () => { service='Airport transfer'; $('#destination').value=airport; focusPlanner(); });
const formatDate = value => new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'short',year:'numeric'}).format(new Date(`${value}T12:00:00`));
function journeySummary() {
  return `${$('#pickup').value.trim()} → ${$('#destination').value.trim()}\n${formatDate($('#departure').value)}${trip==='return' ? ' · Return '+formatDate($('#return-date').value) : ' · One way'} · ${$('#passengers').value} passenger${$('#passengers').value==='1'?'':'s'}`;
}
$('#journey-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!$('#pickup').value.trim() || !$('#destination').value.trim()) { $('#destination').setCustomValidity('Please enter a pickup and destination.'); $('#destination').reportValidity(); return; }
  $('#quote-summary').textContent=journeySummary();
  $('#email-status').textContent=''; $('#copy-enquiry').hidden=true;
  $('#quote-dialog').showModal();
});
$('#destination').addEventListener('input',()=>$('#destination').setCustomValidity(''));
$('#pickup').addEventListener('input',()=>$('#destination').setCustomValidity(''));
function closeDialog(dialog) {
  if (dialog.dataset.closing) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { dialog.close(); return; }
  dialog.dataset.closing='true';
  const animation=dialog.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(12px) scale(.98)'}],{duration:180,easing:'ease-in'});
  animation.finished.then(()=>{dialog.close();delete dialog.dataset.closing;}).catch(()=>{dialog.close();delete dialog.dataset.closing;});
}
$$('.dialog-close').forEach(button=>button.addEventListener('click',()=>closeDialog(button.closest('dialog'))));
$$('dialog').forEach(dialog=>{
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});
  dialog.addEventListener('click',event=>{ if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);} });
});
$('.privacy-button').addEventListener('click',()=>$('#privacy-dialog').showModal());
$('#details-form').addEventListener('submit',event=>{
  event.preventDefault();const data=new FormData(event.currentTarget);
  enquiry=`Hello Derby Minibus & Cars,\n\nI'd like a quote for the following journey:\n\n${journeySummary()}\nService: ${service}\nPickup time: ${data.get('time')}\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\n\nAdditional details:\n${data.get('notes') || 'None'}\n\nPlease confirm availability and your quote. Thank you.`;
  const mail=document.createElement('a');mail.href=`mailto:info@derbyminibusandcars.co.uk?subject=${encodeURIComponent('Journey quote enquiry — '+$('#pickup').value+' to '+$('#destination').value)}&body=${encodeURIComponent(enquiry)}`;mail.click();
  $('#email-status').textContent='Your enquiry is prepared. Send it from your email app to contact the team. If no app opens, copy the enquiry and email info@derbyminibusandcars.co.uk.';
  $('#copy-enquiry').hidden=false;
});
$('#copy-enquiry').addEventListener('click',async()=>{
  try { await navigator.clipboard.writeText(enquiry); $('#email-status').textContent='Enquiry copied. Paste it into an email to info@derbyminibusandcars.co.uk.'; }
  catch { $('#email-status').textContent=enquiry; $('#email-status').style.whiteSpace='pre-wrap'; }
});
