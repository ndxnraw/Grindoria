let combatHudSignature='';

function enemyName(enemy) { return enemy.type==='stone'?(METIN_TYPES[enemy.metinType]?.name||'Metin'):enemy.type==='boss'?map().boss:enemy.name||map().mob; }
function resistanceText(value) { return (value>0?'+':'')+Number((value*100).toFixed(1)).toLocaleString('sk-SK')+' %'; }

function updateCombatHUD() {
  const enemy=selectedEnemy(),panel=$('target-panel');panel.hidden=!enemy;
  if(enemy){
    const signature=[enemy.spawnId,enemy.hp,enemy.max,enemy.level,playerMoving,enemy.suppressed>0].join('|');
    if(signature!==combatHudSignature){
      const resistances=enemyResistances(enemy);
      panel.innerHTML=`<button id="release-target" aria-label="Zrušiť označený cieľ">×</button><small>OZNAČENÝ CIEĽ · ${playerMoving?'NASLEDUJEM':'AUTOMATICKÝ BOJ'}</small><b>${escapeHTML(enemyName(enemy))} · Lv.${enemyLevel(enemy)}</b><div class="target-health"><i style="width:${Math.max(0,enemy.hp/enemy.max*100)}%"></i><span>${Math.ceil(enemy.hp)} / ${enemy.max}</span></div><div class="target-resistances">${Object.entries(resistances).filter(([,value])=>value).map(([type,value])=>`<span class="${value<0?'vulnerable':'resistant'}">${DAMAGE_TYPES[type].name} ${resistanceText(value)}</span>`).join('')||'<span>Bez typových odolností</span>'}</div>`;
      $('release-target').onclick=()=>{clearCombatTarget();canvas.focus();};combatHudSignature=signature;
    }
  }else combatHudSignature='';
  const combo=SCHOOL_COMBOS[schoolId()],ready=combatFlow.time>0&&combatFlow.lastKey===schoolId()+':'+combo.sequence[0];
  const flow=$('combat-flow');flow.hidden=!(ready||combatFlow.flash>0||combatFlow.rhythm>0);
  if(!flow.hidden)flow.textContent=combatFlow.flash>0?'KOMBO · '+combatFlow.name:combatFlow.rhythm>0?'Bojový rytmus · ďalšia útočná schopnosť zosilnená':combo.name+' · '+spellKeys[combo.sequence[1]].toUpperCase()+' do '+Math.ceil(combatFlow.time)+' s';
}

function passiveCard() {
  const passive=SCHOOL_PASSIVES[schoolId()],rank=passiveRank();
  return `<section class="career-card"><span class="eyebrow">PASÍVNA SCHOPNOSŤ · ${rank?'STUPEŇ '+rank+' / 4':'OD ÚROVNE 10'}</span><h3>${passive.name}</h3><p>${passive.text}<br>Stupne sa odomykajú automaticky na úrovniach 10, 25, 50 a 75. Bez many a bez aktivácie.</p></section>`;
}

function spellbook() {
  if(!running)return;
  const combo=SCHOOL_COMBOS[schoolId()];
  modal(`<span class="eyebrow">${role().name} · ${school().name}</span><h2>Kniha schopností</h2><p>Šesť aktívnych schopností s vlastnými animáciami. Označený cieľ určuje smer; bez cieľa mieriš kurzorom. Plošné schopnosti zasahujú celý svoj uvedený priestor.</p><div class="spell-list">${school().skills.map((s,i)=>{
    const meta=ACTIVE_SKILLS[skillKey(i)];
    return `<div><kbd>${spellKeys[i].toUpperCase()}</kbd><span><b>${s[0]} · stupeň ${skillProgress(skillKey(i)).rank}</b><small>${meta.type?DAMAGE_TYPES[meta.type].name+' poškodenie':'Podporná schopnosť'} · ${s[3]} many · základná obnova ${s[2]} s<br>${s[6]}<br>${combo.sequence.includes(i)?'Súčasť komba: '+combo.name:'Samostatná taktická schopnosť'}</small></span></div>`;
  }).join('')}</div>${passiveCard()}<section class="career-card"><h3>Kombo · ${combo.name}</h3><p>${combo.sequence.map(i=>'<kbd>'+spellKeys[i].toUpperCase()+'</kbd> '+school().skills[i][0]).join(' → ')}<br>Druhú schopnosť úspešne zošli do ${BATTLE.comboWindow} s. Posilní jej poškodenie alebo liečenie o ${Math.round(combo.bonus*100)} %. Neúspešný pokus nespotrebuje kombo.</p></section><button class="primary" id="combat-guide">Bojový manuál · typy poškodenia a ovládanie</button><p>Prax a knihy na zlepšovanie aktívnych schopností nájdeš v Progrese (P).</p>`);
  $('combat-guide').onclick=combatManual;
}

function combatManual() {
  if(!running)return;
  const resist=playerResistances();
  modal(`<span class="eyebrow">ŠKOLA BOJA · C</span><h2>Bojový manuál</h2><p><b>WASD / šípky:</b> pohyb a prerušenie automatického nasledovania.<br><b>Klik na nepriateľa alebo Metin:</b> označiť, nasledovať živú pozíciu a automaticky útočiť v dosahu.<br><b>Klik do prázdna:</b> smerový útok, bez presunu postavy.<br><b>Kurzor:</b> orientácia bez cieľa. Medzerník útočí rovnakým smerom; môžeš ho držať.<br><b>Esc:</b> zatvoriť panel alebo zrušiť cieľ. Smrť cieľa, zmena mapy a strata zamerania okna zastavia nasledovanie.<br><b>F10 / ⛶:</b> celá obrazovka.<br><b>Y:</b> korisť v okolí; zlato a zásoby sa zbierajú automaticky.</p><h3>Typy poškodenia a tvoje odolnosti</h3><div class="battle-type-grid">${Object.entries(DAMAGE_TYPES).map(([id,spec])=>`<div style="border-left-color:${spec.color}"><b>${spec.name}</b><span>${resistanceText(resist[id])}</span></div>`).join('')}</div><p>Fyzické zásahy používajú celú obranu, prierazné 60 % a elementálne či magické 25 %. Typová odolnosť sa potom uplatní samostatne. Pozitívna odolnosť cieľa škodu znižuje, negatívna znamená slabinu. Odolnosti sú obmedzené na 75 %, slabiny na −50 %. Metiny navyše používajú vlastný pancier a základnú odolnosť. Oslabenie Zrušením kúzla znižuje kladné typové odolnosti o 15 percentuálnych bodov a potláča zúrivosť bossa.</p><p>Kritický zásah spôsobí 1,8× poškodenie pred odolnosťami. Jed a oheň môžu pôsobiť naraz; opakovanie rovnakého efektu obnoví trvanie a ponechá silnejšiu hodnotu. Základný útok zblízka je čelný výsek; kruhové útoky sú určené na obkľúčenie. Šípy letia priamo a môžu minúť pohyblivý cieľ, vybrané magické strely sledujú označeného nepriateľa.</p>${passiveCard()}<h3>Kombá všetkých škôl</h3>${Object.entries(SCHOOL_COMBOS).map(([id,combo])=>`<div class="career-card"><h3>${combo.name}</h3><p>${SCHOOLS[id].name}: ${combo.sequence.map(i=>SCHOOLS[id].skills[i][0]).join(' → ')}<br>Do 4 sekúnd, +${Math.round(combo.bonus*100)} % poškodenia alebo liečenia druhej schopnosti.</p></div>`).join('')}`);
}
