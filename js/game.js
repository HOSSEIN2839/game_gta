import * as THREE from "three";
import { PlayerCharacter } from "./character.js";
import { GameAudio } from "./audio.js";
const $=s=>document.querySelector(s), root=$("#world"), scene=new THREE.Scene();
scene.background=new THREE.Color(0x9bb8c7);scene.fog=new THREE.Fog(0x9bb8c7,280,1050);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,2200);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.85));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;root.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdcecff,0x58604a,2));
const sun=new THREE.DirectionalLight(0xffedcf,2.3);sun.position.set(-90,120,65);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-620;sun.shadow.camera.right=620;sun.shadow.camera.top=620;sun.shadow.camera.bottom=-620;sun.shadow.bias=-0.00025;sun.shadow.normalBias=0.025;scene.add(sun);
const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.88});
function block(parent,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
const grass=material(0x667d50),road=material(0x343a40),walk=material(0x999b91),glass=material(0x426575),roof=material(0x565b60);
block(scene,1040,1,1040,grass,0,-.55,0);
const grid=Array.from({length:15},(_,i)=>(i-7)*70);
for(const p of grid){block(scene,15,.12,980,road,p,.02,0);block(scene,980,.12,15,road,0,.02,p);block(scene,12,.2,980,walk,p-14,.08,0);block(scene,12,.2,980,walk,p+14,.08,0);block(scene,980,.2,12,walk,0,.08,p-14);block(scene,980,.2,12,walk,0,.08,p+14)}
let seed=19;const rnd=()=>((seed=seed*9301+49297)%233280)/233280;
const colors=[0xc5b59d,0x9eaaa9,0xb7a18d,0x8e999b,0xd0c5ad,0x9c9b91];
const buildingColliders=[];
for(let ix=-6;ix<6;ix++)for(let iz=-6;iz<6;iz++){if(!ix&&!iz)continue;for(let n=0;n<2;n++){const w=8+rnd()*7,d=8+rnd()*7,h=8+rnd()*22,x=ix*70+35+(rnd()-.5)*18,z=iz*70+35+(rnd()-.5)*18,g=new THREE.Group();g.position.set(x,0,z);scene.add(g);buildingColliders.push({minX:x-w/2-.85,maxX:x+w/2+.85,minZ:z-d/2-.85,maxZ:z+d/2+.85});block(g,w,h,d,material(colors[Math.floor(rnd()*colors.length)]),0,h/2,0);block(g,w+.3,.4,d+.3,roof,0,h+.2,0);for(let f=1.5;f<h;f+=3){block(g,w*.62,1,.08,glass,0,f,d/2+.05);block(g,w*.62,1,.08,glass,0,f,-d/2-.05)}}}

const roadMark=material(0xe2ddc8),treeTrunk=material(0x60452f),treeLeaves=[material(0x315d3b),material(0x477448),material(0x64864a)];
for(const p of grid)for(let t=-470;t<=470;t+=28){block(scene,.13,.025,5,roadMark,p,.1,t);block(scene,5,.025,.13,roadMark,t,.1,p);}
const windObjects=[];
function addTree(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.24,2.4,7),treeTrunk);trunk.position.y=1.2;g.add(trunk);const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.25,1),treeLeaves[Math.floor(rnd()*treeLeaves.length)]);crown.position.y=3;crown.scale.set(1,1.15,.95);crown.castShadow=true;g.add(crown);const crown2=new THREE.Mesh(new THREE.IcosahedronGeometry(.7,1),treeLeaves[Math.floor(rnd()*treeLeaves.length)]);crown2.position.set(.55,3.4,.2);g.add(crown2);windObjects.push({object:g,phase:rnd()*Math.PI*2,amount:.025+rnd()*.035});}
for(const p of grid)for(let t=-455;t<=455;t+=140){if(Math.abs(p)<30&&Math.abs(t)<30)continue;for(const side of [-1,1]){if(rnd()>.28)addTree(p+side*12.5,t,.7+rnd()*.35);if(rnd()>.35)addTree(t,p+side*12.5,.7+rnd()*.35);}}
block(scene,48,.14,48,material(0x4d7949),35,.02,35);block(scene,3,.16,44,walk,35,.12,35);block(scene,44,.16,3,walk,35,.12,35);for(let i=0;i<28;i++){const petal=new THREE.Mesh(new THREE.SphereGeometry(.13,7,6),material([0xe8c85c,0xd9819a,0xe9e5d7][i%3]));petal.position.set(35+(rnd()-.5)*40,.22,35+(rnd()-.5)*40);scene.add(petal);}const pedestrians=[];
function addPedestrian(x,z,phase){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const skin=material(0xb98262),shirts=[material(0x34566e),material(0x76503e),material(0x46634b),material(0x5b5276)],pants=material(0x252b32);const body=new THREE.Mesh(new THREE.CapsuleGeometry(.25,.48,4,8),shirts[Math.floor(rnd()*shirts.length)]);body.position.y=1.2;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.19,14,12),skin);head.position.y=1.83;g.add(head);const arms=[];for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.36,4,7),skin);arm.position.set(side*.32,1.25,.02);g.add(arm);arms.push(arm);}const legs=[];for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.43,4,7),pants);leg.position.set(side*.13,.52,0);g.add(leg);legs.push(leg);}pedestrians.push({root:g,arms,legs,phase,speed:.35+rnd()*.65,origin:new THREE.Vector3(x,0,z),radius:3+rnd()*8,dialogue:["سلام! روز خوبی داشته باشی.","مراقب خیابان باش!","به شهر خوش آمدی.","امروز هوا عالی است."][Math.floor(rnd()*4)],talkUntil:0});}
for(let i=0;i<64;i++){const a=rnd()*Math.PI*2,r=28+rnd()*420;addPedestrian(Math.cos(a)*r,Math.sin(a)*r,rnd()*6);}

