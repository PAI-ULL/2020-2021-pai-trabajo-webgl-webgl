/**
 * Universidad de La Laguna
 * Escuela Superior de Ingeniería y Tecnología
 * Grado en Ingeniería Informática
 * Programación de Aplicaciones Interactivas
 *
 * @author Eric Shepherd
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
    },
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
    0, 1, 2, 0, 2, 3, // Frontal
    4, 5, 6, 4, 6, 7, // Posterior
    8, 9, 10, 8, 10, 11, // Superior
    12, 13, 14, 12, 14, 15, // Inferior
    16, 17, 18, 16, 18, 19, // Derecha
    20, 21, 22, 20, 22, 23, // Izquierda
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
  IMAGE.onload = function() {
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
 * @return {Boolean} Retorna true o false dependiendo si es potencia
 * de dos o no.
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
 */
function drawScene(context, programInfo, buffers, texture, deltaTime) {
  context.clearColor(0.0, 0.0, 0.0, 1.0);
  context.clearDepth(1.0);
  context.enable(context.DEPTH_TEST);
  context.depthFunc(context.LEQUAL);

  // Limpiamos el lienzo antes de dibuja en él
  context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);


  /**
   * Creamos una matriz especial que se utiliza para simular la distorsión
   * de la perspectiva de una cámara.
   */
  const FIELD_OF_VIEW = 45 * Math.PI / 180;
  const ASPECT = context.canvas.clientWidth / context.canvas.clientHeight;
  const Z_NEAR = 0.1;
  const Z_FAR = 100.0;
  const PROJECTION_MATRIX = mat4.create();

  mat4.perspective(PROJECTION_MATRIX, FIELD_OF_VIEW, ASPECT, Z_NEAR, Z_FAR);

  // Establece la posición del dibujo en el centro de la escena.
  const MODEL_VIEW_MATRIX = mat4.create();

  /**
   * Ahora movemos la posicion del dibujo a donde queremos empezar a pintar el
   * cuadrado.
   */

  // Destino matriz, Matriz a trasladar, Cantidad a trasladar
  mat4.translate(MODEL_VIEW_MATRIX, MODEL_VIEW_MATRIX, [-0.0, 0.0, -6.0]);

  /**
   * Destino matriz, Matriz a trasladar, Cantidad a rotar en radianes,
   * Rotando alrededor del eje Z
   */
  mat4.rotate(MODEL_VIEW_MATRIX, MODEL_VIEW_MATRIX, cubeRotation,
      [0, 0, 1]);

  /**
   * Destino matriz, Matriz a trasladar, Cantidad a rotar en radianes,
   * Rotando alrededor del eje X
   */
  mat4.rotate(MODEL_VIEW_MATRIX, MODEL_VIEW_MATRIX, cubeRotation * .7,
      [0, 1, 0]);

  /**
   * Le decimos a WebGL cómo extraer las posiciones del búfer de posición en el
   * atributo vertexPosition.
   */
  {
    const NUM_COMPONENTS = 3;
    const TYPE = context.FLOAT;
    const NORMALIZE = false;
    const STRIDE = 0;
    const OFFSET = 0;
    context.bindBuffer(context.ARRAY_BUFFER, buffers.position);
    context.vertexAttribPointer(programInfo.attribLocations.vertexPosition,
        NUM_COMPONENTS, TYPE, NORMALIZE, STRIDE, OFFSET);
    context.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  /**
   * Le decimos a WebGL cómo extraer las coordenadas de textura del búfer de
   * coordenadas de la textura en el atributo textureCoord
   */
  {
    const NUM_COMPONENTS = 2;
    const TYPE = context.FLOAT;
    const NORMALIZE = false;
    const STRIDE = 0;
    const OFFSET = 0;
    context.bindBuffer(context.ARRAY_BUFFER, buffers.textureCoord);
    context.vertexAttribPointer(programInfo.attribLocations.textureCoord,
        NUM_COMPONENTS, TYPE, NORMALIZE, STRIDE, OFFSET);
    context.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
  }

  // Le decimos a webGL que índices usar para indexar los vértices
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Le decimos a webGL que utilize nuestro programa de dibujar
  context.useProgram(programInfo.program);

  // Establecemos los uniformes del sombreado
  context.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,
      false, PROJECTION_MATRIX);
  context.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,
      false, MODEL_VIEW_MATRIX);

  // Le decimos webGL que queremos utilizar la textura 0
  context.activeTexture(context.TEXTURE0);

  // Vincula la textura a la unidad de textura 0
  context.bindTexture(context.TEXTURE_2D, texture);

  // Le decimos al sombreado que se aplique sobre la textura 0s
  context.uniform1i(programInfo.uniformLocations.uSampler, 0);

  {
    const VERTEX_COUNT = 36;
    const TYPE = context.UNSIGNED_SHORT;
    const OFFSET = 0;
    context.drawElements(context.TRIANGLES, VERTEX_COUNT, TYPE, OFFSET);
  }

  // Actualiza la rotación para el próximo dibujo
  cubeRotation += deltaTime;
}

/**
 * Inicializa el programa de sombreado para que WebGL sepa como dibujar nuestros
 * datos.
 * @param {Object} context Contiene el contexto sobre el que estamos trabajando.
 * @param {Object} vsSource Contiene el código del sombreado de los vértices.
 * @param {Object} fsSource Contiene el código del sombreado de los fragmentos.
 * @return {Object} Retorna el programa sombreado.
 */
function initShaderProgram(context, vsSource, fsSource) {
  const VERTEX_SHADER = loadShader(context, context.VERTEX_SHADER, vsSource);
  const FRAGMENTE_SHADER = loadShader(context,
      context.FRAGMENT_SHADER, fsSource);

  // Crea el programa de sombreado
  const SHADER_PROGRAM = context.createProgram();
  context.attachShader(SHADER_PROGRAM, VERTEX_SHADER);
  context.attachShader(SHADER_PROGRAM, FRAGMENTE_SHADER);
  context.linkProgram(SHADER_PROGRAM);

  // Si la creación del programa de sombreado fallo, hacemos una alerta
  if (!context.getProgramParameter(SHADER_PROGRAM, context.LINK_STATUS)) {
    alert('No se puede incializar el programa de sombreado: ' +
      context.getProgramInfoLog(SHADER_PROGRAM));
    return null;
  }
  return SHADER_PROGRAM;
}

/**
 * Función que crea un sombreado del tipo dado, carga la fuente y lo compila.
 * @param {Object} context Contiene el contexto sobre el que estamos trabjando.
 * @param {Object} type Contiene VERTEX_SHADER ó FRAGMENT_SHADER.
 * @param {Object} source Contiene el código fuente.
 * @return {Object} Retorna el sombreado.
 */
function loadShader(context, type, source) {
  const SHADER = context.createShader(type);

  // Envía el código fuente al objeto sombreado
  context.shaderSource(SHADER, source);

  // Compila el programa sombreado
  context.compileShader(SHADER);

  // Comprobamos si compiló correctamente
  if (!context.getShaderParameter(SHADER, context.COMPILE_STATUS)) {
    alert('Se produjo un error al compilar los sombreados: ' +
      context.getShaderInfoLog(SHADER));
    context.deleteShader(SHADER);
    return null;
  }
  return SHADER;
}

main();
