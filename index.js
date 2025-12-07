import * as THREE from "./threeJS/three.js-r145-compressed/build/three.module.js";
import { OrbitControls } from "./threeJS/three.js-r145-compressed/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "./threeJS/three.js-r145-compressed/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "./threeJS/three.js-r145-compressed/examples/jsm/geometries/TextGeometry.js";
import {GLTFLoader} from "./threeJS/three.js-r145-compressed/examples/jsm/loaders/GLTFLoader.js"

var camera, scene, renderer, controls;
var FPcamera;
var darkWarrior = null; 
var spell; 
var spellGroup = null;   
var spellOn = false;  
var activeCamera;
var raycaster, pointer;

let createAmbientLight =() =>{
    const ambientLight = new THREE.AmbientLight("#FFFFFF", 0.7);
    return ambientLight;
}

let createSpotLight =() =>{
    const spotLight = new THREE.SpotLight("#FFFFFF", 1.2);
    spotLight.castShadow = true;
    return spotLight;
}

let createDirectionalLight =() =>{
    const directionalLight = new THREE.DirectionalLight("#FFFFEE", 0.5);
    directionalLight.position.set(5, 2, 8);
    return directionalLight;
}

let createGround =(width, height, depth) =>{
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./assets/textures/grass/rocky_terrain_02_diff_1k.jpg');

    const groundGeometry = new THREE.BoxGeometry(width, height, depth);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: "#FFFFFF", map: texture });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    
    return ground;    
}

let gltfLoader = new GLTFLoader();

function loadWarrior(){
    gltfLoader.load("./assets/models/momonga_ainz_ooal_gown/scene.gltf", 
        (gltf) =>{
             darkWarrior = gltf.scene;

        darkWarrior.traverse(o => {
            if(o.isMesh){
                o.castShadow = true;
                o.receiveShadow = true;
            }
    
        });

        darkWarrior.position.set(0, -0.01, 3);
        darkWarrior.scale.set(0.01, 0.01, 0.01);
        darkWarrior.rotation.set(0, Math.PI / 2, 0);

        createSpellCircle();

        if (spellGroup) {
                spellGroup.position.set(
                    darkWarrior.position.x,
                    0.02,
                    darkWarrior.position.z
                );
        }

        spell = createSpellEffect();

        spell.visible = spellOn;    
         scene.add(spell);       
    
        scene.add(darkWarrior);
        updateFPCamera();
        }
    )
}

function createSpellCircle(){
    let mat = new THREE.MeshPhongMaterial({
        color: 0xDAA520,
        emissive: 0xFFCC00,
        emissiveIntensity: 2,
        shininess: 100,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });

    spellGroup = new THREE.Group();

    // inner ring
    let inner = new THREE.Mesh(
        new THREE.RingGeometry(1, 1.2, 64),
        mat
    );
    inner.rotation.set(Math.PI/2, 0, 0);
    inner.position.set(0,0.02,0);
    spellGroup.add(inner);

    // outer ring
    let outer = new THREE.Mesh(
        new THREE.RingGeometry(1.8, 2, 64),
        mat
    );
    outer.rotation.set(Math.PI/2, 0, 0);
    outer.position.set(0,0.02,0);
    spellGroup.add(outer);

    // Pointer 1 & 2
    let boxGeometry = new THREE.BoxGeometry(0.05, 4, 0.01);

    let p1 = new THREE.Mesh(boxGeometry, mat);
    // rotation following result image 
    p1.rotation.set(0,0,Math.PI/2);
    // rotation if following assignment requirements:
    // p1.rotation.set(p1.rotation.set(0,0,Math.PI/2);
    p1.position.set(0,0.01,0);
    spellGroup.add(p1);

    let p2 = new THREE.Mesh(boxGeometry, mat);
    // rotation following result image 
    p2.rotation.set(Math.PI/2,0,0);
    // rotation if following assignment requirements:
    // p1.rotation.set(p1.rotation.set(0,0,Math.PI/2);
    p2.position.set(0,0.01,0);
    spellGroup.add(p2);

    spellGroup.visible = false;

    scene.add(spellGroup);
}


