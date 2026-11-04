let characterTab='stats';
function characterPanel(tab=characterTab){
 if(!running)return;
 const stats=[['strength','Sila','STR'],['vitality','Vitalita','VIT'],['dexterity','Obratnosť','DEX'],['intelligence','Inteligencia','INT']];
 const values=[['Útok',damage()],['Obrana',defense()],['Zdravie',Math.ceil(p.hp)+' / '+maxHP()],['Mana',Math.ceil(p.mp)+' / '+maxMP()],['Kritický zásah',(criticalChance()*100).toFixed(1)+' %'],['Prenikavý zásah',(penetrationChance()*100).toFixed(1)+' %'],['Rýchlosť útoku','+'+(itemAttackSpeed()*100).toFixed(1)+' %'],['Rýchlosť pohybu',Math.round(speedValue())],['Sila kúziel',magicPower()]];
 characterTab=['stats','specialization','prestige'].includes(tab)?tab:'stats';tab=characterTab;
 const navigation='<nav class="character-tabs">'+[['stats','Postava'],['specialization','Špecializácia'],['prestige','Prestíž']].map(([id,name])=>'<button data-character-tab="'+id+'" aria-pressed="'+(tab===id)+'">'+name+'</button>').join('')+'</nav>';
 const statsContent='<div class="stat-profile"><span class="stat-portrait">'+({warrior:'侍',ninja:'影',sura:'魔',shaman:'龍'})[p.classId]+'</span><div><b>'+escapeHTML(characterDisplayName(p))+'</b><small>'+role().name+' · '+school().name+'</small><small>Úroveň '+p.level+prestigeSuffix(p)+'</small></div></div><div class="stat-exp"><span>Skúsenosti</span><b>'+uiNumber(p.xp)+' / '+uiNumber(needXP())+'</b><progress max="'+needXP()+'" value="'+(p.level===99?needXP():p.xp)+'"></progress></div><h3>Vlastnosti <small>Voľné body: '+p.points+'</small></h3><div class="attribute-list">'+stats.map(([id,name,abbr])=>'<div><abbr title="'+name+'">'+abbr+'</abbr><span>'+name+'</span><b>'+p[id]+'</b><button data-character-stat="'+id+'" aria-label="Zvýšiť '+name.toLowerCase()+' o bod" '+(!p.points?'disabled':'')+'>+</button></div>').join('')+'</div><h3>Bojové hodnoty</h3><dl class="stat-values">'+values.map(([name,n])=>'<div><dt>'+name+'</dt><dd>'+n+'</dd></div>').join('')+'</dl>';
 modal('<h2>Postava</h2>'+navigation+(tab==='stats'?statsContent:tab==='specialization'?careerSpecialization():prestigePanel()+characterPermanentContent())+'<p id="character-message" role="status"></p>',{key:'character',refresh:()=>characterPanel(tab)});
 panelQueryAll('[data-character-tab]').forEach(button=>button.onclick=()=>characterPanel(button.dataset.characterTab));
 panelQueryAll('[data-character-stat]').forEach(button=>button.onclick=()=>allocate(button.dataset.characterStat));
 const actions={spec:specialize,spectrain:trainSpecialization,prestigeActivate:activatePrestige,prestigePromote:promotePrestige,prestigeTrain:trainPrestige,prestigeClaim:claimPrestigeGoal,prestigeRefine:refinePrestigeAffix,paragon:upgradeParagon};
 panelQueryAll('[data-action]').forEach(button=>button.onclick=()=>{const ok=actions[button.dataset.action]?.(button.dataset.id);characterPanel(tab);$('character-message').textContent=ok?'Uložené.':'Nesplnené podmienky.';});
}
function characterPermanentContent(){const end=p.career.endgame;return '<details><summary>Trvalé posilnenie · úroveň 35</summary><p>Stupeň '+end.paragon+' / '+PROGRESSION.maxParagon+' · +'+(end.paragon*2)+' útok, +'+(end.paragon*5)+' zdravie</p>'+costRequirements(paragonCost(end.paragon+1))+'<button data-action="paragon" '+(p.level<35||end.paragon>=PROGRESSION.maxParagon||!canPayRecipe(paragonCost(end.paragon+1))?'disabled':'')+'>Posilniť postavu</button></details>';}
function autoHuntPanel(){
 if(!running)return;
 const options=[['autoAim','Automierenie','Pri útoku mieri na najbližší cieľ do 500. Označený cieľ má prednosť.'],['autoSpell','Automatické schopnosti','V boji používa schopnosti na označený cieľ. Spotrebúva manu a rešpektuje cooldowny.'],['autoPotion','Automatické elixíry','Pri chýbajúcom zdraví použije elixír každé 2 s. Ručné použitie bez cooldownu.']];
 modal('<h2>Automatický boj</h2>'+options.map(([id,name,text])=>'<article class="career-card"><h3>'+name+'</h3><p>'+text+'</p><button data-auto-setting="'+id+'" aria-pressed="'+!!p.combatAssist[id]+'">'+(p.combatAssist[id]?'Zapnuté':'Vypnuté')+'</button></article>').join('')+'<p>Druhý klik na nepriateľa zapne nasledovanie a základný útok. WASD alebo klik na zem ho zrušia. Automatika čaká v bezpečnej zóne a pri neaktívnej hre.</p><button id="stop-auto">'+(Object.values(p.combatAssist).every(value=>value===true)?'Vypnúť všetku automatiku':'Zapnúť všetku automatiku')+'</button>',{key:'auto-hunt',refresh:autoHuntPanel});
 panelQueryAll('[data-auto-setting]').forEach(button=>button.onclick=()=>{toggleCombatAssist(button.dataset.autoSetting);autoHuntPanel();});
 $('stop-auto').onclick=()=>{toggleAllCombatAssist();autoHuntPanel();};
}
function systemMenu(){
 if(!running)return;
 modal('<h2>Hlavné menu</h2><div class="system-menu-list"><button id="menu-help">Pomoc · H</button><button id="menu-sound">Zvuk: '+(sound?'zapnutý':'vypnutý')+'</button><button id="menu-fullscreen">Celá obrazovka · F10</button><button id="menu-reset-windows">Obnoviť polohy okien</button><button id="menu-backup">Exportovať postavy</button><button id="menu-characters">Výber postáv</button><button id="menu-return">Späť do hry</button></div><p>Hra pokračuje aj počas otvoreného menu.</p>',{key:'system-menu'});
 $('menu-help').onclick=help;$('menu-sound').onclick=()=>{$('sound').onclick();systemMenu();};$('menu-fullscreen').onclick=toggleGameFullscreen;
 $('menu-reset-windows').onclick=()=>{for(const key of Object.keys(windowLayout))delete windowLayout[key];for(const [i,w]of [...gameWindows.values()].entries()){w.x=20+i*26;w.y=110+i*24;clampGameWindow(w);}saveWindowLayout();};
 $('menu-backup').onclick=()=>{try{downloadCharacterJSON(exportCharacters());toast('Záloha všetkých postáv pripravená.');}catch(error){toast(error.message);}};
 $('menu-characters').onclick=returnToCharacters;$('menu-return').onclick=()=>closeModal('system-menu');
}
function largeMapPanel(){
 if(!running)return;
 modal('<h2>Veľká mapa</h2><div class="atlas-heading"><b>'+escapeHTML(map().name)+'</b><small>'+($('maplevel').textContent)+'</small></div><div class="atlas-map"><canvas id="large-map-canvas" width="480" height="480" aria-label="Mapa lokality. Tvoja poloha, NPC, nepriatelia a udalosti."></canvas></div><div class="atlas-legend"><span><i class="map-player"></i>Ty</span><span><i class="map-npc"></i>NPC</span><span><i class="map-enemy"></i>Nepriateľ</span><span><i class="map-stone"></i>Metin</span><span><i class="map-quest"></i>Úloha / udalosť</span></div><p id="atlas-position"></p>',{key:'large-map'});
 drawLargeMap(true);
}
function drawLargeMap(force=false){
 const entry=gameWindows.get('large-map');if(!entry||entry.minimized)return;
 if(!force&&clock-(entry.lastPaint??-Infinity)<.1)return;entry.lastPaint=clock;
 const surface=entry.content.querySelector('[data-ui-id="large-map-canvas"]');if(!surface)return;
 const c=surface.getContext('2d'),s=480,scale=s/SIZE;
 c.fillStyle=map().ground;c.fillRect(0,0,s,s);
 c.fillStyle=map().water+'80';c.beginPath();c.ellipse(s*.13,s*.23,s*.08,s*.12,0,0,Math.PI*2);c.fill();
 for(const d of decor){c.fillStyle=map().accent+'90';c.fillRect(d.x*scale,d.y*scale,3,3);}
 c.strokeStyle='#d3b57a25';c.lineWidth=1;
 for(let i=1;i<8;i++){c.beginPath();c.moveTo(i*s/8,0);c.lineTo(i*s/8,s);c.moveTo(0,i*s/8);c.lineTo(s,i*s/8);c.stroke();}
 const dot=(x,y,color,r=3)=>{c.fillStyle=color;c.beginPath();c.arc(x*scale,y*scale,r,0,Math.PI*2);c.fill();};
 if(!map().town){const zone=safeZone();c.strokeStyle='#a5d1a4';c.beginPath();c.arc(zone.x*scale,zone.y*scale,zone.radius*scale,0,Math.PI*2);c.stroke();}
 for(const m of mobs)if(m.hp>0)dot(m.x,m.y,m.type==='boss'?'#ff655e':m.type==='stone'?'#d49cf3':'#c67b61',m.type==='wolf'?2:4);
 c.font='11px Segoe UI';c.textAlign='center';
 if(map().town)for(const [id,npc]of Object.entries(NPCS)){if(npc.mapId!==p.mapId)continue;dot(npc.x,npc.y,'#81d4bd',4);c.fillStyle='#f6e8c7';c.fillText(npc.name,npc.x*scale,npc.y*scale-10);if(id==='biologist'&&p.career.biology.stage<BIOLOGY.length){c.fillStyle='#ffe085';c.fillText('!',npc.x*scale,npc.y*scale-24);}}
 const event=worldEventState?.active;if(event?.revealed)dot(event.x,event.y,'#ffe085',6);
 dot(p.x,p.y,'#fff3b5',6);c.strokeStyle='#1e241b';c.lineWidth=2;c.stroke();
 const position=entry.content.querySelector('[data-ui-id="atlas-position"]');if(position)position.textContent='Tvoja poloha: '+Math.round(p.x)+', '+Math.round(p.y);
}
