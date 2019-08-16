"use strict";

/* global THREE, dat */

var geometry;
var renderer;
var camera;
var scene;
var helper;
var mesh_cubo;
var vhn;
var cameraHelper;
var gui;
var controls;
var controls2;



function main() {
  const canvas = document.querySelector("#scene");
  const view1Elem = document.querySelector("#view1");
  const view2Elem = document.querySelector("#view2");
  renderer = new THREE.WebGLRenderer({ canvas });

  const size = 1;
  const near = 5;
  const far = 50;
  camera = new THREE.OrthographicCamera(
    -size,
    size,
    size,
    -size,
    near,
    far
  );
  camera.zoom = 0.2;
  camera.position.set(8, 2, 10);

  cameraHelper = new THREE.CameraHelper(camera);
  //Classe auxiliar para ajudar a definir o zoom max e o zoom min
  class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
      this.minDif = minDif;
    }
    get min() {
      return this.obj[this.minProp];
    }
    set min(v) {
      this.obj[this.minProp] = v;
      this.obj[this.maxProp] = Math.max(
        this.obj[this.maxProp],
        v + this.minDif
      );
    }
    get max() {
      return this.obj[this.maxProp];
    }
    set max(v) {
      this.obj[this.maxProp] = v;
      this.min = this.min; // this will call the min setter
    }
  }

  gui = new dat.GUI();
  gui.add(camera, "zoom", 0.01, 1, 0.01).listen();
  const minMaxGUIHelper = new MinMaxGUIHelper(camera, "near", "far", 0.1);
  gui.add(minMaxGUIHelper, "min", 0.1, 50, 0.1).name("near");
  gui.add(minMaxGUIHelper, "max", 0.1, 50, 0.1).name("far");

  //Habilitando controles para a camera 1
  controls = new THREE.OrbitControls(camera, view1Elem);
  controls.target.set(0, 0, 0);
  controls.update();

  const camera2 = new THREE.PerspectiveCamera(
    60, // fov
    2, // aspect
    0.1, // near
    500 // far
  );
  camera2.position.set(16, 28, 40);
  camera2.lookAt(0, 0, 0);

  controls2 = new THREE.OrbitControls(camera2, view2Elem);
  controls2.target.set(0, 5, 0);
  controls2.update();

  scene = new THREE.Scene();
  scene.background = new THREE.Color("black");
  scene.add(cameraHelper);

 
  {
    geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(0, 0,  0),  // 0
      new THREE.Vector3(1, 0,  0),  // 1
      new THREE.Vector3(0, 1,  0),  // 2
      new THREE.Vector3(1, 1,  0),  // 3
      new THREE.Vector3(0, 0,  1),  // 4
      new THREE.Vector3(1, 0,  1),  // 5
      new THREE.Vector3(0, 1,  1),  // 6
      new THREE.Vector3(1, 1,  1),  // 7
    );

    geometry.faces.push(
      // front
      new THREE.Face3(0, 3, 2),
      new THREE.Face3(0, 1, 3),
      // right
      new THREE.Face3(1, 7, 3),
      new THREE.Face3(1, 5, 7),
      // back
      new THREE.Face3(5, 6, 7),
      new THREE.Face3(5, 4, 6),
      // left
      new THREE.Face3(4, 2, 6),
      new THREE.Face3(4, 0, 2),
      // top
      new THREE.Face3(2, 7, 6),
      new THREE.Face3(2, 3, 7),
      // bottom
      new THREE.Face3(4, 1, 0),
      new THREE.Face3(4, 5, 1),
   );

    geometry.faces[ 0].color = geometry.faces[ 1].color = new THREE.Color('red');
    geometry.faces[ 2].color = geometry.faces[ 3].color = new THREE.Color('yellow');
    geometry.faces[ 4].color = geometry.faces[ 5].color = new THREE.Color('green');
    geometry.faces[ 6].color = geometry.faces[ 7].color = new THREE.Color('cyan');
    geometry.faces[ 8].color = geometry.faces[ 9].color = new THREE.Color('blue');
    geometry.faces[10].color = geometry.faces[11].color = new THREE.Color('magenta');


    const material = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors});
    geometry.verticesNeedUpdate = true;
    mesh_cubo = new THREE.Mesh(geometry, material);
    mesh_cubo.position.set(0, 0, 0);
    mesh_cubo.material.side = THREE.BackSide;

    var axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );
    scene.add(mesh_cubo);
  }
 

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function setScissorForElement(elem) {
    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();

    // compute a canvas relative rectangle
    const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
    const left = Math.max(0, elemRect.left - canvasRect.left);
    const bottom =
      Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
    const top = Math.max(0, elemRect.top - canvasRect.top);

    const width = Math.min(canvasRect.width, right - left);
    const height = Math.min(canvasRect.height, bottom - top);

    // setup the scissor to only render to that part of the canvas
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);

    // return the aspect
    return width / height;
  }

  function render() {
    resizeRendererToDisplaySize(renderer);

    // turn on the scissor
    renderer.setScissorTest(true);

    // render the original view
    {
      const aspect = setScissorForElement(view1Elem);

      // update the camera for this aspect
      camera.left = -aspect;
      camera.right = aspect;
      camera.updateProjectionMatrix();
      cameraHelper.update();

      // don't draw the camera helper in the original view
      cameraHelper.visible = false;

      scene.background.set(0x000000);
      renderer.render(scene, camera);
    }

    // render from the 2nd camera
    {
      const aspect = setScissorForElement(view2Elem);

      // update the camera for this aspect
      camera2.aspect = aspect;
      camera2.updateProjectionMatrix();

      // draw the camera helper in the 2nd view
      cameraHelper.visible = true;

      scene.background.set(0x000040);
      renderer.render(scene, camera2);
    }

    requestAnimationFrame(render);

    geometry.verticesNeedUpdate = true;
    updatePontoVista();
  }

 function updatePontoVista(){
    document.getElementById("ponto_vista_x").innerHTML = camera.position.x.toFixed(2);
    document.getElementById("ponto_vista_y").innerHTML = camera.position.y.toFixed(2);
    document.getElementById("ponto_vista_z").innerHTML = camera.position.z.toFixed(2);
  }

  requestAnimationFrame(render);
}


