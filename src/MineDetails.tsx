import {useMemo,useLayoutEffect,useRef,useEffect} from 'react';
import * as THREE from 'three';
import {site,sample,pitRadius,haulRoadPoint} from './model';
import type {Point,SurveyKey} from './model';
type Instance={p:[number,number,number];s:[number,number,number];angle:number;color:string};
function Scatter({items,vegetation=false}:{items:Instance[];vegetation?:boolean}){
 const ref=useRef<THREE.InstancedMesh>(null);
 useLayoutEffect(()=>{if(!ref.current)return;const obj=new THREE.Object3D(),color=new THREE.Color();items.forEach((item,i)=>{obj.position.set(...item.p);obj.rotation.set(.12*Math.sin(i),item.angle,.15*Math.cos(i));obj.scale.set(...item.s);obj.updateMatrix();ref.current!.setMatrixAt(i,obj.matrix);ref.current!.setColorAt(i,color.set(item.color));});ref.current.instanceMatrix.needsUpdate=true;if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;ref.current.computeBoundingSphere();},[items]);
 return <instancedMesh ref={ref} args={[undefined,undefined,items.length]} castShadow receiveShadow>{vegetation?<icosahedronGeometry args={[1,1]}/>:<dodecahedronGeometry args={[1,0]}/>}<meshStandardMaterial roughness={1}/></instancedMesh>;
}
function Road({survey}:{survey:SurveyKey}){
 const geometry=useMemo(()=>{const points:number[]=[],indices:number[]=[];for(let i=0;i<=900;i++){const t=i/900,p=haulRoadPoint(t),next=haulRoadPoint(Math.min(1,t+.001)),prev=haulRoadPoint(Math.max(0,t-.001)),dx=next.x-prev.x,dz=next.z-prev.z,length=Math.hypot(dx,dz)||1;for(const side of [-1,1]){const point={x:p.x-dz/length*11.5*side,z:p.z+dx/length*11.5*side};points.push(point.x,(sample(site[survey],point)??0)+.9,point.z);}if(i<900){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setIndex(indices);g.computeVertexNormals();return g;},[survey]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} receiveShadow><meshStandardMaterial color="#97836a" roughness={1} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-1}/></mesh>;
}
function Truck({t,survey}:{t:number;survey:SurveyKey}){const p=haulRoadPoint(t),next=haulRoadPoint(t+.002),height=(sample(site[survey],p)??0)+2;return <group position={[p.x,height,p.z]} rotation={[0,Math.atan2(next.x-p.x,next.z-p.z),0]}>
 <mesh castShadow position={[0,1,0]}><boxGeometry args={[7,2,13]}/><meshStandardMaterial color="#a77d2e"/></mesh><mesh castShadow position={[0,3,-2]}><boxGeometry args={[7.5,3.2,8]}/><meshStandardMaterial color="#c29a44"/></mesh><mesh castShadow position={[0,3,4]}><boxGeometry args={[5.8,3,3.5]}/><meshStandardMaterial color="#d0a853"/></mesh><mesh position={[0,3.5,5.8]}><boxGeometry args={[4.8,1.4,.1]}/><meshStandardMaterial color="#263832"/></mesh>{[-1,1].flatMap(side=>[-3.8,3.8].map(z=><mesh castShadow key={`${side}-${z}`} position={[side*3.8,.8,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.6,1.6,1.7,12]}/><meshStandardMaterial color="#262a25"/></mesh>))}
 </group>;}
function Building({point,width,length,height}:{point:Point;width:number;length:number;height:number}){const y=sample(site.reference,point)??120;return <group position={[point.x,y,point.z]}><mesh position={[0,-.2,0]} receiveShadow><boxGeometry args={[width+14,1,length+14]}/><meshStandardMaterial color="#877e6a"/></mesh><mesh castShadow receiveShadow position={[0,height/2,0]}><boxGeometry args={[width,height,length]}/><meshStandardMaterial color="#b4b3a1"/></mesh><mesh castShadow position={[0,height+.4,0]} rotation={[0,0,.035]}><boxGeometry args={[width+3,1.6,length+3]}/><meshStandardMaterial color="#5e7270" roughness={.85}/></mesh>{[-.3,0,.3].map(k=><mesh key={k} position={[width/2+.1,height*.6,k*length]}><boxGeometry args={[.3,2,5]}/><meshStandardMaterial color="#344845"/></mesh>)}</group>;}
export default function MineDetails({survey}:{survey:SurveyKey}){
 const scatter=useMemo(()=>{
  let seed=3701;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const rocks:Instance[]=[],plants:Instance[]=[];
  for(let i=0;i<10000;i++){
   const x=random()*2300-1150,z=random()*2300-1150,p={x,z},r=pitRadius(x,z),height=sample(site[survey],p)!,ref=sample(site.reference,p)!;
   if(x>790&&z<-250&&z>-700)continue;
   const a=Math.atan2(z/620,(x+150)/790),t=(.98-r)/.75,roadAngle=-.25+t*Math.PI*2.5;
   const roadDistance=Math.abs(Math.atan2(Math.sin(a-roadAngle),Math.cos(a-roadAngle)))*Math.max(.2,r)*690/Math.sqrt(1+(r*Math.PI*2.5/.75)**2);
   if(r<1&&roadDistance<40)continue;
   if(i<5000&&rocks.length<2400&&height>-155){const scale=.8+random()*3.4;rocks.push({p:[x,height+scale*.25,z],s:[scale*(1+random()),scale*.55,scale],angle:random()*Math.PI,color:random()>.5?'#766d5d':'#8e8570'});}
   if(r>1.12&&Math.abs(ref-height)<1&&random()>.5&&plants.length<1100){const scale=2+random()*5;plants.push({p:[x,height+scale*.5,z],s:[scale,scale*.75,scale*.9],angle:random()*6.28,color:['#68724c','#777954','#566743','#84815b'][Math.floor(random()*4)]});}
  }return{rocks,plants};
 },[survey]);
 return <group><Road survey={survey}/><Scatter items={scatter.rocks}/><Scatter items={scatter.plants} vegetation/>{[.08,.33,.62,.84].map(t=><Truck key={t} t={t} survey={survey}/>)}<Building point={{x:950,z:-420}} width={60} length={95} height={17}/><Building point={{x:1045,z:-390}} width={35} length={55} height={10}/><Building point={{x:940,z:-565}} width={55} length={100} height={13}/>{[0,1,2].map(i=><group key={i} position={[830+i*45,(sample(site.reference,{x:830+i*45,z:-650})??120)+8,-650]}><mesh castShadow><coneGeometry args={[24,16,24]}/><meshStandardMaterial color={i===1?'#71695b':'#97876b'} roughness={1}/></mesh></group>)}</group>;
}
