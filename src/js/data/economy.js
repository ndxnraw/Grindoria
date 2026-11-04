const ECONOMY_RULES = { schema: 1, refreshSeconds: 600, maxDemand: 10, maxCycles: 1000000 };
const MARKET_GOODS = {
  'catalog-fms': {name:'Meč splnu (FMS)',definitionId:'weapon:fms',count:1,price:3500,stock:1,group:'gear',level:30},
  'catalog-poison': {name:'Jedovatý meč',definitionId:'weapon:poison-sword',count:1,price:35000,stock:1,group:'gear',level:75},
  potions: { name: 'Liečivé elixíry ×3', supply: 'potions', count: 3, price: 25, stock: 20, group: 'supplies' },
  capes: { name: 'Plášte statočnosti ×10', supply: 'braveryCapes', count: 10, price: 100, stock: 5, group: 'supplies' },
  ore: { name: 'Ruda ×5', supply: 'material:ore', count: 5, price: 100, stock: 12, group: 'materials' },
  hide: { name: 'Vyčinená koža ×3', supply: 'material:hide', count: 3, price: 90, stock: 8, group: 'materials' },
  herb: { name: 'Liečivá bylina ×5', supply: 'material:herb', count: 5, price: 100, stock: 10, group: 'materials' },
  essence: { name: 'Esencia ×5', supply: 'material:essence', count: 5, price: 150, stock: 8, group: 'materials' },
  dust: { name: 'Alchymistický prach ×3', supply: 'material:dust', count: 3, price: 240, stock: 5, group: 'materials' },
  extract: { name: 'Bylinný extrakt', supply: 'material:extract', count: 1, price: 180, stock: 4, group: 'materials' },
  crystal: { name: 'Surový kryštál ×2', supply: 'material:crystal', count: 2, price: 500, stock: 3, group: 'materials', level: 20 },
  forgeCore: { name: 'Kováčske jadro', supply: 'material:forgeCore', count: 1, price: 6000, stock: 1, group: 'materials', level: 35 },
  mana: { name: 'Elixír many', supply: 'alchemy:mana', count: 1, price: 140, stock: 6, group: 'supplies' }
};
const MARKET_TRADERS = {
  merchant: { name: 'Obchodník', goods: ['potions','capes','ore','hide','essence'], rare: false },
  armsdealer: { name: 'Zbrojár', goods: ['ore','crystal','forgeCore','catalog-fms','catalog-poison'], rare: true },
  alchemist: { name: 'Alchymista', goods: ['herb','dust','extract','mana'], rare: false }
};
const MARKET_MATERIAL_PRICES = { ore:20, hide:30, herb:20, essence:30, dust:80, extract:180, crystal:250, forgeCore:6000 };