window.addEventListener("keydown", function(e){

    if(!darkWarrior) return;

    switch(e.key){
        //movement
        case "w":
            darkWarrior.position.z -= 0.1;
            break;
        case "s":
            darkWarrior.position.z += 0.1;
            break;
        case "a":
            darkWarrior.position.x -= 0.1;
            break;
        case "d":
            darkWarrior.position.x += 0.1;
            break;
        //rotation
        case "q":
            darkWarrior.rotation.y += 0.05;
            break;
        case "e":
            darkWarrior.rotation.y -= 0.05;
            break;
        //camera
        case "1":
            activeCamera = camera;
            break;
        case "2":
            if (FPcamera) {
                activeCamera = FPcamera;
            }
            break;
        // toggle spell
        case " ":
            spellOn = !spellOn;
            if(spellGroup) spellGroup.visible = spellOn;
            if(spell) spell.visible = spellOn;
            break;

    }
    updateFPCamera();
});


let createSpellEffect =() =>{
    const spellGeometry = new THREE.PointLight("#FFD700", 2, 3);
    return spellGeometry;
}

let createTrunk =() =>{
    const loader = new THREE.TextureLoader();;
    const texture = loader.load('./assets/textures/tree/chinese_cedar_bark_diff_1k.jpg');
    const trunkGeometry = new THREE.CylinderGeometry(0.6, 0.6, 3);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: "#FFFFFF", map: texture });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    return trunk;
}

let createBotLeaves =() =>{
    const BotLeavesGeometry = new THREE.ConeGeometry(3, 4);
    const BotLeavesMaterial = new THREE.MeshStandardMaterial({ color: "#374f2f" });
    const BotLeaves = new THREE.Mesh(BotLeavesGeometry, BotLeavesMaterial);
    return BotLeaves;
}

let createTopLeaves =() =>{
    const TopLeavesGeometry = new THREE.ConeGeometry(2.1, 2.8);
    const TopLeavesMaterial = new THREE.MeshStandardMaterial({ color: "#374f2f" });
    const TopLeaves = new THREE.Mesh(TopLeavesGeometry, TopLeavesMaterial);
    return TopLeaves;
}

let createText = (scene) => {
    const loader = new FontLoader();

    loader.load('./threeJS/three.js-r145-compressed/examples/fonts/helvetiker_bold.typeface.json', function (font) {
        const textGeometry = new TextGeometry('OVerlord', {
            font: font,
            size: 1,          
            height: 0.2,      
            depth: 1,
            
        });

        textGeometry.center();

        const textMaterial = new THREE.MeshStandardMaterial({ color: "#FFFFFF" });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        textMesh.position.set(-6, 4, 5);
        textMesh.rotation.set(0, Math.PI / 2, 0);
        
        textMesh.castShadow = true;
        textMesh.receiveShadow = true;

        scene.add(textMesh);
    });
}

let createSkyBox = (scene) => {
    const loader = new THREE.TextureLoader();
    
    const loadSide = (url) => {
        const tex = loader.load(url);
        tex.minFilter = THREE.LinearFilter;
        return tex;
    };

    const materialArray = [
        new THREE.MeshBasicMaterial({ map: loadSide('./assets/skybox/side-1.png'), side: THREE.BackSide }), // Right
        new THREE.MeshBasicMaterial({ map: loadSide('./assets/skybox/side-3.png'), side: THREE.BackSide }), // Left
        new THREE.MeshBasicMaterial({ map: loadSide('./assets/skybox/top.png'), side: THREE.BackSide }),    // Top
        new THREE.MeshBasicMaterial({ map: loadSide('./assets/skybox/bottom.png'), side: THREE.BackSide }), // Bottom
        new THREE.MeshBasicMaterial({ map: loadSide('./assets/skybox/side-2.png'), side: THREE.BackSide }), // Front
        new THREE.MeshBasicMaterial({ map: loadSide('./assets/skybox/side-4.png'), side: THREE.BackSide }), // Back
    ];

    const skyboxGeo = new THREE.BoxGeometry(1200, 1200, 1200);
    const skybox = new THREE.Mesh(skyboxGeo, materialArray);
    
    scene.add(skybox);
}

