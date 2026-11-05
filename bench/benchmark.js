'use strict';
// Benchmark de despacho de Estructura.
//
// Uso:
//   node bench/benchmark.js [--target=ruta/al/build] [--samples=31] [--json]
//
// - Cada escenario se ejecuta en un proceso hijo propio (JIT limpio, sin que un escenario
//   contamine la retroalimentacion de tipos de otro) y con `--expose-gc` para forzar un GC
//   antes de cada muestra.
// - `--target` permite comparar otra build (p. ej. la 2.0) con la misma bateria.
// - Escenario base tomado del README: 10 tipos, 100 metodos repartidos por igual,
//   10000 repeticiones x 10 llamadas = 100000 despachos por muestra.

const path = require('path');
const os = require('os');
const fs = require('fs');
const { spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

const argv = {};
process.argv.slice(2).forEach(function(a){
  const parts = a.replace(/^--/, '').split('=');
  argv[parts[0]] = parts.length > 1 ? parts.slice(1).join('=') : true;
});

const TARGET = path.resolve(argv.target || path.join(__dirname, '..', 'dist', 'estructura.umd.js'));
const SAMPLES = Number(argv.samples || 31);
const WARMUP = 5;
const DISPATCHES = 100000;

// ---------------------------------------------------------------------------------------
// Escenarios. Cada `build(_e)` registra lo necesario y devuelve { run, ops }:
// `run()` ejecuta `ops` operaciones y devuelve un numero (sumidero anti-eliminacion de codigo).
// ---------------------------------------------------------------------------------------

const BASE_TYPES = ['String', 'Number', 'Array', 'Object', 'Boolean', 'Function', 'Null', 'Undefined', 'BigInt', 'Symbol'];
function base_inputs(){ return ['s', 1, [1], { a: 1 }, true, function(){}, null, undefined, BigInt(10), Symbol('x')]; }

function register_base(e){
  const defs = {};
  BASE_TYPES.forEach(function(t){
    defs[t] = {};
    for(let i = 0; i < 10; i++){ defs[t][t + '_' + i] = function(){ return i + 1; }; }
  });
  e.fn(defs);
}

function loop_1arg(e, inputs, names){
  const per_round = inputs.length;
  const rounds = DISPATCHES / per_round;
  return function(){
    let sink = 0;
    if(names){
      for(let r = 0; r < rounds; r++){ for(let k = 0; k < per_round; k++){ sink += e(inputs[k])[names[k]](); } }
    }
    else {
      for(let r = 0; r < rounds; r++){ for(let k = 0; k < per_round; k++){ if(e(inputs[k]) !== undefined){ sink++; } } }
    }
    return sink;
  };
}

const SUBTYPES = {
  String: { Email: function(i){ return /@/.test(i); }, Numeric: function(i){ return /^\d+$/.test(i); } },
  Object: { User: function(i){ return i.kind === 'user'; }, Product: function(i){ return i.kind === 'product'; } },
  Array: { Matrix: function(i){ return Array.isArray(i[0]); }, Tuple: function(i){ return i.length === 2; } },
  Number: { Integer: function(i){ return Number.isInteger(i); } }
};

const scenarios = {
  'despacho-1arg': {
    title: '1 argumento, solo despacho (10 tipos, 100 metodos)',
    build: function(_e){
      const e = _e.instance('b1'); register_base(e);
      return { run: loop_1arg(e, base_inputs()), ops: DISPATCHES };
    }
  },
  'despacho-1arg+llamada': {
    title: '1 argumento, despacho + llamada a un metodo (escenario del README)',
    build: function(_e){
      const e = _e.instance('b2'); register_base(e);
      const names = BASE_TYPES.map(function(t){ return t + '_0'; });
      return { run: loop_1arg(e, base_inputs(), names), ops: DISPATCHES };
    }
  },
  'despacho-2args': {
    title: '2 argumentos, despacho + llamada (10 pares de tipos, 100 metodos)',
    build: function(_e){
      const e = _e.instance('b3');
      const values = { String: 's', Number: 1, Boolean: true, Function: function(){}, Null: null, Undefined: undefined, BigInt: BigInt(10), Symbol: Symbol('x'), Array: [1], Object: { a: 1 } };
      const pairs = [['String', 'Number'], ['Number', 'String'], ['Boolean', 'Number'], ['Function', 'String'], ['Null', 'Number'], ['Undefined', 'String'], ['BigInt', 'Number'], ['Symbol', 'String'], ['Array', 'String'], ['Object', 'Number']];
      const defs = {};
      pairs.forEach(function(p){
        defs[p[0]] = {}; defs[p[0]][p[1]] = {};
        for(let i = 0; i < 10; i++){ defs[p[0]][p[1]][p[0] + '_' + p[1] + '_' + i] = function(){ return i + 1; }; }
      });
      e.fn(defs);
      const a = pairs.map(function(p){ return values[p[0]]; });
      const b = pairs.map(function(p){ return values[p[1]]; });
      const names = pairs.map(function(p){ return p[0] + '_' + p[1] + '_0'; });
      const rounds = DISPATCHES / pairs.length;
      return { ops: DISPATCHES, run: function(){
        let sink = 0;
        for(let r = 0; r < rounds; r++){ for(let k = 0; k < pairs.length; k++){ sink += e(a[k], b[k])[names[k]](); } }
        return sink;
      } };
    }
  },
  'subtipos': {
    title: '1 argumento con subtipos personalizados (11 nodos, ~100 metodos), despacho + llamada',
    build: function(_e){
      const e = _e.instance('b4'); e.subtype(SUBTYPES);
      const nodes = ['String', 'Email', 'Numeric', 'Object', 'User', 'Product', 'Array', 'Matrix', 'Tuple', 'Number', 'Integer'];
      const defs = {};
      nodes.forEach(function(t){
        defs[t] = {};
        for(let i = 0; i < 9; i++){ defs[t][t + '_' + i] = function(){ return i + 1; }; }
      });
      e.fn(defs);
      const inputs = ['a@b.co', '123', 'plain', { kind: 'user' }, { kind: 'product' }, {}, [[1]], [1, 2], 7, 7.5];
      const names = ['Email', 'Numeric', 'String', 'User', 'Product', 'Object', 'Matrix', 'Tuple', 'Integer', 'Number'].map(function(t){ return t + '_0'; });
      return { run: loop_1arg(e, inputs, names), ops: DISPATCHES };
    }
  },
  'conflictos': {
    title: '1 argumento con conflicto de nombres en cada llamada (ruta de aviso), despacho + llamada',
    silence_console: true,
    build: function(_e){
      const e = _e.instance('b5'); e.subtype(SUBTYPES);
      const defs = {};
      ['String', 'Email', 'Object', 'User', 'Array', 'Tuple', 'Number', 'Integer'].forEach(function(t){ defs[t] = { describe: function(){ return 1; } }; });
      e.fn(defs);
      const inputs = ['a@b.co', { kind: 'user' }, [1, 2], 7];
      const names = inputs.map(function(){ return 'describe'; });
      return { run: loop_1arg(e, inputs, names), ops: DISPATCHES };
    }
  },
  'registro': {
    title: 'Registro: crear instancia + subtipos + 100 metodos (coste por instancia)',
    build: function(_e){
      const reps = 200; let n = 0;
      return { ops: reps, run: function(){
        let sink = 0;
        for(let r = 0; r < reps; r++){
          const e = _e.instance('reg' + (n++));
          e.subtype(SUBTYPES); register_base(e); sink++;
        }
        return sink;
      } };
    }
  }
};

// ---------------------------------------------------------------------------------------
// Proceso hijo: ejecuta un escenario y emite sus muestras como JSON en la ultima linea.
// ---------------------------------------------------------------------------------------

async function load_target(){
  if(/\.mjs$/.test(TARGET)){ return (await import(pathToFileURL(TARGET).href)).default; }
  return require(TARGET);
}

async function child(name){
  const sc = scenarios[name];
  const _e = await load_target();
  if(sc.silence_console){ console.warn = function(){}; }
  const built = sc.build(_e);
  const samples = [];
  let sink = 0;
  for(let i = 0; i < WARMUP + SAMPLES; i++){
    if(typeof gc === 'function'){ gc(); }
    const t0 = process.hrtime.bigint();
    sink += built.run();
    const t1 = process.hrtime.bigint();
    if(i >= WARMUP){ samples.push(Number(t1 - t0) / built.ops); } // ns por operacion
  }
  process.stdout.write('\n@@RESULT@@' + JSON.stringify({ name: name, samples: samples, sink: sink }) + '\n');
}

// ---------------------------------------------------------------------------------------
// Proceso padre: lanza un hijo por escenario y presenta el informe.
// ---------------------------------------------------------------------------------------

function stats(samples){
  const s = samples.slice().sort(function(a, b){ return a - b; });
  const pick = function(p){ return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  const mean = s.reduce(function(a, b){ return a + b; }, 0) / s.length;
  const sd = Math.sqrt(s.reduce(function(a, b){ return a + (b - mean) * (b - mean); }, 0) / s.length);
  return { min: s[0], median: pick(0.5), p90: pick(0.9), max: s[s.length - 1], mean: mean, rsd: (sd / mean) * 100 };
}

function fmt(n){ return n >= 1000 ? (n / 1000).toFixed(2) + ' us' : n.toFixed(1) + ' ns'; }

function parent(){
  const head = fs.readFileSync(TARGET, 'utf8').slice(0, 400);
  const version = (head.match(/Estructura v([\d.]+)/) || [])[1] || '?';
  const results = [];
  Object.keys(scenarios).forEach(function(name){
    const r = spawnSync(process.execPath, ['--expose-gc', __filename, '--child=' + name, '--target=' + TARGET, '--samples=' + SAMPLES], { encoding: 'utf8', maxBuffer: 1 << 26 });
    if(r.status !== 0){ console.error('Fallo el escenario ' + name + ':\n' + r.stderr); process.exit(1); }
    const line = r.stdout.split('\n').filter(function(l){ return l.indexOf('@@RESULT@@') === 0; })[0];
    const data = JSON.parse(line.slice('@@RESULT@@'.length));
    results.push({ name: name, title: scenarios[name].title, stats: stats(data.samples) });
  });

  if(argv.json){ console.log(JSON.stringify({ version: version, node: process.version, results: results }, null, 2)); return; }

  console.log('Estructura v' + version + '  |  Node ' + process.version + '  |  ' + os.cpus()[0].model.trim() + ' x' + os.cpus().length + '  |  ' + os.platform() + ' ' + os.arch());
  console.log('Muestras por escenario: ' + SAMPLES + ' (+' + WARMUP + ' de calentamiento descartadas). Tiempos por operacion.\n');
  const cols = ['escenario', 'mediana', 'min', 'p90', 'max', 'rsd', 'ops/s (mediana)'];
  const rows = results.map(function(r){
    const s = r.stats;
    return [r.name, fmt(s.median), fmt(s.min), fmt(s.p90), fmt(s.max), s.rsd.toFixed(1) + '%', Math.round(1e9 / s.median).toLocaleString('en-US')];
  });
  const widths = cols.map(function(c, i){ return Math.max(c.length, ...rows.map(function(r){ return r[i].length; })); });
  const line = function(r){ return r.map(function(c, i){ return i === 0 ? c.padEnd(widths[i]) : c.padStart(widths[i]); }).join('  '); };
  console.log(line(cols)); console.log(widths.map(function(w){ return '-'.repeat(w); }).join('  '));
  rows.forEach(function(r){ console.log(line(r)); });
  console.log('');
  results.forEach(function(r){ console.log('  ' + r.name + ': ' + r.title); });
}

if(argv.child){ child(argv.child); } else { parent(); }