function updateTodosDados(){
  updatePlanoProjecao();
  updateVerticesObjeto();
  updateNormal();
  updateDD0D1();
  updateMatrizPerspectiva();
  updateMatrizProjecao();
  updateMatrizHomogenea();
  updateMatrizCartesiana();
  updateMatrizJanelaViewport();
  updateMatrizDispositivoTruncadas();
}

function atualizarPontoDeVista(){
  let x = document.getElementById("input_ponto_vista_x").value;
  let y = document.getElementById("input_ponto_vista_y").value;
  let z = document.getElementById("input_ponto_vista_z").value;
  camera.position.set(x, y, z);
  controls.update();
  ponto_vista = get_ponto_vista(x, y, z);


  calcularMatrizes();
  updateTodosDados();

}

function atualizarDispositivo(){
  Umax = document.getElementById("dispositivoH").value;
  Vmax = document.getElementById("dispositivoV").value;

  calcularMatrizes();
  updateTodosDados();
}

function atualizarPlanoProjecao(){
  //PEGA VALORES PARA R0
  let r0_x = document.getElementById("r0_x").innerHTML;
  let r0_y = document.getElementById("r0_y").innerHTML;
  let r0_z = document.getElementById("r0_z").innerHTML;

  let p1_x = document.getElementById("p1_x").innerHTML;
  let p1_y = document.getElementById("p1_y").innerHTML;
  let p1_z = document.getElementById("p1_z").innerHTML;

  let p2_x = document.getElementById("p2_x").innerHTML;
  let p2_y = document.getElementById("p2_y").innerHTML;
  let p2_z = document.getElementById("p2_z").innerHTML;

  let p3_x = document.getElementById("p3_x").innerHTML;
  let p3_y = document.getElementById("p3_y").innerHTML;
  let p3_z = document.getElementById("p3_z").innerHTML;

  plano_projecao = get_plano_projecao(
    { x: r0_x || 0, y: r0_y || 0, z: r0_z || 0 }, //r0
    { x: p1_x || 0, y: p1_y || 0, z: p1_z || 0 }, //p1
    { x: p2_x || 0, y: p2_y || 0, z: p2_z || 0 }, //p2
    { x: p3_x || 0, y: p3_y || 0, z: p3_z || 0 } //p3
  );

  calcularMatrizes();
  updateTodosDados();

}

