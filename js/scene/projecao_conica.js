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

  const fov = 45; // campo de visão
  const aspect = 2; // aspect radio
  const near = 5; // distância mínima da câmera chegar no objeto
  const far = 100; //distância máxima da câmera
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 20); // seta a posição da camera na tela

  cameraHelper = new THREE.CameraHelper(camera);

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
  gui.add(camera, "fov", 1, 180);
  const minMaxGUIHelper = new MinMaxGUIHelper(camera, "near", "far", 0.1);
  gui.add(minMaxGUIHelper, "min", 0.1, 50, 0.1).name("near");
  gui.add(minMaxGUIHelper, "max", 0.1, 50, 0.1).name("far");

  controls = new THREE.OrbitControls(camera, view1Elem);
  controls.target.set(0, 0, 0);
  controls.update();

  //Camera da segunda camera
  const camera2 = new THREE.PerspectiveCamera(
    60, // fov
    2, // aspect
    0.1, // near
    500 // far
  );
  camera2.position.set(40, 10, 30);
  camera2.lookAt(0, 0, 0);

  controls2 = new THREE.OrbitControls(camera2, view2Elem);
  controls2.target.set(0, 5, 0);
  controls2.update();

  //Cria a CENA
  scene = new THREE.Scene();
  scene.background = new THREE.Color("black");
  scene.add(cameraHelper);

  
  //CRIAÇÃO DO CUBO
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
      
    //tamanho do cubo
    const cubeSize = 4;
    //Cria um objeto geométrico do cubo (largura, altura, profundidade)
    //const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
    //Material utilizado nos no objeto
    //const material = new THREE.MeshBasicMaterial({ color: "#2F4F4F"})
    //const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
    //const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    const material = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors});
    //geometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
    geometry.verticesNeedUpdate = true;
    mesh_cubo = new THREE.Mesh(geometry, material);
    mesh_cubo.position.set(0, 0, 0);
    THREE.GeometryUtils.center( geometry );

    //helper = new THREE.FaceNormalsHelper(mesh_cubo, 1, 0x00ff00, 2);
    //mesh.position.set(cubeSize + 4, cubeSize/2 , 0);
    //vhn = new THREE.VertexNormalsHelper( mesh_cubo, 1, 0x0000FF	 );
    
    scene.add(mesh_cubo);
    //scene.add(helper);
    //scene.add(vhn);


    

    //scene.add(mesh2);
  }
  //Adicionando luz na cena
  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }
  //rendimensiona
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
    //pega as dimensões do canvas
    const canvasRect = canvas.getBoundingClientRect();
    //pega as dimensões do elemento
    const elemRect = elem.getBoundingClientRect();

    // Computa o canvas para o tamanho do elemento
    const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
    const left = Math.max(0, elemRect.left - canvasRect.left);
    const bottom =
      Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
    const top = Math.max(0, elemRect.top - canvasRect.top);

    const width = Math.min(canvasRect.width, right - left);
    const height = Math.min(canvasRect.height, bottom - top);

    // Configura a tesoura para renderizar apenas essa parte da tela
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);

    // retorna o aspecto
    return width / height;
  }

  function render() {
    resizeRendererToDisplaySize(renderer);

    // liga a tesoura 
    renderer.setScissorTest(true);

    // renderiza para a visão original
    {
      const aspect = setScissorForElement(view1Elem);

      //console.log("CAMERA_BEFORE", camera);
      // Ajusta a camera para esse aspecto
      camera.aspect = aspect;
      //Atualiza a matriz de projeção da camera
      //Deve ser chamado toda vez que mudar algum parametro
      camera.updateProjectionMatrix();
      cameraHelper.update();

      // don't draw the camera helper in the original view
      cameraHelper.visible = false;

      //console.log("CAMERA_AFTER", camera);

      scene.background.set(0x000000);

      // render
      renderer.render(scene, camera);
    }

    // render from the 2nd camera
    {
      const aspect = setScissorForElement(view2Elem);

      // Ajusta a camera para esse aspecto
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
  const x = document.getElementById("input_ponto_vista_x").value;
  const y = document.getElementById("input_ponto_vista_y").value;
  const z = document.getElementById("input_ponto_vista_z").value;
  camera.position.set(x, y, z);
  controls.update();
  ponto_vista = get_ponto_vista(x, y, z);


  test();
  updateTodosDados();


}

function updateNormal(){
  document.getElementById("normal").innerHTML = ` x: ${normal.nx} y: ${normal.ny} z: ${normal.nz}`;
}

function updateDD0D1(){
  document.getElementById("d0_d1_d").innerHTML = ` d0: ${d0} d1: ${d1} d: ${d}`;
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
  //LINHA -5 0 0 0 -5 0 0 0 
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
  console.log(matriz)
  const matrizes = document.querySelectorAll('.matriz');
  matrizes.forEach(matriz => {
    console.log(matriz);
    matriz.setAttribute("style", "display:none");
  });

  document.getElementById(matriz).removeAttribute("style");
  document.getElementById(matriz).setAttribute("style", "display:flex");
}

main();
updateTodosDados();
