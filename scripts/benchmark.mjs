import {createRequire} from 'node:module';
import {performance} from 'node:perf_hooks';
const require=createRequire(import.meta.url),{createGame}=require('../tests/helpers/game.cjs');
const setup=`running=true;paused=false;loadMap("valley",true);p.x=1600;p.y=1600;cam.x=p.x;cam.y=p.y;saveTimer=-1e9;
var template={...mobs.find(m=>m.type==="wolf")};mobs.length=0;for(var i=0;i<1000;i++){var x=50+(i%40)*78,y=50+Math.floor(i/40)*124;mobs.push({...template,x,y,homeX:x,homeY:y,spawnId:"bench:"+i,spawnPointId:"bench:"+Math.floor(i/5),engaged:0,taunt:0,roamTarget:null,roamWait:0,dots:[],skillContributors:[]});}`;
const loot=`drops.length=0;var gear=createItem("weapon:fms");for(var i=0;i<5000;i++)drops.push({kind:"gear",id:i+1,item:{...gear,name:"Meč "+(i%300)},x:50+(i%80)*39,y:50+Math.floor(i/80)*49,fallAge:1,expiresAt:Date.now()+600000});var Image=class{complete=true;naturalWidth=64;set src(value){}};`;
function measure(name,extra,body,frames=120){const game=createGame();game.run(setup+extra);game.run('for(var frame=0;frame<30;frame++){'+body+'}');const values=[];for(let i=0;i<5;i++){const start=performance.now();game.run('for(var frame=0;frame<'+frames+';frame++){'+body+'}');values.push((performance.now()-start)/frames);}values.sort((a,b)=>a-b);return {name,medianMs:+values[2].toFixed(3),maxBatchMeanMs:+values[4].toFixed(3)};}
const results=[
 measure('AI: 1000 neutral enemies','', 'updateEnemySpawns(1/60,false);'),
 measure('Metins: 100 parents / 300 guards',`for(var i=0;i<100;i++)mobs[i]={...mobs[i],type:"stone",metinType:"fracture",metinCombat:0};for(var i=100;i<400;i++)Object.assign(mobs[i],{metinParentId:mobs[i%100].spawnId,metinGeneration:1,metinLife:1000});`,'updateMetins(1/60,false);'),
 measure('Ground loot: 5000 items',loot,'drawGroundLoot();'),
 measure('Scene: 1000 enemies','', 'draw();',60),
 measure('Full update: 1000 enemies / 5000 items',loot, 'update(1/60);',60)
];
console.log(JSON.stringify({runtime:process.version,platform:process.platform,note:'CPU-only harness with stub Canvas/Image; excludes GPU, DOM layout, real SVG decoding and display FPS.',results},null,2));