const character=new PlayerCharacter(scene),player=character.root;
let crouching=false,sitting=false,transitioning=false;
const audio=new GameAudio();
const car=new THREE.Group();scene.add(car);car.position.set(2,0,5);const carPaint=new THREE.MeshPhysicalMaterial({color:0x9b3430,metalness:.72,roughness:.24,clearcoat:.9,clearcoatRoughness:.12});block(car,2.2,.75,4,carPaint,0,.85,0);block(car,1.72,.72,2.05,new THREE.MeshPhysicalMaterial({color:0x426575,metalness:.2,roughness:.12,transparent:true,opacity:.72}),0,1.55,-.15);for(const sx of [-.78,.78]){block(car,.34,.16,.07,material(0xffe8b2),sx,1.02,2.02);block(car,.34,.16,.07,material(0x9d1f1f),sx,1.02,-2.02);}
for(const x of [-1.08,1.08])for(const z of [-1.3,1.3]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.22,16),material(0x17191b));w.rotation.z=Math.PI/2;w.position.set(x,.42,z);car.add(w)}

const rubber=material(0x17191b);
const parkedVehicles=[];
function spawnParkedCar(x,z,color,rotation=0){const g=new THREE.Group();g.position.set(x,.02,z);g.rotation.y=rotation;scene.add(g);const bodyMat=new THREE.MeshStandardMaterial({color,metalness:.58,roughness:.3});block(g,1.9,.58,3.9,bodyMat,0,.72,0);const cabin=block(g,1.58,.72,1.85,glass,0,1.35,-.15);cabin.material=new THREE.MeshPhysicalMaterial({color:0x365a68,metalness:.18,roughness:.2,transparent:true,opacity:.78});for(const sx of [-.84,.84])for(const sz of [-1.25,1.25]){const tire=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.2,16),rubber);tire.rotation.z=Math.PI/2;tire.position.set(sx,.35,sz);g.add(tire);}for(const sx of [-.62,.62]){block(g,.3,.16,.06,material(0xffe7ad),sx,.77,1.97);block(g,.3,.15,.06,material(0x861a1a),sx,.75,-1.97);}parkedVehicles.push(g);}
spawnParkedCar(-70,-145,0x315f85,.08);spawnParkedCar(140,75,0x777d82,Math.PI/2);spawnParkedCar(-210,140,0xb58a35,Math.PI/2);spawnParkedCar(210,-70,0x34664f,.02);spawnParkedCar(-140,-210,0x583e71,Math.PI/2);spawnParkedCar(70,210,0x9a4d37,.04);spawnParkedCar(-350,280,0x365b78,.02);spawnParkedCar(350,-280,0x8a4938,Math.PI/2);spawnParkedCar(280,350,0x4b674d,Math.PI/2);