function atualizarVerticesObjeto() {
  let vertices = [[], [], []];

  vertices[0][0] = document.getElementById("verticeX[0]").innerHTML;
  vertices[0][1] = document.getElementById("verticeX[1]").innerHTML;
  vertices[0][2] = document.getElementById("verticeX[2]").innerHTML;
  vertices[0][3] = document.getElementById("verticeX[3]").innerHTML;
  vertices[0][4] = document.getElementById("verticeX[4]").innerHTML;
  vertices[0][5] = document.getElementById("verticeX[5]").innerHTML;
  vertices[0][6] = document.getElementById("verticeX[6]").innerHTML;
  vertices[0][7] = document.getElementById("verticeX[7]").innerHTML;
  vertices[1][0] = document.getElementById("verticeY[0]").innerHTML;
  vertices[1][1] = document.getElementById("verticeY[1]").innerHTML;
  vertices[1][2] = document.getElementById("verticeY[2]").innerHTML;
  vertices[1][3] = document.getElementById("verticeY[3]").innerHTML;
  vertices[1][4] = document.getElementById("verticeY[4]").innerHTML;
  vertices[1][5] = document.getElementById("verticeY[5]").innerHTML;
  vertices[1][6] = document.getElementById("verticeY[6]").innerHTML;
  vertices[1][7] = document.getElementById("verticeY[7]").innerHTML;
  vertices[2][0] = document.getElementById("verticeZ[0]").innerHTML;
  vertices[2][1] = document.getElementById("verticeZ[1]").innerHTML;
  vertices[2][2] = document.getElementById("verticeZ[2]").innerHTML;
  vertices[2][3] = document.getElementById("verticeZ[3]").innerHTML;
  vertices[2][4] = document.getElementById("verticeZ[4]").innerHTML;
  vertices[2][5] = document.getElementById("verticeZ[5]").innerHTML;
  vertices[2][6] = document.getElementById("verticeZ[6]").innerHTML;
  vertices[2][7] = document.getElementById("verticeZ[7]").innerHTML;
 
  for(let i = 0; i < 3; i++)
    for(let j = 0; j< 8; j++)
      dados_objeto.coordenadas_vertice[i][j] = vertices[i][j];


      geometry.vertices.push(
        new THREE.Vector3(0, 0,  0),  // 0
        new THREE.Vector3(1, 0,  0),  // 1
        new THREE.Vector3(0, 1,  0),  // 2
        new THREE.Vector3(1, 1,  0),  // 3
        new THREE.Vector3(0, 0,  1),  // 4
        new THREE.Vector3(1, 0,  1),  // 5
        new THREE.Vector3(0, 1,  1),  // 6
        new THREE.Vector3(1, 1,  1),  // 7
      );

      //ATUALIZANDO VERTICES DO CUBO
      geometry.vertices[0].x = parseFloat(dados_objeto.coordenadas_vertice[0][0]);
      geometry.vertices[0].y = parseFloat(dados_objeto.coordenadas_vertice[1][0]);
      geometry.vertices[0].z = parseFloat(dados_objeto.coordenadas_vertice[2][0]);

      geometry.vertices[1].x = parseFloat(dados_objeto.coordenadas_vertice[0][1]);
      geometry.vertices[1].y = parseFloat(dados_objeto.coordenadas_vertice[1][1]);
      geometry.vertices[1].z = parseFloat(dados_objeto.coordenadas_vertice[2][1]);

      geometry.vertices[2].x = parseFloat(dados_objeto.coordenadas_vertice[0][7]);
      geometry.vertices[2].y = parseFloat(dados_objeto.coordenadas_vertice[1][7]);
      geometry.vertices[2].z = parseFloat(dados_objeto.coordenadas_vertice[2][7]);

      geometry.vertices[3].x = parseFloat(dados_objeto.coordenadas_vertice[0][6]);
      geometry.vertices[3].y = parseFloat(dados_objeto.coordenadas_vertice[1][6]);
      geometry.vertices[3].z = parseFloat(dados_objeto.coordenadas_vertice[2][6]);

      geometry.vertices[4].x = parseFloat(dados_objeto.coordenadas_vertice[0][3]);
      geometry.vertices[4].y = parseFloat(dados_objeto.coordenadas_vertice[1][3]);
      geometry.vertices[4].z = parseFloat(dados_objeto.coordenadas_vertice[2][3]);

      geometry.vertices[5].x = parseFloat(dados_objeto.coordenadas_vertice[0][2]);
      geometry.vertices[5].y = parseFloat(dados_objeto.coordenadas_vertice[1][2]);
      geometry.vertices[5].z = parseFloat(dados_objeto.coordenadas_vertice[2][2]);

      geometry.vertices[6].x = parseFloat(dados_objeto.coordenadas_vertice[0][4]);
      geometry.vertices[6].y = parseFloat(dados_objeto.coordenadas_vertice[1][4]);
      geometry.vertices[6].z = parseFloat(dados_objeto.coordenadas_vertice[2][4]);

      geometry.vertices[7].x = parseFloat(dados_objeto.coordenadas_vertice[0][5]);
      geometry.vertices[7].y = parseFloat(dados_objeto.coordenadas_vertice[1][5]);
      geometry.vertices[7].z = parseFloat(dados_objeto.coordenadas_vertice[2][5]);
  

  geometry.verticesNeedUpdate = true;
}

