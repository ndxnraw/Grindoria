let marketSalePending=null;
function marketPanel(trader='merchant') {
 const available=marketCanTrade(trader),prior=gameWindows.get('market:'+trader);
 if(!available&&!prior){toast('Priblíž sa k obchodníkovi v Meste.');return;}
 const cycle=p.economy.cycle,offers=marketOffers(trader),cfg=MARKET_TRADERS[trader];
 const entries=offers.map(o=>({id:o.id,item:o.item||serviceSupplyIcon(o.supply),label:o.name,badge:o.item?'+'+(o.item.enhance||0):o.count,meta:uiNumber(o.price)+' Yang · zásoba '+o.stock,blocked:!available||!o.stock||p.gold<o.price||p.level<o.level}));
 const selected=entries.find(e=>e.id===prior?.marketSelected)||entries[0],id=selected?.id;
 let detail='<p class="service-empty">Ponuka je prázdna.</p>';
 if(selected){
  const o=offers.find(o=>o.id===id);
  detail='<div class="service-detail-heading"><span class="service-preview">'+itemIcon(selected.item)+'</span><h3>'+escapeHTML(selected.label)+'</h3></div>'+(o.item?serviceItemDetails(o.item):'<p>'+o.count+' ks v balení · máš '+uiNumber(supplyDefinitions().find(s=>s.id===o.supply)?.count||0)+' ks</p>')+'<p class="'+(!o.item&&p.level<o.level?'stat-loss':'')+'">'+(!o.item&&o.level>1?'Úroveň '+o.level+'+ · ':'')+'zásoba '+o.stock+' balení</p><p class="market-price '+(p.gold<o.price?'stat-loss':'')+'">◉ <b>'+uiNumber(o.price)+'</b> Yang</p><button class="primary service-action" '+(o.id==='potions'?'id="buyPotion"':o.id==='capes'?'id="buyCapes"':'')+' data-market-buy="'+o.id+'" '+(selected.blocked?'disabled':'')+'>'+(o.id==='potions'?'Kúpiť 3 elixíry':'Kúpiť')+'</button>';
 }
 modal('<section class="market-panel service-panel"><div class="service-summary"><span>Obnova '+Math.ceil((ECONOMY_RULES.refreshSeconds-p.economy.elapsed)/60)+' min</span></div>'+(!available?'<p class="service-unavailable">Priblíž sa k obchodníkovi.</p>':'')+'<div class="service-layout"><div class="service-bag">'+serviceTileGrid(entries,id,'market-select',prior?.servicePage||0,true)+'</div><section class="service-details">'+detail+'</section></div><p id="shopmsg" role="status">'+escapeHTML(marketMessage)+'</p></section>',{key:'market:'+trader,title:cfg.name,refresh:()=>marketPanel(trader)});
 const entry=activeGameWindow;entry.marketSelected=id||'';
 const finish=ok=>{if(activeGameWindow!==entry)frontGameWindow(entry);if(ok){marketPanel(trader);toast(marketMessage);}else{$('shopmsg').textContent=marketMessage||'Obchod nie je dostupný.';clampGameWindow(entry);}};
 panelQueryAll('[data-market-select]').forEach(b=>b.onclick=()=>{entry.marketSelected=b.dataset.marketSelect;marketPanel(trader);});
 panelQueryAll('[data-service-page]').forEach(b=>b.onclick=()=>{entry.servicePage=Number(b.dataset.servicePage);marketPanel(trader);});
 panelQueryAll('[data-market-buy]').forEach(b=>b.onclick=()=>{const o=offers.find(o=>o.id===b.dataset.marketBuy);finish(buyMarketOffer(trader,o.id,o.price,cycle));});
 if(trader==='merchant')for(const [button,key]of [['buyPotion','potions'],['buyCapes','capes']]){const o=offers.find(o=>o.id===key);if(id===key&&$(button))$(button).onclick=()=>finish(buyMarketOffer(trader,key,o.price,cycle));}
 entry.node.ondragover=event=>{if(!inventoryDrag)return;event.preventDefault();event.dataTransfer.dropEffect=marketSaleQuote(trader,inventoryDrag.id)?'move':'none';};
 entry.node.ondrop=event=>{if(!inventoryDrag)return;event.preventDefault();event.stopPropagation();const itemId=inventoryDrag.id;finishInventoryItemDrag();withGameWindow(entry.key,()=>{if(!requestMarketSale(trader,itemId)){marketMessage='Tento predmet nemožno predať alebo je obchodník príliš ďaleko.';const message=$('shopmsg');if(message)message.textContent=marketMessage;clampGameWindow(entry);}});};
}
function marketSaleQuote(trader,id){
 if(!marketCanTrade(trader))return null;
 const entry=inventoryEntry(id);if(!entry)return null;
 if(entry.kind==='gear')return {entry,price:marketGearSaleValue(entry.item,trader)};
 if(entry.kind==='supply'&&entry.item.material&&Object.hasOwn(MARKET_MATERIAL_PRICES,entry.item.material))return {entry,price:marketMaterialSaleValue(entry.item.material,trader)};
 return null;
}
function requestMarketSale(trader,id){
 const quote=marketSaleQuote(trader,id);if(!quote)return false;
 if(gameWindows.has('inventory-drop'))closeModal('inventory-drop');
 if(gameWindows.has('market-sale'))closeModal('market-sale');
 marketSalePending={id,trader,characterId:characterStore.activeId,mapId:p.mapId,cycle:p.economy.cycle,price:quote.price,instanceId:quote.entry.item.instanceId};finishInventoryItemDrag();marketSaleDialog();return true;
}
function marketSaleDialog(){
 const pending=marketSalePending,entry=pending&&inventoryEntry(pending.id);if(!entry)return false;
 modal('<section class="market-sale-confirm" role="alertdialog" aria-label="Potvrdenie predaja"><div class="service-detail-heading"><span class="service-preview">'+itemIcon(entry.kind==='gear'?entry.item:serviceSupplyIcon(entry.id))+'</span><h3>'+escapeHTML(entry.item.name)+(entry.kind==='gear'?' +'+(entry.item.enhance||0):'')+'</h3></div><p>Výkup: <b>'+uiNumber(pending.price)+' Yang'+(entry.kind==='supply'?' / ks':'')+'</b></p>'+(entry.kind==='supply'?'<label>Počet kusov <input id="market-sale-count" type="number" min="1" max="'+Math.min(1000,entry.item.count)+'" step="1" value="1"></label><p id="market-sale-total"></p>':'')+'<div class="ui-actions"><button id="market-sale-cancel">Zrušiť</button><button id="market-sale-confirm" class="danger">Potvrdiť predaj</button></div><p id="market-sale-error" role="status"></p></section>',{key:'market-sale',title:'Predaj predmetu'});
 $('market-sale-cancel').onclick=()=>closeModal('market-sale');$('market-sale-confirm').onclick=confirmPendingMarketSale;
 if(entry.kind==='supply'){
  const input=$('market-sale-count');input.oninput=()=>{const count=Number(input.value);$('market-sale-total').textContent=Number.isSafeInteger(count)&&count>0&&count<=Math.min(1000,entry.item.count)?'Spolu: '+uiNumber(pending.price*count)+' Yang':'Zadaj platný počet kusov.';clampGameWindow(gameWindows.get('market-sale'));};input.oninput();input.focus({preventScroll:true});
 }else $('market-sale-confirm').focus({preventScroll:true});return true;
}
function confirmMarketSale(count=1){
 marketMessage='';const pending=marketSalePending;
 if(!pending||pending.characterId!==characterStore.activeId||pending.mapId!==p.mapId||pending.cycle!==p.economy.cycle||!gameWindows.has('market:'+pending.trader)||!Number.isSafeInteger(count)||count<1)return false;
 const quote=marketSaleQuote(pending.trader,pending.id);if(!quote||quote.entry.item.instanceId!==pending.instanceId)return false;
 if(quote.price!==pending.price){marketMessage='Cena sa zmenila. Vlož predmet do obchodu znova.';return false;}
 const entry=quote.entry;if(entry.kind==='gear'&&count!==1||entry.kind==='supply'&&(count>entry.item.count||count>1000))return false;
 const ok=entry.kind==='gear'?sellMarketGear(entry.item.uid,pending.trader):sellMarketMaterial(pending.trader,entry.item.material,count);
 if(!ok)return false;
 closeModal('market-sale');withGameWindow('market:'+pending.trader,()=>marketPanel(pending.trader));withGameWindow('inventory',inventory);toast(marketMessage);return true;
}
function confirmPendingMarketSale(){
 const entry=marketSalePending&&inventoryEntry(marketSalePending.id);if(!entry)return false;
 if(confirmMarketSale(entry.kind==='supply'?Number($('market-sale-count').value):1))return true;
 const message=$('market-sale-error');if(message)message.textContent=marketMessage||'Predaj sa nepodaril. Skontroluj predmet, počet a obchodníka.';const dialog=gameWindows.get('market-sale');if(dialog)clampGameWindow(dialog);return false;
}
function fitMarketLayout(entry){
 const bar=entry.node.querySelector('.window-titlebar'),border=Math.max(0,entry.node.offsetHeight-entry.node.clientHeight),budget=Math.max(1,parseFloat(entry.node.style.maxHeight)-bar.getBoundingClientRect().height-border);
 entry.node.classList.toggle('market-compact',budget<300);
 for(let unit=12;unit>=8;unit--){entry.node.style.setProperty('--market-unit',unit+'px');if(!(entry.content.scrollHeight>budget))break;}
 entry.body.scrollTop=0;entry.body.scrollLeft=0;
}
