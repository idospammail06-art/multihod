const { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext } = React;

/* =====================================================================
   CONFIG — paste your Supabase project values here (Settings -> API)
   ===================================================================== */
const SUPABASE_URL = "https://lukmzvepgzeajccqdrkr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Nt0SS76a-wzguffGiEmupw_EYTLLSJy";  // the public anon/publishable key
const LOGO_DATA_URI = "assets/logo.png";

/* =====================================================================
   DEMO BACKEND — runs with zero database. Realistic in-memory data,
   every screen and button works, and NOTHING persists: refresh = reset.
   When SUPABASE_URL + SUPABASE_ANON_KEY are filled (and supabase-js is
   loaded) the app automatically uses the real backend instead.
   ===================================================================== */
function makeDemoClient(){
  const now = () => new Date().toISOString();
  const uid = (p='id') => p+'-'+Math.random().toString(36).slice(2,9);
  const dAgo = n => new Date(Date.now()-n*864e5).toISOString();
  const S = {
    profiles: [
      {id:'me', full_name:'מנהל הדגמה',    first_name:'מנהל', last_name:'הדגמה',  personal_number:'9000001', phone:'050-0000001', unit:'מדור מולטימדיה', role:'admin',             created_at:dAgo(120)},
      {id:'u2', full_name:'רס״ל דנה כהן',  first_name:'דנה',  last_name:'כהן',    personal_number:'9000002', phone:'050-0000002', unit:'מדור מולטימדיה', role:'equipment_manager', created_at:dAgo(80)},
      {id:'u3', full_name:'סמל יואב לוי',  first_name:'יואב', last_name:'לוי',    personal_number:'8123456', phone:'050-1234567', unit:'פלוגה א׳',        role:'user',              created_at:dAgo(30)},
    ],
    categories: ['עדשות','מצלמות/גו פרו','חצובות/ראשים','מחשבים','וידאו','ציוד','כבלים','תאורה','מצלמות','אודיו','חצובות','גו פרו','חשמל','אחסון','רחפן','תיקים','מרום X','מצלמה'].map((n,i)=>({id:'c'+(i+1),name:n})),
    equipment: [], borrows: [], borrow_items: [], returns: [], audit_log: [],
  };
  const catId = n => (S.categories.find(c=>c.name===n)||{}).id;
  // Real inventory list, as uploaded (category, item name, quantity) — notes column dropped
  const RAW_INVENTORY = [
    ['עדשות','16-35',1],['עדשות','70-200',1],['עדשות','100-400',1],['עדשות','50MM',1],
    ['מצלמות/גו פרו','גו פרו 360',1],['מצלמות/גו פרו','גו פרו',4],
    ['חצובות/ראשים','ראש',4],['מחשבים','מחשב צבאי',35],
    ['וידאו','אטם 4 כניסות',1],['וידאו','אטם 8 כניסות',1],
    ['ציוד','פליקן קטן',1],['מחשבים','כבל מטען אפל למקבוק',1],
    ['מחשבים','מטען למקבוק W35',6],['מחשבים','מטען למקבוק W140',2],
    ['חצובות/ראשים','ראש 140',1],['ציוד','פליקן גדול',1],
    ['כבלים','USB C-C',3],['תאורה','תאורת GVM',14],['תאורה','Aputure',2],
    ['מצלמות','Sony A7IIIS',1],['מצלמות','Nikon',2],['מצלמות','Sony A73',1],['מצלמות','Sony A7II',1],
    ['אודיו','שוטגאן מייק',1],['אודיו','ערכת Saramonic',2],
    ['תאורה','חצובות תאורה',1],['חצובות','חצובות מצלמה',5],
    ['גו פרו','סוללות גו פרו',4],['גו פרו','סוללות גו פרו 360',40],
    ['מחשבים','צגי מחשב',2],['חשמל','תוף חשמל',6],['גו פרו','מטענים לגו פרו',1],
    ['מצלמות','סוללות Sony A72',15],['מצלמות','סוללות Nikon',2],['מצלמות','סוללות Sony A73',3],
    ['אחסון','כונן 1TB',4],['אחסון','כונן 2TB',2],['גו פרו','אביזרים לגו פרו',4],
    ['כבלים','USB-C',79],['גו פרו','מתאם גו פרו',23],
    ['אחסון','SD 128GB',11],['אחסון','SD 64GB',4],['אחסון','SD 32GB',4],
    ['עדשות','24-70',2],['רחפן','תיק רחפן',2],
    ['תיקים','תיק צד למצלמה',4],['תיקים','תיק גב',5],
    ['חשמל','מפצלים',2],['מחשבים','מחשב טיפש',5],['מחשבים','Mac Studio',1],['מחשבים','MacBook',3],
    ['ציוד','מקרר',1],['אודיו','מיקרו',1],['ציוד','מכונת קרח',1],
    ['מרום X','מטענים',10],['מרום X','מתאמים',22],['מרום X','מערכת',18],
    ['מצלמה','משקפי מצלמה',1],['ציוד','רפלקטור',1],
    ['אחסון','כונן 8TB',1],['אחסון','כונן 16TB',2],
    ['רחפן','רחפן',1],['רחפן','שלט',1],['רחפן','סוללות לרחפן',5],['רחפן','מטען לסוללות רחפן',1],
    ['אחסון','microSD 128GB',7],['אחסון','microSD 64GB',2],['אחסון','microSD 256GB',1],['אחסון','microSD 32GB',10],
  ];
  const BORROWED_NAMES = ['24-70','שוטגאן מייק','Sony A7IIIS','חצובות מצלמה','16-35'];
  const FAULTY_NAMES = ['רחפן'];
  S.equipment = RAW_INVENTORY.map(([cat,name,qty])=>({
    id:uid('eq'), name, category_id:catId(cat), serial_number:null, asset_number:null,
    manufacturer:null, model:null, price:null, location:null, notes:'',
    status: FAULTY_NAMES.includes(name) ? 'faulty' : (BORROWED_NAMES.includes(name) ? 'borrowed' : 'available'),
    image_url:null, quantity: qty, purchase_date:null, warranty_expiry:null, created_at:dAgo(60),
  }));
  const mkBorrow = (name,pn,unit,phone,eqName,agoOut,retInDays,status,approved)=>{
    const id=uid('b'); const e=S.equipment.find(x=>x.name===eqName);
    S.borrows.push({id, full_name:name, personal_number:pn, unit, phone, purpose:'צילום פעילות יחידתית',
      checkout_date:dAgo(agoOut).slice(0,10), checkout_time:'09:00',
      expected_return_date:dAgo(-retInDays).slice(0,10), expected_return_time:'17:00',
      status, actual_return_at:null, signature_path:null, created_at:dAgo(agoOut),
      approved: !!approved, approved_by: approved?'מנהל הדגמה':null, approved_at: approved?dAgo(agoOut-1):null});
    if(e) S.borrow_items.push({id:uid('bi'), borrow_id:id, equipment_id:e.id, quantity:1});
    return id;
  };
  const b1 = mkBorrow('סמל יואב לוי','8123456','פלוגה א׳','050-1234567','24-70',5,3,'active',true);
  mkBorrow('רב״ט מאיה בר','8987654','פלוגה ב׳','052-7654321','שוטגאן מייק',9,-2,'overdue',true);
  mkBorrow('סמל דור אזולאי','8564738','פלוגה ג׳','054-1122334','Sony A7IIIS',35,-5,'overdue',false);
  mkBorrow('רב״ט נועה שדה','8341122','פלוגה א׳','050-9988776','חצובות מצלמה',12,10,'active',false);
  mkBorrow('טוראי איתי כרמי','8455621','פלוגה ב׳','053-4455667','16-35',0,4,'active',false);
  S.audit_log = [
    {id:uid('a'),action:'INSERT',entity_type:'equipment',entity_id:S.equipment[0].id,actor_name:'מנהל הדגמה',created_at:dAgo(3)},
    {id:uid('a'),action:'BORROW',entity_type:'borrows',entity_id:b1,actor_name:'רס״ל דנה כהן',created_at:dAgo(5)},
    {id:uid('a'),action:'UPDATE',entity_type:'equipment',entity_id:S.equipment[6].id,actor_name:'מנהל הדגמה',created_at:dAgo(2)},
  ];
  const blobs = {};
  const clone = r => ({...r});
  const catOf = id => { const c=S.categories.find(c=>c.id===id); return c?{name:c.name}:null; };
  const itemsOf = bid => S.borrow_items.filter(bi=>bi.borrow_id===bid).map(bi=>{
    const e=S.equipment.find(x=>x.id===bi.equipment_id)||{};
    return {quantity:bi.quantity, camera_number:bi.camera_number||null, equipment:{name:e.name, serial_number:e.serial_number}};
  });
  function run(q){
    const tbl = S[q.table] || [];
    if(q._op==='insert'){
      const arr = Array.isArray(q._payload)?q._payload:[q._payload];
      const ins = arr.map(p=>{ const r={id:uid(q.table.slice(0,2)), created_at:now(), ...p}; tbl.push(r); return r; });
      return {data: q._single ? (ins[0]||null) : ins, error:null};
    }
    if(q._op==='update'){
      const rows = tbl.filter(r=>q.filters.every(f=>f(r)));
      rows.forEach(r=>Object.assign(r,q._payload));
      const cloned = rows.map(clone);
      return {data: q._single ? (cloned[0]||null) : cloned, error:null};
    }
    if(q._op==='delete'){
      const keep=[], del=[]; tbl.forEach(r=>(q.filters.every(f=>f(r))?del:keep).push(r));
      S[q.table]=keep; return {data:del, error:null};
    }
    let rows = tbl.filter(r=>q.filters.every(f=>f(r)));
    if(q._order){ const {c,asc}=q._order; rows=[...rows].sort((a,b)=>{ const x=a[c]??'', y=b[c]??''; return x===y?0:(x>y?1:-1)*(asc?1:-1); }); }
    const count = rows.length;
    if(q._limit!=null) rows = rows.slice(0,q._limit);
    if(q._head) return {data:null, count, error:null};
    rows = rows.map(clone);
    if(q.table==='equipment' && /category:/.test(q.cols)) rows.forEach(r=>r.category=catOf(r.category_id));
    if(q.table==='borrows'  && /borrow_items/.test(q.cols)) rows.forEach(r=>r.borrow_items=itemsOf(r.id));
    if(q._single) return {data:rows[0]||null, count, error:null};
    return {data:rows, count, error:null};
  }
  function QB(table){
    return {
      table, cols:'*', filters:[], _order:null, _limit:null, _single:false, _head:false, _op:'select', _payload:null,
      select(c,o){ this.cols=c||'*'; if(o&&o.head)this._head=true; return this; },
      eq(c,v){ this.filters.push(r=>r[c]===v); return this; },
      neq(c,v){ this.filters.push(r=>r[c]!==v); return this; },
      in(c,a){ this.filters.push(r=>a.indexOf(r[c])>-1); return this; },
      gte(c,v){ this.filters.push(r=>((r[c]??'')>=v)); return this; },
      lte(c,v){ this.filters.push(r=>((r[c]??'')<=v)); return this; },
      gt(c,v){ this.filters.push(r=>((r[c]??'')>v)); return this; },
      lt(c,v){ this.filters.push(r=>((r[c]??'')<v)); return this; },
      order(c,o){ this._order={c,asc:!o||o.ascending!==false}; return this; },
      limit(n){ this._limit=n; return this; },
      single(){ this._single=true; return this; },
      insert(p){ this._op='insert'; this._payload=p; return this; },
      update(p){ this._op='update'; this._payload=p; return this; },
      delete(){ this._op='delete'; return this; },
      then(res){ try{ res(run(this)); }catch(e){ res({data:null,error:{message:String(e&&e.message||e)}}); } },
    };
  }
  function rpc(name,p){ return { then(res){ try{ res(runRpc(name,p)); }catch(e){ res({data:null,error:{message:String(e&&e.message||e)}}); } } }; }
  function runRpc(name,p){
    if(name==='create_borrow'){
      const id=uid('b');
      S.borrows.push({id, full_name:p.p_full_name, personal_number:p.p_personal_number, unit:p.p_unit, phone:p.p_phone,
        purpose:p.p_purpose, approved:false, approved_by:null, approved_at:null, checkout_date:p.p_checkout_date, checkout_time:p.p_checkout_time,
        expected_return_date:p.p_expected_return_date, expected_return_time:p.p_expected_return_time,
        status:'active', actual_return_at:null, signature_path:p.p_signature_path, created_at:now()});
      (p.p_items||[]).forEach(it=>{ S.borrow_items.push({id:uid('bi'), borrow_id:id, equipment_id:it.equipment_id, quantity:it.quantity, camera_number:it.camera_number||null});
        const e=S.equipment.find(x=>x.id===it.equipment_id); if(e) e.status='borrowed'; });
      S.audit_log.unshift({id:uid('a'),action:'BORROW',entity_type:'borrows',entity_id:id,actor_name:'מנהל הדגמה',created_at:now()});
      return {data:id, error:null};
    }
    if(name==='process_return'){
      const b=S.borrows.find(x=>x.id===p.p_borrow_id); if(b){ b.status='returned'; b.actual_return_at=now(); }
      S.borrow_items.filter(bi=>bi.borrow_id===p.p_borrow_id).forEach(bi=>{ const e=S.equipment.find(x=>x.id===bi.equipment_id);
        if(e) e.status = p.p_condition==='major_damage' ? 'faulty' : 'available'; });
      S.audit_log.unshift({id:uid('a'),action:'RETURN',entity_type:'borrows',entity_id:p.p_borrow_id,actor_name:'מנהל הדגמה',created_at:now()});
      return {data:null, error:null};
    }
    return {data:null, error:null};
  }
  const storage = { from(){ return {
    async upload(path,file){ try{ if(file) blobs[path]=URL.createObjectURL(file); }catch(e){} return {error:null}; },
    getPublicUrl(path){ return {data:{publicUrl: blobs[path]||''}}; },
  }; } };
  const auth = {
    async getSession(){ return {data:{session:{user:{id:'me'}}}}; },
    onAuthStateChange(){ return {data:{subscription:{unsubscribe(){}}}}; },
    async signInWithPassword(){ return {error:null}; },
    async signOut(){ setTimeout(()=>location.reload(),40); return {error:null}; },
  };
  return { from:t=>QB(t), rpc, storage, auth };
}

