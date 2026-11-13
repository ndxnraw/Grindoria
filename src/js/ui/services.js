const npcSessions=new Map();
function npcServiceOpened(id){return npcSessions.get(id)===characterStore.activeId+':'+p.mapId;}
function smithMenu(){
 if(!running||!npcServiceOpened('smith')||!nearNPC('smith'))return false;
 modal('<h2>Kováč</h2><div class="smith-service-menu"><button id="smith-forge">'+itemIcon(serviceSupplyIcon('forgeCore'))+'<span>Vylepšovanie</span></button><button id="smith-craft">'+itemIcon(serviceSupplyIcon('ingot'))+'<span>Výroba</span></button></div>',{key:'npc:smith-menu'});
 $('smith-forge').onclick=()=>smithPanel('forge');$('smith-craft').onclick=()=>smithPanel('crafting');return true;
}
function smithPanel(service){
 if(!running||!npcServiceOpened('smith')||!['forge','crafting'].includes(service))return false;
 const key='npc:'+service,prior=gameWindows.get(key);if(!prior&&!nearNPC('smith'))return false;
 craftingFilter=prior?.craftingFilter||'all';
 modal((!nearNPC('smith')?'<p class="service-unavailable">Priblíž sa ku kováčovi.</p>':'')+(service==='forge'?forgeContent(prior?.forgeSlot,prior?.servicePage||0):craftingRecipesPanel(prior?.recipeSelected,prior?.servicePage||0))+'<p id="smith-message" role="status"></p>',{key,title:service==='forge'?'Vylepšovanie':'Výroba',refresh:()=>smithPanel(service)});
 const entry=activeGameWindow;
 panelQueryAll('[data-forge-select]').forEach(button=>button.onclick=()=>{entry.forgeSlot=button.dataset.forgeSelect;smithPanel(service);});
 panelQueryAll('[data-recipe-select]').forEach(button=>button.onclick=()=>{entry.recipeSelected=button.dataset.recipeSelect;smithPanel(service);});
 panelQueryAll('[data-service-page]').forEach(button=>button.onclick=()=>{entry.servicePage=Number(button.dataset.servicePage);smithPanel(service);});
 if($('craft-filter'))$('craft-filter').onchange=event=>{entry.craftingFilter=event.target.value;entry.recipeSelected=null;entry.servicePage=0;smithPanel(service);};
 panelQueryAll('[data-forge-option]').forEach(input=>input.onchange=()=>{(forgeOptions[input.dataset.slot]??={})[input.dataset.forgeOption]=input.checked;smithPanel(service);});
 panelQueryAll('[data-action]').forEach(button=>button.onclick=()=>{const action=button.dataset.action,id=button.dataset.id,ok=action==='enhance'?enhanceEquipment(id,forgeOptions[id]||{}):action==='recipe'?craftRecipe(id):false;smithPanel(service);$('smith-message').textContent=action==='enhance'?forgeResult?.message||'Vylepšenie nie je dostupné.':craftingMessage||'Výroba nie je dostupná.';return ok;});return true;
}
function forgeContent(selectedSlot,page=0) {
 const available=nearNPC('smith'),slots=Object.keys(EQUIPMENT),slot=Object.hasOwn(EQUIPMENT,selectedSlot)?selectedSlot:slots.find(id=>p.equipped[id])||'weapon',item=p.equipped[slot];
 const entries=slots.map(id=>({id,item:p.equipped[id]||{slot:id,name:EQUIPMENT[id].name,rarity:0},empty:!p.equipped[id],label:EQUIPMENT[id].name+(p.equipped[id]?' · '+p.equipped[id].name:' · prázdne'),badge:p.equipped[id]?'+'+(p.equipped[id].enhance||0):'—'}));
 let detail='<p class="service-empty">'+EQUIPMENT[slot].name+' · bez nasadeného predmetu.</p>';
 if(item){
  const rank=item.enhance||0,options=forgeOptions[slot]||{},cost=enhancementCost(item,options),stat=EQUIPMENT[slot].stat,scale=stat==='crit'?.01:1;
  detail='<h3>'+escapeHTML(item.name)+'</h3><div class="forge-preview"><span class="service-preview">'+itemIcon(item)+'<b>+'+rank+'</b></span><span aria-hidden="true">→</span><span class="service-preview">'+itemIcon({...item,enhance:Math.min(9,rank+1)})+'<b>+'+Math.min(9,rank+1)+'</b></span></div><p>'+ITEM_STATS[stat]+' z vylepšenia: '+signedItemStat(stat,enhancementBonus(item)*scale)+(cost?' → '+signedItemStat(stat,enhancementBonus({...item,enhance:rank+1})*scale):' · maximum')+'</p>';
  if(cost)detail+='<p class="forge-chance">Úspech <b>'+Math.round(forgeChance(item,options)*100)+' %</b></p>'+serviceCostTiles(cost)+'<div class="forge-options">'+[['charm','smithCharm','Talizman kováča','+10 p. b.',!p.career.materials.smithCharm&&!options.charm||FORGE_RULES.success[rank+1]>=.95],['protect','protectionScroll','Ochranný zvitok','Zachová predmet aj stupeň',!p.career.materials.protectionScroll&&!options.protect||rank<3]].map(([key,material,name,effect,disabled])=>'<label class="service-option" title="'+name+' · '+effect+'"><input type="checkbox" data-forge-option="'+key+'" data-slot="'+slot+'" aria-label="'+name+'" '+(options[key]?'checked ':'')+(disabled?'disabled':'')+'>'+itemIcon(serviceSupplyIcon(material))+'<span>'+name+'<small>'+uiNumber(p.career.materials[material])+' ks · '+effect+'</small></span></label>').join('')+'</div><p class="forge-risk">'+forgeFailureText(item,options)+'</p><button class="primary service-action" data-action="enhance" data-id="'+slot+'" '+(!available||!canPayRecipe(cost)?'disabled':'')+'>Vylepšiť na +'+(rank+1)+'</button>';
 }
 return '<section class="forge-workshop service-panel"><div class="service-layout"><div class="service-bag">'+serviceTileGrid(entries,slot,'forge-select',page)+'</div><section class="service-details">'+detail+'</section></div><div class="service-wallet">◉ <b>'+uiNumber(p.gold)+'</b> Yang</div></section>';
}

