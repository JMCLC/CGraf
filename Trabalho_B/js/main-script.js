//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera,cameraFront, cameraSide, cameraTop, cameraOrtho, cameraPerspective;
var scene, renderer;
var activeCamera;

var geometry, mesh;
var projectMeshes = [];

var robot, trailer;
var maxRobotVec, minRobotVec;
var maxTrailerVec, minTrailerVec;
var collision = false;

var chest, head, rightMember, leftMember, legs, feet;
var speed = 10;

var controls, stats;

var helper;

var clock, delta;

var animationFlags = new Map([
    ["Q_feet", false],
    ["A_feet", false],
    ["W_legs", false],
    ["S_legs", false],
    ["E_arms", false],
    ["D_arms", false],
    ["R_head", false],
    ["F_head", false]
])

var trailerFlags = new Map([
    ["UP", false],
    ["LEFT", false],
    ["DOWN", false],
    ["RIGHT", false]
])

var wireframeFlag = false;

var inAnimation = false, animationParts = 120, animationMovement, animationType;
var attached = false


var colors = new Map([
    ["red", 0xFF0000],
    ["green", 0x00FF00],
    ["blue", 0x0000FF],
    ["white", 0xFFFFFF],
    ["black", 0x000000],
    ["silver", 0xC0C0C0],
    ["iron", 0xA19D94],
    ["light red", 0xFFA07A],
    ["dark red", 0x8B0000],
    ["light green", 0x90EE90],
    ["dark green", 0x006400],
    ["light blue", 0xADD8E6],
    ["dark blue", 0x00008B]
]);

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0xF8F8F8);

    createRobot();
    createTrailer();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    'use strict';
    cameraFront = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2,
        window.innerHeight / 2, -window.innerHeight / 2, 1, 1000);
    cameraFront.position.set(0, 0, 200);
    cameraFront.lookAt(scene.position);

    // Side camera
    cameraSide = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2,
        window.innerHeight / 2, -window.innerHeight / 2, 1, 1000);
    cameraSide.position.set(200, 0, 0);
    cameraSide.lookAt(scene.position);

    // Top camera
    cameraTop = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2,
        window.innerHeight / 2, -window.innerHeight / 2, 1, 1000);
    cameraTop.position.set(0, 200, 0);
    cameraTop.lookAt(scene.position);

    // Orthographic camera for isometric view
    cameraOrtho = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2,
        window.innerHeight / 2, -window.innerHeight / 2, 1, 1000);
    cameraOrtho.position.set(200, 200, 200);
    cameraOrtho.lookAt(scene.position);

    // Perspective camera for isometric view
    cameraPerspective = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000);
    cameraPerspective.position.set(200, 200, 200);
    cameraPerspective.lookAt(scene.position);

    activeCamera = cameraFront; // Set the initial active camera as front camera
    scene.add(activeCamera);
}