const HAS_SUPABASE = !!(SUPABASE_URL && SUPABASE_ANON_KEY && typeof supabase !== 'undefined');
const DEMO = !HAS_SUPABASE;
const sb = HAS_SUPABASE ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : makeDemoClient();

/* ===== label maps (dark glass chips) ===== */
const BORROW_STATUS = {
  active:   {he:'פעיל',   cls:'bg-amber-400/12 text-amber-200 border-amber-400/30'},
  overdue:  {he:'באיחור', cls:'bg-rose-400/12 text-rose-300 border-rose-400/30'},
  returned: {he:'הוחזר',  cls:'bg-emerald-400/12 text-emerald-300 border-emerald-400/30'},
  cancelled:{he:'בוטל',   cls:'bg-slate-400/12 text-slate-300 border-slate-400/30'},
};
const ROLE_HE = { admin:'מנהל מערכת', equipment_manager:'אחראי ציוד', user:'משתמש רגיל' };
const COND_HE = { good:'תקין', minor_damage:'נזק קל', major_damage:'נזק חמור' };

/* ===== utils ===== */
const cx = (...a) => a.filter(Boolean).join(' ');
const todayISO = () => new Date().toISOString().slice(0,10);
const nowTime  = () => new Date().toTimeString().slice(0,5);
const fmtDate  = d => d ? new Date(d).toLocaleDateString('he-IL') : '—';
const fmtDT    = d => d ? new Date(d).toLocaleString('he-IL',{dateStyle:'short',timeStyle:'short'}) : '—';
const money    = n => (n==null||n==='') ? '—' : '₪' + Number(n).toLocaleString('he-IL');
const itemLabel = i => i?.equipment?.name ? (i.equipment.name + (i.camera_number ? ` (מצלמה מס' ${i.camera_number})` : '')) : null;
/* ===== single source of truth for "is this loan overdue right now" =====
   Built from the browser's LOCAL wall-clock time (new Date(y,m,d,h,min) always
   uses local time, never UTC) — since every real user of this app is physically
   in Israel, the device's local time already IS Israel time. This avoids the
   old bug of comparing only dates (ignoring the time) and the UTC bug of
   toISOString()-based date strings. */
