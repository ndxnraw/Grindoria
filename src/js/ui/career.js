const forgeOptions={};
function costLabel(cost) {
  return Object.entries(cost).map(([id, n]) => n.toLocaleString('sk-SK') + ' ' + (id === 'gold' ? 'Yang' : MATERIALS[id])).join(' · ') || 'bez poplatku';
}

function careerOverview() {
  const c = p.career, b = careerBonuses();
  return `
    <div class="career-metrics"><div>Úroveň <b>${p.level} / ${PROGRESSION.maxLevel}</b><small>${p.xp.toLocaleString('sk-SK')} / ${needXP().toLocaleString('sk-SK')} EXP</small></div>
    <div>Výskum <b>${c.biology.stage} / ${BIOLOGY.length}</b></div>
    <div>Relikvie <b>${Object.values(c.collection).filter(Boolean).length} / 4</b></div>
    <div>Trhliny <b>${c.endgame.highest}</b><small>Najvyšší dokončený stupeň</small></div></div>
    <h3>Trvalé bonusy</h3><p>Útok +${b.attack} · obrana +${b.defense} · zdravie +${b.hp} · mana +${b.mp}<br>Sila kúziel +${b.magic} · kritický zásah +${Math.round(b.crit * 100)} % · útok +${Math.round(b.attackPercent * 100)} %</p>
    <h3>Materiály</h3><div class="material-grid">${Object.entries(MATERIALS).map(([id, name]) => `<div>${name}<b>${c.materials[id].toLocaleString('sk-SK')}</b></div>`).join('')}</div>
    <p>EXP: nepriateľ najviac o 7 úrovní slabší. Prax a bežné materiály: najviac o 5. Vzorky, relikvie a kľúče bez tohto obmedzenia.</p>`;
}

function careerTraining() {
  return `<p>Úroveň: +3 body vo Výbave (I). Tréning: zlato a pečate; pečať za každého 5. primeraného nepriateľa.</p>${Object.entries({ strength: 'Sila', vitality: 'Vitalita', dexterity: 'Obratnosť', intelligence: 'Inteligencia' }).map(([id, name]) => {
    const rank = p.career.training[id];
    return `<div class="career-card"><h3>${name} · ${p[id]}</h3><p>Tréning ${rank} / ${PROGRESSION.maxTraining} · +1 bod za tréning.<br></p>${costRequirements(trainingCost(id))}<button class="primary" data-action="train" data-id="${id}" ${rank >= PROGRESSION.maxTraining || !canPayRecipe(trainingCost(id)) ? 'disabled' : ''}>Trénovať ${name.toLowerCase()}</button></div>`;
  }).join('')}`;
}

function careerSkills() {
  return `<p>Prax: zásah schopnosťou alebo aktívna aura pri primeranom zabití, najviac raz za nepriateľa. Knihy: primerané Metiny a bossovia.</p>${school().skills.map((s, i) => {
    const key = skillKey(i), skill = skillProgress(key), rank = skill.rank;
    return `<div class="career-card"><h3>${s[0]} · ${rank >= 20 ? 'Veľmajster' : rank >= 10 ? 'Majster' : 'Stupeň'} ${rank}</h3><p>Prax ${skill.practice} / ${skillPracticeNeeded(rank)} · sila/trvanie +${Math.round((skillFactor(key) - 1) * 100)} % · cooldown − ${rank - 1} %<br>${s[6]}<br></p>${costRequirements(skillCost(key))}<button class="primary" data-action="skill" data-id="${key}" ${rank >= PROGRESSION.maxSkillRank || skill.practice < skillPracticeNeeded(rank) || !canPayRecipe(skillCost(key)) ? 'disabled' : ''}>Študovať schopnosť</button></div>`;
  }).join('')}`;
}

