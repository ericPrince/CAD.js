var container, stats;
var camera, controls, scene, renderer;
var cross;

var camLight;

var raycaster;
//var mouse, keys;

var geometries = geometries || {
  // THREE Geometry
  mesh:     new THREE.Geometry(),
  wires:    new THREE.Geometry(),
  active:   new THREE.Geometry(),
  selected: new THREE.Geometry(),

  // CSG main solid
  csg: new CSG(),

  // internal store of polygons/vertices
  polys:    [],
  vertices: [],
};

var objects = objects || {
  mesh:     undefined,
  meshwire: undefined,
  wires:    undefined,
  active:   undefined,
  selected: undefined,

  csg: undefined,
}

var colors = colors || {
  mesh:     0xffffff,
  active:   0x00ff00,
  cut:      0xffff00,
  wires:    0x0000ff,
  selected: 0xff0000,
  background: 0x131313,
}

var materials = materials || {
  mesh:     new THREE.MeshPhongMaterial( { color: colors.mesh,     shading: THREE.FlatShading, transparent: true, opacity: 0.9, side: THREE.DoubleSide, } ),
  meshwire: new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: true, wireframeLinewidth: 4, } ),
  active:   new THREE.MeshPhongMaterial( { color: colors.active,   shading: THREE.FlatShading, transparent: true, opacity: 0.5, side: THREE.DoubleSide, } ),
  union:    new THREE.MeshPhongMaterial( { color: colors.active,   shading: THREE.FlatShading, transparent: true, opacity: 0.5, side: THREE.DoubleSide, } ),
  cut:      new THREE.MeshPhongMaterial( { color: colors.cut,      shading: THREE.FlatShading, transparent: true, opacity: 0.5, side: THREE.DoubleSide, } ),
  selected: new THREE.MeshPhongMaterial( { color: colors.selected, shading: THREE.FlatShading, transparent: true, opacity: 0.5, side: THREE.DoubleSide, } ),
  wires:    new THREE.LineBasicMaterial( { color: colors.wires,    linewidth:5 }),
};

materials.union.polygonOffset = true;
materials.union.polygonOffsetFactor = -1;
materials.union.polygonOffsetUnits = -0.1;

materials.cut.polygonOffset = true;
materials.cut.polygonOffsetFactor = -1;
materials.cut.polygonOffsetUnits = -0.1;

materials.selected.polygonOffset = true;
materials.selected.polygonOffsetFactor = -1;
materials.selected.polygonOffsetUnits = -0.5;

var csgmodes = {
  union: 0,
  intersect: 1,
  difference: 2,
}

//----------------------------------------
// MAIN ROUTINES
//----------------------------------------

// should these be in document.onload callback?
window.onload = function() {
  init();
  animate();
}

function init() {
  setupCamera();

  setupControls();

  // world
  setupScene();

  // renderer
  setupRenderer();

  stats = new Stats();
  //container.appendChild( stats.dom );

  window.addEventListener( 'resize', onWindowResize, false );
  
  render();
}

// modified from one of the assignments...
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  controls.handleResize();
  render();
}

//----------------------------------------
// SETUP
//----------------------------------------

function initMeshGeom() {
  var plane = new Plane(new THREE.Vector3(0, 1, 0), 0);
  var poly = new Polygon(plane);

  var v1 = new Vertex(-10, 0, -10);
  var v2 = new Vertex(-10, 0, 10);
  var v3 = new Vertex(10, 0, 10);
  var v4 = new Vertex(10, 0, -10);

  poly.addVertex(v1);
  poly.addVertex(v2);
  poly.addVertex(v3);
  poly.addVertex(v4);

  //geometries.csg = CSG.cube(10, 10, 10);

  //createGeometry();
}

function setupCamera() {
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 50;

  camLight = new THREE.PointLight(0xffffff);
  camLight.position.set(0,0,0);
  camera.add(camLight);
}

