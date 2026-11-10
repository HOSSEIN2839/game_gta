import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const CLIP_MATCH = {
 idle: /idle|stand|breath/,
 walk: /walk|walking|jog/,
 run: /run|sprint|fast/,
 jump: /jump|fall|land/,
 crouch: /crouch|sneak|stealth/,
 punch: /punch|melee|unarmed|fight|attack/,
 shoot: /shoot|fire|pistol|rifle|gun/,
 enter: /enter.?vehicle|enter.?car|vehicle.?enter|car.?enter/,
 exit: /exit.?vehicle|exit.?car|vehicle.?exit|car.?exit/,
 interact: /wave|talk|interact|phone|sit|emote/
};

export class PlayerCharacter {
 constructor(scene) {
  this.root = new THREE.Group(); scene.add(this.root);
  this.procedural = new THREE.Group(); this.root.add(this.procedural);
  this.mixer = null; this.actions = {}; this.clips = {}; this.activeAction = null;
  this.overrideRemaining = 0; this.overrideName = null; this.model = null; this.proceduralAction = null; this.proceduralActionTime = 0;
  const mat = c => new THREE.MeshStandardMaterial({color:c,roughness:.82});
  const skin=mat(0xb98262), shirt=mat(0x263f59), pants=mat(0x242a32), shoe=mat(0x17191c), hair=mat(0x25201d);
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.55,7,14),shirt); torso.position.y=1.35; this.procedural.add(torso);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.105,.13,.2,12),skin);neck.position.y=1.78;this.procedural.add(neck);
  const belt=new THREE.Mesh(new THREE.BoxGeometry(.62,.1,.34),shoe);belt.position.set(0,1.02,0);this.procedural.add(belt);
  for(const x of [-.18,.18]){const pocket=new THREE.Mesh(new THREE.BoxGeometry(.18,.2,.035),pants);pocket.position.set(x,1.28,.31);this.procedural.add(pocket);}
  const eyeMat=new THREE.MeshStandardMaterial({color:0x17191c,roughness:.5});for(const x of [-.09,.09]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.025,8,8),eyeMat);eye.position.set(x,2.04,.22);this.procedural.add(eye);}
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.045,.12,8),skin);nose.rotation.x=Math.PI/2;nose.position.set(0,1.98,.255);this.procedural.add(nose);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.245,20,16),skin); head.position.y=2.02; this.procedural.add(head);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.25,16,10,0,Math.PI*2,0,Math.PI*.48),hair); cap.position.y=2.09; this.procedural.add(cap);
  this.leftArm=this.limb(-.43,1.58,.105,.43,skin); this.rightArm=this.limb(.43,1.58,.105,.43,skin);
  const gloveMat=mat(0x20252b);for(const arm of [this.leftArm,this.rightArm]){const glove=new THREE.Mesh(new THREE.SphereGeometry(.115,10,8),gloveMat);glove.position.y=-.45;arm.add(glove);}
  this.weapon=new THREE.Group();this.weapon.visible=false;this.weapon.position.set(.48,1.3,.28);this.root.add(this.weapon);
  const gunMat=new THREE.MeshStandardMaterial({color:0x252a2e,metalness:.75,roughness:.3});
  const slide=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.38),gunMat);slide.position.z=.13;this.weapon.add(slide);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.1,.2,.12),gunMat);grip.position.set(0,-.14,.02);grip.rotation.x=-.18;this.weapon.add(grip);
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.16,8),gunMat);barrel.rotation.x=Math.PI/2;barrel.position.z=.38;this.weapon.add(barrel);
  this.leftLeg=this.limb(-.17,.72,.14,.53,pants); this.rightLeg=this.limb(.17,.72,.14,.53,pants);
  const boot=new THREE.Mesh(new THREE.BoxGeometry(.2,.11,.34),shoe); boot.position.set(-.17,.09,.07); this.procedural.add(boot);
  const boot2=boot.clone(); boot2.position.x=.17; this.procedural.add(boot2);
  this.root.position.set(0,0,8); this.phase=0;
 }
 limb(x,y,r,l,material) {
  const pivot=new THREE.Group(); pivot.position.set(x,y,0); this.procedural.add(pivot);
  const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(r,l,5,10),material); mesh.position.y=-l*.43; pivot.add(mesh);
  return pivot;
 }
 async loadModelFile(file) {
  if(!file || !/\.glb$/i.test(file.name)) throw new Error("Please choose a binary .glb file.");
  const loader=new GLTFLoader();
  const data=await file.arrayBuffer();
  const gltf=await new Promise((resolve,reject)=>loader.parse(data,"",resolve,reject));
  return this.installGLTF(gltf);
 }
 async loadModel(url) {
  const gltf=await new GLTFLoader().loadAsync(url);
  return this.installGLTF(gltf);
 }
 installGLTF(gltf) {
  const model=gltf.scene;
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model);
  const size=bounds.getSize(new THREE.Vector3());
  if(!Number.isFinite(size.y) || size.y<.05) throw new Error("The GLB has no valid visible character mesh.");
  const scale=2.15/size.y;
  model.scale.setScalar(scale);
  model.position.y=-bounds.min.y*scale;
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  if(this.model) this.root.remove(this.model);
  this.procedural.visible=false;
  this.root.add(model); this.model=model;
  if(this.mixer) this.mixer.stopAllAction();
  this.mixer=null; this.actions={}; this.clips={}; this.activeAction=null;
  if(gltf.animations?.length) {
   this.mixer=new THREE.AnimationMixer(model);
   for(const clip of gltf.animations) {
    const key=clip.name.toLowerCase();
    this.clips[key]=clip; this.actions[key]=this.mixer.clipAction(clip);
   }
   this.playAction("idle");
  }
  return Object.keys(this.clips);
 }
 findAction(kind) {
  const pattern=CLIP_MATCH[kind]; if(!pattern) return null;
  const key=Object.keys(this.actions).find(name=>pattern.test(name));
  return key ? this.actions[key] : null;
 }
 playAction(kind) {
  if(!this.mixer) return false;
  let action=this.findAction(kind);
  if(!action && kind==="run") action=this.findAction("walk");
  if(!action && kind==="walk") action=this.findAction("idle");
  if(!action) return false;
  if(action===this.activeAction && action.isRunning()) return true;
  action.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.18).play();
  if(this.activeAction) this.activeAction.fadeOut(.18);
  this.activeAction=action; this.overrideName=null; this.overrideRemaining=0;
  return true;
 }
 triggerAction(kind) {
  const action=this.findAction(kind);
  if(!action || !this.mixer){this.proceduralAction=kind;this.proceduralActionTime=kind==="shoot"?.65:.72;this.weapon.visible=kind==="shoot";return true;}
  if(this.activeAction && this.activeAction!==action) this.activeAction.fadeOut(.1);
  action.reset().setLoop(THREE.LoopOnce,1); action.clampWhenFinished=true; action.fadeIn(.1).play();
  this.activeAction=action; this.overrideName=kind; this.overrideRemaining=Math.max(.35,action.getClip().duration);
  return true;
 }
 update(dt,speed=0,air=false,crouching=false) {
  if(this.mixer) {
   this.mixer.update(dt);
   if(this.proceduralActionTime>0){this.proceduralActionTime-=dt;if(this.model){this.model.rotation.x=this.proceduralAction==="shoot"?-.035:this.proceduralAction==="punch"?-.02:0;}if(this.proceduralActionTime<=0){this.proceduralAction=null;this.weapon.visible=false;if(this.model)this.model.rotation.x=0;}}
   if(this.overrideRemaining>0) {
    this.overrideRemaining-=dt;
    if(this.overrideRemaining<=0){if(this.activeAction)this.activeAction.fadeOut(.12);this.activeAction=null;this.overrideName=null;}
   }
   if(this.overrideRemaining<=0) this.playAction(air?"jump":crouching?"crouch":speed>7?"run":speed>.1?"walk":"idle");
   return;
  }
  this.phase+=dt*(speed>7?13:speed>.1?8:2);
  if(this.proceduralActionTime>0){this.proceduralActionTime-=dt;const p=Math.max(0,this.proceduralActionTime);if(this.proceduralAction==="punch"){this.rightArm.rotation.x=-Math.sin((.72-p)*Math.PI/.72)*1.8;this.leftArm.rotation.x=.2;}else if(this.proceduralAction==="shoot"){this.rightArm.rotation.x=-.55;this.leftArm.rotation.x=-.25;}else if(this.proceduralAction==="interact"){this.rightArm.rotation.x=-1.2;}else if(this.proceduralAction==="enter"||this.proceduralAction==="exit"){this.rightArm.rotation.x=-.7;}if(this.proceduralActionTime<=0){this.proceduralAction=null;this.weapon.visible=false;this.rightArm.rotation.x=0;this.leftArm.rotation.x=0;}}
  else if(this.proceduralAction){this.proceduralAction=null;this.weapon.visible=false;}
  if(speed>.1){const swing=Math.sin(this.phase)*.62;this.leftLeg.rotation.x=swing;this.rightLeg.rotation.x=-swing;this.leftArm.rotation.x=-swing*.72;this.rightArm.rotation.x=swing*.72;}
  else {const idle=Math.sin(this.phase)*.025;this.leftArm.rotation.x=idle;this.rightArm.rotation.x=-idle;this.leftLeg.rotation.x=0;this.rightLeg.rotation.x=0;}
  if(air){this.leftLeg.rotation.x=-.35;this.rightLeg.rotation.x=.35;this.leftArm.rotation.x=-.8;this.rightArm.rotation.x=-.8;}
  if(crouching){this.procedural.scale.y=.78;this.procedural.position.y=-.35;}else{this.procedural.scale.y=1;this.procedural.position.y=0;}
 }
}