function careerBiology() {
  const bio = p.career.biology, stage = BIOLOGY[bio.stage];
  const waiting = Math.max(0, bio.nextKill - p.career.eligibleKills);
  return `<p>Biológ · Mesto. Vzorka: každý 4. bežný nepriateľ danej mapy. Medzi odovzdaniami: 10 primeraných zabití. Odmena je trvalá.</p>${BIOLOGY.map((b, i) => `<div class="career-card ${i < bio.stage ? 'completed' : ''}"><h3>${i < bio.stage ? '✓ ' : ''}${b.name}</h3><p>${MAPS[b.map].name} · úroveň ${b.level}+ · ${b.count} vzoriek<br>Trvalá odmena: ${b.text}</p>${i === bio.stage ? `<p>Odovzdané ${bio.delivered} / ${b.count} · v zásobe ${p.career.materials[b.item]}<br>${waiting ? 'Ďalšie odovzdanie: ešte ' + waiting + ' primeraných zabití' : 'Možno odovzdať.'}</p>${costRequirements({[b.item]:1,gold:25*(i+1)})}<button class="primary" data-action="bio" ${p.level < b.level || waiting || p.career.materials[b.item] < 1 || p.gold<25*(i+1) || !nearNPC('biologist') ? 'disabled' : ''}>Odovzdať vzorku</button>` : i > bio.stage ? '<small>Vyžaduje predchádzajúci výskum.</small>' : ''}</div>`).join('')}${!stage ? '<p>Výskum dokončený.</p>' : ''}`;
}

function careerForge() {
 const available=nearNPC('smith');
 return '<p>Kováč · Mesto. Materiály a Yang sa spotrebujú pri každom pokuse.</p>'+Object.keys(EQUIPMENT).map(slot=>{
  const item=p.equipped[slot];if(!item)return '<div class="career-card"><h3>'+EQUIPMENT[slot].name+'</h3><p>Bez nasadeného predmetu.</p></div>';
  const rank=item.enhance||0,options=forgeOptions[slot]||{},cost=enhancementCost(item,options);
  return '<div class="career-card"><h3>'+escapeHTML(item.name)+' +'+rank+'</h3><p>'+ITEM_STATS[EQUIPMENT[slot].stat]+' z vylepšenia: '+signedItemStat(EQUIPMENT[slot].stat,enhancementBonus(item)*(EQUIPMENT[slot].stat==='crit'?.01:1))+(rank<9?' → '+signedItemStat(EQUIPMENT[slot].stat,FORGE_RULES.bonus[rank+1]*(EQUIPMENT[slot].stat==='crit'?.01:1)):' · maximum')+'</p>'+(cost?'<p>Úspech '+Math.round(forgeChance(item,options)*100)+' % · '+'</p>'+costRequirements(cost)+'<p>'+forgeFailureText(item,options)+'</p><label><input type="checkbox" data-forge-option="charm" data-slot="'+slot+'" '+(options.charm?'checked ':'')+(!p.career.materials.smithCharm||FORGE_RULES.success[rank+1]>=.95?'disabled':'')+'> Talizman kováča: +10 percentuálnych bodov · '+p.career.materials.smithCharm+' ks</label><br><label><input type="checkbox" data-forge-option="protect" data-slot="'+slot+'" '+(options.protect?'checked ':'')+(!p.career.materials.protectionScroll||rank<3?'disabled':'')+'> Ochranný zvitok: zachová predmet aj stupeň · '+p.career.materials.protectionScroll+' ks</label><br><button class="primary" data-action="enhance" data-id="'+slot+'" '+(!available||!canPayRecipe(cost)?'disabled':'')+'>Vylepšiť na +'+(rank+1)+'</button>':'')+'</div>';
 }).join('')+'<button data-career-tab="crafting">Výroba predmetov a pomôcok</button>'+'<p>Kováčske jadro / talizman / zvitok: boss Lv.35+ 50 % / 15 % / 6 %, Metin Lv.35+ 8 % / 4 % / 1,5 %, vzácny nepriateľ Lv.35+ 15 % / 5 % / 1 %. Vyžaduje primeraný cieľ.</p>';
}