function setupScene() {
  // scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( colors.background, 0.002 ); //0.002

  scene.add(camera);

  // start with square centered on origin
  initMeshGeom();

  createGeometry();
  createScene();
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

function setupRenderer() {
  renderer = new THREE.WebGLRenderer( { antialias: false } );

  renderer.setClearColor( scene.fog.color );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  raycaster = new THREE.Raycaster();
}

//----------------------------------------
// RENDERING
//----------------------------------------

function animate() {
  requestAnimationFrame( animate );
  controls.update();
}

function render() {
  renderer.clear();
  renderer.render( scene, camera );
  stats.update();
}

//----------------------------------------
// GEOMETRY MANIPULATION
//----------------------------------------

function createScene() {
  objects.mesh     = new THREE.Mesh(         geometries.mesh,     materials.mesh     );
  objects.meshwire = new THREE.Mesh(         geometries.mesh,     materials.meshwire );
  objects.wires    = new THREE.LineSegments( geometries.wires,    materials.wires    );
  objects.active   = new THREE.Mesh(         geometries.active,   materials.active   );
  objects.selected = new THREE.Mesh(         geometries.selected, materials.selected );

  objects.csg = new THREE.Mesh(geometries.csg.toGeom(), materials.mesh);

  scene.add(objects.mesh);
  scene.add(objects.meshwire);
  scene.add(objects.wires);
  scene.add(objects.active);
  scene.add(objects.selected);

  scene.add(objects.csg);
}

function refreshScene() {
  scene.remove(objects.mesh);
  scene.remove(objects.meshwire);
  scene.remove(objects.wires);
  scene.remove(objects.active);
  scene.remove(objects.selected);

  scene.remove(objects.csg);

  createScene();
}

// build all geometries
function createGeometry() {
  // just create the main geom from the csg
  geometries.mesh = new THREE.Geometry();

  geometries.wires = new THREE.Geometry();
  geometries.active = new THREE.Geometry();
  geometries.selected = new THREE.Geometry();

  var vertices = geometries.vertices.map(function(v) { return v.position; });

  geometries.mesh.vertices = vertices;
  geometries.active.vertices = vertices;
  geometries.selected.vertices = vertices;

  for (var f = 0; f < geometries.polys.length; f++) {
    var poly = geometries.polys[f];

    // check if selected or active
    var geomToModify = geometries.mesh;
    if (poly.selected) geomToModify = geometries.selected;
    else if (poly.active) geomToModify = geometries.active;
    
    // push all triangles of that face
    var faces = [];
    for (var i = 0; i < poly.triangles.length; i++) {
      var triangle = poly.triangles[i];

      geomToModify.faces.push(new THREE.Face3(poly.verts[triangle[0]].id,
                                 poly.verts[triangle[1]].id,
                                 poly.verts[triangle[2]].id,
                                 poly.plane.normal));
    }

    // add wireframe
    for (var i = 0; i < poly.verts.length; i++) {
      var j = (i + 1) % poly.verts.length;

      // each line segment
      geometries.wires.vertices.push(poly.verts[i].position);
      geometries.wires.vertices.push(poly.verts[(i + 1) % poly.verts.length].position);
    }
  }
  //geometries.mesh = geometries.csg.toGeom();
  geometries.mesh = new THREE.Geometry();
}

// apply an extrusion or revolution (csg operation)
function applyOperation(operation) {
  operation.setActive(false);
  var csg = operation.toCSG();

  if (operation.csgmode === csgmodes.union) {
    geometries.csg = geometries.csg.union(csg);
  }
  else if (operation.csgmode === csgmodes.intersect) {
    geometries.csg = geometries.csg.intersect(csg);
  }
  else if (operation.csgmode === csgmodes.difference) {
    geometries.csg = geometries.csg.subtract(csg);
  }
}


//----------------------------------------
// GEOMETRY TYPES
//----------------------------------------

// project v onto u
projectVector = function(u, v) {
  return u.clone().multiplyScalar(u.dot(v));
}

// v - (project v onto u)
antiprojectVector = function(u, v) {
  return v.clone().sub(u.clone().multiplyScalar(u.dot(v)));
}

// rotation equation taken from (http://inside.mines.edu/fs_home/gmurray/ArbitraryAxisRotation/)
// section 6.2, for rotation about arbitrary line
rotatePoint = function(ray, point, angle) {
  var ca = Math.cos(angle);
  var sa = Math.sin(angle);

  var dir = ray.direction.clone().normalize();

  var x = point.x,      y = point.y,      z = point.z;
  var u = dir.x,        v = dir.y,        w = dir.z;
  var a = ray.origin.x, b = ray.origin.y, c = ray.origin.z;

  var i = (a*(v*v + w*w) - u*(b*v + c*w - u*x - v*y - w*z)) * (1 - ca) 
        + x * ca 
        + (-c*v + b*w - w*y + v*z) * sa;

  var j = (b*(u*u + w*w) - v*(a*u + c*w - u*x - v*y - w*z)) * (1 - ca)
        + y * ca
        + (c*u - a*w + w*x - u*z) * sa;

  var k = (c*(u*u + v*v) - w*(a*u + b*v - u*x - v*y - w*z)) * (1 - ca)
        + z * ca
        + (-b*u + a*v - v*x + u*y) * sa;

  return new THREE.Vector3(i, j, k);
}

var Plane = function(normal, d) {
  this.normal = normal || new THREE.Vector3();
  this.d = 0.0 || d;
}

Plane.prototype.copy = function() {
  return new Plane(this.normal, this.d);
}

Plane.prototype.intersect = function(ray) {
  var a = -ray.direction.dot(this.normal.normalize());
  var b = -ray.origin.dot(this.normal) - this.d;

  if (a === 0) return undefined;

  var len = -b / a;
  if (len < 0) return undefined;

  return {
    position: ray.origin.clone().add(
                ray.direction.clone().multiplyScalar(len)),
    distance: len,
  };
}

Plane.prototype.toCSG = function() {
  return new CSG.Plane([this.normal.x,
                        this.normal.y,
                        this.normal.z],
                       d);
}

Plane.fromPoints = function(p1, p2, p3) {
  var normal = p2.clone().sub(p1).cross(p3.clone().sub(p1)).normalize();
  var d = p1.dot(normal);

  return new Plane(normal, d);
}

Plane.fromAxisAndPoints = function(ax, p1, p2) {
  var normal = p2.clone().sub(p1).cross(ax).normalize();
  var d = -p1.dot(normal);

  return new Plane(normal, d);
}

var Vertex = function(x, y, z) {
  this.position = new THREE.Vector3(x, y, z);
  this.id = geometries.vertices.length;

  this.normal = new THREE.Vector3();

  geometries.vertices.push(this);
}

Vertex.prototype.toCSG = function() {
  return new CSG.Vertex([this.position.x, 
                         this.position.y, 
                         this.position.z],

                        [this.normal.x,
                         this.normal.y,
                         this.normal.z]);
}

var Polygon = function(plane) {
  this.plane = plane.copy();
  this.verts = [];
  this.id = geometries.polys.length;

  this.selected = false;
  this.active = false;

  this.triangles = [];
  this.triangulate();

  geometries.polys.push(this);
};

Polygon.prototype.addVertex = function(v) {
  this.verts.push(v);
  this.triangulate();
}

Polygon.prototype.addVertices = function(verts) {
  for (var i = 0; i < verts.length; i++) {
    this.verts.push(verts[i]);
  }
  this.triangulate();
}

Polygon.prototype.triangulateConvex = function() {
  if (this.active) {
    this.triangles = [];
    return;
  }

  if (this.verts.length < 3) return;
  if (this.triangles.length === 1*(this.verts.length - 2)) return;

  this.triangles = [];

  for (var i = 1; i < this.verts.length - 1; i++) {
    this.triangles.push([0, i, i + 1]);
  }
}

// uses inefficient implementation of ear-clipping algorithm
// ...ideas taken from (http://www.geometrictools.com/Documentation/TriangulationByEarClipping.pdf)
// still has issues for certain cases
Polygon.prototype.triangulateConcave = function() {
  if (this.verts.length < 3) return;
  if (this.verts.length === 3) {
    this.triangles = [[0, 1, 2]];
    return;
  }
  if (this.triangles.length === 1*(this.verts.length - 2)) return;

  this.triangles = [];

  var exterior = 0;
  for (var i = 0; i < this.verts.length; i++) {
    var v0 = this.verts[i].position;
    var v1 = this.verts[(i + 1) % this.verts.length].position;
    var v2 = this.verts[(i + this.verts.length - 1) % this.verts.length].position;

    // convexity
    var c = v1.clone().sub(v0).cross(v2.clone().sub(v0)).dot(this.plane.normal);

    // cosine of angle
    var ca = v1.clone().sub(v0).normalize().dot(v2.clone().sub(v0).normalize());

    if (c > 0) {
      // add exterior angle of convex
      exterior = exterior + Math.PI - Math.acos(ca);
    }
    else {
      // subtract exterior angle or concave
      exterior = exterior - Math.PI + Math.acos(ca);
    }
  }
  console.log(exterior)
  if (Math.abs(exterior - 2*Math.PI) > Math.PI/2) return;

  var verts = [];
  for (var i = 0; i < this.verts.length; i++) {
    verts.push(i);
  }

  var i = 0;
  while (this.triangles.length < this.verts.length - 2) {
    if (i === verts.length) {
      if (this.triangles.length === 0) return;
      i = 0;
    }

    var v0 = this.verts[verts[i]].position;
    var v1 = this.verts[verts[(i + 1) % verts.length]].position;
    var v2 = this.verts[verts[(i + verts.length - 1) % verts.length]].position;

    var c = v1.clone().sub(v0).cross(v2.clone().sub(v0)).dot(this.plane.normal);

    // also check if points in triangle
    if (c > 0) {
      var inTriangle = false;
      for (var j = i + 2; j < verts.length; j++) {
        if (j === (i + verts.length - 1) % verts.length) continue;

        var v = this.verts[verts[j]].position;

        if ((new THREE.Triangle(v0, v1, v2)).containsPoint(v)) {
        //if (null !== triangleIntersection(v0, v1, v2, new THREE.Ray(v, this.plane.normal))) {
          inTriangle = true;
          break;
        }
      }

      if (!inTriangle) {
        this.triangles.push([verts[(i + verts.length - 1) % verts.length], verts[i], verts[(i + 1) % verts.length]]);
        verts.splice(i, 1);
        i = i - 1; // undo next i = i + 1
      }
    }
    i = i + 1;
  }
}

Polygon.prototype.triangulate = Polygon.prototype.triangulateConcave;
//Polygon.prototype.triangulate = Polygon.prototype.triangulateConvex;

Polygon.prototype.centroid = function() {
  var centroid = new THREE.Vector3(0,0,0);
  for (var v = 0; v < this.verts.length; v++) {
    centroid.add(this.verts[v].position);
  }
  centroid.divideScalar(this.verts.length);

  return centroid;
}

// dir tells whether to switch direction of triangles
Polygon.prototype.toCSG = function(dir) {
  dir = dir || false;

  var polygons = [];

  for (var i = 0; i < this.triangles.length; i++) {
    var verts = [];

    var triangle = this.triangles[i];
    for (var v = 0; v < 3; v++) {
      verts.push(this.verts[triangle[v]].toCSG());
    }

    if (dir) verts.reverse();

    polygons.push(new CSG.Polygon(verts));
  }
  return polygons;
}

var Extrusion = function(base, csgmode, d) {
  this.base = base;

  this.normal = base.plane.normal; // TODO
  this.csgmode = csgmode || csgmodes.union;

  this.distance = d || 0.0;

  this.face = new Polygon(this.base.plane);
  this.sides = [];

  this.base.active = true;
  this.face.active = true;
  
  var faceVerts = [];
  for (var i = 0; i < this.base.verts.length; i++) {
    faceVerts.push(new Vertex());
  }
  this.face.addVertices(faceVerts);

  this.update(this.distance);

  for (var i = 0; i < this.base.verts.length; i++) {
    var p1 = this.base.verts[i];
    var p2 = this.base.verts[(i + 1) % this.base.verts.length];
    var q1 = this.face.verts[i];
    var q2 = this.face.verts[(i + 1) % this.base.verts.length];

    var side = new Polygon(Plane.fromAxisAndPoints(this.base.plane.normal, 
                                                   p1.position,
                                                   p2.position));

    side.addVertices([p1, p2, q2, q1]);
    side.active = true;

    this.sides.push(side);
  }

  this.face.triangulate();

  this.active = true;
};

Extrusion.prototype.update = function(d) {
  this.distance = d;

  this.face.plane.d = this.base.plane.d - this.distance;

  for (var i = 0; i < this.base.verts.length; i++) {
    this.face.verts[i].position = this.base.verts[i].position.clone().add(this.normal.clone().multiplyScalar(this.distance));
  }
}

Extrusion.prototype.setActive = function(active) {
  active = active || false;

  this.active = active;
  this.base.active = active;
  this.face.active = active;

  for (var i = 0; i < this.sides.length; i++) {
    this.sides[i].active = active;
  }
}

Extrusion.prototype.toCSG = function() {
  var reverse = this.distance < 0;

  var polygons = [];
  polygons = polygons.concat(this.face.toCSG(reverse));

  polygons = polygons.concat(this.base.toCSG(!reverse));

  for (var f = 0; f < this.sides.length; f++) {
    polygons = polygons.concat(this.sides[f].toCSG(reverse));
  }

  return new CSG.fromPolygons(polygons);
}

var Revolution = function(base, axis, csgmode) {
  this.base = base;
  this.csgmode = csgmode || csgmodes.union;

  if (axis === undefined) {
    this.axis = new THREE.Vector3(0,1,0);
  }
  else {
    this.axis = axis.clone();
  }

  this.active = true;

  // create vertices
  var verts = [];
  for (var i = 0; i < 16; i++) {
    var vertRow = [];

    var angle = 2*Math.PI * i/16;

    for (var j = 0; j < this.base.verts.length; j++) {
      var vert = new Vertex();
      vert.position = rotatePoint(this.axis, this.base.verts[j].position, angle);
      vertRow.push(vert);
    }
    verts.push(vertRow);
  }

  // create faces
  this.rows = [];
  for (var i = 0; i < 16; i++) {
    var row = [];

    for (var j = 0; j < this.base.verts.length; j++) {
      var p1 = verts[i][j];
      var p2 = verts[i][(j + 1) % this.base.verts.length];

      var q1 = verts[(i + 1) % 16][j];
      var q2 = verts[(i + 1) % 16][(j + 1) % this.base.verts.length];

      var poly = new Polygon(Plane.fromPoints(p1.position, p2.position, q2.position));

      poly.addVertices([p1, p2, q2, q1]);

      row.push(poly);
    }
    this.rows.push([]);
    this.rows[this.rows.length - 1] = row;
  }
}

Revolution.prototype.setAxis = function(axis) {
  // update vertex locations


  // update poly plane normals

}

Revolution.prototype.setActive = function(active) {
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < this.base.verts.length; j++) {
      this.rows[i][j].active = active || false;
    }
  }
  this.active = active || false;
}

