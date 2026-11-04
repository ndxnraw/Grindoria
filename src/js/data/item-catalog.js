const ITEM_DEFINITIONS=Object.create(null);
function registerItemDefinition(def){if(!def||typeof def.id!=='string'||!/^[a-zA-Z0-9:_-]+$/.test(def.id)||Object.hasOwn(ITEM_DEFINITIONS,def.id)||!['equipment','material','consumable','gem','relic'].includes(def.type)||typeof def.name!=='string'||def.type==='equipment'&&!Object.hasOwn(EQUIPMENT,def.slot))throw Error('Neplatná alebo duplicitná definícia predmetu.');ITEM_DEFINITIONS[def.id]=Object.freeze({...def});}
for(const slot of Object.keys(EQUIPMENT))for(const kind of slot==='weapon'?['sword','bow','daggers','fan']:[''])registerItemDefinition({id:'equipment:'+slot+(kind?':'+kind:''),type:'equipment',name:EQUIPMENT[slot].name,slot,weaponKind:kind||undefined,generic:true});
for(const [id,name]of Object.entries(MATERIALS))registerItemDefinition({id:'material:'+id,type:'material',name,rarity:0,modelId:id});
for(const [id,g]of Object.entries(GEMS))registerItemDefinition({id:'gem:'+id,type:'gem',name:g.name,rarity:1,modelId:id});
for(const [id,a]of Object.entries(ALCHEMY_PRODUCTS))registerItemDefinition({id:'alchemy:'+id,type:'consumable',name:a.name,rarity:0,modelId:a.icon});
for(const [id,r]of Object.entries(RELICS))registerItemDefinition({id:'relic:'+id,type:'relic',name:r.name,rarity:2,modelId:'relic-'+id});
registerItemDefinition({id:'potions',type:'consumable',name:'Elixír',rarity:0,modelId:'potion'});registerItemDefinition({id:'braveryCapes',type:'consumable',name:'Plášť statočnosti',rarity:0,modelId:'cape'});
const ICONIC_ITEMS={
 fms:{id:'weapon:fms',name:'Meč splnu (FMS)',level:30,bonus:48,modelId:'fms',classes:['warrior','ninja','sura'],schools:['body','mental','blade','weapon','black'],weaponKind:'sword',baseStats:{attackSpeed:.05}},
 poison:{id:'weapon:poison-sword',name:'Jedovatý meč',level:75,bonus:110,modelId:'poison-sword',classes:['warrior','ninja','sura'],schools:['body','mental','blade','weapon','black'],weaponKind:'sword',baseStats:{attackSpeed:.1}},
 rib:{id:'weapon:red-iron-blade',name:'Čepeľ červeného železa (RIB)',level:30,bonus:60,modelId:'red-iron-blade',classes:['warrior'],schools:['body','mental'],weaponKind:'sword',baseStats:{hp:30}},
 blackleaf:{id:'weapon:black-leaf',name:'Dýky Čierny list',level:30,bonus:44,modelId:'black-leaf',classes:['ninja'],schools:['blade'],weaponKind:'daggers',baseStats:{crit:.025}},
 autumn:{id:'weapon:autumn-fan',name:'Vejár jesenného vetra',level:30,bonus:42,modelId:'autumn-fan',classes:['shaman'],schools:['dragon','healing'],weaponKind:'fan',baseStats:{magic:18}}
};
for(const spec of Object.values(ICONIC_ITEMS))registerItemDefinition({...spec,type:'equipment',slot:'weapon',rarity:spec.level>=75?2:1});
registerEquipmentModel('weapon','fms',look=>[modelPath('M32 2Q53 21 38 57L27 59Q37 31 23 16Z','#d6e5e8','#effcff'),modelPath('M12 55q20 19 40-4l-4 18-16-5-15 7ZM28 66h8v23h-8Z','#6684a5','#c3d6ea'),modelGem(32,59,5,'#9cdaf2')]);
registerEquipmentModel('weapon','poison-sword',look=>[modelPath('M32 1 44 12 38 25 47 36 36 60H25L19 42l9-11-5-15Z','#a3c98b','#e4f8b5'),modelPath('M27 10l9 16-7 16 5 13','none','#405d47',3),modelPath('M9 60l15-10 8 8 8-8 15 10-9 8-14-4-15 4ZM28 66h8v24h-8Z','#53734b','#ceba77'),modelGem(32,59,5,'#82eb78')]);
registerEquipmentModel('weapon','red-iron-blade',look=>[modelPath('M25 1h15l8 12-5 12 6 9-9 25H20l7-19-7-12Z','#ab6254','#f2b194'),modelPath('M31 5v51','none','#f3ccb3',2),modelPath('M10 58h44v8H10ZM28 66h9v23h-9Z','#704935','#d8ae78')]);
registerEquipmentModel('weapon','black-leaf',look=>[modelPath('M18 6 28 22 20 60l-8-10 8-22ZM46 2 56 19 46 57l-8-10 9-22Z','#587a69','#bad2b5'),modelPath('m7 57 22 5-2 6-22-5Zm27-4 24 6-2 6-24-6ZM15 67l7 1-4 21-7-1Zm28-5 7 2-6 23-7-2Z','#474c40','#d2b57d')]);
registerEquipmentModel('weapon','autumn-fan',look=>[modelPath('M32 60 4 26Q30-8 60 26Z','#bd784b','#edc58f'),modelPath('M32 60 9 27m23 33L20 16m12 44V9m0 51 12-44M32 60l23-33','none','#784b39',2),modelPath('m29 55 6 0 3 27-6 8-6-8Z','#c9ac78','#f4dca4'),modelGem(32,34,7,'#e8d390')]);

for(const [key,d]of Object.entries(ICONIC_ITEMS))CRAFT_RECIPES['iconic-'+key]={name:d.name,profession:'crafting',level:d.level===75?10:6,playerLevel:d.level,xp:d.level===75?120:65,cost:d.level===75?{primal:8,ingot:30,crystal:30,forgeCore:5,gold:500000}:{ingot:15,crystal:10,ore:50,gold:50000},output:{definitionId:d.id,slot:'weapon',count:1}};