function centralizarObjeto(){
 // THREE.GeometryUtils.center( geometry );
  mesh_cubo.position.set(0, 0, 0);
}

function transladar(){

  let position_x = document.getElementById("input_transladar_x").value;
  let position_y = document.getElementById("input_transladar_y").value;
  let position_z = document.getElementById("input_transladar_z").value;

  mesh_cubo.position.set(position_x, position_y, position_z);
}


function updateNormal(){
  document.getElementById("normal").innerHTML = ` x: ${normal.nx} y: ${normal.ny} z: ${normal.nz}`;
}

function updateDD0D1(){
  document.getElementById("d0_d1_d").innerHTML = ` d0: ${d0} d1: ${d1} d: ${d}`;
}

function updatePlanoProjecao(){
  document.getElementById("r0_x").innerHTML = plano_projecao.r0.x;
  document.getElementById("r0_y").innerHTML = plano_projecao.r0.y;
  document.getElementById("r0_z").innerHTML = plano_projecao.r0.z;
  document.getElementById("p1_x").innerHTML = plano_projecao.p1.x;
  document.getElementById("p1_y").innerHTML = plano_projecao.p1.y;
  document.getElementById("p1_z").innerHTML = plano_projecao.p1.z;
  document.getElementById("p2_x").innerHTML = plano_projecao.p2.x;
  document.getElementById("p2_y").innerHTML = plano_projecao.p2.y;
  document.getElementById("p2_z").innerHTML = plano_projecao.p2.z;
  document.getElementById("p3_x").innerHTML = plano_projecao.p3.x;
  document.getElementById("p3_y").innerHTML = plano_projecao.p3.y;
  document.getElementById("p3_z").innerHTML = plano_projecao.p3.z;
}

function updateVerticesObjeto(){

  document.getElementById("verticeX[0]").innerHTML = dados_objeto.coordenadas_vertice[0][0];
  document.getElementById("verticeX[1]").innerHTML = dados_objeto.coordenadas_vertice[0][1];
  document.getElementById("verticeX[2]").innerHTML = dados_objeto.coordenadas_vertice[0][2];
  document.getElementById("verticeX[3]").innerHTML = dados_objeto.coordenadas_vertice[0][3];
  document.getElementById("verticeX[4]").innerHTML = dados_objeto.coordenadas_vertice[0][4];
  document.getElementById("verticeX[5]").innerHTML = dados_objeto.coordenadas_vertice[0][5];
  document.getElementById("verticeX[6]").innerHTML = dados_objeto.coordenadas_vertice[0][6];
  document.getElementById("verticeX[7]").innerHTML = dados_objeto.coordenadas_vertice[0][7];

  document.getElementById("verticeY[0]").innerHTML = dados_objeto.coordenadas_vertice[1][0];
  document.getElementById("verticeY[1]").innerHTML = dados_objeto.coordenadas_vertice[1][1];
  document.getElementById("verticeY[2]").innerHTML = dados_objeto.coordenadas_vertice[1][2];
  document.getElementById("verticeY[3]").innerHTML = dados_objeto.coordenadas_vertice[1][3];
  document.getElementById("verticeY[4]").innerHTML = dados_objeto.coordenadas_vertice[1][4];
  document.getElementById("verticeY[5]").innerHTML = dados_objeto.coordenadas_vertice[1][5];
  document.getElementById("verticeY[6]").innerHTML = dados_objeto.coordenadas_vertice[1][6];
  document.getElementById("verticeY[7]").innerHTML = dados_objeto.coordenadas_vertice[1][7];

  document.getElementById("verticeZ[0]").innerHTML = dados_objeto.coordenadas_vertice[2][0];
  document.getElementById("verticeZ[1]").innerHTML = dados_objeto.coordenadas_vertice[2][1];
  document.getElementById("verticeZ[2]").innerHTML = dados_objeto.coordenadas_vertice[2][2];
  document.getElementById("verticeZ[3]").innerHTML = dados_objeto.coordenadas_vertice[2][3];
  document.getElementById("verticeZ[4]").innerHTML = dados_objeto.coordenadas_vertice[2][4];
  document.getElementById("verticeZ[5]").innerHTML = dados_objeto.coordenadas_vertice[2][5];
  document.getElementById("verticeZ[6]").innerHTML = dados_objeto.coordenadas_vertice[2][6];
  document.getElementById("verticeZ[7]").innerHTML = dados_objeto.coordenadas_vertice[2][7];

}


