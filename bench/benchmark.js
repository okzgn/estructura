'use strict';
// Estructura dispatch benchmark.
//
// Usage:
//   node bench/benchmark.js [--target=path/to/build] [--samples=31] [--json]
//
// - Each scenario runs in its own child process (clean JIT, so that no scenario
//   pollutes the type feedback of another) and with `--expose-gc` to force a GC
//   before each sample.
// - `--target` allows comparing another build (e.g. 2.0) with the same suite.
// - Base scenario taken from the README: 10 types, 100 methods evenly distributed,
//   10000 repetitions x 10 calls = 100000 dispatches per sample.
// - Method names are lowercase: since v1.23.0 a name starting with an uppercase letter is a type
//   (handlers: 'hidden' by default), so the same suite measures v1.22.0 and later builds.

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
// Scenarios. Each `build(_e)` registers what it needs and returns { run, ops }:
// `run()` performs `ops` operations and returns a number (a sink against dead-code elimination).
// ---------------------------------------------------------------------------------------

const BASE_TYPES = ['String', 'Number', 'Array', 'Object', 'Boolean', 'Function', 'Null', 'Undefined', 'BigInt', 'Symbol'];
function base_inputs(){ return ['s', 1, [1], { a: 1 }, true, function(){}, null, undefined, BigInt(10), Symbol('x')]; }

