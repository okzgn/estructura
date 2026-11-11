// Type tests for the declarations (ESM, package.json "import" condition).
// They are not executed: they are only compiled with `npm run test:types`. Lines marked with
// `@ts-expect-error` must fail; if they stop failing, the compiler reports it.
import _e, { type Instance, type TypeResult, type Options, type CurrentOptions, type Assignments, type SubtypeDefinitions, type Handler, type Method } from 'estructura-js';

// --- Dispatcher ---
const api: Instance = _e;
const result = _e('text', 1);
result.anyMethod('x');                 // Without a generic, any method is allowed.
const typed = _e<{ log(): void; join(sep: string): string }>(['a']);
typed.log();
const joined: string = typed.join('-');
// @ts-expect-error with a generic, only the declared methods
typed.nope();

// --- .fn() ---
const chained: Instance = _e
  .fn({ String: { upper: (args: any[]) => String(args[0]).toUpperCase() } })
  .subtype({ String: 'Text' })
  .config({ args: 'spread' });
_e.fn((arg1, arg2) => { void arg1; void arg2; });                       // Root handler
_e.fn({ Array: (arr) => ({ len: () => arr.length }) });                 // Handler that returns methods
_e.fn({ Array: () => {} });                                             // Handler with no return value
_e.fn({ String: { Number: { combine: (args) => args } } });             // Type sequence
_e.fn({ timestamp: () => Date.now() });                                 // Global method
const assignments: Assignments = { Object: { keys: function () { return this; } } };
_e.fn(assignments);
const method: Method = (args, extra) => [args, extra];
const handler: Handler = (a) => (a ? { ok: () => true } : null);
_e.fn({ Number: { method }, Boolean: handler });
// @ts-expect-error methods must be functions
_e.fn({ String: { value: 1 } });
// @ts-expect-error assignments are an object or a function
_e.fn('String');

// --- .subtype() ---
const definitions: SubtypeDefinitions = {
  Object: (input, primitiveType, getTypes) => (input && primitiveType === 'Object' && !getTypes()['Array'] ? 'Plain' : false),
  Array: ['Collection', 'List'],
  String: 'Text',
  Number: { Even: (n) => n % 2 === 0, Positive: (n) => (n > 0 ? true : null) },
};
_e.subtype(definitions).subtype('browser-dom').subtype('object-constructors');
// @ts-expect-error unknown predefined set
_e.subtype('unknown-set');
// @ts-expect-error definitions do not accept numbers
_e.subtype({ Object: 1 });

// --- .type() ---
const types: TypeResult = _e.type([1]);
const first: string = types[0];
const last: string = types[types.length - 1];
const count: number = types.length;
if (types['Array']) { /* type map for O(1) checks */ }
for (const name of types) { const s: string = name; void s; }
const names: string[] = types.map((name) => name);

// --- .instance() and .config() ---
const inst: Instance = _e.instance('typed', { collision: 'specific', args: 'spread' });
const same: Instance = inst.instance('typed');
const current: CurrentOptions = inst.config();
const collision: 'general' | 'specific' = current.collision;
const args: 'array' | 'spread' = current.args;
const options: Options = {};
const afterConfig: Instance = inst.config(options);
// @ts-expect-error invalid option value
inst.config({ collision: 'first' });
// @ts-expect-error unknown option
inst.config({ nope: true });
// @ts-expect-error .config() without arguments returns the options, not the instance
const notInstance: Instance = inst.config();
// @ts-expect-error the instance name is a string
_e.instance(1);

// --- handlers and errors options (v1.22.0+) ---
const handlers: 'exposed' | 'hidden' = current.handlers;
const errors: 'console' | 'throw' = current.errors;
const handlersOption: import('estructura-js').HandlersOption = 'hidden';
const errorsOption: import('estructura-js').ErrorsOption = 'throw';
const strict: Instance = _e.instance('typed-strict', { handlers: handlersOption, errors: errorsOption }).config({ handlers: 'exposed', errors: 'console' });
// @ts-expect-error invalid option value
inst.config({ handlers: 'none' });
// @ts-expect-error invalid option value
inst.config({ errors: 'silent' });

void [api, chained, joined, first, last, count, names, same, collision, args, afterConfig, notInstance, handlers, errors, strict];
