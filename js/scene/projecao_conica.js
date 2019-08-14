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
  camera.position.set(0, 10, 20); // seta a posição da camera na tela

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
  controls.target.set(0, 5, 0);
  controls.update();

  //Camera da segunda camera
  const camera2 = new THREE.PerspectiveCamera(
    60, // fov
    2, // aspect
    0.1, // near
    500 // far
  );
  camera2.position.set(40, 10, 30);
  camera2.lookAt(0, 5, 0);

  controls2 = new THREE.OrbitControls(camera2, view2Elem);
  controls2.target.set(0, 5, 0);
  controls2.update();

  //Cria a CENA
  scene = new THREE.Scene();
  scene.background = new THREE.Color("black");
  scene.add(cameraHelper);

  //CRIAÇÃO DO CHÃO
  {
    const planeSize = 40; //tamanho do plano do chão

    const loader = new THREE.TextureLoader(); //textura das imagens
    const texture = loader.load(
      "https://threejsfundamentals.org/threejs/resources/images/checker.png"
    ); //carrega a textura para o chão
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide
    }); 
    //Materia utilizado nos objetos
    //Representa objetos baseados em malha de polígono triangular
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);
  }
  //CRIAÇÃO DO CUBO
  {

    geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(-1, -1,  1),  // 0
      new THREE.Vector3( 4, -1,  1),  // 1
      new THREE.Vector3(-1,  4,  1),  // 2
      new THREE.Vector3( 4,  4,  1),  // 3
      new THREE.Vector3(-1, -1, -4),  // 4
      new THREE.Vector3( 4, -1, -4),  // 5
      new THREE.Vector3(-1,  4, -4),  // 6
      new THREE.Vector3( 4,  4, -4),  // 7
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

    /*geometry.verticesNeedUpdate = true;
    geometry.elementsNeedUpdate = true;
    geometry.morphTargetsNeedUpdate = true;
    geometry.uvsNeedUpdate = true;
    geometry.normalsNeedUpdate = true;
    geometry.colorsNeedUpdate = true;
    geometry.tangentsNeedUpdate = true;*/
      
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
    mesh_cubo.position.set(0, 1.1 , 0);

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
    updatePontoVista();

    geometry.verticesNeedUpdate = true;
  }

  function updatePontoVista(){
    document.getElementById("ponto_vista_x").innerHTML = camera.position.x.toFixed(2);
    document.getElementById("ponto_vista_y").innerHTML = camera.position.y.toFixed(2);
    document.getElementById("ponto_vista_z").innerHTML = camera.position.z.toFixed(2);
  }

  requestAnimationFrame(render);
}


function atualizarPontoDeVista(){
  const x = document.getElementById("input_ponto_vista_x").value;
  const y = document.getElementById("input_ponto_vista_y").value;
  const z = document.getElementById("input_ponto_vista_z").value;
  camera.position.set(x, y, z);
  controls.update();

}

main();
