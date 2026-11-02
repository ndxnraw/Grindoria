function polygon(points,fill,stroke){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}

function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}

function line(x,y,x2,y2,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}

function text(t,x,y,color='#d4dec2',size=10){ctx.font=`${size}px Segoe UI,sans-serif`;ctx.textAlign='center';ctx.fillStyle='#0c1c16bb';ctx.fillText(t,x+1,y+1);ctx.fillStyle=color;ctx.fillText(t,x,y);}

function shadow(x,y,s=1){ellipse(x+4,y+3,20*s,8*s,'#0a201c40');}
