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