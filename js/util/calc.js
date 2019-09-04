var mobj_cubo = {
  v1: [],
  v2: [],
  v3: [],
  v4: [],
  v5: [],
  v6: [],
  v7: [],
  v8: []
};

var dispositivo = { resH: 32, resV: 64 };

var Xmax = 0;
var Xmin = 0;
var Ymax = 0;
var Ymin = 0;

var Umax = 32; //640;
var Umin = 0;
var Vmax = 24;//480;
var Vmin = 0;
var Sx = 0;
var Sy = 0;

var dados_objeto;
var ponto_vista;
var plano_projecao;
var normal;
var d;
var d0;
var d1;
var matriz_perspectiva;
var matriz_projecao;
var matriz_homogenea;
var matriz_cartesiana;
var matriz_janela_viewport;
var matriz_coords_dispositivo_truncadas;
//###################################################

var get_ponto_vista = (a, b, c) => ({ a, b, c });

var get_plano_projecao = (r0, p1, p2, p3) => ({
  r0, //pontoPlano
  p1, //ponto1
  p2, //ponto2
  p3 //ponto3
});

var coords_vertice = { x: 0, y: 0, z: 0 };
var get_dados_objeto = (coordenadas_vertice, numero_vertices) => ({
  coordenadas_vertice: coordenadas_vertice,
  numero_vertices: numero_vertices,
  numero_superficies: 0,
  numero_vertices_por_superficie: 0,
  vertice_determinada_superficie: []
});
//Cálculo do vetor normal
var calc_vet_normal = plano_projecao => {
  let n = {};
  n.nx = //normal[0]
    (plano_projecao.p1.y - plano_projecao.p2.y) *
      (plano_projecao.p3.z - plano_projecao.p2.z) -
    (plano_projecao.p3.y - plano_projecao.p2.y) *
      (plano_projecao.p1.z - plano_projecao.p2.z);
  n.ny = //normal[1]
    -(plano_projecao.p1.x - plano_projecao.p2.x) *
      (plano_projecao.p3.z - plano_projecao.p2.z) -
    (plano_projecao.p3.x - plano_projecao.p2.x) *
      (plano_projecao.p1.z - plano_projecao.p2.z);
  n.nz = //normal[2]
    (plano_projecao.p1.x - plano_projecao.p2.x) *
      (plano_projecao.p3.y - plano_projecao.p2.y) -
    (plano_projecao.p3.x - plano_projecao.p2.x) *
      (plano_projecao.p1.y - plano_projecao.p2.y);

  return {
    nx: n.nx == -0 ? 0 : n.nx,
    ny: n.ny == -0 ? 0 : n.ny,
    nz: n.nz == -0 ? 0 : n.nz
  };
};

//CALCULO D0, D1, D
var calc_d0 = (normal, plano_projecao) =>
  normal.nx * plano_projecao.r0.x +
  normal.ny * plano_projecao.r0.y +
  normal.nz * plano_projecao.r0.z;
var calc_d1 = (normal, ponto_vista) =>
  normal.nx * ponto_vista.a +
  normal.ny * ponto_vista.b +
  normal.nz * ponto_vista.c;
var calc_d = (d0, d1) => d0 - d1;

//Calculo da Matriz perspectiva
var calc_matriz_perspectiva = (d, d0, d1, normal, ponto_vista) => {
  let matriz = [];
  //LINHA 1
  matriz[0] = [
    d + ponto_vista.a * normal.nx,
    ponto_vista.a * normal.ny,
    ponto_vista.a * normal.nz,
    -ponto_vista.a * d0
  ];
  //LINHA 2
  matriz[1] = [
    ponto_vista.b * normal.nx,
    d + ponto_vista.b * normal.ny,
    ponto_vista.b * normal.nz,
    -ponto_vista.b * d0
  ];
  //LINHA 3
  matriz[2] = [
    ponto_vista.c * normal.nx,
    ponto_vista.c * normal.ny,
    d + ponto_vista.c * normal.nz,
    -ponto_vista.c * d0
  ];
  //LINHA 4
  matriz[3] = [normal.nx, normal.ny, normal.nz, -d1];

  return matriz.map(linha =>
    linha.map(v => {
      if (v == -0) return 0;
      return v;
    })
  );
};