function updateMatrizPerspectiva(){
  //Linha 0
  document.getElementById("matrizPerspectiva[0][0]").innerHTML = matriz_perspectiva[0][0].toFixed(2);
  document.getElementById("matrizPerspectiva[0][1]").innerHTML = matriz_perspectiva[0][1].toFixed(2);
  document.getElementById("matrizPerspectiva[0][2]").innerHTML = matriz_perspectiva[0][2].toFixed(2);
  document.getElementById("matrizPerspectiva[0][3]").innerHTML = matriz_perspectiva[0][3].toFixed(2);

  //LINHA1 0 -5 0 0
  document.getElementById("matrizPerspectiva[1][0]").innerHTML = matriz_perspectiva[1][0].toFixed(2);
  document.getElementById("matrizPerspectiva[1][1]").innerHTML = matriz_perspectiva[1][1].toFixed(2);
  document.getElementById("matrizPerspectiva[1][2]").innerHTML = matriz_perspectiva[1][2].toFixed(2);
  document.getElementById("matrizPerspectiva[1][3]").innerHTML = matriz_perspectiva[1][3].toFixed(2);

  document.getElementById("matrizPerspectiva[2][0]").innerHTML = matriz_perspectiva[2][0].toFixed(2);
  document.getElementById("matrizPerspectiva[2][1]").innerHTML = matriz_perspectiva[2][1].toFixed(2);
  document.getElementById("matrizPerspectiva[2][2]").innerHTML = matriz_perspectiva[2][2].toFixed(2);
  document.getElementById("matrizPerspectiva[2][3]").innerHTML = matriz_perspectiva[2][3].toFixed(2);

  document.getElementById("matrizPerspectiva[3][0]").innerHTML = matriz_perspectiva[3][0].toFixed(2);
  document.getElementById("matrizPerspectiva[3][1]").innerHTML = matriz_perspectiva[3][1].toFixed(2);
  document.getElementById("matrizPerspectiva[3][2]").innerHTML = matriz_perspectiva[3][2].toFixed(2);
  document.getElementById("matrizPerspectiva[3][3]").innerHTML = matriz_perspectiva[3][3].toFixed(2);
}

