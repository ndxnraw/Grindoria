const BIOLOGY = [
  { name: 'Život údolia', map: 'valley', level: 1, item: 'wolf', count: 10, bonus: { hp: 30 }, text: '+30 maximálneho zdravia' },
  { name: 'Jed púšte', map: 'desert', level: 5, item: 'venom', count: 12, bonus: { attack: 6 }, text: '+6 útok' },
  { name: 'Odolnosť mrazu', map: 'snow', level: 12, item: 'frost', count: 15, bonus: { defense: 5 }, text: '+5 obrana' },
  { name: 'Srdce plameňa', map: 'temple', level: 25, item: 'ember', count: 20, bonus: { crit: .04, mp: 30 }, text: '+4 % kritický zásah a +30 mana' }
];

const BIOLOGY_MATERIALS={ancientVenom:'Koncentrovaný jed',frozenMarrow:'Mrazivá dreň',demonHeart:'Démonické srdce',ancientOrgan:'Prastarý orgán'};
Object.assign(MATERIALS,BIOLOGY_MATERIALS);
const BIOLOGY_RULES={killGap:10};
BIOLOGY.forEach((stage,index)=>Object.assign(stage,{id:stage.item,dropEvery:[4,6,8,10][index],cooldown:0,fee:25*(index+1),source:'Príšery danej mapy'}));
BIOLOGY.push(
 {id:'ancientVenom',name:'Koncentrácia jedu',map:'desert',level:40,item:'ancientVenom',count:15,bonus:{hp:60,speed:12},text:'+60 zdravie, +12 rýchlosť pohybu',cooldown:300,fee:500,variants:['elite','rare'],chance:.2,pity:10,source:'Elitné a vzácne škorpióny'},
 {id:'frozenMarrow',name:'Výskum mrazivej drene',map:'snow',level:55,item:'frozenMarrow',count:20,bonus:{hp:120,defense:8},text:'+120 zdravie, +8 obrana',cooldown:600,fee:1000,variants:['elite','rare'],chance:.12,pity:16,source:'Elitní a vzácni yetiovia'},
 {id:'demonHeart',name:'Výskum démonického srdca',map:'temple',level:70,item:'demonHeart',count:25,bonus:{attack:18,magic:12},text:'+18 útok, +12 sila kúziel',cooldown:1200,fee:2500,variants:['rare'],chance:.08,pity:20,source:'Vzácni chrámoví démoni'},
 {id:'ancientOrgan',name:'Výskum prastarého orgánu',map:'temple',level:85,item:'ancientOrgan',count:30,bonus:{hp:180,defense:12,speed:8},text:'+180 zdravie, +12 obrana, +8 rýchlosť pohybu',cooldown:1800,fee:5000,boss:true,chance:.05,pity:25,source:'Pán plameňov'}
);
