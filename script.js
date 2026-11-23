(function(){
var DEFAULT_PHOTO='photo.jpg';
var KEY='portfolio-v1',S={projects:[],name:'Asrorbek',role:null,about:null,skills:null,mail:null};
function load(){try{var r=localStorage.getItem(KEY);if(r){var o=JSON.parse(r);if(o&&typeof o==='object')S=Object.assign(S,o)}}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
var $=function(i){return document.getElementById(i)};
load();
if(S.name==='Ismingiz')S.name='Asrorbek';
if(S.photo==null&&!S.photoOff)S.photo=DEFAULT_PHOTO;

/* hero name: letter-by-letter reveal */
function setName(n){var h=$('name');h.innerHTML='';
 Array.from(n).forEach(function(c,i){var s=document.createElement('span');s.className='ch';s.style.animationDelay=(i*55)+'ms';s.textContent=c===' '?'\u00a0':c;h.appendChild(s)});
 h.setAttribute('aria-label',n)}
setName(S.name);
$('name').addEventListener('click',function(){
 var v=prompt('Ismingizni kiriting:',S.name);
 if(v&&v.trim()){S.name=v.trim().slice(0,30);setName(S.name);save()}});
$('name').style.cursor='pointer';$('name').title='Ismni oʻzgartirish uchun bosing';

/* editable blocks */
[['role','role','innerHTML'],['about','about','innerText'],['skills','skills','innerHTML'],['mail','mail','innerText'],['tech','tech','innerHTML']].forEach(function(a){
 var el=$(a[0]);if(S[a[1]]!=null)el[a[2]]=S[a[1]];
 el.addEventListener('input',function(){S[a[1]]=el[a[2]];save()})});

/* projects */
function render(){
 var g=$('grid');g.innerHTML='';
 if(!S.projects.length){g.innerHTML='<div class="empty">Hali loyiha yoʻq. «Yangi loyiha» tugmasini bosib, birinchisini qoʻshing.</div>';return}
 S.projects.forEach(function(p,i){
  var c=document.createElement('article');c.className='card';
  var img=p.img?'<img alt="'+esc(p.title)+'" src="'+p.img+'">':esc((p.title||'?').charAt(0).toUpperCase());
  var tags=(p.tags||[]).map(function(t){return'<span>'+esc(t)+'</span>'}).join('');
  var link=p.link&&/^https?:\/\//i.test(p.link)?'<a href="'+esc(p.link)+'" target="_blank" rel="noopener noreferrer">Ochish</a>':'<span></span>';
  c.innerHTML='<div class="img">'+img+'</div><div class="body"><h3>'+esc(p.title)+'</h3><p>'+esc(p.desc)+'</p><div class="tags">'+tags+'</div><div class="row">'+link+'<button class="del" data-i="'+i+'">Oʻchirish</button></div></div>';
  g.appendChild(c);io.observe(c);
  c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
   if(c.classList.contains('in'))c.style.transform='perspective(800px) rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg) translateY(-4px)'});
  c.addEventListener('mouseleave',function(){c.style.transform=''});
 })}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var el=e.target;setTimeout(function(){el.classList.add('in')},(Array.prototype.indexOf.call(el.parentNode.children,el)%6)*90);io.unobserve(el)}})},{threshold:.1});
$('grid').addEventListener('click',function(e){var b=e.target.closest('.del');if(!b)return;
 if(confirm('Bu loyiha oʻchirilsinmi?')){S.projects.splice(+b.dataset.i,1);save();render()}});

/* modal */
var m=$('modal');
function open(){m.classList.add('open');$('t').focus()}
function close(){m.classList.remove('open');$('form').reset();$('err').textContent=''}
$('add').onclick=open;$('addTop').onclick=function(){document.getElementById('loyihalar').scrollIntoView();open()};
$('cancel').onclick=close;
m.addEventListener('click',function(e){if(e.target===m)close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});

function shrink(file){return new Promise(function(res,rej){
 var r=new FileReader();r.onerror=rej;
 r.onload=function(){var im=new Image();im.onerror=rej;im.onload=function(){
  var M=900,k=Math.min(1,M/Math.max(im.width,im.height)),cv=document.createElement('canvas');
  cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);
  cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);res(cv.toDataURL('image/jpeg',.78))};im.src=r.result};
 r.readAsDataURL(file)})}

$('form').addEventListener('submit',function(e){
 e.preventDefault();
 var p={title:$('t').value.trim(),desc:$('d').value.trim(),tags:$('g').value.split(',').map(function(s){return s.trim()}).filter(Boolean).slice(0,8),link:$('l').value.trim(),img:null};
 if(!p.title||!p.desc){$('err').textContent='Nom va tavsifni toʻldiring.';return}
 var f=$('f').files[0];
 (f?shrink(f):Promise.resolve(null)).then(function(img){
  p.img=img;S.projects.unshift(p);
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(x){
   if(img){p.img=null;save();$('err').textContent='';alert('Rasm juda katta boʻlgani uchun saqlanmadi, loyiha rasmsiz qoʻshildi.')}}
  close();render()
 }).catch(function(){$('err').textContent='Rasmni oʻqib boʻlmadi. Boshqa rasm tanlang.'})});

/* profile photo */
var avB=$('avatar'),avF=$('avFile'),avD=$('avDel');
function showAv(){var p=avB.querySelector('.photo');if(S.photo){p.innerHTML='<img alt="Mening rasmim" src="'+S.photo+'">';avD.hidden=false}else{p.textContent='Rasmingizni qoʻshish uchun bosing';avD.hidden=true}}
avB.onclick=function(){avF.click()};
avF.onchange=function(){var f=avF.files[0];if(!f)return;shrink(f).then(function(d){S.photo=d;save();showAv()}).catch(function(){alert('Rasmni oʻqib boʻlmadi. Boshqa rasm tanlang.')});avF.value=''};
avD.onclick=function(){S.photo=null;S.photoOff=1;save();showAv()};
showAv();

/* cursor glow */
if(matchMedia('(pointer:fine)').matches)document.addEventListener('mousemove',function(e){var g=$('glow');g.style.setProperty('--x',e.clientX+'px');g.style.setProperty('--y',e.clientY+'px')});

if(!S.projects.length&&!S._seeded){S.projects=[{title:'Namuna loyiha',desc:'Bu namuna. Oʻchirib, oʻzingizning loyihangizni qoʻshing.',tags:['HTML','CSS','JS'],link:'',img:null}];S._seeded=1;save()}
render();
})();
