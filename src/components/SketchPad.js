import React, { useRef, useState, useEffect, useCallback } from 'react';

const COLORS = ['#d0b0ff','#f9a8c9','#7ecfc0','#f0c060','#e07070','#8ab8e8','#ffffff','#b8a8d4','#5a3a8a','#2a1e42','#0a0814','#f0e8d0','#7b3fff','#3fff7b','#ff7b3f','#3f7bff','#ff3f7b','#7bff3f'];
const BRUSHES = [{id:'pen',label:'Pen',icon:'ti-pencil'},{id:'brush',label:'Brush',icon:'ti-brush'},{id:'marker',label:'Marker',icon:'ti-highlight'},{id:'spray',label:'Spray',icon:'ti-droplet'},{id:'eraser',label:'Eraser',icon:'ti-eraser'},{id:'fill',label:'Fill',icon:'ti-paint-filled'},{id:'line',label:'Line',icon:'ti-minus'},{id:'rect',label:'Rect',icon:'ti-square'},{id:'circle',label:'Circle',icon:'ti-circle'}];
const SIZES = [2,4,8,14,22,35];
const FILTERS = [{id:'none',label:'None'},{id:'grayscale',label:'Gray'},{id:'sepia',label:'Sepia'},{id:'invert',label:'Invert'},{id:'blur',label:'Blur'},{id:'saturate',label:'Vivid'}];
const STICKERS = ['★','☆','♥','♦','♣','♠','●','○','▲','■','◆','✚','✧','✳','✿','❈'];

