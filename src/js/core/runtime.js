function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}

function resize(){const r=canvas.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}

function screen(x,y){return{x:W/2+(x-cam.x),y:H/2+(y-cam.y)*.62};}

function world(x,y){return{x:cam.x+x-W/2,y:cam.y+(y-H/2)/.62};}

function float(t,x,y,color='#f4db9d',big=false){particles.push({t,x,y,age:0,color,big});}

function beep(freq,duration=.08){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;o.type='triangle';g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}

function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;update(dt);draw();requestAnimationFrame(frame);}

function keysClear(){Object.keys(keys).forEach(k=>keys[k]=false);}

function update(dt){clock+=dt;if(!running||paused)return;attackCD=Math.max(0,attackCD-dt);slash=Math.max(0,slash-dt);ring=Math.max(0,ring-dt);updateCombat(dt);let dx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),dy=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);if(dx||dy)target=null;else if(target){dx=target.x-p.x;dy=target.y-p.y;if(Math.hypot(dx,dy)<8){target=null;dx=dy=0;}}const dist=Math.hypot(dx,dy);if(dist){face=Math.atan2(dy,dx);p.x=Math.max(45,Math.min(SIZE-45,p.x+dx/dist*speedValue()*dt));p.y=Math.max(45,Math.min(SIZE-45,p.y+dy/dist*speedValue()*dt));}if(keys[' '])attack();const safe=isSanctuary(p);if(safe){p.hp=Math.min(maxHP(),p.hp+12*dt);p.mp=Math.min(maxMP(),p.mp+dt*10);}updateMetins(dt,safe);updateEnemySpawns(dt,safe);updateGroundLoot(dt);updateBoss(dt,safe);if(p.hp<=0)death();cam.x+=(p.x-cam.x)*Math.min(1,dt*7);cam.y+=(p.y-cam.y)*Math.min(1,dt*7);for(let i=particles.length-1;i>=0;i--){particles[i].age+=dt;if(particles[i].age>1.2)particles.splice(i,1);}toastTimer-=dt;if(toastTimer<0)$('toast').style.opacity='0';saveTimer+=dt;if(saveTimer>4){save();saveTimer=0;}updateHUD();}
