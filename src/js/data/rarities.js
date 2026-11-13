// Stable numeric IDs preserve all pre-0.16 saves: 1=Rare, 2=Epic.
// Always order by rank, never by numeric ID.
const RARITIES = [
 {id:0,name:'Common',rank:0,color:'#bfc5bd',family:0,affixes:0,power:0,market:1},
 {id:3,name:'Uncommon',rank:1,color:'#83ca7b',family:0,affixes:1,power:.5,market:2},
 {id:1,name:'Rare',rank:2,color:'#86bdea',family:1,affixes:2,power:1,market:5},
 {id:2,name:'Epic',rank:3,color:'#cc9ce9',family:2,affixes:3,power:2,market:14},
 {id:4,name:'Legendary',rank:4,color:'#f2b65d',family:2,affixes:4,power:3.5,market:45},
 {id:5,name:'Mythic',rank:5,color:'#f17eaa',family:2,affixes:5,power:5,market:180}
];
const ITEM_GENERATION = {version:1,legendaryLevel:50,mythicLevel:75,maxAttackSpeed:.6,maxPenetration:.5,maxEnemyBonus:1};
const ITEM_AFFIXES = {
 attack:{base:3,scale:.3},hp:{base:25,scale:2},mp:{base:20,scale:1.6},
 crit:{base:.01,scale:.0002,percent:true},penetration:{base:.012,scale:.0002,percent:true},
 attackSpeed:{base:.012,scale:.0002,percent:true},speed:{base:3,scale:.1},
 physicalResist:{base:.015,scale:.0003,percent:true},piercingResist:{base:.015,scale:.0003,percent:true},
 fireResist:{base:.015,scale:.0003,percent:true},poisonResist:{base:.015,scale:.0003,percent:true},
 darkResist:{base:.015,scale:.0003,percent:true},lightningResist:{base:.015,scale:.0003,percent:true},arcaneResist:{base:.015,scale:.0003,percent:true},
 wolfDamage:{base:.025,scale:.0005,percent:true},scorpionDamage:{base:.025,scale:.0005,percent:true},
 yetiDamage:{base:.025,scale:.0005,percent:true},demonDamage:{base:.025,scale:.0005,percent:true},
 metinDamage:{base:.025,scale:.0005,percent:true},bossDamage:{base:.025,scale:.0005,percent:true},bonusExp:{base:.01,scale:.001,percent:true}
};
Object.assign(ITEM_STATS,{penetration:'Prenikavý zásah',attackSpeed:'Rýchlosť útoku',wolfDamage:'Poškodenie · vlci',scorpionDamage:'Poškodenie · škorpióny',yetiDamage:'Poškodenie · yeti',demonDamage:'Poškodenie · démoni',metinDamage:'Poškodenie · Metiny',bossDamage:'Poškodenie · bossovia'});
