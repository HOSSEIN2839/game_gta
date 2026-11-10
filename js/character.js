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
  this.overrideRemaining = 0; this.overrideName = null; this.model = null;
  const mat = c => new THREE.MeshStandardMaterial({color:c,roughness:.82});
  const skin=mat(0xb98262), shirt=mat(0x263f59), pants=mat(0x242a32), shoe=mat(0x17191c), hair=mat(0x25201d);
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.55,5,10),shirt); torso.position.y=1.35; this.procedural.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.245,20,16),skin); head.position.y=2.02; this.procedural.add(head);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.25,16,10,0,Math.PI*2,0,Math.PI*.48),hair); cap.position.y=2.09; this.procedural.add(cap);
  this.leftArm=this.limb(-.43,1.58,.105,.43,skin); this.rightArm=this.limb(.43,1.58,.105,.43,skin);
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
  const action=this.findAction(kind); if(!action || !this.mixer) return false;
  if(this.activeAction && this.activeAction!==action) this.activeAction.fadeOut(.1);
  action.reset().setLoop(THREE.LoopOnce,1); action.clampWhenFinished=true; action.fadeIn(.1).play();
  this.activeAction=action; this.overrideName=kind; this.overrideRemaining=Math.max(.35,action.getClip().duration);
  return true;
 }
 update(dt,speed=0,air=false,crouching=false) {
  if(this.mixer) {
   this.mixer.update(dt);
   if(this.overrideRemaining>0) {
    this.overrideRemaining-=dt;
    if(this.overrideRemaining<=0){if(this.activeAction)this.activeAction.fadeOut(.12);this.activeAction=null;this.overrideName=null;}
   }
   if(this.overrideRemaining<=0) this.playAction(air?"jump":crouching?"crouch":speed>7?"run":speed>.1?"walk":"idle");
   return;
  }
  this.phase+=dt*(speed>7?13:speed>.1?8:2);
  if(speed>.1){const swing=Math.sin(this.phase)*.62;this.leftLeg.rotation.x=swing;this.rightLeg.rotation.x=-swing;this.leftArm.rotation.x=-swing*.72;this.rightArm.rotation.x=swing*.72;}
  else {const idle=Math.sin(this.phase)*.025;this.leftArm.rotation.x=idle;this.rightArm.rotation.x=-idle;this.leftLeg.rotation.x=0;this.rightLeg.rotation.x=0;}
  if(air){this.leftLeg.rotation.x=-.35;this.rightLeg.rotation.x=.35;this.leftArm.rotation.x=-.8;this.rightArm.rotation.x=-.8;}
  if(crouching){this.root.position.y=Math.min(this.root.position.y,0);this.procedural.scale.y=.78;this.procedural.position.y=-.35;}else{this.procedural.scale.y=1;this.procedural.position.y=0;}
 }
}