function careerAlchemy() {
  const alchemy = p.career.alchemy;
  return `<p>Všetky 3 kamene môžu byť aktívne. Prvé nasadenie bez poplatku; fúzia spotrebuje uvedené kamene a materiály.</p>${Object.entries(GEMS).map(([id, gem]) => {
    const rank = alchemy.equipped[id], stones = rank ? 2 ** rank : 1;
    return `<div class="career-card"><h3 style="color:${gem.color}">${gem.name} · stupeň ${rank} / ${PROGRESSION.maxGemRank}</h3><p>${gem.text}<br>Zásoba: ${alchemy.stock[id]}</p><p>${rank ? 'Fúzia' : 'Nasadenie'}</p>${requirementRow(gem.name,alchemy.stock[id],stones)}${rank?costRequirements({dust:5*rank,gold:100*rank*rank}):''}<button class="primary" data-action="gem" data-id="${id}" ${rank >= PROGRESSION.maxGemRank || alchemy.stock[id] < stones || rank>0&&!canPayRecipe({dust:5*rank,gold:100*rank*rank}) ? 'disabled' : ''}>${rank ? 'Zvýšiť stupeň' : 'Nasadiť kameň'}</button></div>`;
  }).join('')}`;
}

function careerCollection() {
  return `<p>Boss: 8 % šanca na relikviu, najneskôr 10. zabitie od posledného dropu. Prvý kus dá trvalý bonus, ďalší +10 prachu.</p>${Object.entries(RELICS).map(([id, r]) => `<div class="career-card ${p.career.collection[id] ? 'completed' : ''}"><h3>${p.career.collection[id] ? '✓ ' : '◇ '}${r.name}</h3><p>${MAPS[id].boss} · ${MAPS[id].name}<br>Bonus: ${r.text}<br>Zaručený drop: ${p.career.relicPity[id] || 0} / 10</p></div>`).join('')}<p>Set 2 relikvií: +2 obrana. Set všetkých 4: navyše +8 útok a +15 zdravie.</p>`;
}

function careerSpecialization() {
  const spec = p.career.specialization;
  return `<p>Vyžaduje úroveň 10. Body: primeraní bossovia a každé 3 vylepšenia schopností. Voľba je trvalá; 3 body zahŕňajú prvý stupeň.</p><p>Voľné body: <b>${spec.points}</b></p>${Object.entries(SPECIALIZATIONS).map(([id, focus]) => `<div class="career-card ${spec.focus === id ? 'completed' : ''}"><h3>${focus.name} ${spec.focus === id ? '· ' + spec.rank + ' / ' + PROGRESSION.maxSpecialization : ''}</h3><p>${focus.text}</p>${!spec.focus ? `<button class="primary" data-action="spec" data-id="${id}" ${p.level < 10 || spec.points < 3 ? 'disabled' : ''}>Zvoliť natrvalo · 3 body</button>` : spec.focus === id ? `<button class="primary" data-action="spectrain" ${spec.rank >= PROGRESSION.maxSpecialization || spec.points < spec.rank + 1 ? 'disabled' : ''}>Rozvinúť · ${spec.rank + 1} bodov</button>` : ''}</div>`).join('')}`;
}

function careerEndgame() {
  const end = p.career.endgame, run = end.run;
  return `<p>Vyžaduje úroveň 35 a 3 kľúče. Cieľ: 20 príšer a 1 boss. Kľúč: každý 3. boss. Vyšší stupeň zvyšuje silu nepriateľov aj odmenu.</p>
    ${run ? `<div class="career-card"><h3>Aktívna trhlina · stupeň ${run.tier}</h3><p>Príšery ${Math.min(20, run.kills)} / 20 · boss ${Math.min(1, run.bosses)} / 1<br>Odmena: ${10 + run.tier * 3} úlomkov</p><button class="primary" data-action="claimRift" ${run.kills < 20 || run.bosses < 1 ? 'disabled' : ''}>Dokončiť a vyzdvihnúť odmenu</button><button class="secondary" data-action="abandon">Opustiť bez odmeny · kľúče sa nevrátia</button></div>` : `<div class="career-card"><h3>Ďalší stupeň ${Math.min(PROGRESSION.maxRiftTier, end.highest + 1)}</h3><p>Najvyšší dokončený: ${end.highest} · vstup mimo boja.</p>${costRequirements({keys:3})}<button class="primary" data-action="enter" ${p.level < 35 || p.career.materials.keys < 3 ? 'disabled' : ''}>Vstúpiť · 3 kľúče</button></div>`}
    <div class="career-card"><h3>Relikviár · ${end.paragon} / ${PROGRESSION.maxParagon}</h3><p>Trvalý bonus: +${end.paragon * 2} útok a +${end.paragon * 5} zdravie.</p>${costRequirements({shards:25*(end.paragon+1)**2})}<button class="primary" data-action="paragon" ${p.level < 35 || end.paragon >= PROGRESSION.maxParagon || !canPayRecipe({shards:25*(end.paragon+1)**2}) ? 'disabled' : ''}>Posilniť relikviár</button></div>`;
}

