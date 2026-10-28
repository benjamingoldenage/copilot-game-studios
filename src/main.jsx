import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Crosshair, Coins, Trophy, Target, Zap, RotateCcw, Volume2, VolumeX, ShoppingBag, Mountain, CircleHelp, ChevronRight, Check, Lock, Wind, Focus, Gauge } from 'lucide-react';
import './style.css';

const WEAPONS = [
  { id: 0, name: 'Ormanlı .22', type: 'Başlangıç tüfeği', price: 0, power: 1, accuracy: 1, ammo: 6, desc: 'Poligona başlamak için güvenilir seçim.' },
  { id: 1, name: 'Ranger 308', type: 'Dengeli tüfek', price: 450, power: 1.35, accuracy: 1.12, ammo: 7, desc: 'Daha uzak hedeflerde daha istikrarlı.' },
  { id: 2, name: 'Alpine Pro', type: 'Hassas tüfek', price: 1100, power: 1.8, accuracy: 1.28, ammo: 8, desc: 'Yüksek isabet çarpanı ve daha iyi dürbün.' },
  { id: 3, name: 'Summit X', type: 'Usta tüfeği', price: 2400, power: 2.4, accuracy: 1.5, ammo: 9, desc: 'Uzak mesafe ustaları için üst seviye.' },
];
const DISTANCES = [
  { name: 'Yakın', meters: 35, mult: 1, size: 1, reward: 35 },
  { name: 'Orta', meters: 85, mult: 1.5, size: .76, reward: 65 },
  { name: 'Uzak', meters: 150, mult: 2.2, size: .55, reward: 110 },
  { name: 'Usta', meters: 220, mult: 3, size: .42, reward: 180 },
];
const loadSave = () => { try { return JSON.parse(localStorage.getItem('av-meydani-save')) || {}; } catch { return {}; } };

