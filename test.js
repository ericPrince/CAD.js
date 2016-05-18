//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container, stats;
var camera, controls, scene, renderer;
var cross;

var raycaster;
var mouse = new THREE.Vector2();

//----------------
// program
init();
animate();
//----------------

function init() {
  setupCamera();

  setupControls();

  // world
  setupScene();

  // renderer
  setupRenderer();

  raycaster = new THREE.Raycaster();

  stats = new Stats();
  //container.appendChild( stats.dom );

  window.addEventListener( 'resize', onWindowResize, false );
  
  render();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  controls.handleResize();
  render();
}

function animate() {
  requestAnimationFrame( animate );
  controls.update();
}

function render() {
  renderer.render( scene, camera );
  stats.update();
}

function setupCamera() {
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 50;
}

function setupControls() {
  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  controls.keys = [ 65, 83, 68 ];
  controls.addEventListener( 'change', render );
}

function setupScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
  
  var material =  new THREE.MeshPhongMaterial( { color:0xffffff, shading: THREE.FlatShading } );
  
  var a = CSG.cube();
  var b = CSG.sphere({ radius: 1.35, stacks: 12 });
  var c = CSG.cylinder({ radius: 0.7, start: [-1, 0, 0], end: [1, 0, 0] });
  var d = CSG.cylinder({ radius: 0.7, start: [0, -1, 0], end: [0, 1, 0] });
  var e = CSG.cylinder({ radius: 0.7, start: [0, 0, -1], end: [0, 0, 1] });
  
  a.setColor(1, 0, 0);
  b.setColor(0, 0, 1);
  c.setColor(0, 1, 0);
  d.setColor(0, 1, 0);
  e.setColor(0, 1, 0);

  var operation = a.intersect(b).subtract(c.union(d).union(e));
  var geom = operation.toGeom();

  var mesh = new THREE.Mesh(geom, material);

  scene.add(mesh);

  // lights
  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );
  light = new THREE.DirectionalLight( 0x002288 );
  light.position.set( -1, -1, -1 );
  scene.add( light );
  light = new THREE.AmbientLight( 0x222222 );
  scene.add( light );
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer( { antialias: false } );

  renderer.setClearColor( scene.fog.color );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );
}