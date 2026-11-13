function questEntries(){
 const bio=p.career.biology,stage=BIOLOGY[bio.stage],target=huntRequired();
 return [
 {id:'opening',title:'Praskliny v pokoji',completed:p.claimed,goals:[['Poraz príšery',Math.min(p.kills,5),5],['Znič kamene osudu',Math.min(p.stones,3),3]],reward:'150 Yang + 60 EXP',ready:!p.claimed&&p.kills>=5&&p.stones>=3,claim:claimOpeningQuest},
 {id:'boss',title:'Prvý strážca',completed:p.bossClaimed,goals:[['Poraz bossa',Math.min(p.bossKills,1),1]],reward:'výbava + 200 Yang + 80 EXP',ready:!p.bossClaimed&&p.bossKills>=1,claim:claimBoss},
 ...(stage?[{id:'biology',title:'Biológ · '+stage.name,completed:false,goals:[['Odovzdaj '+MATERIALS[stage.item],bio.delivered,stage.count]],reward:stage.text,ready:false,minLevel:stage.level,info:'Odovzdanie u biológa v Meste.'}]:[]),
 {id:'hunt',title:'Lovec · opakovateľná',completed:false,goals:[['Primerané ciele',huntProgress(),target]],reward:costLabel(huntReward()),ready:huntProgress()>=target,claim:claimHunt}
 ];
}
function trackedQuest(){return questEntries().find(q=>!q.completed&&(!q.minLevel||p.level>=q.minLevel));}
function claimOpeningQuest(){if(!running||p.claimed||p.kills<5||p.stones<3)return false;p.claimed=true;p.gold+=150;experience(60);toast('Úloha dokončená.\n+150 Yang · +60 EXP');updateHUD();save();return true;}
function claimTrackedQuest(){const q=trackedQuest();if(!q?.ready||!q.claim)return false;q.claim();updateHUD();return true;}
