const FORGE_RULES={
 success:[0,.95,.93,.9,.85,.75,.65,.55,.45,.35],
 bonus:[0,2,4,7,10,14,19,25,32,40],
 bonuses:{defense:[0,1,2,3,5,7,10,13,17,22],hp:[0,10,22,36,55,80,110,145,180,220],mp:[0,10,20,32,48,68,92,120,155,195],magic:[0,2,4,7,10,14,19,25,32,40],speed:[0,1,2,3,4,6,8,10,12,15],crit:[0,.4,.8,1.3,1.9,2.6,3.4,4.3,5.3,6.5]},
 destructionChance:.15,charmBoost:.1,
 recipes:{smithCharm:{forgeCore:1,essence:30,gold:1000},protectionScroll:{forgeCore:2,dust:25,books:3,gold:3000}}
};
Object.assign(MATERIALS,{forgeCore:'Kováčske jadro',smithCharm:'Talizman kováča',protectionScroll:'Ochranný zvitok'});

// Additive migration for profiles and backups written before forge supplies existed.
function migrateForgeMaterials(account){
 if(!account?.profiles||typeof account.profiles!=='object')return;
 for(const record of Object.values(account.profiles)){const materials=record?.data?.career?.materials;if(!materials||typeof materials!=='object'||Array.isArray(materials))continue;for(const id of ['forgeCore','smithCharm','protectionScroll',...Object.keys(CRAFT_MATERIALS),...Object.keys(BIOLOGY_MATERIALS)])if(!Object.hasOwn(materials,id))materials[id]=0;}
}