//Cálculo da Matriz de projeção
var calc_matriz_projecao = (dados_objeto, matriz_perspectiva) => {
  let matriz_projecao = [[], [], [], []];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < dados_objeto.numero_vertices; j++) {
      matriz_projecao[i][j] = 0;
      for (let k = 0; k < 4; k++)
        matriz_projecao[i][j] +=
          matriz_perspectiva[i][k] * dados_objeto.coordenadas_vertice[k][j];
    }
  }
  return matriz_projecao;
};
//Realiza o cálculo da transformação homogenea
var calc_matriz_homogenea = (dados_objeto, matriz_projecao) => {
  let matriz_homogenea = [[], [], [], []];
  for (let i = 0; i < dados_objeto.numero_vertices; i++) {
    let valorW = matriz_projecao[3][i];
    for (let j = 0; j < 4; j++) {
      matriz_homogenea[j][i] = matriz_projecao[j][i] / valorW;
      if (matriz_homogenea[j][i] == -0) matriz_homogenea[j][i] = 0;
    }
  }
  return matriz_homogenea;
};

var get_coords_cartesianas_reflecao = matriz_homogenea => {
  let matriz_cartesiana = [];
  matriz_cartesiana[0] = matriz_homogenea[0];
  matriz_cartesiana[1] = matriz_homogenea[1].map(v => -1 * e);
  matriz_cartesiana[2] = matriz_homogenea[3];
  return matriz_cartesiana;
};

var calc_matriz_cartesiana = matriz_homogenea => {
  let matriz_cartesiana = [];
  matriz_cartesiana[0] = matriz_homogenea[0];
  matriz_cartesiana[1] = matriz_homogenea[1];
  matriz_cartesiana[2] = matriz_homogenea[3];
  return matriz_cartesiana;
};

var calc_janela = matriz_cartesiana => {
  Xmin = Math.min(...matriz_cartesiana[0]);
  Xmax = Math.max(...matriz_cartesiana[0]);
  Ymin = Math.min(...matriz_cartesiana[1]);
  Ymax = Math.max(...matriz_cartesiana[1]);
};

var calc_matriz_janela_viewport = () => {
  let matriz_janela_viewport = [[], [], [], []];

  Sx = (Umax-Umin)/(Xmax-Xmin);
  Sy = (Vmax-Vmin)/(Ymax-Ymin);

  matriz_janela_viewport[0] = [Sx, 0 , Sx*Xmin+Umin];
  matriz_janela_viewport[1] = [0, -Sy, Sy*Ymax+Vmin];
  matriz_janela_viewport[2] = [0, 0, 0];
  return matriz_janela_viewport;
}

var calc_tjanela_viewport = () => {
  let Rw = Vmax / Umax;
  let Rv = (Xmax - Xmin) / (Ymax - Ymin);
  let tjanela_viewport;

  Sx = (Umax - Umin) / (Xmax - Xmin);
  Sy = (Vmax - Vmin) / (Ymax - Ymin);
  
  if (Rw > Rv) {
   let UmaxNovo = Rw * (Vmax - Vmin) + Umin;
   
    Sx = (Umax - Umin) / (Xmax - Xmin);
    Sy = (Vmax - Vmin) / (Ymax - Ymin);
   
    tjanela_viewport = [
      [Sx, 0, -Sx*Xmin + Umax/2 - UmaxNovo/2 + Umin],
      [0, -Sy, Sy*Ymax + Vmin],
      [0, 0, 1]
    ];

  } else if (Rw < Rv) {
    let VmaxNovo = (Umax - Umin) / Rw + Vmin;

    tjanela_viewport = [
      [Sx, 0, Umin-Sx*Xmin],
      [0, -Sy, Sy*Ymax + Vmax/2 - VmaxNovo/2 + Vmin],
      [0, 0, 1]
    ];

  }else {
    tjanela_viewport = [
      [Sx, 0, Umin - Sx*Xmin],
      [0, -Sy, Sy*Ymax + Vmin],
      [0, 0, 1]
    ];
  }

  return tjanela_viewport;


};

//Transforma as coordenadas homogeneas em coordenadas cartesianas
function transformacao_coords_cartesianas(coords_homogeneas) {
  return coords_homogeneas.map(v => v, coords_homogeneas.w);
}

function calc_coords_dispositivo_truncadas(){
  let matriz_dispositivo_truncadas = [[], [], []];

  for(let i =0; i < 3; i++){
    for(let j=0; j < 8;j++){
      matriz_dispositivo_truncadas[i][j] = matriz_janela_viewport[i][0]*matriz_cartesiana[0][j] 
                                      + matriz_janela_viewport[i][1]*matriz_cartesiana[1][j] 
                                      + matriz_janela_viewport[i][2]*matriz_cartesiana[2][j];
    }
  }
  return matriz_dispositivo_truncadas;
}

