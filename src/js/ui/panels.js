function modal(html,options={}){
  const same=!$('modal').hidden&&options.key&&panelState.key===options.key;
  const scroll=same?$('modalcard').scrollTop||0:0,focus=same?modalFocusToken():null;
  setCharacterScreenMode(true);$('intro').inert=true;clearLootPointer();$('modal').className='overlay';$('modal').ondragover=null;$('modal').ondrop=null;
  paused=true;keysClear();updateHotbarState();$('modalcontent').innerHTML=html;$('modal').hidden=false;panelState.key=options.key||null;
  $('modalcard').scrollTop=scroll;
  if(same)restoreModalFocus(focus);else $('close').focus({preventScroll:true});
  $('modalcard').scrollTop=scroll;
}

function closeModal(){panelState.key=null;inventoryDropPending=null;inventoryDrag=null;$('modal').className='overlay';$('modal').hidden=true;paused=false;updateHotbarState();$('intro').inert=false;setCharacterScreenMode(!running);if(running)canvas.focus({preventScroll:true});else $('create-character').focus({preventScroll:true});}


function shop(){marketPanel('merchant');}

function journal(){
 if(!running)return;
 const huntTarget=(p.huntClaimed+1)*10;
 const card=(title,objectives,reward,button)=>'<article class="journal-entry"><h3>'+title+'</h3><div class="requirements"><div class="requirement-heading"><span>Cieľ</span><span>Postup / Cieľ</span></div>'+objectives+'</div><p class="quest-reward"><b>Odmena</b> · '+reward+'</p>'+button+'</article>';
 modal('<span class="eyebrow">ÚLOHY · J</span><h2>Denník úloh</h2>'+card('Praskliny v pokoji',requirementRow('Príšery',Math.min(p.kills,5),5)+requirementRow('Kamene',Math.min(p.stones,3),3),'150 Yang + 60 skúseností','<button class="primary" id="journalMain" '+(p.claimed||p.kills<5||p.stones<3?'disabled':'')+'>'+(p.claimed?'✓ Dokončené':'Vyzdvihnúť odmenu')+'</button>')+card('Prvý strážca',requirementRow('Boss · Údolie: odporúčaná úroveň 10+',Math.min(p.bossKills,1),1),'epická výbava + 200 Yang + 80 skúseností','<button class="primary" id="claimBoss" '+(p.bossClaimed||!p.bossKills?'disabled':'')+'>'+(p.bossClaimed?'✓ Dokončené':'Vyzdvihnúť odmenu')+'</button>')+card('Lovec údolia · opakovateľná',requirementRow('Primerané príšery',Math.min(p.career.eligibleKills,huntTarget),huntTarget),'60 Yang + 1 tréningová pečať (bez EXP)','<button class="primary" id="claimHunt" '+(p.career.eligibleKills<huntTarget?'disabled':'')+'>Vyzdvihnúť odmenu</button>'),{key:'journal'});
 $('journalMain').onclick=()=>{if(p.claimed||p.kills<5||p.stones<3)return;$('claim').onclick();journal();};$('claimBoss').onclick=claimBoss;$('claimHunt').onclick=claimHunt;
}

function travelMenu(){if(!running)return;if(dungeonRun()){dungeonPanel();return;}if(p.career.endgame.run){careerPanel('endgame');return;}if(!canTravel()){toast('Cestovanie nie je dostupné počas boja.');return;}modal(`<span class="eyebrow">MAPY · M</span><h2>Cestovanie</h2><p>Cestovanie mimo boja.</p><div class="map-list">${Object.entries(MAPS).filter(([,c])=>!c.instance).map(([id,c])=>`<button data-map="${id}" class="map-card ${p.mapId===id?'selected':''}" style="--map-color:${c.ground}"><b>${c.name}</b><small>${c.town?c.desc:'Úroveň '+c.level+'+ · '+c.mob+' · '+c.boss}</small>${p.mapId===id?'<span>Aktuálna mapa</span>':''}</button>`).join('')}</div><button class="primary" id="dungeon-entry">Dungeony · obtiažnosti a odmeny</button><button class="primary" id="metinAtlas">Atlas Metinov · úrovne, vlny a dropy</button><p id="travelmsg" role="status"></p>`);$('metinAtlas').onclick=metinCodex;$('dungeon-entry').onclick=dungeonPanel;document.querySelectorAll('[data-map]').forEach(b=>b.onclick=()=>{if(p.mapId===b.dataset.map)return;if(!canTravel()){$('travelmsg').textContent='Najprv ukonči boj.';return;}loadMap(b.dataset.map);});}

function help(){modal('<h2>Ako hrať</h2><p><b>WASD / šípky</b> — pohyb, zrušenie nasledovania<br><b>Kurzor</b> — smer útoku bez cieľa<br><b>SPACE</b> — útok; zásah označí nepriateľa<br><b>Klik na nepriateľa / Metin</b> — označiť a zobraziť údaje<br><b>Druhý klik na rovnaký cieľ</b> — nasledovať a automaticky útočiť<br><b>Klik do prázdna</b> — zrušiť cieľ<br><b>Q R T V U O</b> — schopnosti<br><b>E</b> — elixír<br><b>B</b> — Plášť statočnosti<br><b>Y / klik na korisť</b> — zbieranie; zlato a zásoby priamo do inventára<br><b>I</b> — inventár<br><b>K</b> — kniha schopností<br><b>P</b> — progresia<br><b>J</b> — úlohy<br><b>M</b> — mapy<br><b>F</b> — blízke NPC v Meste<br><b>C</b> — bojový manuál<br><b>F10 / ⛶</b> — celá obrazovka<br><b>Esc</b> — zavrieť okno; v hre zrušiť cieľ a automatiku</p><p>Okná zatvoríš aj kliknutím mimo nich.</p>');}

function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}


