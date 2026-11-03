const FORGE_RULES={
 success:[0,.95,.9,.8,.65,.5,.35,.23,.14,.08],
 bonus:[0,3,7,12,18,25,34,46,62,85],
 destructionChance:.35,charmBoost:.1,
 recipes:{smithCharm:{forgeCore:2,essence:100,gold:15000},protectionScroll:{forgeCore:6,dust:100,books:10,gold:50000}}
};
Object.assign(MATERIALS,{forgeCore:'Kováčske jadro',smithCharm:'Talizman kováča',protectionScroll:'Ochranný zvitok'});

// Additive migration for profiles and backups written before forge supplies existed.
function migrateForgeMaterials(account){
 if(!account?.profiles||typeof account.profiles!=='object')return;
 for(const record of Object.values(account.profiles)){const materials=record?.data?.career?.materials;if(!materials||typeof materials!=='object'||Array.isArray(materials))continue;for(const id of ['forgeCore','smithCharm','protectionScroll',...Object.keys(CRAFT_MATERIALS)])if(!Object.hasOwn(materials,id))materials[id]=0;}
}

