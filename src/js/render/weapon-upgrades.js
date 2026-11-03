function weaponUpgradeProfile(item){
 const level=Math.floor(item?.enhance||0);if(item?.slot!=='weapon'||level<5)return null;
 const colors=['#7cdddc','#82bfff','#c395fb','#ffce71','#ffb4dc'],strength=level-4;
 return {level,strength,color:colors[Math.min(4,strength-1)],blur:2+strength*2,lines:strength,sparks:strength*2};
}
function weaponUpgradeSVG(item){
 const effect=weaponUpgradeProfile(item);if(!effect)return '';
 let paths='';
 for(let i=0;i<effect.lines;i++)paths+='<path d="M'+(23-i*2)+' 69 Q'+(8+i*4)+' 40 '+(29+i*2)+' 7" fill="none" stroke="'+effect.color+'" stroke-width="'+(.6+effect.strength*.22)+'" opacity="'+(.2+effect.strength*.09)+'"/>';
 return '<g class="weapon-upgrade-aura upgrade-'+effect.level+'" data-upgrade-effect="'+effect.level+'" style="color:'+effect.color+';filter:drop-shadow(0 0 '+effect.blur+'px '+effect.color+')">'+paths+'<path d="M32 3v61" fill="none" stroke="'+effect.color+'" stroke-width="'+(.5+effect.strength*.5)+'" opacity=".7"/></g>';
}
function drawWeaponUpgrade(item,model){
 const effect=weaponUpgradeProfile(item);if(!effect)return;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=effect.color;ctx.shadowColor=effect.color;ctx.shadowBlur=effect.blur;
 ctx.globalAlpha=.22+effect.strength*.1;ctx.lineWidth=1+effect.strength*.6;
 ctx.stroke(new Path2D(model.parts[0].d));
 for(let i=0;i<effect.lines;i++){
  const phase=clock*(1.8+effect.strength*.2)+i*2.3;
  ctx.globalAlpha=.18+effect.strength*.07;ctx.lineWidth=.5+effect.strength*.24;
  ctx.beginPath();ctx.moveTo(32+Math.sin(phase)*8,72);ctx.quadraticCurveTo(12+Math.cos(phase)*8,38,32+Math.sin(phase+1)*6,4);ctx.stroke();
 }
 for(let i=0;i<effect.sparks;i++){
  const phase=(clock*(.7+effect.strength*.1)+i/effect.sparks)%1,x=32+Math.sin(phase*8+i)*(.8+effect.strength*1.3),y=70-phase*66;
  ctx.globalAlpha=(1-phase)*.8;ellipse(x,y,.6+effect.strength*.16,.6+effect.strength*.16,effect.color);
 }
 ctx.restore();
}