Revolution.prototype.toCSG = function() {
  if (this.axis === undefined) return new CSG();

  var polygons = [];
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < this.base.verts.length; j++) {
      polygons = polygons.concat(this.rows[i][j].toCSG());
    }
  }

  return new CSG.fromPolygons(polygons);
}

Revolution.verifyAxis = function(poly, axis) {
  var polySide = undefined;

  for (var i = 0; i < poly.verts.length; i++) {
    var v = poly.verts[i].position;

    var vertSide = Math.sign(axis.direction.clone().cross(
                     v.clone().sub(axis.origin)).dot(
                       poly.plane.normal));

    if (polySide === undefined && vertSide !== 0) {
      polySide = vertSide;
    }
    else if (vertSide !== 0 && polySide !== vertSide) {
      return undefined;
    }
  }

  var ax = axis.clone();

  if (polySide < 0) {
    ax.direction.negate();
  }

  return ax;
}

//----------------------------------------
// STATE MACHINE
//----------------------------------------

var state = 'reset';

var stateData = {};

var updateState = function() {
    switch (state) {
        case "reset":
            state = doReset();
            break;

        case "viewAllGeom":
            state = doViewAllGeom();
            break;
        
        case "view3DGeom":
            state = doView3DGeom(mouse, keys);
            break;
        
        case "selectPolyPlane":
            state = doSelectPolyPlane();
            break;

        case "addPolyPoints":
            state = doAddPolyPoints();
            break;
        
        case "selectExtrudePoly":
            state = doSelectExtrudePoly();
            break;
        
        case "selectExtrudeDistance":
            state = doSelectExtrudeDistance();
            break;
        
        case "previewExtrude":
            state = doPreviewExtrude();
            break;
        
        case "selectRevolvePoly":
            state = doSelectRevolvePoly();
            break;
        
        case "selectRevolveAxis":
            state = doSelectRevolveAxis();
            break;
        
        case "previewRevolve":
            state = doPreviewRevolve();
            break;
    }

    // update movement/controls...

    return state;
}

