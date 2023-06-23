import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 14);

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
scene.add(hemisphereLight);

var loader = new GLTFLoader();
var playerpaddle;
var cpupaddle;
var rightwall;
var leftwall;

var paddlespeed = 0.1;
var cpupaddleSpeed = 0.1;

var spherePosition = new THREE.Vector3(0, 0.415, 0);
var sphereDirection = new THREE.Vector3(Math.random() > 0.5 ? 1 : -1, 0, Math.random() > 0.5 ? 1 : -1);

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

loader.load('glasstable.gltf', function (gltf) {
    var object = gltf.scene;
    scene.add(gltf.scene);
    camera.lookAt(object.position);
}, undefined, function (error) {
    console.error(error);
});

loader.load('wall.gltf', function (gltf) {
    rightwall = gltf.scene;
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

loader.load('walll.gltf', function (gltf) {
    leftwall = gltf.scene;
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

loader.load('playerpaddle.gltf', function (gltf) {
    playerpaddle = gltf.scene;
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

loader.load('cpupaddle.gltf', function (gltf) {
    cpupaddle = gltf.scene;
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

var moveRight = false;
var moveLeft = false;

function onKeyDown(event) {
    if (event.key === 'ArrowRight' || event.key === 'd') {
        moveRight = true;
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        moveLeft = true;
    }
}

function onKeyUp(event) {
    if (event.key === 'ArrowRight' || event.key === 'd') {
        moveRight = false;
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        moveLeft = false;
    }
}

function updatePaddleMovement() {
    if (!playerpaddle)
    {
        return;
    }
    var nextPlayerPaddlePosition = playerpaddle.position.x;

    if (moveRight)
    {
        nextPlayerPaddlePosition += paddlespeed;
    }
    else if (moveLeft)
    {
        nextPlayerPaddlePosition -= paddlespeed;
    }

    if (nextPlayerPaddlePosition < 3.3 && nextPlayerPaddlePosition > -3.3)
    {
        playerpaddle.position.x = nextPlayerPaddlePosition;
    }
}

// Create a sphere geometry
var sphereGeometry = new THREE.SphereGeometry(0.25, 32, 32); // Adjust the radius and other parameters as needed

// Create a basic material for the sphere
var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xFFB727 }); // Adjust the color as needed

// Create a mesh using the sphere geometry and material
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0.415, 0); // Set the position of the sphere

// Add the sphere to the scene
scene.add(sphere);

var speed = 0.07;

function animate() {
    requestAnimationFrame(animate);

    // Update sphere position
    spherePosition.add(sphereDirection.clone().multiplyScalar(speed));
    
    // Check for collisions with player paddle
    if (playerpaddle) {
        var playerPaddleBox = new THREE.Box3().setFromObject(playerpaddle);
        if (playerPaddleBox.containsPoint(spherePosition)) {
            // Reflect sphere's direction
            sphereDirection.z *= -1;
            speed += 0.01;
        }
    }
    
    // Check for collisions with CPU paddle
    if (cpupaddle) {
        var cpuPaddleBox = new THREE.Box3().setFromObject(cpupaddle);
        if (cpuPaddleBox.containsPoint(spherePosition)) {
            // Reflect sphere's direction
            sphereDirection.z *= -1;
            speed += 0.01;
        }
    }
    
    // Check for collisions with walls
    var wallThreshold = 3.7;
    if (spherePosition.x >= wallThreshold || spherePosition.x <= -wallThreshold) {
        // Reflect sphere's direction
        sphereDirection.x *= -1;
    }
    
    // Check if sphere exceeds z-axis limits
    var zLimit = 8.6;
    if (spherePosition.z > zLimit || spherePosition.z < -zLimit) {
        // Reset sphere to starting position
        spherePosition.set(0, 0.415, 0);
        // Generate new random direction
        sphereDirection.set(Math.random() > 0.5 ? 1 : -1, 0, Math.random() > 0.5 ? 1 : -1);
        speed = 0.07;
    }

    // Update sphere position
    sphere.position.copy(spherePosition);

    // Update cpupaddle movement
    if (cpupaddle && spherePosition.z < cpupaddle.position.z) {
        var targetX = THREE.MathUtils.clamp(spherePosition.x, -3.3, 3.3);
        var diffX = targetX - cpupaddle.position.x;
        cpupaddle.position.x += Math.sign(diffX) * Math.min(Math.abs(diffX), cpupaddleSpeed);
    }

    updatePaddleMovement();
    renderer.render(scene, camera);
}
animate();
