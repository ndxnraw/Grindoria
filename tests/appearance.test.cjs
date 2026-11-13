const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,readSavedProfile}=require('./helpers/game.cjs');
function item(slot,rarity=0,tier=1,extra={}){return {slot,name:slot+' '+rarity,rarity,tier,requiredLevel:tier,bonus:10,enhance:0,...extra};}
test('all 50 registered models have distinct silhouettes and every slot has three actual shapes',()=>{
 const {run}=createGame();const shapes=new Set();let total=0;
 for(const slot of Object.keys(run('EQUIPMENT'))) {
  const variants=run('Object.keys(EQUIPMENT_MODELS["'+slot+'"])');assert(variants.length>=3);
  for(const model of variants){const gear=item(slot,0,1,{modelId:model});const shape=run('equipmentAppearance('+JSON.stringify(gear)+').parts[0].d');assert(!shapes.has(shape),model);shapes.add(shape);total++;}
 }assert.equal(total,50);
});
test('identity survives moving, equipping, serial changes and reload while tier, strength and enhancements alter visible detail',()=>{
 const {run,saved}=createGame();const gear=item('weapon',2,65,{name:'Dračí meč'});
 run('var gear='+JSON.stringify(gear)+';var before=itemIcon(gear);gear.uid=777;gear.cell=12;');assert.equal(run('itemIcon(gear)'),run('before'));
 for(const update of [{tier:85},{enhance:9},{bonus:75},{name:'Strážcov meč'}])assert.notEqual(run('itemIcon({...gear,...'+JSON.stringify(update)+'})'),run('before'));
 run('p.level=99;addGearItem(gear);equipItem(0);closeModal();var equippedIcon=itemIcon(p.equipped.weapon);save();');
 assert.equal(run('equippedIcon'),run('before'));const reload=createGame(readSavedProfile(saved));assert.equal(reload.run('itemIcon(p.equipped.weapon)'),run('before'));
});
test('all worn slots appear in portrait and inventory previews, swap immediately, and unequipping removes the overlay',()=>{
 const {run}=createGame();run('p.level=99;');
 for(const slot of Object.keys(run('EQUIPMENT'))){run('addGearItem('+JSON.stringify(item(slot,1,20))+');equipItem(p.bag.length-1);closeModal();');}
 let avatar=run('characterAvatar({classId:p.classId,data:p})');
 for(const slot of Object.keys(run('EQUIPMENT')))assert.match(avatar,new RegExp('data-worn-slot="'+slot+'"'));
 assert.match(run('equipmentFigure()'),/data-equipment-model="helmet-0"/);
 run('var oldStats=equipmentBonuses();addGearItem('+JSON.stringify(item('armor',2,40,{bonus:50}))+');equipItem(p.bag.length-1);closeModal();');
 assert.match(run('equipmentFigure()'),/data-equipment-model="armor-1"/);assert(run('equipmentBonuses().defense>oldStats.defense'));
 run('unequipItem("shield");closeModal();');assert.doesNotMatch(run('characterAvatar({classId:p.classId,data:p})'),/data-worn-slot="shield"/);
});
test('world draws the same registered paths for every slot, mirrors with facing and preserves animation',()=>{
 const {run}=createGame();run('var Path2D=class{constructor(d){this.d=d;}};var drawn=[];ctx.fill=(path)=>{if(path)drawn.push(path.d);};var scales=[];ctx.scale=(x,y)=>scales.push([x,y]);p.level=99;');
 for(const slot of Object.keys(run('EQUIPMENT')))run('p.equipped["'+slot+'"]='+JSON.stringify(item(slot,2,70,{enhance:7}))+';');
 run('face=Math.PI;keys.w=true;hero();');
 assert(run('scales.some(s=>s[0]===-1&&s[1]===1)'));
 for(const slot of Object.keys(run('EQUIPMENT')))assert(run('drawn.includes(equipmentAppearance(p.equipped["'+slot+'"]).parts[0].d)'),slot);
 const first=run('drawn.join("|")');run('drawn.length=0;p.equipped.weapon.enhance=0;hero();');assert.notEqual(run('drawn.join("|")'),first);
});
test('new weapons use all catalog families allowed for the active class and keep legacy item data intact',()=>{
 const {run}=createGame();run('rand=()=>0;');
 for(const [cls,school,kind]of [['warrior','body','sword'],['warrior','body','greatsword'],['sura','weapon','sword'],['ninja','blade','daggers'],['ninja','archery','bow'],['shaman','dragon','fan'],['shaman','dragon','bell']]){
  run('p.classId="'+cls+'";p.schools[p.classId]="'+school+'";var gear=rewardEquipment("weapon",2,10,"'+kind+'");');assert.equal(run('gear.weaponKind'),kind);assert.equal(run('gear.slot'),'weapon');assert.equal(run('gear.bonus'),run('ITEM_DEFINITIONS[gear.definitionId].bonus'));
  assert.match(run('itemIcon(gear)'),new RegExp('data-equipment-model="'+(kind==='sword'?'weapon':kind)+'-0"'));
 }
 const legacy={slot:'weapon',name:'Pamiatka',bonus:12};run('var legacy='+JSON.stringify(legacy)+';itemIcon(legacy);');assert.equal(run('JSON.stringify(legacy)'),JSON.stringify(legacy));
});
test('safe model extension is shared by SVG and canvas; imported unknown models and weapon kinds are rejected',()=>{
 const {run}=createGame();run('registerEquipmentModel("shield","sun-disc",look=>[modelPath("M5 5h54v54H5Z",look.metal)]);');
 assert.match(run('itemIcon('+JSON.stringify(item('shield',0,1,{modelId:'sun-disc'}))+')'),/sun-disc/);
 assert.throws(()=>run('registerEquipmentModel("shield","sun-disc",()=>[])'),/Duplicitný/);
 assert.throws(()=>run('validateCharacterItem('+JSON.stringify(item('shield',0,1,{modelId:'fake'}))+')'),/model/);
 assert.throws(()=>run('validateCharacterItem('+JSON.stringify(item('weapon',0,1,{weaponKind:'script'}))+')'),/typ/);
 assert.doesNotMatch(run('itemIcon('+JSON.stringify(item('weapon',0,1,{name:'<script>alert(1)</script>',modelId:'<script>'}))+')'),/<script>/);
});
test('ground icon cache keys distinguish same rarity gear by model, level and enhancement and stay bounded',()=>{
 const {run}=createGame();run('var Image=class{constructor(){this.complete=true;this.naturalWidth=64;}};');
 run('var a='+JSON.stringify(item('armor',1,1))+';var b={...a,tier:70};var c={...a,enhance:9};');
 assert.notEqual(run('groundIcon(a).src'),run('groundIcon(b).src'));assert.notEqual(run('groundIcon(a).src'),run('groundIcon(c).src'));
 run('for(var i=0;i<300;i++)groundIcon({...a,name:"Variant "+i});');assert(run('groundIconCache.size<=256'));assert(run('appearanceCache.size<=256'));
});
test('all active supplies use distinct geometry and retired item definitions are absent',()=>{const {run}=createGame();const svg=new Set();for(const id of [...Object.keys(run('MATERIALS')),'potion','cape']){const body=run('itemIcon({icon:"'+id+'"})').replace(/#[0-9a-f]{3,8}/gi,'COLOR');assert(!svg.has(body),id);svg.add(body);}assert(run('Object.keys(ITEM_DEFINITIONS).every(id=>!id.startsWith("gem:")&&!id.startsWith("relic:")&&!id.startsWith("alchemy:"))'));});
