function drawMetinModel(model, color, glow, hit = false) {
  const face = hit ? '#e8d5c4' : color, light = hit ? '#fff2cf' : glow;
  if (model === 'tusks') {
    polygon([[-32,3],[-39,-30],[-25,-71],[-11,-92],[-17,-49],[-7,-17],[7,-17],[17,-49],[11,-92],[25,-71],[39,-30],[32,3]],face,light);
    polygon([[-25,-71],[-11,-92],[-17,-49],[-23,-20],[-31,-30]],'#c6b690');
    polygon([[25,-71],[11,-92],[17,-49],[23,-20],[31,-30]],'#a99a77');
    ellipse(0,-31,12,15,light); polygon([[-3,-44],[5,-31],[-3,-21]],'#413e32');
  } else if (model === 'pyramid') {
    polygon([[-39,2],[-32,-20],[-25,-20],[-20,-44],[-12,-44],[0,-95],[12,-44],[20,-44],[25,-20],[32,-20],[39,2]],face,light);
    polygon([[0,-95],[0,2],[39,2],[32,-20],[25,-20],[20,-44],[12,-44]],'#705e43');
    for(let i=0;i<3;i++)line(-28+i*6,-14-i*20,28-i*6,-14-i*20,light,2);
    ellipse(0,-42,14,8,'#74b8b4');ellipse(0,-42,4,7,'#243a37');
  } else if (model === 'crystals') {
    for(const [x,height,width]of [[-25,65,14],[23,78,15],[0,108,21]]) {
      polygon([[x-width,1],[x-width,-height*.65],[x,-height],[x+width,-height*.65],[x+width,1]],face,light);
      polygon([[x,-height],[x+width,-height*.65],[x+width,1],[x,7]],'#a1d2d9');
      line(x,-height+12,x,-6,'#e1f1e4',2);
    }
  } else if (model === 'volcano') {
    polygon([[-42,2],[-34,-36],[-22,-51],[-19,-85],[-8,-72],[3,-96],[16,-70],[28,-65],[33,-29],[43,2]],face,'#a27866');
    polygon([[-19,-85],[-8,-72],[3,-96],[16,-70],[8,-48],[-6,-44],[-22,-51]],'#412d31');
    line(3,-76,-4,-52,light,5);line(-4,-52,13,-35,light,4);line(13,-35,2,-12,light,4);line(2,-12,8,2,light,3);
    line(-27,-31,-17,-18,'#c17b49',3);ellipse(2,-78,7,4,'#f4d383');
  } else if (model === 'twins') {
    polygon([[-35,2],[-32,-65],[-17,-96],[-7,-55],[-12,1]],face,light);
    polygon([[12,1],[7,-55],[22,-101],[35,-65],[38,2]],face,light);
    line(-17,-83,-20,-22,'#84b2b0',4);line(23,-86,26,-20,'#94c4ba',4);
    const shift=Math.sin(clock*9)*3;
    polygon([[-8,-72],[7+shift,-63],[-3,-47],[10,-35],[-1,-20],[3,-40],[-9,-48],[0,-61]],'#b3f5e4');
    ellipse(0,-81,7,5,light);
  } else if (model === 'floating') {
    polygon([[-30,3],[-22,-12],[22,-12],[30,3]],'#4a4653',light);
    const bob=Math.sin(clock*2)*4;
    polygon([[0,-110+bob],[30,-74+bob],[0,-31+bob],[-30,-74+bob]],face,light);
    polygon([[0,-110+bob],[30,-74+bob],[0,-31+bob],[0,-74+bob]],'#493b67');
    line(-18,-72+bob,0,-60+bob,light,3);line(0,-60+bob,17,-72+bob,light,3);
    for(let i=0;i<3;i++){const a=clock*.8+i*Math.PI*2/3;ellipse(Math.cos(a)*37,-55+Math.sin(a)*12,4,4,light);}
  } else if (model === 'crown') {
    polygon([[-37,2],[-40,-44],[-29,-83],[-25,-108],[-12,-86],[0,-118],[13,-85],[29,-108],[28,-78],[41,-42],[37,2]],face,light);
    polygon([[-29,-83],[0,-68],[28,-78],[20,-31],[0,-8],[-20,-31]],'#382d3b',light);
    polygon([[0,-81],[13,-57],[0,-33],[-13,-57]],light);
    ctx.strokeStyle=light;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-52,48,18,-.25,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<6;i++){const a=i*Math.PI/3;ellipse(Math.cos(a)*46,-52+Math.sin(a)*17,3,3,'#f7d5ab');}
  } else {
    polygon([[-23,2],[-31,-35],[-13,-76],[8,-94],[28,-44],[24,2],[0,10]],face,'#a3a1aa');
    polygon([[-13,-76],[8,-94],[3,-35],[-23,2]],'#a193a9');
    line(3,-77,-7,-52,light,3);line(-7,-52,10,-35,light,2);line(10,-35,2,-11,light,3);
  }
}

function drawMetin(stone) {
  const {x,y}=screen(stone.x,stone.y),spec=METIN_TYPES[stone.metinType]||METIN_TYPES.fracture;
  if(x<-130||x>W+130||y<-50||y>H+170)return;
  const scale=metinModelScale(stone);
  shadow(x,y,1.5*scale);ellipse(x,y,44*scale,17*scale,spec.glow+(stone.metinCombat>0?'44':'20'));
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);drawMetinModel(spec.model,stone.rareMetin?'#93688e':spec.color,stone.rareMetin?'#f3a4dd':spec.glow,stone.hit>0);ctx.restore();
  if(!keys.Alt)text(stone.name||spec.name,x,y-135*scale,spec.glow,10);

  if(stone.hp<stone.max||Math.hypot(stone.x-p.x,stone.y-p.y)<230){
    ctx.fillStyle='#161c1d';ctx.fillRect(x-33,y-112*scale,66,5);ctx.fillStyle=spec.glow;ctx.fillRect(x-33,y-112*scale,66*stone.hp/stone.max,5);


  }
}

function suterlandGround() {
  ctx.fillStyle=map().ground;ctx.fillRect(0,0,W,H);
  const left=Math.floor((cam.x-W/2)/120)*120,top=Math.floor((cam.y-H/.62/2)/120)*120;
  for(let x=left;x<cam.x+W/2+120;x+=120)for(let y=top;y<cam.y+H/.62/2+120;y+=120){
    const a=screen(x,y),n=Math.abs(Math.sin(x*2.7+y*8.3));
    polygon([[a.x,a.y],[a.x+115,a.y-3],[a.x+122,a.y+68],[a.x-6,a.y+72]],n>.5?'#676b6a':'#5a605f','#777b6e44');
    if(n>.65){line(a.x+17,a.y+12,a.x+44,a.y+38,'#adb09544');line(a.x+44,a.y+38,a.x+82,a.y+29,'#9a9d8c44');}
  }
  const a=screen(1000,1050);ellipse(a.x,a.y,205,120,'#b5ac7740');
}