const borrowDueMoment = (b) => {
  if(!b || !b.expected_return_date) return null;
  const [y,mo,d] = b.expected_return_date.split('-').map(Number);
  const [hh,mm] = (b.expected_return_time||'23:59').slice(0,5).split(':').map(Number);
  return new Date(y, mo-1, d, hh||0, mm||0, 0);
};
const isBorrowOverdue = (b) => {
  if(!b || !b.approved) return false;
  if(b.status==='returned' || b.status==='cancelled') return false;
  const due = borrowDueMoment(b);
  return !!due && due.getTime() < Date.now();
};
const rpcErrorText = (error) => {
  if(!error) return 'שגיאה לא ידועה';
  console.error('Supabase RPC error:', error);
  const parts = [error.message, error.details, error.hint].filter(Boolean);
  return parts.length ? parts.join(' — ') : (error.code ? `קוד שגיאה: ${error.code}` : 'שגיאה לא ידועה');
};
const reduced  = () => typeof window!=='undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine     = () => typeof window!=='undefined' && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ===== motion hooks ===== */
function useCountUp(target){
  const [v,setV] = useState(reduced()?target:0);
  useEffect(()=>{
    if(reduced()){ setV(target); return; }
    let raf, start; const dur=900, from=0;
    const tick = t => { if(!start) start=t; const p=Math.min(1,(t-start)/dur);
      const e=1-Math.pow(1-p,3); setV(Math.round(from+(target-from)*e));
      if(p<1) raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(raf);
  },[target]);
  return v;
}
function useAmbientParallax(){
  useEffect(()=>{
    if(reduced() || !fine()) return;
    let raf=0, tx=0, ty=0;
    const move = e => { tx=(e.clientX/window.innerWidth-.5)*2; ty=(e.clientY/window.innerHeight-.5)*2;
      if(!raf) raf=requestAnimationFrame(()=>{ const r=document.documentElement.style;
        r.setProperty('--px',tx.toFixed(3)); r.setProperty('--py',ty.toFixed(3)); raf=0; }); };
    window.addEventListener('mousemove',move,{passive:true});
    return ()=>window.removeEventListener('mousemove',move);
  },[]);
}
function Tilt({children,max=8,className=''}){
  const inner = useRef();
  const on = e => { if(!fine()||!inner.current) return; const r=inner.current.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    inner.current.style.transform = `rotateX(${(-y*max).toFixed(2)}deg) rotateY(${(x*max).toFixed(2)}deg)`; };
  const off = () => { if(inner.current) inner.current.style.transform=''; };
  return <div style={{perspective:'900px'}} onMouseMove={on} onMouseLeave={off}>
    <div ref={inner} className={cx('tilt',className)}>{children}</div></div>;
}

/* ===== SVG icons ===== */
const I = ({d,size=20,className=''}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{d}</svg>
);
const IconDash   = p => <I {...p} d={<><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>} />;
const IconBox    = p => <I {...p} d={<><path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/></>} />;
const IconOut    = p => <I {...p} d={<><path d="M14 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/><path d="M20 12H10"/><path d="m17 9 3 3-3 3"/></>} />;
const IconIn     = p => <I {...p} d={<><path d="M10 15v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v3"/><path d="M4 12h10"/><path d="m7 9-3 3 3 3"/></>} />;
const IconLog    = p => <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/></>} />;
const IconUsers  = p => <I {...p} d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></>} />;
const IconSearch = p => <I {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>} />;
const IconPlus   = p => <I {...p} d={<><path d="M12 5v14M5 12h14"/></>} />;
const IconX      = p => <I {...p} d={<><path d="M18 6 6 18M6 6l12 12"/></>} />;
const IconEdit   = p => <I {...p} d={<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>} />;
const IconTrash  = p => <I {...p} d={<><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></>} />;
const IconExcel  = p => <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="m9 13 6 5M15 13l-6 5"/></>} />;
const IconLogout = p => <I {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>} />;
const IconMenu   = p => <I {...p} d={<><path d="M4 6h16M4 12h16M4 18h16"/></>} />;
const IconCheck  = p => <I {...p} d={<path d="M20 6 9 17l-5-5"/>} />;
const IconAlert  = p => <I {...p} d={<><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>} />;
const IconInfo   = p => <I {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></>} />;
const IconBell   = p => <I {...p} d={<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>} />;
const IconWrench = p => <I {...p} d={<><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L2 19l3 3 7.3-7.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2Z"/></>} />;
const IconFlag   = p => <I {...p} d={<><path d="M4 22V4"/><path d="M4 4h13l-2 4 2 4H4"/></>} />;
const IconUpload = p => <I {...p} d={<><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></>} />;
const IconClock  = p => <I {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>} />;

/* =====================================================================
   Ambient background
   ===================================================================== */
function Ambient(){
  return (
    <div className="ambient" aria-hidden="true">
      <div className="layer l1"><span className="blob b1"/></div>
      <div className="layer l2"><span className="blob b2"/></div>
      <div className="layer l3"><span className="blob b3"/></div>
      <div className="ambient-grid"/>
    </div>
  );
}

/* =====================================================================
   Auth context
   ===================================================================== */
const Auth = createContext(null);
const useAuth = () => useContext(Auth);
const PN_KEY = 'mm_personal_number';
function AuthProvider({children}) {
  // profile === undefined -> still checking for a saved session
  // profile === null      -> logged out, show the personal-number gate
  // profile === {...}     -> logged in
  const [profile,setProfile] = useState(undefined);
  useEffect(()=>{
    (async()=>{
      if(!sb){ setProfile(null); return; }
      let pn = null;
      try{ pn = localStorage.getItem(PN_KEY); }catch(e){}
      if(!pn){ setProfile(null); return; }
      const {data} = await sb.from('profiles').select('*').eq('personal_number',pn).single();
      setProfile(data || null);
    })();
  },[]);
  const loginWithProfile = useCallback((p)=>{
    setProfile(p);
    try{ if(p?.personal_number) localStorage.setItem(PN_KEY, p.personal_number); }catch(e){}
  },[]);
  const signOut = useCallback(()=>{
    setProfile(null);
    try{ localStorage.removeItem(PN_KEY); }catch(e){}
  },[]);
  const refreshProfile = useCallback(async ()=>{
    if(!profile?.personal_number) return;
    const {data} = await sb.from('profiles').select('*').eq('personal_number',profile.personal_number).single();
    if(data) setProfile(data);
  },[profile]);
  const value = {
    profile, role: profile?.role,
    isStaff: profile?.role==='admin' || profile?.role==='equipment_manager',
    isAdmin: profile?.role==='admin',
    isPrimaryAdmin: profile?.is_primary_admin===true,
    loginWithProfile, signOut, refreshProfile,
  };
  return <Auth.Provider value={value}>{children}</Auth.Provider>;
}

/* =====================================================================
   Toast
   ===================================================================== */
const ToastCtx = createContext(()=>{});
const useToast = () => useContext(ToastCtx);
const TOAST_ICON = { success:<IconCheck className="text-emerald-300"/>, error:<IconAlert className="text-rose-300"/>, info:<IconInfo className="text-brass"/> };
function ToastHost({children}){
  const [items,setItems] = useState([]);
  const push = useCallback((msg,type='info')=>{
    const id = Math.random().toString(36).slice(2);
    setItems(x=>[...x,{id,msg,type}]);
    setTimeout(()=>setItems(x=>x.filter(i=>i.id!==id)),4200);
  },[]);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 left-1/2 z-[100] flex w-[92%] max-w-sm -translate-x-1/2 flex-col gap-2.5">
        {items.map(t=>(
          <div key={t.id} className="pop glass-modal flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
            <span className="shrink-0">{TOAST_ICON[t.type]}</span>
            <span className="text-slate-100">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* =====================================================================
   Primitives
   ===================================================================== */
const Btn = ({variant='primary',className='',children,...p}) => {
  const v = {primary:'btn-glass',brass:'btn-brass',ghost:'btn-ghost',outline:'btn-outline',danger:'btn-danger'}[variant] || 'btn-glass';
  return <button className={cx('btn',v,className)} {...p}>{children}</button>;
};
const Badge = ({map,value}) => {
  if(value==null || value==='') return null;
  const m = map[value] || {he:value,cls:'bg-white/10 text-slate-300 border-white/20'};
  return <span className={cx('chip',m.cls)}>{m.he}</span>;
};
const Field = ({label,children,required,hint}) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}{required&&<span className="text-rose-400"> *</span>}</span>
    {children}
    {hint&&<span className="mt-1 block text-xs text-slate-500">{hint}</span>}
  </label>
);
const Input = ({className,...p}) => <input className={cx('input',className)} {...p}/>;
const Select= ({children,className,...p}) => <select className={cx('input',className)} {...p}>{children}</select>;
const Area  = p => <textarea className="input min-h-[84px] resize-y" {...p}/>;

function Modal({open,onClose,title,children,wide}){
  useEffect(()=>{
    const h = e => e.key==='Escape' && onClose();
    if(open) document.addEventListener('keydown',h);
    return ()=>document.removeEventListener('keydown',h);
  },[open,onClose]);
  useEffect(()=>{
    if(!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return ()=>{
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  },[open]);
  if(!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto overscroll-contain bg-black/55 p-0 backdrop-blur-md sm:items-center sm:p-4" onMouseDown={onClose}>
      <div className={cx('pop glass-modal w-full overflow-y-auto rounded-t-[28px] sm:rounded-[28px]', wide?'sm:max-w-3xl':'sm:max-w-lg')}
           style={{maxHeight:'min(92vh,92dvh)'}}
           onMouseDown={e=>e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"><IconX/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
const Spinner = ({label}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-brass"></div>
    {label&&<span className="text-sm">{label}</span>}
  </div>
);
const Empty = ({icon,title,sub,action}) => (
  <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
    <div className="mb-1 text-slate-600">{icon}</div>
    <p className="font-semibold text-slate-200">{title}</p>
    {sub&&<p className="max-w-xs text-sm text-slate-500">{sub}</p>}
    {action}
  </div>
);
function QR({text,size=128}){
  const ref = useRef();
  useEffect(()=>{
    if(!ref.current||!text) return;
    ref.current.innerHTML='';
    new QRCode(ref.current,{text:String(text),width:size,height:size,correctLevel:QRCode.CorrectLevel.M});
  },[text,size]);
  return <div ref={ref} className="inline-block rounded-xl bg-white p-2.5 shadow-lg ring-1 ring-white/20"/>;
}

/* skeletons */
const SkelTile = () => <div className="card p-4"><div className="skeleton mb-3 h-10 w-10 rounded-xl"/><div className="skeleton mb-2 h-8 w-16 rounded-lg"/><div className="skeleton h-3 w-24 rounded"/></div>;
const DashSkeleton = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{Array.from({length:6}).map((_,i)=><SkelTile key={i}/>)}</div>
    <div className="card p-5"><div className="skeleton mb-3 h-4 w-40 rounded"/><div className="skeleton h-4 w-full rounded"/></div>
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card p-5 lg:col-span-2"><div className="skeleton mb-4 h-5 w-40 rounded"/>{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton mb-2.5 h-8 w-full rounded"/>)}</div>
      <div className="card p-5"><div className="skeleton mb-4 h-5 w-32 rounded"/>{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton mb-2.5 h-12 w-full rounded-xl"/>)}</div>
    </div>
  </div>
);
const CardsSkeleton = ({n=8}) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({length:n}).map((_,i)=><div key={i} className="card overflow-hidden"><div className="skeleton h-32 w-full rounded-none"/><div className="p-3"><div className="skeleton mb-2 h-4 w-3/4 rounded"/><div className="skeleton h-3 w-1/2 rounded"/></div></div>)}
  </div>
);
const ListSkeleton = ({n=4}) => (<div className="space-y-3">{Array.from({length:n}).map((_,i)=><div key={i} className="card p-4"><div className="skeleton mb-2 h-5 w-40 rounded"/><div className="skeleton h-3 w-64 rounded"/></div>)}</div>);
const TableSkeleton = ({rows=8}) => (<div className="card p-4"><div className="skeleton mb-3 h-8 w-full rounded"/>{Array.from({length:rows}).map((_,i)=><div key={i} className="skeleton mb-2 h-10 w-full rounded"/>)}</div>);

/* =====================================================================
   Signature pad
   ===================================================================== */
function SignaturePad({onChange}){
  const ref = useRef(); const drawing = useRef(false); const last = useRef(null);
  useEffect(()=>{
    const c = ref.current, dpr = window.devicePixelRatio||1;
    const w = c.clientWidth, h = c.clientHeight;
    c.width = w*dpr; c.height = h*dpr;
    const ctx = c.getContext('2d'); ctx.scale(dpr,dpr);
    ctx.lineWidth=2.4; ctx.lineCap='round'; ctx.strokeStyle='#0b1220';
  },[]);
  const pos = e => { const r = ref.current.getBoundingClientRect(); const p = e.touches?e.touches[0]:e; return {x:p.clientX-r.left, y:p.clientY-r.top}; };
  const start = e => { e.preventDefault(); drawing.current=true; last.current=pos(e); };
  const move  = e => { if(!drawing.current) return; e.preventDefault(); const ctx = ref.current.getContext('2d'), p = pos(e);
    ctx.beginPath(); ctx.moveTo(last.current.x,last.current.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last.current=p; };
  const end = () => { if(drawing.current){drawing.current=false; onChange(ref.current.toDataURL('image/png'));} };
  const clear = () => { const c=ref.current; c.getContext('2d').clearRect(0,0,c.width,c.height); onChange(null); };
  return (
    <div>
      <canvas ref={ref} className="signpad h-40 w-full cursor-crosshair rounded-2xl border border-white/25 shadow-inner"
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}/>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>חתום/חתמי באצבע או בעכבר</span>
        <button type="button" onClick={clear} className="font-medium text-slate-400 transition hover:text-rose-400">נקה חתימה</button>
      </div>
    </div>
  );
}

/* ===== data helpers ===== */
const db = {
  categories: ()=> sb.from('categories').select('*').order('name'),
  equipment:  ()=> sb.from('equipment').select('*, category:category_id(name)').order('name'),
  available:  ()=> sb.from('equipment').select('id,name,available_quantity,category:category_id(name)').gt('available_quantity',0).order('name'),
  countBy:    (col,val)=> sb.from('equipment').select('*',{count:'exact',head:true}).eq(col,val),
};
const fetchBorrowFull = async id => {
  const {data} = await sb.from('borrows')
    .select('*, borrow_items(quantity, camera_number, equipment:equipment_id(name,serial_number))')
    .eq('id',id).single();
  return data;
};

/* =====================================================================
   LOGIN — personal number gate, with inline self-registration
   ===================================================================== */
function AuthShell({children}){
  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="rise w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center"><img src={LOGO_DATA_URI} alt="לוגו" className="h-full w-full object-contain" style={{filter:'invert(1)'}}/></div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">החתמות מולטימדיה</h1>
          <p className="mt-1.5 text-sm text-slate-400">מחלקת המולטימדיה</p>
        </div>
        <div className="card space-y-4 p-6">{children}</div>
      </div>
    </div>
  );
}
function Register({personalNumber,onBack,onRegistered}){
  const toast = useToast();
  const [f,setF] = useState({first_name:'',last_name:'',personal_number:personalNumber||'',phone:'',unit:''});
  const [busy,setBusy] = useState(false);
  const set = (k,v)=>setF(x=>({...x,[k]:v}));
  const submit = async () => {
    if(!f.first_name.trim() || !f.last_name.trim()) return toast('נא למלא שם פרטי ושם משפחה','error');
    if(!f.personal_number.trim()) return toast('נא למלא מספר אישי','error');
    if(!f.unit.trim()) return toast('נא למלא מחלקה','error');
    setBusy(true);
    const {data:existing} = await sb.from('profiles').select('id').eq('personal_number',f.personal_number.trim()).single();
    if(existing){ setBusy(false); toast('מספר אישי זה כבר רשום במערכת','error'); return; }
    const full_name = `${f.first_name.trim()} ${f.last_name.trim()}`;
    const {data,error} = await sb.from('profiles').insert({
      full_name, first_name:f.first_name.trim(), last_name:f.last_name.trim(),
      personal_number:f.personal_number.trim(), phone:f.phone.trim()||null, unit:f.unit.trim(), role:'user',
    }).select().single();
    setBusy(false);
    if(error) return toast('שגיאה בהרשמה: '+(error.message||'שגיאה לא ידועה'),'error');
    toast('נרשמת בהצלחה!','success');
    onRegistered(data);
  };
  return (
    <AuthShell>
      <div>
        <h2 className="mb-1 text-lg font-bold text-white">הרשמה למערכת</h2>
        <p className="mb-3 text-xs text-slate-500">המספר האישי לא נמצא במערכת — פרטים קצרים ותועבר/י ישר לטופס ההשאלה.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="שם פרטי" required><Input value={f.first_name} onChange={e=>set('first_name',e.target.value)}/></Field>
        <Field label="שם משפחה" required><Input value={f.last_name} onChange={e=>set('last_name',e.target.value)}/></Field>
      </div>
      <Field label="מספר אישי" required hint="המספר שהוזן בכניסה"><Input dir="ltr" value={f.personal_number} disabled className="opacity-70"/></Field>
      <Field label="טלפון"><Input dir="ltr" type="tel" value={f.phone} onChange={e=>set('phone',e.target.value)} placeholder="050-1234567"/></Field>
      <Field label="מחלקה / יחידה" required><Input value={f.unit} onChange={e=>set('unit',e.target.value)} placeholder="לדוגמה: פלוגה א׳"/></Field>
      <div className="flex gap-2 pt-1">
        <Btn variant="ghost" onClick={onBack}>חזרה</Btn>
        <Btn variant="brass" className="flex-1" onClick={submit} disabled={busy}>{busy?'נרשם…':'הרשמה וכניסה'}</Btn>
      </div>
    </AuthShell>
  );
}
function PersonalNumberGate(){
  const {loginWithProfile} = useAuth();
  const toast = useToast();
  const [stage,setStage] = useState('enter'); // 'enter' | 'register'
  const [pn,setPn] = useState('');
  const [busy,setBusy] = useState(false);
  const checkAndEnter = async () => {
    const clean = pn.trim();
    if(!clean) return toast('נא להזין מספר אישי','error');
    if(clean.length !== 7) return toast('מספר אישי חייב להכיל 7 ספרות בדיוק','error');
    setBusy(true);
    const {data} = await sb.from('profiles').select('*').eq('personal_number',clean).single();
    setBusy(false);
    if(data) loginWithProfile(data);
    else setStage('register');
  };
  if(stage==='register') return <Register personalNumber={pn} onBack={()=>setStage('enter')} onRegistered={loginWithProfile}/>;
  return (
    <AuthShell>
      <Field label="מספר אישי" required hint="7 ספרות">
        <Input dir="ltr" inputMode="numeric" autoFocus value={pn} maxLength={7}
          onChange={e=>setPn(e.target.value.replace(/[^0-9]/g,'').slice(0,7))}
          placeholder="לדוגמה: 8123456" onKeyDown={e=>e.key==='Enter'&&checkAndEnter()}/>
      </Field>
      <Btn variant="brass" className="w-full" onClick={checkAndEnter} disabled={busy}>{busy?'בודק…':'כניסה'}</Btn>
      <p className="text-center text-xs text-slate-500">משתמש/ת חדש/ה? הזן/י מספר אישי ותועבר/י להרשמה קצרה</p>
    </AuthShell>
  );
}

/* =====================================================================
   DASHBOARD
   ===================================================================== */
function StatCard({label,value,tone,icon,onClick}){
  const disp = useCountUp(value);
  const tones = {
    emerald:'text-emerald-300 bg-emerald-400/12 ring-1 ring-emerald-400/25',
    amber:'text-amber-200 bg-amber-400/12 ring-1 ring-amber-400/25',
    rose:'text-rose-300 bg-rose-400/12 ring-1 ring-rose-400/25',
    sky:'text-[#f0a58c] bg-[#c2410c]/15 ring-1 ring-[#c2410c]/30',
    slate:'text-slate-300 bg-white/10',
    brass:'text-[#e8a7bb] bg-[#a83358]/15 ring-1 ring-[#a83358]/30',
  };
  return (
    <Tilt max={9}>
      <button onClick={onClick} className="card lift w-full p-4 text-right">
        <div className={cx('mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl',tones[tone])}>{icon}</div>
        <div className="num text-3xl font-bold text-white">{disp}</div>
        <div className="mt-0.5 text-sm text-slate-400">{label}</div>
      </button>
    </Tilt>
  );
}
function MixBar({data}){
  const total = data.reduce((a,b)=>a+b.value,0) || 1;
  const [go,setGo] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setGo(true),120); return ()=>clearTimeout(t); },[]);
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-white">מצב המלאי</h3>
        <span className="num text-sm text-slate-400">{total} פריטים</span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5">
        {data.map((d,i)=>(
          <div key={i} title={d.label} style={{width: go?`${(d.value/total*100)}%`:'0%', background:d.color, transition:'width .9s cubic-bezier(.2,.7,.2,1)'}} className="h-full first:rounded-r-full last:rounded-l-full"/>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-400">
        {data.map((d,i)=>(
          <span key={i} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{background:d.color}}/>{d.label}
            <b className="num text-slate-200">{d.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
function BarChart({title,data,color}){
  const max = Math.max(1,...data.map(d=>d.value));
  const [go,setGo] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setGo(true),150); return ()=>clearTimeout(t); },[]);
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-bold text-white">{title}</h3>
      {data.length===0 ? <p className="py-6 text-center text-sm text-slate-500">אין נתונים עדיין</p> :
      <div className="flex h-40 items-end gap-3">
        {data.map((d,i)=>(
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span className="num text-xs text-slate-300">{d.value}</span>
            <div className="w-full rounded-t-lg" style={{height: go?`${(d.value/max*100)}%`:'0%', minHeight:d.value>0?'4px':'0px', background:color, transition:'height .8s cubic-bezier(.2,.7,.2,1)'}}/>
            <span className="w-full truncate text-center text-[11px] text-slate-500">{d.label}</span>
          </div>
        ))}
      </div>}
    </div>
  );
}
function TrendCharts({data}){
  if(!data) return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card p-5"><div className="skeleton h-40 w-full rounded"/></div>
      <div className="card p-5"><div className="skeleton h-40 w-full rounded"/></div>
    </div>
  );
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <BarChart title="השאלות לפי חודש (6 חודשים אחרונים)" data={data.monthCounts} color="linear-gradient(180deg,#e0655a,#8f2438)"/>
      <BarChart title="השאלות לפי יחידה" data={data.deptCounts} color="linear-gradient(180deg,#c94a70,#7a1f3f)"/>
    </div>
  );
}
function BorrowDetail({borrow,onClose,onApproved,canApprove,onReturned}){
  const toast = useToast(); const {profile} = useAuth();
  const [busy,setBusy] = useState(false);
  const [returning,setReturning] = useState(false);
  const sigUrl = borrow.signature_path ? sb.storage.from('signatures').getPublicUrl(borrow.signature_path).data.publicUrl : null;
  const returnPhotoUrls = (borrow.return_photos||[]).map(p=>sb.storage.from('return-photos').getPublicUrl(p).data.publicUrl);
  const isReturned = borrow.status==='returned' || !!borrow.actual_return_at;
  const canReturn = !!borrow.approved && borrow.status!=='returned' && borrow.status!=='cancelled';
  const approve = async () => {
    setBusy(true);
    const {error} = await sb.rpc('approve_borrow',{p_borrow_id:borrow.id, p_approved_by:profile?.full_name||'מנהל'});
    setBusy(false);
    if(error) return toast('שגיאה באישור: '+rpcErrorText(error),'error');
    toast('הטופס אושר','success'); onApproved && onApproved();
  };
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-white/5 p-4 text-sm sm:grid-cols-3">
        {[['שם מלא',borrow.full_name],['מספר אישי',borrow.personal_number],['יחידה / מחלקה',borrow.unit],['טלפון',borrow.phone],
          ['תאריך ההשאלה',fmtDate(borrow.checkout_date)],['שעת ההשאלה',borrow.checkout_time?.slice(0,5)],
          ['תאריך ההחזרה שנקבע',fmtDate(borrow.expected_return_date)],['שעת ההחזרה שנקבעה',borrow.expected_return_time?.slice(0,5)]].map(([k,v])=>(
          <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium text-slate-100">{v||'—'}</dd></div>
        ))}
      </dl>
      {borrow.purpose && <div className="rounded-2xl border border-white/10 p-3 text-sm text-slate-200"><span className="text-xs text-slate-500">מטרת ההשאלה</span><p>{borrow.purpose}</p></div>}
      <div>
        <span className="mb-2 block text-xs text-slate-500">ציוד שנבחר</span>
        <ul className="space-y-1.5">
          {(borrow.borrow_items||[]).length===0 ? <li className="text-sm text-slate-500">לא נטענו פריטים</li> :
            (borrow.borrow_items||[]).map((i,idx)=>(
            <li key={idx} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100">
              <span>{itemLabel(i)}</span><span className="num text-xs text-slate-400">כמות: {i.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
      {sigUrl && <div><span className="mb-2 block text-xs text-slate-500">חתימה דיגיטלית</span><img src={sigUrl} className="h-28 rounded-xl border border-white/15 bg-white p-2"/></div>}

      <div className="rounded-2xl border border-white/10 p-3 text-sm">
        <span className="mb-1 block text-xs text-slate-500">סטטוס אישור</span>
        {borrow.approved
          ? <p className="text-emerald-300">✓ אושר ע"י {borrow.approved_by||'—'} · {fmtDT(borrow.approved_at)}</p>
          : <p className="text-amber-300">ממתין לאישור מנהל</p>}
        {isBorrowOverdue(borrow) && <p className="mt-1 font-medium text-rose-300">⚠ השאלה זו באיחור</p>}
      </div>

      {isReturned &&
        <div className="rounded-2xl border border-white/10 p-3 text-sm">
          <span className="mb-2 block text-xs text-slate-500">פרטי החזרה</span>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            {[['הוחזר בתאריך',fmtDT(borrow.actual_return_at)],['מצב הציוד',COND_HE[borrow.return_condition]||borrow.return_condition]].map(([k,v])=>(
              <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium text-slate-100">{v||'—'}</dd></div>
            ))}
          </dl>
          {borrow.damage_report && <p className="mt-2"><span className="text-xs text-slate-500">דיווח נזק: </span>{borrow.damage_report}</p>}
          {borrow.missing_accessories && <p className="mt-1"><span className="text-xs text-slate-500">אביזרים חסרים: </span>{borrow.missing_accessories}</p>}
          {borrow.return_notes && <p className="mt-1"><span className="text-xs text-slate-500">הערות: </span>{borrow.return_notes}</p>}
          {returnPhotoUrls.length>0 &&
            <div className="mt-2 flex flex-wrap gap-2">
              {returnPhotoUrls.map((u,i)=><a key={i} href={u} target="_blank" rel="noreferrer"><img src={u} className="h-16 w-16 rounded-lg border border-white/15 object-cover"/></a>)}
            </div>}
        </div>}

      <div className="flex justify-end gap-2 pt-1">
        <Btn variant="ghost" onClick={onClose}>סגירה</Btn>
        {canReturn &&
          <Btn variant="brass" onClick={()=>setReturning(true)}><IconIn size={16}/> קליטת החזרה</Btn>}
        {canApprove && !borrow.approved &&
          <Btn variant="brass" onClick={approve} disabled={busy}><IconCheck size={16}/> {busy?'מאשר…':'אישור הטופס'}</Btn>}
      </div>
      <Modal open={returning} onClose={()=>setReturning(false)} title="קליטת החזרת ציוד">
        {returning && <ReturnModal borrow={borrow} onClose={()=>setReturning(false)}
          onDone={()=>{ setReturning(false); onReturned && onReturned(); onClose && onClose(); }}/>}
      </Modal>
    </div>
  );
}
function PendingApprovals(){
  const [rows,setRows] = useState(null);
  const [sel,setSel] = useState(null);
  const load = useCallback(async ()=>{
    const {data} = await sb.from('borrows')
      .select('*, borrow_items(quantity, camera_number, equipment:equipment_id(name,serial_number))')
      .eq('approved',false).order('created_at',{ascending:false});
    setRows(data||[]);
  },[]);
  useEffect(()=>{load();},[load]);
  if(!rows || rows.length===0) return null;
  return (
    <div className="pop rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-200">
        <IconAlert size={18}/> {rows.length} טפסי החתמה ממתינים לאישור מנהל
      </div>
      <ul className="space-y-1.5">
        {rows.map(b=>(
          <li key={b.id} onClick={()=>setSel(b)} className="flex cursor-pointer items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10">
            <div>
              <span className="font-medium">{b.full_name}</span>
              <span className="text-slate-400"> · {b.borrow_items?.map(itemLabel).filter(Boolean).join(' · ')||'—'}</span>
            </div>
            <span className="num text-xs text-slate-500">{fmtDT(b.created_at)}</span>
          </li>
        ))}
      </ul>
      <Modal open={!!sel} onClose={()=>setSel(null)} wide title="פרטי טופס החתמה">
        {sel && <BorrowDetail borrow={sel} canApprove onClose={()=>setSel(null)} onApproved={()=>{setSel(null);load();}} onReturned={()=>{setSel(null);load();}}/>}
      </Modal>
    </div>
  );
}
function OverdueBanner(){
  const [rows,setRows] = useState(null);
  const [sel,setSel] = useState(null);
  const load = useCallback(async ()=>{
    const {data} = await sb.from('borrows')
      .select('*, borrow_items(quantity, camera_number, equipment:equipment_id(name,serial_number))')
      .eq('approved',true).neq('status','returned').neq('status','cancelled');
    setRows((data||[]).filter(isBorrowOverdue).sort((a,b)=>(a.expected_return_date||'').localeCompare(b.expected_return_date||'')));
  },[]);
  useEffect(()=>{ load(); const t=setInterval(load,60000); return ()=>clearInterval(t); },[load]);
  if(!rows || rows.length===0) return null;
  return (
    <div className="pop rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-200">
        <IconAlert size={18}/> {rows.length} השאלות באיחור — הציוד לא הוחזר במועד שנקבע
      </div>
      <ul className="space-y-1.5">
        {rows.map(b=>(
          <li key={b.id} onClick={()=>setSel(b)} className="flex cursor-pointer items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10">
            <div>
              <span className="font-medium">{b.full_name}</span>
              <span className="text-slate-400"> · {b.borrow_items?.map(itemLabel).filter(Boolean).join(' · ')||'—'}</span>
            </div>
            <span className="num text-xs text-rose-300">מ-{fmtDate(b.expected_return_date)} {b.expected_return_time?.slice(0,5)||''}</span>
          </li>
        ))}
      </ul>
      <Modal open={!!sel} onClose={()=>setSel(null)} wide title="פרטי השאלה באיחור">
        {sel && <BorrowDetail borrow={sel} onClose={()=>setSel(null)} onReturned={()=>{setSel(null);load();}}/>}
      </Modal>
    </div>
  );
}
function Dashboard({go}){
  const [s,setS] = useState(null);
  const [activity,setActivity] = useState([]);
  const [upcoming,setUpcoming] = useState([]);
  const [trends,setTrends] = useState(null);
  const [selBorrow,setSelBorrow] = useState(null);
  const openBorrow = async id => { const data = await fetchBorrowFull(id); if(data) setSelBorrow(data); };
  const load = useCallback(async () => {
      const weekAgo = new Date(Date.now()-7*864e5).toISOString();
      const startToday = todayISO()+'T00:00:00';
      const [av,bo,fa,nw,rt,act,ab,tr,su] = await Promise.all([
        db.countBy('status','available'),
        db.countBy('status','borrowed'),
        db.countBy('status','faulty'),
        sb.from('equipment').select('*',{count:'exact',head:true}).gte('created_at',weekAgo),
        sb.from('borrows').select('*',{count:'exact',head:true}).eq('status','returned').gte('actual_return_at',startToday),
        sb.from('audit_log').select('*').order('created_at',{ascending:false}).limit(8),
        sb.from('borrows').select('id,full_name,expected_return_date,expected_return_time,status,approved')
          .eq('approved',true).neq('status','returned').neq('status','cancelled'),
        sb.from('borrows').select('checkout_date,unit').limit(500),
        sb.from('borrows').select('borrow_items(quantity)').eq('approved',true).neq('status','returned'),
      ]);
      const signedOut = (su.data||[]).reduce((sum,b)=>sum+(b.borrow_items||[]).reduce((s,i)=>s+(i.quantity||0),0),0);
      const activeBorrows = ab.data||[];
      const overdueCount = activeBorrows.filter(isBorrowOverdue).length;
      setS({available:av.count||0,borrowed:bo.count||0,signedOut,faulty:fa.count||0,overdue:overdueCount,fresh:nw.count||0,returnedToday:rt.count||0});
      setActivity(act.data||[]);
      setUpcoming([...activeBorrows].sort((a,b)=>(a.expected_return_date||'').localeCompare(b.expected_return_date||'')).slice(0,6));

      const months = [];
      const base = new Date();
      for(let i=5;i>=0;i--){ const d=new Date(base.getFullYear(), base.getMonth()-i, 1);
        months.push({key:`${d.getFullYear()}-${d.getMonth()}`, label:d.toLocaleDateString('he-IL',{month:'short'})}); }
      const trData = tr.data||[];
      const monthCounts = months.map(m=>({label:m.label, value:trData.filter(b=>{
      if(!b.checkout_date) return false; const bd=new Date(b.checkout_date); return `${bd.getFullYear()}-${bd.getMonth()}`===m.key;
    }).length}));
    const deptMap = {};
    trData.forEach(b=>{ const u=b.unit||'לא ידוע'; deptMap[u]=(deptMap[u]||0)+1; });
    const deptCounts = Object.entries(deptMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([label,value])=>({label,value}));
    setTrends({monthCounts,deptCounts});
  },[]);
  useEffect(()=>{ load(); const t = setInterval(load,60000); return ()=>clearInterval(t); },[load]);
  if(!s) return <DashSkeleton/>;
  const actionLabel = a => ({INSERT:'הוספה',UPDATE:'עדכון',DELETE:'מחיקה',BORROW:'השאלה',RETURN:'החזרה',EXTEND:'הארכה',APPROVE:'אישור'}[a]||a);
  return (
    <div className="space-y-5">
      <PendingApprovals/>
      <OverdueBanner/>
      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="ציוד זמין"             value={s.available}     tone="emerald" icon={<IconBox/>}  onClick={()=>go('equipment','available')}/>
        <StatCard label="ציוד חתום"             value={s.signedOut}     tone="amber"   icon={<IconOut/>}  onClick={()=>go('returns')}/>
        <StatCard label="ציוד תקול"             value={s.faulty}        tone="rose"    icon={<IconBox/>}  onClick={()=>go('equipment','faulty')}/>
        <StatCard label="ציוד באיחור"           value={s.overdue}       tone="rose"    icon={<IconLog/>}  onClick={()=>go('returns')}/>
        <StatCard label="ציודים חדשים (7 ימים)" value={s.fresh}         tone="brass"   icon={<IconPlus/>} onClick={()=>go('equipment')}/>
        <StatCard label="חזרו היום"             value={s.returnedToday} tone="sky"     icon={<IconIn/>}   onClick={()=>go('returns')}/>
      </div>

      <MixBar data={[
        {label:'זמין',   value:s.available, color:'#34d399'},
        {label:'מושאל',  value:s.borrowed,  color:'#fbbf24'},
        {label:'תקול',   value:s.faulty,    color:'#fb7185'},
      ]}/>

      <TrendCharts data={trends}/>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white"><IconLog size={18}/> פעילות אחרונה</h3>
          {activity.length===0 ? <p className="py-8 text-center text-sm text-slate-500">אין פעילות עדיין</p> :
            <ul className="divide-y divide-white/5">
              {activity.map(a=>(
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium text-slate-100">{actionLabel(a.action)}</span>
                    <span className="text-slate-500"> · {a.entity_type==='equipment'?'ציוד':a.entity_type==='borrows'?'השאלה':a.entity_type} · {a.actor_name||'—'}</span>
                  </div>
                  <span className="num shrink-0 text-xs text-slate-500">{fmtDT(a.created_at)}</span>
                </li>
              ))}
            </ul>}
        </div>
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white"><IconIn size={18}/> החזרות קרובות</h3>
          {upcoming.length===0 ? <p className="py-8 text-center text-sm text-slate-500">אין החזרות מתוכננות</p> :
            <ul className="space-y-2.5">
              {upcoming.map(b=>{
                const late = isBorrowOverdue(b);
                return (
                  <li key={b.id} onClick={()=>openBorrow(b.id)} className="flex cursor-pointer items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-sm transition hover:bg-white/10">
                    <div><div className="font-medium text-slate-100">{b.full_name}</div>
                      <div className={cx('num text-xs',late?'font-medium text-rose-300':'text-slate-500')}>{fmtDate(b.expected_return_date)} {b.expected_return_time?.slice(0,5)||''}</div></div>
                    <Badge map={BORROW_STATUS} value={late?'overdue':b.status}/>
                  </li>
                );
              })}
            </ul>}
        </div>
      </div>
      <Modal open={!!selBorrow} onClose={()=>setSelBorrow(null)} wide title="פרטי השאלה">
        {selBorrow && <BorrowDetail borrow={selBorrow} onClose={()=>setSelBorrow(null)} onReturned={()=>{setSelBorrow(null);load();}}/>}
      </Modal>
    </div>
  );
}

/* =====================================================================
   EQUIPMENT
   ===================================================================== */
function EquipmentForm({item,categories,onSaved,onClose}){
  const toast = useToast();
  const empty = {name:'',category_id:'',quantity:1,available_quantity:1};
  const [f,setF] = useState(item?{name:item.name||'',category_id:item.category_id||'',quantity:item.quantity??1,available_quantity:item.available_quantity ?? item.quantity ?? 1}:empty);
  const [busy,setBusy] = useState(false);
  const set = (k,v)=>setF(x=>({...x,[k]:v}));
  const borrowedNow = item ? Math.max(0,(item.quantity??0)-(item.available_quantity??0)) : 0;
  const save = async () => {
    if(!f.name.trim()) return toast('שם ציוד הוא שדה חובה','error');
    if(!f.category_id) return toast('קטגוריה היא שדה חובה','error');
    const qty = Number(f.quantity);
    if(!Number.isFinite(qty) || qty<=0) return toast('כמות כוללת חייבת להיות מספר שלם גדול מ-0','error');
    let avail = item ? Number(f.available_quantity) : qty;
    if(!Number.isFinite(avail)) avail = qty;
    if(avail<0) return toast('כמות זמינה לא יכולה להיות שלילית','error');
    if(avail>qty) return toast('כמות זמינה לא יכולה לעלות על הכמות הכוללת','error');
    if(item && qty<borrowedNow) return toast(`לא ניתן להקטין את הכמות הכוללת מתחת ל-${borrowedNow} (מספר היחידות שאינן זמינות כרגע)`,'error');
    setBusy(true);
    const payload = {name:f.name.trim(), category_id:f.category_id, quantity:qty, available_quantity:avail};
    let error, data;
    if(item?.id) ({data,error} = await sb.from('equipment').update(payload).eq('id',item.id).select().single());
    else ({data,error} = await sb.from('equipment').insert(payload).select().single());
    setBusy(false);
    if(error) return toast('שגיאה בשמירה: '+(error.message||'שגיאה לא ידועה'),'error');
    toast(item?'הציוד עודכן':'הציוד נוסף','success'); onSaved(data);
  };
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="שם" required><Input value={f.name} onChange={e=>set('name',e.target.value)}/></Field>
        <Field label="קטגוריה" required><Select value={f.category_id} onChange={e=>set('category_id',e.target.value)}>
          <option value="">— בחר/י קטגוריה —</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <Field label="כמות כוללת" required><Input type="number" min="1" dir="ltr" value={f.quantity??1} onChange={e=>set('quantity',e.target.value)}/></Field>
        {item
          ? <Field label="כמות זמינה" required hint={borrowedNow>0?`${borrowedNow} יחידות לא זמינות כרגע`:undefined}>
              <Input type="number" min="0" dir="ltr" value={f.available_quantity??0} onChange={e=>set('available_quantity',e.target.value)}/>
            </Field>
          : <Field label="כמות זמינה" hint="בעת יצירה כל הכמות מוגדרת כזמינה אוטומטית">
              <Input type="number" dir="ltr" value={f.quantity??1} disabled className="opacity-60"/>
            </Field>}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>ביטול</Btn>
        <Btn variant="brass" onClick={save} disabled={busy}>{busy?'שומר…':'שמירה'}</Btn>
      </div>
    </div>
  );
}
function EquipmentDetail({item,history,isAdmin,onToggleArchive,onClose}){
  const borrowedNow = Math.max(0,(item.quantity??0)-(item.available_quantity??0));
  const none = (item.available_quantity??0)<=0;
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-slate-600"><IconBox size={32}/></div>
        <div className="flex-1 text-center sm:text-right">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h3 className="text-xl font-bold text-white">{item.name}</h3>
            {item.is_archived && <span className="chip border-slate-400/30 bg-slate-400/12 text-slate-300">מושבת</span>}
          </div>
          <p className="text-sm text-slate-400">{item.category?.name||'ללא קטגוריה'}</p>
        </div>
        <div className="text-center"><QR text={item.id} size={96}/></div>
      </div>
      <dl className="grid grid-cols-3 gap-x-4 gap-y-3 rounded-2xl bg-white/5 p-4 text-sm">
        <div><dt className="text-xs text-slate-500">כמות כוללת</dt><dd className="num font-medium text-slate-100">{item.quantity ?? '—'}</dd></div>
        <div><dt className="text-xs text-slate-500">כמות זמינה</dt><dd className={cx('num font-medium',none?'text-rose-300':'text-emerald-300')}>{item.available_quantity ?? '—'}</dd></div>
        <div><dt className="text-xs text-slate-500">לא זמין כרגע</dt><dd className="num font-medium text-slate-100">{borrowedNow}</dd></div>
      </dl>
      {none && <p className="rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-200">אין כרגע מלאי זמין מסוג ציוד זה.</p>}
      {isAdmin &&
        <div className="rounded-2xl border border-white/10 p-3">
          <span className="mb-2 block text-xs text-slate-500">פעולות ניהול</span>
          <Btn variant="outline" onClick={onToggleArchive}>
            {item.is_archived ? <><IconCheck size={15}/> הפעלה מחדש</> : <><IconX size={15}/> השבתת ציוד</>}
          </Btn>
        </div>}
      <div>
        <h4 className="mb-2 flex items-center gap-2 font-semibold text-white"><IconLog size={16}/> היסטוריית פריט</h4>
        {history===null ? <Spinner/> : history.length===0
          ? <p className="py-4 text-center text-sm text-slate-500">אין תיעוד עדיין</p>
          : <ul className="max-h-48 space-y-1.5 overflow-y-auto text-sm">
              {history.map(h=><li key={h.id} className="flex justify-between rounded-xl bg-white/5 px-3 py-2 text-slate-200">
                <span>{({INSERT:'נוצר',UPDATE:'עודכן',DELETE:'נמחק'}[h.action]||h.action)} · {h.actor_name||'—'}</span>
                <span className="num text-xs text-slate-500">{fmtDT(h.created_at)}</span></li>)}
            </ul>}
      </div>
    </div>
  );
}
function CategoryManager({categories,onClose,onChanged}){
  const toast = useToast();
  const [rows,setRows] = useState(categories);
  const [newName,setNewName] = useState('');
  const [busy,setBusy] = useState(false);
  const [counts,setCounts] = useState({});
  useEffect(()=>{ (async()=>{
    const {data} = await sb.from('equipment').select('category_id');
    const c = {}; (data||[]).forEach(r=>{ if(r.category_id) c[r.category_id]=(c[r.category_id]||0)+1; });
    setCounts(c);
  })(); },[rows]);
  const add = async () => {
    const name = newName.trim(); if(!name) return;
    setBusy(true);
    const {data,error} = await sb.from('categories').insert({name}).select().single();
    setBusy(false);
    if(error) return toast('שגיאה בהוספה (ייתכן ששם כזה כבר קיים)','error');
    setRows(r=>[...r,data].sort((a,b)=>a.name.localeCompare(b.name,'he')));
    setNewName(''); onChanged();
  };
  const rename = async c => {
    const name = prompt('שם חדש לקטגוריה:', c.name);
    if(!name || !name.trim() || name.trim()===c.name) return;
    const {data,error} = await sb.from('categories').update({name:name.trim()}).eq('id',c.id).select().single();
    if(error) return toast('שגיאה בעדכון','error');
    setRows(r=>r.map(x=>x.id===c.id?data:x)); onChanged();
  };
  const del = async c => {
    if(counts[c.id]) return toast(`לא ניתן למחוק — ${counts[c.id]} פריטי ציוד משויכים לקטגוריה זו`,'error');
    if(!confirm(`למחוק את הקטגוריה "${c.name}"?`)) return;
    const {error} = await sb.from('categories').delete().eq('id',c.id);
    if(error) return toast('שגיאה במחיקה','error');
    setRows(r=>r.filter(x=>x.id!==c.id)); onChanged();
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="שם קטגוריה חדשה" onKeyDown={e=>e.key==='Enter'&&add()}/>
        <Btn variant="brass" onClick={add} disabled={busy}><IconPlus size={16}/> הוספה</Btn>
      </div>
      {rows.length===0 ? <p className="py-4 text-center text-sm text-slate-500">אין קטגוריות עדיין</p> :
      <ul className="space-y-1.5">
        {rows.map(c=>(
          <li key={c.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
            <div><span className="font-medium text-slate-100">{c.name}</span><span className="num mr-2 text-xs text-slate-500">{counts[c.id]||0} פריטים</span></div>
            <div className="flex gap-1">
              <button onClick={()=>rename(c)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"><IconEdit size={14}/></button>
              <button onClick={()=>del(c)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"><IconTrash size={14}/></button>
            </div>
          </li>
        ))}
      </ul>}
      <div className="flex justify-end pt-1"><Btn variant="ghost" onClick={onClose}>סגירה</Btn></div>
    </div>
  );
}
function Equipment({initialFilter}){
  const {isAdmin} = useAuth(); const toast = useToast();
  const [rows,setRows] = useState(null);
  const [loadError,setLoadError] = useState(null);
  const [cats,setCats] = useState([]);
  const [q,setQ] = useState('');
  const [cat,setCat] = useState('');
  const [avail,setAvail] = useState(initialFilter==='available'?'available':'');
  const [showArchived,setShowArchived] = useState(false);
  const [editing,setEditing] = useState(null);
  const [detail,setDetail] = useState(null); const [hist,setHist] = useState(null);
  const [catMgrOpen,setCatMgrOpen] = useState(false);
  const importRef = useRef();
  const load = useCallback(async ()=>{
    setRows(null); setLoadError(null);
    const [{data:eq,error:eqErr},{data:c}] = await Promise.all([db.equipment(),db.categories()]);
    if(eqErr){ setLoadError(eqErr.message||'שגיאה בטעינת הציוד מהשרת'); setRows([]); }
    else setRows(eq||[]);
    setCats(c||[]);
  },[]);
  useEffect(()=>{load();},[load]);
  const openDetail = async item => {
    setDetail(item); setHist(null);
    const {data} = await sb.from('audit_log').select('*').eq('entity_type','equipment').eq('entity_id',item.id).order('created_at',{ascending:false}).limit(20);
    setHist(data||[]);
  };
  const del = async item => {
    if(!confirm(`למחוק לצמיתות את "${item.name}"? פעולה זו אינה הפיכה.`)) return;
    const {error} = await sb.from('equipment').delete().eq('id',item.id);
    if(error){ toast('לא ניתן למחוק — ייתכן שהפריט מקושר לרשומות אחרות. נסה להשבית אותו במקום.','error'); return; }
    toast('הציוד נמחק','success'); setDetail(d=>d&&d.id===item.id?null:d); load();
  };
  const toggleArchive = async () => {
    if(!detail) return;
    const next = !detail.is_archived;
    const {error} = await sb.from('equipment').update({is_archived:next}).eq('id',detail.id);
    if(error) return toast('שגיאה בעדכון — ודא שהרצת את קובץ ה-SQL שמוסיף את עמודת is_archived','error');
    try{ await sb.from('audit_log').insert({action:'UPDATE',entity_type:'equipment',entity_id:detail.id,actor_name:'מנהל'}); }catch(_){}
    toast(next?'הציוד הושבת':'הציוד הופעל מחדש','success');
    setDetail(d=>d?{...d,is_archived:next}:d); load();
  };
  const importXlsx = async e => {
    const file = e.target.files?.[0]; if(!file) return;
    try{
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf,{type:'array'});
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);
      const parsed = json.map(r=>{
        const qty = Number(r['כמות כוללת']||r['כמות']||r['quantity']||1) || 1;
        const rawAvail = r['כמות זמינה'];
        const av = (rawAvail!=null && rawAvail!=='') ? Number(rawAvail) : qty;
        return {
          name: (r['שם']||r['פריט']||r['name']||'').toString().trim(),
          category_name: (r['קטגוריה']||r['category']||'').toString().trim(),
          quantity: qty,
          available_quantity: Math.max(0, Math.min(Number.isFinite(av)?av:qty, qty)),
        };
      }).filter(r=>r.name);
      if(parsed.length===0){ toast('לא נמצאו שורות תקינות בקובץ','error'); e.target.value=''; return; }
      const catMap = {}; cats.forEach(c=>{ catMap[c.name]=c.id; });
      for(const name of new Set(parsed.map(r=>r.category_name).filter(Boolean))){
        if(!catMap[name]){
          const {data} = await sb.from('categories').insert({name}).select().single();
          if(data) catMap[name]=data.id;
        }
      }
      const newRows = parsed.map(({category_name,...r})=>({...r, category_id: catMap[category_name]||null}));
      const {error} = await sb.from('equipment').insert(newRows);
      if(error){ toast('שגיאה בייבוא: '+error.message,'error'); e.target.value=''; return; }
      toast(`יובאו ${newRows.length} פריטים בהצלחה`,'success'); load();
    }catch(err){ toast('קובץ לא תקין או לא נתמך','error'); }
    e.target.value='';
  };
  const filtered = useMemo(()=>{
    if(!rows) return [];
    const term = q.trim().toLowerCase();
    return rows.filter(r=>{
      if(!showArchived && r.is_archived) return false;
      if(cat && r.category_id!==cat) return false;
      if(avail==='available' && !((r.available_quantity??0)>0)) return false;
      if(avail==='none' && (r.available_quantity??0)>0) return false;
      if(term && !(r.name||'').toLowerCase().includes(term)) return false;
      return true;
    });
  },[rows,q,cat,avail,showArchived]);
  const exportXlsx = () => {
    const data = filtered.map(r=>({'שם':r.name,'קטגוריה':r.category?.name||'','כמות כוללת':r.quantity??'','כמות זמינה':r.available_quantity??''}));
    const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'ציוד'); XLSX.writeFile(wb,`ציוד_${todayISO()}.xlsx`);
  };
  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[180px] flex-1">
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><IconSearch size={18}/></span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="חיפוש לפי שם ציוד…" className="input pr-10"/>
        </div>
        <Select value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="">כל הקטגוריות</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Select value={avail} onChange={e=>setAvail(e.target.value)}>
          <option value="">כל הזמינות</option>
          <option value="available">יש מלאי זמין</option>
          <option value="none">אין מלאי זמין</option>
        </Select>
        {isAdmin &&
          <label className="flex items-center gap-1.5 text-xs text-slate-400">
            <input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)} className="h-3.5 w-3.5 accent-brass"/>
            הצג גם מושבת
          </label>}
        <Btn variant="outline" onClick={exportXlsx}><IconExcel size={16}/> ייצוא</Btn>
        {isAdmin && <>
          <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" onChange={importXlsx} className="hidden"/>
          <Btn variant="outline" onClick={()=>importRef.current?.click()}><IconUpload size={16}/> ייבוא</Btn>
          <Btn variant="outline" onClick={()=>setCatMgrOpen(true)}><IconBox size={16}/> קטגוריות</Btn>
          <Btn variant="brass" onClick={()=>setEditing({})}><IconPlus size={16}/> ציוד חדש</Btn>
        </>}
      </div>

      {rows===null ? <CardsSkeleton/> :
       loadError ? <Empty icon={<IconAlert size={48} className="text-rose-400"/>} title="שגיאה בטעינת הציוד מהשרת" sub={loadError}
         action={<Btn variant="outline" onClick={load}>נסה שוב</Btn>}/> :
       filtered.length===0 ? <Empty icon={<IconBox size={48}/>} title="לא נמצא ציוד" sub="נסה לשנות את החיפוש או המסננים, או הוסף פריט חדש."/> :
       <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
         {filtered.map(r=>{
           const none = (r.available_quantity??0)<=0;
           return (
           <Tilt key={r.id} max={6}>
             <div className={cx('card lift group overflow-hidden',r.is_archived&&'opacity-50')}>
               <button onClick={()=>openDetail(r)} className="block w-full p-4 text-right">
                 <div className="flex items-center justify-between gap-2">
                   <div className="truncate font-semibold text-white">{r.name}</div>
                   {r.is_archived && <span className="chip shrink-0 border-slate-400/30 bg-slate-400/12 text-slate-300">מושבת</span>}
                 </div>
                 <div className="truncate text-xs text-slate-400">{r.category?.name||'ללא קטגוריה'}</div>
                 <div className="num mt-2">
                   {none
                     ? <span className="chip border-rose-400/30 bg-rose-400/12 text-rose-300">אין מלאי זמין</span>
                     : <span className="text-sm"><b className="text-emerald-300">{r.available_quantity}</b> <span className="text-slate-500">זמין מתוך {r.quantity}</span></span>}
                 </div>
               </button>
               {isAdmin &&
                 <div className="flex border-t border-white/10">
                   <button onClick={()=>setEditing(r)} className="flex flex-1 items-center justify-center gap-1 py-2 text-xs text-slate-300 transition hover:bg-white/5"><IconEdit size={14}/> עריכה</button>
                   <button onClick={()=>del(r)} className="flex flex-1 items-center justify-center gap-1 border-r border-white/10 py-2 text-xs text-rose-300 transition hover:bg-rose-500/10"><IconTrash size={14}/> מחיקה</button>
                 </div>}
             </div>
           </Tilt>
           );
         })}
       </div>}

      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'עריכת ציוד':'הוספת ציוד'}>
        {editing && <EquipmentForm key={editing.id||'new'} item={editing.id?editing:null} categories={cats} onClose={()=>setEditing(null)}
          onSaved={(saved)=>{
            setEditing(null);
            if(saved){
              const withCat = {...saved, category: cats.find(c=>c.id===saved.category_id)||null};
              setRows(rs=>{
                if(!rs) return rs;
                const exists = rs.some(x=>x.id===withCat.id);
                return exists ? rs.map(x=>x.id===withCat.id?withCat:x) : [withCat,...rs];
              });
            }
            load();
          }}/>}
      </Modal>
      <Modal open={!!detail} onClose={()=>setDetail(null)} wide title="פרטי ציוד">
        {detail && <EquipmentDetail item={detail} history={hist} isAdmin={isAdmin} onToggleArchive={toggleArchive} onClose={()=>setDetail(null)}/>}
      </Modal>
      <Modal open={catMgrOpen} onClose={()=>setCatMgrOpen(false)} title="ניהול קטגוריות">
        {catMgrOpen && <CategoryManager categories={cats} onClose={()=>setCatMgrOpen(false)} onChanged={load}/>}
      </Modal>
    </div>
  );
}

