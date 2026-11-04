// Storage transport only. Runtime profiles and portable JSON backups keep their existing shape.
function packMobTable(mobs){
  const groups=[],byShape=new Map(),rows=[];
  for(const mob of mobs){
    const fields=Object.keys(mob).filter(key=>mob[key]!==undefined).sort(),shape=fields.join('\0');
    let index=byShape.get(shape);
    if(index===undefined){index=groups.length;byShape.set(shape,index);groups.push({fields,mobs:[]});}
    groups[index].mobs.push(mob);rows.push({index,mob});
  }
  const tables=groups.map(group=>{
    const defaults={},aliases={},fields=[];
    for(const key of group.fields){
      const first=JSON.stringify(group.mobs[0][key]);
      if(group.mobs.every(m=>JSON.stringify(m[key])===first))Object.defineProperty(defaults,key,{value:group.mobs[0][key],enumerable:true});
      else{
        const alias=fields.find(other=>group.mobs.every(m=>JSON.stringify(m[key])===JSON.stringify(m[other])));
        if(alias)Object.defineProperty(aliases,key,{value:alias,enumerable:true});else fields.push(key);
      }
    }
    return {defaults,aliases,fields};
  });
  return {$mobTable:1,tables,rows:rows.map(({index,mob})=>[index,...tables[index].fields.map(key=>mob[key])])};
}
function unpackMobTable(table){
  if(!Array.isArray(table.tables)||table.tables.length>1000||!Array.isArray(table.rows)||table.rows.length>1000)throw Error('Poškodená populácia v úložisku.');
  return table.rows.map(row=>{
    const spec=table.tables[row[0]];
    if(!spec||!Array.isArray(spec.fields)||row.length!==spec.fields.length+1||!spec.defaults||!spec.aliases)throw Error('Poškodený záznam nepriateľa.');
    const entries=[...Object.entries(spec.defaults),...spec.fields.map((key,i)=>[key,row[i+1]])],mob=Object.fromEntries(entries);
    for(const [key,source]of Object.entries(spec.aliases))Object.defineProperty(mob,key,{value:mob[source],enumerable:true,writable:true,configurable:true});
    return mob;
  });
}
function compressCharacterText(input){
  const last=new Map(),out=[];let at=0,literal=0;
  const flush=end=>{while(literal<end){const size=Math.min(255,end-literal);out.push(String.fromCharCode(256+size),input.slice(literal,literal+size));literal+=size;}};
  while(at<input.length){
    const key=input.slice(at,at+4),previous=last.get(key);last.set(key,at);
    let size=0;
    if(key.length===4&&previous!==undefined&&at-previous<=32767){while(size<1023&&at+size<input.length&&input[previous+size]===input[at+size])size++;}
    if(size>=4){
      flush(at);out.push(String.fromCharCode(4096+size),String.fromCharCode(256+at-previous));
      for(let i=1;i<size;i++)last.set(input.slice(at+i,at+i+4),at+i);
      at+=size;literal=at;
    }else at++;
  }
  flush(at);return out.join('');
}
function decompressCharacterText(input){
  const out=[],history=new Uint16Array(32768),block=new Uint16Array(8192);let length=0;
  const emit=code=>{if(length>=64*1024*1024)throw Error('Uložené dáta sú príliš veľké.');history[length&32767]=code;block[length%8192]=code;length++;if(length%8192===0)out.push(String.fromCharCode(...block));};
  for(let at=0;at<input.length;){
    const token=input.charCodeAt(at++);
    if(token>256&&token<=511){const size=token-256;if(at+size>input.length)throw Error('Neúplné uložené dáta.');for(let i=0;i<size;i++)emit(input.charCodeAt(at++));}
    else if(token>=4100&&token<=5119){
      const size=token-4096,distance=input.charCodeAt(at++)-256;
      if(!Number.isInteger(distance)||distance<1||distance>32767||distance>length)throw Error('Poškodený odkaz v úložisku.');
      for(let i=0;i<size;i++)emit(history[(length-distance)&32767]);
    }else throw Error('Neznámy údaj v úložisku.');
  }
  if(length%8192)out.push(String.fromCharCode(...block.subarray(0,length%8192)));
  return out.join('');
}
const characterStorageCache=new Map();
function encodeCharacterStorage(account){
  if(account.format==='grindoria-account'){
    let size=JSON.stringify({...account,profiles:{}}).length;const records=[];
    for(const [id,record]of Object.entries(account.profiles)){
      const cached=characterStorageCache.get(id),text=cached?.record===record?cached.plain:JSON.stringify(record);
      const entry=cached?.plain===text?cached:{record,plain:text,packed:null};entry.record=record;characterStorageCache.set(id,entry);records.push({id,record,entry});size+=text.length+id.length+4;
    }
    for(const id of characterStorageCache.keys())if(!Object.hasOwn(account.profiles,id))characterStorageCache.delete(id);
    if(size<128000)return JSON.stringify(account);
    const profiles={};
    for(const {id,record,entry}of records){
      if(!entry.packed){const compact=JSON.stringify(record,(key,value)=>key==='mobs'&&Array.isArray(value)?packMobTable(value):value);entry.packed={format:'grindoria-profile',version:1,data:compressCharacterText(compact)};}
      Object.defineProperty(profiles,id,{value:entry.packed,enumerable:true,writable:true,configurable:true});
    }
    return JSON.stringify({format:'grindoria-storage',version:2,account:{...account,profiles}});
  }
  const plain=JSON.stringify(account);
  if(plain.length<128000)return plain;
  const compact=JSON.stringify(account,(key,value)=>key==='mobs'&&Array.isArray(value)?packMobTable(value):value);
  const packed=JSON.stringify({format:'grindoria-storage',version:1,data:compressCharacterText(compact)});
  return packed.length<plain.length?packed:plain;
}
function decodeCharacterStorage(raw){
  if(typeof raw!=='string'||raw.length>64*1024*1024)throw Error('Uložené dáta sú príliš veľké.');
  const value=JSON.parse(raw);
  if(value?.format!=='grindoria-storage')return value;
  if(value.version===2&&value.account?.profiles){
    const profiles={};
    for(const [id,record]of Object.entries(value.account.profiles)){
      if(record?.format!=='grindoria-profile'||record.version!==1||typeof record.data!=='string')throw Error('Poškodený uložený profil.');
      Object.defineProperty(profiles,id,{value:JSON.parse(decompressCharacterText(record.data),(key,item)=>key==='mobs'&&item?.$mobTable===1?unpackMobTable(item):item),enumerable:true,writable:true,configurable:true});
    }
    return {...value.account,profiles};
  }
  if(value.version!==1||typeof value.data!=='string')throw Error('Neznáma verzia úložiska.');
  return JSON.parse(decompressCharacterText(value.data),(key,item)=>key==='mobs'&&item?.$mobTable===1?unpackMobTable(item):item);
}
function characterSafetyBackupText(raw){try{return JSON.stringify(decodeCharacterStorage(raw),null,2);}catch{return raw;}}
