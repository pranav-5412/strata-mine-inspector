import * as THREE from "three";
// Metre-space shader detail is decorative only: no displacement of measured geometry.
export function createRockMaterial(
  analytical = false,
  texture?: THREE.Texture,
  exteriorTexture?: THREE.Texture,
) {
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.97,
    metalness: 0,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.rockAlbedo = { value: texture };
    shader.uniforms.exteriorAlbedo = { value: exteriorTexture };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vRockPosition;
varying vec3 vRockNormal;
attribute float exteriorWeight;
varying float vExteriorWeight;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vRockPosition = position;
vRockNormal = normal;
vExteriorWeight = exteriorWeight;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vRockPosition;
varying vec3 vRockNormal;
uniform sampler2D rockAlbedo;
uniform sampler2D exteriorAlbedo;
varying float vExteriorWeight;
float rockHash(vec3 p) { p=fract(p*0.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z); }
float rockNoise(vec3 p) {
vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
return mix(mix(mix(rockHash(i),rockHash(i+vec3(1,0,0)),f.x),mix(rockHash(i+vec3(0,1,0)),rockHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(rockHash(i+vec3(0,0,1)),rockHash(i+vec3(1,0,1)),f.x),mix(rockHash(i+vec3(0,1,1)),rockHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float rockFbm(vec3 p){return rockNoise(p)*.55+rockNoise(p*2.03)*.27+rockNoise(p*4.1)*.13+rockNoise(p*8.3)*.05;}
`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
vec3 baseTint=diffuseColor.rgb;
float coarse=rockFbm(vRockPosition*.045);
float grain=rockNoise(vRockPosition*.85);
float wall=1.0-smoothstep(.65,.95,abs(normalize(vRockNormal).y));
float strata=sin(vRockPosition.y*.72+rockNoise(vRockPosition*.012)*4.0)*.5+.5;
float crack=smoothstep(.68,.8,rockNoise(vec3(vRockPosition.x*.12,vRockPosition.y*.6,vRockPosition.z*.12)));
float detail=.76+coarse*.4+grain*.1-wall*strata*.16-wall*crack*.12;
diffuseColor.rgb*=mix(1.0,detail,${analytical ? "0.30" : "1.0"});
vec3 blendWeights=pow(abs(normalize(vRockNormal)),vec3(5.0));
blendWeights/=max(dot(blendWeights,vec3(1.0)),.0001);
vec3 rockCoords=vRockPosition*.055;
vec3 rockSurface=texture2D(rockAlbedo,rockCoords.zy).rgb*blendWeights.x+texture2D(rockAlbedo,rockCoords.xz).rgb*blendWeights.y+texture2D(rockAlbedo,rockCoords.xy).rgb*blendWeights.z;
diffuseColor.rgb*=mix(vec3(1.0),rockSurface*2.8,${analytical ? "0.1" : "(.12+wall*.73)"});
// Two different scales/orientations suppress obvious repeats on large ground areas.
vec2 groundUv=vRockPosition.xz/42.0;
vec2 groundUvWide=mat2(.8,-.6,.6,.8)*vRockPosition.xz/113.0+vec2(.31,.67);
vec3 groundSurface=mix(texture2D(exteriorAlbedo,groundUv).rgb,texture2D(exteriorAlbedo,groundUvWide).rgb,.28);
float groundVariation=.88+rockFbm(vec3(vRockPosition.x*.003,0.0,vRockPosition.z*.003))*.24;
float groundWeight=vExteriorWeight*${analytical ? "0.0" : "1.0"};
diffuseColor.rgb=mix(diffuseColor.rgb,baseTint*groundSurface*3.2*groundVariation,groundWeight);
`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
float heightDetail=rockFbm(vRockPosition*.38)*.45+rockNoise(vRockPosition*1.4)*.07+dot(rockSurface,vec3(.2126,.7152,.0722))*.18;
float groundHeight=rockNoise(vRockPosition*1.1)*.06+dot(groundSurface,vec3(.2126,.7152,.0722))*.18;
heightDetail=mix(heightDetail,groundHeight,groundWeight);
vec3 dpdx=dFdx(-vViewPosition),dpdy=dFdy(-vViewPosition);
vec3 r1=cross(dpdy,normal),r2=cross(normal,dpdx);
float determinant=dot(dpdx,r1);
vec3 gradient=sign(determinant)*(dFdx(heightDetail)*r1+dFdy(heightDetail)*r2);
normal=normalize(abs(determinant)*normal-gradient*${analytical ? "0.12" : "0.55"});
`,
      );
  };
  material.customProgramCacheKey = () => `strata-rock-ground-v4-${analytical}`;
  return material;
}
