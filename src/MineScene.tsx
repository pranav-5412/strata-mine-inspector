import { useMemo, useEffect, useRef, useState, Component } from 'react';
import type { ReactNode, ElementRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { site, gridPoint, sample, inside, pitRadius } from './model';
import type { Point, SurveyKey } from './model';
import {createRockMaterial} from './rockMaterial';
import MineDetails from './MineDetails';
export type SceneProps={survey:SurveyKey;layer:'natural'|'change'|'depth';boundary:boolean;limits:boolean;view:'perspective'|'top';reset:number;focus:Point|null;onPick?:(p:Point)=>void;selected:Point|null;section:[Point,Point]|null;compact?:boolean};
function Ground({survey,layer,onPick}:Pick<SceneProps,'survey'|'layer'|'onPick'>){
 const texture=useTexture('materials/weathered-rock-v1.png');
 useMemo(()=>{texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;texture.needsUpdate=true;},[texture]);
 const geometry=useMemo(()=>{
  const grid=site[survey],pos=new Float32Array(grid.size*grid.size*3),colors=new Float32Array(pos.length),indices=new Uint32Array((grid.size-1)**2*6);
  for(let k=0;k<grid.values.length;k++){const p=gridPoint(grid,k);pos.set([p.x,grid.values[k],p.z],k*3);}
  let offset=0;for(let j=0;j<grid.size-1;j++)for(let i=0;i<grid.size-1;i++){const a=j*grid.size+i,b=a+1,c=a+grid.size,d=c+1;indices.set([a,c,b,b,c,d],offset);offset+=6;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(new THREE.BufferAttribute(indices,1));g.computeVertexNormals();
  const normals=g.getAttribute('normal'),tan=new THREE.Color('#a39275'),gray=new THREE.Color('#77756c'),dust=new THREE.Color('#a99a7c'),green=new THREE.Color('#727555'),red=new THREE.Color('#d96042'),blue=new THREE.Color('#397b81'),color=new THREE.Color();
  for(let k=0;k<grid.values.length;k++){
   const p=gridPoint(grid,k),y=grid.values[k],r=pitRadius(p.x,p.z),slope=1-Math.abs(normals.getY(k)),noise=(Math.sin(p.x*.063+p.z*.08)+Math.sin(p.z*.12-p.x*.05))*.035;
   const band=(Math.sin(y*.14+Math.sin(p.x*.006)*.8)+1)*.5;
   color.copy(tan).lerp(gray,Math.min(.8,band*.3+slope*.7));
   if(r>1.02)color.copy(dust).lerp(green,Math.min(.65,(r-1)*.65)).multiplyScalar(.95+noise);
   else color.multiplyScalar(.92+noise+(y+150)/1600);
   if(layer==='depth')color.copy(blue).lerp(tan,THREE.MathUtils.clamp((y+170)/320,0,1));
   if(layer==='change'){const change=site.baseline.values[k]-y;if(change>site.tolerance)color.lerp(red,Math.min(.92,.35+change/100));else color.multiplyScalar(.85);if(survey==='latest'&&((!inside(p,site.boundary)&&site.reference.values[k]-y>site.tolerance)||y<site.permittedElevation-site.tolerance))color.copy(red);}
   colors.set([color.r,color.g,color.b],k*3);
  }
  g.setAttribute('color',new THREE.BufferAttribute(colors,3));return g;
 },[survey,layer]);
 const material=useMemo(()=>createRockMaterial(layer!=='natural',texture),[layer,texture]);
 useEffect(()=>()=>{geometry.dispose();material.dispose();},[geometry,material]);
 return <mesh geometry={geometry} material={material} castShadow receiveShadow onClick={onPick?(event)=>{event.stopPropagation();onPick({x:event.point.x,z:event.point.z});}:undefined}/>;
}
function TerrainSkirt({survey}:{survey:SurveyKey}){
 const geometry=useMemo(()=>{const grid=site[survey],n=grid.size,edges:number[]=[];for(let i=0;i<n;i++)edges.push(i);for(let j=1;j<n;j++)edges.push(j*n+n-1);for(let i=n-2;i>=0;i--)edges.push((n-1)*n+i);for(let j=n-2;j>0;j--)edges.push(j*n);edges.push(0);const positions:number[]=[],indices:number[]=[];edges.forEach((index,i)=>{const p=gridPoint(grid,index);positions.push(p.x,grid.values[index],p.z,p.x,-260,p.z);if(i<edges.length-1){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;},[survey]);useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} receiveShadow><meshStandardMaterial color="#595649" roughness={1} side={THREE.DoubleSide}/></mesh>;
}
function Scene(props:SceneProps&{onStats:(s:string)=>void}){
 const controls=useRef<ElementRef<typeof OrbitControls>>(null);const{camera,gl}=useThree();const motion=useRef<{position:THREE.Vector3;target:THREE.Vector3}|null>(null);
 const timing=useRef({elapsed:0,frames:0});
 useFrame((_,dt)=>{if(motion.current&&controls.current){const rate=1-Math.exp(-dt*6);camera.position.lerp(motion.current.position,rate);controls.current.target.lerp(motion.current.target,rate);controls.current.update();if(camera.position.distanceTo(motion.current.position)<.5)motion.current=null;}timing.current.elapsed+=dt;timing.current.frames++;if(timing.current.elapsed>2){props.onStats(`${Math.round(timing.current.frames/timing.current.elapsed)} FPS · ${Math.round(gl.info.render.triangles/1000)}k triangles`);timing.current={elapsed:0,frames:0};}});
 useEffect(()=>{
  const target=props.focus?new THREE.Vector3(props.focus.x,sample(site[props.survey],props.focus)??0,props.focus.z):new THREE.Vector3(-80,-30,0);
  const position=props.view==='top'?target.clone().add(new THREE.Vector3(0,2200,.1)):target.clone().add(props.focus?new THREE.Vector3(500,430,640):new THREE.Vector3(1320,1080,1480));
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(position);controls.current?.target.copy(target);controls.current?.update();}else motion.current={position,target};
 },[camera,props.reset,props.view,props.focus,props.survey]);
 const boundaryPoints=useMemo(()=>[...site.boundary,site.boundary[0]].map(p=>[p.x,(sample(site.reference,p)??120)+8,p.z] as [number,number,number]),[]);
 const sectionPoints=useMemo(()=>props.section?Array.from({length:601},(_,i)=>{const a=props.section![0],b=props.section![1],p={x:a.x+(b.x-a.x)*i/600,z:a.z+(b.z-a.z)*i/600};return[p.x,(sample(site[props.survey],p)??0)+4,p.z] as [number,number,number]}):null,[props.section,props.survey]);
 return <>
  <color attach="background" args={['#202e2a']}/><fog attach="fog" args={['#202e2a',4500,8500]}/>
  <ambientLight intensity={.65}/><hemisphereLight args={['#d3e0e7','#655b40',.85]}/><directionalLight castShadow position={[-1400,2400,-900]} intensity={2.3} color="#fff0d2" shadow-mapSize={[2048,2048]} shadow-camera-left={-1800} shadow-camera-right={1800} shadow-camera-top={1800} shadow-camera-bottom={-1800} shadow-camera-near={10} shadow-camera-far={6000} shadow-normalBias={2} shadow-bias={-.00015}/>
  <Ground survey={props.survey} layer={props.layer} onPick={props.onPick}/><TerrainSkirt survey={props.survey}/><MineDetails survey={props.survey}/>
  {props.boundary&&<Line points={boundaryPoints} color="#e6bd6c" lineWidth={2} dashed dashSize={22} gapSize={13}/>}
  {props.limits&&<mesh position={[-150,site.permittedElevation,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[440,80]}/><meshBasicMaterial color="#57b8b2" transparent opacity={.28} depthWrite={false} side={THREE.DoubleSide}/></mesh>}
  {sectionPoints&&<Line points={sectionPoints} color="#91d8db" lineWidth={3}/>}
  {props.selected&&<group position={[props.selected.x,(sample(site[props.survey],props.selected)??0)+10,props.selected.z]}><mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[12,18,32]}/><meshBasicMaterial color="#f3e3af" side={THREE.DoubleSide}/></mesh><Html center position={[0,40,0]}><div className="point-label">Inspection point</div></Html></group>}
  <OrbitControls ref={controls} makeDefault minDistance={80} maxDistance={4000} maxPolarAngle={Math.PI*.49} enableDamping dampingFactor={.08} target={[-80,-30,0]} onStart={()=>{motion.current=null;}}/>
 </>;
}
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?<div className="scene-fallback">The 3D view could not start. Enable browser hardware acceleration and reload. Findings and reports remain available.</div>:this.props.children;}}
export default function MineScene(props:SceneProps){const[error,setError]=useState(false),[stats,setStats]=useState('');return <SceneBoundary><div className="mine-renderer">{error?<div className="scene-fallback">The graphics context was lost. Reload to restore the mine view.</div>:<Canvas shadows camera={{position:[1320,1080,1480],fov:42,near:1,far:12000}} dpr={[1,2]} gl={{antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance',toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.05}} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',()=>setError(true),{once:true});}}><Scene {...props} onStats={setStats}/></Canvas>}{!props.compact&&<div className="render-stats" aria-label="Renderer performance">HIGH DETAIL · 4 m SURFACE<span>{stats}</span></div>}</div></SceneBoundary>}
