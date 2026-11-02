function costLabel(cost) {
  return Object.entries(cost).map(([id, n]) => n.toLocaleString('sk-SK') + ' ' + (id === 'gold' ? 'zlata' : MATERIALS[id])).join(' · ') || 'bez poplatku';
}

function careerOverview() {
  const c = p.career, b = careerBonuses();
  return `<p>Level je len jedna cesta. Každé zlepšenie nižšie má vlastný zdroj a trvalý prínos.</p>
    <div class="career-metrics"><div>Úroveň <b>${p.level} / ${PROGRESSION.maxLevel}</b><small>${p.xp.toLocaleString('sk-SK')} / ${needXP().toLocaleString('sk-SK')} EXP</small></div>
    <div>Výskum <b>${c.biology.stage} / ${BIOLOGY.length}</b><small>Permanentné biologické bonusy</small></div>
    <div>Relikvie <b>${Object.values(c.collection).filter(Boolean).length} / 4</b><small>Vzácna zbierka a setové bonusy</small></div>
    <div>Trhliny <b>${c.endgame.highest}</b><small>Najvyšší dokončený stupeň</small></div></div>
    <h3>Bonusy mimo levelu a výbavy</h3><p>Útok +${b.attack} · obrana +${b.defense} · zdravie +${b.hp} · mana +${b.mp}<br>Sila kúziel +${b.magic} · kritický zásah +${Math.round(b.crit * 100)} % · útok +${Math.round(b.attackPercent * 100)} %</p>
    <h3>Materiály</h3><div class="material-grid">${Object.entries(MATERIALS).map(([id, name]) => `<div>${name}<b>${c.materials[id].toLocaleString('sk-SK')}</b></div>`).join('')}</div>
    <p>EXP rastie s úrovňou a typom nepriateľa. Ciele o 8 a viac úrovní slabšie už EXP nedávajú; prax a bežné rozvojové materiály vyžadujú cieľ najviac o 5 úrovní slabší. Biologické vzorky, relikvie a kľúče zostávajú dostupné aj pri návrate do starších máp.</p>`;
}

function careerTraining() {
  return `<p>Za level dostávaš 3 voľné body vo výbave (I). Samostatný tréning používa pečate z každého piateho primeraného zabitia a zlato; nespotrebúva levelové body.</p>${Object.entries({ strength: 'Sila', vitality: 'Vitalita', dexterity: 'Obratnosť', intelligence: 'Inteligencia' }).map(([id, name]) => {
    const rank = p.career.training[id];
    return `<div class="career-card"><h3>${name} · ${p[id]}</h3><p>Tréning ${rank} / ${PROGRESSION.maxTraining} · ďalší tréning pridá 1 bod atribútu.<br>${costLabel(trainingCost(id))}</p><button class="primary" data-action="train" data-id="${id}" ${rank >= PROGRESSION.maxTraining ? 'disabled' : ''}>Trénovať ${name.toLowerCase()}</button></div>`;
  }).join('')}`;
}

function careerSkills() {
  return `<p>${role().name} · ${school().name}. Prax získaš za primeraných protivníkov, ktorých zasiahne daná schopnosť, alebo pri aktívnej aure. Opakované zásahy či kúzlenie naprázdno nepridávajú ďalšiu prax za toho istého nepriateľa. Knihy padajú z primeraných kameňov a bossov.</p>${school().skills.map((s, i) => {
    const key = skillKey(i), skill = skillProgress(key), rank = skill.rank;
    return `<div class="career-card"><h3>${s[0]} · ${rank >= 20 ? 'Veľmajster' : rank >= 10 ? 'Majster' : 'Stupeň'} ${rank}</h3><p>Prax ${skill.practice} / ${skillPracticeNeeded(rank)} · sila kúzla alebo trvanie aury +${Math.round((skillFactor(key) - 1) * 100)} % · obnova kratšia o ${rank - 1} %<br>${s[6]}<br>${costLabel(skillCost(key))}</p><button class="primary" data-action="skill" data-id="${key}" ${rank >= PROGRESSION.maxSkillRank || skill.practice < skillPracticeNeeded(rank) ? 'disabled' : ''}>Študovať schopnosť</button></div>`;
  }).join('')}`;
}

