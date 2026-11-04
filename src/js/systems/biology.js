let biologyMessage='';
function initializeBiology(){
 const bio=p.career.biology;bio.nextDeliveryAt??=0;bio.sampleKills??=0;biologyMessage='';
}
function biologyCooldown(now=Date.now()){return Math.max(0,Math.ceil(((p.career.biology.nextDeliveryAt||0)-now)/1000));}
function biologyWaitLabel(seconds){const minutes=Math.floor(seconds/60);return minutes+' min '+String(seconds%60).padStart(2,'0')+' s';}
function biologyCost(stage=BIOLOGY[p.career.biology.stage]){return stage?{[stage.item]:1,gold:stage.fee}:null;}
function biologyBlockReason(now=Date.now()){
 const bio=p.career.biology,stage=BIOLOGY[bio.stage];
 if(!stage)return 'Výskum dokončený.';
 if(!running||p.hp<=0)return 'Postava musí byť nažive v hre.';
 if(p.level<stage.level)return 'Vyžaduje úroveň '+stage.level+'.';
 if(!nearNPC('biologist'))return 'Odovzdanie: Biológ v Meste.';
 if(p.career.eligibleKills<bio.nextKill)return 'Zostáva '+(bio.nextKill-p.career.eligibleKills)+' primeraných zabití.';
 const cooldown=biologyCooldown(now);if(cooldown)return 'Ďalšie odovzdanie o '+biologyWaitLabel(cooldown)+'.';
 if(p.career.materials[stage.item]<1)return 'Chýba vzorka: '+MATERIALS[stage.item]+'.';
 if(p.gold<stage.fee)return 'Chýba '+(stage.fee-p.gold)+' Yang.';
 return '';
}
function completeBiology(){
 biologyMessage=biologyBlockReason();if(biologyMessage)return false;
 const bio=p.career.biology,stage=BIOLOGY[bio.stage];if(!pay(biologyCost(stage)))return false;
 bio.delivered++;bio.nextKill=p.career.eligibleKills+BIOLOGY_RULES.killGap;bio.nextDeliveryAt=Date.now()+stage.cooldown*1000;
 biologyMessage='Vzorka odovzdaná: '+bio.delivered+' / '+stage.count+'.';
 if(bio.delivered>=stage.count){bio.stage++;bio.delivered=0;bio.sampleKills=0;biologyMessage='Etapa dokončená · '+stage.text;toast(biologyMessage);}
 save();updateHUD();return true;
}
function biologySourceMatches(stage,enemy){
 return stage.map===p.mapId&&!enemy.metinParentId&&!enemy.dungeonBoss&&!enemy.dungeonSeal&&(stage.boss?enemy.type==='boss':enemy.type==='wolf'&&stage.variants.includes(enemy.variant));
}
function dropBiologySample(enemy){
 const c=p.career,base=BIOLOGY.find(stage=>stage.map===p.mapId&&stage.dropEvery);
 if(base&&enemy.type==='wolf'){c.samplePity[p.mapId]=(c.samplePity[p.mapId]||0)+1;if(c.samplePity[p.mapId]>=base.dropEvery){dropMaterial(base.item,1,enemy);c.samplePity[p.mapId]=0;}}
 const stage=BIOLOGY[c.biology.stage];if(!stage||stage.dropEvery||p.level<stage.level||!biologySourceMatches(stage,enemy))return;
 c.biology.sampleKills=(c.biology.sampleKills||0)+1;
 if(c.biology.sampleKills>=stage.pity||rand()<stage.chance){dropMaterial(stage.item,1,enemy);c.biology.sampleKills=0;}
}
