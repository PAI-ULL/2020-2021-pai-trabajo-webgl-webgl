const CANVAS = document.querySelector('canvas');
const GL = CANVAS.getContext('webgl');

if (!GL) {
  throw new Error('WebGL');
}

// Create the 3 vertex with its coordinates
const vertexData = [
  0, 1, 0,
  1, -1, 0,
  -1, -1, 0,
];

// Create buffer
const buffer = GL.createBuffer();
// Tell WEBGL bufffer to the current array buffer
GL.bindBuffer(GL.ARRAY_BUFFER, buffer);
// GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertexData), GL.DYNAMIC_DRAW);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertexData), GL.STATIC_DRAW);

// VERTEX SHADER
// #version 300
const vertexShader = GL.createShader(GL.VERTEX_SHADER);
GL.shaderSource(vertexShader, `
attribute vec3 position;
void main() {
  gl_Position = vec4(position, 1);
}
`);
GL.compileShader(vertexShader);

// FRAGMENT SHADER
// #version 300
const fragmentShader = GL.createShader(GL.FRAGMENT_SHADER);
GL.shaderSource(fragmentShader, `
void main() {
  gl_FragColor = vec4(1, 0, 0, 1);
}
`);
GL.compileShader(fragmentShader);

GL.drawArrays(GL.TRIANGLES, 0, 3);