export default function SketchPad() {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [brush,setBrush]=useState('pen');
  const [color,setColor]=useState('#d0b0ff');
  const [size,setSize]=useState(4);
  const [opacity,setOpacity]=useState(1);
  const [history,setHistory]=useState([]);
  const [redoStack,setRedoStack]=useState([]);
  const [filter,setFilter]=useState('none');
  const [customColor,setCustomColor]=useState('#d0b0ff');
  const [showGrid,setShowGrid]=useState(false);
  const [symmetry,setSymmetry]=useState(false);
  const [zoom,setZoom]=useState(1);
  const [showStickers,setShowStickers]=useState(false);
  const [canvasSize]=useState({w:760,h:560});
  const drawRef = useRef({drawing:false,lx:0,ly:0,startX:0,startY:0});

  useEffect(()=>{
    const c=canvasRef.current; if(!c)return;
    const dpr=window.devicePixelRatio||1;
    c.width=canvasSize.w*dpr; c.height=canvasSize.h*dpr;
    c.style.width=canvasSize.w+'px'; c.style.height=canvasSize.h+'px';
    const ctx=c.getContext('2d'); ctx.scale(dpr,dpr);
    ctx.fillStyle='#080810'; ctx.fillRect(0,0,canvasSize.w,canvasSize.h);
    saveHistory();
  },[]);

  const saveHistory=useCallback(()=>{
    const c=canvasRef.current; if(!c)return;
    setHistory(h=>[...h.slice(-25),c.toDataURL()]); setRedoStack([]);
  },[]);

  const getPos=e=>{
    const c=canvasRef.current; const r=c.getBoundingClientRect();
    const sx=canvasSize.w/r.width, sy=canvasSize.h/r.height;
    const s=e.touches?e.touches[0]:e;
    return {x:(s.clientX-r.left)*sx,y:(s.clientY-r.top)*sy};
  };

  const applyBrush=(ctx,x,y,px,py)=>{
    ctx.globalAlpha=opacity; ctx.strokeStyle=brush==='eraser'?'#080810':color;
    ctx.fillStyle=color; ctx.lineWidth=size; ctx.lineCap='round'; ctx.lineJoin='round';
    if(brush==='pen'){ctx.globalCompositeOperation='source-over';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();}
    else if(brush==='brush'){ctx.lineWidth=size*2;ctx.globalAlpha=opacity*0.4;for(let i=0;i<3;i++){const jx=x+(Math.random()-0.5)*size*0.5,jy=y+(Math.random()-0.5)*size*0.5;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(jx,jy);ctx.stroke();}}
    else if(brush==='marker'){ctx.globalCompositeOperation='multiply';ctx.globalAlpha=0.6;ctx.lineWidth=size*3;ctx.lineCap='square';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();}
    else if(brush==='spray'){const d=size*3;for(let i=0;i<d;i++){const a=Math.random()*Math.PI*2,rad=Math.random()*size*2;ctx.globalAlpha=Math.random()*opacity*0.6;ctx.fillRect(x+rad*Math.cos(a),y+rad*Math.sin(a),1.5,1.5);}}
    else if(brush==='eraser'){ctx.globalAlpha=1;ctx.lineWidth=size*3;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();}
    ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1;
    if(symmetry){ctx.globalAlpha=opacity;ctx.strokeStyle=brush==='eraser'?'#080810':color;ctx.lineWidth=size;ctx.beginPath();ctx.moveTo(canvasSize.w-px,py);ctx.lineTo(canvasSize.w-x,y);ctx.stroke();ctx.globalAlpha=1;}
  };

  const floodFill=(sx,sy)=>{
    const c=canvasRef.current; const ctx=c.getContext('2d'); const dpr=window.devicePixelRatio||1;
    const img=ctx.getImageData(0,0,c.width,c.height); const d=img.data;
    const px=Math.floor(sx*dpr),py=Math.floor(sy*dpr),w=c.width;
    const i0=(py*w+px)*4; const tr=d[i0],tg=d[i0+1],tb=d[i0+2];
    const fr=parseInt(color.slice(1,3),16),fg=parseInt(color.slice(3,5),16),fb=parseInt(color.slice(5,7),16);
    if(tr===fr&&tg===fg&&tb===fb)return;
    const stack=[[px,py]],vis=new Set();
    const match=i=>Math.abs(d[i]-tr)<30&&Math.abs(d[i+1]-tg)<30&&Math.abs(d[i+2]-tb)<30;
    while(stack.length){const[cx,cy]=stack.pop();if(cx<0||cx>=w||cy<0||cy>=c.height)continue;const k=cy*w+cx;if(vis.has(k))continue;const i=(cy*w+cx)*4;if(!match(i))continue;vis.add(k);d[i]=fr;d[i+1]=fg;d[i+2]=fb;d[i+3]=255;stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);}
    ctx.putImageData(img,0,0); saveHistory();
  };

  const start=e=>{if(e.touches)e.preventDefault();const{x,y}=getPos(e);const d=drawRef.current;d.drawing=true;d.lx=x;d.ly=y;d.startX=x;d.startY=y;if(brush==='fill'){floodFill(x,y);d.drawing=false;return;}if(['pen','brush','marker','spray','eraser'].includes(brush)){applyBrush(canvasRef.current.getContext('2d'),x,y,x,y);}};
  const move=e=>{if(e.touches)e.preventDefault();const d=drawRef.current;if(!d.drawing)return;const{x,y}=getPos(e);const ctx=canvasRef.current.getContext('2d');if(['line','rect','circle'].includes(brush)){const ov=overlayRef.current;const oct=ov.getContext('2d');oct.clearRect(0,0,ov.width,ov.height);oct.strokeStyle=color;oct.lineWidth=size;oct.globalAlpha=opacity;oct.lineCap='round';if(brush==='line'){oct.beginPath();oct.moveTo(d.startX,d.startY);oct.lineTo(x,y);oct.stroke();}else if(brush==='rect'){oct.strokeRect(d.startX,d.startY,x-d.startX,y-d.startY);}else if(brush==='circle'){const rx=Math.abs(x-d.startX)/2,ry=Math.abs(y-d.startY)/2,cx=d.startX+(x-d.startX)/2,cy=d.startY+(y-d.startY)/2;oct.beginPath();oct.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);oct.stroke();}}else{applyBrush(ctx,x,y,d.lx,d.ly);}d.lx=x;d.ly=y;};
  const end=()=>{const d=drawRef.current;if(!d.drawing)return;d.drawing=false;if(['line','rect','circle'].includes(brush)){const ov=overlayRef.current;canvasRef.current.getContext('2d').drawImage(ov,0,0,canvasSize.w,canvasSize.h);ov.getContext('2d').clearRect(0,0,ov.width,ov.height);}saveHistory();};

  const undo=()=>{if(history.length<2)return;const nh=[...history];const cur=nh.pop();setRedoStack(r=>[...r,cur]);setHistory(nh);const img=new Image();img.onload=()=>{const ctx=canvasRef.current.getContext('2d');ctx.clearRect(0,0,canvasSize.w,canvasSize.h);ctx.drawImage(img,0,0,canvasSize.w,canvasSize.h);};img.src=nh[nh.length-1];};
  const redo=()=>{if(!redoStack.length)return;const nr=[...redoStack];const nx=nr.pop();setRedoStack(nr);setHistory(h=>[...h,nx]);const img=new Image();img.onload=()=>{const ctx=canvasRef.current.getContext('2d');ctx.clearRect(0,0,canvasSize.w,canvasSize.h);ctx.drawImage(img,0,0,canvasSize.w,canvasSize.h);};img.src=nx;};
  const clear=()=>{const ctx=canvasRef.current.getContext('2d');ctx.fillStyle='#080810';ctx.fillRect(0,0,canvasSize.w,canvasSize.h);saveHistory();};
  const save=()=>{const l=document.createElement('a');l.download='lithe-art.png';l.href=canvasRef.current.toDataURL('image/png');l.click();};
  const addSticker=s=>{const ctx=canvasRef.current.getContext('2d');ctx.fillStyle=color;ctx.globalAlpha=opacity;ctx.font=`${size*6}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,canvasSize.w/2,canvasSize.h/2);ctx.textAlign='start';ctx.textBaseline='alphabetic';ctx.globalAlpha=1;saveHistory();setShowStickers(false);};
  const addText=()=>{const t=prompt('Enter text:');if(!t)return;const ctx=canvasRef.current.getContext('2d');ctx.font=`${size*4}px "IBM Plex Mono"`;ctx.fillStyle=color;ctx.globalAlpha=opacity;ctx.fillText(t,canvasSize.w/2-ctx.measureText(t).width/2,canvasSize.h/2);ctx.globalAlpha=1;saveHistory();};

  const fs={none:'none',grayscale:'grayscale(100%)',sepia:'sepia(80%)',invert:'invert(100%)',blur:'blur(1px)',saturate:'saturate(200%)'}[filter];
  const iconBtn=a=>({background:a?'#1a1228':'transparent',border:`0.5px solid ${a?'#7b3fff':'#2a1e42'}`,color:a?'#d0b0ff':'#5a4a8a',fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.55rem',padding:'0.28rem 0.4rem',borderRadius:'4px',cursor:'pointer'});
  const bar={background:'#0d0b16',borderBottom:'0.5px solid #1e1530',padding:'0.4rem 0.75rem',display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap'};

  return (
    <div style={{fontFamily:"'IBM Plex Mono',monospace",color:'#b8a8d4',display:'flex',flexDirection:'column',background:'#080810'}}>
      <div style={{background:'#0d0b16',borderBottom:'0.5px solid #2a1e42',padding:'0.5rem 0.75rem',display:'flex',gap:'0.35rem',flexWrap:'wrap',alignItems:'center'}}>
        {BRUSHES.map(b=>(<button key={b.id} onClick={()=>setBrush(b.id)} style={{background:brush===b.id?'#1a1228':'transparent',border:`0.5px solid ${brush===b.id?'#7b3fff':'#2a1e42'}`,color:brush===b.id?'#d0b0ff':'#5a4a8a',fontFamily:'inherit',fontSize:'0.42rem',padding:'0.3rem 0.45rem',borderRadius:'4px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'1px'}}><i className={`ti ${b.icon}`} style={{fontSize:16}}/>{b.label}</button>))}
        <div style={{marginLeft:'auto',display:'flex',gap:'0.3rem'}}>
          <button onClick={addText} style={iconBtn(false)}><i className="ti ti-letter-t" style={{fontSize:15}}/></button>
          <button onClick={()=>setShowStickers(s=>!s)} style={iconBtn(showStickers)}><i className="ti ti-mood-smile" style={{fontSize:15}}/></button>
          <button onClick={()=>setShowGrid(g=>!g)} style={iconBtn(showGrid)}><i className="ti ti-grid-dots" style={{fontSize:15}}/></button>
          <button onClick={()=>setSymmetry(s=>!s)} style={iconBtn(symmetry)}><i className="ti ti-arrows-left-right" style={{fontSize:15}}/></button>
        </div>
      </div>
      <div style={bar}>
        <div>
          <div style={{fontSize:'0.48rem',color:'#3a2a5a',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:2}}>Colors</div>
          <div style={{display:'flex',gap:'0.25rem',flexWrap:'wrap',maxWidth:230}}>
            {COLORS.map(c=>(<div key={c} onClick={()=>setColor(c)} style={{width:18,height:18,borderRadius:'50%',background:c,cursor:'pointer',border:color===c?'2px solid #fff':'2px solid transparent'}}/>))}
            <input type="color" value={customColor} onChange={e=>{setCustomColor(e.target.value);setColor(e.target.value);}} style={{width:18,height:18,borderRadius:'50%',border:'none',padding:0,cursor:'pointer',background:'transparent'}}/>
          </div>
        </div>
        <div style={{marginLeft:'auto'}}>
          <div style={{fontSize:'0.48rem',color:'#3a2a5a',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:2}}>Size</div>
          <div style={{display:'flex',gap:'0.25rem',alignItems:'center'}}>
            {SIZES.map(s=>(<div key={s} onClick={()=>setSize(s)} style={{width:s*1.3+8,height:s*1.3+8,borderRadius:'50%',background:size===s?color:'#2a1e42',cursor:'pointer',border:size===s?`2px solid ${color}`:'2px solid transparent',flexShrink:0}}/>))}
          </div>
        </div>
      </div>
      <div style={{...bar,gap:'0.75rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flex:1}}>
          <span style={{fontSize:'0.5rem',color:'#3a2a5a',letterSpacing:'0.15em',textTransform:'uppercase',whiteSpace:'nowrap'}}>Opacity</span>
          <input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={e=>setOpacity(parseFloat(e.target.value))} style={{flex:1,accentColor:'#7b3fff'}}/>
          <span style={{fontSize:'0.58rem',color:'#7b3fff',minWidth:30}}>{Math.round(opacity*100)}%</span>
        </div>
        <div style={{display:'flex',gap:'0.25rem',flexWrap:'wrap'}}>{FILTERS.map(f=>(<button key={f.id} onClick={()=>setFilter(f.id)} style={{...iconBtn(filter===f.id),fontSize:'0.5rem',padding:'0.22rem 0.4rem'}}>{f.label}</button>))}</div>
      </div>
      <div style={{...bar,gap:'0.3rem'}}>
        <button onClick={undo} style={iconBtn(false)}><i className="ti ti-arrow-back-up" style={{fontSize:14}}/></button>
        <button onClick={redo} style={iconBtn(false)}><i className="ti ti-arrow-forward-up" style={{fontSize:14}}/></button>
        <div style={{width:'0.5px',background:'#2a1e42',height:20,margin:'0 0.2rem'}}/>
        <button onClick={clear} style={{...iconBtn(false),color:'#c07070',borderColor:'#5a2a2a'}}><i className="ti ti-trash" style={{fontSize:14}}/></button>
        <button onClick={save} style={{...iconBtn(false),color:'#7ecfc0',borderColor:'#2a5a4a',marginLeft:'auto',display:'flex',alignItems:'center',gap:4,padding:'0.28rem 0.65rem'}}><i className="ti ti-download" style={{fontSize:14}}/><span style={{fontSize:'0.55rem'}}>Save PNG</span></button>
        <button onClick={()=>setZoom(z=>Math.max(0.25,z-0.25))} style={{...iconBtn(false),padding:'0.22rem 0.35rem'}}>-</button>
        <span style={{fontSize:'0.55rem',color:'#7b3fff',minWidth:30,textAlign:'center'}}>{Math.round(zoom*100)}%</span>
        <button onClick={()=>setZoom(z=>Math.min(3,z+0.25))} style={{...iconBtn(false),padding:'0.22rem 0.35rem'}}>+</button>
      </div>
      {showStickers&&(<div style={{background:'#0d0b16',border:'0.5px solid #3a2a5a',padding:'0.5rem',display:'flex',flexWrap:'wrap',gap:'0.35rem'}}>{STICKERS.map(s=>(<button key={s} onClick={()=>addSticker(s)} style={{background:'#0a0814',border:'0.5px solid #2a1e42',borderRadius:'4px',fontSize:'1.3rem',padding:'0.3rem 0.4rem',cursor:'pointer'}}>{s}</button>))}</div>)}
      <div style={{overflow:'auto',display:'flex',alignItems:'flex-start',justifyContent:'flex-start',background:'#04040a',padding:'0.5rem',maxHeight:'55vh'}}>
        <div style={{position:'relative',transform:`scale(${zoom})`,transformOrigin:'top left'}}>
          <canvas ref={canvasRef} style={{display:'block',filter:fs,cursor:brush==='eraser'?'cell':'crosshair',touchAction:'none'}} onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end}/>
          <canvas ref={overlayRef} width={canvasSize.w} height={canvasSize.h} style={{position:'absolute',top:0,left:0,pointerEvents:'none',width:canvasSize.w,height:canvasSize.h}}/>
          {showGrid&&(<div style={{position:'absolute',top:0,left:0,width:canvasSize.w,height:canvasSize.h,pointerEvents:'none',backgroundImage:'linear-gradient(#2a1e4222 1px,transparent 1px),linear-gradient(90deg,#2a1e4222 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>)}
          {symmetry&&(<div style={{position:'absolute',top:0,left:'50%',width:'0.5px',height:'100%',background:'#7b3fff44',pointerEvents:'none'}}/>)}
        </div>
      </div>
      <div style={{background:'#0a0814',borderTop:'0.5px solid #1e1530',padding:'0.25rem 0.75rem',display:'flex',gap:'0.75rem',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:10,height:10,borderRadius:'50%',background:color,border:'1px solid #4a3a6a'}}/><span style={{fontSize:'0.5rem',color:'#3a2a5a'}}>{color}</span></div>
        <span style={{fontSize:'0.5rem',color:'#3a2a5a'}}>{brush} · {size}px · {Math.round(opacity*100)}%</span>
        {symmetry&&<span style={{fontSize:'0.5rem',color:'#7b3fff'}}>symmetry</span>}
        <span style={{fontSize:'0.5rem',color:'#2a1e42',marginLeft:'auto'}}>{canvasSize.w}×{canvasSize.h}</span>
      </div>
    </div>
  );
}
