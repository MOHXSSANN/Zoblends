/* ============================================================
   ZOBLENDS WORKBOOK — shared library
   colors, style helpers, and deterministic demo-data generator
   ============================================================ */

const FONT = 'Calibri';

/* ARGB colors (ExcelJS wants AARRGGBB, no #) */
const C = {
  gold:      'FFD4AF37',
  goldDeep:  'FFB8941F',
  goldText:  'FFD4AF37',
  charcoal:  'FF1A1A1A',
  charcoal2: 'FF262626',
  darkGrey:  'FF333333',
  grey:      'FF6E6E6E',
  muted:     'FF888888',
  green:     'FF6BD6A3',
  greenDeep: 'FF2E8B57',
  red:       'FFE05555',
  redDeep:   'FFB23A3A',
  altLight:  'FFF9F8F5',
  white:     'FFFFFFFF',
  cream:     'FFFCFBF8',
  borderBody:'FFE0DDDA',
  input:     'FFFFFBEB',
  greenTint: 'FFEAF7F0',
  redTint:   'FFFBECEC',
  goldTint:  'FFF7EFD6',
  greyTint:  'FFF1F0ED',
  ink:       'FF1A1A1A',
};

/* sheet names (used for nav hyperlinks too) */
const SHEETS = {
  cover:    'Cover',
  bookings: 'Bookings Log',
  finance:  'Finance Tracker',
  analytics:'Analytics',
  clients:  'Client Directory',
  waitlist: 'Waitlist',
};
const NAV = [
  ['cover',    'COVER',     SHEETS.cover],
  ['bookings', 'BOOKINGS',  SHEETS.bookings],
  ['finance',  'FINANCE',   SHEETS.finance],
  ['analytics','ANALYTICS', SHEETS.analytics],
  ['clients',  'CLIENTS',   SHEETS.clients],
  ['waitlist', 'WAITLIST',  SHEETS.waitlist],
];

const FMT = {
  money: '$#,##0.00',
  money0:'$#,##0',
  date:  'mmm dd, yyyy',
  time:  'h:mm AM/PM',
  pct:   '0%',
  pct1:  '0.0%',
};

/* ---------- low-level helpers ---------- */
function colLetter(n){ let s=''; while(n>0){ const m=(n-1)%26; s=String.fromCharCode(65+m)+s; n=(n-m-1)/26; } return s; }
const bThin   = { style:'thin',   color:{argb:C.borderBody} };
const bThinW  = { style:'thin',   color:{argb:'FFFFFFFF'} };
const bGold   = { style:'medium', color:{argb:C.gold} };
const bGoldThin = { style:'thin', color:{argb:C.gold} };
const bDark   = { style:'thin',   color:{argb:C.charcoal} };
function box(b){ return { top:b, left:b, bottom:b, right:b }; }

/* S(ws, ref, value, style) — central cell setter */
function S(ws, ref, value, st){
  st = st || {};
  const c = ws.getCell(ref);
  if (value !== undefined && value !== null) c.value = value;
  if (st.numFmt) c.numFmt = st.numFmt;
  const f = Object.assign({ name:FONT, size:10, color:{argb:C.ink} }, st.font||{});
  c.font = f;
  if (st.fill) c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:st.fill } };
  c.alignment = Object.assign({ vertical:'middle' }, st.align||{});
  if (st.border) c.border = st.border;
  if (st.unlock) c.protection = { locked:false };
  return c;
}

/* merge + style a region with a single style */
function merge(ws, range, value, st){
  ws.mergeCells(range);
  const first = range.split(':')[0];
  return S(ws, first, value, st);
}

/* ---------- top brand band + nav (used on every sheet) ---------- */
function topBand(ws, lastColIdx, activeKey, title){
  const last = colLetter(lastColIdx);
  // Row 1 — brand band
  ws.getRow(1).height = 34;
  merge(ws, `A1:${last}1`, null, { fill:C.charcoal });
  S(ws, 'A1', 'ZOBLENDS', { font:{ size:18, bold:true, color:{argb:C.gold} }, fill:C.charcoal, align:{ indent:1 } });
  // Row 2 — nav buttons (each button = 2 merged columns)
  ws.getRow(2).height = 22;
  for(let c=1;c<=lastColIdx+1;c++){ ws.getCell(`${colLetter(c)}2`).fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.charcoal2} }; }
  let col = 1;
  NAV.forEach(([key,label,sheet])=>{
    const a = colLetter(col), b = colLetter(col+1);
    const active = key===activeKey;
    const cell = merge(ws, `${a}2:${b}2`, { text:label, hyperlink:`#'${sheet}'!A1` }, {
      fill: active ? C.gold : C.charcoal2,
      font:{ size:9, bold:true, color:{argb: active ? C.charcoal : C.gold } },
      align:{ horizontal:'center', vertical:'middle' },
      border: box(bDark),
    });
    col += 2;
  });
  // Row 3 — title strip
  ws.getRow(3).height = 30;
  merge(ws, `A3:${last}3`, title, {
    fill:C.cream, font:{ size:15, bold:true, color:{argb:C.charcoal} },
    align:{ horizontal:'left', vertical:'middle', indent:1 },
    border:{ bottom:bGold },
  });
}

