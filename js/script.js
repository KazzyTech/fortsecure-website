document.addEventListener('DOMContentLoaded', () => {
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // Floating contact button
  const floatBtn = $('#float-btn');
  if (floatBtn) floatBtn.addEventListener('click', e => {
    e.preventDefault();
    const contact = $('#contact');
    if(contact) contact.scrollIntoView({behavior:'smooth', block:'start'});
  });

  // Smooth nav scrolling
  $$('.nav-links a').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if(!target) return;
      e.preventDefault();
      window.scrollTo({top: target.getBoundingClientRect().top + window.scrollY - 70, behavior:'smooth'});
    });
  });

  // Reveal animations
  const revealElements = $$('.reveal');
  const observer = new IntersectionObserver((entries, obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealElements.forEach(el=>observer.observe(el));

  // Dynamic stats counter
  const counters = $$('.stat-number');
  counters.forEach(counter=>{
    const updateCount = () => {
      const target = +counter.dataset.target;
      const current = +counter.innerText;
      const increment = target / 200;
      if(current < target){
        counter.innerText = Math.ceil(current + increment);
        setTimeout(updateCount, 20);
      } else { counter.innerText = target; }
    };
    updateCount();
  });

  // Load news
  async function loadNews(){
    const container = $('#newsContainer');
    if(!container) return;
    try {
      const resp = await fetch('./data/news.json',{cache:'no-store'});
      if(!resp.ok) throw new Error('no json');
      const json = await resp.json();
      renderNews(container,json.articles||json||[]);
      return;
    } catch { 
      const sample = [
        {title:"FortSecure opens new Madrid vault", description:"Next-gen biometric access.", image:"https://images.unsplash.com/photo-1605902711622-cfb43c4437b4?auto=format&fit=crop&w=1200&q=80", link:"#"},
        {title:"Digital backups security", description:"Best practices for pairing physical vaults with digital backups.", image:"https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&q=80", link:"#"},
        {title:"Vault-grade construction", description:"Engineering and materials used for secure vaults.", image:"https://images.unsplash.com/photo-1619532904588-379adf02a3b1?auto=format&fit=crop&w=1200&q=80", link:"#"}
      ];
      renderNews(container, sample);
    }
  }
  function renderNews(container, articles){
    container.innerHTML = '';
    articles.forEach((a,i)=>{
      const card = document.createElement('div');
      card.className='news-card card';
      card.innerHTML=`
        <img src="${a.image}" alt="${a.title}">
        <div style="padding:12px;">
          <h4 style="margin:0 0 8px;">${a.title}</h4>
          <p style="margin:0 0 12px;color:var(--muted);">${a.description}</p>
          <a class="btn ghost" href="${a.link}" target="_blank">Read More</a>
        </div>
      `;
      setTimeout(()=>card.classList.add('visible'), i*110);
      container.appendChild(card);
    });
  }
  loadNews();

  // EmailJS contact
  const form = $('#contact-form');
  const status = $('#status');
  if(form){
    const EMAILJS_PUBLIC_KEY = 'ibwt5L-T-bmZjuQgI';
    const EMAILJS_SERVICE_ID = 'service_nqfjqb5';
    const EMAILJS_TEMPLATE_ID = 'template_fd0pp9d';
    try{ emailjs.init(EMAILJS_PUBLIC_KEY); } catch(e){console.warn('EmailJS init error',e);}
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      status.textContent='⏳ Sending...';
      status.style.color=varColor('--muted');
      const formData = {from_name:$('#name').value.trim(), reply_to:$('#email').value.trim(), message:$('#message').value.trim()};
      if(!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY.startsWith('REPLACE')){
        status.textContent='⚠️ EmailJS not configured.';
        status.style.color='#f6c85f'; return;
      }
      try{
        await emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,formData);
        status.textContent='✅ Message sent successfully!';
        status.style.color='#8ce99a';
        form.reset();
        setTimeout(()=>status.textContent='',5000);
      } catch(err){
        status.textContent='❌ Failed to send message.';
        status.style.color='#ff6b6b';
      }
    });
  }

  function varColor(name){ return getComputedStyle(document.documentElement).getPropertyValue(name)||'#999'; }

});
