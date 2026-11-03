const appearanceCache = new Map();
const appearancePaths = new Map();
function appearanceHash(value) { let n=2166136261; for(const c of value) {n^=c.codePointAt(0);n=Math.imul(n,16777619);}return n>>>0; }
function equipmentAppearance(item) {
  if(!item || !Object.hasOwn(EQUIPMENT,item.slot))return null;
  const rarity=Math.max(0,Math.min(2,Math.floor(Number(item.rarity)||0)));
  const tier=Math.max(1,Math.min(99,Math.floor(Number(item.tier)||Number(item.requiredLevel)||1)));
  const enhance=Math.max(0,Math.min(9,Math.floor(Number(item.enhance)||0)));
  const family=rarity,kind=['bow','daggers','fan'].includes(item.weaponKind)?item.weaponKind:item.slot;
  const models=EQUIPMENT_MODELS[item.slot],fallback=kind+'-'+family;
  const model=typeof item.modelId==='string' && Object.hasOwn(models,item.modelId)?item.modelId:fallback;
  const seed=appearanceHash(String(item.name||EQUIPMENT[item.slot].names[family]));
  const power=Math.max(0,Math.min(1000,Math.floor(Number(item.bonus)||0)));
  const key=[item.slot,model,rarity,tier,enhance,seed,power].join(':');
  if(appearanceCache.has(key))return appearanceCache.get(key);
  const look={...EQUIPMENT_LOOKS[rarity]},height=['weapon','talisman'].includes(item.slot)?96:64;
  const parts=models[model](look);
  // Silhouette extension follows level, not inventory UID or slot coordinates.
  const grade=Math.min(4,Math.floor((tier-1)/20)),crestY=item.slot==='weapon'?59:item.slot==='talisman'?49:32;
  if(grade)parts.push(modelPath('M'+(32-grade*3)+' '+crestY+'l'+grade*3+'-'+(5+grade*2)+' '+grade*3+' '+(5+grade*2)+'-'+grade*3+' '+(5+grade*2)+'Z',look.metal,look.trim,1));
  parts.push(modelGem(32,crestY,2+rarity+grade*.5,look.gem));
  // A fixed name engraving distinguishes legacy/named gear without randomizing copies.
  const emblem=seed%4;
  parts.push(modelPath(emblem===0?'M29 '+crestY+'h6m-3-3v6':emblem===1?'M29 '+(crestY-2)+'l6 4m-6 0 6-4':emblem===2?'M29 '+crestY+'l3-3 3 3-3 3Z':'M29 '+(crestY+2)+'l3-5 3 5Z','none',look.trim,.8));
  const marks=Math.min(5,Math.floor(power/15));
  for(let i=0;i<marks;i++)parts.push(modelPath('M'+(25+i*3)+' '+(crestY+9)+'v3','none',look.trim,.8));
  for(let i=0;i<enhance;i++)parts.push(modelGem(23+(i%5)*4,crestY-12-Math.floor(i/5)*4,1.3,enhance>=6?'#fff2ac':look.gem));
  const result={key,model,slot:item.slot,height,parts,glow:enhance>=6?look.gem:null,grade,rarity,tier};
  if(appearanceCache.size>=256)appearanceCache.delete(appearanceCache.keys().next().value);
  appearanceCache.set(key,result);return result;
}
function equipmentModelSVG(item) {
 const model=equipmentAppearance(item);if(!model)return '';
 return '<g data-equipment-model="'+model.model+'">'+model.parts.map(part=>'<path d="'+part.d+'" fill="'+part.fill+'" stroke="'+part.stroke+'" stroke-width="'+part.width+'" stroke-linejoin="round" fill-rule="evenodd"/>').join('')+'</g>';
}
const WORN_EQUIPMENT = {
 boots:{x:-13,y:-17,w:26,h:19},armor:{x:-19,y:-39,w:38,h:34},
 helmet:{x:-12,y:-58,w:24,h:23},belt:{x:-13,y:-21,w:26,h:11},
 bracelet:{x:-24,y:-29,w:10,h:10},necklace:{x:-7,y:-35,w:14,h:15},
 earrings:{x:-12,y:-44,w:24,h:11},talisman:{x:10,y:-25,w:10,h:19},
 shield:{x:-33,y:-37,w:24,h:32}
};
const PORTRAIT_EQUIPMENT = {
 boots:{x:127,y:386,w:111,h:72},armor:{x:112,y:158,w:138,h:190},
 helmet:{x:130,y:61,w:98,h:104},belt:{x:132,y:284,w:98,h:46},
 bracelet:{x:103,y:252,w:35,h:35},necklace:{x:154,y:180,w:50,h:61},
 earrings:{x:138,y:116,w:82,h:38},talisman:{x:204,y:295,w:31,h:74},
 shield:{x:49,y:238,w:86,h:130}
};
function wornEquipmentSVG(gear,anchors=WORN_EQUIPMENT) {
 return Object.entries(anchors).map(([slot,anchor])=>{
  const item=gear?.[slot];if(!item)return '';
  const model=equipmentAppearance(item);
  return '<g data-worn-slot="'+slot+'" transform="translate('+anchor.x+' '+anchor.y+') scale('+anchor.w/64+' '+anchor.h/model.height+')">'+equipmentModelSVG(item)+'</g>';
 }).join('');
}
function canvasEquipment(item,x,y,w,h) {
 const model=equipmentAppearance(item);if(!model || typeof Path2D==='undefined')return false;
 ctx.save();ctx.translate(x,y);ctx.scale(w/64,h/model.height);
 for(let i=0;i<model.parts.length;i++){
  const part=model.parts[i],key=model.key+':'+i;
  if(!appearancePaths.has(key)){
   if(appearancePaths.size>=4096)appearancePaths.delete(appearancePaths.keys().next().value);
   appearancePaths.set(key,new Path2D(part.d));
  }
  const path=appearancePaths.get(key);ctx.fillStyle=part.fill;ctx.strokeStyle=part.stroke;ctx.lineWidth=part.width;ctx.lineJoin='round';
  if(model.glow){ctx.shadowColor=model.glow;ctx.shadowBlur=2;}
  if(part.fill!=='none')ctx.fill(path,'evenodd');ctx.stroke(path);
 }
 ctx.restore();return true;
}
function drawWornEquipment(gear,x,y,step=0) {
 for(const [slot,a] of Object.entries(WORN_EQUIPMENT)){
  if(slot==='boots'&&gear?.boots){
   // Two independently moving boots keep the walking animation visible.
   ctx.save();ctx.beginPath();ctx.rect(x-15,y-19+step,15,25);ctx.clip();canvasEquipment(gear.boots,x-13,y-17+step,26,19);ctx.restore();
   ctx.save();ctx.beginPath();ctx.rect(x,y-19-step,15,25);ctx.clip();canvasEquipment(gear.boots,x-13,y-17-step,26,19);ctx.restore();
  }else if(gear?.[slot])canvasEquipment(gear[slot],x+a.x,y+a.y,a.w,a.h);
 }
}
function generatedWeaponKind() { return p.classId==='shaman'?'fan':p.classId==='ninja'?(p.schools.ninja==='archery'?'bow':'daggers'):'sword'; }
function equipmentItemName(slot,rarity,weaponKind) {
 const name=EQUIPMENT[slot].names[rarity];
 if(slot==='weapon'&&weaponKind==='daggers')return ['Pútnické dvojdýky','Mesačné dvojdýky','Dračie dvojdýky'][rarity];
 return slot==='weapon'?name.replace('meč',({bow:'luk',daggers:'dvojdýky',fan:'vejár'})[weaponKind]||'meč'):name;
}