function doReset() {
  for (var f = 0; f < geometries.polys.length; f++) {
    geometries.polys[f].selected = false;
  }

  materials.active = materials.union;

  createGeometry();
  refreshScene();

  stateData = {};

  return "viewAllGeom";
}

function doViewAllGeom() {
  if (keys.two) {
    scene.remove(objects.wires);
    scene.remove(objects.meshwire);
    return 'view3DGeom';
  }
  if (keys.three) {
    return 'selectPolyPlane';
  }
  if (keys.four) {
    return 'selectExtrudePoly';
  }
  if (keys.five) {
    return 'selectRevolvePoly';
  }

  return 'viewAllGeom';
}

function doView3DGeom() {
  if (keys.one) {
    scene.add(objects.wires);
    scene.add(objects.meshwire);
    return 'viewAllGeom';
  }

  return 'view3DGeom';
}

function doSelectPolyPlane() {
  if (mouse.left === 'down') {
    var plane;
    var face = selectNearestFace();

    if (face !== undefined) {
      plane = face.plane;
    }
    else {
      plane = new Plane(new THREE.Vector3(0,1,0), 0);
    }

    var poly = new Polygon(plane);
    poly.active = true;

    stateData.poly = poly;

    return 'addPolyPoints';
  }

  return 'selectPolyPlane';
}