/* KPI card spanning a range, 2 rows: label row + value row already merged by caller */
function kpiCard(ws, range, label, value, valStyle){
  ws.mergeCells(range);
  const [tl, br] = range.split(':');
  const top = tl;
  // we style the whole merged block; label & value separated by line breaks
  const c = S(ws, top, null, {
    fill:C.charcoal, border: box(bGoldThin),
    align:{ horizontal:'left', vertical:'top', indent:1, wrapText:true },
  });
  // Use rich text: label small muted, value large gold/colored
  c.value = {
    richText:[
      { text: label.toUpperCase()+'\n', font:{ name:FONT, size:8, bold:true, color:{argb:C.muted} } },
      { text: value, font:Object.assign({ name:FONT, size:16, bold:true, color:{argb:C.gold} }, valStyle||{}) },
    ]
  };
  return c;
}

/* header row styler */
function headerRow(ws, rowNum, headers, firstCol){
  firstCol = firstCol || 1;
  const r = ws.getRow(rowNum);
  r.height = 26;
  headers.forEach((h,i)=>{
    const ref = `${colLetter(firstCol+i)}${rowNum}`;
    S(ws, ref, h.toUpperCase(), {
      fill:C.charcoal,
      font:{ size:10, bold:true, color:{argb:C.gold} },
      align:{ horizontal:h.length>14?'left':'center', vertical:'middle', wrapText:true, indent:1 },
      border:{ bottom:bGold, top:bDark, left:bThinW, right:bThinW },
    });
  });
}

/* =====================================================================
   DETERMINISTIC DEMO DATA
   ===================================================================== */
