function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}

function resize(){const r=canvas.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}

function screen(x,y){return{x:W/2+(x-cam.x),y:H/2+(y-cam.y)*.62};}

function world(x,y){return{x:cam.x+x-W/2,y:cam.y+(y-H/2)/.62};}

function float(t,x,y,color='#f4db9d',big=false){particles.push({t,x,y,age:0,color,big});}

function beep(freq,duration=.08){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;o.type='triangle';g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}

function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;update(dt);draw();requestAnimationFrame(frame);}

function keysClear(){Object.keys(keys).forEach(k=>keys[k]=false);}

function update(dt) {
  clock+=dt;if(!running||paused)return;
  attackCD=Math.max(0,attackCD-dt);slash=Math.max(0,slash-dt);ring=Math.max(0,ring-dt);updateCombatAssistTimers(dt);updateCombat(dt);
  updatePlayerControl(dt);if(keys[' '])attack();updateAutoSpell(dt);
  const safe=isSanctuary(p);if(safe){p.hp=Math.min(maxHP(),p.hp+12*dt);p.mp=Math.min(maxMP(),p.mp+dt*10);}
  updateMetins(dt,safe);updateEnemySpawns(dt,safe);updateGroundLoot(dt);updateBoss(dt,safe);updateAutoPotion();
  if(p.hp<=0)death();if(target&&!selectedEnemy())clearCombatTarget();
  cam.x+=(p.x-cam.x)*Math.min(1,dt*7);cam.y+=(p.y-cam.y)*Math.min(1,dt*7);
  for(let i=particles.length-1;i>=0;i--){particles[i].age+=dt;if(particles[i].age>1.2)particles.splice(i,1);}
  toastTimer-=dt;if(toastTimer<0)$('toast').style.opacity='0';saveTimer+=dt;if(saveTimer>4){save();saveTimer=0;}updateHUD();
}
