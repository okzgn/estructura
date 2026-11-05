// Pruebas de tipos de las declaraciones (CommonJS, condición "require" de package.json).
import _e = require('estructura-js');

const inst: _e.Instance = _e.instance('cjs', { collision: 'specific' });
const types: _e.TypeResult = inst.type('x');
const current: _e.CurrentOptions = inst.config();
const options: _e.Options = { args: 'spread' };
inst.fn({ String: { len: (args: any[]) => args[0].length } }).config(options);
// @ts-expect-error valor de opción inválido
inst.config({ args: 'list' });

void [types, current];
