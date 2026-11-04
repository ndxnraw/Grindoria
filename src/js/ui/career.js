const forgeOptions={};
function costLabel(cost) {
  return Object.entries(cost).map(([id, n]) => n.toLocaleString('sk-SK') + ' ' + (id === 'gold' ? 'Yang' : MATERIALS[id])).join(' · ') || 'bez poplatku';
}

function careerOverview(){const b=careerBonuses();return '<div class="career-metrics"><div>Úroveň <b>'+p.level+' / 99</b></div><div>Výskum <b>'+p.career.biology.stage+' / '+BIOLOGY.length+'</b></div></div><h3>Trvalé bonusy</h3><p>Útok +'+b.attack+' · obrana +'+b.defense+' · zdravie +'+b.hp+' · mana +'+b.mp+'</p><h3>Materiály</h3><div class="material-grid">'+Object.entries(MATERIALS).map(([id,name])=>'<div>'+name+'<b>'+uiNumber(p.career.materials[id])+'</b></div>').join('')+'</div>';}
function careerPanel(tab='overview'){
 if(!running)return false;
 const tabs={overview:['Prehľad',careerOverview],items:['Predmety',itemCatalogPanel],discovery:['Bestiár a zbierky',discoveryPanel],biology:['Biologický výskum',()=>biologyContent(false)]};
 if(!Object.hasOwn(tabs,tab))return false;careerTab=tab;
 modal('<h2>'+tabs[tab][0]+'</h2><nav class="career-tabs">'+Object.entries(tabs).map(([id,[name]])=>'<button data-career-tab="'+id+'" aria-pressed="'+(id===tab)+'">'+name+'</button>').join('')+'</nav>'+tabs[tab][1](),{key:'career:'+tab,refresh:()=>careerPanel(tab)});
 panelQueryAll('[data-career-tab]').forEach(button=>button.onclick=()=>careerPanel(button.dataset.careerTab));if(tab==='discovery')bindDiscoveryUI();return true;
}

function itemCatalogPanel(){return '<div class="item-catalog">'+Object.entries(ICONIC_ITEMS).map(([key,d])=>{
const preview={slot:'weapon',name:d.name,modelId:d.modelId,rarity:ITEM_DEFINITIONS[d.id].rarity,tier:d.level,bonus:d.bonus,weaponKind:d.weaponKind};
const chance=ICONIC_DROP_ENTRIES.find(e=>e.definitionId===d.id).chance;
return '<div class="career-card">'+itemIcon(preview)+'<h3>'+d.name+'</h3><p>Vyžaduje úroveň '+d.level+' · '+d.classes.map(id=>CLASSES[id].name).join(', ')+'</p><p>Útok +'+d.bonus+' · '+Object.entries(d.baseStats).map(([stat,n])=>ITEM_STATS[stat]+' '+signedItemStat(stat,n)).join(' · ')+'</p><p>Bossovia a Metiny od úrovne '+d.level+': '+(chance*100)+' % za zbraň. Výroba: kováč, remeslo '+CRAFT_RECIPES['iconic-'+key].level+'.'+(['fms','poison'].includes(key)?' Predaj: zbrojár.':'')+'</p></div>';
}).join('')+'</div>';}