function updateMatrizProjecao(){
  document.getElementById("matrizProjecao[0][0]").innerHTML = matriz_projecao[0][0].toFixed(2);
  document.getElementById("matrizProjecao[0][1]").innerHTML = matriz_projecao[0][1].toFixed(2);
  document.getElementById("matrizProjecao[0][2]").innerHTML = matriz_projecao[0][2].toFixed(2);
  document.getElementById("matrizProjecao[0][3]").innerHTML = matriz_projecao[0][3].toFixed(2);
  document.getElementById("matrizProjecao[0][4]").innerHTML = matriz_projecao[0][4].toFixed(2);
  document.getElementById("matrizProjecao[0][5]").innerHTML = matriz_projecao[0][5].toFixed(2);
  document.getElementById("matrizProjecao[0][6]").innerHTML = matriz_projecao[0][6].toFixed(2);
  document.getElementById("matrizProjecao[0][7]").innerHTML = matriz_projecao[0][7].toFixed(2);

  document.getElementById("matrizProjecao[1][0]").innerHTML = matriz_projecao[1][0].toFixed(2);
  document.getElementById("matrizProjecao[1][1]").innerHTML = matriz_projecao[1][1].toFixed(2);
  document.getElementById("matrizProjecao[1][2]").innerHTML = matriz_projecao[1][2].toFixed(2);
  document.getElementById("matrizProjecao[1][3]").innerHTML = matriz_projecao[1][3].toFixed(2);
  document.getElementById("matrizProjecao[1][4]").innerHTML = matriz_projecao[1][4].toFixed(2);
  document.getElementById("matrizProjecao[1][5]").innerHTML = matriz_projecao[1][5].toFixed(2);
  document.getElementById("matrizProjecao[1][6]").innerHTML = matriz_projecao[1][6].toFixed(2);
  document.getElementById("matrizProjecao[1][7]").innerHTML = matriz_projecao[1][7].toFixed(2);

  document.getElementById("matrizProjecao[2][0]").innerHTML = matriz_projecao[2][0].toFixed(2);
  document.getElementById("matrizProjecao[2][1]").innerHTML = matriz_projecao[2][1].toFixed(2);
  document.getElementById("matrizProjecao[2][2]").innerHTML = matriz_projecao[2][2].toFixed(2);
  document.getElementById("matrizProjecao[2][3]").innerHTML = matriz_projecao[2][3].toFixed(2);
  document.getElementById("matrizProjecao[2][4]").innerHTML = matriz_projecao[2][4].toFixed(2);
  document.getElementById("matrizProjecao[2][5]").innerHTML = matriz_projecao[2][5].toFixed(2);
  document.getElementById("matrizProjecao[2][6]").innerHTML = matriz_projecao[2][6].toFixed(2);
  document.getElementById("matrizProjecao[2][7]").innerHTML = matriz_projecao[2][7].toFixed(2);

  document.getElementById("matrizProjecao[3][0]").innerHTML = matriz_projecao[3][0].toFixed(2);
  document.getElementById("matrizProjecao[3][1]").innerHTML = matriz_projecao[3][1].toFixed(2);
  document.getElementById("matrizProjecao[3][2]").innerHTML = matriz_projecao[3][2].toFixed(2);
  document.getElementById("matrizProjecao[3][3]").innerHTML = matriz_projecao[3][3].toFixed(2);
  document.getElementById("matrizProjecao[3][4]").innerHTML = matriz_projecao[3][4].toFixed(2);
  document.getElementById("matrizProjecao[3][5]").innerHTML = matriz_projecao[3][5].toFixed(2);
  document.getElementById("matrizProjecao[3][6]").innerHTML = matriz_projecao[3][6].toFixed(2);
  document.getElementById("matrizProjecao[3][7]").innerHTML = matriz_projecao[3][7].toFixed(2);
}

function updateMatrizHomogenea(){

  document.getElementById("matrizHomogenea[0][0]").innerHTML = matriz_homogenea[0][0].toFixed(2);
  document.getElementById("matrizHomogenea[0][1]").innerHTML = matriz_homogenea[0][1].toFixed(2);
  document.getElementById("matrizHomogenea[0][2]").innerHTML = matriz_homogenea[0][2].toFixed(2);
  document.getElementById("matrizHomogenea[0][3]").innerHTML = matriz_homogenea[0][3].toFixed(2);
  document.getElementById("matrizHomogenea[0][4]").innerHTML = matriz_homogenea[0][4].toFixed(2);
  document.getElementById("matrizHomogenea[0][5]").innerHTML = matriz_homogenea[0][5].toFixed(2);
  document.getElementById("matrizHomogenea[0][6]").innerHTML = matriz_homogenea[0][6].toFixed(2);
  document.getElementById("matrizHomogenea[0][7]").innerHTML = matriz_homogenea[0][7].toFixed(2);

  document.getElementById("matrizHomogenea[1][0]").innerHTML = matriz_homogenea[1][0].toFixed(2);
  document.getElementById("matrizHomogenea[1][1]").innerHTML = matriz_homogenea[1][1].toFixed(2);
  document.getElementById("matrizHomogenea[1][2]").innerHTML = matriz_homogenea[1][2].toFixed(2);
  document.getElementById("matrizHomogenea[1][3]").innerHTML = matriz_homogenea[1][3].toFixed(2);
  document.getElementById("matrizHomogenea[1][4]").innerHTML = matriz_homogenea[1][4].toFixed(2);
  document.getElementById("matrizHomogenea[1][5]").innerHTML = matriz_homogenea[1][5].toFixed(2);
  document.getElementById("matrizHomogenea[1][6]").innerHTML = matriz_homogenea[1][6].toFixed(2);
  document.getElementById("matrizHomogenea[1][7]").innerHTML = matriz_homogenea[1][7].toFixed(2);

  document.getElementById("matrizHomogenea[2][0]").innerHTML = matriz_homogenea[2][0].toFixed(2);
  document.getElementById("matrizHomogenea[2][1]").innerHTML = matriz_homogenea[2][1].toFixed(2);
  document.getElementById("matrizHomogenea[2][2]").innerHTML = matriz_homogenea[2][2].toFixed(2);
  document.getElementById("matrizHomogenea[2][3]").innerHTML = matriz_homogenea[2][3].toFixed(2);
  document.getElementById("matrizHomogenea[2][4]").innerHTML = matriz_homogenea[2][4].toFixed(2);
  document.getElementById("matrizHomogenea[2][5]").innerHTML = matriz_homogenea[2][5].toFixed(2);
  document.getElementById("matrizHomogenea[2][6]").innerHTML = matriz_homogenea[2][6].toFixed(2);
  document.getElementById("matrizHomogenea[2][7]").innerHTML = matriz_homogenea[2][7].toFixed(2);

  document.getElementById("matrizHomogenea[3][0]").innerHTML = matriz_homogenea[3][0].toFixed(2);
  document.getElementById("matrizHomogenea[3][1]").innerHTML = matriz_homogenea[3][1].toFixed(2);
  document.getElementById("matrizHomogenea[3][2]").innerHTML = matriz_homogenea[3][2].toFixed(2);
  document.getElementById("matrizHomogenea[3][3]").innerHTML = matriz_homogenea[3][3].toFixed(2);
  document.getElementById("matrizHomogenea[3][4]").innerHTML = matriz_homogenea[3][4].toFixed(2);
  document.getElementById("matrizHomogenea[3][5]").innerHTML = matriz_homogenea[3][5].toFixed(2);
  document.getElementById("matrizHomogenea[3][6]").innerHTML = matriz_homogenea[3][6].toFixed(2);
  document.getElementById("matrizHomogenea[3][7]").innerHTML = matriz_homogenea[3][7].toFixed(2);

}