function register_base(e){
  const defs = {};
  BASE_TYPES.forEach(function(t){
    defs[t] = {};
    for(let i = 0; i < 10; i++){ defs[t][t.toLowerCase() + '_' + i] = function(){ return i + 1; }; }
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

// The 10 base types registered as handlers (a function that returns nothing), then 5 methods merged into each.
function build_handlers(_e, name, options){
  const e = _e.instance(name, options), handlers = {}, methods = {};
  BASE_TYPES.forEach(function(t){
    handlers[t] = function(){};
    methods[t] = {};
    for(let i = 0; i < 5; i++){ methods[t][t.toLowerCase() + '_' + i] = function(){ return i + 1; }; }
  });
  e.fn(handlers).fn(methods);
  return { run: loop_1arg(e, base_inputs(), BASE_TYPES.map(function(t){ return t.toLowerCase() + '_0'; })), ops: DISPATCHES };
}

const SUBTYPES = {
  String: { Email: function(i){ return /@/.test(i); }, Numeric: function(i){ return /^\d+$/.test(i); } },
  Object: { User: function(i){ return i.kind === 'user'; }, Product: function(i){ return i.kind === 'product'; } },
  Array: { Matrix: function(i){ return Array.isArray(i[0]); }, Tuple: function(i){ return i.length === 2; } },
  Number: { Integer: function(i){ return Number.isInteger(i); } }
};

const scenarios = {
  'dispatch-1arg': {
    title: '1 argument, dispatch only (10 types, 100 methods)',
    build: function(_e){
      const e = _e.instance('b1'); register_base(e);
      return { run: loop_1arg(e, base_inputs()), ops: DISPATCHES };
    }
  },
  'dispatch-1arg+call': {
    title: '1 argument, dispatch + method call (README scenario)',
    build: function(_e){
      const e = _e.instance('b2'); register_base(e);
      const names = BASE_TYPES.map(function(t){ return t.toLowerCase() + '_0'; });
      return { run: loop_1arg(e, base_inputs(), names), ops: DISPATCHES };
    }
  },
  'dispatch-2args': {
    title: '2 arguments, dispatch + call (10 type pairs, 100 methods)',
    build: function(_e){
      const e = _e.instance('b3');
      const values = { String: 's', Number: 1, Boolean: true, Function: function(){}, Null: null, Undefined: undefined, BigInt: BigInt(10), Symbol: Symbol('x'), Array: [1], Object: { a: 1 } };
      const pairs = [['String', 'Number'], ['Number', 'String'], ['Boolean', 'Number'], ['Function', 'String'], ['Null', 'Number'], ['Undefined', 'String'], ['BigInt', 'Number'], ['Symbol', 'String'], ['Array', 'String'], ['Object', 'Number']];
      const defs = {};
      pairs.forEach(function(p){
        defs[p[0]] = {}; defs[p[0]][p[1]] = {};
        for(let i = 0; i < 10; i++){ defs[p[0]][p[1]][(p[0] + '_' + p[1]).toLowerCase() + '_' + i] = function(){ return i + 1; }; }
      });
      e.fn(defs);
      const a = pairs.map(function(p){ return values[p[0]]; });
      const b = pairs.map(function(p){ return values[p[1]]; });
      const names = pairs.map(function(p){ return (p[0] + '_' + p[1]).toLowerCase() + '_0'; });
      const rounds = DISPATCHES / pairs.length;
      return { ops: DISPATCHES, run: function(){
        let sink = 0;
        for(let r = 0; r < rounds; r++){ for(let k = 0; k < pairs.length; k++){ sink += e(a[k], b[k])[names[k]](); } }
        return sink;
      } };
    }
  },
  'subtypes': {
    title: '1 argument with custom subtypes (11 nodes, ~100 methods), dispatch + call',
    build: function(_e){
      const e = _e.instance('b4'); e.subtype(SUBTYPES);
      const nodes = ['String', 'Email', 'Numeric', 'Object', 'User', 'Product', 'Array', 'Matrix', 'Tuple', 'Number', 'Integer'];
      const defs = {};
      nodes.forEach(function(t){
        defs[t] = {};
        for(let i = 0; i < 9; i++){ defs[t][t.toLowerCase() + '_' + i] = function(){ return i + 1; }; }
      });
      e.fn(defs);
      const inputs = ['a@b.co', '123', 'plain', { kind: 'user' }, { kind: 'product' }, {}, [[1]], [1, 2], 7, 7.5];
      const names = ['Email', 'Numeric', 'String', 'User', 'Product', 'Object', 'Matrix', 'Tuple', 'Integer', 'Number'].map(function(t){ return t.toLowerCase() + '_0'; });
      return { run: loop_1arg(e, inputs, names), ops: DISPATCHES };
    }
  },
  'conflicts': {
    title: '1 argument with a name conflict on every call (warning path), dispatch + call',
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
  'many-types': {
    title: '1 argument, 50 types registered in the root (10 methods each), dispatch + call',
    build: function(_e){
      const e = _e.instance('b6'), defs = {};
      for(let t = 0; t < 50; t++){
        const type = t === 0 ? 'String' : 'Type' + t;
        defs[type] = {};
        for(let i = 0; i < 10; i++){ defs[type][type.toLowerCase() + '_' + i] = function(){ return i + 1; }; }
      }
      e.fn(defs);
      const inputs = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
      return { run: loop_1arg(e, inputs, inputs.map(function(){ return 'string_0'; })), ops: DISPATCHES };
    }
  },
  'many-methods': {
    title: '1 argument, one type with 20 methods, dispatch + call',
    build: function(_e){
      const e = _e.instance('b7'), methods = {};
      for(let i = 0; i < 20; i++){ methods['string_' + i] = function(){ return i + 1; }; }
      e.fn({ String: methods });
      const inputs = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
      return { run: loop_1arg(e, inputs, inputs.map(function(){ return 'string_0'; })), ops: DISPATCHES };
    }
  },
  'handlers': {
    title: '1 argument, the 10 base types as handlers with 5 methods each (default options), dispatch + call',
    build: function(_e){ return build_handlers(_e, 'b8'); }
  },
  'handlers-exposed': {
    title: "The same with handlers: 'exposed'",
    build: function(_e){ return build_handlers(_e, 'b9', { handlers: 'exposed' }); }
  },
  'handlers-hidden': {
    title: "The same with handlers: 'hidden'",
    build: function(_e){ return build_handlers(_e, 'b10', { handlers: 'hidden' }); }
  },
  'method-call': {
    title: 'Repeated call to one method of the same result (no dispatch)',
    build: function(_e){
      const e = _e.instance('b11'); register_base(e);
      const result = e('s');
      return { ops: DISPATCHES, run: function(){
        let sink = 0;
        for(let i = 0; i < DISPATCHES; i++){ sink += result.string_0(); }
        return sink;
      } };
    }
  },
  'rebuild': {
    title: 'Registration of a new method in another type + dispatch, with 3000 methods in the root',
    build: function(_e){
      const e = _e.instance('b12'), root = {};
      let n = 0;
      for(let i = 0; i < 3000; i++){ root['root_' + i] = function(){ return 1; }; }
      e.fn(root); e('x');
      const reps = 100;
      return { ops: reps, run: function(){
        let sink = 0;
        for(let r = 0; r < reps; r++){
          const methods = {}; methods['number_' + (n++)] = function(){ return 1; };
          e.fn({ Number: methods });
          sink += e('x').root_0();
        }
        return sink;
      } };
    }
  },
  'registration': {
    title: 'Registration: create instance + subtypes + 100 methods (cost per instance)',
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
// Child process: runs one scenario and emits its samples as JSON on the last line.
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
    if(i >= WARMUP){ samples.push(Number(t1 - t0) / built.ops); } // ns per operation
  }
  process.stdout.write('\n@@RESULT@@' + JSON.stringify({ name: name, samples: samples, sink: sink }) + '\n');
}

// ---------------------------------------------------------------------------------------
// Parent process: spawns one child per scenario and prints the report.
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
    if(r.status !== 0){ console.error('Scenario ' + name + ' failed:\n' + r.stderr); process.exit(1); }
    const line = r.stdout.split('\n').filter(function(l){ return l.indexOf('@@RESULT@@') === 0; })[0];
    const data = JSON.parse(line.slice('@@RESULT@@'.length));
    results.push({ name: name, title: scenarios[name].title, stats: stats(data.samples) });
  });

  if(argv.json){ console.log(JSON.stringify({ version: version, node: process.version, results: results }, null, 2)); return; }

  console.log('Estructura v' + version + '  |  Node ' + process.version + '  |  ' + os.cpus()[0].model.trim() + ' x' + os.cpus().length + '  |  ' + os.platform() + ' ' + os.arch());
  console.log('Samples per scenario: ' + SAMPLES + ' (+' + WARMUP + ' warm-up samples discarded). Times per operation.\n');
  const cols = ['scenario', 'median', 'min', 'p90', 'max', 'rsd', 'ops/s (median)'];
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
