/* ============================================================
   BUILDERS B — Analytics Dashboard, Client Directory, Waitlist
   ============================================================ */
(function(){
const { C, FMT, colLetter, S, merge, topBand, headerRow, box, bThin, bGold, bGoldThin, bDark, BOOK } = window.ZB;
const { kpiStat, protect } = window.ZBA;

const BK = `'${window.ZB.SHEETS.bookings}'!`;
function bkRanges(n){
  const f = BOOK.firstData, l = Math.max(f + 49, BOOK.headerRow + n);
  return {
    status:`${BK}$K$${f}:$K$${l}`,
    total :`${BK}$N$${f}:$N$${l}`,
    date  :`${BK}$H$${f}:$H$${l}`,
    time  :`${BK}$I$${f}:$I$${l}`,
    svc   :`${BK}$E$${f}:$E$${l}`,
    pay   :`${BK}$G$${f}:$G$${l}`,
    name  :`${BK}$B$${f}:$B$${l}`,
  };
}

/* ---------------- ANALYTICS DASHBOARD ---------------- */
function buildAnalytics(wb, data){
  const ws = wb.addWorksheet(window.ZB.SHEETS.analytics, {
    properties:{ tabColor:{argb:C.darkGrey} },
    views:[{ showGridLines:false }],
    pageSetup:{ orientation:'landscape', fitToPage:true, fitToWidth:1, fitToHeight:0, margins:{left:0.3,right:0.3,top:0.4,bottom:0.4,header:0.2,footer:0.2} },
  });
  const widths=[15,12,26,3,16,11,24,2];
  widths.forEach((w,i)=> ws.getColumn(i+1).width=w);
  const R = bkRanges(data.bookings.length);
  const LAST_ROW = 48;
  // dark canvas
  for(let r=1;r<=LAST_ROW;r++){ for(let c=1;c<=8;c++){ ws.getCell(`${colLetter(c)}${r}`).fill={type:'pattern',pattern:'solid',fgColor:{argb:C.charcoal}}; } }
  topBand(ws, 8, 'analytics', 'ANALYTICS DASHBOARD');
  // re-dark the title row for the dashboard theme
  const t = ws.getCell('A3'); t.fill={type:'pattern',pattern:'solid',fgColor:{argb:C.charcoal2}}; t.font={name:'Calibri',size:15,bold:true,color:{argb:C.gold}};

  // reporting-month control
  ws.getRow(4).height=22;
  merge(ws,'A4:B4','REPORTING MONTH  \u25B8',{fill:C.charcoal,font:{size:9,bold:true,color:{argb:C.muted}},align:{horizontal:'right'}});
  const ctrl = S(ws,'C4', new Date(2026,4,1), {fill:C.charcoal2,numFmt:'mmmm yyyy',font:{size:11,bold:true,color:{argb:C.gold}},align:{horizontal:'left',indent:1},border:box(bGoldThin),unlock:true});
  merge(ws,'E4:G4','\u2190 change this cell to refresh every KPI below',{fill:C.charcoal,font:{size:8,italic:true,color:{argb:C.muted}},align:{horizontal:'left'}});

  // KPI cards (label row 6, value row 7)
  const m0='$C$4', m1='EDATE($C$4,1)';
  kpiStat(ws,1,3,6,'Revenue This Month',{formula:`SUMIFS(${R.total},${R.status},"Completed",${R.date},">="&${m0},${R.date},"<"&${m1})`},FMT.money,C.gold);
  kpiStat(ws,4,1,6,'Bookings',{formula:`COUNTIFS(${R.date},">="&${m0},${R.date},"<"&${m1})`},'0',C.white);
  const pop = kpiStat(ws,5,3,6,'Most Popular Service',{formula:`INDEX($A$25:$A$34,MATCH(MAX($B$25:$B$34),$B$25:$B$34,0))`},undefined,C.gold);
  pop.font={name:'Calibri',size:12,bold:true,color:{argb:C.gold}};
  // second KPI row (9-10)
  kpiStat(ws,1,3,9,'Average Booking Value',{formula:`IFERROR(AVERAGEIFS(${R.total},${R.status},"Completed",${R.date},">="&${m0},${R.date},"<"&${m1}),0)`},FMT.money,C.green);
  const split = kpiStat(ws,4,4,9,'Cash vs E-Transfer',{formula:`"Cash "&TEXT(COUNTIF(${R.pay},"Cash")/COUNTA(${R.status}),"0%")&"   /   E-Transfer "&TEXT(COUNTIF(${R.pay},"E-Transfer")/COUNTA(${R.status}),"0%")`},undefined,C.gold);
  split.font={name:'Calibri',size:12,bold:true,color:{argb:C.gold}};
  ws.getRow(11).height=8;

  // ---- helper to draw a titled bar block ----
  function blockTitle(range,label){
    merge(ws,range,label.toUpperCase(),{fill:C.charcoal2,font:{size:10,bold:true,color:{argb:C.gold}},align:{horizontal:'left',indent:1},border:{bottom:bGoldThin}});
  }
  function barRows(rows, startRow, labelCol, valCol, barCol, numFmt){
    rows.forEach((row,i)=>{
      const r = startRow+i;
      const A=colLetter(labelCol), B=colLetter(valCol), Cc=colLetter(barCol);
      S(ws,`${A}${r}`, row.label, {fill:C.charcoal,font:{size:9.5,color:{argb:C.white}},align:{horizontal:'left',indent:1}});
      S(ws,`${B}${r}`, {formula:row.formula}, {fill:C.charcoal,numFmt,font:{size:9.5,bold:true,color:{argb:C.gold}},align:{horizontal:'right',indent:1}});
      S(ws,`${Cc}${r}`, {formula:`${B}${r}`}, {fill:C.charcoal,numFmt:';;;',font:{color:{argb:C.charcoal}}});
      ws.getRow(r).height=18;
    });
    ws.addConditionalFormatting({ ref:`${colLetter(barCol)}${startRow}:${colLetter(barCol)}${startRow+rows.length-1}`, rules:[
      { type:'dataBar', gradient:false, minLength:0, maxLength:98, cfvo:[{type:'num',value:0},{type:'max'}], color:{argb:C.gold}, border:false, priority:1 },
    ]});
  }

  // SECTION 1 — Revenue by Month
  blockTitle('A13:C13','Revenue by Month \u2014 2026');
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  barRows(months.map((m,i)=>({ label:m, formula:`SUMPRODUCT((MONTH(${R.date})=${i+1})*(${R.status}="Completed")*${R.total})` })), 14, 1, 2, 3, FMT.money0);

  // SECTION 2 (left) — Bookings by Service
  blockTitle('A23:C23','Bookings by Service');
  barRows(data.SERVICES.map(s=>({ label:s.name, formula:`SUMPRODUCT((${R.svc}="${s.name}")*(${R.status}="Completed"))` })), 25, 1, 2, 3, '0');

  // SECTION 2 (right) — Busiest Days of Week
  blockTitle('E23:G23','Busiest Days of the Week');
  const days=[['Monday',1],['Tuesday',2],['Wednesday',3],['Thursday',4],['Friday',5],['Saturday',6],['Sunday',7]];
  barRows(days.map(([d,n])=>({ label:d, formula:`SUMPRODUCT((WEEKDAY(${R.date},2)=${n})*(${R.status}="Completed"))` })), 25, 5, 6, 7, '0');

  // SECTION 3 — Busiest Hours (full width using A,B,C)
  blockTitle('A36:C36','Busiest Hours');
  const hours=[10,11,12,13,14,15,16,17,18,19,20];
  function hourLabel(h){ const ap=h<12?'AM':'PM'; const hh=h%12===0?12:h%12; return `${hh}:00 ${ap}`; }
  barRows(hours.map(h=>({ label:hourLabel(h), formula:`SUMPRODUCT((HOUR(${R.time})=${h})*(${R.status}="Completed"))` })), 37, 1, 2, 3, '0');

  // footer note
  merge(ws,`A${LAST_ROW}:H${LAST_ROW}`,'All figures calculated live from the Bookings Log \u2022 bars are in-cell data bars \u2022 CAD ($)',{fill:C.charcoal,font:{size:8,italic:true,color:{argb:C.muted}},align:{horizontal:'left',indent:1},border:{top:bGoldThin}});

  protect(ws);
}

/* ---------------- CLIENT DIRECTORY ---------------- */
function buildClients(wb, data){
  const HR=8, F=9;
  const ws = wb.addWorksheet(window.ZB.SHEETS.clients, {
    properties:{ tabColor:{argb:C.gold} },
    views:[{ state:'frozen', xSplit:0, ySplit:HR, topLeftCell:`A${F}`, showGridLines:false }],
    pageSetup:{ orientation:'landscape', fitToPage:true, fitToWidth:1, fitToHeight:0, printTitlesRow:`${HR}:${HR}`, margins:{left:0.3,right:0.3,top:0.4,bottom:0.4,header:0.2,footer:0.2} },
  });
  const widths=[20,28,16,12,14,15,20,10,28];
  widths.forEach((w,i)=> ws.getColumn(i+1).width=w);
  topBand(ws, 9, 'clients', 'CLIENT DIRECTORY');
  const R = bkRanges(data.bookings.length);
  const n = data.directory.length, last = Math.max(F+49, HR+n);

  // KPI cards
  kpiStat(ws,1,3,5,'Total Clients',{formula:`COUNTA($A${F}:$A${last})`},'0',C.gold);
  kpiStat(ws,4,3,5,'VIP Clients',{formula:`COUNTIF($H${F}:$H${last},"VIP")`},'0',C.gold);
  kpiStat(ws,7,3,5,'Avg Lifetime Spend',{formula:`IFERROR(AVERAGE($E${F}:$E${last}),0)`},FMT.money,C.green);
  ws.getRow(7).height=6;

  headerRow(ws, HR, ['Client Name','Email','Phone','Total Visits','Total Spent','Last Visit','Preferred Service','VIP Flag','Notes']);

  data.directory.forEach((cl,i)=>{
    const r=F+i; const top5=i<5; const base = i%2?C.altLight:C.white;
    const leftB = top5 ? { left:bGold } : {};
    S(ws,`A${r}`, cl.name, {fill:base,font:{bold:true},align:{horizontal:'left',indent:1},border:Object.assign({bottom:bThin},leftB),unlock:true});
    S(ws,`B${r}`, cl.email, {fill:base,font:{color:{argb:C.muted},size:9},align:{horizontal:'left',indent:1},border:{bottom:bThin},unlock:true});
    S(ws,`C${r}`, cl.phone, {fill:base,font:{color:{argb:C.muted}},align:{horizontal:'left',indent:1},border:{bottom:bThin},unlock:true});
    S(ws,`D${r}`, {formula:`COUNTIFS(${R.name},A${r},${R.status},"Completed")`}, {fill:base,font:{bold:true},align:{horizontal:'center'},border:{bottom:bThin}});
    S(ws,`E${r}`, {formula:`SUMIFS(${R.total},${R.name},A${r},${R.status},"Completed")`}, {fill:base,numFmt:FMT.money,font:{color:{argb:C.greenDeep},bold:true},align:{horizontal:'right',indent:1},border:{bottom:bThin}});
    S(ws,`F${r}`, {formula:`IF(D${r}=0,"\u2014",MAXIFS(${R.date},${R.name},A${r},${R.status},"Completed"))`}, {fill:base,numFmt:FMT.date,align:{horizontal:'center'},border:{bottom:bThin}});
    S(ws,`G${r}`, cl.preferred, {fill:base,align:{horizontal:'left',indent:1},border:{bottom:bThin},unlock:true});
    S(ws,`H${r}`, {formula:`IF(OR(D${r}>=5,E${r}>=300),"VIP","")`}, {fill:base,font:{bold:true},align:{horizontal:'center'},border:{bottom:bThin}});
    S(ws,`I${r}`, '', {fill:base,font:{color:{argb:C.muted},size:9,italic:true},align:{horizontal:'left',indent:1},border:{bottom:bThin},unlock:true});
    ws.getRow(r).height=20;
  });

  // VIP gold highlight
  ws.addConditionalFormatting({ ref:`H${F}:H${last}`, rules:[
    { type:'containsText', operator:'containsText', text:'VIP', priority:1, style:{ font:{color:{argb:C.charcoal},bold:true}, fill:{type:'pattern',pattern:'solid',bgColor:{argb:C.gold}} } },
  ]});
  ws.autoFilter = { from:{row:HR,column:1}, to:{row:HR,column:9} };
  protect(ws, `A${F}:I${last+30}`);
}

/* ---------------- WAITLIST ---------------- */
function buildWaitlist(wb, data){
  const HR=5, F=6;
  const ws = wb.addWorksheet(window.ZB.SHEETS.waitlist, {
    properties:{ tabColor:{argb:C.grey} },
    views:[{ state:'frozen', xSplit:0, ySplit:HR, topLeftCell:`A${F}`, showGridLines:false }],
    pageSetup:{ orientation:'landscape', fitToPage:true, fitToWidth:1, fitToHeight:0, printTitlesRow:`${HR}:${HR}`, margins:{left:0.3,right:0.3,top:0.4,bottom:0.4,header:0.2,footer:0.2} },
  });
  const widths=[20,28,16,16,16,14,34];
  widths.forEach((w,i)=> ws.getColumn(i+1).width=w);
  topBand(ws, 7, 'waitlist', 'WAITLIST');
  const n=data.waitlist.length, last=Math.max(F+49, HR+n);

  headerRow(ws, HR, ['Name','Email','Phone','Desired Date','Date Added','Status','Notes']);
  data.waitlist.forEach((w,i)=>{
    const r=F+i; const base=i%2?C.altLight:C.white;
    S(ws,`A${r}`, w.name, {fill:base,font:{bold:true},align:{horizontal:'left',indent:1},border:{bottom:bThin},unlock:true});
    S(ws,`B${r}`, w.email, {fill:base,font:{color:{argb:C.muted},size:9},align:{horizontal:'left',indent:1},border:{bottom:bThin},unlock:true});
    S(ws,`C${r}`, w.phone, {fill:base,font:{color:{argb:C.muted}},align:{horizontal:'left',indent:1},border:{bottom:bThin},unlock:true});
    S(ws,`D${r}`, new Date(2026,w.desired.getMonth(),w.desired.getDate()), {fill:base,numFmt:FMT.date,align:{horizontal:'center'},border:{bottom:bThin},unlock:true});
    S(ws,`E${r}`, new Date(2026,w.added.getMonth(),w.added.getDate()), {fill:base,numFmt:FMT.date,align:{horizontal:'center'},font:{color:{argb:C.muted}},border:{bottom:bThin},unlock:true});
    S(ws,`F${r}`, w.status, {fill:base,font:{bold:true},align:{horizontal:'center'},border:{bottom:bThin},unlock:true});
    S(ws,`G${r}`, w.notes, {fill:base,font:{color:{argb:C.muted},size:9,italic:true},align:{horizontal:'left',indent:1},border:{bottom:bThin},unlock:true});
    ws.getRow(r).height=20;
  });
  ws.dataValidations.add(`F${F}:F${last+30}`, { type:'list', allowBlank:false, formulae:['"Waiting,Contacted,Booked,Cancelled"'] });

  // status tints + grey-out for cancelled/booked
  ws.addConditionalFormatting({ ref:`A${F}:G${last}`, rules:[
    { type:'expression', priority:1, formulae:[`OR($F${F}="Cancelled",$F${F}="Booked")`], style:{ fill:{type:'pattern',pattern:'solid',bgColor:{argb:C.greyTint}}, font:{color:{argb:C.muted},italic:true} } },
  ]});
  ws.addConditionalFormatting({ ref:`F${F}:F${last}`, rules:[
    { type:'containsText', operator:'containsText', text:'Waiting', priority:2, style:{ font:{color:{argb:C.goldDeep},bold:true}, fill:{type:'pattern',pattern:'solid',bgColor:{argb:C.goldTint}} } },
    { type:'containsText', operator:'containsText', text:'Contacted', priority:3, style:{ font:{color:{argb:'FF2A6FB0'},bold:true}, fill:{type:'pattern',pattern:'solid',bgColor:{argb:'FFE8F1FA'}} } },
    { type:'containsText', operator:'containsText', text:'Booked', priority:4, style:{ font:{color:{argb:C.greenDeep},bold:true} } },
    { type:'containsText', operator:'containsText', text:'Cancelled', priority:5, style:{ font:{color:{argb:C.muted},bold:true} } },
  ]});
  ws.autoFilter = { from:{row:HR,column:1}, to:{row:HR,column:7} };
  protect(ws, `A${F}:G${last+30}`);
}

window.ZBB = { buildAnalytics, buildClients, buildWaitlist };
})();