/* =====================================================================
   BORROW  (certificate builder — prints light)
   ===================================================================== */
function buildCertificate(borrow, items, sigDataUrl){
  const rows = items.map(i=>`<tr><td style="padding:6px 10px;border:1px solid #ccc">${i.name}</td>
    <td style="padding:6px 10px;border:1px solid #ccc">${i.cameraNumber?`מצלמה מס' ${i.cameraNumber}`:(i.serial_number||i.asset_number||'—')}</td>
    <td style="padding:6px 10px;border:1px solid #ccc;text-align:center">${i.quantity}</td></tr>`).join('');
  return `
  <div dir="rtl" style="font-family:Heebo,Arial,sans-serif;color:#0b1220;max-width:760px;margin:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #7a1f3f;padding-bottom:12px">
      <div><h1 style="margin:0;font-size:22px">טופס החתמה על ציוד</h1>
        <div style="color:#555;font-size:13px">מחלקת המולטימדיה</div></div>
      <div style="text-align:left;font-size:12px;color:#555">מס' השאלה<br><b style="font-size:14px;color:#0b1220">${borrow.id.slice(0,8).toUpperCase()}</b></div>
    </div>
    <table style="width:100%;margin-top:16px;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:4px 0;color:#555;width:120px">שם מלא</td><td><b>${borrow.full_name}</b></td>
          <td style="padding:4px 0;color:#555;width:120px">מספר אישי</td><td>${borrow.personal_number||'—'}</td></tr>
      <tr><td style="padding:4px 0;color:#555">יחידה</td><td>${borrow.unit||'—'}</td>
          <td style="padding:4px 0;color:#555">טלפון</td><td dir="ltr" style="text-align:right">${borrow.phone||'—'}</td></tr>
      <tr><td style="padding:4px 0;color:#555">תאריך החתמה</td><td dir="ltr" style="text-align:right">${fmtDate(borrow.checkout_date)} ${borrow.checkout_time||''}</td>
          <td style="padding:4px 0;color:#555">תאריך החזרה</td><td dir="ltr" style="text-align:right">${fmtDate(borrow.expected_return_date)} ${borrow.expected_return_time||''}</td></tr>
      <tr><td style="padding:4px 0;color:#555">מטרה</td><td colspan="3">${borrow.purpose||'—'}</td></tr>
      <tr><td style="padding:4px 0;color:#555">סטטוס אישור</td><td colspan="3">${borrow.approved?`אושר ע"י ${borrow.approved_by||'מנהל'}`:'ממתין לאישור מנהל'}</td></tr>
    </table>
    <table style="width:100%;margin-top:14px;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#f1f5f9">
        <th style="padding:6px 10px;border:1px solid #ccc;text-align:right">פריט</th>
        <th style="padding:6px 10px;border:1px solid #ccc;text-align:right">מס' סידורי/נכס</th>
        <th style="padding:6px 10px;border:1px solid #ccc;width:60px">כמות</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:16px;padding:12px;background:#faf6ea;border:1px solid #e6d9b0;border-radius:8px;font-size:12.5px;line-height:1.7">
      <b>הצהרה:</b> אני מאשר/ת קבלת הציוד המפורט לעיל במצב תקין, מתחייב/ת לשמור עליו,
      להשתמש בו למטרה שצוינה בלבד ולהחזירו במועד ובמצב שבו נמסר. ידוע לי כי אני נושא/ת באחריות מלאה לציוד עד להחזרתו ואישורה.
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:24px">
      <div><div style="font-size:12px;color:#555;margin-bottom:4px">חתימת המשאיל/ה</div>
        ${sigDataUrl?`<img src="${sigDataUrl}" style="height:70px"/>`:''}
        <div style="border-top:1px solid #999;width:200px;padding-top:4px;font-size:12px">${borrow.full_name}</div></div>
      <div style="text-align:center;font-size:11px;color:#555">אישור דיגיטלי<br>${new Date().toLocaleString('he-IL')}</div>
    </div>
  </div>`;
}
function Borrow({onDone,employeeMode}){
  const toast = useToast();
  const {profile} = useAuth();
  const emptyForm = () => ({
    full_name: employeeMode ? (profile?.full_name||'') : '',
    personal_number: employeeMode ? (profile?.personal_number||'') : '',
    unit: employeeMode ? (profile?.unit||'') : '',
    phone: employeeMode ? (profile?.phone||'') : '',
    purpose:'', checkout_date:todayISO(),checkout_time:nowTime(),expected_return_date:'',expected_return_time:''
  });
  const [avail,setAvail] = useState(null);
  const [picked,setPicked] = useState([]);
  const [q,setQ] = useState('');
  const [f,setF] = useState(emptyForm);
  const [sig,setSig] = useState(null); const [agree,setAgree] = useState(false);
  const [busy,setBusy] = useState(false); const [done,setDone] = useState(null);
  const set = (k,v)=>setF(x=>({...x,[k]:v}));
  useEffect(()=>{ db.available().then(({data})=>setAvail(data||[])); },[]);
  const add = it => { if(picked.find(p=>p.id===it.id)) return; setPicked(p=>[...p,{...it,quantity:1,cameraNumber:''}]); };
  const NEEDS_CAMERA_NUM = n => n==='מצלמות/גו פרו' || n==='מרום X';
  const remove = id => setPicked(p=>p.filter(x=>x.id!==id));
  const results = useMemo(()=>{
    if(!avail) return [];
    const t = q.trim().toLowerCase();
    return avail.filter(a=>!picked.find(p=>p.id===a.id) &&
      (!t || (a.name||'').toLowerCase().includes(t))).slice(0,8);
  },[avail,q,picked]);
  const submit = async () => {
    if(!f.full_name.trim()) return toast('שם מלא הוא שדה חובה','error');
    if(!f.expected_return_date) return toast('נא לבחור תאריך החזרה','error');
    if(picked.length===0) return toast('נא לבחור לפחות פריט אחד','error');
    const badQty = picked.find(p=>!Number.isInteger(p.quantity) || p.quantity<=0 || p.quantity>(p.available_quantity??0));
    if(badQty) return toast(`הכמות עבור "${badQty.name}" אינה תקינה (זמין: ${badQty.available_quantity??0})`,'error');
    const missingCam = picked.find(p=>NEEDS_CAMERA_NUM(p.category?.name) && !p.cameraNumber);
    if(missingCam) return toast(`נא לבחור מספר מצלמה עבור ${missingCam.name}`,'error');
    if(!agree) return toast('נא לאשר את ההצהרה','error');
    if(!sig) return toast('נדרשת חתימה','error');
    setBusy(true);
    let sigPath = null;
    try {
      const blob = await (await fetch(sig)).blob();
      const path = `sig-${Date.now()}.png`;
      const {error:se} = await sb.storage.from('signatures').upload(path,blob,{contentType:'image/png'});
      if(!se) sigPath = path;
    } catch(_) {}
    const {data,error} = await sb.rpc('create_borrow',{
      p_full_name:f.full_name.trim(), p_personal_number:f.personal_number||null, p_unit:f.unit||null,
      p_phone:f.phone||null, p_purpose:f.purpose||null,
      p_checkout_date:f.checkout_date, p_checkout_time:f.checkout_time||null,
      p_expected_return_date:f.expected_return_date, p_expected_return_time:f.expected_return_time||null,
      p_signature_path:sigPath,
      p_items:picked.map(p=>({equipment_id:p.id,quantity:p.quantity,camera_number:p.cameraNumber||null})),
    });
    setBusy(false);
    if(error) return toast('שגיאה: '+rpcErrorText(error),'error');
    toast('ההשאלה נרשמה בהצלחה','success');
    setDone({borrow:{...f,id:data}, items:picked, sig});
  };
  const printCert = () => {
    if(!done) return;
    document.getElementById('print-area').innerHTML = buildCertificate(done.borrow,done.items,done.sig);
    window.print();
  };
  if(done){
    return (
      <div className="mx-auto max-w-lg">
        <div className="card pop p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30"><IconIn size={32}/></div>
          <h2 className="text-xl font-bold text-white">ההשאלה נרשמה</h2>
          <p className="mt-1 text-sm text-slate-400">מס' השאלה <b className="num text-slate-100">{done.borrow.id.slice(0,8).toUpperCase()}</b></p>
          <div className="my-5 flex justify-center"><QR text={done.borrow.id} size={132}/></div>
          <p className="text-sm text-slate-400">{done.items.length} פריטים · {done.borrow.full_name}</p>
          <div className="mt-6 flex flex-col gap-2">
            <Btn variant="brass" onClick={printCert}><IconLog size={16}/> הפקת טופס PDF / הדפסה</Btn>
            <Btn variant="outline" onClick={()=>{setDone(null);setPicked([]);setSig(null);setAgree(false);setF(emptyForm());db.available().then(({data})=>setAvail(data||[]));}}>השאלה נוספת</Btn>
            {!employeeMode && <Btn variant="ghost" onClick={onDone}>חזרה ללוח הבקרה</Btn>}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="card p-5">
          <h3 className="mb-4 font-bold text-white">פרטי המשאיל/ה</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="שם מלא" required><Input value={f.full_name} onChange={e=>set('full_name',e.target.value)} disabled={employeeMode} className={employeeMode?'opacity-70':''}/></Field>
            <Field label="מספר אישי"><Input dir="ltr" value={f.personal_number} onChange={e=>set('personal_number',e.target.value)} disabled={employeeMode} className={employeeMode?'opacity-70':''}/></Field>
            <Field label="יחידה"><Input value={f.unit} onChange={e=>set('unit',e.target.value)}/></Field>
            <Field label="טלפון"><Input dir="ltr" type="tel" value={f.phone} onChange={e=>set('phone',e.target.value)}/></Field>
            <Field label="תאריך החתמה" required><Input type="date" value={f.checkout_date} onChange={e=>set('checkout_date',e.target.value)}/></Field>
            <Field label="שעת החתמה"><Input type="time" value={f.checkout_time} onChange={e=>set('checkout_time',e.target.value)}/></Field>
            <Field label="תאריך החזרה" required><Input type="date" value={f.expected_return_date} onChange={e=>set('expected_return_date',e.target.value)}/></Field>
            <Field label="שעת החזרה"><Input type="time" value={f.expected_return_time} onChange={e=>set('expected_return_time',e.target.value)}/></Field>
          </div>
          <div className="mt-4"><Field label="מטרת ההחתמה"><Area value={f.purpose} onChange={e=>set('purpose',e.target.value)} placeholder="לדוגמה: צילום תרגיל יחידתי"/></Field></div>
          <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">הטופס יישלח לאישור מנהל לאחר השליחה.</p>
        </div>
        <div className="card p-5">
          <h3 className="mb-1 font-bold text-white">הצהרה וחתימה</h3>
          <p className="mb-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-100">
            אני מאשר/ת קבלת הציוד במצב תקין, מתחייב/ת לשמור עליו ולהחזירו במועד ובמצב שבו נמסר,
            ונושא/ת באחריות מלאה עד להחזרתו ואישורה.
          </p>
          <label className="mb-3 flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} className="h-4 w-4 accent-brass"/>
            קראתי ואני מאשר/ת את ההצהרה
          </label>
          <SignaturePad onChange={setSig}/>
        </div>
      </div>
      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="mb-3 font-bold text-white">בחירת ציוד</h3>
          <div className="relative mb-2">
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><IconSearch size={16}/></span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="חיפוש ציוד זמין…" className="input pr-9"/>
          </div>
          {avail===null ? <Spinner/> :
            <div className="max-h-44 space-y-1 overflow-y-auto">
              {results.length===0 ? <p className="py-3 text-center text-xs text-slate-500">אין תוצאות זמינות</p> :
                results.map(a=>(
                  <button key={a.id} onClick={()=>add(a)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-right text-sm transition hover:bg-white/5">
                    <div><div className="font-medium text-slate-100">{a.name}</div>
                      <div className="text-xs text-slate-500">זמין: {a.available_quantity} · {a.category?.name||''}</div></div>
                    <IconPlus size={16} className="text-brass"/>
                  </button>
                ))}
            </div>}
          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="mb-2 text-xs font-semibold text-slate-400">נבחרו ({picked.length})</div>
            {picked.length===0 ? <p className="text-xs text-slate-500">טרם נבחר ציוד</p> :
              <ul className="space-y-2">
                {picked.map(p=>(
                  <li key={p.id} className="rounded-xl bg-white/5 px-2.5 py-2 text-sm text-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 truncate">{p.name} <span className="num text-xs text-slate-500">(זמין: {p.available_quantity})</span></span>
                      <input type="number" min="1" max={p.available_quantity} value={p.quantity}
                        onChange={e=>setPicked(x=>x.map(i=>i.id===p.id?{...i,quantity:Math.min(i.available_quantity??1,Math.max(1,Math.floor(+e.target.value)||1))}:i))}
                        className="w-14 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-center text-sm text-white"/>
                      <button onClick={()=>remove(p.id)} className="text-slate-400 transition hover:text-rose-400"><IconX size={16}/></button>
                    </div>
                    {NEEDS_CAMERA_NUM(p.category?.name) &&
                      <Select className="mt-2" value={p.cameraNumber||''} onChange={e=>setPicked(x=>x.map(i=>i.id===p.id?{...i,cameraNumber:e.target.value}:i))}>
                        <option value="">— בחר/י מספר מצלמה —</option>
                        {Array.from({length:13},(_,i)=>i+1).map(n=><option key={n} value={n}>מצלמה מס' {n}</option>)}
                      </Select>}
                  </li>
                ))}
              </ul>}
          </div>
        </div>
        <Btn variant="brass" className="w-full py-3" onClick={submit} disabled={busy}>{busy?'רושם…':'אישור השאלה וחתימה'}</Btn>
      </div>
    </div>
  );
}

/* =====================================================================
   RETURNS  (+ loan extension)
   ===================================================================== */
function ReturnModal({borrow,onClose,onDone}){
  const toast = useToast();
  const [condition,setCondition] = useState('good');
  const [damage,setDamage] = useState(''); const [missing,setMissing] = useState('');
  const [notes,setNotes] = useState(''); const [approve,setApprove] = useState(true);
  const [photos,setPhotos] = useState([]); const [busy,setBusy] = useState(false);
  const upload = async e => {
    const files = [...(e.target.files||[])]; if(!files.length) return;
    setBusy(true); const paths=[];
    for(const file of files){
      const path = `ret-${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
      const {error} = await sb.storage.from('return-photos').upload(path,file);
      if(!error) paths.push(path);
    }
    setPhotos(p=>[...p,...paths]); setBusy(false);
    if(paths.length) toast(`${paths.length} תמונות הועלו`,'success');
  };
  const submit = async () => {
    setBusy(true);
    const {error} = await sb.rpc('process_return',{
      p_borrow_id:borrow.id, p_condition:condition, p_damage_report:damage||null,
      p_missing_accessories:missing||null, p_notes:notes||null, p_photos:photos, p_approve:approve,
    });
    setBusy(false);
    if(error) return toast('שגיאה: '+rpcErrorText(error),'error');
    toast('ההחזרה אושרה · הציוד עודכן','success'); onDone();
  };
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 p-3 text-sm">
        <div className="font-semibold text-white">{borrow.full_name}</div>
        <div className="text-xs text-slate-400">{borrow.borrow_items?.map(itemLabel).filter(Boolean).join(' · ')}</div>
      </div>
      <Field label="מצב הציוד">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(COND_HE).map(([k,v])=>(
            <button key={k} onClick={()=>setCondition(k)} className={cx('rounded-xl border px-3 py-2.5 text-sm font-medium transition',
              condition===k?(k==='good'?'border-emerald-400/50 bg-emerald-400/15 text-emerald-200':k==='minor_damage'?'border-amber-400/50 bg-amber-400/15 text-amber-200':'border-rose-400/50 bg-rose-400/15 text-rose-200'):'border-white/10 text-slate-400 hover:bg-white/5')}>{v}</button>
          ))}
        </div>
      </Field>
      {condition!=='good' && <Field label="דיווח נזק"><Area value={damage} onChange={e=>setDamage(e.target.value)} placeholder="תיאור הנזק…"/></Field>}
      <Field label="אביזרים חסרים"><Input value={missing} onChange={e=>setMissing(e.target.value)} placeholder="לדוגמה: סוללה, כבל HDMI"/></Field>
      <Field label="הערות"><Area value={notes} onChange={e=>setNotes(e.target.value)}/></Field>
      <Field label="תמונות (אופציונלי)"><input type="file" accept="image/*" multiple onChange={upload} className="w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-slate-200"/></Field>
      {photos.length>0 && <div className="text-xs text-emerald-300">{photos.length} תמונות מצורפות</div>}
      {condition==='major_damage' && <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-2.5 text-xs text-rose-200">שים לב: פריט עם נזק חמור יסומן אוטומטית כ״תקול״ ולא יחזור למלאי הזמין.</p>}
      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input type="checkbox" checked={approve} onChange={e=>setApprove(e.target.checked)} className="h-4 w-4 accent-brass"/> אישור אחראי
      </label>
      <div className="flex justify-end gap-2 pt-1">
        <Btn variant="ghost" onClick={onClose}>ביטול</Btn>
        <Btn variant="brass" onClick={submit} disabled={busy}>{busy?'מעבד…':'אישור החזרה'}</Btn>
      </div>
    </div>
  );
}
function ExtendModal({borrow,onClose,onDone}){
  const toast = useToast(); const {profile} = useAuth();
  const [date,setDate] = useState(borrow.expected_return_date);
  const [time,setTime] = useState(borrow.expected_return_time||'17:00');
  const [busy,setBusy] = useState(false);
  const submit = async () => {
    if(!date) return toast('נא לבחור תאריך','error');
    setBusy(true);
    const status = date < todayISO() ? 'overdue' : 'active';
    const {error} = await sb.from('borrows').update({expected_return_date:date, expected_return_time:time, status}).eq('id',borrow.id);
    if(!error) await sb.from('audit_log').insert({action:'EXTEND',entity_type:'borrows',entity_id:borrow.id,actor_name:profile?.full_name||'משתמש'});
    setBusy(false);
    if(error) return toast('שגיאה בהארכה','error');
    toast('ההשאלה הוארכה בהצלחה','success'); onDone();
  };
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 p-3 text-sm">
        <div className="font-semibold text-white">{borrow.full_name}</div>
        <div className="num text-xs text-slate-400">תאריך החזרה נוכחי: {fmtDate(borrow.expected_return_date)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="תאריך החזרה חדש" required><Input type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field>
        <Field label="שעה"><Input type="time" value={time} onChange={e=>setTime(e.target.value)}/></Field>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Btn variant="ghost" onClick={onClose}>ביטול</Btn>
        <Btn variant="brass" onClick={submit} disabled={busy}>{busy?'מעדכן…':'אישור הארכה'}</Btn>
      </div>
    </div>
  );
}
function Returns(){
  const [rows,setRows] = useState(null); const [active,setActive] = useState(null); const [extending,setExtending] = useState(null);
  const [detail,setDetail] = useState(null);
  const load = useCallback(async ()=>{
    setRows(null);
    const {data} = await sb.from('borrows')
      .select('*, borrow_items(quantity, camera_number, equipment:equipment_id(name,serial_number))')
      .in('status',['active','overdue']).order('expected_return_date');
    setRows(data||[]);
  },[]);
  useEffect(()=>{load();},[load]);
  if(rows===null) return <ListSkeleton/>;
  return (
    <div className="space-y-4">
      {rows.length===0 ? <Empty icon={<IconIn size={48}/>} title="אין השאלות פעילות" sub="כל הציוד חזר. עבודה יפה."/> :
        <div className="stagger space-y-3">
          {rows.map(b=>{
            const late = isBorrowOverdue(b);
            return (
              <div key={b.id} className="card lift flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 cursor-pointer" onClick={()=>setDetail(b)}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{b.full_name}</span>
                    <Badge map={BORROW_STATUS} value={late?'overdue':b.status}/>
                  </div>
                  <div className="mt-0.5 truncate text-sm text-slate-400">
                    {b.borrow_items?.map(itemLabel).filter(Boolean).join(' · ')||'—'}
                  </div>
                  <div className={cx('num mt-0.5 text-xs',late?'font-medium text-rose-300':'text-slate-500')}>
                    להחזרה: {fmtDate(b.expected_return_date)} {b.expected_return_time?.slice(0,5)||''}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Btn variant="outline" onClick={()=>setExtending(b)}><IconClock size={16}/> הארכה</Btn>
                  <Btn variant="brass" onClick={()=>setActive(b)}><IconIn size={16}/> קליטת החזרה</Btn>
                </div>
              </div>
            );
          })}
        </div>}
      <Modal open={!!detail} onClose={()=>setDetail(null)} wide title="פרטי השאלה">
        {detail && <BorrowDetail borrow={detail} onClose={()=>setDetail(null)} onReturned={()=>{setDetail(null);load();}}/>}
      </Modal>
      <Modal open={!!active} onClose={()=>setActive(null)} title="קליטת החזרת ציוד">
        {active && <ReturnModal borrow={active} onClose={()=>setActive(null)} onDone={()=>{setActive(null);load();}}/>}
      </Modal>
      <Modal open={!!extending} onClose={()=>setExtending(null)} title="הארכת השאלה">
        {extending && <ExtendModal borrow={extending} onClose={()=>setExtending(null)} onDone={()=>{setExtending(null);load();}}/>}
      </Modal>
    </div>
  );
}

