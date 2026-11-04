// Dedicated local test page: never bundled into the shipped game.
(async function(){
 const result=document.createElement('pre');result.id='benchmark-result';result.setAttribute('role','status');result.style.cssText='position:fixed;top:8px;left:8px;z-index:9999;max-width:90vw;white-space:pre-wrap;padding:16px;color:#eee;background:#10202a;border:1px solid #bca773';
 document.body.append(result);result.textContent='Prebieha meranie: 1 000 príšer / 5 000 predmetov…';
 try{
 const id=listCharacters().find(c=>c.name==='Meranie')?.id||createCharacter('Meranie','warrior');playCharacter(id);closeModal();save=()=>true;
 loadMap('valley',true);p.x=1600;p.y=1600;cam.x=p.x;cam.y=p.y;saveTimer=-1e9;
 const template={...mobs.find(m=>m.type==='wolf')};mobs.length=0;
 for(let i=0;i<1000;i++){const x=50+i%40*78,y=50+Math.floor(i/40)*124;mobs.push({...template,x,y,homeX:x,homeY:y,spawnId:'bench:'+i,spawnPointId:'bench:'+Math.floor(i/5),engaged:0,taunt:0,roamTarget:null,roamWait:0,dots:[],skillContributors:[]});}
 drops.length=0;const gear=createItem('weapon:fms');
 for(let i=0;i<5000;i++){const uid=++p.inventory.serial;drops.push({kind:'gear',id:i+1,item:{...gear,name:'Meč '+i%300,uid,instanceId:p.characterId+':item:'+uid},x:50+i%80*39,y:50+Math.floor(i/80)*49,fallAge:1,expiresAt:Date.now()+600000});}
 p.lootSerial=5000;updateWorldEvents=()=>{};const cpu=[],intervals=[];let previous=null,index=0;
 function next(t){const started=performance.now();update(1/60);draw();const cost=performance.now()-started;if(index>=30){cpu.push(cost);if(previous!==null)intervals.push(t-previous);}previous=t;index++;
 if(index<210){window.benchmarkRAF(next);return;}
 const percentile=(values,ratio)=>[...values].sort((a,b)=>a-b)[Math.min(values.length-1,Math.floor(values.length*ratio))];
 const output={build:location.pathname,mobs:mobs.length,drops:drops.length,viewport:[W,H],dpr,frames:cpu.length,fps:+(1000/(intervals.reduce((sum,n)=>sum+n,0)/intervals.length)).toFixed(1),medianCpuMs:+percentile(cpu,.5).toFixed(2),p95CpuMs:+percentile(cpu,.95).toFixed(2),p95FrameIntervalMs:+percentile(intervals,.95).toFixed(2)};
 result.textContent=JSON.stringify(output,null,2);document.title='Meranie dokončené '+location.pathname;running=false;
 }
 window.benchmarkRAF(next);
 }catch(error){result.textContent='Chyba merania: '+error.message;}
})();