let createBody = (width, height, depth, color) => {
    const loader = new THREE.TextureLoader();

    const geo = new THREE.BoxGeometry(width, height, depth);
    // const material = new THREE.MeshPhongMaterial( {color: color} );

    const material = [
    new THREE.MeshPhongMaterial({ map: loader.load("./assets/textures/hamsuke/side.png"), color: color }),
    new THREE.MeshPhongMaterial({ map: loader.load("./assets/textures/hamsuke/side.png"), color: color }),
    new THREE.MeshPhongMaterial({ map: loader.load("./assets/textures/hamsuke/top&back.png"), color: color }),
    new THREE.MeshPhongMaterial({ map: loader.load("./assets/textures/hamsuke/top&back.png"), color: color }),
    new THREE.MeshPhongMaterial({ map: loader.load("./assets/textures/hamsuke/front_happy.png"), color: color }),
    new THREE.MeshPhongMaterial({ map: loader.load("./assets/textures/hamsuke/top&back.png"), color: color })
];
    
    const box = new THREE.Mesh(geo, material);
    box.castShadow = true;
    box.receiveShadow = true;

    box.name = "hamster";

    return box;
}

let createTail = (w, h, d, color) => {
    const geo = new THREE.BoxGeometry(w, h, d)
    const material = new THREE.MeshPhongMaterial( {color: color})
    const box = new THREE.Mesh(geo, material);
    box.castShadow = true;
    box.receiveShadow = true;

    return box;
}

let createCone = (radius, height, radSeg, color) => {
    const geo = new THREE.ConeGeometry(radius, height, radSeg);
    const material = new THREE.MeshPhongMaterial( {color: color} );
    const cone = new THREE.Mesh(geo, material);

    cone.castShadow = true;
    cone.receiveShadow = true;

    return cone;
}

