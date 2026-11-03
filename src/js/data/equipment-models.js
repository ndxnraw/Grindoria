// Model geometry is shared by SVG icons, portraits and the Canvas world.
// Add a model with registerEquipmentModel(slot, id, geometry); never store SVG in saves.
const EQUIPMENT_MODELS = Object.create(null);
function registerEquipmentModel(slot, id, geometry) {
  if (!Object.hasOwn(EQUIPMENT,slot) || !/^[a-z0-9-]+$/.test(id) || typeof geometry !== 'function') throw new Error('Neplatný model výbavy.');
  EQUIPMENT_MODELS[slot] ??= Object.create(null);
  if (Object.hasOwn(EQUIPMENT_MODELS[slot],id)) throw new Error('Duplicitný model výbavy.');
  EQUIPMENT_MODELS[slot][id] = geometry;
}
const EQUIPMENT_LOOKS = [
  {metal:'#b9bdb0',dark:'#504b3d',trim:'#ae8452',gem:'#d17c50'},
  {metal:'#aedbe4',dark:'#314e69',trim:'#e1c98f',gem:'#80e1ed'},
  {metal:'#d0b2de',dark:'#4d315d',trim:'#e9bb68',gem:'#ed9dcf'}
];
function modelPath(d,fill,stroke='#1b2928',width=1.4) { return {d,fill,stroke,width}; }
function modelGem(x,y,size,color) { return modelPath('M'+x+' '+(y-size)+'l'+size+' '+size+'-'+size+' '+size+'-'+size+'-'+size+'Z',color,'#fff0bd',.8); }
const MODEL_SHAPES = {
 weapon: [
  ['M32 3 38 16 36 60 28 60 26 16Z','M21 60h22v6H21zM29 66h6v19h-6zM27 86h10v6H27z'],
  ['M32 2Q49 23 37 59L27 59Q37 28 25 16Z','M14 58q18 11 36-3l-4 13-13-3-15 5ZM29 66h7v21h-7zM25 86h15v7H25z'],
  ['M32 1 44 18 38 32 45 45 37 61H26l-8-16 8-11-6-17Z','M10 60l15-9 7 7 7-7 15 9-8 9-14-4-15 4ZM28 66h8v21h-8zM22 87l10-5 10 5-10 8Z']
 ],
 armor: [
  ['M21 9l11 5 11-5 15 11-8 13-7-3 3 25-14 5-14-5 3-25-7 3-8-13Z','M26 19h12l3 31-9 5-9-5Z'],
  ['M22 6l10 9L42 6l18 12-8 19-10-7 4 25-14 7-14-7 4-25-10 7-8-19Z','M32 18l10 15-10 19-10-19ZM10 18l10 4-6 10m40-14-10 4 6 10'],
  ['M20 7l12 5 12-5 17 4-3 23-12-5 6 29-20 5-20-5 6-29L6 34 3 11Z','M9 15l10 1-5 11ZM55 15l-10 1 5 11ZM32 18l11 14-11 24-11-24Z']
 ],
 helmet: [
  ['M10 51V30Q12 9 32 8q20 1 22 22v21L42 56l-4-18H26l-4 18Z','M29 9h6v25h-6zM14 30h36v5H14z'],
  ['M8 50V28L19 7l13 11L45 7l11 21v22l-16 9-8-18-8 18Z','M32 7l7 20-7 13-7-13ZM12 29l12 3-3 8-9-1m40-10-12 3 3 8 9-1'],
  ['M7 50l4-26L3 2l21 12 8-8 8 8L61 2l-8 22 4 26-15 12-10-19-10 19Z','M30 14h4l6 20-8 12-8-12ZM13 29l11 6-4 6-8-3m39-9-11 6 4 6 8-3']
 ],
 shield: [
  ['M32 4a28 28 0 1 1-.1 0Z','M32 10a22 22 0 1 1-.1 0ZM29 12h6v40h-6zM12 29h40v6H12z'],
  ['M32 2 57 13 50 43 32 62 14 43 7 13Z','M32 10 49 18 43 41 32 53 21 41 15 18ZM32 15l8 16-8 15-8-15Z'],
  ['M32 1 45 12 61 7 55 40 43 47 32 63 21 47 9 40 3 7 19 12Z','M15 15l13 9-10 9 14 18 14-18-10-9 13-9-8 23-9 8-9-8Z']
 ],
 boots: [
  ['M10 8h15l-1 29 8 12v11H4V49l6-15Zm28 0h15l-1 29 8 12v11H32V49l6-15Z','M10 12h15v7H10zM38 12h15v7H38zM4 53h28v7H4zM32 53h28v7H32z'],
  ['M8 3l18 6-3 28 9 11-3 14H2V48l7-13Zm30 0 18 6-3 28 9 11-3 14H32V48l7-13Z','M11 10l9 5-4 17-6-2ZM41 10l9 5-4 17-6-2ZM6 45l20 6-1 6H6zM36 45l20 6-1 6H36z'],
  ['M5 2l11 9L28 2l-3 32 8 12-5 16H1l4-28Zm30 0 11 9L58 2l-3 32 8 12-5 16H31l4-28Z','M12 18l10 7-10 12-6-7ZM42 18l10 7-10 12-6-7ZM3 47l23 4-3 8H3zM33 47l23 4-3 8H33z']
 ],
 bracelet: [
  ['M32 13a24 22 0 1 1-.1 0ZM32 22a15 13 0 1 0 .1 0Z','M11 27l5-8 6 5-4 8ZM48 19l5 8-7 5-4-8Z'],
  ['M32 7 57 21v28L32 62 7 49V21ZM32 19 18 27v16l14 8 14-8V27Z','M27 9h10v14H27zM9 31h11v10H9zM44 31h11v10H44z'],
  ['M32 2 41 12 54 10 51 25 62 35 51 44 53 58 39 55 32 63 23 55 9 58 12 44 2 35 13 25 10 10 24 12ZM32 21 19 29v13l13 10 13-10V29Z','M23 11l9 7 9-7-3 14H26Z']
 ],
 necklace: [
  ['M8 5h4q3 35 20 38Q49 40 52 5h4q-3 40-24 44Q11 45 8 5Z','M32 37l12 12-12 14-12-14Z'],
  ['M4 5h6q4 30 22 32Q50 35 54 5h6Q56 41 32 45 8 41 4 5Z','M32 30l17 16-17 18-17-18ZM32 37l7 9-7 10-7-10Z'],
  ['M5 3l8 2 4 22 15 9 15-9 4-22 8-2-4 30-23 15L9 33Z','M32 28l8 9 16-7-9 20-15 14-15-14-9-20 16 7Z']
 ],
 earrings: [
  ['M17 7a8 8 0 1 1-.1 0ZM47 7a8 8 0 1 1-.1 0Z','M17 24l8 17-8 18-8-18ZM47 24l8 17-8 18-8-18Z'],
  ['M17 3l10 10-10 11L7 13ZM47 3l10 10-10 11-10-11Z','M17 20l12 19-12 24L5 39ZM47 20l12 19-12 24-12-24Z'],
  ['M17 2l6 11 9-4-7 19-8 7-8-7L2 9l9 4ZM47 2l6 11 9-4-7 19-8 7-8-7L32 9l9 4Z','M17 29l10 14-4 18-6-5-6 5-4-18ZM47 29l10 14-4 18-6-5-6 5-4-18Z']
 ],
 belt: [
  ['M2 20h60v25H2Z','M22 17h22v31H22ZM28 24v17h10V24Z'],
  ['M2 19l17 4 13-10 13 10 17-4v29l-17-4-13 9-13-9-17 4Z','M32 16l14 16-14 18-14-18ZM32 25l6 7-6 8-6-8Z'],
  ['M1 16l14 6 17-15 17 15 14-6v34l-14-5-17 13-17-13-14 5Z','M14 24l10 3 8-13 8 13 10-3-6 16-12 9-12-9Z']
 ],
 talisman: [
  ['M20 8q12-12 24 0L32 24ZM18 25h28v55L32 94 18 80Z','M25 34h14l-7 14 9 9-14 4 6 13-9 7Z'],
  ['M32 2l16 10-16 15-16-15ZM12 29l20-8 20 8-4 48-16 18-16-18Z','M32 32l10 15-10 28-10-28ZM17 78l15 8 15-8-15 16Z'],
  ['M32 1l10 8 13-4-8 16-15 9-15-9L9 5l13 4ZM32 23l24 13-9 43-15 17-15-17-9-43Z','M32 31l11 18-11 30-11-30ZM12 36l11 5-6 17ZM52 36l-11 5 6 17Z']
 ]
};
for (const [slot,variants] of Object.entries(MODEL_SHAPES)) variants.forEach((shape,index)=>{
  registerEquipmentModel(slot,slot+'-'+index,look=>[modelPath(shape[0],look.dark,look.trim,2),modelPath(shape[1],look.metal,look.trim,1)]);
});
for (let variant=0;variant<3;variant++) {
  registerEquipmentModel('weapon','bow-'+variant,look=>[
    modelPath(variant===0?'M19 7Q67 48 19 88L23 77Q50 48 23 18Z':variant===1?'M14 3 33 14Q61 47 33 82L14 94 24 73Q44 48 24 23Z':'M9 1l26 12 9 19 11 16-11 16-9 19L9 95 26 72l10-24-10-24Z',look.dark,look.trim,2),
    modelPath('M19 7 19 88M7 48h43l-9-5 9 5-9 5','none',look.metal,2),modelGem(34,48,5,look.gem)]);
  registerEquipmentModel('weapon','daggers-'+variant,look=>[
    modelPath(variant===0?'M18 8l9 17-8 34H11l1-34ZM47 28l8 16-8 33h-8l2-33Z':variant===1?'M18 2Q40 21 19 58H9Q23 25 12 18ZM47 24Q66 40 47 77h-9q13-33 3-40Z':'M17 1l14 18-8 12 6 11-12 20L5 42l8-11-6-12ZM47 24l14 18-8 12 6 11-12 20-12-20 8-11-6-12Z',look.metal,look.trim,1.5),
    modelPath('M4 59h26v5H4zM12 64h8v16h-8zM34 77h26v5H34zM43 82h7v12h-7Z',look.dark,look.trim),modelGem(17,57,4,look.gem)]);
  registerEquipmentModel('weapon','fan-'+variant,look=>[
    modelPath(variant===0?'M32 82 3 27Q30 3 61 27Z':variant===1?'M32 87 1 30 10 8 25 14 32 1 40 14 55 8 63 30Z':'M32 90 1 36 9 4 22 16 32 1 43 16 55 4 63 36Z',look.dark,look.trim,2),
    modelPath('M32 82 9 26M32 82 20 17M32 82 32 12M32 82 44 17M32 82 55 26','none',look.metal,2),modelGem(32,42,10,look.gem)]);
}
