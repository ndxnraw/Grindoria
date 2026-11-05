let combatHudSignature='';

function enemyName(enemy) { if(enemy.name)return enemy.name;return enemy.type==='stone'?(METIN_TYPES[enemy.metinType]?.name||'Metin'):enemy.type==='boss'?map().boss:enemy.name||map().mob; }
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
    return `<div><kbd>${spellKeys[i].toUpperCase()}</kbd><span><b>${s[0]} · ${skillRankLabel(skillProgress(skillKey(i)).rank)}</b><small>${meta.type?DAMAGE_TYPES[meta.type].name+' poškodenie':'Podporná schopnosť'} · ${s[3]} many · cooldown ${Number((s[2]*(1-skillCooldownReduction(skillKey(i)))).toFixed(2))} s<br>Základný účinok: ${s[6]}<br>Bonus stupňa: +${Math.round(((meta.support?skillFactor(skillKey(i)):skillAttackFactor(skillKey(i)))-1)*100)} % ${meta.support?'trvania / liečenia':'poškodenia'}${s[1]==='spirit'?' · poškodenie +'+Math.round((skillAttackFactor(skillKey(i))-1)*100)+' %':''}${combo.sequence.includes(i)?'<br>Kombo: '+combo.name:''}</small>${skillUpgradeContent(i)}</span></div>`;
  }).join('')}</div>${passiveCard()}<p id="skill-message" role="status"></p>`,{key:'spellbook',refresh:spellbook});
  panelQueryAll('[data-upgrade-skill]').forEach(button=>button.onclick=()=>{const ok=upgradeSkill(button.dataset.upgradeSkill);spellbook();$('skill-message').textContent=ok?'Schopnosť vylepšená.':'Chýba prax, Yang alebo potrebné predmety.';updateClassHUD();});
}

function combatRulesContent(){
 const resist=playerResistances(),combo=SCHOOL_COMBOS[schoolId()];
 return '<p>Automierenie mieri pri útoku na najbližší cieľ do 500; označený má prednosť. Automatické schopnosti používajú manu a rešpektujú cooldowny. Autoelixír pri chýbajúcom zdraví obnoví 65 HP alebo 25 % maxima každé 2 s, ručne bez cooldownu. Automatika čaká pri pauze, neaktívnej hre a v bezpečnej zóne. Prepínač všetkej automatiky zapne alebo vypne všetky tri režimy.</p>'+
 '<h3>Odolnosti postavy</h3><div class="battle-type-grid">'+Object.entries(DAMAGE_TYPES).map(([id,spec])=>'<div style="border-left-color:'+spec.color+'"><b>'+spec.name+'</b><span>'+resistanceText(resist[id])+'</span></div>').join('')+'</div>'+
 '<p>Obrana pôsobí na fyzické zásahy na 100 %, prierazné na 60 %, ostatné na 25 %. Odolnosti majú rozsah −50 % až +75 %. Metiny majú navyše pancier a základnú odolnosť. Zrušenie kúzla zníži kladné typové odolnosti o 15 percentuálnych bodov a potlačí zúrivosť.</p>'+
 '<p>Kritický zásah: 1,8×. Prenikavý zásah ignoruje kladné odolnosti a ochranu Metinu; šanca najviac 50 %. Bonus rýchlosti útoku: najviac 60 %, odstup aspoň 0,16 s. Bonus proti skupine: najviac 100 %.</p>'+
 '<p>Útok zblízka zasiahne celé okolie do 62 a čelný výsek do 95. Šíp pri dopade zasiahne okolie do 65 za 65 % poškodenia. Šípy letia priamo, vybrané magické strely sledujú cieľ. Jed a oheň môžu pôsobiť súčasne; rovnaký efekt obnoví trvanie a ponechá silnejšiu hodnotu.</p>'+
 '<p>Zásah vyprovokuje najviac 5 členov skupiny. Plášť pritiahne pohyblivé ciele do 650 na 18 s za 1 kus. Bossovia útočia aj bez vyprovokovania a pod 30 % HP zúria.</p>'+
 '<h3>Kombo · '+combo.name+'</h3><p>'+combo.sequence.map(i=>'<kbd>'+spellKeys[i]+'</kbd> '+school().skills[i][0]).join(' → ')+' · do 4 s · druhá schopnosť +'+Math.round(combo.bonus*100)+' % poškodenia alebo liečenia. Neúspešné zoslanie kombo nespotrebuje.</p>';
}

function skillUpgradeContent(index){const key=skillKey(index),skill=skillProgress(key);if(skill.rank===PROGRESSION.maxSkillRank)return '<p class="skill-perfect">Perfektný majster · maximum</p>';const ready=skill.practice>=skillPracticeNeeded(skill.rank)&&canPayRecipe(skillCost(key));return '<p>Prax '+skill.practice+' / '+skillPracticeNeeded(skill.rank)+'</p>'+costRequirements(skillCost(key))+'<button class="primary" data-upgrade-skill="'+key+'" '+(ready?'':'disabled')+'>Vylepšiť na '+skillRankShort(skill.rank+1)+'</button>';}
