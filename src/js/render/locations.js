function worldObjects(){
 if(map().town)return [...Object.entries(NPCS).map(([id,npc])=>({y:npc.y,draw:()=>drawTownNPC(id)}))];
 return [{y:safeZone().y-100,draw:drawSafeZone}];
}
function drawSafeZone(){
 const zone=safeZone(),at=screen(zone.x,zone.y);
 ellipse(at.x,at.y,zone.radius,zone.radius*.62,'#9ed5a91c');
 ctx.strokeStyle='#b0d7a16e';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(at.x,at.y,zone.radius,zone.radius*.62,0,0,Math.PI*2);ctx.stroke();
 for(const side of [-1,1]){line(at.x+side*zone.radius,at.y-12,at.x+side*zone.radius,at.y+4,'#bca57a',3);polygon([[at.x+side*zone.radius,at.y-12],[at.x+side*zone.radius+11,at.y-8],[at.x+side*zone.radius,at.y-4]],'#83b18b');}
 text('Bezpečná zóna',at.x,at.y-zone.radius*.62-10,'#c5dbaf',10);
}
function drawTownGround(){
 ctx.fillStyle=map().ground;ctx.fillRect(0,0,W,H);
 const firstX=Math.floor((cam.x-W/2)/80)*80,firstY=Math.floor((cam.y-H/.62/2)/80)*80;
 for(let x=firstX;x<cam.x+W/2+80;x+=80)for(let y=firstY;y<cam.y+H/.62/2+80;y+=80){const a=screen(x,y);polygon([[a.x,a.y],[a.x+79,a.y],[a.x+79,a.y+48],[a.x,a.y+48]],'#7a8071','#666d61');}
 const square=screen(600,600);ellipse(square.x,square.y,275,160,'#b5a68a44');
 for(const building of [{x:440,y:500,color:'#6c7356'},{x:760,y:500,color:'#815d46'},{x:600,y:230,color:'#50765f'},{x:210,y:800,color:'#6e695d'},{x:990,y:800,color:'#6e695d'}]){
  const a=screen(building.x,building.y);polygon([[a.x-65,a.y],[a.x-65,a.y-65],[a.x+65,a.y-65],[a.x+65,a.y]],'#aeaa8d','#565d50');
  polygon([[a.x-78,a.y-60],[a.x,a.y-112],[a.x+78,a.y-60]],building.color,'#c4b58f');
  ctx.fillStyle='#3c4d42';ctx.fillRect(a.x-13,a.y-42,26,43);ctx.fillStyle='#e6ce8b';ctx.fillRect(a.x-47,a.y-42,18,21);ctx.fillRect(a.x+29,a.y-42,18,21);
 }
 for(const spot of [{x:240,y:260},{x:960,y:260},{x:230,y:1020},{x:970,y:1020}]){const a=screen(spot.x,spot.y);ellipse(a.x,a.y,35,14,'#3c625044');polygon([[a.x-20,a.y],[a.x-20,a.y-18],[a.x+20,a.y-18],[a.x+20,a.y]],'#9a9073');}
}
function drawTownNPC(id){
 const npc=NPCS[id],a=screen(npc.x,npc.y);shadow(a.x,a.y);
 line(a.x-5,a.y-12,a.x-6,a.y,'#35483a',5);line(a.x+5,a.y-12,a.x+6,a.y,'#35483a',5);
 polygon([[a.x-10,a.y-33],[a.x-12,a.y-10],[a.x+12,a.y-10],[a.x+10,a.y-33]],npc.color,'#dcc79b');ellipse(a.x,a.y-43,7,9,'#d5bd97');
 if(id==='smith'){line(a.x+12,a.y-20,a.x+22,a.y-40,'#675343',4);ctx.fillStyle='#b7bbb0';ctx.fillRect(a.x+16,a.y-47,18,9);}
 else if(id==='biologist'){line(a.x-12,a.y-25,a.x-18,a.y-14,'#9bba8c',4);ellipse(a.x-20,a.y-12,5,7,'#80b5b4');}
 text(npc.name+' · F',a.x,a.y-65,'#e4d1a1',11);
}