//Inicializa as variaveis
ponto_vista = get_ponto_vista(8, 2, 10);
plano_projecao = get_plano_projecao(
  { x: 0, y: 0, z: 0 }, //r0
  { x: 1, y: 0, z: 0 }, //p1
  { x: 0, y: 0, z: 0 }, //p2
  { x: 0, y: 1, z: 0 } //p3
);
dados_objeto = get_dados_objeto(
  [
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ],
  8
);


function calcularMatrizes() {  
 

  normal = calc_vet_normal(plano_projecao);
  d0 = calc_d0(normal, plano_projecao);
  d1 = calc_d1(normal, ponto_vista);
  d = calc_d(d0, d1);

  matriz_perspectiva = calc_matriz_perspectiva(
    d,
    d0,
    d1,
    normal,
    ponto_vista
  );

  matriz_projecao = calc_matriz_projecao(dados_objeto, matriz_perspectiva);
  matriz_homogenea = calc_matriz_homogenea(dados_objeto, matriz_projecao);

  //console.log("NORMAL", normal);
  //console.log("D", d0, d1, d);
  //console.log("MATRIZ_PERSPECTIVA", matriz_perspectiva);
  //console.log("MATRIZ_PROJECAO", matriz_projecao);
  //console.log("MATRIZ_HOMOGENEA", matriz_homogenea);

  //passando a copia, pq array é passado por referencia
  let copyMatrizHomogenea = [[], [], [], []];
  for(let i = 0; i <4; i++)
    for (let j = 0; j < dados_objeto.numero_vertices; j++) 
      copyMatrizHomogenea[i][j] = matriz_homogenea[i][j];
    
 
  matriz_cartesiana = calc_matriz_cartesiana(copyMatrizHomogenea);

  console.log("MATRIZ_CARTESIANA", matriz_cartesiana);
  
  calc_janela(matriz_cartesiana);
  matriz_janela_viewport = calc_tjanela_viewport();
  //transladaOrigemMundo(dados_objeto, matriz_cartesiana);
  console.log("MATRIZ_CARTESIANA2", matriz_cartesiana);

  matriz_coords_dispositivo_truncadas = calc_coords_dispositivo_truncadas();
}

calcularMatrizes();

function coords_vertice_cubo() {
  let cubo = [];

  cubo[0] = { x: 0, y: 0, z: 0, w: 1 };
  cubo[1] = { x: 1, y: 0, z: 0, w: 1 };
  cubo[2] = { x: 1, y: 0, z: 1, w: 1 };
  cubo[3] = { x: 0, y: 0, z: 1, w: 1 };
  cubo[4] = { x: 0, y: 1, z: 1, w: 1 };
  cubo[5] = { x: 1, y: 1, z: 1, w: 1 };
  cubo[6] = { x: 1, y: 1, z: 0, w: 1 };
  cubo[7] = { x: 0, y: 1, z: 0, w: 1 };

  return cubo;
}