function careerBiology() {
  const bio = p.career.biology, stage = BIOLOGY[bio.stage];
  const waiting = Math.max(0, bio.nextKill - p.career.eligibleKills);
  return `<p>Biológ v útočisku skúma jednu vzorku naraz. Medzi odovzdaniami musíš poraziť 10 primeraných protivníkov. Vzorka pochádza z každého štvrtého bežného nepriateľa príslušnej mapy. Bonus za dokončený výskum zostáva natrvalo.</p>${BIOLOGY.map((b, i) => `<div class="career-card ${i < bio.stage ? 'completed' : ''}"><h3>${i < bio.stage ? '✓ ' : ''}${b.name}</h3><p>${MAPS[b.map].name} · úroveň ${b.level}+ · ${b.count} vzoriek<br>Trvalá odmena: ${b.text}</p>${i === bio.stage ? `<p>Odovzdané ${bio.delivered} / ${b.count} · v zásobe ${p.career.materials[b.item]}<br>${waiting ? 'Pred ďalším odovzdaním poraz ešte ' + waiting + ' primeraných protivníkov.' : 'Biológ je pripravený na ďalšiu vzorku.'}<br>Odovzdanie: 1 ${MATERIALS[b.item]} a ${25 * (i + 1)} zlata</p><button class="primary" data-action="bio" ${p.level < b.level || waiting || p.career.materials[b.item] < 1 ? 'disabled' : ''}>Odovzdať vzorku</button>` : i > bio.stage ? '<small>Najprv dokonči predchádzajúci výskum.</small>' : ''}</div>`).join('')}${!stage ? '<p>Všetky biologické výskumy dokončené.</p>' : ''}`;
}

function careerForge() {
  return `<p>Vylepšenie patrí konkrétnemu predmetu a zostáva na ňom pri výmene. Maximálne +9. Kováč pracuje spoľahlivo; cena rudy a zlata rastie s druhou mocninou stupňa. Ruda pochádza z každého piateho primeraného zabitia.</p>${['weapon', 'armor'].map(slot => {
    const item = p.equipped[slot];
    return `<div class="career-card"><h3>${slot === 'weapon' ? 'Zbraň' : 'Zbroj'}</h3>${item ? `<p>${escapeHTML(item.name)} +${item.enhance || 0}<br>Základný bonus ${item.bonus}; vylepšenie +${(item.enhance || 0) * 3} ${slot === 'weapon' ? 'útok' : 'obrana'}<br>Ďalší stupeň: ${costLabel(enhancementCost(item))}</p><button class="primary" data-action="enhance" data-id="${slot}" ${(item.enhance || 0) >= PROGRESSION.maxEnhancement ? 'disabled' : ''}>Vylepšiť predmet</button>` : '<p>Najprv nasaď predmet vo výbave (I).</p>'}</div>`;
  }).join('')}`;
}

function careerAlchemy() {
  const alchemy = p.career.alchemy;
  return `<p>Vyrob alchymistické kamene z esencie a rudy. Prvý kameň nasadíš zdarma; ďalšie stupne spotrebujú rastúci počet základných kameňov, prach a zlato. Všetky tri sloty môžu byť aktívne súčasne.</p>${Object.entries(GEMS).map(([id, gem]) => {
    const rank = alchemy.equipped[id], stones = rank ? 2 ** rank : 1;
    return `<div class="career-card"><h3 style="color:${gem.color}">${gem.name} · stupeň ${rank} / ${PROGRESSION.maxGemRank}</h3><p>${gem.text}<br>Základné kamene v zásobe: ${alchemy.stock[id]}</p><button class="primary" data-action="craft" data-id="${id}">Vyrobiť · ${costLabel({ essence: 30, ore: 3, gold: 100 })}</button><p>${rank ? 'Fúzia' : 'Nasadenie'}: ${stones} kameňov${rank ? ' · ' + costLabel({ dust: 5 * rank, gold: 100 * rank * rank }) : ''}</p><button class="primary" data-action="gem" data-id="${id}" ${rank >= PROGRESSION.maxGemRank || alchemy.stock[id] < stones ? 'disabled' : ''}>${rank ? 'Zvýšiť stupeň' : 'Nasadiť kameň'}</button></div>`;
  }).join('')}`;
}

function careerCollection() {
  return `<p>Každý boss má 8 % šancu na relikviu svojej mapy. Ak nepadne skôr, desiaty boss od posledného dropu ju zaručí. Prvý exemplár aktivuje trvalý bonus; ďalší sa premení na 10 alchymistického prachu.</p>${Object.entries(RELICS).map(([id, r]) => `<div class="career-card ${p.career.collection[id] ? 'completed' : ''}"><h3>${p.career.collection[id] ? '✓ ' : '◇ '}${r.name}</h3><p>${MAPS[id].boss} · ${MAPS[id].name}<br>Bonus: ${r.text}<br>Postup k zaručenému dropu: ${p.career.relicPity[id] || 0} / 10</p></div>`).join('')}<p>Set 2 relikvií: +2 obrana. Set všetkých 4: navyše +8 útok a +15 zdravie.</p>`;
}

