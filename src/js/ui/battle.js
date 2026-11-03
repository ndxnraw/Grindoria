let combatHudSignature='';

function enemyName(enemy) { return enemy.type==='stone'?(METIN_TYPES[enemy.metinType]?.name||'Metin'):enemy.type==='boss'?map().boss:enemy.name||map().mob; }
function resistanceText(value) { return (value>0?'+':'')+Number((value*100).toFixed(1)).toLocaleString('sk-SK')+' %'; }

function updateCombatHUD() {
  const enemy=selectedEnemy(),panel=$('target-panel');panel.hidden=!enemy;
  if(enemy){
    const signature=[enemy.spawnId,enemy.hp,enemy.max,enemy.level,playerMoving,combatSelection.following,Math.ceil(enemy.metinWaveTimer||0),enemy.metinCombat>0,enemy.suppressed>0].join('|');
    if(signature!==combatHudSignature){
      const resistances=enemyResistances(enemy);
      panel.innerHTML=`<button id="release-target" aria-label="Zrušiť označený cieľ">×</button><small>OZNAČENÝ CIEĽ${combatSelection.following?playerMoving?' · Nasledovanie':' · Automatický útok':''}</small><b>${escapeHTML(enemyName(enemy))} · Lv.${enemyLevel(enemy)}</b><div class="target-health"><i style="width:${Math.max(0,enemy.hp/enemy.max*100)}%"></i><span>${Math.ceil(enemy.hp)} / ${enemy.max}</span></div><div class="target-resistances">${enemy.variant&&enemy.variant!=='normal'?'<span>'+ENEMY_VARIANTS[enemy.variant].name+'</span>':''}${enemy.type==='stone'?'<span>'+(METIN_TYPES[enemy.metinType]?.difficulty||'Metin')+'</span><span>Pancier '+(enemy.metinArmor||0)+'</span><span>Odolnosť '+Math.round((enemy.metinResistance||0)*100)+' %</span>'+(enemy.metinCombat>0?'<span>Vlna za '+Math.ceil(enemy.metinWaveTimer)+' s</span>':''):''}${Object.entries(resistances).filter(([,value])=>value).map(([type,value])=>`<span class="${value<0?'vulnerable':'resistant'}">${DAMAGE_TYPES[type].name} ${resistanceText(value)}</span>`).join('')||'<span>Bez typových odolností</span>'}</div>`;
      $('release-target').onclick=()=>{clearCombatTarget();canvas.focus();};combatHudSignature=signature;
    }
  }else combatHudSignature='';
  const combo=SCHOOL_COMBOS[schoolId()],ready=combatFlow.time>0&&combatFlow.lastKey===schoolId()+':'+combo.sequence[0];
  const flow=$('combat-flow');flow.hidden=!(ready||combatFlow.flash>0||combatFlow.rhythm>0);
  if(!flow.hidden)flow.textContent=combatFlow.flash>0?'KOMBO · '+combatFlow.name:combatFlow.rhythm>0?'Bojový rytmus · ďalšia útočná schopnosť zosilnená':combo.name+' · '+spellKeys[combo.sequence[1]].toUpperCase()+' do '+Math.ceil(combatFlow.time)+' s';
}

function passiveCard() {
  const passive=SCHOOL_PASSIVES[schoolId()],rank=passiveRank();
  return `<section class="career-card"><span class="eyebrow">PASÍVNA SCHOPNOSŤ · ${rank?'STUPEŇ '+rank+' / 4':'OD ÚROVNE 10'}</span><h3>${passive.name}</h3><p>${passive.text}<br>Stupne: úroveň 10 / 25 / 50 / 75.</p></section>`;
}

