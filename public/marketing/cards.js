/* Kids Planet School: draws a teacher's card on her phone with her own words.
   The ready-made picture supplies the crest, the footer (and the group photograph);
   everything between them is drawn again here from the words she typed. Nothing is uploaded. */
(function(){
'use strict';
const C={night:'#101F08',green:'#2D5016',mari:'#F5B301',cream:'#FBF8EC',white:'#FFFFFF',ink:'#1B1A05'};
const SERIF='Newsreader, Georgia, "Times New Roman", serif',SANS='"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const PILL='Admissions open 2027–28',AGES='2+ Pre-Nursery\n3+ Nursery\n4+ LKG\n5+ UKG\n6+ Class 1';

/* The words on each card as the school wrote them. kind picks the layout; inline: the yellow words carry on the same line. */
const CARDS={
 'A-meet':{kind:'meet',w:{kicker:'Meet our teachers',tagline:'Proud to teach at Kids Planet School.',pill:PILL}},
 'B-invite':{kind:'teacher',w:{kicker:'An invitation',white:'Come and see',yellow:'my classroom.',sub:'Any working day. No appointment needed.',pill:PILL}},
 'C-question':{kind:'teacher',max:118,w:{kicker:'Your child asks',white:'Too many\nquestions?',yellow:'Good.',sub:'In my classroom, “why?” is welcome.',pill:PILL}},
 'D-ages':{kind:'ages',max:140,inline:true,w:{kicker:'Admissions open · 2027–28',white:'How old is\nyour',yellow:'child?',ages:AGES,pill:''}},
 'E-reads':{kind:'teacher',w:{kicker:'At Kids Planet School',white:'Every child reads.',yellow:'Every child speaks.',sub:'A book read, then told to the class.',pill:PILL}},
 'F-games':{kind:'teacher',w:{kicker:'On the timetable for every class',white:'Games is a period.',yellow:'Not a break.',sub:'Karate in Classes 2 to 4.',pill:PILL}},
 'G-computers':{kind:'teacher',max:112,w:{kicker:'At Kids Planet School',white:'Computers\nfrom Class 1.',yellow:'AI at every level.',sub:'',pill:PILL}},
 'H-two':{kind:'teacher',inline:true,w:{kicker:'Pre-Nursery · Age 2 and above',white:'Ready at',yellow:'two.',sub:'Pre-Nursery reopens for 2027–28.',pill:PILL}},
 'I-notjust':{kind:'teacher',max:128,w:{kicker:'Pre-Nursery to Class 8',white:'Not just a',yellow:'pre-school.',sub:'Computers from Class 1.\nScience in Classes 6 to 8.',pill:PILL}},
 'J-ask':{kind:'teacher',max:128,w:{kicker:'Admissions open · 2027–28',white:'Ask me about',yellow:'our school.',sub:'I am happy to answer.\nMessage me, or call the school.',pill:''}},
 'team-we':{kind:'team',w:{kicker:'Kids Planet School · Dhalpur, Kullu',white:'We teach at',yellow:'Kids Planet.',sub:'Come and see our classrooms.\nAdmissions open 2027–28.'}},
 'team-meet':{kind:'team',inline:true,w:{kicker:'The people behind Kids Planet School',white:'Meet our',yellow:'teachers.',sub:'Come and meet them on any working day.\nAdmissions open 2027–28.'}},
 'admissions':{kind:'admissions',w:{white:'Come and see',yellow:'our school.',pill:'Admissions open · 2027–28',ages:AGES}}
};
/* What she sees beside each box. */
const LABEL={kicker:'Small line at the top',white:'Big words (white)',yellow:'Big words (yellow)',sub:'Line under the big words',
  name:'Your name',role:'Your role',subjects:'Your subjects',qual:'Your qualifications',tagline:'Yellow line',pill:'Yellow label',ages:'Ages and classes (one on each line)'};
const ORDER={meet:['kicker','name','role','subjects','qual','tagline','pill'],teacher:['kicker','white','yellow','sub','name','role','pill'],
  ages:['kicker','white','yellow','ages','name','role','pill'],team:['kicker','white','yellow','sub'],admissions:['white','yellow','pill','ages']};
const MULTI={white:1,sub:1,ages:1};

function spec(key){return CARDS[key]||null}
function defaults(key,who){const s=spec(key);if(!s)return null;const w=Object.assign({},s.w);
  if(s.kind!=='team'&&s.kind!=='admissions'){w.name=who.name;w.role=who.role}
  if(s.kind==='meet'){w.subjects=who.subjects||'';w.qual=who.qual||''}return w}
/* The words as printed in the ready-made picture (her name as it was when the pictures were made). */
function printed(key,who){const w=defaults(key,who);if(w&&'name' in w)w.name=who.onCards||who.name;return w}
function fields(key){const s=spec(key);return s?ORDER[s.kind].map(f=>({f,label:LABEL[f],multi:!!MULTI[f]})):[]}
const clean=s=>String(s==null?'':s).replace(/\r/g,'').replace(/[ \t]+\n/g,'\n').trim();
function same(a,b){if(!a||!b)return false;for(const k in a)if(clean(a[k])!==clean(b[k]))return false;return true}

/* Fonts: the cards use Newsreader and IBM Plex Sans; a card is drawn only once they are here (or after 6 s, with the fallback). */
let fontsP=null;
function fonts(){if(fontsP)return fontsP;
  const href='https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,700;1,6..72,500;1,6..72,700&family=IBM+Plex+Sans:wght@500;600&display=swap';
  fontsP=new Promise(res=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.onload=l.onerror=()=>res();document.head.appendChild(l);setTimeout(res,4000)})
   .then(()=>{if(!document.fonts||!document.fonts.load)return;const want=['700 100px Newsreader','italic 700 100px Newsreader','italic 500 100px Newsreader','600 40px "IBM Plex Sans"','500 40px "IBM Plex Sans"'];
     return Promise.race([Promise.all(want.map(f=>document.fonts.load(f).catch(()=>null))),new Promise(r=>setTimeout(r,6000))])}).then(()=>true,()=>true);
  return fontsP}

/* ---------- drawing helpers ---------- */
const F={
  kicker:s=>`600 ${s}px ${SANS}`,head:s=>`700 ${s}px ${SERIF}`,headI:s=>`italic 700 ${s}px ${SERIF}`,sub:s=>`italic 500 ${s}px ${SERIF}`,
  name:s=>`700 ${s}px ${SERIF}`,role:s=>`600 ${s}px ${SANS}`,body:s=>`500 ${s}px ${SANS}`,num:s=>`700 ${s}px ${SERIF}`};
function tracked(x,text,px,y,track,align){/* letter-spaced line; returns width */
  let w=0;const ch=[...text];for(const c of ch)w+=x.measureText(c).width+track;w-=track;
  let cx=align==='right'?px-w:px;if(y!=null)for(const c of ch){x.fillText(c,cx,y);cx+=x.measureText(c).width+track}return w}
function wrapPlain(x,text,width){const out=[];clean(text).split('\n').forEach(par=>{let line='';par.split(/\s+/).filter(Boolean).forEach(word=>{
  const t=line?line+' '+word:word;if(line&&x.measureText(t).width>width){out.push(line);line=word}else line=t});out.push(line)});return out}
function fitFont(x,font,text,max,min,width){let s=max;x.font=font(s);while(s>min&&x.measureText(text).width>width){s--;x.font=font(s)}return s}
/* Big words: white then yellow italic, wrapped to width. Returns lines of runs. */
function headLines(x,w,s,width,inline){
  const toks=[];const push=(t,acc)=>clean(t).split('\n').forEach((par,i)=>{if(i>0)toks.push({br:1});par.split(/\s+/).filter(Boolean).forEach(word=>toks.push({t:word,acc}))});
  push(w.white,false);if(clean(w.yellow)){if(clean(w.white)&&!inline)toks.push({br:1});push(w.yellow,true)}
  const lines=[];let cur=[],cw=0,over=false;
  const meas=(t,acc)=>{x.font=acc?F.headI(s):F.head(s);return x.measureText(t).width};const sp=meas(' ',false)*.9;
  for(const k of toks){if(k.br){lines.push(cur);cur=[];cw=0;continue}
    const ww=meas(k.t,k.acc);if(ww>width)over=true;
    if(cur.length&&cw+sp+ww>width){lines.push(cur);cur=[];cw=0}
    cur.push({t:k.t,acc:k.acc,w:ww,x:cur.length?cw+sp:0});cw+=(cur.length>1?sp:0)+ww}
  if(cur.length)lines.push(cur);return {lines:lines.filter((l,i)=>l.length||i<lines.length-1),over}}
function drawHead(x,L,s,px,top){const lh=s*.92;let y=top+s*.74;
  L.lines.forEach(line=>{line.forEach(r=>{x.font=r.acc?F.headI(s):F.head(s);x.fillStyle=r.acc?C.mari:C.cream;x.fillText(r.t,px+r.x,y)});y+=lh});return y-lh}
function rrect(x,X,Y,W,H,r){x.beginPath();if(x.roundRect)x.roundRect(X,Y,W,H,r);else x.rect(X,Y,W,H)}

/* A list of blocks stacked down the card: each {h, draw(y)}. Gaps sit inside the blocks' own sizes. */
function stack(blocks){return {h:blocks.reduce((a,b)=>a+b.h,0),draw(y){blocks.forEach(b=>{b.draw(y);y+=b.h})}}}
const gap=h=>({h,draw(){}});

function kickerB(x,text,size,width){if(!clean(text))return null;x.font=F.kicker(size);const T=clean(text).toUpperCase().replace(/\n/g,' ');
  let s=size;while(s>18){x.font=F.kicker(s);if(tracked(x,T,0,null,s*.12)<=width)break;s--}
  const cap=s*.72;return {h:cap,draw(y){x.font=F.kicker(s);x.fillStyle=C.mari;tracked(x,T,X0,y+cap,s*.12)}}}
function subB(x,text,size,width,lh){const t=clean(text);if(!t)return null;x.font=F.sub(size);const L=wrapPlain(x,t,width);
  return {h:size*.74+(L.length-1)*lh+size*.2,draw(y){x.font=F.sub(size);x.fillStyle=C.mari;L.forEach((l,i)=>x.fillText(l,X0,y+size*.74+i*lh))}}}
function pillB(x,text,h,size){const t=clean(text).replace(/\n/g,' ');if(!t)return null;
  return {h,draw(y){let s=size;x.font=F.role(s);while(s>20&&x.measureText(t).width+2*size*.64>936){s--;x.font=F.role(s)}const w=x.measureText(t).width+2*size*.64;
    x.fillStyle=C.mari;rrect(x,X0,y,w,h,8);x.fill();x.fillStyle=C.ink;x.fillText(t,X0+size*.64,y+h/2+s*.36)}}}
function ruleB(){return {h:2,draw(y){x0.fillStyle='rgba(245,179,1,.42)';x0.fillRect(X0,y,936,2)}}}
let x0=null;const X0=72;

/* Her photo in a circle, her name, her role, KIDS PLANET SCHOOL. */
function personB(x,w,d,photo,place){const k=d/197,tx=77+d+38*k,tw=1008-tx;
  return {h:d+10,draw(y){const g={x:77,y:y+5,w:d,h:d,r:d/2,round:true};
    x.fillStyle=C.mari;x.beginPath();x.arc(g.x+d/2,g.y+d/2,d/2+5,0,Math.PI*2);x.fill();
    x.save();x.beginPath();x.arc(g.x+d/2,g.y+d/2,d/2,0,Math.PI*2);x.clip();x.fillStyle='#fff';x.fillRect(g.x,g.y,d,d);if(photo)x.drawImage(photo,...place(g,photo));x.restore();
    const cy=g.y+d/2,name=clean(w.name).replace(/\n/g,' '),role=clean(w.role).replace(/\n/g,' ');
    let ns=fitFont(x,F.name,name,Math.round(64*k),30,tw);x.font=F.name(ns);x.fillStyle=C.cream;
    const lines=[name&&{f:F.name(ns),t:name,c:C.cream,s:ns},role&&{f:F.role(Math.round(35*k)),t:role,c:C.white,s:Math.round(35*k)},{f:F.kicker(Math.round(25*k)),t:'KIDS PLANET SCHOOL',c:C.mari,s:Math.round(25*k),tr:1}].filter(Boolean);
    const offs=lines.length===3?[-37,25,75]:[-15,45];
    lines.forEach((l,i)=>{let s=l.s;x.font=l.f;if(!l.tr){s=fitFont(x,l===lines[0]?F.name:F.role,l.t,l.s,16,tw);x.font=(l===lines[0]?F.name:F.role)(s)}x.fillStyle=l.c;
      if(l.tr)tracked(x,l.t,tx,cy+offs[i]*k,l.s*.14);else x.fillText(l.t,tx,cy+offs[i]*k)})}}}

/* Age chips (2+ Pre-Nursery ...), flowing across the line. */
function chipsB(x,text,width){const items=clean(text).split('\n').map(s=>s.trim()).filter(Boolean).map(s=>{const m=s.match(/^(\d+)\s*\+?\s*(.*)$/);return m?{n:m[1],l:m[2]}:{n:'',l:s}});
  if(!items.length)return null;const H=88,G=17;
  const ws=items.map(it=>{let w=30;if(it.n){x.font=F.num(56);w+=x.measureText(it.n).width;x.font=F.sub(44);w+=x.measureText('+').width+16}x.font=F.role(36);return w+x.measureText(it.l).width+26});
  const rows=[];let cur=[],cw=0;ws.forEach((w,i)=>{if(cur.length&&cw+G+w>width){rows.push(cur);cur=[];cw=0}cur.push(i);cw+=(cur.length>1?G:0)+w});rows.push(cur);
  return {h:rows.length*H+(rows.length-1)*G,draw(y){rows.forEach((r,ri)=>{let cx=X0;const cy=y+ri*(H+G),bl=cy+H/2+17;r.forEach(i=>{const it=items[i],w=ws[i];
    x.fillStyle='rgba(0,0,0,.22)';x.fillRect(cx,cy,w,H);x.fillStyle=C.mari;x.fillRect(cx,cy,6,H);let tx=cx+30;
    if(it.n){x.font=F.num(56);x.fillText(it.n,tx,bl+3);tx+=x.measureText(it.n).width;x.font=F.sub(44);x.fillText('+',tx+2,bl);tx+=x.measureText('+').width+16}
    x.font=F.role(36);x.fillStyle=C.cream;x.fillText(it.l,tx,bl-2);cx+=w+G})})}}}
/* Age bars on the admissions card, each a little longer than the one before. */
function barsB(x,text,rowH){const items=clean(text).split('\n').map(s=>s.trim()).filter(Boolean).map(s=>{const m=s.match(/^(\d+)\s*\+?\s*(.*)$/);return m?{n:m[1],l:m[2]}:{n:'',l:s}});
  if(!items.length)return null;const G=Math.round(rowH*.125),n=items.length;
  return {h:n*rowH+(n-1)*G,draw(y){items.forEach((it,i)=>{const w=n>1?580+(936-580)*i/(n-1):936,cy=y+i*(rowH+G);
    x.fillStyle=C.green;x.fillRect(X0,cy,w,rowH);x.fillStyle=C.mari;x.fillRect(X0,cy,13,rowH);
    if(it.n){x.font=F.num(Math.round(rowH*.68));x.fillText(it.n,X0+40,cy+rowH*.72);const nw=x.measureText(it.n).width;x.font=F.role(Math.round(rowH*.3));x.fillText('+',X0+42+nw,cy+rowH*.4)}
    x.font=F.role(Math.round(rowH*.5));x.fillStyle=C.cream;const lx=X0+185;let s=Math.round(rowH*.5);while(s>16&&x.measureText(it.l).width>w-200){s--;x.font=F.role(s)}x.fillText(it.l,lx,cy+rowH/2+s*.36)})}}}

/* Fit the big words: the largest size whose layout fits the space. */
function fitHead(x,w,build,max,min,inline,room){
  /* First try to keep her lines as she typed them, only smaller; if that cannot fit, let long lines wrap. */
  const natural=headLines(x,w,10,1e9,inline).lines.length;
  for(const keep of [true,false])for(let s=max;s>=min;s-=2){const L=headLines(x,w,s,936,inline);if(L.over&&s>min)continue;if(L.lines.length>5&&s>min)continue;
    if(keep&&L.lines.length>natural)continue;const st=build(L,s);if(st.h<=room||(!keep&&s<=min))return st}}
function headB(x,L,s){if(!L.lines.length)return null;return {h:s*.74+(L.lines.length-1)*s*.92,draw(y){drawHead(x,L,s,X0,y)}}}

/* ---------- the layouts ---------- */
const AREA={post:{teacher:[278,1202],team:[742,1202],admissions:[281,1031]},story:{teacher:[508,1473],team:[972,1472],admissions:[512,1276]}};
const CLEAR={post:{teacher:[282,1198],team:[748,1198],admissions:[286,1028]},story:{teacher:[512,1469],team:[978,1468],admissions:[516,1272]}};

function layout(x,key,shape,w,photo,place){const s=spec(key),kind=s.kind,big=shape==='story',grp=kind==='team'||kind==='admissions'?kind:'teacher';
  const [top,bot]=AREA[shape][grp],room=bot-top-(kind==='team'?50:kind==='admissions'?24:90);
  const bl=(...a)=>stack(a.filter(Boolean));
  let st;
  if(kind==='meet')st=meetLayout(x,w,big,photo,place,room);
  else if(kind==='team')st=fitHead(x,w,(L,hs)=>{const k=kickerB(x,w.kicker,30,936),h=headB(x,L,hs),sb=subB(x,w.sub,46,936,54);
      return bl(k,k&&h&&gap(20),h,h&&sb&&gap(hs*.2+30),sb)},100,52,s.inline,room);
  else if(kind==='admissions'){const rowH=big?79:73;st=fitHead(x,w,(L,hs)=>{const h=headB(x,L,hs),p=pillB(x,w.pill,79,44),b=barsB(x,w.ages,rowH);
      return bl(h,h&&(p||b)&&gap(hs*.2+28),p,p&&b&&gap(25),b)},92,48,s.inline,room)}
  else{const d=big?224:197;st=fitHead(x,w,(L,hs)=>{const k=kickerB(x,w.kicker,34,936),h=headB(x,L,hs),
        mid=kind==='ages'?chipsB(x,w.ages,936):subB(x,w.sub,48,936,59),p=personB(x,w,d,photo,place),pl=pillB(x,w.pill,75,38);
      return bl(k,k&&h&&gap(21),h,mid&&gap(kind==='ages'?hs*.2+22:hs*.2+26),mid,gap(mid?(kind==='ages'?28:34):hs*.2+34),ruleB(),gap(26),p,pl&&gap(20),pl)},s.max||150,56,s.inline,room)}
  return {st,top,bot}}

function meetLayout(x,w,big,photo,place,room){const tw=big?381:353,th=big?479:444,cx=78+tw+56,cw=1008-cx;
  const name=clean(w.name).replace(/\n/g,' ').split(/\s+/).filter(Boolean),first=name.shift()||'',rest=name.join(' ');
  const build=ns=>{x.font=F.name(ns);const fw=x.measureText(first).width;if(fw>cw)return null;
      x.font=F.headI(ns);const restLines=wrapPlain(x,rest,cw);if(restLines.some(l=>x.measureText(l).width>cw))return null;
      const nl=(first?1:0)+(rest?restLines.length:0);const k=clean(w.kicker)?kickerB(x,w.kicker,30,cw):null;
      const roleT=clean(w.role).replace(/\n/g,' ');const colH=(k?k.h+21:0)+ns*.74+(nl-1)*ns*.92+(roleT?ns*.2+44+27:0);
      return {ns,restLines,k,roleT,colH}};
  let C0=null;for(let ns=big?150:140;ns>=44;ns-=2){C0=build(ns);if(C0&&C0.colH<=th+80)break}
  if(!C0)C0=build(44)||{ns:44,restLines:[rest],k:null,roleT:'',colH:100};
  const rowH=Math.max(th+10,C0.colH);
  const row={h:rowH,draw(y){const ty=y+(rowH-th)/2,g={x:78,y:ty,w:tw,h:th,r:7.5,round:false};
      x.fillStyle=C.mari;rrect(x,g.x-5,g.y-5,tw+10,th+10,11);x.fill();x.save();rrect(x,g.x,g.y,tw,th,7.5);x.clip();x.fillStyle='#fff';x.fillRect(g.x,g.y,tw,th);if(photo)x.drawImage(photo,...place(g,photo));x.restore();
      let cy=y+(rowH-C0.colH)/2;const ns=C0.ns;
      if(C0.k){x.font=F.kicker(30);x.fillStyle=C.mari;tracked(x,clean(w.kicker).toUpperCase(),cx,cy+C0.k.h,30*.12);cy+=C0.k.h+21}
      let by=cy+ns*.74;if(first){x.font=F.name(ns);x.fillStyle=C.cream;x.fillText(first,cx,by);by+=ns*.92}
      if(rest){x.font=F.headI(ns);x.fillStyle=C.mari;C0.restLines.forEach(l=>{x.fillText(l,cx,by);by+=ns*.92})}
      by-=ns*.92;if(C0.roleT){let s=38;x.font=F.role(s);while(s>18&&x.measureText(C0.roleT).width>cw){s--;x.font=F.role(s)}x.fillStyle=C.white;x.fillText(C0.roleT,cx,by+ns*.2+44+27)}}};
  const bodyB=(text,font,size,color,lh,upper,track)=>{let t=clean(text);if(!t)return null;if(upper)t=t.toUpperCase();x.font=font(size);const L=track?[t.replace(/\n/g,' ')]:wrapPlain(x,t,936);
      return {h:size*.72+(L.length-1)*lh,draw(y){x.font=font(size);x.fillStyle=color;L.forEach((l,i)=>{if(track){let s=size;while(s>14&&tracked(x,l,0,null,s*.1)>936){s--;x.font=font(s)}tracked(x,l,X0,y+size*.72+i*lh,s*.1)}else x.fillText(l,X0,y+size*.72+i*lh)})}}};
  const subj=bodyB(w.subjects,F.body,42,C.white,54),qual=bodyB(w.qual,F.kicker,26,C.mari,34,true,true),tag=subB(x,w.tagline,48,936,58),pl=pillB(x,w.pill,75,38);
  const parts=[row,(subj||qual||tag||pl)&&gap(47),subj,subj&&qual&&gap(45),qual,(subj||qual)&&tag&&gap(qual?32:40),tag,pl&&gap(tag?28:34),pl].filter(Boolean);
  return stack(parts)}

/* Draw one card. base: the ready-made picture for this shape. Returns a canvas. */
function draw(o){const {key,shape,words,base,photo,place}=o,s=spec(key);const cv=document.createElement('canvas');cv.width=base.naturalWidth;cv.height=base.naturalHeight;
  const x=cv.getContext('2d');x0=x;x.drawImage(base,0,0);x.textBaseline='alphabetic';x.imageSmoothingQuality='high';
  const grp=s.kind==='team'||s.kind==='admissions'?s.kind:'teacher',[c0,c1]=CLEAR[shape][grp];
  const bg=x.getImageData(4,c0+4,1,1).data;x.fillStyle=`rgb(${bg[0]},${bg[1]},${bg[2]})`;x.fillRect(0,c0,cv.width,c1-c0);
  const {st,top,bot}=layout(x,key,shape,words,photo,place);if(st){const y=Math.round(top+(bot-top-st.h)/2);st.draw(y)}
  return cv}

window.KPCards={spec,defaults,printed,fields,same,clean,fonts,draw};
})();
