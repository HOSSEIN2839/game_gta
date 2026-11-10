import * as THREE from "three";
export class PlayerCharacter {
 constructor(scene){this.root=new THREE.Group();scene.add(this.root);const m=c=>new THREE.MeshStandardMaterial({color:c,roughness:.82});const skin=m(0xb98262),shirt=m(0x263f59),pants=m(0x242a32),shoe=m(0x17191c),hair=m(0x25201d);
 const capsule=(r,l,mat)=>new THREE.Mesh(new THREE.CapsuleGeometry(r,l,5,10),mat);
 const torso=capsule(.34,.55,shirt);torso.position.y=1.35;this.root.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.245,20,16),skin);head.position.y=2.02;this.root.add(head);
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.25,16,10,0,Math.PI*2,0,Math.PI*.48),hair);cap.position.y=2.09;this.root.add(cap);
 this.leftArm=this.limb(-.43,1.58,.105,.43,skin);this.rightArm=this.limb(.43,1.58,.105,.43,skin);this.leftLeg=this.limb(-.17,.72,.14,.53,pants);this.rightLeg=this.limb(.17,.72,.14,.53,pants);
 const boot=new THREE.Mesh(new THREE.BoxGeometry(.2,.11,.34),shoe);boot.position.set(-.17,.09,.07);this.root.add(boot);const boot2=boot.clone();boot2.position.x=.17;this.root.add(boot2);this.root.position.set(0,0,8);this.phase=0;}
 limb(x,y,r,l,mat){const p=new THREE.Group();p.position.set(x,y,0);this.root.add(p);const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(r,l,5,10),mat);mesh.position.y=-l*.43;p.add(mesh);return p;}
 update(dt,speed=0,air=false){this.phase+=dt*(speed>7?13: speed>.1?8:2);if(speed>.1){const s=Math.sin(this.phase)*.62;this.leftLeg.rotation.x=s;this.rightLeg.rotation.x=-s;this.leftArm.rotation.x=-s*.72;this.rightArm.rotation.x=s*.72;}else{const idle=Math.sin(this.phase)*.025;this.leftArm.rotation.x=idle;this.rightArm.rotation.x=-idle;this.leftLeg.rotation.x=0;this.rightLeg.rotation.x=0;}if(air){this.leftLeg.rotation.x=-.35;this.rightLeg.rotation.x=.35;this.leftArm.rotation.x=-.8;this.rightArm.rotation.x=-.8;}}
}