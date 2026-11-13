const ECONOMY_RULES = { schema: 1, refreshSeconds: 600, maxDemand: 10, maxCycles: 1000000 };
const ITEM_BONUS_TOOLS = Object.freeze({strengthenItem: 'add', enchantItem: 'reroll'});
const EXPERIENCE_BOOSTS={
 xpRing:{name:'Prsteň skúseností',factor:1.5,seconds:1800,price:900},
 xpGreaterRing:{name:'Prsteň skúseností +200',factor:3,seconds:10800},
 xpLootRing:{name:'Prsteň skúseností z koristi',factor:1.5,seconds:1800},
 xpKnowledge:{name:'Elixír vedomostí',factor:2,seconds:3600,price:2400},
 xpAscension:{name:'Elixír vzostupu',factor:1.8,seconds:10800,price:1800}
};
for(const [id,boost] of Object.entries(EXPERIENCE_BOOSTS))MATERIALS[id]=boost.name;
MATERIALS.xpChest='Truhla skúseností';
const MARKET_GOODS = {
  strengthenItem: {name:'Zosilniť predmet',supply:'material:strengthenItem',count:1,price:750,stock:20,group:'materials'},
  enchantItem: {name:'Začarovať predmet',supply:'material:enchantItem',count:1,price:500,stock:20,group:'materials'},
  'catalog-fms': {name:'Úplňkový meč',definitionId:'weapon:fms',count:1,price:3500,stock:1,group:'gear',level:30},
  'catalog-poison': {name:'Jedovatý meč',definitionId:'weapon:poison-sword',count:1,price:35000,stock:1,group:'gear',level:75},
  potions: { name: 'Liečivé elixíry ×3', supply: 'potions', count: 3, price: 25, stock: 20, group: 'supplies' },
  capes: { name: 'Plášte statočnosti ×10', supply: 'braveryCapes', count: 10, price: 100, stock: 5, group: 'supplies' },
  ore: { name: 'Ruda ×5', supply: 'material:ore', count: 5, price: 100, stock: 12, group: 'materials' },
  hide: { name: 'Vyčinená koža ×3', supply: 'material:hide', count: 3, price: 90, stock: 8, group: 'materials' },
  herb: { name: 'Liečivá bylina ×5', supply: 'material:herb', count: 5, price: 100, stock: 10, group: 'materials' },
  essence: { name: 'Esencia ×5', supply: 'material:essence', count: 5, price: 150, stock: 8, group: 'materials' },
  dust: { name: 'Kováčsky prach ×3', supply: 'material:dust', count: 3, price: 240, stock: 5, group: 'materials' },
  crystal: { name: 'Surový kryštál ×2', supply: 'material:crystal', count: 2, price: 500, stock: 3, group: 'materials', level: 20 },
  forgeCore: { name: 'Kováčske jadro', supply: 'material:forgeCore', count: 1, price: 6000, stock: 1, group: 'materials', level: 35 },
};
for(const [id,boost] of Object.entries(EXPERIENCE_BOOSTS))if(boost.price)
 MARKET_GOODS[id]={name:boost.name,supply:'material:'+id,count:1,price:boost.price,stock:5,group:'supplies'};
const MARKET_TRADERS = {
  merchant: { name: 'Obchodník', goods: ['potions','capes','ore','hide','essence','herb','dust','strengthenItem','enchantItem',...Object.keys(EXPERIENCE_BOOSTS).filter(id=>EXPERIENCE_BOOSTS[id].price)], rare: false },
  armsdealer: { name: 'Zbrojár', goods: ['ore','crystal','forgeCore','catalog-fms','catalog-poison'], rare: true },
};
const MARKET_MATERIAL_PRICES = { ore:20, hide:30, herb:20, essence:30, dust:80, crystal:250, forgeCore:6000 };
