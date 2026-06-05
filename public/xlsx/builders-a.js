/* ============================================================
   BUILDERS A — Cover, Bookings Log, Finance Tracker
   (relies on globals from lib.js via window.ZB)
   ============================================================ */
(function(){
const { C, FMT, colLetter, S, merge, topBand, headerRow, box, bThin, bGold, bGoldThin, bDark, BOOK } = window.ZB;

/* live-formula KPI stat: label cell over value cell, boxed gold */
function kpiStat(ws, colStart, colSpan, rTop, label, value, numFmt, valColor){
  const a = colLetter(colStart), b = colLetter(colStart+colSpan-1);
  if(colSpan>1){ ws.mergeCells(`${a}${rTop}:${b}${rTop}`); ws.mergeCells(`${a}${rTop+1}:${b}${rTop+1}`); }
  S(ws, `${a}${rTop}`, label.toUpperCase(), {
    fill:C.charcoal, font:{ size:8, bold:true, color:{argb:C.muted} },
    align:{ horizontal:'left', vertical:'middle', indent:1 },
    border:{ top:bGoldThin, left:bGoldThin, right:bGoldThin },
  });
  const v = S(ws, `${a}${rTop+1}`, value, {
    fill:C.charcoal, numFmt,
    font:{ size:17, bold:true, color:{argb: valColor||C.gold } },
    align:{ horizontal:'left', vertical:'middle', indent:1 },
    border:{ bottom:bGoldThin, left:bGoldThin, right:bGoldThin },
  });
  ws.getRow(rTop).height = 16;
  ws.getRow(rTop+1).height = 30;
  return v;
}

/* ---------------- COVER ---------------- */
function buildCover(wb){
  const ws = wb.addWorksheet(window.ZB.SHEETS.cover, {
    properties:{ tabColor:{argb:C.charcoal} },
    views:[{ showGridLines:false }],
    pageSetup:{ orientation:'landscape', fitToPage:true, fitToWidth:1, fitToHeight:1, margins:{left:0.3,right:0.3,top:0.3,bottom:0.3,header:0,footer:0} },
  });
  for(let i=1;i<=12;i++) ws.getColumn(i).width = 10.5;
  for(let r=1;r<=32;r++){
    ws.getRow(r).height = r<=2?14:18;
    for(let c=1;c<=12;c++){ ws.getCell(`${colLetter(c)}${r}`).fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.charcoal} }; }
  }
  // thin gold frame
  merge(ws, 'B3:K3', null, { fill:C.charcoal, border:{ top:bGold } });
  merge(ws, 'B30:K30', null, { fill:C.charcoal, border:{ bottom:bGold } });

  merge(ws, 'C7:J13', 'ZOBLENDS', {
    fill:C.charcoal, font:{ size:54, bold:true, color:{argb:C.gold} },
    align:{ horizontal:'center', vertical:'middle' },
  });
  merge(ws, 'C14:J15', 'B U S I N E S S   O P E R A T I O N S   W O R K B O O K', {
    fill:C.charcoal, font:{ size:13, bold:true, color:{argb:C.white} },
    align:{ horizontal:'center', vertical:'middle' },
  });
  merge(ws, 'E16:H16', null, { fill:C.charcoal, border:{ bottom:bGoldThin } });
  merge(ws, 'C18:J18', { formula:'"Generated "&TEXT(TODAY(),"mmmm dd, yyyy")' }, {
    fill:C.charcoal, font:{ size:11, italic:true, color:{argb:C.muted} },
    align:{ horizontal:'center', vertical:'middle' },
  });

  // nav buttons strip C..L (5 buttons x 2 cols)
  const links = [
    ['BOOKINGS LOG', window.ZB.SHEETS.bookings],
    ['FINANCE', window.ZB.SHEETS.finance],
    ['ANALYTICS', window.ZB.SHEETS.analytics],
    ['CLIENTS', window.ZB.SHEETS.clients],
    ['WAITLIST', window.ZB.SHEETS.waitlist],
  ];
  ws.getRow(22).height = 24; ws.getRow(23).height = 24;
  let col = 3;
  links.forEach(([label,sheet])=>{
    const a = colLetter(col), b = colLetter(col+1);
    merge(ws, `${a}22:${b}23`, { text:label, hyperlink:`#'${sheet}'!A1` }, {
      fill:C.gold, font:{ size:9.5, bold:true, color:{argb:C.charcoal} },
      align:{ horizontal:'center', vertical:'middle' }, border: box(bGoldThin),
    });
    col += 2;
  });
  merge(ws, 'C26:J27', 'Bookings  \u2022  Finance  \u2022  Analytics  \u2022  Clients  \u2022  Waitlist     \u2014     all figures in CAD ($)', {
    fill:C.charcoal, font:{ size:9, color:{argb:C.muted} },
    align:{ horizontal:'center', vertical:'middle' },
  });
}