function mulberry32(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

function buildData(){
  const rnd = mulberry32(20260604);
  const ri = (a,b)=> a + Math.floor(rnd()*(b-a+1));
  const pick = (arr)=> arr[Math.floor(rnd()*arr.length)];
  const wpick = (arr)=>{ // arr of [item,weight]
    const tot = arr.reduce((s,x)=>s+x[1],0); let r=rnd()*tot;
    for(const [it,w] of arr){ if((r-=w)<=0) return it; } return arr[0][0];
  };

  const SERVICES = [
    { name:'Skin Fade',         price:45, dur:45, w:24 },
    { name:'Classic Cut',       price:35, dur:30, w:18 },
    { name:'Cut & Beard Combo', price:55, dur:60, w:16 },
    { name:'Beard Trim',        price:20, dur:20, w:12 },
    { name:'Hot Towel Shave',   price:40, dur:40, w:6 },
    { name:'Buzz Cut',          price:25, dur:20, w:7 },
    { name:'Line Up',           price:15, dur:15, w:5 },
    { name:'Kids Cut',          price:25, dur:25, w:6 },
    { name:'Long Hair Restyle', price:50, dur:50, w:4 },
    { name:'Grey Blending',     price:35, dur:35, w:5 },
  ];
  const svcByName = Object.fromEntries(SERVICES.map(s=>[s.name,s]));
  const svcWeighted = SERVICES.map(s=>[s.name, s.w]);

  // client roster — weight ~ how often they come in
  const roster = [
    ['Marcus Bennett',8,'Skin Fade'], ['Andre Coleman',7,'Cut & Beard Combo'],
    ['Devon Wright',6,'Skin Fade'],   ['Jamal Carter',6,'Classic Cut'],
    ['Liam O\u2019Connor',5,'Hot Towel Shave'], ['Noah Patel',5,'Classic Cut'],
    ['Ethan Reyes',4,'Skin Fade'],    ['Tyler Brooks',4,'Beard Trim'],
    ['Sean Murphy',4,'Cut & Beard Combo'], ['Omar Haddad',3,'Grey Blending'],
    ['Caleb Foster',3,'Buzz Cut'],    ['Mason Lee',3,'Classic Cut'],
    ['Isaiah Grant',3,'Skin Fade'],   ['Dylan Ross',2,'Line Up'],
    ['Nathan Cole',2,'Long Hair Restyle'], ['Gabriel Santos',2,'Cut & Beard Combo'],
    ['Ryan Mitchell',2,'Classic Cut'], ['Cole Hudson',2,'Skin Fade'],
    ['Aiden Walsh',2,'Kids Cut'],     ['Victor Nguyen',2,'Beard Trim'],
    ['Theo Marsh',1,'Hot Towel Shave'], ['Jordan Pace',1,'Buzz Cut'],
    ['Elias Romano',1,'Grey Blending'], ['Hugo Almeida',1,'Skin Fade'],
  ];
  const areaCodes=['416','647','905','437'];
  const clients = roster.map(([name,w,pref],i)=>{
    const parts = name.toLowerCase().replace(/[^a-z ]/g,'').split(' ');
    const email = `${parts[0]}.${parts[1]}@${pick(['gmail.com','outlook.com','icloud.com','yahoo.ca'])}`;
    const phone = `(${pick(areaCodes)}) 555-${String(100+i*7%900).padStart(4,'0')}`;
    return { name, email, phone, w, pref };
  });
  const clientWeighted = clients.map(c=>[c, c.w]);

  // generate bookings
  const monthWeight = [['0',2],['1',2.5],['2',3],['3',4],['4',5]]; // Jan..May 2026 weights for PAST
  function randPastDate(){
    const m = parseInt(wpick(monthWeight),10);
    let day = ri(2, 27);
    return new Date(2026, m, day);
  }
  const bookings = [];
  const N_PAST = 46, N_FUTURE = 7;
  for(let i=0;i<N_PAST;i++){
    const client = wpick(clientWeighted);
    // service: 55% their preferred, else weighted
    const svcName = rnd()<0.55 ? client.pref : wpick(svcWeighted);
    const svc = svcByName[svcName];
    const d = randPastDate();
    const hour = wpick([['10',2],['11',3],['12',3],['13',4],['14',5],['15',5],['16',5],['17',6],['18',5],['19',3]].map(x=>[parseInt(x[0],10),x[1]]));
    const minute = pick([0,15,30,45]);
    const lateNight = (hour>=19 && rnd()<0.7) ? 'Y' : 'N';
    const lastMin = rnd()<0.16 ? 'Y' : 'N';
    const payment = rnd()<0.45 ? 'Cash' : 'E-Transfer';
    const roll = rnd();
    let status = 'Completed';
    if (roll>0.88 && roll<=0.95) status='Cancelled';
    else if (roll>0.95) status='No Show';
    bookings.push({ client, svc, d, hour, minute, lateNight, lastMin, payment, status, notes:'' });
  }
  // future confirmed
  for(let i=0;i<N_FUTURE;i++){
    const client = wpick(clientWeighted);
    const svcName = rnd()<0.6 ? client.pref : wpick(svcWeighted);
    const svc = svcByName[svcName];
    const day = ri(5, 19);
    const d = new Date(2026, 5, day);
    const hour = wpick([['11',2],['13',3],['15',4],['16',4],['17',5],['18',4]].map(x=>[parseInt(x[0],10),x[1]]));
    const minute = pick([0,15,30,45]);
    const lateNight = (hour>=19 && rnd()<0.6) ? 'Y' : 'N';
    const lastMin = rnd()<0.12 ? 'Y' : 'N';
    const payment = rnd()<0.45 ? 'Cash' : 'E-Transfer';
    bookings.push({ client, svc, d, hour, minute, lateNight, lastMin, payment, status:'Confirmed', notes:'' });
  }
  // sort by datetime asc, assign confirmation numbers + a few notes
  bookings.sort((a,b)=> (a.d - b.d) || (a.hour-b.hour) || (a.minute-b.minute));
  const notesPool = ['Regular — usual style','Requested fade #2 guard','Walk-in','Wedding next week','First visit','Allergic to certain oils','Prefers scissors over clipper','Booked via Instagram',''];
  bookings.forEach((bk,i)=>{
    bk.conf = 'ZB-' + (1001+i);
    if (rnd()<0.4) bk.notes = pick(notesPool);
    if (bk.status==='Cancelled') bk.notes = pick(['Client cancelled day-of','Rescheduled to next week','Cancelled — sick']);
    if (bk.status==='No Show') bk.notes = 'Did not show';
    bk.total = bk.svc.price + (bk.lateNight==='Y'?10:0) + (bk.lastMin==='Y'?8:0);
  });

  // ---- client directory aggregates (completed only) ----
  const agg = {};
  clients.forEach(c=> agg[c.name] = { visits:0, spent:0, last:null, svcCount:{} });
  bookings.forEach(bk=>{
    if (bk.status!=='Completed') return;
    const a = agg[bk.client.name];
    a.visits++; a.spent += bk.total;
    if (!a.last || bk.d>a.last) a.last = bk.d;
    a.svcCount[bk.svc.name] = (a.svcCount[bk.svc.name]||0)+1;
  });
  const directory = clients.map(c=>{
    const a = agg[c.name];
    let pref = c.pref, best=-1;
    Object.entries(a.svcCount).forEach(([s,n])=>{ if(n>best){best=n;pref=s;} });
    return { name:c.name, email:c.email, phone:c.phone, preferred:pref };
  }).sort((x,y)=> (agg[y.name].visits - agg[x.name].visits) || (agg[y.name].spent - agg[x.name].spent));

  // ---- finance: income + expenses ----
  const income = [];
  // booking day deposits (sum a busy day's completed)
  const byDay = {};
  bookings.forEach(bk=>{ if(bk.status!=='Completed')return; const k=bk.d.toISOString().slice(0,10); (byDay[k]=byDay[k]||[]).push(bk); });
  const busyDays = Object.entries(byDay).sort((a,b)=> b[1].length-a[1].length).slice(0,14);
  busyDays.forEach(([k,arr])=>{
    const d = new Date(k+'T00:00:00');
    const amt = arr.reduce((s,b)=>s+b.total,0);
    income.push({ d, source:'Booking', desc:`Chair takings \u2014 ${arr.length} clients`, amount:amt });
  });
  const shopItems=['Pomade restock resale','Beard oil sales','Hair tonic sales','Branded caps','Gift card top-up redemptions'];
  for(let i=0;i<6;i++){ income.push({ d:new Date(2026, ri(0,5), ri(2,27)), source:'Shop', desc:pick(shopItems), amount: ri(40,180) }); }
  for(let i=0;i<3;i++){ income.push({ d:new Date(2026, ri(0,5), ri(2,27)), source:'Other', desc:pick(['Gift card sale','Tip jar deposit','Loyalty event']), amount: ri(60,260) }); }
  income.sort((a,b)=>a.d-b.d);

  const expenses = [];
  const supply=['Clipper blades & oil','Capes & towels restock','Pomade / wax wholesale','Neck strips & cleaner','Disposable razors','Shampoo & tonic'];
  const equip=['New barber chair','Wahl clipper set','Mirror replacement','POS terminal','Trimmer detailers'];
  for(let m=0;m<6;m++){ expenses.push({ d:new Date(2026,m,1), cat:'Rent', desc:'Shop rent', amount:1500 }); }
  for(let i=0;i<7;i++){ expenses.push({ d:new Date(2026, ri(0,5), ri(2,27)), cat:'Supplies', desc:pick(supply), amount: ri(45,260) }); }
  for(let i=0;i<3;i++){ expenses.push({ d:new Date(2026, ri(0,5), ri(2,27)), cat:'Marketing', desc:pick(['Instagram ads','Flyer print run','Local sponsorship','Google Business boost']), amount: ri(50,320) }); }
  for(let i=0;i<3;i++){ expenses.push({ d:new Date(2026, ri(1,5), ri(2,27)), cat:'Equipment', desc:pick(equip), amount: ri(120,640) }); }
  for(let i=0;i<3;i++){ expenses.push({ d:new Date(2026, ri(0,5), ri(2,27)), cat:'Misc', desc:pick(['Utilities','Wifi & phone','Cleaning service','Insurance']), amount: ri(60,240) }); }
  expenses.sort((a,b)=>a.d-b.d);

  // ---- waitlist ----
  const wlNames=['Brandon Hale','Felix Moreau','Quentin Park','Sam Okafor','Leo Dimitri','Marco Bianchi','Owen Frost','Priya\u2019s son (Rohan)','Derek Lyons','Chad Whitman','Amir Saleh','Kofi Mensah'];
  const wlStatus=[['Waiting',5],['Contacted',3],['Booked',2],['Cancelled',2]];
  const waitlist = wlNames.map((n,i)=>{
    const added = new Date(2026,5,ri(1,3));
    const desired = new Date(2026,5,ri(5,22));
    const st = wpick(wlStatus);
    const parts=n.toLowerCase().replace(/[^a-z ]/g,'').split(' ');
    return {
      name:n,
      email:`${parts[0]}${(parts[1]||'')}@${pick(['gmail.com','outlook.com','icloud.com'])}`,
      phone:`(${pick(areaCodes)}) 555-0${ri(100,999)}`,
      desired, added, status:st,
      notes: st==='Booked'?'Moved to Bookings Log': st==='Cancelled'?'No longer needs slot': pick(['Flexible on day','Evenings only','Wants Marcus','Skin fade','—']),
    };
  });

  return { SERVICES, clients, bookings, directory, agg, income, expenses, waitlist };
}

function buildEmptyData(){
  return { SERVICES, clients:[], bookings:[], directory:[], agg:{}, income:[], expenses:[], waitlist:[] };
}

/* shared layout constants for the Bookings sheet (referenced by analytics/clients formulas) */
window.ZB = { FONT, C, SHEETS, NAV, FMT, colLetter, bThin, bThinW, bGold, bGoldThin, bDark, box, S, merge, topBand, kpiCard, headerRow, buildData, buildEmptyData, BOOK:{ headerRow:8, firstData:9 } };
