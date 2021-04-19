/**
 * Universidad de La Laguna
 * Escuela Superior de Ingeniería y Tecnología
 * Grado en Ingeniería Informática
 * Programación de Aplicaciones Interactivas
 *
 * @author Eduardo Expósito Barrera
 * @author Cristo García González
 * @date 18 Abr 2021
 * @brief Ejemplo de cubo con WebGL.
 *
 * @see https://es.wikipedia.org/wiki/WebGL
 *
 */

'use strict';

let cubeRotation = 0.0;

/**
 * Función principal del programa.
 */
function main() {
  const CANVAS = document.querySelector('#cubo-canvas');
  const CONTEXT = CANVAS.getContext('webgl');

  // Si no existe un contexto nos paramos en este punto
  if (!CONTEXT) {
    alert('No se puede inicializar WebGL. Es posible que su navegador o' +
      'máquina no lo admita.');
    return;
  }

  // Programa de sombreado de vértices
  const VS_SOURCE = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Programa de sombreado de fragmentos
  const FS_SOURCE = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  /**
   * Inicializamos el programa de sombreados. En este punto, es donde se
   * establece la iluminación de los vértices, etc.
   */
  const SHADER_PROGRAM = initShaderProgram(CONTEXT, VS_SOURCE, FS_SOURCE);

  /**
   * Recopila toda la información necesaria para utilizar el programa de
   * sombreado es decir, busca qué atributos hacen falta para nuestro programa
   * y las ubicaciones uniformes.
   */
  const PROGRAM_INFO = {
    program: SHADER_PROGRAM,
    attribLocations: {
      vertexPosition:
        CONTEXT.getAttribLocation(SHADER_PROGRAM, 'aVertexPosition'),
      textureCoord: CONTEXT.getAttribLocation(SHADER_PROGRAM, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix:
        CONTEXT.getUniformLocation(SHADER_PROGRAM, 'uProjectionMatrix'),
      modelViewMatrix:
        CONTEXT.getUniformLocation(SHADER_PROGRAM, 'uModelViewMatrix'),
      uSampler: CONTEXT.getUniformLocation(SHADER_PROGRAM, 'uSampler'),
    }
  };

  /**
   * Aquí es donde se llama a la rutina que construirá todos los objetos que
   * vamos a dibujar.
   */
  const BUFFERS = initBuffers(CONTEXT);

  // Cargamos la texturo que vamos a utilizar
  const TEXTURA = loadTexture(CONTEXT, '../images/textura-cubo.png');

  let then = 0;

  /**
   * Función que dibuja la escena repetidamente.
   * @param {Number} now Contiene el tiempo actual
   */
  function render(now) {
    // Convierte a segundos
    now *= 0.001;
    const DELTA_TIME = now - then;
    then = now;

    drawScene(CONTEXT, PROGRAM_INFO, BUFFERS, TEXTURA, DELTA_TIME);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/**
 * Función que se encarga de inicializa los buffers que necesitaremos. En este
 * caso, un cubo tridimensional.
 * @param {Object} context Contiene el contexto sobre el que estamos trabajando
 * @return {Object} Retorna la información del buffer.
 */
function initBuffers(context) {

  // Crea un buffer para las posiciones de los vértices del cubo.
  const POSITION_BUFFER = context.createBuffer();

  /**
   * Seleccionamos la posición del buffer con la que se aplicarán las
   * operaciones de aquí en adelante.
   */
  context.bindBuffer(context.ARRAY_BUFFER, POSITION_BUFFER);

  // Creamos una matriz de posiciones para el cubo
  const POSITIONS = [
    // Cara frontal
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,

    // Cara tracera
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    // Cara superior
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,

    // Cara inferior
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    // Cara derecha
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,

    // Cara izquierda
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
  ];

  /**
   * Ahora pasamos la lista de posiciona a WebGL para construir la forma del
   * cubo. Hacemos esto creando un Float32Array a partir de la matriz de
   * Javascript. Luego lo usamos para rellenar el buffer actual.
   */
  context.bufferData(context.ARRAY_BUFFER, new Float32Array(POSITIONS),
    context.STATIC_DRAW);

  // Ahora configuramos las coordenadas de las caras para la textura
  const TEXTURE_COORD_BUFFER = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, TEXTURE_COORD_BUFFER);

  const TEXTURE_COORDINATES = [
    // Frontal
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Posterior
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Superior
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Inferior
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Derecha
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Izquierda
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];

  context.bufferData(context.ARRAY_BUFFER,
    new Float32Array(TEXTURE_COORDINATES), context.STATIC_DRAW);

  /**
   * Construye el búfer con la matriz de elementos. En ella se especifican los
   * índices de los vértices de cada cara.
   */
  const INDEX_BUFFER = context.createBuffer();
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, INDEX_BUFFER);

  /**
   * En esta matriz se definen las cara como dos triángulos, usando los índices
   * de la matriz de vértices para especificar la posición de cada triángulo.
   */
  const INDICES = [
    0, 1, 2, 0, 2, 3,    // Frontal
    4, 5, 6, 4, 6, 7,    // Posterior
    8, 9, 10, 8, 10, 11,   // Superior
    12, 13, 14, 12, 14, 15,   // Inferior
    16, 17, 18, 16, 18, 19,   // Derecha
    20, 21, 22, 20, 22, 23,   // Izquierda
  ];

  // Ahora enviámos la matriz de elementos al contexto
  context.bufferData(context.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(INDICES), context.STATIC_DRAW);

  return {
    position: POSITION_BUFFER,
    textureCoord: TEXTURE_COORD_BUFFER,
    indices: INDEX_BUFFER,
  };
}

/**
 * Función que carga la textura especificada.
 * @param {Object} context Contiene el contexto sobre el que se está trabajando.
 * @param {String} url Contiene la dirección de la textura que desea cargar.
 * @return {Object} Retorna la textura cargada.
 */
function loadTexture(context, url) {
  const TEXTURE = context.createTexture();
  context.bindTexture(context.TEXTURE_2D, TEXTURE);

  /**
   * Debido a que las imágenes deben descargarse de a través de Internet, esto
   * hace que tarden en cargarse. Por el momento ponemos un sólo pixel en la
   * textura para que podamos usarlo de inmediato y cuando se complete la
   * descarga acutalizamos la textura con el contenido de la imagen.
   */
  const LEVEL = 0;
  const INTERNAL_FORMAT = context.RGBA;
  const WIDTH = 1;
  const HEIGHT = 1;
  const BORDER = 0;
  const SRC_FORMAT = context.RGBA;
  const SRC_TYPE = context.UNSIGNED_BYTE;
  const PIXEL = new Uint8Array([0, 0, 255, 255]);
  context.texImage2D(context.TEXTURE_2D, LEVEL, INTERNAL_FORMAT, WIDTH, HEIGHT,
    BORDER, SRC_FORMAT, SRC_TYPE, PIXEL);

  const IMAGE = new Image();
  IMAGE.onload = function () {
    context.bindTexture(context.TEXTURE_2D, TEXTURE);
    context.texImage2D(context.TEXTURE_2D, LEVEL, INTERNAL_FORMAT,
      SRC_FORMAT, SRC_TYPE, IMAGE);

    /**
     * WebGL tiene diferente requisitos para las imágene con potencia de 2. Para
     * ello, debemos comprobar si la imagen tiene potencia de 2 en ambas
     * dimensiones.
     */
    if (isPowerOf2(IMAGE.WIDTH) && isPowerOf2(IMAGE.HEIGHT)) {
      // Si es potencia de 2, generamos el mapa.
      context.generateMipmap(context.TEXTURE_2D);
    } else {
      // No es potencia de 2, giramos el mapa
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S,
        context.CLAMP_TO_EDGE);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T,
        context.CLAMP_TO_EDGE);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER,
        context.LINEAR);
    }
  };
  IMAGE.src = url;

  return TEXTURE;
}

