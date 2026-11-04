function biologyDropLabel(stage){return stage.dropEvery?'Každá '+stage.dropEvery+'. príšera':Math.round(stage.chance*100)+' % · zaručene do '+stage.pity+'. vhodného zabitia';}
function biologyStatusText(now=Date.now()){const wait=biologyCooldown(now),bio=p.career.biology,kills=Math.max(0,bio.nextKill-p.career.eligibleKills);return (wait?'Ďalšie odovzdanie o '+biologyWaitLabel(wait)+'. ':'')+(kills?'Zostáva '+kills+' primeraných zabití.':'');}
function biologyContent(delivery=false){
 const bio=p.career.biology,stage=BIOLOGY[bio.stage];if(!stage)return '<p>Všetky biologické výskumy sú dokončené.</p>';
 return '<article class="career-card"><h3>'+stage.name+' · '+(bio.stage+1)+' / '+BIOLOGY.length+'</h3><p>'+MAPS[stage.map].name+' · úroveň '+stage.level+'<br>'+stage.source+' · '+biologyDropLabel(stage)+'</p>'+requirementRow('Odovzdané · '+MATERIALS[stage.item],bio.delivered,stage.count)+'<p>Odmena za etapu: '+stage.text+'</p><p id="biology-status" role="status">'+biologyStatusText()+'</p>'+(delivery?costRequirements(biologyCost(stage))+'<p id="biology-block">'+escapeHTML(biologyBlockReason())+'</p><button class="primary" id="biology-submit" '+(biologyBlockReason()?'disabled':'')+'>Odovzdať vzorku</button><p id="biology-message" role="status"></p>':'<p>Vzorky odovzdávaš biológovi v Meste.</p>')+'</article>';
}
function biologyNPCPanel(){
 if(!running||!npcServiceOpened('biologist')||!gameWindows.has('npc:biology')&&!nearNPC('biologist'))return false;
 modal('<h2>Biológ</h2>'+biologyContent(true),{key:'npc:biology',refresh:biologyNPCPanel});
 if($('biology-submit'))$('biology-submit').onclick=()=>{const ok=completeBiology();biologyNPCPanel();if($('biology-message'))$('biology-message').textContent=biologyMessage;return ok;};return true;
}
function refreshBiologyPanel(){
 if(!running)return;
 for(const key of ['career:biology','npc:biology'])withGameWindow(key,()=>{const status=$('biology-status');if(status)status.textContent=biologyStatusText();const button=$('biology-submit');if(button)button.disabled=!!biologyBlockReason();const reason=$('biology-block');if(reason)reason.textContent=biologyBlockReason();});
}
function biologyJournalCard(){return biologyContent(false);}