function GameCanvas({ distance, weapon, zoom, onShot, onMiss, soundOn, roundKey, ammo }) {
  const canvasRef = useRef(null); const stateRef = useRef({}); const [aim, setAim] = useState({x:.5,y:.52}); const [flash, setFlash] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); let raf; let last = 0;
    const state = stateRef.current = { x: .55 + Math.random()*.18, y: .62 + Math.random()*.08, dir: Math.random()>.5?1:-1, speed: .000035 + Math.random()*.000025, hit: false, hitTime: 0, sway: Math.random()*8, clouds: [0.14, .35, .71] };
    const resize = () => { const rect = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio||1,2); canvas.width = rect.width*dpr; canvas.height=rect.height*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); };
    resize(); window.addEventListener('resize', resize);
    const draw = (time) => {
      const w=canvas.clientWidth,h=canvas.clientHeight; if(!w||!h){raf=requestAnimationFrame(draw);return;}
      const dpr=Math.min(window.devicePixelRatio||1,2); if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr))resize();
      const s=state; const dt=Math.min(32,time-last||16); last=time;
      if(!s.hit){s.x += s.dir*s.speed*dt*(distance.meters<60?1.2:.72); if(s.x>.84){s.x=.84;s.dir=-1;}if(s.x<.23){s.x=.23;s.dir=1;}}
      s.sway += dt*.001;
      // sky
      let g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#8eb8b0');g.addColorStop(.55,'#d6d8b3');g.addColorStop(1,'#e6d5a8');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // distant mountains
      const ridge=(color,base,amp,phase)=>{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,h*base);for(let x=0;x<=w+10;x+=Math.max(10,w/18)){ctx.lineTo(x,h*(base-amp*(.4+.6*Math.sin(x/w*9+phase))));}ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();};
      ridge('#78978a',.53,.2,1.4);ridge('#557966',.66,.16,3.2);ridge('#355b46',.75,.13,0);
      // soft sun
      ctx.fillStyle='rgba(255,239,183,.55)';ctx.beginPath();ctx.arc(w*.83,h*.17,Math.min(w,h)*.055,0,Math.PI*2);ctx.fill();
      // tree silhouettes
      for(let i=0;i<14;i++){const x=(i*97+21)%w;const th=h*(.12+((i*13)%17)/100);ctx.fillStyle=i%2?'#244a39':'#2d563f';ctx.fillRect(x,h*.68-th*.2,Math.max(3,w*.004),th*.65);ctx.beginPath();ctx.moveTo(x-w*.025,h*.69-th*.15);ctx.lineTo(x+w*.002,h*.69-th);ctx.lineTo(x+w*.03,h*.69-th*.15);ctx.closePath();ctx.fill();}
      // meadow
      let mg=ctx.createLinearGradient(0,h*.65,0,h);mg.addColorStop(0,'#718c4e');mg.addColorStop(1,'#263f2c');ctx.fillStyle=mg;ctx.fillRect(0,h*.65,w,h*.35);
      // grass strokes
      for(let i=0;i<70;i++){const x=(i*43+time*.012)%w;const y=h*(.72+((i*17)%25)/100);ctx.strokeStyle=i%2?'rgba(220,214,151,.32)':'rgba(23,55,33,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+((i%3)-1)*4,y-5-(i%4));ctx.stroke();}
      // distance marker / deer size
      const sc=Math.min(w,h)*.32*distance.size*zoom; const cx=s.x*w, cy=s.y*h;
      if(!s.hit){
        ctx.save();ctx.translate(cx,cy);ctx.scale(sc/100,sc/100);ctx.fillStyle='#3c3327';ctx.strokeStyle='#3c3327';ctx.lineCap='round';ctx.lineJoin='round';
        // deer body
        ctx.beginPath();ctx.ellipse(0,0,43,22,-.08,0,Math.PI*2);ctx.fill();
        // chest, neck and head
        ctx.beginPath();ctx.moveTo(24,-12);ctx.lineTo(37,-38);ctx.lineTo(48,-45);ctx.lineTo(58,-42);ctx.lineTo(56,-33);ctx.lineTo(44,-31);ctx.lineTo(39,-4);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.ellipse(53,-43,13,8,-.15,0,Math.PI*2);ctx.fill();
        // ears
        ctx.beginPath();ctx.ellipse(43,-49,8,3,-.5,0,Math.PI*2);ctx.fill();
        // antlers
        ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(52,-48);ctx.lineTo(49,-62);ctx.lineTo(42,-69);ctx.moveTo(49,-62);ctx.lineTo(55,-70);ctx.moveTo(56,-47);ctx.lineTo(61,-59);ctx.lineTo(69,-64);ctx.moveTo(61,-59);ctx.lineTo(59,-69);ctx.stroke();
        // legs
        ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-29,13);ctx.lineTo(-34,39);ctx.moveTo(-13,17);ctx.lineTo(-9,40);ctx.moveTo(20,14);ctx.lineTo(25,38);ctx.moveTo(32,9);ctx.lineTo(39,34);ctx.stroke();
        // tail and eye
        ctx.beginPath();ctx.moveTo(-41,-3);ctx.lineTo(-53,-9);ctx.lineTo(-47,1);ctx.closePath();ctx.fill();ctx.fillStyle='#e8dfc5';ctx.beginPath();ctx.arc(57,-44,1.8,0,Math.PI*2);ctx.fill();ctx.restore();
      } else {
        ctx.fillStyle='rgba(255,245,220,.95)';ctx.font='700 16px system-ui';ctx.textAlign='center';ctx.fillText('İSABET!',cx,cy-18);
        if(time-s.hitTime>900){s.hit=false;s.x=.2+Math.random()*.6;s.y=.61+Math.random()*.08;s.dir=Math.random()>.5?1:-1;}
      }
      // scope vignette
      const rad=Math.min(w,h)*(.52/zoom);const cxv=aim.x*w,cyv=aim.y*h;const vg=ctx.createRadialGradient(cxv,cyv,rad*.72,cxv,cyv,Math.max(w,h)*.8);vg.addColorStop(0,'rgba(8,17,12,0)');vg.addColorStop(.72,'rgba(8,17,12,.02)');vg.addColorStop(1,'rgba(8,17,12,.56)');ctx.fillStyle=vg;ctx.fillRect(0,0,w,h);
      // subtle scope lines when zoomed
      if(zoom>1){ctx.strokeStyle='rgba(17,35,25,.32)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cxv,0);ctx.lineTo(cxv,h);ctx.moveTo(0,cyv);ctx.lineTo(w,cyv);ctx.stroke();}
      raf=requestAnimationFrame(draw);
    };raf=requestAnimationFrame(draw);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)};
  },[distance,zoom,roundKey]);
  const shoot=(e)=>{if(ammo<=0){onMiss();return;}const rect=e.currentTarget.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;setAim({x,y});const s=stateRef.current;const dist=Math.hypot((x-s.x)*rect.width,(y-s.y)*rect.height);const hitRadius=Math.min(rect.width,rect.height)*.32*distance.size*zoom*.43;
    if(!s.hit && dist<hitRadius){s.hit=true;s.hitTime=performance.now();onShot({precision:Math.max(0,1-dist/hitRadius),distance});}else onMiss();
    setFlash(true);setTimeout(()=>setFlash(false),90);
  };
  return <div className={`range-screen ${flash?'muzzle-flash':''}`}><canvas ref={canvasRef} onClick={shoot} aria-label="Nişan alanı — hedefe tıklayarak ateş et"/><div className="range-top"><span><Mountain size={14}/> ÇAMLIK POLİGONU</span><span className="live-dot"/> <span>CANLI ATIŞ</span></div><div className="range-bottom"><span><Target size={14}/> {distance.name.toUpperCase()} MESAFE</span><span>{distance.meters} M</span></div><div className="reticle" style={{left:`${aim.x*100}%`,top:`${aim.y*100}%`}}><span/><i/></div><div className="click-hint"><Crosshair size={15}/> HEDEFE NİŞAN AL VE TIKLA</div></div>;
}