/* ---------------- BOOKINGS LOG ---------------- */
function buildBookings(wb, data){
  const ws = wb.addWorksheet(window.ZB.SHEETS.bookings, {
    properties:{ tabColor:{argb:C.gold} },
    views:[{ state:'frozen', xSplit:0, ySplit:BOOK.headerRow, topLeftCell:`A${BOOK.firstData}`, showGridLines:false }],
    pageSetup:{ orientation:'landscape', fitToPage:true, fitToWidth:1, fitToHeight:0, printTitlesRow:`${BOOK.headerRow}:${BOOK.headerRow}`, margins:{left:0.25,right:0.25,top:0.4,bottom:0.4,header:0.2,footer:0.2} },
  });
  const widths = [11,18,26,16,18,11,15,15,12,10,13,11,11,14,30];
  widths.forEach((w,i)=> ws.getColumn(i+1).width = w);
  topBand(ws, 15, 'bookings', 'BOOKINGS LOG');

  const last = Math.max(BOOK.firstData + 49, BOOK.headerRow + data.bookings.length);
  const kRange = `$K${BOOK.firstData}:$K${last}`;
  const nRange = `$N${BOOK.firstData}:$N${last}`;
  const aRange = `$A${BOOK.firstData}:$A${last}`;
  // KPI summary cards on rows 5-6
  kpiStat(ws, 1, 3, 5, 'Total Bookings', { formula:`COUNTA(${aRange})` }, '0', C.gold);
  kpiStat(ws, 4, 3, 5, 'Completed', { formula:`COUNTIF(${kRange},"Completed")` }, '0', C.green);
  kpiStat(ws, 7, 3, 5, 'Cancelled', { formula:`COUNTIF(${kRange},"Cancelled")` }, '0', C.red);
  kpiStat(ws,10, 3, 5, 'No Show', { formula:`COUNTIF(${kRange},"No Show")` }, '0', C.red);
  kpiStat(ws,13, 3, 5, 'Revenue (Completed)', { formula:`SUMIF(${kRange},"Completed",${nRange})` }, FMT.money, C.gold);
  ws.getRow(7).height = 6;

  const heads = ['Confirmation #','Client Name','Email','Phone','Service','Price','Payment Method','Date','Time','Duration','Status','Late Night Fee','Last Minute Fee','Total Charged','Notes'];
  headerRow(ws, BOOK.headerRow, heads);

  data.bookings.forEach((bk,i)=>{
    const r = BOOK.firstData + i;
    const alt = i%2===1;
    const base = alt ? C.altLight : C.white;
    const dt = new Date(2026, bk.d.getMonth(), bk.d.getDate(), bk.hour, bk.minute);
    const time = new Date(1899,11,30, bk.hour, bk.minute);
    const row = [
      [`A${r}`, bk.conf,        { align:{horizontal:'left',indent:1}, font:{bold:true,color:{argb:C.muted}} }],
      [`B${r}`, bk.client.name, { align:{horizontal:'left',indent:1}, font:{bold:true} }],
      [`C${r}`, bk.client.email,{ align:{horizontal:'left',indent:1}, font:{color:{argb:C.muted},size:9} }],
      [`D${r}`, bk.client.phone,{ align:{horizontal:'left',indent:1}, font:{color:{argb:C.muted}} }],
      [`E${r}`, bk.svc.name,    { align:{horizontal:'left',indent:1} }],
      [`F${r}`, bk.svc.price,   { numFmt:FMT.money, align:{horizontal:'right',indent:1} }],
      [`G${r}`, bk.payment,     { align:{horizontal:'center'} }],
      [`H${r}`, new Date(2026,bk.d.getMonth(),bk.d.getDate()), { numFmt:FMT.date, align:{horizontal:'center'} }],
      [`I${r}`, time,           { numFmt:FMT.time, align:{horizontal:'center'} }],
      [`J${r}`, `${bk.svc.dur} min`, { align:{horizontal:'center'}, font:{color:{argb:C.muted}} }],
      [`K${r}`, bk.status,      { align:{horizontal:'center'}, font:{bold:true} }],
      [`L${r}`, bk.lateNight,   { align:{horizontal:'center'}, font:{color:{argb: bk.lateNight==='Y'?C.ink:C.muted}} }],
      [`M${r}`, bk.lastMin,     { align:{horizontal:'center'}, font:{color:{argb: bk.lastMin==='Y'?C.ink:C.muted}} }],
      [`N${r}`, { formula:`F${r}+IF(L${r}="Y",10,0)+IF(M${r}="Y",8,0)` }, { numFmt:FMT.money, align:{horizontal:'right',indent:1}, font:{bold:true} }],
      [`O${r}`, bk.notes,       { align:{horizontal:'left',indent:1}, font:{color:{argb:C.muted},size:9,italic:true} }],
    ];
    row.forEach(([ref,val,st])=>{
      S(ws, ref, val, Object.assign({ fill:base, border:{ bottom:bThin, right:{style:'hair',color:{argb:C.borderBody}} }, unlock:true }, st));
    });
    ws.getRow(r).height = 20;
  });

  // status dropdown
  ws.dataValidations.add(`K${BOOK.firstData}:K${last}`, { type:'list', allowBlank:false, formulae:['"Confirmed,Completed,Cancelled,No Show"'] });
  ws.dataValidations.add(`G${BOOK.firstData}:G${last}`, { type:'list', allowBlank:false, formulae:['"Cash,E-Transfer"'] });
  ws.dataValidations.add(`L${BOOK.firstData}:M${last}`, { type:'list', allowBlank:true, formulae:['"Y,N"'] });

  // autofilter
  ws.autoFilter = { from:{row:BOOK.headerRow, column:1}, to:{row:BOOK.headerRow, column:15} };

  // conditional formatting — row tints by status + status-cell colors
  const ref = `A${BOOK.firstData}:O${last}`;
  ws.addConditionalFormatting({ ref, rules:[
    { type:'expression', priority:1, formulae:[`$K${BOOK.firstData}="Completed"`], style:{ fill:{type:'pattern',pattern:'solid',bgColor:{argb:C.greenTint}} } },
    { type:'expression', priority:2, formulae:[`OR($K${BOOK.firstData}="Cancelled",$K${BOOK.firstData}="No Show")`], style:{ fill:{type:'pattern',pattern:'solid',bgColor:{argb:C.redTint}} } },
  ]});
  // status cell color chips
  const kref = `K${BOOK.firstData}:K${last}`;
  ws.addConditionalFormatting({ ref:kref, rules:[
    { type:'containsText', operator:'containsText', text:'Completed', priority:3, style:{ font:{color:{argb:C.greenDeep},bold:true}, fill:{type:'pattern',pattern:'solid',bgColor:{argb:C.greenTint}} } },
    { type:'containsText', operator:'containsText', text:'Confirmed', priority:4, style:{ font:{color:{argb:C.goldDeep},bold:true}, fill:{type:'pattern',pattern:'solid',bgColor:{argb:C.goldTint}} } },
    { type:'containsText', operator:'containsText', text:'Cancelled', priority:5, style:{ font:{color:{argb:C.redDeep},bold:true}, fill:{type:'pattern',pattern:'solid',bgColor:{argb:C.redTint}} } },
    { type:'containsText', operator:'containsText', text:'No Show', priority:6, style:{ font:{color:{argb:C.redDeep},bold:true}, fill:{type:'pattern',pattern:'solid',bgColor:{argb:C.redTint}} } },
  ]});

  protect(ws, `A${BOOK.firstData}:O${last+40}`);
  return { last };
}

