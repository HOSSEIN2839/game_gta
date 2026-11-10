import * as THREE from "three";
const $=s=>document.querySelector(s), root=$("#world"), scene=new THREE.Scene();
scene.background=new THREE.Color(0x9bb8c7);scene.fog=new THREE.Fog(0x9bb8c7,80,230);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;root.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdcecff,0x58604a,2));
const sun=new THREE.DirectionalLight(0xffedcf,2.3);sun.position.set(-40,70,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.88});
function block(parent,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
const grass=material(0x667d50),road=material(0x343a40),walk=material(0x999b91),glass=material(0x426575),roof=material(0x565b60);
block(scene,230,1,230,grass,0,-.55,0);
const grid=[-68,-34,0,34,68];
for(const p of grid){block(scene,13,.12,220,road,p,.02,0);block(scene,220,.12,13,road,0,.02,p);block(scene,17,.2,220,walk,p-17,.08,0);block(scene,17,.2,220,walk,p+17,.08,0);block(scene,220,.2,17,walk,0,.08,p-17);block(scene,220,.2,17,walk,0,.08,p+17)}
let seed=19;const rnd=()=>((seed=seed*9301+49297)%233280)/233280;
const colors=[0xc5b59d,0x9eaaa9,0xb7a18d,0x8e999b,0xd0c5ad,0x9c9b91];
for(let ix=-2;ix<=2;ix++)for(let iz=-2;iz<=2;iz++){if(!ix&&!iz)continue;for(let n=0;n<3;n++){const w=8+rnd()*7,d=8+rnd()*7,h=8+rnd()*22,x=ix*34+(rnd()-.5)*12,z=iz*34+(rnd()-.5)*12,g=new THREE.Group();g.position.set(x,0,z);scene.add(g);block(g,w,h,d,material(colors[Math.floor(rnd()*colors.length)]),0,h/2,0);block(g,w+.3,.4,d+.3,roof,0,h+.2,0);for(let f=1.5;f<h;f+=3){block(g,w*.62,1,.08,glass,0,f,d/2+.05);block(g,w*.62,1,.08,glass,0,f,-d/2-.05)}}}
const player=new THREE.Group();scene.add(player);const skin=material(0xc58d6b),shirt=material(0x263f59),pants=material(0x292d35);
block(player,.8,1.05,.42,shirt,0,1.35,0);const head=new THREE.Mesh(new THREE.SphereGeometry(.29,18,14),skin);head.position.y=2.12;player.add(head);
const legs=[block(player,.29,.85,.32,pants,-.22,.42,0),block(player,.29,.85,.32,pants,.22,.42,0)];
const arms=[block(player,.23,.8,.26,skin,-.55,1.35,0),block(player,.23,.8,.26,skin,.55,1.35,0)];player.position.set(0,0,8);
const car=new THREE.Group();scene.add(car);car.position.set(2,0,5);block(car,2.2,.75,4,material(0x9b3430),0,.85,0);block(car,1.6,.7,2,glass,0,1.55,-.15);
for(const x of [-1.08,1.08])for(const z of [-1.3,1.3]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.22,16),material(0x17191b));w.rotation.z=Math.PI/2;w.position.set(x,.42,z);car.add(w)}
const keys=new Set();let begun=false,inCar=false,yaw=0,pitch=.2,dist=7.5,vy=0,toastTime=0;
const clamp=THREE.MathUtils.clamp,clock=new THREE.Clock(),move=new THREE.Vector3(),camPos=new THREE.Vector3();
function toast(t){$("#toast").textContent=t;$("#toast").style.opacity=1;toastTime=2}
function nearCar(){return player.position.distanceTo(car.position)<4.5}
function toggleCar(){if(!inCar&&nearCar()){inCar=true;player.visible=false;toast("Vehicle entered")}else if(inCar){inCar=false;player.visible=true;player.position.copy(car.position).add(new THREE.Vector3(2.5,0,0));toast("Vehicle exited")}$("#mode").textContent=inCar?"DRIVING":"ON FOOT"}
$("#startBtn").onclick=()=>{begun=true;$("#start").classList.add("hidden");$("#hud").classList.remove("hidden");$("#help").classList.remove("hidden");renderer.domElement.requestPointerLock()};
renderer.domElement.onclick=()=>{if(begun&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock()};
document.addEventListener("mousemove",e=>{if(!begun||document.pointerLockElement!==renderer.domElement)return;yaw-=e.movementX*.0025;pitch=clamp(pitch-e.movementY*.0018,-.12,.85)});
document.addEventListener("keydown",e=>{keys.add(e.code);if(e.code==="Space")e.preventDefault();if(e.code==="KeyE"&&!e.repeat&&begun)toggleCar()});
document.addEventListener("keyup",e=>keys.delete(e.code));
renderer.domElement.addEventListener("wheel",e=>dist=clamp(dist+Math.sign(e.deltaY)*.8,3.2,14),{passive:true});
function update(dt){if(inCar){const f=new THREE.Vector3(Math.sin(car.rotation.y),0,Math.cos(car.rotation.y)),t=(keys.has("KeyW")?1:0)-(keys.has("KeyS")?1:0),s=(keys.has("KeyA")?1:0)-(keys.has("KeyD")?1:0);car.rotation.y+=s*dt*(Math.abs(t)?1.5:.7);car.position.addScaledVector(f,t*dt*15);car.position.x=clamp(car.position.x,-105,105);car.position.z=clamp(car.position.z,-105,105);return}
const f=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),r=new THREE.Vector3(f.z,0,-f.x);move.set(0,0,0);if(keys.has("KeyW"))move.add(f);if(keys.has("KeyS"))move.sub(f);if(keys.has("KeyD"))move.add(r);if(keys.has("KeyA"))move.sub(r);
if(move.lengthSq()){move.normalize();player.position.addScaledVector(move,(keys.has("ShiftLeft")?10:5.3)*dt);player.rotation.y=Math.atan2(move.x,move.z);const a=Math.sin(performance.now()*.012)*.3;legs[0].rotation.x=a;legs[1].rotation.x=-a;arms[0].rotation.x=-a;arms[1].rotation.x=a}
if(keys.has("Space")&&player.position.y<=.001)vy=7;vy-=19*dt;player.position.y=Math.max(0,player.position.y+vy*dt);if(!player.position.y)vy=0;player.position.x=clamp(player.position.x,-108,108);player.position.z=clamp(player.position.z,-108,108)}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);if(begun){update(dt);const target=inCar?car.position:player.position,h=inCar?1.4:1.55,hor=Math.cos(pitch)*dist;camPos.set(target.x-Math.sin(yaw)*hor,target.y+h+Math.sin(pitch)*dist+1,target.z-Math.cos(yaw)*hor);camera.position.lerp(camPos,1-Math.exp(-dt*8));camera.lookAt(target.x,target.y+h,target.z);$("#prompt").classList.toggle("hidden",inCar||!nearCar());if(toastTime>0&&(toastTime-=dt)<=0)$("#toast").style.opacity=0}else{camera.position.set(22,19,28);camera.lookAt(0,0,0)}renderer.render(scene,camera)}
loop();addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6))});