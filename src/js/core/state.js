'use strict';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),mini=$('minimap').getContext('2d');
const SIZE=2000,SAVE='grindoria-save-v1';
let W=1200,H=700,dpr=1,running=false,paused=false,last=0,clock=0,target=null,face=0,attackCD=0,skillCD=0,slash=0,ring=0,toastTimer=0,saveTimer=0,sound=false,audio=null;
const keys={},mouse={x:0,y:0},cam={x:1000,y:1050};
function createPlayerState(profile = {}) {
  const fresh={x:1000,y:1160,hp:100,level:1,xp:0,gold:0,potions:5,kills:0,stones:0,claimed:false,weapon:0,strength:0,vitality:0,dexterity:0,intelligence:0,bossKills:0,bossClaimed:false,huntClaimed:0};
  const player={...fresh,...JSON.parse(JSON.stringify(profile))};
  player.classId=Object.hasOwn(CLASSES,player.classId)?player.classId:'warrior';
  player.points??=Math.max(0,(player.level-1)*3);player.bag??=[];player.equipped??={weapon:null,armor:null};
  player.mp??=100+player.level*8;player.worldStates??={};player.mapId=MAPS[player.mapId]?player.mapId:'valley';
  player.schools??={};for(const [id,school] of Object.entries(DEFAULT_SCHOOLS))if(SCHOOLS[player.schools[id]]?.classId!==id)player.schools[id]=school;
  player.bestiary??={};player.achievements??={};return player;
}
let p=createPlayerState(loadPlayerSave()||{});
const spellKeys=['q','r','t','v','u','o'],buffs={},effects=[],shots=[];
let spellCD=[0,0,0,0,0,0],castPose=0,castStyle='',spiritTick=0;
const role=()=>CLASSES[p.classId],equippedBonus=slot=>(p.equipped[slot]?.bonus||0)+(p.equipped[slot]?.enhance||0)*3;
const maxHP=()=>100+(p.level-1)*22+p.vitality*10+role().health+careerBonuses().hp+equipmentBonuses().hp,damage=()=>Math.round((18+(p.level-1)*2+p.strength*3+equipmentBonuses().attack+careerBonuses().attack)*attackPower()*(1+careerBonuses().attackPercent)),defense=()=>equipmentBonuses().defense+Math.floor(p.vitality/3)+armorBonus()+careerBonuses().defense,needXP=()=>xpForLevel(p.level);
const mobs=[],particles=[],drops=[],decor=[];let seed=78231;

let castingSkillKey=null, careerTab="overview";

const spawnPoints=[];
let capeCooldown=0,legacyRiftLayout=false,lastMiniMapPaint=-Infinity;

