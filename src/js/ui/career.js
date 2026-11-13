const forgeOptions={};
function costLabel(cost) {
  return Object.entries(cost).map(([id, n]) => n.toLocaleString('sk-SK') + ' ' + (id === 'gold' ? 'Yang' : MATERIALS[id])).join(' · ') || 'bez poplatku';
}

function careerOverview(){const b=careerBonuses();return '<div class="career-metrics"><div>Úroveň <b>'+p.level+' / '+PROGRESSION.maxLevel+'</b></div></div><h3>Trvalé bonusy</h3><p>Útok +'+b.attack+' · obrana +'+b.defense+' · zdravie +'+b.hp+' · mana +'+b.mp+'</p><h3>Materiály</h3><div class="material-grid">'+Object.entries(MATERIALS).map(([id,name])=>'<div>'+name+'<b>'+uiNumber(p.career.materials[id])+'</b></div>').join('')+'</div>';}
function careerPanel(tab='overview'){
 if(!running)return false;
 const tabs={overview:['Prehľad',careerOverview],discovery:['Bestiár a zbierky',discoveryPanel],metins:['Atlas Metinov',metinCodexContent]};
 if(!Object.hasOwn(tabs,tab))return false;careerTab=tab;
 modal('<h2>'+tabs[tab][0]+'</h2>'+(tab==='overview'?'<nav class="career-tabs">'+Object.entries(tabs).map(([id,[name]])=>'<button data-career-tab="'+id+'" aria-pressed="'+(id===tab)+'">'+name+'</button>').join('')+'</nav>':'')+tabs[tab][1](),{key:'career:'+tab,refresh:()=>careerPanel(tab)});
 panelQueryAll('[data-career-tab]').forEach(button=>button.onclick=()=>careerPanel(button.dataset.careerTab));if(tab==='discovery')bindDiscoveryUI();return true;
}