function updateMatrizCartesiana(){

  document.getElementById("matrizCartesiana[0][0]").innerHTML = matriz_cartesiana[0][0].toFixed(2);
  document.getElementById("matrizCartesiana[0][1]").innerHTML = matriz_cartesiana[0][1].toFixed(2);
  document.getElementById("matrizCartesiana[0][2]").innerHTML = matriz_cartesiana[0][2].toFixed(2);
  document.getElementById("matrizCartesiana[0][3]").innerHTML = matriz_cartesiana[0][3].toFixed(2);
  document.getElementById("matrizCartesiana[0][4]").innerHTML = matriz_cartesiana[0][4].toFixed(2);
  document.getElementById("matrizCartesiana[0][5]").innerHTML = matriz_cartesiana[0][5].toFixed(2);
  document.getElementById("matrizCartesiana[0][6]").innerHTML = matriz_cartesiana[0][6].toFixed(2);
  document.getElementById("matrizCartesiana[0][7]").innerHTML = matriz_cartesiana[0][7].toFixed(2);

  document.getElementById("matrizCartesiana[1][0]").innerHTML = matriz_cartesiana[1][0].toFixed(2);
  document.getElementById("matrizCartesiana[1][1]").innerHTML = matriz_cartesiana[1][1].toFixed(2);
  document.getElementById("matrizCartesiana[1][2]").innerHTML = matriz_cartesiana[1][2].toFixed(2);
  document.getElementById("matrizCartesiana[1][3]").innerHTML = matriz_cartesiana[1][3].toFixed(2);
  document.getElementById("matrizCartesiana[1][4]").innerHTML = matriz_cartesiana[1][4].toFixed(2);
  document.getElementById("matrizCartesiana[1][5]").innerHTML = matriz_cartesiana[1][5].toFixed(2);
  document.getElementById("matrizCartesiana[1][6]").innerHTML = matriz_cartesiana[1][6].toFixed(2);
  document.getElementById("matrizCartesiana[1][7]").innerHTML = matriz_cartesiana[1][7].toFixed(2);

  document.getElementById("matrizCartesiana[2][0]").innerHTML = matriz_cartesiana[2][0].toFixed(2);
  document.getElementById("matrizCartesiana[2][1]").innerHTML = matriz_cartesiana[2][1].toFixed(2);
  document.getElementById("matrizCartesiana[2][2]").innerHTML = matriz_cartesiana[2][2].toFixed(2);
  document.getElementById("matrizCartesiana[2][3]").innerHTML = matriz_cartesiana[2][3].toFixed(2);
  document.getElementById("matrizCartesiana[2][4]").innerHTML = matriz_cartesiana[2][4].toFixed(2);
  document.getElementById("matrizCartesiana[2][5]").innerHTML = matriz_cartesiana[2][5].toFixed(2);
  document.getElementById("matrizCartesiana[2][6]").innerHTML = matriz_cartesiana[2][6].toFixed(2);
  document.getElementById("matrizCartesiana[2][7]").innerHTML = matriz_cartesiana[2][7].toFixed(2);
}

