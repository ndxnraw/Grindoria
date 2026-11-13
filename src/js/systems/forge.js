let forgeResult=null;
function enhancementBonus(item){const curve=FORGE_RULES.bonuses[EQUIPMENT[item?.slot]?.stat]||FORGE_RULES.bonus;return curve[Math.max(0,Math.min(9,Math.floor(item?.enhance||0)))];}
function forgeChance(item,options={}){const rank=(item?.enhance||0)+1;return Math.min(.95,(FORGE_RULES.success[rank]||0)+(options.charm?FORGE_RULES.charmBoost:0));}
function forgeFailureText(item,options={}){
 const next=(item.enhance||0)+1;
 if(options.protect||next<=3)return 'Neúspech: stupeň zostane.';
 return next>=7?'Neúspech: 15 % zničenie, inak −1 stupeň.':'Neúspech: −1 stupeň.';
}
function enhancementCost(item,options={}){
 if(!item||!EQUIPMENT[item.slot]||(item.enhance||0)>=9)return null;
 const rank=(item.enhance||0)+1,multiplier=1+(item.tier||1)/30;
 return {ore:2*rank+Math.floor(rank*rank/4),gold:Math.ceil(40*rank**2*multiplier),...(rank>=3?{upgradeStones:Math.ceil(rank/3)}:{}),...(rank>=5?{dust:2*(rank-4)}:{}),...(rank>=7?{forgeCore:Math.ceil((rank-6)/2)}:{}),...(options.charm&&FORGE_RULES.success[rank]<.95?{smithCharm:1}:{}),...(options.protect&&rank>=4?{protectionScroll:1}:{})};
}
function enhanceEquipment(slot,options={}){
 forgeResult=null;
 const item=p.equipped[slot],rank=(item?.enhance||0)+1;
 if(!running||p.hp<=0||!nearNPC('smith')||!EQUIPMENT[slot]||!item||rank>9)return false;
 options={charm:options.charm===true&&FORGE_RULES.success[rank]<.95,protect:options.protect===true&&rank>=4};
 const cost=enhancementCost(item,options);if(!pay(cost))return false;
 const chance=forgeChance(item,options),success=rand()<chance;
 let destroyed=false;
 if(success)item.enhance=rank;
 else if(!options.protect&&rank>=4){
  if(rank>=7&&rand()<FORGE_RULES.destructionChance){p.equipped[slot]=null;destroyed=true;}
  else item.enhance=Math.max(0,(item.enhance||0)-1);
 }
 p.hp=Math.min(p.hp,maxHP());p.mp=Math.min(p.mp,maxMP());
 forgeResult={success,destroyed,level:destroyed?null:item.enhance,chance,message:success?item.name+' +'+item.enhance:destroyed?item.name+' bol zničený.':'Neúspech · '+item.name+' +'+item.enhance};
 save();updateHUD();return true;
}
function craftForgeSupport(id){
 return Object.hasOwn(FORGE_RULES.recipes,id)&&craftRecipe(id);
}
function dropForgeSupplies(enemy){
 if(!rewardEligible(enemy)||enemy.metinParentId||enemyLevel(enemy)<35)return;
 const chance=enemy.type==='boss'?{forgeCore:.5,smithCharm:.15,protectionScroll:.06}:enemy.type==='stone'?{forgeCore:.08,smithCharm:.04,protectionScroll:.015}:enemy.variant==='rare'?{forgeCore:.15,smithCharm:.05,protectionScroll:.01}:null;
 if(chance)for(const [id,rate]of Object.entries(chance))if(rand()<rate)dropMaterial(id,1,enemy);
}

