geometry {
    planes: {}
    sketches: {}
    polygons: {}
}

plane {
    normal: Vector
    d : 0.0
}

sketch {
    plane
    transform
    polygons: {}
    edit: true|false
}

polygon {
    points: {}
}

extrusion {
    polygons: {}
    distance: 1.0
    edit: true|false
}

revolution {
    polygons: {}
    axis: Vector
    resolution: 16.0
    angle: undefined
    edit: true|false
}

model {
    
}

triangles = {}

plane = createPlane(point, normal)
        createPlane(polygon)
        createPlane(line, line)
        createPlane(line, normal)