/**
 * Función que comprueba si es potencia de dos.
 * @param {Number} value Contiene el valor que se desea comprobar
 * @return {Boolean} Retorna true o false dependiendo si es potencia de dos o no.
 */
function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

/**
 * Función que dibuja la escena.
 * @param {Object} context Contiene el contexto con el que se está trabajando.
 * @param {Object} programInfo Contiene la información del progrma.
 * @param {Object} buffers Contiene el conjuntoo de buffers.
 * @param {Object} texture Contiene la textura cargada.
 * @param {Number} deltaTime Contiene el tiempo.
**/
 function drawScene(gl, programInfo, buffers, texture, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
    modelViewMatrix,     // matrix to translate
    [-0.0, 0.0, -6.0]);  // amount to translate
  mat4.rotate(modelViewMatrix,  // destination matrix
    modelViewMatrix,  // matrix to rotate
    cubeRotation,     // amount to rotate in radians
    [0, 0, 1]);       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix,  // destination matrix
    modelViewMatrix,  // matrix to rotate
    cubeRotation * .7,// amount to rotate in radians
    [0, 1, 0]);       // axis to rotate around (X)

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the texture coordinates from
  // the texture coordinate buffer into the textureCoord attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoord,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.textureCoord);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);

  // Specify the texture to map onto the faces.

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw

  cubeRotation += deltaTime;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, VSSOURCE, FSSOURCE) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, VSSOURCE);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, FSSOURCE);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

/**
 * Función que crea un sombreado del tipo dado, carga la fuente y lo compila.
 * @param {Object} context Contiene el contexto sobre el que estamos trabjando.
 * @param {*} type
 * @param {*} source
 * @return {Object} Retorna el sombreado.
 */
function loadShader(context, type, source) {
  const SHADER = context.createShader(type);

  // Send the source to the shader object

  context.shaderSource(SHADER, source);

  // Compile the shader program

  context.compileShader(SHADER);

  // See if it compiled successfully

  if (!context.getShaderParameter(SHADER, context.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' +
      context.getShaderInfoLog(SHADER));
    context.deleteShader(SHADER);
    return null;
  }
  return SHADER;
}

main();
