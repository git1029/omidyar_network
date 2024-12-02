const vertexShader = /*glsl*/ `
  varying vec2 vUv;
  varying vec3 vPos;
  uniform float PI;
  uniform float uTime;
  varying float y;
  varying float id;

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  vec2 proj(vec3 p) {
    // camera position
    vec3 cp = vec3(0., 0., 20.307436087194); // 10

    float X = p.x - cp.x;
    float Y = p.y - cp.y;
    float Z = p.z - cp.z;

    // camera rotation
    vec3 cr = vec3(0., 0., PI);

    float Cx = cos(cr.x); // cos(θx)
    float Cy = cos(cr.y); // cos(θy)
    float Cz = cos(cr.z); // cos(θz)

    float Sx = sin(cr.x); // cos(θx)
    float Sy = sin(cr.y); // cos(θy)
    float Sz = sin(cr.z); // cos(θz)

    vec3 D = vec3(
      Cy * (Sz * Y + Cz * X) - Sy * Z,
      Sx * (Cy * Z + Sy * (Sz * Y + Cz * X)) + Cx * (Cz * Y + Sz * X),
      Cx * (Cy * Z + Sy * (Sz * Y + Cz * X)) - Sx * (Cz * Y + Sz * X)
    );

    vec3 E = vec3(0., 0., 20.307436087194);

    float x2d = -(E.z / D.z) * D.x - E.x; // Adding WIDTH/2 to center the camera
    float y2d = -(E.z / D.z) * D.y - E.y; // Adding HEIGHT/2 to center the camera

    return vec2(x2d, y2d);
  }

  vec3 rot(vec3 point, vec3 angle) {
    mat3 projection = mat3(
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    );

    mat3 rotationX = mat3(
      1, 0, 0,
      0, cos(angle.x), -sin(angle.x),
      0, sin(angle.x), cos(angle.x)
    );

    mat3 rotationY = mat3(
      cos(angle.y), 0, sin(angle.y),
      0, 1, 0,
      -sin(angle.y), 0, cos(angle.y)
    );

    mat3 rotationZ = mat3(
      cos(angle.z), -sin(angle.z), 0,
      sin(angle.z), cos(angle.z), 0,
      0, 0, 1
    );

    vec3 rotated = rotationY * point;
    rotated = rotationX * rotated;
    rotated = rotationZ * rotated;
    return projection * rotated;
  }

  void main() {
    vec3 pos = position;

    id = float(gl_InstanceID);
    
    vec3 r = rot(vec3(pos.xy, 0.), vec3(0., uTime + id * .1, 0.));
    float fy = map(r.z, -1., 1., 1.5, .5);
    
    y = map(r.z, -1., 1., 0., 1.);
    vUv = uv;
    
    r = rot(vec3(pos.xy, 0.), vec3(0., uTime + id * .1, 0.));
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vPos = pos;
  }
`;

export default vertexShader;
