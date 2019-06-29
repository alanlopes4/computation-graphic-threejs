var calc_ponto_vista = (a, b, c) => ({
  a,
  b,
  c
});
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

var plano = {
  p1: { i: 0, j: 0, k: 0 },
  p2: { i: 0, j: 0, k: 0 },
  p3: { i: 0, j: 0, k: 0 }
};
var ponto = { x0: 0, y0: 0, z0: 0 };

var dispositivo = { resH: 0, resV: 0 };

//CALCULO D0, D1, D
var d0 = () =>
  normal.nx * ponto.x0 + normal.ny * ponto.y0 + normal.nz * ponto.z0;
var d1 = () =>
  normal.nx * ponto_vista.a +
  normal.ny * ponto_vista.b +
  normal.nz * ponto_vista.c;
var d = () => d0 - d1;

var Xmax = 0;
var Xmin = 0;
var Ymax = 0;
var Ymin = 0;

var Umax = 0;
var Umin = 0;
var Vmax = 0;
var Vmin = 0;
var Sx = 0;
var Sy = 0;

//Realiza os cálculos da janela viewport
var matriz_janela_viewport = (Sx, Sy, Xmin, Umin, Ymax, Vmin) => {
  var matriz = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i == 0) {
        if (j == 0) matrix[i][j] = Sx;
        else if (j == 2) matrix[i][j] = Sx * Xmin + Umin;
      } else if (i == 1) {
        if (j == 1) matrix[i][j] = -1 * Sy;
        else if (j == 2) matrix[i][j] = Sy * Ymax + Vmin;
      } else matrix[i][j] = 0;
    }
  }
  return matriz;
};

var coords_dispositivo_truncadas = { x: [], y: [], w: [] };

//###################################################

var ponto_vista_wcs = { a: 0, b: 0, c: 0 };

var plano_projecao = {
  r0: { x0: 0, y0: 0, z0: 0 },
  p1: { x1: 0, y1: 0, z1: 0 },
  p2: { x2: 0, y2: 0, z2: 0 },
  p3: { x3: 0, y3: 0, z3: 0 }
};

var coords_vertice = { x: 0, y: 0, z: 0 };
var calc_dados_objeto = coordenadas_vertice => ({
  coordenadas_vertice: coordenadas_vertice,
  numero_vertices: coordenadas_vertice.length,
  numero_superficies: 0,
  numero_vertices_por_superficie: 0,
  vertice_determinada_superficie: []
});
//Cálculo do vetor normal
var vet_normal = plano_projecao => {
  let n = {};
  n.nx =
    (plano_projecao.p1.y1 - plano_projecao.p2.y2) *
      (plano_projecao.p3.z3 - plano_projecao.p2.z2) -
    (plano_projecao.p3.y3 - plano_projecao.p2.y2) *
      (plano_projecao.p1.z1 - plano_projecao.p2.z2);
  n.ny =
    -(plano_projecao.p1.x1 - plano_projecao.p2.x2) *
      (plano_projecao.p3.z3 - plano_projecao.p2.z2) -
    (plano_projecao.p3.x3 - plano_projecao.p2.x2) *
      (plano_projecao.p1.z1 - plano_projecao.p2.z2);
  n.nz =
    (plano_projecao.p1.x1 - plano_projecao.p2.x2) *
      (plano_projecao.p3.y3 - plano_projecao.p2.y2) -
    (plano_projecao.p3.x3 - plano_projecao.p2.x2) *
      (plano_projecao.p1.y1 - plano_projecao.p2.y2);

  return n;
};
//Calculo da Matriz perspectiva
var matriz_perspectiva = () => {
  let matriz = [];
  //LINHA 1
  matriz[0][0] = d() + ponto_vista.a * vet_normal().nx;
  matriz[0][1] = ponto_vista.a * vet_normal().ny;
  matriz[0][2] = ponto_vista.a * vet_normal().nz;
  matriz[0][3] = -ponto_vista.a * d0();
  //LINHA 2
  matriz[1][0] = ponto_vista.b * vet_normal().nx;
  matriz[1][1] = d() + ponto_vista.b * vet_normal().ny;
  matriz[1][2] = ponto_vista.b * vet_normal().nz;
  matriz[1][3] = -ponto_vista.b * d0();
  //LINHA 3
  matriz[2][0] = ponto_vista.c * vet_normal().nx;
  matriz[2][1] = ponto_vista.c * vet_normal().ny;
  matriz[2][2] = d + ponto_vista.c * vet_normal().nz;
  matriz[2][3] = -ponto_vista.c * d0();
  //LINHA 4
  matriz[3][0] = vet_normal().nx;
  matriz[3][1] = vet_normal().ny;
  matriz[3][2] = vet_normal().nz;
  matriz[3][3] = -d1();

  return matriz;
};

//Calculo das Coordenadas no Plano de Projeção
function calc_coords_plano_projecao(matriz_perspectiva, matriz_objeto) {
  return matriz_perspectiva * matriz_objeto;
}

//Transforma as coordenadas homogeneas em coordenadas cartesianas
function transformacao_coords_cartesianas(coords_homogeneas) {
  return coords_homogeneas.map(v => v, coords_homogeneas.w);
}

function test() {
  console.log("TESTE COMECANDO");

  let ponto_vista = calc_ponto_vista(8, 2, 10);
  let m_objeto_cubo = 
}

test();


function coords_vertice_cubo () {
  let cubo = [];

  cubo[0] = {x: 0, y: 0, z:0, w: 1};
  cubo[1] = {x: 1, y: 0, z:0, w: 1};
  cubo[2] = {x: 1, y: 0, z:1, w: 1};
  cubo[3] = {x: 0, y: 0, z:1, w: 1};
  cubo[4] = {x: 0, y: 1, z:1, w: 1};
  cubo[5] = {x: 1, y: 1, z:1, w: 1};
  cubo[6] = {x: 1, y: 1, z:0, w: 1};
  cubo[7] = {x: 0, y: 1, z:0, w: 1};

  return cubo;
}

function coords_vertice_superfice_cubo() {
  let superficie = [];

  superficie[0] = {a: 4, b: 3, c:6, d: 5, e: 4};
  superficie[1] = {a: 3, b: 2, c:7, d: 6, e: 3};
  superficie[2] = {a: 8, b: 7, c:2, d: 1, e: 8};
  superficie[3] = {a: 5, b: 8, c:1, d: 4, e: 5};
  superficie[4] = {a: 5, b: 6, c:7, d: 8, e: 5};
  superficie[5] = {a: 1, b: 2, c:3, d: 4, e: 1};

  return superficie;
}