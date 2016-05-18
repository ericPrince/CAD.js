// NOTE: this file is unused, the main script is cad.js
//  kept for posterity or something...

var WIDTH  = window.innerWidth, 
    HEIGHT = window.innerHeight, 
    ASPECT = WIDTH / HEIGHT, 
    FOV = 60;


var Main = Main || {
  state: 'no-tool', // tool state
  //csgs: {},   // csg geometry
  lines: {},  // line & poly geometry
  meshes: {}, // mesh geometry
  canvas: undefined,
  context: undefined,
  controls: undefined,
  stats: undefined,
  renderer: undefined,
  camera: undefined,
  clock: undefined,
  scene: undefined,

};


window.onload = function() {
  Main.canvas = document.getElementById("canvas");
  //Main.canvas = document.createElement('canvas');
  //Main.context = canvas.getContext("2d");

  document.documentElement.style.overflow = 'hidden';  // firefox, chrome
  document.body.scroll = "no"; // ie

  Main.renderer = new THREE.WebGLRenderer({canvas: Main.canvas});
  Main.renderer.setSize(WIDTH, HEIGHT);
  Main.renderer.setPixelRatio(window.devicePixelRatio);
  Main.renderer.setClearColor(0x0f0f0f);
  Main.renderer.domElement.style.backgroundColor = '#D6F1FF';
  

  Main.scene = new THREE.Scene();
  //Main.scene.fog = new THREE.FogExp2(0xD6F1FF, 0.0005);

  Main.camera = new THREE.PerspectiveCamera(FOV, ASPECT, 1, 10000);
  Main.camera.position.set(5.0, 5.0, 5.0);
  //Main.camera.position.y = 0.0;
  Main.scene.add(Main.camera);

  //Main.controls = new THREE.TrackballControls(Main.camera, Main.canvas);
  Main.controls = new THREE.TrackballControls(Main.camera, Main.renderer.domElement);

  Main.clock = new THREE.Clock();

  document.body.appendChild(Main.renderer.domElement);

  // initialize scene / meshes??


  //--------------------------
  // testing on CSG primitives -> THREE.Mesh

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
/*
  //var geom = operation.toGeom();
  //var geom = a.toGeom();
  var geom = new THREE.BoxGeometry(1,1,1);

  //var material = new THREE.MeshLambertMaterial({fog:true});
  var material = new THREE.MeshBasicMaterial({color: 0xff0000});

  var mesh = new THREE.Mesh(geom, material);

  Main.scene.add(mesh);
*/
  //================

  Main.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  Main.camera.position.z = 500;
  Main.controls = new THREE.TrackballControls( Main.camera );
  Main.controls.rotateSpeed = 1.0;
  Main.controls.zoomSpeed = 1.2;
  Main.controls.panSpeed = 0.8;
  Main.controls.noZoom = false;
  Main.controls.noPan = false;
  Main.controls.staticMoving = true;
  Main.controls.dynamicDampingFactor = 0.3;
  Main.controls.keys = [ 65, 83, 68 ];
  Main.controls.addEventListener( 'change', render );
  // world
  Main.scene = new THREE.Scene();
  Main.scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
  var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
  var material =  new THREE.MeshPhongMaterial( { color:0xffffff, shading: THREE.FlatShading } );
  for ( var i = 0; i < 500; i ++ ) {
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = ( Math.random() - 0.5 ) * 1000;
    mesh.position.y = ( Math.random() - 0.5 ) * 1000;
    mesh.position.z = ( Math.random() - 0.5 ) * 1000;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    Main.scene.add( mesh );
  }
  // lights
  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  Main.scene.add( light );
  light = new THREE.DirectionalLight( 0x002288 );
  light.position.set( -1, -1, -1 );
  Main.scene.add( light );
  light = new THREE.AmbientLight( 0x222222 );
  Main.scene.add( light );

  //================

  /*
  var directionalLight1 = new THREE.DirectionalLight( 0xF7EFBE, 0.7 );
  directionalLight1.position.set( 0.5, 1, 0.5 );
  Main.scene.add( directionalLight1 );
  var directionalLight2 = new THREE.DirectionalLight( 0xF7EFBE, 0.5 );
  directionalLight2.position.set( -0.5, -1, -0.5 );
  Main.scene.add( directionalLight2 );
  */

  //---------------------------

  // add other event listeners
/*
  Main.controls.rotateSpeed = 1.0;
  Main.controls.staticMoving = true;
  Main.controls.noZoom = false;
  Main.controls.noPan = false;
  Main.controls.addEventListener('change', render);
  //Main.controls.reset();

  //animate();
  //render();
*/
  window.addEventListener('resize', onWindowResize, false);

  render();

  animate();
}


function animate() {
  requestAnimationFrame(animate);
  Main.controls.update();
  //render();
}

function render() {
  Main.renderer.clear();
  Main.renderer.render(Main.scene, Main.camera);
  //Main.controls.update();
  //console.log(Main.camera);
  console.log('render');
}

function onWindowResize() {
  Main.camera.aspect = window.innerWidth / window.innerHeight;
  Main.camera.updateProjectionMatrix();

  Main.renderer.setSize(window.innerWidth, window.innerHeight);

  Main.controls.handleResize();

  render();
}

Main.onPress = function(e) {
  // store press location
  // select nearest (assign2)
}

Main.onDrag = function(e) {
  // update geom
  // render
}

Main.onRelease = function(e) {
  // determine if moved?
  // 
}

Main.onKey = function(e) {
  // select tool
  // or escape tool
  // or do something
}

Main.update = function(e) {
  // render
}

//THREE.ExtrudeGeometry
//THREE.LatheGeometry

CSG.prototype.toGeom = function() {
  var geom = new THREE.Geometry();

  // use indexer to get unique verts
  // could use code that's in THREE

  //var mesh = new GL.Mesh({normals: true, colors: true });
  var indexer = new GL.Indexer();
  this.toPolygons().map(function(polygon) {
    var indices = polygon.vertices.map(function(vertex) {
      vertex.color = polygon.shared || [1, 1, 1];
      return indexer.add(vertex);
    });
    for (var i = 2; i < indices.length; i++) {
      //mesh.triangles.push([indices[0], indices[i - 1], indices[i]]);
      geom.faces.push(new THREE.Face3(indices[0], indices[i - 1], indices[i]));
    }
  });
  //mesh.vertices = indexer.unique.map(function(v) { return [v.pos.x, v.pos.y, v.pos.z]; });
  geom.vertices = indexer.unique.map(function(v) { return new THREE.Vector3(v.pos.x, v.pos.y, v.pos.z); });
  //mesh.normals = indexer.unique.map(function(v) { return [v.normal.x, v.normal.y, v.normal.z]; });
  //mesh.colors = indexer.unique.map(function(v) { return v.color; });
  geom.colors = indexer.unique.map(function(v) { return v.color; });

  return geom;
}

// Set the color of all polygons in this solid
CSG.prototype.setColor = function(r, g, b) {
  this.toPolygons().map(function(polygon) {
    polygon.shared = [r, g, b];
  });
};