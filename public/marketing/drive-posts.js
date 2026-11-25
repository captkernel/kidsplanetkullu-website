/* Kids Planet School: "Posts from Drive" on the social media page.
   Reads the numbered post folders (01-..., 02-...) and ORDER.md straight from Google Drive
   (see social-config.js), and lays each post out ready to share: its pictures or video,
   its caption with the right link for the app, Share / Save / Copy, and a "posted" tick.
   Runs after the page's own script and uses its link(), say() and copyNow(). */
(function(){
'use strict';
const CFG=window.KP_SOCIAL||{},API='https://www.googleapis.com/drive/v3/files';
const box=document.getElementById('drive');if(!box)return;
const SLUG=(typeof T!=='undefined'&&T.slug)||'social-media';
const st={get(k){try{return localStorage.getItem(k)}catch(_){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(_){}}};
const toast=(m,el)=>{if(typeof say==='function')say(m,el);else alert(m)};
const APPN={whatsapp:'WhatsApp',instagram:'Instagram',facebook:'Facebook'};
let app=st.get('kp-app');if(!APPN[app])app='instagram';
const linkFor=a=>typeof link==='function'?link(a):`https://kidsplanetkullu.com/admissions/?utm_source=school&utm_medium=${a}&utm_campaign=digital27&utm_content=${SLUG}#enquire`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const media=id=>`${API}/${encodeURIComponent(id)}?alt=media&key=${encodeURIComponent(CFG.apiKey)}`;
async function list(folder){let out=[],tok='';do{const q=new URLSearchParams({q:`'${folder}' in parents and trashed=false`,fields:'nextPageToken,files(id,name,mimeType,size,modifiedTime)',orderBy:'name',pageSize:'200',key:CFG.apiKey});
    if(tok)q.set('pageToken',tok);const r=await fetch(API+'?'+q);if(!r.ok)throw new Error(r.status===403||r.status===404?'access':'http '+r.status);const j=await r.json();out=out.concat(j.files||[]);tok=j.nextPageToken||''}while(tok);return out}
async function text(id){const r=await fetch(media(id));if(!r.ok)throw new Error('http '+r.status);return r.text()}

/* ORDER.md: | # | Kind | Folder | What it says | Note | */
function parseOrder(md){const rows={};String(md||'').split('\n').forEach(l=>{const c=l.split('|').map(s=>s.trim());if(c.length<6||!/^\d+$/.test(c[1]))return;
  const folder=c[3].replace(/`/g,'');rows[folder]={n:+c[1],kind:c[2],says:c[4],note:c[5]}});return rows}
function guide(md){/* The "Every time you post" steps, for the help box. */const m=String(md||'').match(/## Every time you post\s*([\s\S]*?)(\n## |$)/);return m?m[1].trim():''}
const kindOf=(files,row)=>row&&row.kind?row.kind:files.some(f=>/^video\//.test(f.mimeType))?'Reel':files.filter(f=>/^image\//.test(f.mimeType)).length>1?'Carousel':'Single post';
const title=name=>name.replace(/^\d+[-_ ]*/,'').replace(/[-_]+/g,' ').replace(/^./,c=>c.toUpperCase());

/* The caption for the chosen app: Instagram keeps "link in bio"; elsewhere the address becomes her tracked link. */
function captionFor(raw){let t=String(raw||'').replace(/\r/g,'').trim();
  if(app==='instagram')return t;
  const L=linkFor(app);
  if(/kidsplanetkullu\.com\/admissions\s*\(link in bio\)/i.test(t))return t.replace(/kidsplanetkullu\.com\/admissions\s*\(link in bio\)/ig,L);
  return t+'\n\nWebsite: '+L}

const posts=[];const blobs={};
function postedKey(p){return 'kp-posted-'+SLUG+'-'+p.folder}
function posted(p){try{return JSON.parse(st.get(postedKey(p))||'{}')||{}}catch(_){return{}}}
function fileBlob(f){if(!blobs[f.id])blobs[f.id]=fetch(media(f.id)).then(r=>{if(!r.ok)throw 0;return r.blob()}).then(b=>(blobs[f.id]={b}),()=>{delete blobs[f.id];return null});return blobs[f.id]}
const ready=f=>blobs[f.id]&&blobs[f.id].b;

function render(){
  const next=posts.find(p=>!p.hold&&!posted(p)[app]);
  box.querySelector('.dapps').innerHTML=Object.keys(APPN).map(a=>`<button data-dapp="${a}" aria-pressed="${a===app}">${APPN[a]}</button>`).join('');
  const list=box.querySelector('.dlist');list.innerHTML='';
  posts.forEach(p=>{const el=document.createElement('section');el.className='card dpost'+(p===next?' next':'')+(p.hold?' hold':'');el.dataset.f=p.folder;
    const done=posted(p);
    const imgs=p.media.filter(f=>/^image\//.test(f.mimeType)),vid=p.media.find(f=>/^video\//.test(f.mimeType)),cover=p.files.find(f=>/^cover\./i.test(f.name));
    let pics='';
    if(vid)pics=`<video class="dvid" controls playsinline preload="none" ${cover?`poster="${esc(media(cover.id))}"`:''} src="${esc(media(vid.id))}"></video>`;
    else if(imgs.length>1)pics=`<div class="dslides">${imgs.map((f,i)=>`<figure><img loading="lazy" src="${esc(media(f.id))}" alt="Slide ${i+1}" width="1080" height="1350"><figcaption>${i+1}</figcaption></figure>`).join('')}</div>`;
    else if(imgs.length)pics=`<img class="pic" loading="lazy" src="${esc(media(imgs[0].id))}" alt="" width="1080" height="1350">`;
    el.innerHTML=`<p class="dkind">${esc(String(p.n).padStart(2,'0'))} · ${esc(p.kind)}${p===next?' <span class="dnext">Next to post</span>':''}${done[app]?` <span class="ddone">Posted on ${APPN[app]}</span>`:''}</p>
      <h2>${esc(p.says||title(p.folder))}</h2>${p.note?`<p class="dnote${p.hold?' warn':''}">${esc(p.note)}</p>`:''}${pics}
      ${vid&&cover?'<p class="msg">For a Reel, choose the cover picture when Instagram asks: it is saved with the video.</p>':''}
      <p class="caplabel">Caption</p><div class="cap">${esc(p.caption?captionFor(p.caption):'(No caption.txt in this folder.)')}</div>
      <div class="btns"><button class="main dshare">Share on ${APPN[app]}</button><p class="or">Or do it yourself:</p><div class="three"><button class="dsave">${vid?(cover?'Save video and cover':'Save video'):p.media.length>1?'Save all '+p.media.length:'Save picture'}</button><button class="dcopy">Copy caption</button><button class="dmark">${done[app]?'Not posted yet':'Mark as posted'}</button></div></div><p class="msg"></p>`;
    list.appendChild(el)});
  if(!posts.length)list.innerHTML='<p class="msg on">No numbered post folders were found in the Drive folder.</p>';
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){io.unobserve(x.target);const p=posts.find(q=>q.folder===x.target.dataset.f);if(p)p.media.forEach(fileBlob)}}),{rootMargin:'600px 0px'});list.querySelectorAll('.dpost').forEach(e=>io.observe(e))}
}

async function share(p,el){const text=captionFor(p.caption||''),copied=typeof copyNow==='function'?copyNow(text):false;
  if(!navigator.share){toast((copied?'The caption is copied. ':'')+'This browser cannot share. Tap Save, then post from your gallery.',el);return}
  const missing=p.media.filter(f=>!ready(f));
  if(missing.length){toast('Getting the files ready. Tap Share again in a moment.',el);p.media.forEach(fileBlob);return}
  const files=p.media.map(f=>new File([ready(f)],f.name.replace(/^/,p.folder+'-'),{type:ready(f).type||f.mimeType}));
  if(navigator.canShare&&!navigator.canShare({files})){toast('This phone cannot share these files together. Tap Save, then post from your gallery.',el);return}
  try{await navigator.share({files,text});toast(copied?'Done. If the words are missing, press and hold and tap Paste.':'Done.',el)}catch(e){if(!e||e.name!=='AbortError')toast('Could not share. Tap Save, then post from your gallery.',el)}}
async function save(p,el){const cov=p.media.some(f=>/^video\//.test(f.mimeType))?p.files.find(f=>/^cover\./i.test(f.name)):null,all=cov?p.media.concat([cov]):p.media;
  toast('Saving '+all.length+' file'+(all.length>1?'s':'')+'.',el);
  for(const f of all){const r=await fileBlob(f);if(!r){toast('A file did not download. Check your internet and try again.',el);return}
    const a=document.createElement('a');a.href=URL.createObjectURL(r.b);a.download=p.folder+'-'+f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);await new Promise(r=>setTimeout(r,350))}}

box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.dapp){app=b.dataset.dapp;st.set('kp-app',app);render();return}
  const el=b.closest('.dpost');if(!el)return;const p=posts.find(q=>q.folder===el.dataset.f);if(!p)return;
  if(b.classList.contains('dshare'))share(p,el);
  else if(b.classList.contains('dsave'))save(p,el);
  else if(b.classList.contains('dcopy')){const t=captionFor(p.caption||'');const ok=typeof copyNow==='function'&&copyNow(t);if(ok)toast('Caption copied.',el);else navigator.clipboard.writeText(t).then(()=>toast('Caption copied.',el),()=>toast('Could not copy. Press and hold the caption to copy it.',el))}
  else if(b.classList.contains('dmark')){const d=posted(p);if(d[app])delete d[app];else d[app]=new Date().toISOString().slice(0,10);st.set(postedKey(p),JSON.stringify(d));render()}});

async function load(){
  if(!CFG.apiKey||!CFG.folderId){box.querySelector('.dstate').innerHTML='<p class="msg on">Not connected to Google Drive yet. The school office is setting this up; until then, use the School pictures tab.</p>';return}
  box.querySelector('.dstate').innerHTML='<p class="msg on">Loading the posts from Google Drive…</p>';
  try{const top=await list(CFG.folderId);const orderF=top.find(f=>/^order\.md$/i.test(f.name));const md=orderF?await text(orderF.id).catch(()=>''):'';const rows=parseOrder(md);
    const g=guide(md);if(g)box.querySelector('.dguide').innerHTML='<details><summary>How to post (from ORDER.md)</summary><div class="cap">'+esc(g)+'</div></details>';
    const folders=top.filter(f=>f.mimeType==='application/vnd.google-apps.folder'&&/^\d+/.test(f.name)).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
    const res=await Promise.all(folders.map(async f=>{const files=await list(f.id);const capF=files.find(x=>/^caption\.txt$/i.test(x.name));const row=rows[f.name]||{};
      const mediaFiles=files.filter(x=>/^(image|video)\//.test(x.mimeType)&&!/^cover\./i.test(x.name)).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
      return {folder:f.name,n:row.n||parseInt(f.name,10),kind:kindOf(files,row),says:row.says||'',note:row.note||'',hold:/\bHOLD\b/.test(row.note||''),files,media:mediaFiles,caption:capF?await text(capF.id).catch(()=>''):''}}));
    posts.splice(0,posts.length,...res.filter(p=>p.media.length));
    box.querySelector('.dstate').innerHTML='';render()}
  catch(e){box.querySelector('.dstate').innerHTML='<p class="msg on">'+(e&&e.message==='access'?'Google Drive did not let this page read the folder. The folder needs to be shared as “Anyone with the link can view”.':'Could not load the posts from Google Drive. Check your internet and reload the page.')+'</p>'}}

let started=false;window.KPDrive={start(){if(started)return;started=true;render();load()}};
})();
