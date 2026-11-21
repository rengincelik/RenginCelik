/**
 * Fragment shader for the desktop background: a slowly evolving contour field
 * (isolines of a noise field) plus a dithered image layer. Two images are
 * sampled so one can dissolve into the other (uMix 0 -> 1, cell by cell).
 * Colours come from uniforms, so the site's theme variables drive them.
 */
export const VERTEX = `#version 300 es
out vec2 vUv;
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vUv=p;gl_Position=vec4(p*2.-1.,0.,1.);}`;

export const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uDpr;
uniform vec3 uBg; uniform vec3 uFg; uniform vec3 uAcc;
uniform vec2 uCA; uniform vec2 uSA; uniform vec2 uCB; uniform vec2 uSB;
uniform sampler2D uTexA; uniform sampler2D uTexB; uniform float uMix;
out vec4 o;

const float BAYER[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);

vec3 hsv(vec3 c){vec3 p=abs(fract(c.xxx+vec3(0.,2./3.,1./3.))*6.-3.);return c.z*mix(vec3(1.),clamp(p-1.,0.,1.),c.y);}
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(17.,9.);a*=.5;}return s;}

// 1 where a dither dot is "on" for this image at this cell, else 0.
float layer(sampler2D tex, vec2 c, vec2 s, vec2 fc, float thr, float near){
  vec2 l=(fc-c)/s+.5;
  if(l.x<0.||l.x>1.||l.y<0.||l.y>1.) return 0.;
  vec4 t=textureLod(tex,l,0.);
  float lum=dot(t.rgb,vec3(.299,.587,.114))*t.a;
  float mask=.45+1.1*near;
  return step(thr,pow(lum,.85)*mask*1.15)*step(.04,t.a);
}

void main(){
  vec2 fc=gl_FragCoord.xy;
  vec2 p=(fc-.5*uRes)/uRes.y;
  vec2 m=(uMouse-.5*uRes)/uRes.y;
  float t=uTime;
  // hidden rainbow layer: hue varies with screen position and slowly over time
  vec3 rb=hsv(vec3(fract(fc.x/uRes.x*.9+fc.y/uRes.y*.5+t*.04),.75,.95));

  // contour field
  vec2 q=vec2(fbm(p*1.3+vec2(0.,t*.03)),fbm(p*1.3+vec2(5.2,1.3)-t*.02));
  float f=fbm(p*1.7+1.6*q+vec2(t*.015,0.));
  vec2 dm=p-m; float md=exp(-dot(dm,dm)/.035);
  f+=.22*md;
  float v=f*16.; float fw=max(fwidth(v),1e-4);
  float d=abs(fract(v+.5)-.5);
  float line=1.-clamp(d/fw-.5,0.,1.);
  float major=step(mod(floor(v+.5),5.),0.);
  float a=line*mix(.11,.28,major);
  vec3 col=uBg;
  col=mix(col,mix(uFg*.9,rb,clamp(md*1.4,0.,1.)),clamp(a*(1.+md*2.),0.,1.));

  // dithered image layer (cell-wise dissolve between image A and B)
  float cell=3.*uDpr; vec2 cc=floor(fc/cell);
  int bi=int(mod(cc.x,4.))+4*int(mod(cc.y,4.));
  float thr=(BAYER[bi]+.5)/16.;
  vec2 dd=(fc-uMouse)/uRes.y; float near=exp(-dot(dd,dd)/.05);
  float pick=step(hash(cc+3.7),uMix);
  float on=mix(layer(uTexA,uCA,uSA,fc,thr,near),layer(uTexB,uCB,uSB,fc,thr,near),pick);
  float dotm=1.-smoothstep(.34,.5,length(fract(fc/cell)-.5));
  vec3 dc=mix(uFg*.62+uBg*.38,rb,clamp(near*1.3,0.,1.));
  col=mix(col,dc,on*dotm);

  float dark=step(dot(uBg,vec3(.3333)),.5);
  col*=1.-.28*dark*smoothstep(.45,1.25,length(p));
  o=vec4(col,1.);
}`;