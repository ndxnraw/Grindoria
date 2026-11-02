'use strict';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),mini=$('minimap').getContext('2d');
const SIZE=2000,SAVE='jade-realm-save-v1';
let W=1200,H=700,dpr=1,running=false,paused=false,last=0,clock=0,target=null,face=0,attackCD=0,skillCD=0,slash=0,ring=0,toastTimer=0,saveTimer=0,sound=false,audio=null;
const keys={},mouse={x:0,y:0},cam={x:1000,y:1050};
let p={x:1000,y:1050,hp:100,level:1,xp:0,gold:0,potions:5,kills:0,stones:0,claimed:false,weapon:0};
try{const s=JSON.parse(localStorage.getItem(SAVE));if(s&&Number.isFinite(s.level)&&s.level>=1&&s.level<=99)p={...p,...s,x:1000,y:1050};}catch{}
const spellKeys=['q','r','t','y','u','o'],buffs={},effects=[],shots=[];
let spellCD=[0,0,0,0,0,0],castPose=0,castStyle='',spiritTick=0;
p.classId=CLASSES[p.classId]?p.classId:'warrior';p.strength??=0;p.vitality??=0;p.dexterity??=0;p.points??=Math.max(0,(p.level-1)*3);p.bag??=[];p.equipped??={weapon:null,armor:null};p.bossKills??=0;p.bossClaimed??=false;p.huntClaimed??=0;
p.intelligence??=0;p.mp??=100+p.level*8;p.worldStates??={};p.mapId=MAPS[p.mapId]?p.mapId:'valley';p.schools??={};for(const [classId,id] of Object.entries({warrior:'body',ninja:'blade',sura:'weapon',shaman:'dragon'})){if(SCHOOLS[p.schools[classId]]?.classId!==classId)p.schools[classId]=id;}
const role=()=>CLASSES[p.classId],equippedBonus=slot=>(p.equipped[slot]?.bonus||0)+(p.equipped[slot]?.enhance||0)*3;
const maxHP=()=>100+(p.level-1)*22+p.vitality*10+role().health+careerBonuses().hp,damage=()=>Math.round((18+(p.level-1)*2+p.strength*3+equippedBonus('weapon')+careerBonuses().attack)*attackPower()*(1+careerBonuses().attackPercent)),defense=()=>equippedBonus('armor')+Math.floor(p.vitality/3)+armorBonus()+careerBonuses().defense,needXP=()=>xpForLevel(p.level);
const mobs=[],particles=[],drops=[],decor=[];let seed=78231;

let castingSkillKey=null, careerTab="overview";
