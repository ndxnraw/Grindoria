function drawCombatTarget() {
  if(!running)return;
  if(!selectedEnemy())return;
  const enemy=selectedEnemy(),a=screen(enemy.x,enemy.y),radius=enemy.type==='boss'?48:enemy.type==='stone'?40:29,pulse=Math.sin(clock*5)*2;
  ctx.strokeStyle='#efd38f';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(a.x,a.y+3,radius+pulse,(radius+pulse)*.5,0,0,Math.PI*2);ctx.stroke();
  const top=a.y-(enemy.type==='stone'?145*metinModelScale(enemy):enemy.type==='boss'?135:enemy.skin==='wolf'?65:92);
  polygon([[a.x-7,top],[a.x+7,top],[a.x,top+10]],'#f5da91');
  for(const side of [-1,1]){line(a.x+side*(radius+7),a.y-12,a.x+side*(radius+7),a.y+13,'#f1d99c',2);}
}

function drawBattleEffects() {
  const schoolIndex=Object.keys(SCHOOLS);
  for(const e of effects){
    if(e.style!=='skillSigil'&&e.style!=='comboBurst')continue;
    const at=screen(e.x,e.y),t=1-e.life/e.total;ctx.save();ctx.translate(at.x,at.y);ctx.globalAlpha=Math.max(0,1-t);
    ctx.strokeStyle=e.color;ctx.fillStyle=e.color;ctx.lineWidth=e.style==='comboBurst'?3:1.5;
    if(e.style==='comboBurst'){
      ctx.beginPath();ctx.ellipse(0,-10,40+t*145,20+t*72,0,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<12;i++){const a=i*Math.PI/6;line(Math.cos(a)*(25+t*110),Math.sin(a)*(13+t*55)-10,Math.cos(a)*(45+t*140),Math.sin(a)*(23+t*70)-10,e.color,2);}
    }else{
      const family=schoolIndex.indexOf(e.school),count=e.slot+3,radius=28+t*(55+e.slot*9),rotation=e.angle+t*(family%2?-1:1);
      ctx.beginPath();
      for(let i=0;i<=count;i++){const a=rotation+i*Math.PI*2/count,x=Math.cos(a)*radius,y=Math.sin(a)*radius*.5-12;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
      for(let i=0;i<=e.slot;i++){
        const a=rotation+i*Math.PI*2/(e.slot+1),x=Math.cos(a)*radius,y=Math.sin(a)*radius*.5-12;
        if(e.school==='healing'){line(x-5,y,x+5,y,e.color,2);line(x,y-7,x,y+7,e.color,2);}
        else if(e.school==='archery'){line(x-5,y+6,x+5,y-6,e.color,2);polygon([[x+5,y-6],[x-1,y-5],[x+4,y]],e.color);}
        else if(e.school==='mental'){ctx.strokeRect(x-5,y-5,10,10);}
        else if(e.school==='body'){line(x-7,y+5,x+7,y-5,e.color,3);}
        else if(e.school==='blade'){polygon([[x,y-8],[x+5,y+4],[x-5,y+4]],e.color);}
        else if(e.school==='weapon'){ctx.beginPath();ctx.arc(x,y,6+t*3,0,Math.PI*1.5);ctx.stroke();}
        else if(e.school==='black'){ellipse(x,y,5,7,e.color);line(x,y-10,x,y+10,e.color,1);}
        else{polygon([[x,y-9],[x+7,y],[x,y+8],[x-7,y]],e.color);line(x-8,y-2,x-12,y-9,e.color,2);}
      }
    }
    ctx.restore();
  }
}