function updateMatrizJanelaViewport(){
  document.getElementById("matrizJanelaViewport[0][0]").innerHTML = matriz_janela_viewport[0][0].toFixed(2);
  document.getElementById("matrizJanelaViewport[0][1]").innerHTML = matriz_janela_viewport[0][1].toFixed(2);
  document.getElementById("matrizJanelaViewport[0][2]").innerHTML = matriz_janela_viewport[0][2].toFixed(2);
 
  document.getElementById("matrizJanelaViewport[1][0]").innerHTML = matriz_janela_viewport[1][0].toFixed(2);
  document.getElementById("matrizJanelaViewport[1][1]").innerHTML = matriz_janela_viewport[1][1].toFixed(2);
  document.getElementById("matrizJanelaViewport[1][2]").innerHTML = matriz_janela_viewport[1][2].toFixed(2);
  
  document.getElementById("matrizJanelaViewport[2][0]").innerHTML = matriz_janela_viewport[2][0].toFixed(2);
  document.getElementById("matrizJanelaViewport[2][1]").innerHTML = matriz_janela_viewport[2][1].toFixed(2);
  document.getElementById("matrizJanelaViewport[2][2]").innerHTML = matriz_janela_viewport[2][2].toFixed(2);
}

function updateMatrizDispositivoTruncadas(){
  document.getElementById("matrizDispositivoTruncadas[0][0]").innerHTML = matriz_coords_dispositivo_truncadas[0][0].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[0][1]").innerHTML = matriz_coords_dispositivo_truncadas[0][1].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[0][2]").innerHTML = matriz_coords_dispositivo_truncadas[0][2].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[0][3]").innerHTML = matriz_coords_dispositivo_truncadas[0][3].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[0][4]").innerHTML = matriz_coords_dispositivo_truncadas[0][4].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[0][5]").innerHTML = matriz_coords_dispositivo_truncadas[0][5].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[0][6]").innerHTML = matriz_coords_dispositivo_truncadas[0][6].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[0][7]").innerHTML = matriz_coords_dispositivo_truncadas[0][7].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[1][0]").innerHTML = matriz_coords_dispositivo_truncadas[1][0].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[1][1]").innerHTML = matriz_coords_dispositivo_truncadas[1][1].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[1][2]").innerHTML = matriz_coords_dispositivo_truncadas[1][2].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[1][3]").innerHTML = matriz_coords_dispositivo_truncadas[1][3].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[1][4]").innerHTML = matriz_coords_dispositivo_truncadas[1][4].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[1][5]").innerHTML = matriz_coords_dispositivo_truncadas[1][5].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[1][6]").innerHTML = matriz_coords_dispositivo_truncadas[1][6].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[1][7]").innerHTML = matriz_coords_dispositivo_truncadas[1][7].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[2][0]").innerHTML = matriz_coords_dispositivo_truncadas[2][0].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[2][1]").innerHTML = matriz_coords_dispositivo_truncadas[2][1].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[2][2]").innerHTML = matriz_coords_dispositivo_truncadas[2][2].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[2][3]").innerHTML = matriz_coords_dispositivo_truncadas[2][3].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[2][4]").innerHTML = matriz_coords_dispositivo_truncadas[2][4].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[2][5]").innerHTML = matriz_coords_dispositivo_truncadas[2][5].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[2][6]").innerHTML = matriz_coords_dispositivo_truncadas[2][6].toFixed(0);
  document.getElementById("matrizDispositivoTruncadas[2][7]").innerHTML = matriz_coords_dispositivo_truncadas[2][7].toFixed(0);
}


function mostrarMatriz(matriz){
  const matrizes = document.querySelectorAll('.matriz');
  matrizes.forEach(matriz => {
    matriz.setAttribute("style", "display:none");
  });

  document.getElementById(matriz.value).removeAttribute("style");
  document.getElementById(matriz.value).setAttribute("style", "display:flex");
}

main();
updateTodosDados();