function careerSpecialization() {
  const spec = p.career.specialization;
  return `<p>Od úrovne 10 · trvalá voľba</p><p>Voľné body: <b>${spec.points}</b></p>${Object.entries(SPECIALIZATIONS).map(([id, focus]) => `<div class="career-card ${spec.focus === id ? 'completed' : ''}"><h3>${focus.name} ${spec.focus === id ? '· ' + spec.rank + ' / ' + PROGRESSION.maxSpecialization : ''}</h3><p>${focus.text}</p>${!spec.focus ? `<button class="primary" data-action="spec" data-id="${id}" ${p.level < 10 || spec.points < 3 ? 'disabled' : ''}>Zvoliť natrvalo · 3 body</button>` : spec.focus === id ? `<button class="primary" data-action="spectrain" ${spec.rank >= PROGRESSION.maxSpecialization || spec.points < spec.rank + 1 ? 'disabled' : ''}>Rozvinúť · ${spec.rank + 1} bodov</button>` : ''}</div>`).join('')}`;
}

function riftContent() {
  const end = p.career.endgame, run = end.run;
  return `<p>Úroveň 35 · 20 príšer · 1 boss</p>
    ${run ? `<div class="career-card"><h3>Aktívna trhlina · stupeň ${run.tier}</h3><p>Príšery ${Math.min(20, run.kills)} / 20 · boss ${Math.min(1, run.bosses)} / 1<br>Odmena: ${10 + run.tier * 3} úlomkov</p><button class="primary" data-action="claimRift" ${run.kills < 20 || run.bosses < 1 ? 'disabled' : ''}>Dokončiť a vyzdvihnúť odmenu</button><button class="secondary" data-action="abandon">Opustiť bez odmeny · kľúče sa nevrátia</button></div>` : `<div class="career-card"><h3>Ďalší stupeň ${Math.min(PROGRESSION.maxRiftTier, end.highest + 1)}</h3><p>Najvyšší dokončený: ${end.highest} · vstup mimo boja.</p>${costRequirements({keys:3})}<button class="primary" data-action="enter" ${p.level < 35 || p.career.materials.keys < 3 ? 'disabled' : ''}>Vstúpiť · 3 kľúče</button></div>`}
    `;
}

function riftPanel(){if(!running||!p.career.endgame.run&&(!npcServiceOpened('dungeonMaster')||!nearNPC('dungeonMaster')))return false;
 modal('<h2>Trhliny</h2>'+riftContent()+'<p id="rift-message" role="status"></p>',{key:p.career.endgame.run?'rift-run':'npc:rifts',refresh:riftPanel});
 panelQueryAll('[data-action]').forEach(button=>button.onclick=()=>{const actions={enter:enterRift,claimRift:()=>finishRift(true),abandon:()=>finishRift(false)};if(!actions[button.dataset.action]?.()&&$('rift-message'))$('rift-message').textContent='Vstup vyžaduje Dungeon Majstra, úroveň, kľúče a ukončený boj.';});return true;}
