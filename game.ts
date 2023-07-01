import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
scene.add(hemisphereLight);

const loader = new GLTFLoader();
let playerpaddle: THREE.Object3D | undefined;
let cpupaddle: THREE.Object3D | undefined;
let rightwall: THREE.Object3D | undefined;
let leftwall: THREE.Object3D | undefined;

const paddlespeed = 0.1;
const cpupaddleSpeed = 0.1;

const spherePosition = new THREE.Vector3(0, 0.415, 0);
const sphereDirection = new THREE.Vector3(Math.random() > 0.5 ? 1 : -1, 0, Math.random() > 0.5 ? 1 : -1);

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

loader.load('glasstable.gltf', function (gltf) {
  const object = gltf.scene;
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

let moveRight = false;
let moveLeft = false;

let playerScore = 0;
let cpuScore = 0;
let gameOver = false;

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight' || event.key === 'd') {
    moveRight = true;
  } else if (event.key === 'ArrowLeft' || event.key === 'a') {
    moveLeft = true;
  }
}

function onKeyUp(event: KeyboardEvent) {
  if (event.key === 'ArrowRight' || event.key === 'd') {
    moveRight = false;
  } else if (event.key === 'ArrowLeft' || event.key === 'a') {
    moveLeft = false;
  }
}

function updatePaddleMovement() {
  if (!playerpaddle) {
    return;
  }
  let nextPlayerPaddlePosition = playerpaddle.position.x;

  if (moveRight) {
    nextPlayerPaddlePosition += paddlespeed;
  } else if (moveLeft) {
    nextPlayerPaddlePosition -= paddlespeed;
  }

  if (nextPlayerPaddlePosition < 3.3 && nextPlayerPaddlePosition > -3.3) {
    playerpaddle.position.x = nextPlayerPaddlePosition;
  }
}

// Create a sphere geometry
const sphereGeometry = new THREE.SphereGeometry(0.25, 32, 32); // Adjust the radius and other parameters as needed

// Create a basic material for the sphere
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xFFB727 }); // Adjust the color as needed

// Create a mesh using the sphere geometry and material
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0.415, 0); // Set the position of the sphere

// Add the sphere to the scene
scene.add(sphere);

let speed = 0.07;

function checkScore() {
  if (playerScore >= 1) {
    gameOver = true;
    displayResult('win.png');
  } else if (cpuScore >= 1) {
    gameOver = true;
    displayResult('lose.png');
  }
}

// function displayResult(winner: string) {
//   const resultElement = document.createElement('div');
//   resultElement.classList.add('result');

//   const imageElement = document.createElement('img');
//   imageElement.src = winner;
//   imageElement.style.width = '350px'; // Adjust the width as needed
//   imageElement.style.height = '350px'; // Adjust the height as needed


//   resultElement.appendChild(imageElement);
//   document.body.appendChild(resultElement);

//   resultElement.style.position = 'absolute';
//   resultElement.style.top = '50%';
//   resultElement.style.left = '50%';
//   resultElement.style.transform = 'translate(-50%, -50%)';
//   resultElement.style.zIndex = '9999';
// }


function displayResult(winner: string) {
  const resultElement = document.createElement('div');
  resultElement.classList.add('result');

  const imageElement = document.createElement('img');
  imageElement.src = winner;
  imageElement.style.width = '350px'; // Adjust the width as needed
  imageElement.style.height = '350px'; // Adjust the height as needed
  resultElement.appendChild(imageElement);

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');

  const playAgainButton = document.createElement('button');
  playAgainButton.textContent = 'PLAY AGAIN';
  playAgainButton.addEventListener('click', playAgain);
  buttonContainer.appendChild(playAgainButton);

  const homeButton = document.createElement('button');
  homeButton.textContent = 'BACK TO HOME PAGE';
  homeButton.addEventListener('click', backToHomePage);
  buttonContainer.appendChild(homeButton);

  resultElement.appendChild(buttonContainer);

  document.body.appendChild(resultElement);

  resultElement.style.position = 'absolute';
  resultElement.style.top = '50%';
  resultElement.style.left = '50%';
  resultElement.style.transform = 'translate(-50%, -50%)';
  resultElement.style.zIndex = '9999';

  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.marginTop = '20px';
}


function playAgain() {
  // Reset game state and remove result element
  playerScore = 0;
  cpuScore = 0;
  gameOver = false;
  const resultElement = document.querySelector('.result');
  if (resultElement) {
    resultElement.remove();
  }

  // Reset paddle positions
  if (playerpaddle) {
    playerpaddle.position.x = 0;
  }
  if (cpupaddle) {
    cpupaddle.position.x = 0;
  }
  
  animate(); // Restart the game
}

function backToHomePage() {
  // Redirect to home page
  window.location.href = 'index.html';
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

function animate() {
  // renderer.setSize(window.innerWidth, window.innerHeight);
  if (!gameOver) {
    requestAnimationFrame(animate);

    // Update sphere position
    spherePosition.add(sphereDirection.clone().multiplyScalar(speed));

    // Check for collisions with player paddle
    if (playerpaddle) {
      const playerPaddleBox = new THREE.Box3().setFromObject(playerpaddle);
      if (playerPaddleBox.containsPoint(spherePosition)) {
        // Reflect sphere's direction
        sphereDirection.z *= -1;
        speed += 0.01;
      }
    }

    // Check for collisions with CPU paddle
    if (cpupaddle) {
      const cpuPaddleBox = new THREE.Box3().setFromObject(cpupaddle);
      if (cpuPaddleBox.containsPoint(spherePosition)) {
        // Reflect sphere's direction
        sphereDirection.z *= -1;
        speed += 0.01;
      }
    }

    // Check for collisions with walls
    const wallThreshold = 3.7;
    if (spherePosition.x >= wallThreshold || spherePosition.x <= -wallThreshold) {
      // Reflect sphere's direction
      sphereDirection.x *= -1;
    }

    // Check if sphere exceeds z-axis limits
    const zLimit = 8.6;
    if (spherePosition.z > zLimit || spherePosition.z < -zLimit) {
      if (spherePosition.z > zLimit) {
        cpuScore++;
      } else {
        playerScore++;
      }
      checkScore();

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
      const targetX = THREE.MathUtils.clamp(spherePosition.x, -3.3, 3.3);
      const diffX = targetX - cpupaddle.position.x;
      cpupaddle.position.x += Math.sign(diffX) * Math.min(Math.abs(diffX), cpupaddleSpeed);
    }

    updatePaddleMovement();
    renderer.render(scene, camera);
  }
}

animate();
