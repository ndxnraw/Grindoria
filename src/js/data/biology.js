const BIOLOGY = [
  { name: 'Život údolia', map: 'valley', level: 1, item: 'wolf', count: 10, bonus: { hp: 80 }, text: '+80 maximálneho zdravia' },
  { name: 'Jed púšte', map: 'desert', level: 8, item: 'venom', count: 12, bonus: { attack: 12 }, text: '+12 útok' },
  { name: 'Odolnosť mrazu', map: 'snow', level: 18, item: 'frost', count: 15, bonus: { defense: 12 }, text: '+12 obrana' },
  { name: 'Srdce plameňa', map: 'temple', level: 35, item: 'ember', count: 20, bonus: { crit: .04, mp: 100 }, text: '+4 % kritický zásah a +100 mana' }
];

const BIOLOGY_MATERIALS={ancientVenom:'Koncentrovaný jed',frozenMarrow:'Mrazivá dreň',demonHeart:'Démonické srdce',ancientOrgan:'Prastarý orgán'};
Object.assign(MATERIALS,BIOLOGY_MATERIALS);
const BIOLOGY_RULES={killGap:5};
BIOLOGY.forEach((stage,index)=>Object.assign(stage,{id:stage.item,dropEvery:[4,6,8,10][index],cooldown:0,fee:25*(index+1),source:'Príšery danej mapy'}));
BIOLOGY.push(
 {id:'ancientVenom',name:'Koncentrácia jedu',map:'quarry',level:40,item:'ancientVenom',count:15,bonus:{hp:180,speed:8},text:'+180 zdravie, +8 rýchlosť pohybu',cooldown:120,fee:200,variants:['elite','rare'],chance:.25,pity:8,source:'Elitní a vzácni kamenní strážcovia'},
 {id:'frozenMarrow',name:'Výskum mrazivej drene',map:'highlands',level:55,item:'frozenMarrow',count:20,bonus:{hp:280,defense:18},text:'+280 zdravie, +18 obrana',cooldown:180,fee:400,variants:['elite','rare'],chance:.2,pity:10,source:'Elitní a vzácni búrkoví strážcovia'},
 {id:'demonHeart',name:'Výskum démonického srdca',map:'ruins',level:70,item:'demonHeart',count:25,bonus:{attack:35,magic:25},text:'+35 útok, +25 sila kúziel',cooldown:300,fee:800,variants:['rare'],chance:.2,pity:10,source:'Vzácni démonickí lovci'},
 {id:'ancientOrgan',name:'Výskum prastarého orgánu',map:'wastes',level:85,item:'ancientOrgan',count:12,bonus:{hp:500,defense:25,speed:10},text:'+500 zdravie, +25 obrana, +10 rýchlosť pohybu',cooldown:600,fee:1500,boss:true,chance:.35,pity:3,source:'Vládca pustatiny'}
);
