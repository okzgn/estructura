// Pruebas de tipos de las declaraciones (ESM, condición "import" de package.json).
// No se ejecutan: solo se compilan con `npm run test:types`. Las líneas marcadas con
// `@ts-expect-error` deben fallar; si dejan de fallar, el compilador avisa.
import _e, { type Instance, type TypeResult, type Options, type CurrentOptions, type Assignments, type SubtypeDefinitions, type Handler, type Method } from 'estructura-js';

// --- Despachador ---
const api: Instance = _e;
const result = _e('texto', 1);
result.cualquierMetodo('x');           // Sin genérico, se admite cualquier método.
const typed = _e<{ log(): void; join(sep: string): string }>(['a']);
typed.log();
const joined: string = typed.join('-');
// @ts-expect-error con genérico, solo los métodos declarados
typed.nope();

// --- .fn() ---
const chained: Instance = _e
  .fn({ String: { upper: (args: any[]) => String(args[0]).toUpperCase() } })
  .subtype({ String: 'Text' })
  .config({ args: 'spread' });
_e.fn((arg1, arg2) => { void arg1; void arg2; });                       // Manejador raíz
_e.fn({ Array: (arr) => ({ len: () => arr.length }) });                 // Manejador que devuelve métodos
_e.fn({ Array: () => {} });                                             // Manejador sin retorno
_e.fn({ String: { Number: { combine: (args) => args } } });             // Secuencia de tipos
_e.fn({ timestamp: () => Date.now() });                                 // Método global
const assignments: Assignments = { Object: { keys: function () { return this; } } };
_e.fn(assignments);
const method: Method = (args, extra) => [args, extra];
const handler: Handler = (a) => (a ? { ok: () => true } : null);
_e.fn({ Number: { method }, Boolean: handler });
// @ts-expect-error los métodos deben ser funciones
_e.fn({ String: { value: 1 } });
// @ts-expect-error las asignaciones son un objeto o una función
_e.fn('String');

// --- .subtype() ---
const definitions: SubtypeDefinitions = {
  Object: (input, primitiveType, getTypes) => (input && primitiveType === 'Object' && !getTypes()['Array'] ? 'Plain' : false),
  Array: ['Collection', 'List'],
  String: 'Text',
  Number: { Even: (n) => n % 2 === 0, Positive: (n) => (n > 0 ? true : null) },
};
_e.subtype(definitions).subtype('browser-dom').subtype('object-constructors');
// @ts-expect-error conjunto predefinido desconocido
_e.subtype('unknown-set');
// @ts-expect-error las definiciones no admiten números
_e.subtype({ Object: 1 });

// --- .type() ---
const types: TypeResult = _e.type([1]);
const first: string = types[0];
const last: string = types[types.length - 1];
const count: number = types.length;
if (types['Array']) { /* mapa de tipos para comprobaciones O(1) */ }
for (const name of types) { const s: string = name; void s; }
const names: string[] = types.map((name) => name);

// --- .instance() y .config() ---
const inst: Instance = _e.instance('typed', { collision: 'specific', args: 'spread' });
const same: Instance = inst.instance('typed');
const current: CurrentOptions = inst.config();
const collision: 'general' | 'specific' = current.collision;
const args: 'array' | 'spread' = current.args;
const options: Options = {};
const afterConfig: Instance = inst.config(options);
// @ts-expect-error valor de opción inválido
inst.config({ collision: 'first' });
// @ts-expect-error opción desconocida
inst.config({ nope: true });
// @ts-expect-error .config() sin argumentos devuelve las opciones, no la instancia
const notInstance: Instance = inst.config();
// @ts-expect-error el nombre de la instancia es una cadena
_e.instance(1);

void [api, chained, joined, first, last, count, names, same, collision, args, afterConfig, notInstance];