function updateFPCamera() {
    if (!darkWarrior || !FPcamera) return;

    const offset = new THREE.Vector3(0, 1.8, 0);
    const lookOffset = new THREE.Vector3(1, 1.8, 0);
    offset.applyQuaternion(darkWarrior.quaternion);
    lookOffset.applyQuaternion(darkWarrior.quaternion);

    FPcamera.position.copy(darkWarrior.position).add(offset);

    const target = new THREE.Vector3().copy(darkWarrior.position).add(lookOffset);
    FPcamera.lookAt(target);
}

    
const init = () => {
    scene = new THREE.Scene();

    createSkyBox(scene);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(6, 3, 5);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    FPcamera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    FPcamera.position.set(0, 1.8, 0);
    FPcamera.lookAt(1, 1.8, 0);
    scene.add(FPcamera);

    activeCamera = camera;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
   
    let ground = createGround(25,2,25);
    ground.position.set(0,-1,0);

    let ambientLight = createAmbientLight();

    let spotLight = createSpotLight();
    spotLight.position.set(0, 10, 0); 
    spotLight.distance = 1000;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;

    let directionalLight = createDirectionalLight();
    directionalLight.position.set(5,2,8);

    let trunk1 = createTrunk();
    trunk1.position.set(-5, 1.5, -5);
    let trunk2 = createTrunk();
    trunk2.position.set(7, 1.5, -6);
    let trunk3 = createTrunk();
    trunk3.position.set(-8,1.5,8);

    let BotLeaves1 = createBotLeaves();
    BotLeaves1.position.set(-5,4,-5);
    let BotLeaves2 = createBotLeaves();
    BotLeaves2.position.set(7,4,-6);
    let BotLeaves3 = createBotLeaves();
    BotLeaves3.position.set(-8,4,8);

    let TopLeaves1 = createTopLeaves();
    TopLeaves1.position.set(-5,6,-5);
    let TopLeaves2 = createTopLeaves();
    TopLeaves2.position.set(7,6,-6);
    let TopLeaves3 = createTopLeaves();
    TopLeaves3.position.set(-8,6,8);

    createText(scene);

    let hamsterBody = createBody(2, 2, 2, "#FFFFFF");
    hamsterBody.position.set(3, 1, -1);
    hamsterBody.rotation.set(0, Math.PI/8, 0);

    let hamsterTail = new THREE.Group();

    let hamsterTailMain = createTail(0.6, 2.8, 0.6, "#023020");
    hamsterTailMain.position.set(2.6, 1.4, -2.25);
    hamsterTailMain.rotation.set(0, Math.PI/8, 0)
    hamsterTail.add(hamsterTailMain);

    let hamsterTailExt = createTail(0.6, 0.6, 1.4, "#023020");
    hamsterTailExt.position.set(2.44, 2.8, -2.62);
    hamsterTailExt.rotation.set(0, Math.PI/8, Math.PI/2);
    hamsterTail.add(hamsterTailExt);

    let hamsterEar = new THREE.Group();

    let leftEar = createCone(0.2, 0.7, 128, "#023020"); // colour = #6B6860
    leftEar.position.set(4.05, 2.2, -0.6);
    leftEar.rotation.set(0, 0, -Math.PI/8);
    hamsterEar.add(leftEar);

    let rightEar = createCone(0.2, 0.7, 128, "#6B6860")
    rightEar.position.set(2.5, 2.2, 0)
    // rightEar.rotation.set(0, 0, Math.PI/8)      <-- di word pake rotation ini
    rightEar.rotation.set(0, 0, Math.PI/8)   // but this is the right rotation?
    hamsterEar.add(rightEar);

    let objects = [
        ground,
        trunk1, trunk2, trunk3,
        BotLeaves1, BotLeaves2, BotLeaves3,
        TopLeaves1, TopLeaves2, TopLeaves3, 
        spotLight, directionalLight,
        hamsterBody, hamsterTail, hamsterEar
    ]

    objects.forEach(obj => {
        obj.castShadow = true;
        obj.receiveShadow = true;
        scene.add(obj);
    });

    scene.add(ambientLight);
    loadWarrior();

};

const render = () => {
    if (darkWarrior && spellGroup) {
        spellGroup.position.set(
            darkWarrior.position.x,
            0.02,                     
            darkWarrior.position.z
        );
    }

    if (darkWarrior && spell) {
        spell.position.set(
            darkWarrior.position.x,
            0.5,                      
            darkWarrior.position.z
        );
    }

    renderer.render(scene, activeCamera || camera);
    requestAnimationFrame(render);
    controls.update();
};


function onMouseClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, activeCamera || camera);
    let intersects = raycaster.intersectObjects(scene.children, true);

    for (let i = 0; i<intersects.length; i++) {
        if (intersects[i].object.name == "hamster") 
        {
            const mesh = intersects[i].object;
            const loader = new THREE.TextureLoader();

            if(mesh.userData.isSad) 
            {
                mesh.material[4].map = loader.load("./assets/textures/hamsuke/front_happy.png");
                mesh.userData.isSad = false
            } 
            else 
            {
                mesh.material[4].map = loader.load("./assets/textures/hamsuke/front_sad.png");
                mesh.userData.isSad = true;
            }

            mesh.material[4].needsUpdate = true;
        }
    }
}

window.onload = () => {
    init();
    render();
};

window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    if (FPcamera) {
        FPcamera.aspect = window.innerWidth / window.innerHeight;
        FPcamera.updateProjectionMatrix();
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener('click', onMouseClick);