/* =====================================================================
   EMPLOYEES DIRECTORY
   ===================================================================== */
function Employees(){
  const [rows,setRows] = useState(null);
  const [q,setQ] = useState('');
  const [sel,setSel] = useState(null); const [selHistory,setSelHistory] = useState(null);
  const [detail,setDetail] = useState(null);
  const loadRows = useCallback(async () => {
    const {data} = await sb.from('borrows').select('full_name,personal_number,unit,phone,status,checkout_date').order('checkout_date',{ascending:false}).limit(500);
    const map = {};
    (data||[]).forEach(b=>{
      const key = b.personal_number || b.full_name;
      if(!map[key]) map[key] = {full_name:b.full_name, personal_number:b.personal_number, unit:b.unit, phone:b.phone, total:0, active:0, last:b.checkout_date};
      map[key].total++;
      if(b.status==='active'||b.status==='overdue') map[key].active++;
      if((b.checkout_date||'') > (map[key].last||'')) map[key].last = b.checkout_date;
    });
    setRows(Object.values(map).sort((a,b)=>(b.last||'').localeCompare(a.last||'')));
  },[]);
  useEffect(()=>{ loadRows(); },[loadRows]);
  const openHistory = async emp => {
    setSel(emp); setSelHistory(null);
    const {data} = await sb.from('borrows').select('*, borrow_items(quantity, camera_number, equipment:equipment_id(name))').eq('personal_number',emp.personal_number).order('checkout_date',{ascending:false});
    setSelHistory(data||[]);
  };
  const filtered = useMemo(()=>{
    if(!rows) return [];
    const t = q.trim().toLowerCase();
    return rows.filter(r=>!t || [r.full_name,r.personal_number,r.unit].join(' ').toLowerCase().includes(t));
  },[rows,q]);
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="relative">
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><IconSearch size={18}/></span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="חיפוש עובד, מספר אישי, יחידה…" className="input pr-10"/>
        </div>
      </div>
      {rows===null ? <ListSkeleton/> :
       filtered.length===0 ? <Empty icon={<IconUsers size={48}/>} title="לא נמצאו עובדים" sub="עדיין לא נרשמו השאלות במערכת."/> :
       <div className="card overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-sm">
             <thead className="bg-white/5 text-slate-400"><tr className="text-right">
               <th className="px-4 py-3 font-medium">שם</th><th className="px-4 py-3 font-medium">יחידה</th>
               <th className="px-4 py-3 font-medium">השאלות פעילות</th><th className="px-4 py-3 font-medium">סה״כ השאלות</th>
               <th className="px-4 py-3 font-medium">פעילות אחרונה</th></tr></thead>
             <tbody className="divide-y divide-white/5">
               {filtered.map((r,i)=>(
                 <tr key={i} onClick={()=>openHistory(r)} className="cursor-pointer transition hover:bg-white/5">
                   <td className="px-4 py-2.5 font-medium text-slate-100">{r.full_name}</td>
                   <td className="px-4 py-2.5 text-slate-400">{r.unit||'—'}</td>
                   <td className="num px-4 py-2.5">{r.active>0 ? <span className="font-medium text-amber-300">{r.active}</span> : <span className="text-slate-500">—</span>}</td>
                   <td className="num px-4 py-2.5 text-slate-300">{r.total}</td>
                   <td className="num px-4 py-2.5 text-slate-500">{fmtDate(r.last)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>}
      <Modal open={!!sel} onClose={()=>setSel(null)} wide title={sel?`היסטוריית השאלות · ${sel.full_name}`:''}>
        {selHistory===null ? <Spinner/> : selHistory.length===0
          ? <p className="py-6 text-center text-sm text-slate-500">אין השאלות רשומות</p>
          : <ul className="space-y-2">
              {selHistory.map(b=>(
                <li key={b.id} onClick={()=>setDetail(b)} className="cursor-pointer rounded-xl bg-white/5 p-3 text-sm transition hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200">{b.borrow_items?.map(itemLabel).filter(Boolean).join(' · ')||'—'}</span>
                    <Badge map={BORROW_STATUS} value={isBorrowOverdue(b)?'overdue':b.status}/>
                  </div>
                  <div className="num mt-1 text-xs text-slate-500">{fmtDate(b.checkout_date)} ← {fmtDate(b.expected_return_date)}</div>
                </li>
              ))}
            </ul>}
      </Modal>
      <Modal open={!!detail} onClose={()=>setDetail(null)} wide title="פרטי השאלה">
        {detail && <BorrowDetail borrow={detail} onClose={()=>setDetail(null)} onReturned={()=>{setDetail(null); loadRows(); if(sel) openHistory(sel);}}/>}
      </Modal>
    </div>
  );
}

/* =====================================================================
   AUDIT LOG
   ===================================================================== */
function AuditLog(){
  const [rows,setRows] = useState(null);
  useEffect(()=>{ sb.from('audit_log').select('*').order('created_at',{ascending:false}).limit(200).then(({data})=>setRows(data||[])); },[]);
  if(rows===null) return <TableSkeleton/>;
  const A = a=>({INSERT:'הוספה',UPDATE:'עדכון',DELETE:'מחיקה',BORROW:'השאלה',RETURN:'החזרה',EXTEND:'הארכה',APPROVE:'אישור'}[a]||a);
  const E = e=>({equipment:'ציוד',borrows:'השאלה',maintenance:'טיפול'}[e]||e);
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr className="text-right">
              <th className="px-4 py-3 font-medium">פעולה</th><th className="px-4 py-3 font-medium">ישות</th>
              <th className="px-4 py-3 font-medium">משתמש</th><th className="px-4 py-3 font-medium">מועד</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map(r=>(
              <tr key={r.id} className="transition hover:bg-white/5">
                <td className="px-4 py-2.5 font-medium text-slate-100">{A(r.action)}</td>
                <td className="px-4 py-2.5 text-slate-400">{E(r.entity_type)}</td>
                <td className="px-4 py-2.5 text-slate-400">{r.actor_name||'—'}</td>
                <td className="num px-4 py-2.5 text-slate-500">{fmtDT(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =====================================================================
   USERS (admin)
   ===================================================================== */
function Users(){
  const toast = useToast(); const {profile} = useAuth();
  const [rows,setRows] = useState(null);
  const load = ()=> sb.from('profiles').select('*').order('created_at').then(({data})=>setRows(data||[]));
  useEffect(()=>{load();},[]);
  const changeRole = async (u,role)=>{
    if(u.is_primary_admin) return toast('לא ניתן לשנות את התפקיד של מנהל ראשי','error');
    const {error} = await sb.from('profiles').update({role}).eq('id',u.id);
    if(error) return toast('עדכון נכשל','error');
    toast('ההרשאה עודכנה','success'); load();
  };
  if(rows===null) return <TableSkeleton/>;
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-slate-400"><tr className="text-right">
            <th className="px-4 py-3 font-medium">שם</th><th className="px-4 py-3 font-medium">יחידה</th>
            <th className="px-4 py-3 font-medium">תפקיד</th><th className="px-4 py-3 font-medium">נוצר</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows.map(u=>(
              <tr key={u.id} className="transition hover:bg-white/5">
                <td className="px-4 py-2.5 font-medium text-slate-100">
                  {u.full_name||'—'}
                  {u.id===profile.id&&<span className="mr-1 text-xs text-brass">(אני)</span>}
                  {u.is_primary_admin&&<span className="chip mr-1.5 border-brass/40 bg-brass/15 text-brass">מנהל ראשי</span>}
                </td>
                <td className="px-4 py-2.5 text-slate-400">{u.unit||'—'}</td>
                <td className="px-4 py-2.5">
                  <select value={u.role} disabled={u.id===profile.id || u.is_primary_admin} onChange={e=>changeRole(u,e.target.value)}
                    className="input px-2 py-1 text-sm disabled:opacity-60">
                    {Object.entries(ROLE_HE).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td className="num px-4 py-2.5 text-slate-500">{fmtDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =====================================================================
   NOTIFICATION BELL (overdue alerts)
   ===================================================================== */
function NotifBell({go}){
  const [open,setOpen] = useState(false);
  const [rows,setRows] = useState([]);
  const [selBorrow,setSelBorrow] = useState(null);
  const load = useCallback(async ()=>{
    const {data} = await sb.from('borrows').select('id,full_name,expected_return_date,expected_return_time,status,approved')
      .eq('approved',true).neq('status','returned').neq('status','cancelled');
    setRows((data||[]).filter(isBorrowOverdue).sort((a,b)=>(a.expected_return_date||'').localeCompare(b.expected_return_date||'')).slice(0,10));
  },[]);
  useEffect(()=>{ load(); const t=setInterval(load,60000); return ()=>clearInterval(t); },[load]);
  const openBorrow = async id => { setOpen(false); const data = await fetchBorrowFull(id); if(data) setSelBorrow(data); };
  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="relative rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
        <IconBell size={19}/>
        {rows.length>0 && <span className="num absolute -left-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{rows.length}</span>}
      </button>
      {open && (
        <div className="pop glass-modal absolute left-0 top-full z-40 mt-2 w-72 p-2" onMouseLeave={()=>setOpen(false)}>
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">השאלות באיחור</div>
          {rows.length===0 ? <p className="px-2 py-3 text-sm text-slate-500">אין התראות כרגע</p> :
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {rows.map(r=>(
                <li key={r.id} onClick={()=>openBorrow(r.id)} className="cursor-pointer rounded-xl px-2.5 py-2 text-sm text-slate-200 transition hover:bg-white/5">
                  <div className="font-medium">{r.full_name}</div>
                  <div className="num text-xs text-rose-300">איחור מ-{fmtDate(r.expected_return_date)} {r.expected_return_time?.slice(0,5)||''}</div>
                </li>
              ))}
            </ul>}
        </div>
      )}
      <Modal open={!!selBorrow} onClose={()=>setSelBorrow(null)} wide title="פרטי השאלה">
        {selBorrow && <BorrowDetail borrow={selBorrow} onClose={()=>setSelBorrow(null)} onReturned={()=>{setSelBorrow(null);load();}}/>}
      </Modal>
    </div>
  );
}

/* =====================================================================
   SHELL
   ===================================================================== */
function Shell(){
  const {profile,role,isStaff,isAdmin,signOut} = useAuth();
  const [view,setView] = useState('dashboard');
  const [eqFilter,setEqFilter] = useState('');
  const [navOpen,setNavOpen] = useState(false);
  const go = (v,filter='') => { if(v==='equipment') setEqFilter(filter); setView(v); setNavOpen(false); };
  const nav = [
    {k:'dashboard',label:'לוח בקרה',icon:<IconDash/>,show:true},
    {k:'equipment',label:'ציוד',icon:<IconBox/>,show:true},
    {k:'borrow',label:'השאלה',icon:<IconOut/>,show:isStaff},
    {k:'returns',label:'החזרות',icon:<IconIn/>,show:isStaff},
    {k:'employees',label:'עובדים',icon:<IconUsers/>,show:isStaff},
    {k:'audit',label:'יומן פעולות',icon:<IconLog/>,show:isStaff},
    {k:'users',label:'ניהול משתמשים',icon:<IconUsers/>,show:isAdmin},
  ].filter(n=>n.show);
  const titles = {dashboard:'לוח בקרה',equipment:'ניהול ציוד',borrow:'השאלת ציוד',returns:'קליטת החזרות',employees:'עובדי היחידה',audit:'יומן פעולות',users:'ניהול משתמשים'};
  const NavLinks = () => (
    <nav className="space-y-1.5">
      {nav.map(n=>(
        <button key={n.k} onClick={()=>go(n.k)}
          className={cx('flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition',
            view===n.k
              ? 'bg-gradient-to-l from-[#c94a70] to-[#7a1f3f] text-white shadow-[0_10px_26px_-10px_rgba(168,51,88,.6)]'
              : 'text-slate-300 hover:bg-white/8 hover:text-white')}>
          {n.icon}{n.label}
        </button>
      ))}
    </nav>
  );
  const UserCard = () => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="truncate text-sm font-semibold text-white">{profile?.full_name||'משתמש'}</div>
      <div className="text-xs text-brass">{ROLE_HE[role]}</div>
      <button onClick={signOut} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white/8 py-2 text-xs text-slate-300 transition hover:bg-white/14 hover:text-white">
        <IconLogout size={15}/> התנתקות
      </button>
    </div>
  );
  return (
    <div id="app-root" className="relative flex min-h-full">
      {/* desktop rail */}
      <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 p-3 lg:block">
        <div className="card flex h-full flex-col rounded-[26px] p-4">
          <div className="mb-6 flex items-center gap-3 px-1">
            <div className="flex h-11 w-11 items-center justify-center"><img src={LOGO_DATA_URI} alt="לוגו" className="h-full w-full object-contain" style={{filter:'invert(1)'}}/></div>
            <div><div className="font-bold leading-tight text-white">החתמות מולטימדיה</div>
              <div className="text-[11px] text-slate-400">מחלקת המולטימדיה</div></div>
          </div>
          <NavLinks/>
          <div className="mt-auto"><UserCard/></div>
        </div>
      </aside>

      {/* mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={()=>setNavOpen(false)}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-md"></div>
          <aside className="pop absolute right-0 top-0 h-full w-[272px] p-3" onClick={e=>e.stopPropagation()}>
            <div className="glass-modal flex h-full flex-col rounded-[24px] p-4">
              <div className="mb-6 flex items-center justify-between">
                <div className="font-bold text-white">החתמות מולטימדיה</div>
                <button onClick={()=>setNavOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"><IconX/></button>
              </div>
              <NavLinks/>
              <div className="mt-auto"><UserCard/></div>
            </div>
          </aside>
        </div>
      )}

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 p-3">
          <div className="card flex items-center justify-between rounded-[22px] px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={()=>setNavOpen(true)} className="rounded-xl p-1.5 text-slate-300 transition hover:bg-white/10 lg:hidden"><IconMenu/></button>
              <h1 className="text-lg font-bold tracking-tight text-white lg:text-xl">{titles[view]}</h1>
              {DEMO && <span className="chip whitespace-nowrap border-amber-400/30 bg-amber-400/12 text-amber-200"><span className="hidden sm:inline">מצב הדגמה · הנתונים לא נשמרים</span><span className="sm:hidden">הדגמה</span></span>}
            </div>
            <div className="flex items-center gap-2">
              {isStaff && <NotifBell go={go}/>}
              {isStaff && view!=='borrow' &&
                <Btn variant="brass" onClick={()=>go('borrow')} className="hidden sm:inline-flex"><IconOut size={16}/> השאלה חדשה</Btn>}
            </div>
          </div>
        </header>
        <main className="flex-1 px-3 pb-8 lg:px-4">
          <div key={view} className="rise mx-auto max-w-7xl">
            {view==='dashboard'  && <Dashboard go={go}/>}
            {view==='equipment'  && <Equipment initialFilter={eqFilter}/>}
            {view==='borrow'     && <Borrow onDone={()=>go('dashboard')}/>}
            {view==='returns'    && <Returns/>}
            {view==='employees'  && <Employees/>}
            {view==='audit'      && <AuditLog/>}
            {view==='users'      && <Users/>}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =====================================================================
   ROOT
   ===================================================================== */
function ConfigMissing(){
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="card rise max-w-md p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30"><IconBox/></div>
        <h1 className="text-lg font-bold text-white">חיבור ל-Supabase נדרש</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          יש להזין את כתובת הפרויקט ומפתח ה-anon בקובץ, בשורות
          <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-xs" dir="ltr">SUPABASE_URL</code>
          ו-<code className="rounded bg-white/10 px-1.5 py-0.5 text-xs" dir="ltr">SUPABASE_ANON_KEY</code>.
          את הערכים מוצאים בלוח הבקרה של Supabase תחת Settings → API.
        </p>
      </div>
    </div>
  );
}
const LoadingScreen = () => <div className="flex min-h-full items-center justify-center"><Spinner label="טוען…"/></div>;

/* Regular employees land straight on the loan form — no dashboard, no sidebar.
   They can also switch to a read-only equipment/availability view. */
function EmployeeShell(){
  const {profile,signOut} = useAuth();
  const [tab,setTab] = useState('borrow');
  return (
    <div id="app-root" className="relative flex min-h-full flex-col">
      <header className="sticky top-0 z-30 p-3">
        <div className="card flex flex-col gap-3 rounded-[22px] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center"><img src={LOGO_DATA_URI} alt="לוגו" className="h-full w-full object-contain" style={{filter:'invert(1)'}}/></div>
            <div>
              <div className="text-sm font-bold leading-tight text-white">{profile?.full_name}</div>
              <div className="text-[11px] text-slate-400">{profile?.unit||''}{profile?.personal_number?` · ${profile.personal_number}`:''}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-white/5 p-1">
              <button onClick={()=>setTab('borrow')} className={cx('rounded-lg px-3 py-1.5 text-xs font-medium transition',tab==='borrow'?'bg-white/10 text-white':'text-slate-400')}>טופס החתמה</button>
              <button onClick={()=>setTab('equipment')} className={cx('rounded-lg px-3 py-1.5 text-xs font-medium transition',tab==='equipment'?'bg-white/10 text-white':'text-slate-400')}>ציוד וזמינות</button>
            </div>
            <button onClick={signOut} className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/14 hover:text-white">
              <IconLogout size={15}/> <span className="hidden sm:inline">התנתקות</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 px-3 pb-8 lg:px-4">
        <div className="rise mx-auto max-w-5xl">
          {tab==='borrow'
            ? <><h1 className="mb-4 text-xl font-bold text-white">טופס החתמה על ציוד</h1><Borrow employeeMode onDone={()=>{}}/></>
            : <><h1 className="mb-4 text-xl font-bold text-white">ציוד וזמינות</h1><Equipment/></>}
        </div>
      </main>
    </div>
  );
}

function App(){
  useAmbientParallax();
  useEffect(()=>{ const r=document.getElementById('root'); if(r) r.setAttribute('data-mounted','1'); },[]);
  const {profile} = useAuth();
  let content;
  if(!sb) content = <ConfigMissing/>;
  else if(profile===undefined) content = <LoadingScreen/>;
  else if(profile===null) content = <PersonalNumberGate/>;
  else if(profile.role==='admin') content = <Shell/>;
  else content = <EmployeeShell/>;
  return <><Ambient/>{content}</>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ToastHost><AuthProvider><App/></AuthProvider></ToastHost>
);
