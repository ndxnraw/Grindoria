const panelState = { key: null };
function uiNumber(value){return Number(value||0).toLocaleString('sk-SK');}
function requirementRow(name,have,need) {
  const enough=have>=need;
  return `<div class="requirement-row ${enough?'is-ready':'is-missing'}"><span>${escapeHTML(name)}</span><span><b>${uiNumber(have)}</b><small> / ${uiNumber(need)}</small></span><em>${enough?'✓ Splnené':'Chýba '+uiNumber(need-have)}</em></div>`;
}
function costRequirements(cost) {
  return '<div class="requirements"><div class="requirement-heading"><span>Požiadavka</span><span>Máš / Potrebuješ</span></div>'+Object.entries(cost).map(([id,n])=>requirementRow(id==='gold'?'Yang':MATERIALS[id],id==='gold'?p.gold:p.career.materials[id],n)).join('')+'</div>';
}
function modalFocusToken(){
  const a=document.activeElement;if(!a)return null;
  if(a.id)return {id:a.id};
  const attrs=['data-market-buy','data-market-sell','data-market-material','data-count','data-action','data-id','data-entry','data-forge-option','data-slot','data-career-tab'];
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
  $('attack').disabled=unavailable||isSanctuary(p);$('potion').disabled=unavailable||p.potions<1||p.hp>=maxHP()||potionCooldownRemaining()>0;
  $('bravery').disabled=unavailable||p.braveryCapes<1||capeCooldown>0||isSanctuary(p);$('inventory').disabled=!running;
}