function careerPanel(tab = careerTab) {
  if (!running) return;
  const tabs = {
    discovery: ['Bestiár a zbierky', discoveryPanel], overview: ['Prehľad', careerOverview], training: ['Atribúty', careerTraining],
    skills: ['Schopnosti', careerSkills], biology: ['Biológ', careerBiology],
    forge: ['Vylepšovanie', careerForge], crafting: ['Výroba', () => craftingRecipesPanel('crafting')], alchemy: ['Alchýmia', () => craftingRecipesPanel('alchemy') + careerAlchemy()],
    collection: ['Relikvie', careerCollection], specialization: ['Špecializácia', careerSpecialization],
    dungeons: ['Dungeony', dungeonContent], endgame: ['Endgame', careerEndgame]
  };
  if(tab!==careerTab)craftingFilter='all';
  careerTab = tabs[tab] ? tab : 'overview';
  modal(`<span class="eyebrow">PROGRESIA · P</span><h2>Progresia</h2><nav class="career-tabs" aria-label="Systémy progresie">${Object.entries(tabs).map(([id, [name]]) => `<button data-career-tab="${id}" aria-pressed="${careerTab === id}">${name}</button>`).join('')}</nav><div class="career-body">${careerTab==='alchemy'?'<button id="alchemy-market">Obchod alchymistu</button>':''}${tabs[careerTab][1]()}</div><p id="career-message" role="status"></p>`,{key:'career:'+careerTab});
  document.querySelectorAll('[data-career-tab]').forEach(button => button.onclick = () => careerPanel(button.dataset.careerTab));
  if($('craft-filter')) $('craft-filter').onchange=event=>{craftingFilter=event.target.value;careerPanel(careerTab);};
  if(careerTab==='alchemy')$('alchemy-market').onclick=()=>marketPanel('alchemist');
  bindDungeonActions();
  if(careerTab==='discovery')bindDiscoveryUI();
  const actions = {
    train: id => trainAttribute(id), skill: id => upgradeSkill(id), bio: completeBiology,
    recipe: craftRecipe, product: id => useAlchemyProduct(id, true), enhance: id => enhanceEquipment(id,forgeOptions[id]||{}), forgeSupport: craftForgeSupport, craft: id => craftGem(id), gem: id => upgradeGem(id),
    spec: id => specialize(id), spectrain: trainSpecialization, enter: enterRift,
    claimRift: () => finishRift(true), abandon: () => finishRift(false), paragon: upgradeParagon
  };
  document.querySelectorAll('[data-forge-option]').forEach(input=>input.onchange=()=>{(forgeOptions[input.dataset.slot]??={})[input.dataset.forgeOption]=input.checked;careerPanel('forge');});
  document.querySelectorAll('[data-action]').forEach(button => button.onclick = () => {
    if (actions[button.dataset.action]?.(button.dataset.id)) {
      updateClassHUD(); updateHUD(); careerPanel(careerTab);
      $('career-message').textContent = button.dataset.action==='enhance'?forgeResult.message:characterStore.writeError|| (button.dataset.action==='recipe'?craftingMessage:'Uložené.');
    } else if(button.dataset.action==='recipe') $('career-message').textContent=craftingMessage;
    else $('career-message').textContent = 'Nesplnené podmienky: skontroluj cenu, úroveň a prax. Vstup do trhliny vyžaduje ukončený boj.';
  });
}