function setActiveCamera(camera) {
    scene.remove(activeCamera); // Remove the current active camera from the scene
    activeCamera = camera; // Set the new active camera
    scene.add(activeCamera); // Add the new active camera to the scene
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createRobot() {
    'use strict'
    robot = new THREE.Object3D();
    createChest();

    maxRobotVec = new THREE.Vector3(60, 50, 40);
    minRobotVec = new THREE.Vector3(-60, -90, -160);
    minRobotVec.add(robot.position);
    maxRobotVec.add(robot.position);

    scene.add(robot);
}

function createChest() {
    'use strict'
    chest = new THREE.Object3D();
    addCube(chest, 100, 60, 80, 0, 0, 0, "red"); // torso
    addCube(chest, 60, 20, 75, 0, -40, 0, "dark red"); // abdomen
    addCube(chest, 60, 10, 75, 0, -55, 0, "silver"); // waist

    createHead();
    createSuperiorMembers();
    createLegs();

    robot.add(chest);
}

function createHead() {
    'use strict'
    head = new THREE.Object3D();
    addCube(head, 30, 30, 30, 0, 15, 0, "dark blue"); // head
    addCube(head, 7.5, 5, 2.5, 7.5, 20, 16.25, "silver"); // right eye
    addCube(head, 7.5, 5, 2.5, -7.5, 20, 16.25, "silver"); // left eye
    addCube(head, 5, 20, 10, 17.5, 30, 0, "blue"); // right antenna
    addCube(head, 5, 20, 10, -17.5, 30, 0, "blue"); // left antenna

    head.position.set(0, 29.99, 5);

    chest.add(head);
}

function createSuperiorMembers() {
    'use strict';
    rightMember = new THREE.Object3D();
    leftMember = new THREE.Object3D();
    addCube(leftMember, 19.99, 59.99, 19.99, 0, 0, -30, "dark red"); // left arm
    addCube(rightMember, 19.99, 59.99, 19.99, 0, 0, -30, "dark red"); // right arm
    addCube(leftMember, 20, 20, 80, 0, -40, 0, "dark red"); // left forearm
    addCube(rightMember, 20, 20, 80, 0, -40, 0, "dark red"); // right forearm
    addCilinder(leftMember, 5, 80, 15, 10, -32.5, 0, 0, "silver"); // left pipe
    addCilinder(rightMember, 5, 80, -15, 10, -32.5, 0, 0, "silver"); // right pipe

    rightMember.position.set(-60, 0, 0);
    leftMember.position.set(60, 0, 0);

    chest.add(rightMember, leftMember);
}

function createLegs() {
    'use strict';
    legs = new THREE.Object3D();
    addCube(legs, 15, 45, 15, 15, -15, 0, "silver"); // left thigh
    addCube(legs, 15, 45, 15, -15, -15, 0, "silver"); // right thigh
    addCube(legs, 27.5, 90, 20, 16.25, -82.5, 0, "dark blue"); // left leg
    addCube(legs, 27.5, 90, 20, -16.25, -82.5, 0, "dark blue"); // right leg
    addCilinder(legs, 17.5, 15, 37.5, -5, 5, Math.PI / 2, 'z', "black"); // left wheel 1
    addCilinder(legs, 17.5, 15, -37.5, -5, 5, Math.PI / 2, 'z', "black"); // right wheel 1
    addCilinder(legs, 17.5, 15, 37.5, -60, 5, Math.PI / 2, 'z', "black"); // left wheel 2
    addCilinder(legs, 17.5, 15, -37.5, -60, 5, Math.PI / 2, 'z', "black"); // right wheel 2
    addCilinder(legs, 17.5, 15, 37.5, -105, 5, Math.PI / 2, 'z', "black"); // left wheel 3
    addCilinder(legs, 17.5, 15, -37.5, -105, 5, Math.PI / 2, 'z', "black"); // right wheel 3

    createFeet(legs);
    legs.position.y = -67.5

    chest.add(legs);
}

function createFeet() {
    'use strict';
    feet = new THREE.Object3D();
    addCube(feet, 27.49, 15, 35, 16.25, 0, 7.5, "blue"); // left foot
    addCube(feet, 27.49, 15, 35, -16.25, 0, 7.5, "blue"); // right foot

    legs.add(feet);
    feet.position.y = -135
}

function createTrailer() {
    'use strict'
    trailer = new THREE.Object3D();
    addCube(trailer, 110, 130, 310, 0, 0, 0, "dark blue");
    addWheel(-45, -90, -60);
    addWheel(-45, -90, -130);
    addWheel(45, -90, -60);
    addWheel(45, -90, -130);
    addConnector();
    trailer.position.z -=500;
    trailer.position.y += 25;

    scene.add(trailer);
}

function addWheel(Px, Py, Pz) {
    'use strict'
    let wheel = new THREE.Object3D();
    addCilinder(wheel, 25, 20, 0, 0, 0, Math.PI / 2, "z", "black");
    addCilinder(wheel, 15, 21, 0, 0, 0, Math.PI / 2, "z", "silver");
    trailer.add(wheel);
    wheel.position.x += Px;
    wheel.position.y += Py;
    wheel.position.z += Pz;
}

function addConnector() {
    'use strict'
    let connector = new THREE.Object3D();
    addCilinder(connector, 15, 17.5, 0, 1.25, 0, 0, "", "silver");
    trailer.add(connector);
    connector.position.x += 0;
    connector.position.y += -75;
    connector.position.z += 110;
}

function addCube(obj, Sx, Sy, Sz, Vx, Vy, Vz, color) {
    'use strict';
    geometry = new THREE.BoxGeometry(Sx, Sy, Sz);
    var material = new THREE.MeshBasicMaterial({ color:colors.get(color), wireframe:false });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(Vx, Vy, Vz);
    obj.add(mesh);
    projectMeshes.push(mesh);
}

function addCilinder(obj, r, h, Vx, Vy, Vz, rotation, axis, color) {
    'use strict';
    geometry = new THREE.CylinderGeometry(r, r, h, 32);
    var material = new THREE.MeshBasicMaterial({ color:colors.get(color), wireframe:false });
    mesh = new THREE.Mesh(geometry, material);
    if (rotation !== 0 && axis === 'z') {
        mesh.rotateZ(rotation);
    }
    mesh.position.set(Vx, Vy, Vz);
    obj.add(mesh);
    projectMeshes.push(mesh);
}


//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
    'use strict';
    if (minRobotVec.z < maxTrailerVec.z &&
        maxRobotVec.z > minTrailerVec.z &&
        maxRobotVec.x > minTrailerVec.x &&
        minRobotVec.x < maxTrailerVec.x &&
        maxRobotVec.y > minTrailerVec.y &&
        minRobotVec.y < maxTrailerVec.y) {
        collision = true;
    }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {
    'use strict';
    inAnimation = true;
    let xSrc = new THREE.Vector3(trailer.position.x, 0, 0);
    let xDest = new THREE.Vector3(robot.position.x, 0, 0);
    let xDist = (xSrc.distanceTo(xDest) / animationParts) + delta;
    if (trailer.position.x > robot.position.x)
        xDist *= -1;
    let ySrc = new THREE.Vector3(0, trailer.position.y, 0);
    let yDest = new THREE.Vector3(0, robot.position.y + trailer.position.y, 0);
    let yDist = (ySrc.distanceTo(yDest) / animationParts) + delta;
    let zSrc = new THREE.Vector3(0, 0, trailer.position.z);
    let zDest = new THREE.Vector3(0, 0, robot.position.z - 210);
    let zDist = (zSrc.distanceTo(zDest) / animationParts) + delta;
    if (trailer.position.z > robot.position.z - 210)
        zDist *= -1;
    animationType = "attach"
    animationMovement = new THREE.Vector3(xDist, yDist, zDist);
}

///////////////////////
/* Unattach Animation */
///////////////////////
function unattachAnimation() {
    'use strict';
    inAnimation = true;
    let zSrc = new THREE.Vector3(0, 0, trailer.position.z);
    let zDest = new THREE.Vector3(0, 0, robot.position.z - 400);
    let zDist = (zSrc.distanceTo(zDest) / animationParts) + delta;
    if (trailer.position.z > robot.position.z - 400)
        zDist *= -1;
    animationType = "unattach";
    animationMovement = new THREE.Vector3(0, 0, zDist);
}

////////////
/* UPDATE */
////////////
function update() {
    'use strict';
    checkCollisions();
    if (collision) {
        handleCollisions();
    }

}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, activeCamera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCamera();

    clock = new THREE.Clock(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    delta = clock.getDelta()
    if (inAnimation) {
        trailer.position.add(animationMovement);
        animationParts--;
        if (animationParts == 0) {
            inAnimation = false;
            animationParts = 120;
            collision = false;
            if (animationType == "attach")
                attached = true;
            else
                attached = false;
        }
    }
    let newTrailerVector = new THREE.Vector3(0, 0, 0);
    for (let [key, value] of trailerFlags) {
        if (value) {
            if (collision) break;
            maxTrailerVec = new THREE.Vector3(55, 65, 155);
            minTrailerVec = new THREE.Vector3(-55, -115, -155);
            minTrailerVec.add(trailer.position);
            maxTrailerVec.add(trailer.position);
            if (!inAnimation) {
                if (feet.rotation.x >= Math.PI/2 && legs.rotation.x >= Math.PI/2 &&
                    head.rotation.x <= -Math.PI && rightMember.position.x + 60 >= 20 &&
                    leftMember.position.x - 60 <= -20) {
                    update();
                }
            }

            switch (key) {
                case "UP":
                    newTrailerVector.z += 2;
                    break;
                case "LEFT":
                    newTrailerVector.x -= 2;
                    break;
                case "DOWN":
                    newTrailerVector.z -= 2;
                    break;
                case "RIGHT":
                    newTrailerVector.x += 2;
                    break;
            }
        }
    }
    trailer.position.add(newTrailerVector);
    for (let [key, value] of animationFlags) {
        if (value) {
            switch (key) {
                case "Q_feet":
                    if (feet.rotation.x < Math.PI/2)
                        feet.rotation.x += Math.PI/16 * speed * delta;
                    break;
                case "A_feet":
                    if (feet.rotation.x > 0)
                        feet.rotation.x -= Math.PI/16 * speed * delta;
                    break;
                case "W_legs":
                    if (legs.rotation.x < Math.PI/2)
                        legs.rotation.x += Math.PI/16 * speed * delta;
                    break;
                case "S_legs":
                    if (legs.rotation.x > 0)
                        legs.rotation.x -= Math.PI/16 * speed * delta;
                    break;
                case "E_arms":
                    if (leftMember.position.x - 60 > -20 && rightMember.position.x + 60 < 20) {
                        leftMember.position.x -= speed*3 * delta;
                        rightMember.position.x += speed*3 * delta;
                    }
                    break;
                case "D_arms":
                    if (leftMember.position.x - 60 < 0 && rightMember.position.x + 60 > 0) {
                        leftMember.position.x += speed*3 * delta;
                        rightMember.position.x -= speed*3 * delta;
                    }
                    break;
                case "R_head":
                    if (head.rotation.x > -Math.PI)
                        head.rotation.x -= Math.PI/16 * speed * delta;
                    break;
                case "F_head":
                    if (head.rotation.x < 0)
                        head.rotation.x += Math.PI/16 * speed * delta;
                    break
            }
        }
    }

    if (wireframeFlag) {
        // for each projectMeshes
        for (let i = 0; i < projectMeshes.length; i++) {
            projectMeshes[i].material.wireframe = !projectMeshes[i].material.wireframe;
        }
        wireframeFlag = false;
    }

    render();

    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    'use strict';
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
        case 37: // Arrow Left
            if (!inAnimation)
                trailerFlags.set("LEFT", true);
            if (attached)
                unattachAnimation();
            break;
        case 38: // Arrow Up
            if (!inAnimation)
                trailerFlags.set("UP", true);
            if (attached)
                unattachAnimation();
            break;
        case 39: // Arrow Right
            if (!inAnimation)
                trailerFlags.set("RIGHT", true);
            if (attached)
                unattachAnimation();
            break;
        case 40: // Arrow Down
            if (!inAnimation)
                trailerFlags.set("DOWN", true);
            if (attached)
                unattachAnimation();
            break;
        case 70: // F
            if (!inAnimation && !attached)
                animationFlags.set("F_head", true);
            break;
        case 82: // R
            if (!inAnimation && !attached)
                animationFlags.set("R_head", true);
            break;
        case 69: // E
            if (!inAnimation && !attached)
                animationFlags.set("E_arms", true);
            break;
        case 68: // D
            if (!inAnimation && !attached)
                animationFlags.set("D_arms", true);
            break;
        case 87: // W
            if (!inAnimation && !attached)
                animationFlags.set("W_legs", true);
            break;
        case 83: // S
            if (!inAnimation && !attached)
                animationFlags.set("S_legs", true);
            break;
        case 81: // Q
            if (!inAnimation && !attached)
                animationFlags.set("Q_feet", true);
            break;
        case 65: // A
            if (!inAnimation && !attached)
                animationFlags.set("A_feet", true);
            break;
        case 49: // 1 key (front view)
            setActiveCamera(cameraFront);
            break;
        case 50: // 2 key (side view)
            setActiveCamera(cameraSide);
            break;
        case 51: // 3 key (top view)
            setActiveCamera(cameraTop);
            break;
        case 52: // 4 key (isometric - orthogonal projection)
            setActiveCamera(cameraOrtho);
            break;
        case 53: // 5 key (isometric - perspective projection)
            setActiveCamera(cameraPerspective);
            break;
        case 54: // 6 key (wireframe)
            wireframeFlag = !wireframeFlag;
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    'use strict';
    switch (e.keyCode) {
        case 37: // Arrow Left
            trailerFlags.set("LEFT", false);
            break;
        case 38: // Arrow Up
            trailerFlags.set("UP", false);
            break;
        case 39: // Arrow Right
            trailerFlags.set("RIGHT", false);
            break;
        case 40: // Arrow Down
            trailerFlags.set("DOWN", false);
            break;
        case 70: // F
            animationFlags.set("F_head", false);
            break;
        case 82: // R
            animationFlags.set("R_head", false);
            break;
        case 69: // E
            animationFlags.set("E_arms", false);
            break;
        case 68: // D
            animationFlags.set("D_arms", false);
            break;
        case 87: // W
            animationFlags.set("W_legs", false);
            break;
        case 83: // S
            animationFlags.set("S_legs", false);
            break;
        case 81: // Q
            animationFlags.set("Q_feet", false);
            break;
        case 65: // A
            animationFlags.set("A_feet", false);
            break;
    }
}