function spellbook() {
  if(!running)return;
  const combo=SCHOOL_COMBOS[schoolId()];
  modal(`<span class="eyebrow">${role().name} · ${school().name}</span><h2>Kniha schopností</h2><div class="spell-list">${school().skills.map((s,i)=>{
    const meta=ACTIVE_SKILLS[skillKey(i)];
    return `<div><kbd>${spellKeys[i].toUpperCase()}</kbd><span><b>${s[0]} · stupeň ${skillProgress(skillKey(i)).rank}</b><small>${meta.type?DAMAGE_TYPES[meta.type].name+' poškodenie':'Podporná schopnosť'} · ${s[3]} many · cooldown ${Number((s[2]*(1-(skillProgress(skillKey(i)).rank-1)*.01)).toFixed(2))} s<br>${s[6]}${combo.sequence.includes(i)?'<br>Kombo: '+combo.name:''}</small></span></div>`;
  }).join('')}</div>${passiveCard()}<section class="career-card"><h3>Kombo · ${combo.name}</h3><p>${combo.sequence.map(i=>'<kbd>'+spellKeys[i].toUpperCase()+'</kbd> '+school().skills[i][0]).join(' → ')}<br>Do ${BATTLE.comboWindow} s · druhá schopnosť +${Math.round(combo.bonus*100)} % poškodenia/liečenia. Neúspešné zoslanie kombo nespotrebuje.</p></section><button class="primary" id="combat-guide">Bojový manuál</button><p>Zlepšovanie schopností: Progresia (P).</p>`);
  $('combat-guide').onclick=combatManual;
}

function combatManual() {
  if(!running)return;
  const resist=playerResistances();
  modal(`<span class="eyebrow">ŠKOLA BOJA · C</span><h2>Bojový manuál</h2><h3>Automatická pomoc</h3><p><b>Automierenie</b> pri útoku mieri na najbližší cieľ do 500; označený má prednosť. <b>Autospell</b> čaruje iba v boji s označeným cieľom, so spotrebou many a cooldownmi. Výpady môžu premiestniť postavu. Automatika čaká pri pauze, neaktívnom okne a v bezpečnej zóne. <b>Autoelixíry:</b> pod 45 % HP, +65 HP, spotreba 1 kusu. Spoločný cooldown s ručným použitím: 4 s.</p><h3>Typy poškodenia a tvoje odolnosti</h3><div class="battle-type-grid">${Object.entries(DAMAGE_TYPES).map(([id,spec])=>`<div style="border-left-color:${spec.color}"><b>${spec.name}</b><span>${resistanceText(resist[id])}</span></div>`).join('')}</div><p>Obrana: fyzické zásahy 100 %, prierazné 60 %, ostatné 25 %. Kladná odolnosť znižuje poškodenie, záporná zvyšuje. Limity: +75 % / −50 %. Metiny navyše používajú vlastný pancier a základnú odolnosť. Oslabenie Zrušením kúzla znižuje kladné typové odolnosti o 15 percentuálnych bodov a potláča zúrivosť bossa.</p><p>Kritický zásah: 1,8× poškodenie. Prenikavý zásah ignoruje kladné odolnosti a ochranu Metinu, strop šance 50 %. Bonus rýchlosti útoku: najviac 60 %, odstup aspoň 0,16 s. Bonus proti skupine: najviac +100 %. Jed a oheň pôsobia súčasne; rovnaký efekt obnoví trvanie a zachová silnejšiu hodnotu. Útok zblízka zasahuje čelný výsek, kruhové schopnosti celé okolie. Šípy letia priamo; vybrané magické strely sledujú cieľ.</p><p>Zásah vyprovokuje najviac 5 členov skupiny. Plášť pritiahne pohyblivé ciele do 650 na 18 s, spotreba 1 kusu. Bossovia útočia bez vyprovokovania; pod 30 % HP zúria.</p><h3>Kombá</h3>${Object.entries(SCHOOL_COMBOS).map(([id,combo])=>`<div class="career-card"><h3>${combo.name}</h3><p>${SCHOOLS[id].name}: ${combo.sequence.map(i=>SCHOOLS[id].skills[i][0]).join(' → ')}<br>Do 4 s · druhá schopnosť +${Math.round(combo.bonus*100)} % poškodenia/liečenia.</p></div>`).join('')}`);
}
