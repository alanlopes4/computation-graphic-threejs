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

ponto_vista = get_ponto_vista(0, 0, 5);

function test() {

  dados_objeto = get_dados_objeto(
    [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ],
    8
  );

  
  plano_projecao = get_plano_projecao(
    { x: 0, y: 0, z: 0 }, //r0
    { x: 1, y: 0, z: 0 }, //p1
    { x: 0, y: 0, z: 0 }, //p2
    { x: 0, y: 1, z: 0 } //p3
  );

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

  console.log("NORMAL", normal);
  console.log("D", d0, d1, d);
  console.log("MATRIZ_PERSPECTIVA", matriz_perspectiva);
  console.log("MATRIZ_PROJECAO", matriz_projecao);
  console.log("MATRIZ_HOMOGENEA", matriz_homogenea);

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

test();

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
