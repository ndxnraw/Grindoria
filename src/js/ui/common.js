const panelState = { key: null };
function uiNumber(value){return Number(value||0).toLocaleString('sk-SK');}
function requirementRow(name,have,need) {
  const enough=have>=need;
  return `<div class="requirement-row ${enough?'is-ready':'is-missing'}"><span>${escapeHTML(name)}</span><span><b>${uiNumber(have)}</b><small> / ${uiNumber(need)}</small></span><em>${enough?'✓ Splnené':'Chýba '+uiNumber(need-have)}</em></div>`;
}
function costRequirements(cost) {
  return '<div class="requirements"><div class="requirement-heading"><span>Požiadavka</span><span>Máš / Potrebuješ</span></div>'+Object.entries(cost).map(([id,n])=>requirementRow(id==='gold'?'Yang':MATERIALS[id],id==='gold'?p.gold:p.career.materials[id],n)).join('')+'</div>';
}
function serviceSupplyIcon(id){return {icon:id==='potions'?'potion':id==='braveryCapes'?'cape':id.replace(/^material:/,''),rarity:0};}
function serviceCostTiles(cost){
 return '<div class="service-cost-grid" role="group" aria-label="Potrebné suroviny">'+Object.entries(cost).map(([id,need])=>{
  const name=id==='gold'?'Yang':MATERIALS[id],have=id==='gold'?p.gold:p.career.materials[id],ready=have>=need,status=ready?'Splnené':'Chýba '+uiNumber(need-have);
  return '<div class="service-cost '+(ready?'is-ready':'is-missing')+'" title="'+escapeHTML(name+' · '+uiNumber(have)+' / '+uiNumber(need)+' · '+status)+'" aria-label="'+escapeHTML(name+' · '+uiNumber(have)+' / '+uiNumber(need)+' · '+status)+'">'+(id==='gold'?'<span class="service-coin" aria-hidden="true">◉</span>':itemIcon(serviceSupplyIcon(id)))+'<small>'+escapeHTML(name)+'</small><b>'+uiNumber(have)+' <span>/ '+uiNumber(need)+'</span></b></div>';
 }).join('')+'</div>';
}
function serviceTileGrid(entries,selected,attribute,page=0,compact=false){
 const wrappers=entries.map(entry=>({slot:entry.item?.slot,entry}));let pages=1,layout=gearLayout(wrappers,pages,false);
 while(!layout){pages++;layout=gearLayout(wrappers,pages,false);}
 page=Math.max(0,Math.min(pages-1,Math.floor(Number(page)||0)));
 const visible=wrappers.filter(w=>Math.floor(layout.get(w)/INVENTORY.pageSize)===page),rows=compact?Math.max(3,...visible.map(w=>Math.floor((layout.get(w)%INVENTORY.pageSize)/5)+itemSize(w)[1])):INVENTORY.rows;
 const cells=Array.from({length:rows*INVENTORY.columns},(_,i)=>'<span class="service-cell" aria-hidden="true" style="grid-column:'+(i%5+1)+';grid-row:'+(Math.floor(i/5)+1)+'"></span>').join('');
 return '<div class="service-grid" role="group" aria-label="Predmety" style="--service-rows:'+rows+'">'+cells+visible.map(w=>{
  const entry=w.entry,cell=layout.get(w)%INVENTORY.pageSize,[width,height]=itemSize(w),label=entry.label||entry.item.name;
  return '<button type="button" class="service-tile'+(entry.blocked?' is-locked':'')+'" data-'+attribute+'="'+escapeHTML(String(entry.id))+'" aria-label="'+escapeHTML(label)+'" title="'+escapeHTML(label+(entry.meta?' · '+entry.meta:''))+'" aria-pressed="'+(String(entry.id)===String(selected))+'" style="grid-column:'+(cell%5+1)+' / span '+width+';grid-row:'+(Math.floor(cell/5)+1)+' / span '+height+'">'+itemIcon(entry.item,entry.empty===true)+(entry.badge!==undefined?'<b class="service-tile-count">'+escapeHTML(String(entry.badge))+'</b>':'')+(entry.blocked?'<span class="service-lock" aria-hidden="true">!</span>':'')+'</button>';
 }).join('')+'</div>'+(pages>1?'<div class="service-pages" aria-label="Strany">'+Array.from({length:pages},(_,i)=>'<button type="button" data-service-page="'+i+'" aria-pressed="'+(i===page)+'">'+(i+1)+'</button>').join('')+'</div>':'');
}
function serviceItemDetails(item){return '<p class="service-type">'+'<span class="'+(p.level<requiredItemLevel(item)?'stat-loss':'')+'">Požadovaná úroveň '+requiredItemLevel(item)+'</span></p>'+itemBonusText(item);}
function modalFocusToken(){
  const a=document.activeElement;if(!a)return null;
  if(a.id)return {id:a.id};
  const attrs=['data-market-buy','data-market-sell','data-market-material','data-count','data-action','data-id','data-entry','data-forge-option','data-slot','data-career-tab','data-market-select','data-market-mode','data-forge-select','data-recipe-select','data-service-page'];
  const values=attrs.filter(key=>a.hasAttribute?.(key)).map(key=>[key,a.getAttribute(key)]);
  return values.length?{values}:null;
}
function restoreModalFocus(token){
  if(!token)return;
  const element=token.id?$(token.id):Array.from(panelQueryAll('button, input')).find(el=>token.values.every(([key,value])=>el.getAttribute(key)===value));
  if(element&&!element.disabled)element.focus({preventScroll:true});
}
function setPanelFeedback(id,message){const el=$(id);if(el)el.textContent=message;}
function updateHotbarState(){
  const unavailable=!running||paused||p.hp<=0;
  for(let i=0;i<6;i++){
    const button=$(i?'skill'+(i+1):'skill'),skill=school().skills[i],cooldown=spellCD[i];
    const reason=unavailable?'Hra je pozastavená':cooldown>0?'Obnova '+Math.ceil(cooldown)+' s':p.mp<skill[3]?'Chýba '+Math.ceil(skill[3]-p.mp)+' many':isSanctuary(p)&&!SUPPORT_SKILLS.has(skill[1])?'Mimo bezpečnej zóny':'';
    button.disabled=!!reason;button.title=skill[0]+' · '+skill[3]+' many · '+(reason||'Pripravené');button.setAttribute('aria-label',button.title);
  }
  $('attack').disabled=unavailable||isSanctuary(p);$('potion').disabled=unavailable||p.potions<1||p.hp>=maxHP();
  $('bravery').disabled=unavailable||p.braveryCapes<1||capeCooldown>0||isSanctuary(p);$('inventory').disabled=!running;
}