function doAddPolyPoints() {
  createGeometry();
  refreshScene();

  if (mouse.left === 'down') {
    // add point to selected plane
    raycaster.setFromCamera(mouse, camera);
    var intersect = stateData.poly.plane.intersect(raycaster.ray);
    
    if (intersect === undefined || intersect.distance > 100000) return 'addPolyPoints';

    var vert = new Vertex();
    vert.position = intersect.position;

    stateData.poly.addVertex(vert);

    return 'addPolyPoints';
  }

  if (mouse.right === 'down') {
    stateData.poly.active = false;
    return 'reset';
  }

  return 'addPolyPoints';
}

function doSelectExtrudePoly() {
    if (mouse.left === 'down') {
        var face = selectNearestFace();

        if (face !== undefined) {
          stateData.extrusion = new Extrusion(face, csgmodes.union, 20.0);

          return "selectExtrudeDistance";
        }
    }

    if (mouse.right === 'down') {
        // create extrusions
        return "reset";
    }

    return "selectExtrudePoly";
}

function doSelectExtrudeDistance() {
  if (keys.one) {
    stateData.extrusion.csgmode = csgmodes.union;
    materials.active = materials.union;
  }
  if (keys.two) {
    stateData.extrusion.csgmode = csgmodes.difference;
    materials.active = materials.cut;
  }
  if (keys.three) {
    materials.active = materials.union;
    stateData.extrusion.csgmode = csgmodes.intersect;
  }

  createGeometry();
  refreshScene();

  raycaster.setFromCamera(mouse, camera);

  var ray = raycaster.ray;
  var centroid = stateData.extrusion.base.centroid();
  var normal = stateData.extrusion.normal;

  var vecPerp = antiprojectVector(normal, ray.direction);

  var newPlane = new Plane(vecPerp, vecPerp.dot(centroid));
  var intersect = newPlane.intersect(ray);

  if (intersect !== undefined) {
    var d = intersect.position.dot(normal.normalize());
    stateData.extrusion.update(d);
  }

  if (mouse.left === 'down' && !mouse.moved) {
    // finalize extrusion
    return "previewExtrude"
  }

  // update extrusion

  return "selectExtrudeDistance";
}

