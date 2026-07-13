const header=document.querySelector('.header');addEventListener('scroll',()=>header?.classList.toggle('scrolled',scrollY>30));document.querySelector('.menu')?.addEventListener('click',()=>document.querySelector('.navlinks')?.classList.toggle('open'));
const homeSearch=document.querySelector('#homeVillaSearch');
if(homeSearch){
  const checkin=document.querySelector('#checkinDate');
  const checkout=document.querySelector('#checkoutDate');
  const guestRoom=document.querySelector('#guestRoomSelect');
  const roomsInput=document.querySelector('#roomsInput');
  const today=new Date(); today.setHours(0,0,0,0);
  const minDate=today.toISOString().split('T')[0];
  if(checkin) checkin.min=minDate;
  if(checkout) checkout.min=minDate;
  checkin?.addEventListener('change',()=>{if(checkout){checkout.min=checkin.value||minDate;if(checkout.value&&checkout.value<=checkin.value)checkout.value='';}});
  guestRoom?.addEventListener('change',()=>{const option=guestRoom.options[guestRoom.selectedIndex];if(roomsInput)roomsInput.value=option?.dataset.rooms||'1';});
  homeSearch.addEventListener('submit',e=>{
    e.preventDefault();
    const d=new FormData(homeSearch);
    if(d.get('checkin')&&d.get('checkout')&&String(d.get('checkout'))<=String(d.get('checkin'))){alert('Check-out date check-in ke baad honi chahiye.');return;}
    const p=new URLSearchParams();
    const chosenLocation=String(d.get('location')||'').trim().toLowerCase();
    if(chosenLocation)p.set('location',chosenLocation);
    if(d.get('guests'))p.set('guests',String(d.get('guests')).replace(/\D/g,''));
    if(d.get('rooms'))p.set('rooms',String(d.get('rooms')));
    if(d.get('checkin'))p.set('checkin',String(d.get('checkin')));
    if(d.get('checkout'))p.set('checkout',String(d.get('checkout')));
    window.location.href='villas.html?'+p.toString();
  });
}
const cards=[...document.querySelectorAll('.villa-card')],q=document.querySelector('#villaSearch'),loc=document.querySelector('#locationFilter'),bhk=document.querySelector('#bhkFilter'),count=document.querySelector('#resultCount'),empty=document.querySelector('#noResults');function applyFilters(){if(!cards.length)return;const query=(q?.value||'').trim().toLowerCase(),lv=loc?.value||'all',bv=bhk?.value||'all';let n=0;cards.forEach(c=>{const ok=(!query||(c.dataset.name+' '+c.dataset.location).includes(query))&&(lv==='all'||c.dataset.location.includes(lv))&&(bv==='all'||c.dataset.bhk===bv);c.hidden=!ok;if(ok)n++;});if(count)count.textContent=n+' villa'+(n===1?'':'s');if(empty)empty.hidden=n!==0;}[q,loc,bhk].forEach(el=>el?.addEventListener(el===q?'input':'change',applyFilters));document.querySelector('#clearFilters')?.addEventListener('click',()=>{if(q)q.value='';if(loc)loc.value='all';if(bhk)bhk.value='all';applyFilters();});if(cards.length){const p=new URLSearchParams(location.search);if(loc&&p.get('location'))loc.value=p.get('location').toLowerCase();if(q&&p.get('q'))q.value=p.get('q');applyFilters();}
document.querySelectorAll('[data-lightbox]').forEach(b=>b.addEventListener('click',()=>{const l=document.querySelector('.lightbox');if(!l)return;l.querySelector('img').src=b.dataset.lightbox;l.classList.add('open');l.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}));function closeLightbox(){const l=document.querySelector('.lightbox');if(!l)return;l.classList.remove('open');l.setAttribute('aria-hidden','true');document.body.style.overflow='';}document.querySelector('.lightbox-close')?.addEventListener('click',closeLightbox);document.querySelector('.lightbox')?.addEventListener('click',e=>{if(e.target.classList.contains('lightbox'))closeLightbox();});addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox();});
document.querySelectorAll('form[data-wa]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);const msg=`Hello Villa Go, I want to enquire about ${d.get('villa')||'a villa'}. Name: ${d.get('name')||''}, Guests: ${d.get('guests')||''}, Dates: ${d.get('dates')||''}`;open(`https://wa.me/919667069439?text=${encodeURIComponent(msg)}`,'_blank')}));
// Villa Go custom date-range calendar
(()=>{
 const trigger=document.querySelector('#dateTrigger'), pop=document.querySelector('#calendarPopover');
 if(!trigger||!pop)return;
 const grid=document.querySelector('#calendarGrid'), monthLabel=document.querySelector('#calendarMonthLabel'), dateLabel=document.querySelector('#dateLabel'), summary=document.querySelector('#dateSummary');
 const checkin=document.querySelector('#checkinInput'), checkout=document.querySelector('#checkoutInput');
 const today=new Date(); today.setHours(0,0,0,0);
 let view=new Date(today.getFullYear(),today.getMonth(),1), start=null, end=null;
 const pad=n=>String(n).padStart(2,'0');
 const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
 const same=(a,b)=>a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
 const fmt=d=>d.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
 function updateLabels(){
   if(start&&end){dateLabel.textContent=`${fmt(start)} — ${fmt(end)}`;summary.textContent=`${fmt(start)} check-in · ${fmt(end)} check-out`;checkin.value=iso(start);checkout.value=iso(end)}
   else if(start){dateLabel.textContent=`${fmt(start)} — Add checkout`;summary.textContent='Now choose your check-out date';checkin.value=iso(start);checkout.value=''}
   else{dateLabel.textContent='Add dates';summary.textContent='Choose check-in and check-out';checkin.value='';checkout.value=''}
 }
 function render(){
   monthLabel.textContent=view.toLocaleDateString('en-IN',{month:'long',year:'numeric'});grid.innerHTML='';
   const first=new Date(view.getFullYear(),view.getMonth(),1), offset=first.getDay();
   const begin=new Date(view.getFullYear(),view.getMonth(),1-offset);
   for(let i=0;i<42;i++){
     const d=new Date(begin); d.setDate(begin.getDate()+i);
     const b=document.createElement('button');b.type='button';b.className='calendar-day';b.textContent=d.getDate();b.dataset.date=iso(d);
     if(d.getMonth()!==view.getMonth())b.classList.add('muted');
     if(d<today)b.disabled=true;
     if(same(d,today))b.classList.add('today');
     if(start&&end&&d>start&&d<end)b.classList.add('in-range');
     if(same(d,start))b.classList.add('range-start');
     if(same(d,end))b.classList.add('range-end');
     b.addEventListener('click',()=>selectDate(d));grid.appendChild(b);
   }
 }
 function selectDate(d){
   if(!start||end||d<start){start=new Date(d);end=null}else if(d.getTime()===start.getTime()){start=new Date(d);end=null}else{end=new Date(d)}
   updateLabels();render();
 }
 function openCal(){pop.classList.add('open');pop.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true')}
 function closeCal(){pop.classList.remove('open');pop.setAttribute('aria-hidden','true');trigger.setAttribute('aria-expanded','false')}
 trigger.addEventListener('click',()=>pop.classList.contains('open')?closeCal():openCal());
 document.querySelector('#prevMonth')?.addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);render()});
 document.querySelector('#nextMonth')?.addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);render()});
 document.querySelector('#clearDates')?.addEventListener('click',()=>{start=end=null;updateLabels();render()});
 document.querySelector('#doneDates')?.addEventListener('click',closeCal);
 document.addEventListener('click',e=>{if(pop.classList.contains('open')&&!pop.contains(e.target)&&!trigger.contains(e.target))closeCal()});
 updateLabels();render();
})();
