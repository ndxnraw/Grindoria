const test=require('node:test'),assert=require('node:assert/strict');
const {createEmptyGame,createGame,readSavedProfile}=require('./helpers/game.cjs');
test('storage compression preserves arbitrary UTF-16, repeated text and dictionary-window boundaries',()=>{
 const g=createEmptyGame();
 for(const input of ['', 'Žltý háj 🙂 𐐀', '\0\u0104\u1004\uffff'.repeat(300), 'abcdef'.repeat(20000), Array.from({length:40000},(_,i)=>String.fromCharCode(32+(i*i+17*i)%300)).join('')])
  assert.equal(g.run('decompressCharacterText(compressCharacterText('+JSON.stringify(input)+'))'),input);
});
test('population tables preserve ordering, missing fields, nested states, zero and null exactly',()=>{
 const g=createEmptyGame(),mobs=[{type:'wolf',x:1,homeX:1,hp:0,dots:[],dot:null},{type:'stone',x:2,homeX:2,hp:50,dots:[{kind:'fire',power:7,time:4,tick:.2}],dot:null},{type:'wolf',x:3,homeX:3,hp:20,extra:true,dots:[]}];
 const result=g.run('unpackMobTable(packMobTable('+JSON.stringify(mobs)+'))');assert.deepEqual(JSON.parse(JSON.stringify(result)),mobs);
});
test('old JSON and both packed transport versions remain readable and invalid tokens fail closed',()=>{
 const g=createEmptyGame(),doc={format:'grindoria-characters',version:2,account:{name:'Pútnik',text:'Kameň '.repeat(30000)}};
 const input=JSON.stringify(doc);assert.deepEqual(JSON.parse(JSON.stringify(g.run('decodeCharacterStorage('+JSON.stringify(input)+')'))),doc);
 assert.deepEqual(JSON.parse(JSON.stringify(g.run('decodeCharacterStorage(encodeCharacterStorage('+input+'))'))),doc);
 for(const data of [String.fromCharCode(257),String.fromCharCode(4100,257),String.fromCharCode(12)])assert.throws(()=>g.run('decodeCharacterStorage('+JSON.stringify(JSON.stringify({format:'grindoria-storage',version:1,data}))+')'));
 assert.throws(()=>g.run('decodeCharacterStorage(\'{"format":"grindoria-storage","version":99,"data":"x"}\')'));
});
test('automatic loot batches into normal autosave while the live reward and shutdown save remain exact',()=>{
 const g=createGame();g.run('running=true;save();var before=localStorage.getItem(CHARACTER_RULES.storageKey);spawnGroundDrop({kind:"gold",count:5},p);updateGroundLoot(.1);');
 assert.equal(g.run('p.gold'),5);assert.equal(g.saved.get('grindoria-characters-v1'),g.run('before'));
 g.run('update(4.1);');assert.equal(readSavedProfile(g.saved).gold,5);
 g.run('spawnGroundDrop({kind:"gold",count:7},p);updateGroundLoot(.1);save();');assert.equal(readSavedProfile(g.saved).gold,12);
});
