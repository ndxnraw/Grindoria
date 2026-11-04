const INVENTORY = { schema: 1, columns: 5, rows: 9, pageSize: 45, pages: 5 };
const EQUIPMENT = {
  weapon: { name: 'Zbraň', size: [1, 3], stat: 'attack', base: 4, scale: .6, rare: 9, names: ['Pútnický meč', 'Mesačný meč', 'Dračí meč'] },
  armor: { name: 'Brnenie', size: [2, 3], stat: 'defense', base: 2, scale: .25, rare: 3, names: ['Pútnická zbroj', 'Mesačná zbroj', 'Dračia zbroj'] },
  helmet: { name: 'Prilba', size: [2, 1], stat: 'defense', base: 1, scale: .12, rare: 2, names: ['Železná prilba', 'Mesačná prilba', 'Dračia prilba'] },
  shield: { name: 'Štít', size: [2, 2], stat: 'defense', base: 2, scale: .18, rare: 3, names: ['Okrúhly štít', 'Mesačný štít', 'Dračí štít'] },
  boots: { name: 'Obuv', size: [2, 2], stat: 'speed', base: 3, scale: .12, rare: 3, names: ['Kožené čižmy', 'Tieňové čižmy', 'Dračie čižmy'] },
  bracelet: { name: 'Náramok', size: [1, 1], stat: 'hp', base: 15, scale: 1.5, rare: 20, names: ['Medený náramok', 'Strieborný náramok', 'Dračí náramok'] },
  necklace: { name: 'Náhrdelník', size: [1, 1], stat: 'mp', base: 12, scale: 1.2, rare: 15, names: ['Medený náhrdelník', 'Mesačný náhrdelník', 'Dračí náhrdelník'] },
  earrings: { name: 'Náušnice', size: [1, 1], stat: 'magic', base: 2, scale: .2, rare: 4, names: ['Medené náušnice', 'Mesačné náušnice', 'Dračie náušnice'] },
  belt: { name: 'Opasok', size: [2, 1], stat: 'defense', base: 1, scale: .1, rare: 2, names: ['Kožený opasok', 'Strážcov opasok', 'Dračí opasok'] },
  talisman: { name: 'Talizman', size: [1, 2], stat: 'crit', base: 1, scale: .025, rare: 1, names: ['Pečať pútnika', 'Mesačná pečať', 'Dračia pečať'] }
};
const ITEM_STATS = { attack: 'Útok', defense: 'Obrana', hp: 'Max. zdravie', mp: 'Max. mana', magic: 'Sila kúziel', speed: 'Rýchlosť pohybu', crit: 'Kritický zásah' };