function coords_vertice_superfice_cubo() {
  let superficie = [];

  superficie[0] = { a: 4, b: 3, c: 6, d: 5, e: 4 };
  superficie[1] = { a: 3, b: 2, c: 7, d: 6, e: 3 };
  superficie[2] = { a: 8, b: 7, c: 2, d: 1, e: 8 };
  superficie[3] = { a: 5, b: 8, c: 1, d: 4, e: 5 };
  superficie[4] = { a: 5, b: 6, c: 7, d: 8, e: 5 };
  superficie[5] = { a: 1, b: 2, c: 3, d: 4, e: 1 };

  return superficie;
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

function get_resH_resV(){
  let resH = parseFloat(document.getElementById("scene").offsetWidth)/2;
  let resV = parseFloat(document.getElementById("scene").offsetHeight);
  document.getElementById("dispositivoV").value = resV;
  document.getElementById("dispositivoH").value = resH;
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

  vertices[0][0] = parseFloat(document.getElementById("verticeX[0]").innerHTML);
  vertices[0][1] = parseFloat(document.getElementById("verticeX[1]").innerHTML);
  vertices[0][2] = parseFloat(document.getElementById("verticeX[2]").innerHTML);
  vertices[0][3] = parseFloat(document.getElementById("verticeX[3]").innerHTML);
  vertices[0][4] = parseFloat(document.getElementById("verticeX[4]").innerHTML);
  vertices[0][5] = parseFloat(document.getElementById("verticeX[5]").innerHTML);
  vertices[0][6] = parseFloat(document.getElementById("verticeX[6]").innerHTML);
  vertices[0][7] = parseFloat(document.getElementById("verticeX[7]").innerHTML);
  vertices[1][0] = parseFloat(document.getElementById("verticeY[0]").innerHTML);
  vertices[1][1] = parseFloat(document.getElementById("verticeY[1]").innerHTML);
  vertices[1][2] = parseFloat(document.getElementById("verticeY[2]").innerHTML);
  vertices[1][3] = parseFloat(document.getElementById("verticeY[3]").innerHTML);
  vertices[1][4] = parseFloat(document.getElementById("verticeY[4]").innerHTML);
  vertices[1][5] = parseFloat(document.getElementById("verticeY[5]").innerHTML);
  vertices[1][6] = parseFloat(document.getElementById("verticeY[6]").innerHTML);
  vertices[1][7] = parseFloat(document.getElementById("verticeY[7]").innerHTML);
  vertices[2][0] = parseFloat(document.getElementById("verticeZ[0]").innerHTML);
  vertices[2][1] = parseFloat(document.getElementById("verticeZ[1]").innerHTML);
  vertices[2][2] = parseFloat(document.getElementById("verticeZ[2]").innerHTML);
  vertices[2][3] = parseFloat(document.getElementById("verticeZ[3]").innerHTML);
  vertices[2][4] = parseFloat(document.getElementById("verticeZ[4]").innerHTML);
  vertices[2][5] = parseFloat(document.getElementById("verticeZ[5]").innerHTML);
  vertices[2][6] = parseFloat(document.getElementById("verticeZ[6]").innerHTML);
  vertices[2][7] = parseFloat(document.getElementById("verticeZ[7]").innerHTML);
 

  //correcao_posicao_apos_atualizarVerticesObjeto(vertices);


  for(let i = 0; i < 3; i++)
    for(let j = 0; j< 8; j++)
      dados_objeto.coordenadas_vertice[i][j] = vertices[i][j];


     /* geometry.vertices.push(
        new THREE.Vector3(0, 0,  0),  // 0
        new THREE.Vector3(1, 0,  0),  // 1
        new THREE.Vector3(0, 1,  0),  // 2
        new THREE.Vector3(1, 1,  0),  // 3
        new THREE.Vector3(0, 0,  1),  // 4
        new THREE.Vector3(1, 0,  1),  // 5
        new THREE.Vector3(0, 1,  1),  // 6
        new THREE.Vector3(1, 1,  1),  // 7
      );*/

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

function correcao_posicao_apos_atualizarVerticesObjeto(vertices){
  let correcao_x = 0, correcao_y = 0, correcao_z = 0;
  for(let i = 0; i < 3; i++)
    for(let j = 0; j< 8; j++)
      if(dados_objeto.coordenadas_vertice[i][j] !== vertices[i][j]){
        if(i == 0) correcao_x = vertices[i][j] - dados_objeto.coordenadas_vertice[i][j] ;
        else if(i == 1) correcao_y = vertices[i][j] - dados_objeto.coordenadas_vertice[i][j];
        else correcao_z = vertices[i][j] -  dados_objeto.coordenadas_vertice[i][j];
      }
      if(correcao_x < 0) mesh_cubo.translateX(correcao_x);
      if(correcao_y < 0) mesh_cubo.translateY(correcao_y);
      if(correcao_z < 0) mesh_cubo.translateZ(correcao_z);
}

function atualizarXminXmax(){
  Xmin = document.getElementById("xmin").value;
  Xmax = document.getElementById("xmax").value;

  calcularMatrizes();
  updateTodosDados();
}

function atualizarYminYmax(){
  Ymin = document.getElementById("ymin").value;
  Ymax = document.getElementById("ymax").value;

  calcularMatrizes();
  updateTodosDados();
}

function centralizarObjeto(){
 //THREE.GeometryUtils.center(mesh_cubo);
 let distance_x = -geometry.vertices[0].x;
 let distance_y = -geometry.vertices[0].y;
 let distance_z = -geometry.vertices[0].z; 

  mesh_cubo.translateX(-mesh_cubo.position.x);
  mesh_cubo.translateY(-mesh_cubo.position.y);
  mesh_cubo.translateZ(-mesh_cubo.position.z);

  updateCoordenadasDosVerticesObjeto(distance_x, distance_y, distance_z);

   
}

function transladar(){

  let position_x = document.getElementById("input_transladar_x").value || 0;
  let position_y = document.getElementById("input_transladar_y").value || 0;
  let position_z = document.getElementById("input_transladar_z").value || 0;

  //mesh_cubo.position.set(position_x, position_y, position_z);
  mesh_cubo.translateX(parseFloat(position_x)/50);
  mesh_cubo.translateY(parseFloat(position_y)/50);
  mesh_cubo.translateZ(parseFloat(position_z)/50);
  updateCoordenadasDosVerticesObjeto(position_x, position_y, position_z);
}

function rotacionar(){

  let rotacionar_x = document.getElementById("input_rotacionar_x").value || 0;
  let rotacionar_y = document.getElementById("input_rotacionar_y").value || 0;
  let rotacionar_z = document.getElementById("input_rotacionar_z").value || 0;

  rotacionar_x = grausToRadians(rotacionar_x);
  rotacionar_y = grausToRadians(rotacionar_y);
  rotacionar_z = grausToRadians(rotacionar_z);

  //mesh_cubo.rotacionar.set(rotacionar_x, rotacionar_y, rotacionar_z);
  mesh_cubo.rotateX(parseFloat(rotacionar_x));
  mesh_cubo.rotateY(parseFloat(rotacionar_y));
  mesh_cubo.rotateZ(parseFloat(rotacionar_z));
  //updateCoordenadasDosVerticesObjeto(rotacionar_x, rotacionar_y, rotacionar_z);

  //if(rotacionar_x!=0) rotacionar_eixo_z(rotacionar_x);
  //if(rotacionar_y!=0) rotacionar_eixo_z(rotacionar_y);
  if(rotacionar_z!=0) rotacionar_eixo_z(rotacionar_z);

}

function centralizarRotacao(){
  //THREE.GeometryUtils.center(mesh_cubo);
  let rotate_x = -mesh_cubo.rotation.x;
  let rotate_y = -mesh_cubo.rotation.y;
  let rotate_z = -mesh_cubo.rotation.z; 

  mesh_cubo.rotateX(rotate_x);
  mesh_cubo.rotateY(rotate_y);
  mesh_cubo.rotateZ(rotate_z);

    //updateCoordenadasDosVerticesObjeto(rotate_x, rotate_y, rotate_z);
}


function updateCoordenadasDosVerticesObjeto(x, y, z){

    for(let j = 0; j < 8; j++){
      dados_objeto.coordenadas_vertice[0][j] = parseFloat(dados_objeto.coordenadas_vertice[0][j]) + parseFloat(x);
      dados_objeto.coordenadas_vertice[1][j] = parseFloat(dados_objeto.coordenadas_vertice[1][j]) + parseFloat(y);
      dados_objeto.coordenadas_vertice[2][j] = parseFloat(dados_objeto.coordenadas_vertice[2][j]) + parseFloat(z);
    }

    updateVerticesObjeto();
    atualizarVerticesObjeto();
}

function rotacionar_eixo_z(angulo) {
  for(let j = 0; j < 8; j++){
    dados_objeto.coordenadas_vertice[0][j] = Math.round(Math.cos(angulo)*parseFloat(dados_objeto.coordenadas_vertice[0][j])
      -Math.sin(angulo)*parseFloat(dados_objeto.coordenadas_vertice[1][j]));
    dados_objeto.coordenadas_vertice[1][j] = Math.round(Math.sin(angulo)*parseFloat(dados_objeto.coordenadas_vertice[0][j])
    +Math.cos(angulo)*parseFloat(dados_objeto.coordenadas_vertice[1][j]));
  }
  updateVerticesObjeto();
  atualizarVerticesObjeto();
}

function grausToRadians(graus){
  return (graus/180)*Math.PI;
}

function updateNormal(){
  document.getElementById("normal").innerHTML = ` x: ${normal.nx} y: ${normal.ny} z: ${normal.nz}`;
}

function updateDD0D1(){
  document.getElementById("d0_d1_d").innerHTML = ` d0: ${d0} d1: ${d1} d: ${d}`;
}


function updatePontoVista(){
  document.getElementById("ponto_vista_x").innerHTML = camera.position.x.toFixed(2);
  document.getElementById("ponto_vista_y").innerHTML = camera.position.y.toFixed(2);
  document.getElementById("ponto_vista_z").innerHTML = camera.position.z.toFixed(2);
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
  $('#modal_'+matriz.value.toString()).modal('show');

  /*const matrizes = document.querySelectorAll('.matriz');
  matrizes.forEach(matriz => {
    matriz.setAttribute("style", "display:none");
  });

  document.getElementById(matriz.value).removeAttribute("style");
  document.getElementById(matriz.value).setAttribute("style", "display:flex");*/
 
  //$('#modal_'+matriz.value).modal('show');
}
