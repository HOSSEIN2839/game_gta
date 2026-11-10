import * as THREE from "three";
// Lightweight shared fallback clips generated against each uploaded rig's own bone hierarchy.
// These are procedural keyframed clips, not motion-capture or AAA asset files.
const groups={hips:/hips|pelvis|root/i,leftLeg:/left.*(upleg|thigh|leg)|thigh.*left|leg_l/i,rightLeg:/right.*(upleg|thigh|leg)|thigh.*right|leg_r/i,leftArm:/left.*(arm|shoulder)|arm_l/i,rightArm:/right.*(arm|shoulder)|arm_r/i,spine:/spine|chest|torso/i,head:/head|neck/i};
const poses={
 idle:[true,2,[0,.5,1],{hips:.015,spine:.012,leftArm:.025,rightArm:-.025}],
 walk:[true,.9,[0,.225,.45,.675,.9],{leftLeg:.62,rightLeg:-.62,leftArm:-.4,rightArm:.4,hips:.035}],
 run:[true,.62,[0,.155,.31,.465,.62],{leftLeg:.92,rightLeg:-.92,leftArm:-.72,rightArm:.72,spine:-.12}],
 jump:[false,.8,[0,.2,.56,.8],{leftLeg:-.35,rightLeg:.35,leftArm:-.7,rightArm:-.7,spine:-.08}],
 crouch:[true,1,[0,.5,1],{leftLeg:-.48,rightLeg:-.48,hips:-.16,spine:.12}],
 punch:[false,.72,[0,.18,.42,.72],{rightArm:-1.45,leftArm:.22,spine:-.16,hips:-.12}],
 shoot:[false,.65,[0,.16,.4,.65],{rightArm:-.55,leftArm:-.48,spine:-.08}],
 sit:[true,1.2,[0,.4,1.2],{leftLeg:-1.15,rightLeg:-1.15,hips:-.55,spine:.08}],
 hit:[false,.48,[0,.12,.3,.48],{spine:-.3,head:.16,leftArm:-.35,rightArm:-.35}],
 death:[false,1.5,[0,.45,1.5],{spine:-1.15,hips:-.8,leftArm:-.9,rightArm:-.9,leftLeg:-.45,rightLeg:-.45}],
 interact:[false,1,[0,.25,.65,1],{rightArm:-1.1,head:-.12}],
 enter:[false,.9,[0,.3,.65,.9],{leftLeg:-.55,rightLeg:-.8,hips:-.35,rightArm:-.6}],
 exit:[false,.8,[0,.25,.55,.8],{leftLeg:-.45,rightLeg:-.6,hips:-.25,rightArm:-.45}]
};
export function createUniversalAnimationClips(model){
 const bones=[];model.traverse(n=>{if(n.isBone)bones.push(n);});if(!bones.length)return[];
 return Object.entries(poses).map(([name,[loop,duration,times,pose]])=>{
  const tracks=[];
  for(const bone of bones){const group=Object.keys(groups).find(k=>groups[k].test(bone.name));if(!group||pose[group]===undefined)continue;
   const base=bone.quaternion.clone(),values=[];
   for(const t of times){const wave=loop?Math.sin(t/duration*Math.PI*2):Math.sin(t/duration*Math.PI);const q=base.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pose[group]*wave,0,0)));values.push(q.x,q.y,q.z,q.w);}
   tracks.push(new THREE.QuaternionKeyframeTrack(bone.uuid+".quaternion",times,values));
  }
  return tracks.length?new THREE.AnimationClip("universal_"+name,duration,tracks):null;
 }).filter(Boolean);
}
