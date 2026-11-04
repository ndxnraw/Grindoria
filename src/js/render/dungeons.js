function drawDungeonGround(){
 ctx.fillStyle=map().ground;ctx.fillRect(0,0,W,H);
 const d=DUNGEONS[dungeonRun().dungeon];
 for(let x=0;x<SIZE;x+=120)for(let y=0;y<SIZE;y+=120){const a=screen(x,y);if(a.x<-130||a.x>W+130||a.y<-100||a.y>H+100)continue;polygon([[a.x,a.y],[a.x+118,a.y],[a.x+118,a.y+72],[a.x,a.y+72]],(x+y)%240?'#ffffff04':'#00000012','#ffffff0c');}
 for(const y of [500,900,1400]){const a=screen(120,y),b=screen(SIZE-120,y);line(a.x,a.y,b.x,b.y,d.color+'45',3);}
 const a=screen(900,330);ellipse(a.x,a.y,280,174,d.color+'16');text(d.name,a.x,a.y-210,d.color,18);
 drawSafeZone();
}
function drawDungeonZone(h,color){
 const a=screen(h.x,h.y),warning=h.age<h.delay;
 ctx.save();ctx.strokeStyle=color;ctx.fillStyle=warning?color+'25':color+'70';ctx.lineWidth=3;
 if(h.kind==='line'){
  const dx=Math.cos(h.angle),dy=Math.sin(h.angle),nx=-dy*h.width,ny=dx*h.width;
  const points=[[h.x+nx,h.y+ny],[h.x-nx,h.y-ny],[h.x+dx*h.length-nx,h.y+dy*h.length-ny],[h.x+dx*h.length+nx,h.y+dy*h.length+ny]].map(([x,y])=>{const s=screen(x,y);return[s.x,s.y];});polygon(points,warning?color+'25':color+'70',color);
 }else{ctx.beginPath();ctx.ellipse(a.x,a.y,h.radius,h.radius*.62,0,0,Math.PI*2);if(h.kind==='ring'){ctx.moveTo(a.x+h.inner,a.y);ctx.ellipse(a.x,a.y,h.inner,h.inner*.62,0,0,Math.PI*2,true);}ctx.fill('evenodd');ctx.stroke();}
 if(warning)text('ÚHYB · '+Math.max(0,h.delay-h.age).toFixed(1)+' s',a.x,a.y-12,'#fff2d8',12);ctx.restore();
}
function drawDungeonHazards(){const r=dungeonRun();if(!r)return;const color=DUNGEONS[r.dungeon].color;for(const h of r.hazards)drawDungeonZone(h,color);for(const b of mobs)if(b.dungeonBoss&&b.attackPlan)drawDungeonZone(b.attackPlan,'#efaa84');}
function drawDungeonEnemy(m){
 const at=screen(m.x,m.y),x=at.x,y=at.y,d=DUNGEONS[m.dungeonId],pulse=Math.sin(clock*3)*4;
 if(x<-180||x>W+180||y<-180||y>H+180)return;
 if(m.dungeonSeal){shadow(x,y,1.5);polygon([[x,y-80],[x+26,y-35],[x+20,y],[x-20,y],[x-26,y-35]],m.hit>0?'#fff3c7':d.color,'#e6e3c8');line(x,y-65,x,y-12,'#26333b',4);ellipse(x,y-35,9,7,'#fff0c1');}
 else{
  shadow(x,y,2.4);ctx.save();ctx.translate(x,y+pulse);
  const c=m.hit>0?'#ffe8c4':d.color;
  if(m.dungeonId==='crypt'){for(let i=0;i<3;i++){line(-18,-18-i*13,-65-i*4,-8-i*22,c,6);line(18,-18-i*13,65+i*4,-8-i*22,c,6);}ellipse(0,-36,38,42,'#354a32');ellipse(0,-82,26,24,c);for(const side of [-1,1]){ellipse(side*10,-87,6,8,'#151e24');line(side*20,-69,side*35,-52,'#f1da9f',4);}line(0,-40,0,-95,c,4);}
  else if(m.dungeonId==='frost'){for(const side of [-1,1]){polygon([[side*20,-15],[side*38,-10],[side*43,-75],[side*18,-65]],c,'#e1f0f5');line(side*34,-70,side*62,-35,c,14);}polygon([[-30,-20],[-34,-90],[0,-125],[34,-90],[30,-20]],'#60899d',c);polygon([[-25,-105],[-13,-153],[0,-120],[15,-157],[27,-105]],c,'#e8faff');ellipse(-10,-100,4,3,'#f9fdff');ellipse(10,-100,4,3,'#f9fdff');}
  else{for(const side of [-1,1])polygon([[side*15,-20],[side*80,-100],[side*63,-25],[side*25,0]],'#68527f',c);ellipse(0,-55,36,55,'#352a4e');ellipse(0,-80,26,17,c);ellipse(0,-80,10,14,'#f5e3bb');ellipse(0,-80,4,11,'#261a36');for(let i=0;i<3;i++){const a=clock*.7+i*Math.PI*2/3;ellipse(Math.cos(a)*60,-80+Math.sin(a)*24,5,7,c);}}
  if(m.attackPlan){ctx.strokeStyle='#fff3c9';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-65,48+Math.sin(clock*16)*3,0,Math.PI*2);ctx.stroke();}ctx.restore();
 }
 if(!keys.Alt)text(m.name,x,y-(m.dungeonSeal?96:178),d.color,m.dungeonSeal?11:16);
 ctx.fillStyle='#101a22';ctx.fillRect(x-45,y-(m.dungeonSeal?88:165),90,5);ctx.fillStyle=d.color;ctx.fillRect(x-45,y-(m.dungeonSeal?88:165),90*m.hp/m.max,5);
 if(m.dungeonBoss&&m.attackPlan)text('ÚTOK ZA '+Math.max(0,m.attackPlan.delay-m.attackPlan.age).toFixed(1)+' s',x,y-199,'#ffe4b2',12);
 if(m.dungeonBoss&&!dungeonUnlocked())text('ZNIČ STRÁŽCOV A 3 PEČATE',x,y-145,'#f6dba9',10);
}