function doPreviewExtrude() {
    if (mouse.left === 'up' && !mouse.moved) {
        // add extrusion to mesh
        applyOperation(stateData.extrusion);

        return "reset";
    }

    if (mouse.right === "down") {
        return "reset";
    }

    return "previewExtrude";
}

function doSelectRevolvePoly() {
  if (mouse.left === 'down') {
        var face = selectNearestFace();

        if (face !== undefined) {
          stateData.face = face;

          createGeometry();
          refreshScene();

          return "selectRevolveAxis";
        }
    }

    if (mouse.right === 'down') {
        // create extrusions
        return "reset";
    }

    return "selectRevolvePoly";
}

function doSelectRevolveAxis() {
  if (mouse.left === 'down') {
    var axis = selectNearestAxis();

    axis = Revolution.verifyAxis(stateData.face, axis);

    if (axis === undefined) return 'selectRevolveAxis';

    //var axis = new THREE.Ray(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));

    stateData.revolution = new Revolution(stateData.face, axis, csgmodes.union);

    createGeometry();
    refreshScene();

    return 'previewRevolve';
  }

  return 'selectRevolveAxis';
}

function doPreviewRevolve() {
  if (mouse.left === 'down') {
    applyOperation(stateData.revolution);

    createGeometry();
    refreshScene();

    return 'reset';
  }
  return 'previewRevolve';
}

