function toast(t){$('toast').textContent=t;$('toast').style.opacity='1';toastTimer=3;}

function setHUDHTML(id,html){const element=$(id);if(element.innerHTML!==html)element.innerHTML=html;}
function baseHUD(health=maxHP()){$('level').textContent='ÚR. '+p.level;$('hpbar').style.width=(p.hp/health*100)+'%';$('hptext').textContent=Math.ceil(p.hp)+' / '+health;$('xpbar').style.width=(p.level===PROGRESSION.maxLevel?100:p.xp/needXP()*100)+'%';$('xptext').textContent=p.level===PROGRESSION.maxLevel?'MAX · Prestíž v Postave (C)':p.xp.toLocaleString('sk-SK')+' / '+needXP().toLocaleString('sk-SK')+' EXP';$('gold').textContent=p.gold;$('pots').textContent=p.potions;updateQuestHUD();$('cooldown').textContent=skillCD>0?Math.ceil(skillCD):'';$('coords').textContent=map().town?'Mesto':isSanctuary(p)?'Bezpečná zóna':map().name;}

function updateMapHUD(){$('maptitle').textContent=map().name;$('mapdesc').textContent=map().desc;$('mapregion').textContent='◈ '+map().region;$('maplevel').textContent=map().metinsOnly?'Metiny všetkých úrovní 1–99':'Odporúčaná úroveň '+map().level+(map().levelMax?'–'+map().levelMax:'+');$('minimaplabel').textContent=map().name.toUpperCase();}

// Creation uses an isolated draft. Existing profiles never change vocation.
function chooseClass() { return false; }
function chooseSchool() { return false; }
function renderClasses() {}

function updateClassHUD(){$('portrait').textContent=({warrior:'侍',ninja:'影',sura:'魔',shaman:'龍'})[p.classId];$('playername').textContent=characterDisplayName(p)+prestigeSuffix(p);$('playerclass').textContent=role().name;school().skills.forEach((s,i)=>{$(i?'skill'+(i+1):'skill').querySelector('small').textContent=s[0];$(i?'skill'+(i+1):'skill').title=`${s[0]} · ${skillRankShort(skillProgress(skillKey(i)).rank)} · ${s[3]} many · ${s[2]} s\n${s[6]}`;});$('attack').querySelector('small').textContent=p.classId==='ninja'&&p.schools.ninja==='archery'?'Streľba':p.classId==='shaman'?'Úder vejárom':'Základný útok';}

function updateHUD(){const health=maxHP(),mana=maxMP();baseHUD(health);$('potion-cooldown').textContent=potionCooldownRemaining()>0?Math.ceil(potionCooldownRemaining()):'';$('potion').title='Elixír · +'+potionHealAmount()+' HP · spoločný cooldown 4 s';$('capes').textContent=p.braveryCapes;$('cape-cooldown').textContent=capeCooldown>0?Math.ceil(capeCooldown):'';p.mp=Math.max(0,Math.min(mana,p.mp));$('mpbar').style.width=p.mp/mana*100+'%';$('mptext').textContent=Math.ceil(p.mp)+' / '+mana;for(let i=0;i<6;i++)$(i?'cooldown'+(i+1):'cooldown').textContent=spellCD[i]>0?Math.ceil(spellCD[i]):'';$('coords').textContent=map().town?'Mesto · NPC F':isSanctuary(p)?'Bezpečná zóna':farmAreaAt().name+(map().metinsOnly?' · Metiny Lv.':' · Lv.')+farmAreaLevelRange(farmAreaAt()).join('–');$('buffs').textContent=Object.entries(buffs).map(([id,t])=>{const s=Object.values(SCHOOLS).flatMap(c=>c.skills).find(s=>s[1]===id);return(s?s[0]:id)+' '+Math.ceil(t)+'s';}).join(' · ');updateCombatHUD();updateCombatAssistHUD();updateHotbarState();updateDungeonHUD();updateWorldEventsHUD();}

