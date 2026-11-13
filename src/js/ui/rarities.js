function itemGenerationDescription(item) {
 if(item.generationVersion!==ITEM_GENERATION.version)return '';
 const quality=itemRollQuality(item),perfect=item.affixes.filter(affix=>affix.roll>=95).length;
 return '<div class="item-roll-info">'+(item.affixes.length?'<p>Bonusy: '+item.affixes.length+' · kvalita '+quality.toFixed(1)+' %'+(perfect?' · hody 95+ '+perfect:'')+'</p>':'')+'<p>Trhový odhad: <b>'+itemMarketValue(item).toLocaleString('sk-SK')+' Yang</b><br>Výkup: '+marketGearSaleValue(item).toLocaleString('sk-SK')+' Yang'+(itemSynergy(item)?'<br>Synergie: '+itemSynergy(item)+'':'')+'</p></div>';
}