//----------------------------------------
// SELECTION
//----------------------------------------

// modified from assignment 2
function selectNearestFace() {
  raycaster.setFromCamera( mouse, camera );
  var ray  = raycaster.ray;

  // raycast against faces
  var nearest, nearestDist;

  for (var f = 0; f < geometries.polys.length; f++) {
    var poly = geometries.polys[f];

    for (var i = 0; i < poly.triangles.length; i++) {
      var triangle = poly.triangles[i];

      var v1 = poly.verts[triangle[0]].position;
      var v2 = poly.verts[triangle[1]].position;
      var v3 = poly.verts[triangle[2]].position;

      var t = triangleIntersection(v1, v2, v3, ray);

      if ( t !== null ) {
        if ( !nearestDist || t < nearestDist ) {
          nearestDist = t;
          nearest = geometries.polys[f];
        }
      }
    }
  }

  if (nearest !== undefined) {
    nearest.selected = !nearest.selected;
  }

  return nearest;
}

function selectNearestAxis() {
  raycaster.setFromCamera( mouse, camera );
  var ray  = raycaster.ray;

  for (var f = 0; f < geometries.polys.length; f++) {
    var face = geometries.polys[f];

    // yeah it checks each edge 2x, but deal with it :D
    for (var i = 0; i < face.verts.length; i++) {
      var v1 = face.verts[i].position;
      var v2 = face.verts[(i + 1) % face.verts.length].position;

      var dSq = ray.distanceSqToSegment(v1, v2);

      var lenSq = v2.clone().sub(v1).lengthSq();

      // selection distance scales with edge length
      if (dSq < 0.001 * lenSq) {
        return new THREE.Ray(v1.clone(),
                             v2.clone().sub(v1).normalize());
      }
    }
  }

  return undefined;
}

//----------------------------------------
// CALLBACKS
//----------------------------------------

var mouse = {
  down: {
    x: 0.0,
    y: 0.0,
  },
  x: 0.0,
  y: 0.0,
  left: 'none',
  right: 'none',
  moved: false
};

var keys = {
  w: false,
  a: false,
  s: false,
  d: false,

  one: false,
  two: false,
  three: false,
  four: false,
  five: false,
};

var keysLast = {};

function saveLastKeys() {
  for (key in keys) keysLast[key] = keys[key];
}

saveLastKeys();

