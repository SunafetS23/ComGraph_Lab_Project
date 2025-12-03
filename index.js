import * as THREE from "./threeJS/three.js-r145-compressed/build/three.module.js";
import { OrbitControls } from "./threeJS/three.js-r145-compressed/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "./threeJS/three.js-r145-compressed/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "./threeJS/three.js-r145-compressed/examples/jsm/geometries/TextGeometry.js";

var camera, scene, renderer, controls;
var FPcamera, darkWarrior;
var activeCamera;

let createAmbientLight =() =>{
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    return ambientLight;
}

let createSpotLight =() =>{
    const spotLight = new THREE.SpotLight(0xffffff, 1.2);
    spotLight.distance = 1000;
    return spotLight;
}

let createDirectionalLight =() =>{
    const directionalLight = new THREE.DirectionalLight(0xffffee, 0.5);
    directionalLight.position.set(5, 2, 8);
    return directionalLight;
}

let createGround =(width, height, depth) =>{
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./assets/textures/grass/rocky_terrain_02_diff_1k.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( width / 2, depth / 2 );

    const groundGeometry = new THREE.BoxGeometry(width, height, depth);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texture });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    
    return ground;    
}

let createSpellEffect =() =>{
    const spellGeometry = new THREE.PointLight(0xffd700, 2, 3);
    return spellGeometry;
}

let createTrunk =() =>{
    const loader = new THREE.TextureLoader();;
    const texture = loader.load('./assets/textures/tree/chinese_cedar_bark_diff_1k.jpg');
    const trunkGeometry = new THREE.CylinderGeometry(0.6, 0.6, 3);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texture });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    return trunk;
}

let createBotLeaves =() =>{
    const BotLeavesGeometry = new THREE.ConeGeometry(3, 4);
    const BotLeavesMaterial = new THREE.MeshStandardMaterial({ color: 0x347f2f });
    const BotLeaves = new THREE.Mesh(BotLeavesGeometry, BotLeavesMaterial);
    return BotLeaves;
}

let createTopLeaves =() =>{
    const TopLeavesGeometry = new THREE.ConeGeometry(2.1, 2.8);
    const TopLeavesMaterial = new THREE.MeshStandardMaterial({ color: 0x347f2f });
    const TopLeaves = new THREE.Mesh(TopLeavesGeometry, TopLeavesMaterial);
    return TopLeaves;
}

let createText = (scene) => {
    const loader = new FontLoader();

    // Ensure this path matches your folder structure exactly
    loader.load('./threeJS/three.js-r145-compressed/examples/fonts/helvetiker_bold.typeface.json', function (font) {
        const textGeometry = new TextGeometry('OVerlord', {
            font: font,
            size: 1,          
            height: 0.2,      
            depth: 1,
            
        });

        textGeometry.center();

        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
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
    
const init = () => {
    scene = new THREE.Scene();

    createSkyBox(scene);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(6, 3, 5);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
   
    let ground = createGround(25,2,25);
    ground.position.set(0,-1,0);

    let ambientLight = createAmbientLight();

    let spotLight = createSpotLight();
    spotLight.distance = 1000;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;

    let directionalLight = createDirectionalLight();
    directionalLight.position.set(5,2,8);

    let spell = createSpellEffect();
    spell.position.set(0,0.5,0);

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

    let objects = [
        ground,
        trunk1, trunk2, trunk3,
        BotLeaves1, BotLeaves2, BotLeaves3,
        TopLeaves1, TopLeaves2, TopLeaves3,
        spell, 
        spotLight, directionalLight
    ]

    objects.forEach(obj => {
        obj.castShadow = true;
        obj.receiveShadow = true;
        scene.add(obj);
    });

    scene.add(ambientLight);

};

const render = () => {
    
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    controls.update();
};

window.onload = () => {
    init();
    render();
};

window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};