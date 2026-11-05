const npcSessions=new Map();
function npcServiceOpened(id){return npcSessions.get(id)===characterStore.activeId+':'+p.mapId;}
function smithMenu(){
 if(!running||!npcServiceOpened('smith')||!nearNPC('smith'))return false;
 modal('<h2>Kováč</h2><div class="system-menu-list"><button id="smith-forge">Vylepšovanie</button><button id="smith-craft">Výroba</button></div>',{key:'npc:smith-menu'});
 $('smith-forge').onclick=()=>smithPanel('forge');$('smith-craft').onclick=()=>smithPanel('crafting');return true;
}
function smithPanel(service){
 if(!running||!npcServiceOpened('smith')||!['forge','crafting'].includes(service))return false;
 const key='npc:'+service,prior=gameWindows.get(key);if(!prior&&!nearNPC('smith'))return false;
 craftingFilter=prior?.craftingFilter||'all';
 modal('<h2>'+(service==='forge'?'Vylepšovanie':'Výroba')+'</h2>'+(!nearNPC('smith')?'<p class="service-unavailable">Priblíž sa ku kováčovi.</p>':'')+(service==='forge'?forgeContent():craftingRecipesPanel())+'<p id="smith-message" role="status"></p>',{key,refresh:()=>smithPanel(service)});
 if($('craft-filter'))$('craft-filter').onchange=event=>{activeGameWindow.craftingFilter=event.target.value;smithPanel(service);};
 panelQueryAll('[data-forge-option]').forEach(input=>input.onchange=()=>{(forgeOptions[input.dataset.slot]??={})[input.dataset.forgeOption]=input.checked;smithPanel(service);});
 panelQueryAll('[data-action]').forEach(button=>button.onclick=()=>{const action=button.dataset.action,id=button.dataset.id,ok=action==='enhance'?enhanceEquipment(id,forgeOptions[id]||{}):action==='recipe'?craftRecipe(id):false;smithPanel(service);$('smith-message').textContent=action==='enhance'?forgeResult?.message||'Vylepšenie nie je dostupné.':craftingMessage||'Výroba nie je dostupná.';return ok;});return true;
}
function forgeContent() {
 const available=nearNPC('smith');
 return ''+Object.keys(EQUIPMENT).map(slot=>{
  const item=p.equipped[slot];if(!item)return '<div class="career-card"><h3>'+EQUIPMENT[slot].name+'</h3><p>Bez nasadeného predmetu.</p></div>';
  const rank=item.enhance||0,options=forgeOptions[slot]||{},cost=enhancementCost(item,options);
  return '<div class="career-card"><h3>'+escapeHTML(item.name)+' +'+rank+'</h3><p>'+ITEM_STATS[EQUIPMENT[slot].stat]+' z vylepšenia: '+signedItemStat(EQUIPMENT[slot].stat,enhancementBonus(item)*(EQUIPMENT[slot].stat==='crit'?.01:1))+(rank<9?' → '+signedItemStat(EQUIPMENT[slot].stat,enhancementBonus({...item,enhance:rank+1})*(EQUIPMENT[slot].stat==='crit'?.01:1)):' · maximum')+'</p>'+(cost?'<p>Úspech '+Math.round(forgeChance(item,options)*100)+' % · '+'</p>'+costRequirements(cost)+'<p>'+forgeFailureText(item,options)+'</p><label><input type="checkbox" data-forge-option="charm" data-slot="'+slot+'" '+(options.charm?'checked ':'')+(!p.career.materials.smithCharm||FORGE_RULES.success[rank+1]>=.95?'disabled':'')+'> Talizman kováča: +10 percentuálnych bodov · '+p.career.materials.smithCharm+' ks</label><br><label><input type="checkbox" data-forge-option="protect" data-slot="'+slot+'" '+(options.protect?'checked ':'')+(!p.career.materials.protectionScroll||rank<3?'disabled':'')+'> Ochranný zvitok: zachová predmet aj stupeň · '+p.career.materials.protectionScroll+' ks</label><br><button class="primary" data-action="enhance" data-id="'+slot+'" '+(!available||!canPayRecipe(cost)?'disabled':'')+'>Vylepšiť na +'+(rank+1)+'</button>':'')+'</div>';
 }).join('')+'';
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
