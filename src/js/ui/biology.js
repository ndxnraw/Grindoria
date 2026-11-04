function biologyDropLabel(stage){return stage.dropEvery?'Každá '+stage.dropEvery+'. príšera':Math.round(stage.chance*100)+' % · zaručene najneskôr '+stage.pity+'. vhodné zabitie';}
function biologyStatusText(now=Date.now()){
 const reason=biologyBlockReason(now),wait=biologyCooldown(now);return (reason||'Možno odovzdať.')+(wait&&!reason.startsWith('Ďalšie odovzdanie')?' Ďalšie odovzdanie o '+biologyWaitLabel(wait)+'.':'');
}
function careerBiology(){
 const bio=p.career.biology;
 return '<p>Biológ · Mesto. Medzi odovzdaniami: '+BIOLOGY_RULES.killGap+' primeraných zabití. Pokročilé vzorky padajú len pre aktívnu etapu od požadovanej úrovne.</p>'+BIOLOGY.map((stage,index)=>{
  const active=index===bio.stage,completed=index<bio.stage;
  return '<article class="career-card '+(completed?'completed':'')+'"><h3>'+(completed?'✓ ':active?'Aktívny výskum · ':'')+stage.name+'</h3><p>'+MAPS[stage.map].name+' · vyžaduje úroveň '+stage.level+'<br>'+stage.source+' · '+biologyDropLabel(stage)+'</p>'+requirementRow(MATERIALS[stage.item],completed?stage.count:active?bio.delivered:0,stage.count)+'<p>Trvalý bonus: '+stage.text+(stage.cooldown?'<br>Interval odovzdávania: '+stage.cooldown/60+' min':'')+'</p>'+(active?costRequirements(biologyCost(stage))+'<p id="biology-status" role="status">'+biologyStatusText()+'</p><button id="biology-submit" class="primary" data-action="bio" '+(biologyBlockReason()?'disabled':'')+'>Odovzdať vzorku</button>':completed?'':'<small>Vyžaduje predchádzajúcu etapu.</small>')+'</article>';
 }).join('')+(bio.stage>=BIOLOGY.length?'<p>Všetky výskumy dokončené.</p>':'');
}
function refreshBiologyPanel(){
 if(!running||!gameWindows.has('career:biology'))return;
 withGameWindow('career:biology',()=>{
 const status=$('biology-status'),button=$('biology-submit'),reason=biologyBlockReason();
 if(status&&status.textContent!==biologyStatusText())status.textContent=biologyStatusText();
 if(button)button.disabled=!!reason;
 });
}
function biologyJournalCard(){
 const bio=p.career.biology,stage=BIOLOGY[bio.stage];
 return '<article class="journal-entry"><h3>Biologický výskum'+(stage?' · '+stage.name:'')+'</h3>'+(stage?requirementRow(MATERIALS[stage.item],bio.delivered,stage.count)+'<p>'+MAPS[stage.map].name+' · '+stage.source+' · úroveň '+stage.level+'+</p><p class="quest-reward">Trvalý bonus: '+stage.text+'</p>':'<p>Všetky výskumy dokončené.</p>')+'<button id="journalBiology">Biológ · progres a odovzdanie</button></article>';
}
