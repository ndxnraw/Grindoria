function drawWorldEventGround(){
 const event=worldEventState?.active;if(!event)return;const spec=WORLD_EVENTS[event.type],at=screen(event.x,event.y);
 if(spec.kind==='secret'){
  if(Math.abs(at.x-W/2)>W/2+120||Math.abs(at.y-H/2)>H/2+120)return;
  ellipse(at.x,at.y,65,26,'#729d9133');for(let i=0;i<3;i++){const x=at.x+(i-1)*35,y=at.y+(i%2)*16;polygon([[x-10,y],[x-9,y-42-i*7],[x+10,y-37-i*7],[x+12,y]],'#697a72','#c9b793');line(x-4,y-30,x+4,y-21,spec.color,2);}if(event.revealed)text('Skryté ruiny',at.x,at.y-72,spec.color,11);
 }else for(const mob of mobs)if(mob.worldEventId===event.id&&mob.hp>0){const pos=screen(mob.x,mob.y);ellipse(pos.x,pos.y,32,13,spec.color+'35');if(mob.type!=='wolf'){ctx.save();ctx.strokeStyle=spec.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(pos.x,pos.y,45,20,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<5;i++){const a=i*Math.PI*2/5+clock*.25;ellipse(pos.x+Math.cos(a)*43,pos.y+Math.sin(a)*19,3,3,spec.color);}ctx.restore();}}
}
function drawWorldEventMini(){const event=worldEventState?.active;if(!event?.revealed)return;mini.strokeStyle=WORLD_EVENTS[event.type].color;mini.lineWidth=2;mini.beginPath();mini.arc(event.x/SIZE*138,event.y/SIZE*118,5,0,Math.PI*2);mini.stroke();}