function careerSpecialization() {
  const spec = p.career.specialization;
  return `<p>Od úrovne 10 môžeš zvoliť trvalú špecializáciu. Body získaš za primeraných bossov a za každé tri vylepšenia schopností. Voľba stojí 3 body a dáva prvý stupeň; ďalšie stupne stoja 2, 3, … bodov.</p><p>Voľné body: <b>${spec.points}</b></p>${Object.entries(SPECIALIZATIONS).map(([id, focus]) => `<div class="career-card ${spec.focus === id ? 'completed' : ''}"><h3>${focus.name} ${spec.focus === id ? '· ' + spec.rank + ' / ' + PROGRESSION.maxSpecialization : ''}</h3><p>${focus.text}</p>${!spec.focus ? `<button class="primary" data-action="spec" data-id="${id}" ${p.level < 10 || spec.points < 3 ? 'disabled' : ''}>Zvoliť natrvalo · 3 body</button>` : spec.focus === id ? `<button class="primary" data-action="spectrain" ${spec.rank >= PROGRESSION.maxSpecialization || spec.points < spec.rank + 1 ? 'disabled' : ''}>Rozvinúť · ${spec.rank + 1} bodov</button>` : ''}</div>`).join('')}`;
}

function careerEndgame() {
  const end = p.career.endgame, run = end.run;
  return `<p>Trhliny sa otvárajú od úrovne 35. Každá expedícia stojí 3 kľúče a vyžaduje 20 bežných protivníkov a jedného bossa. Každý tretí boss zanechá kľúč, aj pri návrate do staršej mapy. Vyšší stupeň trhliny má silnejších nepriateľov a viac úlomkov.</p>
    ${run ? `<div class="career-card"><h3>Aktívna trhlina · stupeň ${run.tier}</h3><p>Príšery ${Math.min(20, run.kills)} / 20 · boss ${Math.min(1, run.bosses)} / 1<br>Odmena: ${10 + run.tier * 3} úlomkov</p><button class="primary" data-action="claimRift" ${run.kills < 20 || run.bosses < 1 ? 'disabled' : ''}>Dokončiť a vyzdvihnúť odmenu</button><button class="secondary" data-action="abandon">Opustiť bez odmeny · kľúče sa nevrátia</button></div>` : `<div class="career-card"><h3>Ďalší stupeň ${Math.min(PROGRESSION.maxRiftTier, end.highest + 1)}</h3><p>Najvyšší dokončený: ${end.highest} · kľúče: ${p.career.materials.keys}<br>Vstup iba z útočiska.</p><button class="primary" data-action="enter" ${p.level < 35 || p.career.materials.keys < 3 ? 'disabled' : ''}>Vstúpiť · 3 kľúče</button></div>`}
    <div class="career-card"><h3>Relikviár · ${end.paragon} / ${PROGRESSION.maxParagon}</h3><p>Trvalý bonus: +${end.paragon * 2} útok a +${end.paragon * 5} zdravie.<br>Ďalší stupeň: ${25 * (end.paragon + 1) ** 2} úlomkov. Zásoba: ${p.career.materials.shards}</p><button class="primary" data-action="paragon" ${p.level < 35 || end.paragon >= PROGRESSION.maxParagon ? 'disabled' : ''}>Posilniť relikviár</button></div>`;
}

function careerPanel(tab = careerTab) {
  if (!running) return;
  const tabs = {
    overview: ['Prehľad', careerOverview], training: ['Atribúty', careerTraining],
    skills: ['Schopnosti', careerSkills], biology: ['Biológ', careerBiology],
    forge: ['Vybavenie', careerForge], alchemy: ['Alchýmia', careerAlchemy],
    collection: ['Relikvie', careerCollection], specialization: ['Špecializácia', careerSpecialization],
    endgame: ['Endgame', careerEndgame]
  };
  careerTab = tabs[tab] ? tab : 'overview';
  modal(`<span class="eyebrow">DLHODOBÁ CESTA POSTAVY · P</span><h2>Progresia</h2><nav class="career-tabs" aria-label="Systémy progresie">${Object.entries(tabs).map(([id, [name]]) => `<button data-career-tab="${id}" aria-pressed="${careerTab === id}">${name}</button>`).join('')}</nav><div class="career-body">${tabs[careerTab][1]()}</div><p id="career-message" role="status"></p>`);
  document.querySelectorAll('[data-career-tab]').forEach(button => button.onclick = () => careerPanel(button.dataset.careerTab));
  const actions = {
    train: id => trainAttribute(id), skill: id => upgradeSkill(id), bio: completeBiology,
    enhance: id => enhanceEquipment(id), craft: id => craftGem(id), gem: id => upgradeGem(id),
    spec: id => specialize(id), spectrain: trainSpecialization, enter: enterRift,
    claimRift: () => finishRift(true), abandon: () => finishRift(false), paragon: upgradeParagon
  };
  document.querySelectorAll('[data-action]').forEach(button => button.onclick = () => {
    if (actions[button.dataset.action]?.(button.dataset.id)) {
      updateClassHUD(); updateHUD(); careerPanel(careerTab);
      $('career-message').textContent = 'Hotovo. Postup bol uložený.';
    } else $('career-message').textContent = 'Chýbajú materiály, zlato, požadovaná úroveň alebo podmienka postupu. Vstup do trhliny vyžaduje útočisko.';
  });
}