function App(){
 const save=loadSave();const [money,setMoney]=useState(save.money??150);const [score,setScore]=useState(save.score??0);const [shots,setShots]=useState(save.shots??0);const [hits,setHits]=useState(save.hits??0);const [weaponId,setWeaponId]=useState(save.weaponId??0);const [owned,setOwned]=useState(save.owned??[0]);const [distanceIndex,setDistanceIndex]=useState(1);const [zoom,setZoom]=useState(1);const [ammo,setAmmo]=useState(WEAPONS[save.weaponId??0]?.ammo||6);const [roundKey,setRoundKey]=useState(0);const [message,setMessage]=useState('Poligon hazır. İlk atışını yap!');const [shopOpen,setShopOpen]=useState(false);const [soundOn,setSoundOn]=useState(true);const [showHelp,setShowHelp]=useState(false);const [toast,setToast]=useState('');
 const weapon=WEAPONS[weaponId];const distance=DISTANCES[distanceIndex];const accuracy=shots?Math.round(hits/shots*100):100;
 useEffect(()=>{localStorage.setItem('av-meydani-save',JSON.stringify({money,score,shots,hits,weaponId,owned}));},[money,score,shots,hits,weaponId,owned]);
 const notify=(t)=>{setToast(t);window.clearTimeout(notify.timer);notify.timer=window.setTimeout(()=>setToast(''),2300)};
 const shot=({precision,distance:d})=>{if(ammo<=0){notify('Şarjör boş! Yenile tuşuna bas.');return;}setAmmo(a=>a-1);setShots(s=>s+1);setHits(h=>h+1);const base=Math.round((100+precision*100)*d.mult*weapon.power);const earned=Math.round(d.reward*weapon.power*(.75+precision*.5));setScore(s=>s+base);setMoney(m=>m+earned);setMessage(`Tam isabet! +${base} puan · +₺${earned}`);notify(`+₺${earned} kazandın`);};
 const miss=()=>{if(ammo<=0){notify('Şarjör boş! Yenile tuşuna bas.');return;}setAmmo(a=>a-1);setShots(s=>s+1);setMessage('Iskaladın. Nefesini sabitle ve tekrar dene.');};
 const reload=()=>{setAmmo(weapon.ammo);setRoundKey(k=>k+1);setMessage('Yeni şarjör takıldı. Bol şans!');};
 const buy=(w)=>{if(owned.includes(w.id)){setWeaponId(w.id);setAmmo(w.ammo);setShopOpen(false);notify(`${w.name} kuşanıldı`);return;}if(money<w.price){notify('Bu silah için biraz daha para kazanmalısın.');return;}setMoney(m=>m-w.price);setOwned(o=>[...o,w.id]);setWeaponId(w.id);setAmmo(w.ammo);setShopOpen(false);notify(`${w.name} satın alındı!`);setMessage(`${w.name} hazır. Hedefleri büyüt!`);};
 return <div className="app-shell"><header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><Crosshair size={23}/></span><span><strong>AV MEYDANI</strong><small>ATIŞ POLİGONU</small></span></a><div className="top-status"><span className="status-pill"><span className="live-dot"/> POLİGON AÇIK</span><button className="icon-button" onClick={()=>setSoundOn(!soundOn)} aria-label="Ses ayarı">{soundOn?<Volume2 size={18}/>:<VolumeX size={18}/>}</button><button className="icon-button" onClick={()=>setShowHelp(!showHelp)} aria-label="Yardım"><CircleHelp size={18}/></button></div></header>
 <main id="top"><section className="hero"><div><div className="eyebrow"><span/> DOĞAYA SAYGI · BECERİYE ODAKLAN</div><h1>Nişanını geliştir.<br/><em>Ustalığını kanıtla.</em></h1><p>Mesafeyi seç, hedefe odaklan ve her isabetle ekipmanını güçlendir.</p></div><div className="hero-stats"><div><span>TOPLAM PUAN</span><strong><Trophy size={17}/>{score.toLocaleString('tr-TR')}</strong></div><div><span>İSABET ORANI</span><strong>{accuracy}<small>%</small></strong></div></div></section>
 {showHelp&&<div className="help-panel"><button className="close-help" onClick={()=>setShowHelp(false)}>×</button><strong>Nasıl oynanır?</strong><p>Hedefin üzerine tıklayarak ateş et. Uzak hedefler daha yüksek ödül verir; ancak daha küçük görünürler. Her atış mermi harcar. Şarjörünü yenile ve kazandığın parayla yeni tüfekler al. İlerlemen bu tarayıcıda otomatik kaydedilir.</p></div>}
 <section className="game-layout"><div className="play-column"><div className="section-heading"><div><span className="section-kicker">01 / ATIŞ SAHASI</span><h2>Poligon</h2></div><div className="range-controls"><label htmlFor="distance">MESAFE</label><select id="distance" value={distanceIndex} onChange={e=>{setDistanceIndex(Number(e.target.value));setRoundKey(k=>k+1);}}>{DISTANCES.map((d,i)=><option value={i} key={d.name}>{d.name} · {d.meters} m</option>)}</select></div></div>
 <GameCanvas distance={distance} weapon={weapon} zoom={zoom} onShot={shot} onMiss={miss} soundOn={soundOn} roundKey={roundKey} ammo={ammo}/>
 <div className="range-footer"><div className="equipped"><div className="weapon-icon"><Crosshair size={20}/></div><div><small>KUŞANILAN SİLAH</small><strong>{weapon.name}</strong><span>{weapon.type}</span></div></div><div className="ammo-block"><small>ŞARJÖR</small><div className="ammo-dots">{Array.from({length:weapon.ammo},(_,i)=><i key={i} className={i<ammo?'filled':''}/>)}</div><span>{ammo} / {weapon.ammo} MERMİ</span></div><button className="reload-btn" onClick={reload}><RotateCcw size={15}/> YENİLE</button></div>
 <div className="feedback-line"><span className="feedback-dot"/>{message}</div>
 <div className="control-row"><div className="zoom-control"><Focus size={17}/><span>DÜRBÜN</span><button className={zoom===1?'active':''} onClick={()=>setZoom(1)}>1×</button><button className={zoom===1.35?'active':''} onClick={()=>setZoom(1.35)}>1.35×</button><button className={zoom===1.7?'active':''} onClick={()=>setZoom(1.7)}>1.7×</button></div><div className="tip"><Wind size={15}/> Uzak hedeflerde sakin nişan al.</div></div>
 </div>
 <aside className="side-column"><div className="wallet-card"><div className="wallet-top"><span className="wallet-icon"><Coins size={20}/></span><span>CEPHANE FONU</span><button onClick={()=>setShopOpen(true)} aria-label="Silah mağazasını aç"><ShoppingBag size={17}/></button></div><div className="money"><small>₺</small>{money.toLocaleString('tr-TR')}</div><div className="wallet-bottom"><span>Atışlarla kazan, ekipmanını yükselt.</span><span className="coin-mini"><Coins size={13}/> OYUN İÇİ</span></div></div>
 <div className="card stats-card"><div className="card-title"><span>BUGÜNKÜ PERFORMANS</span><Gauge size={17}/></div><div className="metric-grid"><div><small>ATIŞ</small><strong>{shots}</strong></div><div><small>İSABET</small><strong>{hits}</strong></div><div><small>BAŞARI</small><strong>{accuracy}<i>%</i></strong></div></div><div className="accuracy-bar"><span style={{width:`${accuracy}%`}}/></div><div className="accuracy-caption"><span>İsabet oranı</span><strong>{accuracy}%</strong></div></div>
 <div className="card distance-card"><div className="card-title"><span>HEDEF SEÇİMİ</span><Target size={17}/></div><div className="distance-options">{DISTANCES.map((d,i)=><button key={d.name} onClick={()=>{setDistanceIndex(i);setRoundKey(k=>k+1)}} className={distanceIndex===i?'selected':''}><span className={`distance-symbol d${i}`}><Target size={16}/></span><span className="distance-copy"><strong>{d.name}</strong><small>{d.meters} metre</small></span><span className="distance-reward">₺{d.reward}</span>{distanceIndex===i&&<Check size={14} className="selected-check"/>}</button>)}</div></div>
 <button className="shop-cta" onClick={()=>setShopOpen(true)}><span className="shop-cta-icon"><ShoppingBag size={20}/></span><span><strong>Silah dükkânı</strong><small>Yeni ekipmanları keşfet</small></span><ChevronRight size={19}/></button>
 <div className="side-note"><span><Zap size={15}/></span><p><strong>Usta ipucu</strong> Daha uzak hedefler daha fazla puan ve para kazandırır. Silah isabetliliğini yükselterek avantaj elde et.</p></div>
 </aside></section>
 <section className="bottom-strip"><div className="strip-icon"><Mountain size={20}/></div><div><strong>Her atış bir deneyim.</strong><span>Poligon becerilerini geliştir, yeni ekipmanların kilidini aç.</span></div><div className="strip-right"><span>AV MEYDANI</span><i>•</i><span>SEZON 01</span></div></section>
 </main><footer><span>© 2026 AV MEYDANI</span><span>GÜVENLİ POLİGON DENEYİMİ <span className="footer-dot">●</span></span><button onClick={()=>{if(confirm('Tüm oyun ilerlemen sıfırlansın mı?')){localStorage.removeItem('av-meydani-save');location.reload();}}}>İLERLEMEYİ SIFIRLA</button></footer>
 {toast&&<div className="toast"><Check size={17}/>{toast}</div>}
 {shopOpen&&<div className="modal-backdrop" onClick={()=>setShopOpen(false)}><div className="shop-modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><div><span className="section-kicker">EKİPMAN MERKEZİ</span><h2>Silah dükkânı</h2><p>Oyun içi kazancınla yeni ekipmanları aç.</p></div><button className="modal-close" onClick={()=>setShopOpen(false)}>×</button></div><div className="shop-balance"><Coins size={17}/> BAKİYE <strong>₺{money.toLocaleString('tr-TR')}</strong></div><div className="weapon-list">{WEAPONS.map(w=>{const isOwned=owned.includes(w.id);const equipped=weaponId===w.id;const canBuy=money>=w.price;return <div className={`weapon-item ${equipped?'equipped':''}`} key={w.id}><div className={`weapon-art art-${w.id}`}><Crosshair size={25}/><span>0{w.id+1}</span></div><div className="weapon-info"><div className="weapon-title"><strong>{w.name}</strong>{equipped&&<span className="equipped-tag">KUŞANILDI</span>}</div><span className="weapon-type">{w.type}</span><p>{w.desc}</p><div className="weapon-stats"><span><Zap size={12}/> Güç {w.power.toFixed(1)}×</span><span><Focus size={12}/> Hassasiyet {w.accuracy.toFixed(1)}×</span></div></div><div className="weapon-action">{isOwned?<button className={equipped?'owned-btn':'equip-btn'} disabled={equipped} onClick={()=>buy(w)}>{equipped?<><Check size={14}/> AKTİF</>:'KUŞAN'}</button>:<><strong className="weapon-price">₺{w.price.toLocaleString('tr-TR')}</strong><button className="buy-btn" disabled={!canBuy} onClick={()=>buy(w)}>{canBuy?'SATIN AL':<><Lock size={12}/> YETERSİZ</>}</button></>}</div></div>})}</div><div className="modal-foot"><span><Lock size={13}/> Satın almalar bu tarayıcıda saklanır.</span><button onClick={()=>setShopOpen(false)}>ATIŞA DÖN</button></div></div></div>}
 </div>
}

createRoot(document.getElementById('root')).render(<App/>);
