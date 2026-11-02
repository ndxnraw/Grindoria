function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}

function resize(){const r=canvas.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}

function screen(x,y){return{x:W/2+(x-cam.x),y:H/2+(y-cam.y)*.62};}

function world(x,y){return{x:cam.x+x-W/2,y:cam.y+(y-H/2)/.62};}

function float(t,x,y,color='#f4db9d',big=false){particles.push({t,x,y,age:0,color,big});}

function beep(freq,duration=.08){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;o.type='triangle';g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}

function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;update(dt);draw();requestAnimationFrame(frame);}

function keysClear(){Object.keys(keys).forEach(k=>keys[k]=false);}

function update(dt){clock+=dt;if(!running||paused)return;attackCD=Math.max(0,attackCD-dt);slash=Math.max(0,slash-dt);ring=Math.max(0,ring-dt);updateCombat(dt);let dx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),dy=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);if(dx||dy)target=null;else if(target){dx=target.x-p.x;dy=target.y-p.y;if(Math.hypot(dx,dy)<8){target=null;dx=dy=0;}}const dist=Math.hypot(dx,dy);if(dist){face=Math.atan2(dy,dx);p.x=Math.max(45,Math.min(SIZE-45,p.x+dx/dist*speedValue()*dt));p.y=Math.max(45,Math.min(SIZE-45,p.y+dy/dist*speedValue()*dt));}if(keys[' '])attack();const safe=Math.hypot(p.x-1000,p.y-1050)<175;if(safe){p.hp=Math.min(maxHP(),p.hp+12*dt);p.mp=Math.min(maxMP(),p.mp+dt*10);}for(const m of mobs){m.hit=Math.max(0,m.hit-dt);m.cd-=dt;if(m.hp<=0){m.dead-=dt;if(m.dead<=0){m.hp=m.max;m.stun=0;m.dot=null;m.windup=0;m.cd=1;if(m.type==='wolf'){m.x=m.homeX;m.y=m.homeY;}}continue;}if(m.stun>0)continue;const d=Math.hypot(m.x-p.x,m.y-p.y);if(m.type==='wolf'&&d<330&&!safe&&!active('stealth')){const slow=(active('fear')&&d<300?.5:1)*(m.slow>0?.55:1);if(d>38){m.x+=(p.x-m.x)/d*map().mobSpeed*slow*dt;m.y+=(p.y-m.y)/d*map().mobSpeed*slow*dt;}if(d<50&&m.cd<=0){takeDamage(Math.max(4,Math.round(9*map().scale-p.level*.5)),m);m.cd=1.3;}}}for(let i=drops.length-1;i>=0;i--){const d=drops[i],distance=Math.hypot(d.x-p.x,d.y-p.y);if(distance<110){d.x+=(p.x-d.x)*dt*8;d.y+=(p.y-d.y)*dt*8;}if(distance<30){p.gold+=d.value;float('+'+d.value+' zlata',p.x,p.y-50,'#e9ce87');drops.splice(i,1);beep(750,.05);}}updateBoss(dt,safe);if(p.hp<=0)death();cam.x+=(p.x-cam.x)*Math.min(1,dt*7);cam.y+=(p.y-cam.y)*Math.min(1,dt*7);for(let i=particles.length-1;i>=0;i--){particles[i].age+=dt;if(particles[i].age>1.2)particles.splice(i,1);}toastTimer-=dt;if(toastTimer<0)$('toast').style.opacity='0';saveTimer+=dt;if(saveTimer>4){save();saveTimer=0;}updateHUD();}