/* ---------------- FINANCE TRACKER ---------------- */
function buildFinance(wb, data){
  const ws = wb.addWorksheet(window.ZB.SHEETS.finance, {
    properties:{ tabColor:{argb:C.green} },
    views:[{ state:'frozen', xSplit:0, ySplit:5, showGridLines:false }],
    pageSetup:{ orientation:'landscape', fitToPage:true, fitToWidth:1, fitToHeight:0, margins:{left:0.3,right:0.3,top:0.4,bottom:0.4,header:0.2,footer:0.2} },
  });
  const widths=[14,14,30,14,3,3,14,14,30,14];
  widths.forEach((w,i)=> ws.getColumn(i+1).width = w);
  ws.getColumn(5).hidden = true; // income month helper
  ws.getColumn(11).hidden = true; // expense month helper
  topBand(ws, 10, 'finance', 'FINANCE TRACKER');

  const HR = 5; // column header row
  // section banners (row 4)
  ws.getRow(4).height = 22;
  merge(ws, 'A4:D4', 'INCOME', { fill:C.charcoal, font:{size:11,bold:true,color:{argb:C.green}}, align:{horizontal:'left',indent:1}, border:{bottom:bGold} });
  merge(ws, 'G4:J4', 'EXPENSES', { fill:C.charcoal, font:{size:11,bold:true,color:{argb:C.red}}, align:{horizontal:'left',indent:1}, border:{bottom:bGold} });

  headerRow(ws, HR, ['Date','Source','Description','Amount']);
  headerRow(ws, HR, ['Date','Category','Description','Amount'], 7);

  // income rows
  const inc = data.income, exp = data.expenses;
  inc.forEach((row,i)=>{
    const r = HR+1+i; const base = i%2 ? C.altLight : C.white;
    S(ws,`A${r}`, new Date(2026,row.d.getMonth(),row.d.getDate()), {fill:base,numFmt:FMT.date,align:{horizontal:'center'},border:{bottom:bThin},unlock:true});
    S(ws,`B${r}`, row.source, {fill:base,align:{horizontal:'left',indent:1},border:{bottom:bThin},unlock:true});
    S(ws,`C${r}`, row.desc, {fill:base,align:{horizontal:'left',indent:1},font:{color:{argb:C.muted},size:9},border:{bottom:bThin},unlock:true});
    S(ws,`D${r}`, row.amount, {fill:base,numFmt:FMT.money,align:{horizontal:'right',indent:1},font:{color:{argb:C.greenDeep}},border:{bottom:bThin},unlock:true});
    S(ws,`E${r}`, { formula:`MONTH(A${r})` });
    ws.getRow(r).height = 19;
  });
  exp.forEach((row,i)=>{
    const r = HR+1+i; const base = i%2 ? C.altLight : C.white;
    S(ws,`G${r}`, new Date(2026,row.d.getMonth(),row.d.getDate()), {fill:base,numFmt:FMT.date,align:{horizontal:'center'},border:{bottom:bThin},unlock:true});
    S(ws,`H${r}`, row.cat, {fill:base,align:{horizontal:'left',indent:1},border:{bottom:bThin},unlock:true});
    S(ws,`I${r}`, row.desc, {fill:base,align:{horizontal:'left',indent:1},font:{color:{argb:C.muted},size:9},border:{bottom:bThin},unlock:true});
    S(ws,`J${r}`, row.amount, {fill:base,numFmt:FMT.money,align:{horizontal:'right',indent:1},font:{color:{argb:C.redDeep}},border:{bottom:bThin},unlock:true});
    S(ws,`K${r}`, { formula:`MONTH(G${r})` });
    if(r>ws.getRow(r).height) {}
    ws.getRow(r).height = 19;
  });

  const incEnd = Math.max(HR+1, HR+inc.length), expEnd = Math.max(HR+1, HR+exp.length);
  const incTotR = incEnd+1, expTotR = expEnd+1;
  // running totals
  merge(ws,`A${incTotR}:C${incTotR}`,'TOTAL INCOME',{fill:C.charcoal,font:{bold:true,size:10,color:{argb:C.gold}},align:{horizontal:'left',indent:1},border:{top:bGold,bottom:bGold}});
  S(ws,`D${incTotR}`,{formula:`SUM(D${HR+1}:D${incEnd})`},{fill:C.charcoal,numFmt:FMT.money,font:{bold:true,size:11,color:{argb:C.gold}},align:{horizontal:'right',indent:1},border:{top:bGold,bottom:bGold}});
  merge(ws,`G${expTotR}:I${expTotR}`,'TOTAL EXPENSES',{fill:C.charcoal,font:{bold:true,size:10,color:{argb:C.red}},align:{horizontal:'left',indent:1},border:{top:bGold,bottom:bGold}});
  S(ws,`J${expTotR}`,{formula:`SUM(J${HR+1}:J${expEnd})`},{fill:C.charcoal,numFmt:FMT.money,font:{bold:true,size:11,color:{argb:C.red}},align:{horizontal:'right',indent:1},border:{top:bGold,bottom:bGold}});

  // dropdowns
  ws.dataValidations.add(`B${HR+1}:B${incEnd+30}`, { type:'list', allowBlank:true, formulae:['"Booking,Shop,Other"'] });
  ws.dataValidations.add(`H${HR+1}:H${expEnd+30}`, { type:'list', allowBlank:true, formulae:['"Supplies,Marketing,Equipment,Rent,Misc"'] });

  // NET PROFIT
  const netR = Math.max(incTotR, expTotR) + 2;
  ws.getRow(netR).height = 30; ws.getRow(netR+1).height = 6;
  merge(ws,`A${netR}:F${netR}`,'NET PROFIT',{fill:C.charcoal,font:{bold:true,size:13,color:{argb:C.white}},align:{horizontal:'left',indent:1},border:box(bGold)});
  merge(ws,`G${netR}:J${netR}`,{formula:`D${incTotR}-J${expTotR}`},{fill:C.charcoal,numFmt:FMT.money,font:{bold:true,size:15,color:{argb:C.gold}},align:{horizontal:'right',indent:1},border:box(bGold)});
  ws.addConditionalFormatting({ ref:`G${netR}`, rules:[
    { type:'cellIs', operator:'greaterThan', formulae:['0'], priority:1, style:{ font:{color:{argb:C.green},bold:true,size:15}, fill:{type:'pattern',pattern:'solid',bgColor:{argb:'FF14361F'}} } },
    { type:'cellIs', operator:'lessThan', formulae:['0'], priority:2, style:{ font:{color:{argb:C.red},bold:true,size:15}, fill:{type:'pattern',pattern:'solid',bgColor:{argb:'FF3A1414'}} } },
  ]});

  // MONTHLY BREAKDOWN
  const mbTitle = netR+3;
  merge(ws,`A${mbTitle}:J${mbTitle}`,'MONTHLY BREAKDOWN',{fill:C.cream,font:{bold:true,size:11,color:{argb:C.charcoal}},align:{horizontal:'left',indent:1},border:{bottom:bGoldThin}});
  const mbHead = mbTitle+1;
  ['Month','Income','Expenses','Net'].forEach((h,i)=>{
    S(ws,`${colLetter(1+i)}${mbHead}`,h.toUpperCase(),{fill:C.charcoal,font:{bold:true,size:10,color:{argb:C.gold}},align:{horizontal:i===0?'left':'right',indent:1},border:{bottom:bGold}});
  });
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const incAmtR=`$D$${HR+1}:$D$${incEnd}`, incMonR=`$E$${HR+1}:$E$${incEnd}`;
  const expAmtR=`$J$${HR+1}:$J$${expEnd}`, expMonR=`$K$${HR+1}:$K$${expEnd}`;
  months.forEach((m,i)=>{
    const r = mbHead+1+i; const base=i%2?C.altLight:C.white;
    S(ws,`A${r}`,m,{fill:base,align:{horizontal:'left',indent:1},font:{bold:true,color:{argb:C.muted}},border:{bottom:bThin}});
    S(ws,`B${r}`,{formula:`SUMIFS(${incAmtR},${incMonR},${i+1})`},{fill:base,numFmt:FMT.money,align:{horizontal:'right',indent:1},font:{color:{argb:C.greenDeep}},border:{bottom:bThin}});
    S(ws,`C${r}`,{formula:`SUMIFS(${expAmtR},${expMonR},${i+1})`},{fill:base,numFmt:FMT.money,align:{horizontal:'right',indent:1},font:{color:{argb:C.redDeep}},border:{bottom:bThin}});
    S(ws,`D${r}`,{formula:`B${r}-C${r}`},{fill:base,numFmt:FMT.money,align:{horizontal:'right',indent:1},font:{bold:true},border:{bottom:bThin}});
    ws.getRow(r).height=18;
  });
  const mbEnd = mbHead+12;
  S(ws,`A${mbEnd+1}`,'YEAR TOTAL',{fill:C.charcoal,font:{bold:true,color:{argb:C.gold}},align:{horizontal:'left',indent:1},border:{top:bGold}});
  ['B','C','D'].forEach(col=> S(ws,`${col}${mbEnd+1}`,{formula:`SUM(${col}${mbHead+1}:${col}${mbEnd})`},{fill:C.charcoal,numFmt:FMT.money,font:{bold:true,color:{argb:C.gold}},align:{horizontal:'right',indent:1},border:{top:bGold}}));
  ws.addConditionalFormatting({ ref:`D${mbHead+1}:D${mbEnd}`, rules:[
    { type:'cellIs', operator:'lessThan', formulae:['0'], priority:1, style:{ font:{color:{argb:C.redDeep},bold:true} } },
  ]});

  protect(ws, `A${HR+1}:K${Math.max(expEnd,incEnd)+30}`);
}

/* protect helper — locks header band, frees the data region */
function protect(ws, unlockRange){
  try{
    if(unlockRange){ ws.unMergedCells; const cells = unlockRange; /* range protection set on cells already via unlock:true */ }
    ws.protect('zoblends', {
      selectLockedCells:true, selectUnlockedCells:true,
      formatCells:true, formatColumns:true, formatRows:true,
      sort:true, autoFilter:true, insertRows:true, deleteRows:true,
    });
  }catch(e){ /* non-fatal */ }
}

window.ZBA = { buildCover, buildBookings, buildFinance, kpiStat, protect };
})();
