const $=s=>document.querySelector(s);
const invitation=$('#invitation');
const music = $('#wedding-music');
const musicToggle = $('#music-toggle');
let musicRequested = false;
function updateMusicButton() {
  const playing = !music.paused && !music.ended;
  const label = playing ? 'Выключить музыку' : 'Включить музыку';
  musicToggle.classList.toggle('is-paused', !playing);
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', label);
  musicToggle.title = label;
}
function startMusic() {
  musicRequested = true;
  // Called directly from the opening tap so mobile browsers can allow playback.
  const attempt = music.play();
  if (attempt) attempt.catch(() => {
    musicRequested = false;
    updateMusicButton();
  });
}
// The audio file is attenuated to 20% so iPhone playback is quiet too.
music.volume = 1;
music.addEventListener('play', updateMusicButton);
music.addEventListener('pause', updateMusicButton);
music.addEventListener('error', () => { musicRequested = false; updateMusicButton(); });
musicToggle.addEventListener('click', () => {
  if (musicRequested || !music.paused) {
    musicRequested = false;
    music.pause();
    updateMusicButton();
  } else {
    startMusic();
  }
});
$('#open-invitation').addEventListener('click',()=>{musicToggle.hidden=false;startMusic();invitation.inert=false;invitation.removeAttribute('aria-hidden');document.body.classList.remove('sealed');$('#envelope').classList.add('opening');window.scrollTo(0,0);setTimeout(()=>{$('#envelope').hidden=true;invitation.setAttribute('tabindex','-1');invitation.focus({preventScroll:true});},850)});
const cal=$('#calendar');['пн','вт','ср','чт','пт','сб','вс'].forEach(t=>{const s=document.createElement('span');s.textContent=t;s.className='weekday';cal.append(s)});[28,29,30,31,...Array.from({length:31},(_,i)=>i+1),1,2,3,4,5,6,7].forEach((day,i)=>{const s=document.createElement('span');s.textContent=day;s.className=i<4||i>34?'muted':day===30?'wedding-date':'';cal.append(s)});
const wedding=new Date('2027-01-30T13:00:00+03:00').getTime();function countdown(){const n=Math.max(0,Math.floor((wedding-Date.now())/1000));const a=[Math.floor(n/86400),Math.floor(n/3600)%24,Math.floor(n/60)%60,n%60];['days','hours','minutes','seconds'].forEach((id,i)=>$('#'+id).textContent=String(a[i]).padStart(2,'0'));$('#wedding-day').hidden=n>0}countdown();setInterval(countdown,1000);
const track=$('#gallery-track'),photos=[...track.children],dots=$('#gallery-dots');let slide=0;const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;function go(i){slide=(i+photos.length)%photos.length;track.scrollTo({left:photos[slide].offsetLeft-track.offsetLeft-(track.clientWidth-photos[slide].clientWidth)/2,behavior:reduced?'instant':'smooth'})}photos.forEach((_,i)=>{let b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Фото '+(i+1));b.onclick=()=>go(i);dots.append(b)});function mark(){let center=track.scrollLeft+track.clientWidth/2;slide=photos.reduce((best,p,i)=>Math.abs(p.offsetLeft-track.offsetLeft+p.clientWidth/2-center)<Math.abs(photos[best].offsetLeft-track.offsetLeft+photos[best].clientWidth/2-center)?i:best,0);[...dots.children].forEach((d,i)=>{d.classList.toggle('active',i===slide);d.setAttribute('aria-pressed',String(i===slide))})}$('.prev').onclick=()=>go(slide-1);$('.next').onclick=()=>go(slide+1);track.addEventListener('scroll',mark,{passive:true});track.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();go(slide+(e.key==='ArrowRight'?1:-1))}});mark();
let pending=false;function timeline(){const box=$('#timeline').getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight*.78-box.top)/(box.height+innerHeight*.3)));const path=$('#heart-path'),pos=path.getPointAtLength(path.getTotalLength()*p);$('#moving-heart').style.left=`calc(50% - 45px + ${pos.x*.9}px)`;$('#moving-heart').style.top=(pos.y/480*box.height)+'px';$('.event-last').classList.toggle('shown',p>.48);pending=false}function requestTimeline(){if(!pending){pending=true;requestAnimationFrame(timeline)}}addEventListener('scroll',requestTimeline,{passive:true});addEventListener('resize',()=>{requestTimeline();mark()});timeline();
$('#add-song').onclick=()=>{let n=$('#songs').children.length;if(n>=5)return;let input=document.createElement('input');input.name='song';input.id='song-'+(n+1);input.maxLength=200;input.placeholder=`Песня ${n+1}: название или исполнитель`;input.setAttribute('aria-label',`Песня ${n+1}`);$('#songs').append(input);input.focus();if(n+1===5)$('#add-song').hidden=true};document.querySelectorAll('[name=attendance]').forEach(el=>el.onchange=()=>{$('#food-fields').hidden=el.value==='no';$('#drink-fields').hidden=el.value==='no'});
let responseId=crypto.randomUUID();$('#guest-form').addEventListener('submit',async e=>{e.preventDefault();let form=e.target;if(!form.reportValidity())return;const d=new FormData(form),button=$('#submit-answer');button.disabled=true;$('#form-status').textContent='Сохраняем ваш ответ…';try{if(!window.WEDDING_API_URL)throw new Error('not-configured');const response=await fetch(window.WEDDING_API_URL+'/api/rsvp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:responseId,name:String(d.get('name')).trim(),attendance:d.get('attendance'),allergies:d.get('attendance')==='yes'?d.get('allergies'):'',alcohol:d.get('attendance')==='yes'?d.getAll('alcohol'):[],songs:d.getAll('song').map(s=>s.trim()).filter(Boolean),wishes:d.get('wishes'),website:d.get('website')})});if(!response.ok)throw new Error('save');form.hidden=true;$('#form-success').hidden=false;$('#success-message').textContent=d.get('attendance')==='yes'?'Ваш ответ сохранён. Будем счастливы увидеть вас на свадьбе!':'Ваш ответ сохранён. Спасибо, что сообщили. Будем скучать!';$('#form-success').scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'})}catch(error){$('#form-status').textContent=error.message==='not-configured'?'Анкета пока не подключена. Пожалуйста, свяжитесь с Яной или Ростиславом по контактам ниже.':'Не удалось отправить ответ. Проверьте интернет и попробуйте ещё раз. Данные остались в форме.'}finally{button.disabled=false}});$('#another-answer').onclick=()=>{$('#guest-form').reset();$('#guest-form').hidden=false;$('#form-success').hidden=true;$('#form-status').textContent='';$('#food-fields').hidden=false;$('#drink-fields').hidden=false;responseId=crypto.randomUUID();$('#guest-name').focus()};