const keys=new Set();let begun=false,inCar=false,yaw=0,pitch=.2,dist=7.5,vy=0,toastTime=0,jumpQueued=false;
let soundEnabled=true;
function tone(freq=440,duration=.12,type="sine",volume=.12){if(!audio.ctx||!soundEnabled)return;const o=audio.ctx.createOscillator(),g=audio.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.ctx.currentTime);g.gain.setValueAtTime(volume,audio.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.ctx.currentTime+duration);o.connect(g);g.connect(audio.master);o.start();o.stop(audio.ctx.currentTime+duration);}
function voiceLine(message){if(!soundEnabled||!("speechSynthesis"in window))return;const u=new SpeechSynthesisUtterance(message);u.lang="fa-IR";u.rate=.94;u.pitch=1;const voices=window.speechSynthesis.getVoices();const fa=voices.find(v=>v.lang?.toLowerCase().startsWith("fa"));if(!fa){toast("صدای فارسی روی این مرورگر نصب نیست؛ فایل ضبط‌شده اضافه کن");return;}u.voice=fa;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}
function setSound(on){soundEnabled=on;audio.setEnabled(on);$("#audioToggle").textContent=on?"🔊 صدا روشن":"🔇 صدا خاموش";$("#audioToggle").setAttribute("aria-pressed",String(on));}
function updateAudio(){const moving=keys.has("KeyW")||keys.has("KeyS")||keys.has("KeyA")||keys.has("KeyD");if(!inCar&&moving)audio.footstep(keys.has("ShiftLeft"));const throttle=(keys.has("KeyW")?1:(keys.has("KeyS")?-.45:0));audio.setEngine(inCar,throttle);}
const clamp=THREE.MathUtils.clamp,clock=new THREE.Clock(),move=new THREE.Vector3(),camPos=new THREE.Vector3();
function toast(t){$("#toast").textContent=t;$("#toast").style.opacity=1;toastTime=2}
function nearCar(){return player.position.distanceTo(car.position)<4.5}
function collidesAt(x,z){return buildingColliders.some(b=>x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ)}
function carCollidesAt(x,z){const radius=2.15;return buildingColliders.some(b=>x>b.minX-radius&&x<b.maxX+radius&&z>b.minZ-radius&&z<b.maxZ+radius)}
function toggleCar(){
 if(transitioning)return;
 if(!inCar&&nearCar()){
  transitioning=true;const hasEntry=character.triggerAction("enter");toast("در حال سوارشدن...");voiceLine("سوار خودرو شدم");
  setTimeout(()=>{inCar=true;player.visible=false;transitioning=false;toast("سوار خودرو شدی");tone(180,.18,"square",.08);$("#mode").textContent="رانندگی";},hasEntry?650:0);
 }else if(inCar){
  transitioning=true;inCar=false;player.position.copy(car.position).add(new THREE.Vector3(2.5,0,0));player.visible=true;const hasExit=character.triggerAction("exit");toast("در حال پیاده‌شدن...");voiceLine("از خودرو پیاده شدم");
  setTimeout(()=>{transitioning=false;toast("از خودرو پیاده شدی");tone(260,.12,"triangle",.08);$("#mode").textContent="پیاده";},hasExit?650:0);
 }
}
$("#helpToggle").addEventListener("click",()=>{const panel=$("#helpDialog"),open=panel.classList.toggle("hidden")===false;$("#helpToggle").setAttribute("aria-expanded",String(open));});$("#helpClose").addEventListener("click",()=>{$("#helpDialog").classList.add("hidden");$("#helpToggle").setAttribute("aria-expanded","false");});document.addEventListener("keydown",e=>{if(e.code==="Escape"&&!$("#helpDialog").classList.contains("hidden")){$("#helpDialog").classList.add("hidden");$("#helpToggle").setAttribute("aria-expanded","false");}});
$("#startBtn").onclick=()=>{begun=true;audio.init().catch(()=>toast("صدای مرورگر در دسترس نیست؛ تنظیمات صوتی مرورگر را بررسی کن"));$("#start").classList.add("hidden");$("#hud").classList.remove("hidden");$("#helpToggle").classList.remove("hidden");$("#audioToggle").classList.remove("hidden");$("#voicePanel").classList.remove("hidden");$("#modelPanel").classList.remove("hidden");renderer.domElement.requestPointerLock()};
renderer.domElement.onclick=()=>{if(begun&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock()};
document.addEventListener("mousemove",e=>{if(!begun||document.pointerLockElement!==renderer.domElement)return;yaw-=e.movementX*.0025;pitch=clamp(pitch-e.movementY*.0018,-.12,.85)});
document.addEventListener("keydown",e=>{keys.add(e.code);if(e.code==="Space"){e.preventDefault();if(!e.repeat)jumpQueued=true;}if(e.code==="KeyE"&&!e.repeat&&begun)toggleCar()});
document.addEventListener("keyup",e=>keys.delete(e.code));
window.addEventListener("blur",()=>keys.clear());
document.addEventListener("keydown",e=>{
 if(e.repeat||!begun||inCar)return;
 if(e.code==="KeyV"){sitting=!sitting;toast(sitting?"حالت نشستن فعال شد":"از حالت نشستن خارج شدی");}
 if(e.code==="KeyC"){crouching=!crouching;const ok=character.triggerAction("crouch");toast(crouching?(ok?"در حال خم‌شدن":"این مدل انیمیشن خم‌شدن ندارد"):"ایستاده");}
 if(e.code==="KeyF"){const ok=character.triggerAction("punch");if(ok)audio.action("punch");toast(ok?"انیمیشن مشت اجرا شد":"این مدل انیمیشن مشت ندارد");}
 if(e.code==="KeyR"){const ok=character.triggerAction("shoot");if(ok)audio.action("shoot");toast(ok?"آماده‌سازی/شلیک نمایشی":"کلیپ سلاح وجود ندارد؛ گیم‌پلی سلاح فعال نیست");}
 if(e.code==="KeyT"){toast(character.triggerAction("interact")?"فعالیت شخصیت اجرا شد":"این مدل انیمیشن فعالیت ندارد");}if(e.code==="KeyG"){const npc=pedestrians.map(p=>({p,d:p.root.position.distanceTo(player.position)})).filter(x=>x.d<4.2).sort((a,b)=>a.d-b.d)[0]?.p;if(npc){npc.talkUntil=clock.elapsedTime+2.2;voiceLine(npc.dialogue);toast(npc.dialogue);}else toast("برای گفتگو به یکی از عابران نزدیک شو");}
});
$("#sampleModelBtn").addEventListener("click",()=>{const status=$("#modelStatus");if(!character.userModel){status.textContent="هنوز مدل شخصی بارگذاری نشده است؛ ابتدا فایل GLB خودت را انتخاب کن.";toast("مدل شخصی برای فعال‌سازی وجود ندارد");return;}if(character.model!==character.userModel){if(character.model)character.root.remove(character.model);character.root.add(character.userModel);character.model=character.userModel;character.mixer=null;character.actions={};character.clips={};character.activeAction=null;character.boneBases.clear();character.model.traverse(o=>{if(o.isBone)character.boneBases.set(o,{x:o.rotation.x,y:o.rotation.y,z:o.rotation.z});});}character.procedural.visible=false;status.textContent="مدل شخصی خودت فعال است.";toast("مدل شخصی دوباره نمایش داده شد");});
$("#animationFile").addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;const status=$("#animationStatus");status.textContent="در حال خواندن فایل انیمیشن...";try{const names=await character.loadAnimationFile(file);status.textContent=names.length+" انیمیشن اضافه شد: "+names.join(", ");toast("انیمیشن‌ها به مدل فعلی اضافه شدند");}catch(err){status.textContent="بارگذاری انیمیشن ناموفق: "+err.message;toast("فایل انیمیشن سازگار نبود");}finally{e.target.value="";}});
$("#modelFile").addEventListener("change",async e=>{
 const file=e.target.files?.[0];if(!file)return;
 const status=$("#modelStatus");status.textContent="در حال بارگذاری مدل...";
 try{const names=await character.loadModelFile(file);status.textContent="مدل شخصی فعال شد · "+(names.length?names.length+" کلیپ داخلی: "+names.join(", "):"بدون کلیپ داخلی؛ حرکت پایه رویه‌ای فعال است");toast("مدل شخصی خودت نمایش داده شد");$("#animationStatus").textContent="اکنون می‌توانی فایل انیمیشن جداگانه سازگار بارگذاری کنی.";}
 catch(err){status.textContent="بارگذاری ناموفق: "+err.message;toast("بارگذاری مدل ناموفق بود");}
});
$("#audioToggle").addEventListener("click",()=>setSound(!soundEnabled));
document.querySelectorAll("[data-voice]").forEach(input=>input.addEventListener("change",async()=>{const file=input.files?.[0];if(!file)return;try{await audio.loadVoice(input.dataset.voice,file);toast("صدای کلید "+input.dataset.voice+" بارگذاری شد");}catch(err){toast("بارگذاری فایل صدا ناموفق بود");}}));
document.addEventListener("keydown",e=>{if(!e.repeat&&["Digit1","Digit2","Digit3","Digit4"].includes(e.code))audio.voice(e.code.slice(-1));});
renderer.domElement.addEventListener("wheel",e=>dist=clamp(dist+Math.sign(e.deltaY)*.8,3.2,14),{passive:true});
function update(dt){const windTime=clock.elapsedTime;for(const item of windObjects){item.object.rotation.z=Math.sin(windTime*.7+item.phase)*item.amount;item.object.rotation.x=Math.cos(windTime*.55+item.phase)*item.amount*.45;}for(const npc of pedestrians){npc.phase+=dt*npc.speed;const a=npc.phase*.2;npc.root.position.set(npc.origin.x+Math.cos(a)*npc.radius,0,npc.origin.z+Math.sin(a)*npc.radius);npc.root.rotation.y=-a+Math.PI/2;const swing=Math.sin(npc.phase*3)*.4;npc.legs[0].rotation.x=swing;npc.legs[1].rotation.x=-swing;npc.arms[0].rotation.x=-swing*.55;npc.arms[1].rotation.x=swing*.55;if(npc.talkUntil>windTime)npc.arms[1].rotation.x=-1.05+Math.sin(windTime*7)*.12;}if(inCar){const f=new THREE.Vector3(Math.sin(car.rotation.y),0,Math.cos(car.rotation.y)),t=(keys.has("KeyW")?1:0)-(keys.has("KeyS")?1:0),s=(keys.has("KeyD")?1:0)-(keys.has("KeyA")?1:0);car.rotation.y+=s*dt*(Math.abs(t)?1.5:.7);const nx=clamp(car.position.x+f.x*t*dt*15,-485,485),nz=clamp(car.position.z+f.z*t*dt*15,-485,485);if(!carCollidesAt(nx,nz))car.position.set(nx,0,nz);return}
const f=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),r=new THREE.Vector3(f.z,0,-f.x);move.set(0,0,0);if(keys.has("KeyW"))move.add(f);if(keys.has("KeyS"))move.sub(f);if(keys.has("KeyD"))move.add(r);if(keys.has("KeyA"))move.sub(r);
if(move.lengthSq()){move.normalize();const step=(crouching?2.2:(keys.has("ShiftLeft")?10:5.3))*dt, nx=player.position.x+move.x*step,nz=player.position.z+move.z*step;if(!collidesAt(nx,player.position.z))player.position.x=nx;if(!collidesAt(player.position.x,nz))player.position.z=nz;player.rotation.y=Math.atan2(move.x,move.z);}
if(jumpQueued&&player.position.y<=.001){vy=7;tone(330,.16,"sine",.09);}jumpQueued=false;vy-=19*dt;player.position.y=Math.max(0,player.position.y+vy*dt);if(!player.position.y)vy=0;player.position.x=clamp(player.position.x,-490,490);player.position.z=clamp(player.position.z,-490,490);if(move.lengthSq())sitting=false;character.update(dt,move.lengthSq()?(crouching?2.2:(keys.has("ShiftLeft")?10:5.3)):0,player.position.y>.02,crouching,sitting)}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);if(begun){update(dt);updateAudio();const target=inCar?car.position:player.position,h=inCar?1.4:1.55,hor=Math.cos(pitch)*dist;camPos.set(target.x-Math.sin(yaw)*hor,target.y+h+Math.sin(pitch)*dist+1,target.z-Math.cos(yaw)*hor);camera.position.lerp(camPos,1-Math.exp(-dt*8));camera.lookAt(target.x,target.y+h,target.z);const nearNpc=pedestrians.some(n=>n.root.position.distanceTo(player.position)<4.2);$("#prompt").textContent=nearCar()?"برای سوارشدن کلید E را بزن":nearNpc?"برای گفتگو با عابر کلید G را بزن":"WASD حرکت · Shift دویدن · G گفتگو";$("#prompt").classList.toggle("hidden",inCar);if(toastTime>0&&(toastTime-=dt)<=0)$("#toast").style.opacity=0}else{camera.position.set(22,19,28);camera.lookAt(0,0,0)}renderer.render(scene,camera)}
loop();addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6))});