// document.onmousedown
function onMouseDown(e) {
  mouse.x = ( event.clientX / window.innerWidth  ) *  2 - 1;
  mouse.y = ( event.clientY / window.innerHeight ) * -2 + 1;

  mouse.down.x = ( event.clientX / window.innerWidth  ) *  2 - 1;
  mouse.down.y = ( event.clientY / window.innerHeight ) * -2 + 1;

  if (e.button === 0) mouse.left  = 'down';
  if (e.button === 2) mouse.right = 'down';

  mouse.moved = false;

  updateState();
  render();
}
document.onmousedown = onMouseDown;

// document.onmouseup
function onMouseUp(e) {
  mouse.x = ( event.clientX / window.innerWidth  ) *  2 - 1;
  mouse.y = ( event.clientY / window.innerHeight ) * -2 + 1;

  if (e.button === 0) mouse.left  = 'up';
  if (e.button === 2) mouse.right = 'up';

  mouse.moved = Math.abs(mouse.x - mouse.down.x) +
                Math.abs(mouse.y - mouse.down.y) > 4 ;

  updateState();
  render();
}
document.onmouseup = onMouseUp;

// document.onmousemove
function onMouseMove(e) {
  mouse.x = ( event.clientX / window.innerWidth  ) *  2 - 1;
  mouse.y = ( event.clientY / window.innerHeight ) * -2 + 1;

  if (mouse.left  === 'down') mouse.left = 'press';
  if (mouse.right === 'down') mouse.left = 'press';

  if (mouse.left  === 'up') mouse.left = 'none';
  if (mouse.right === 'up') mouse.left = 'none';

  updateState();
  render();
}
document.onmousemove = onMouseMove;


function onKeyDown(e) {
  saveLastKeys();

  switch (e.which) {
    case 119: keys.w = true; break;
    case  97: keys.a = true; break;
    case 115: keys.s = true; break;
    case 100: keys.d = true; break;

    case 49: keys.one = true; break;
    case 50: keys.two = true; break;
    case 51: keys.three = true; break;
    case 52: keys.four = true; break;
    case 53: keys.five = true; break;
  }
}
document.onkeydown = onKeyDown;

function onKeyUp(e) {
  saveLastKeys();

  switch (e.which) {
    case 119: keys.w = false; break;
    case  97: keys.a = false; break;
    case 115: keys.s = false; break;
    case 100: keys.d = false; break;

    case 49: keys.one = false; break;
    case 50: keys.two = false; break;
    case 51: keys.three = false; break;
    case 52: keys.four = false; break;
    case 53: keys.five = false; break;
  }
}
document.onkeyup = onKeyUp;

//----------------------------------------
// UTILITY
//----------------------------------------

// copied from assignment 2
var triangleIntersection = function ( v1, v2, v3, ray ) {
    var e1, e2;  //Edge1, Edge2
    var P, Q, T;
    var det, inv_det, u, v;
    var t;

    //Find vectors for two edges sharing V1
    e1 = new THREE.Vector3();
    e1.subVectors( v2, v1 );
    e2 = new THREE.Vector3();
    e2.subVectors( v3, v1);

    //Begin calculating determinant - also used to calculate u parameter
    P = new THREE.Vector3();
    P.crossVectors( ray.direction, e2 );

    //if determinant is near zero, ray lies in plane of triangle
    det = e1.dot( P );
    //NOT CULLING

    if ( det > -0.000001 && det < 0.000001 ) return null;
    inv_det = 1.0 / det;

    //calculate distance from V1 to ray origin
    T = new THREE.Vector3();
    T.subVectors(ray.origin, v1);// SUB(T, O, V1);

    //Calculate u parameter and test bound
    u = T.dot(P) * inv_det;

    //The intersection lies outside of the triangle
    if( u < 0 || u > 1 ) return null;

    //Prepare to test v parameter
    Q = new THREE.Vector3();
    Q.crossVectors( T, e1 );


    //Calculate V parameter and test bound
    v = ray.direction.dot( Q ) * inv_det;

    //The intersection lies outside of the triangle
    if( v < 0 || u + v  > 1 ) return null;

    t = e2.dot(Q) * inv_det;

    if ( t > 0.000001 ) { //ray intersection
        return t;
    }

    // No hit, no win
    return null;
}