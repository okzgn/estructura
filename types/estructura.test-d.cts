// Type tests for the declarations (CommonJS, package.json "require" condition).
import _e = require('estructura-js');

const inst: _e.Instance = _e.instance('cjs', { collision: 'specific' });
const types: _e.TypeResult = inst.type('x');
const current: _e.CurrentOptions = inst.config();
const options: _e.Options = { args: 'spread' };
inst.fn({ String: { len: (args: any[]) => args[0].length } }).config(options);
// @ts-expect-error invalid option value
inst.config({ args: 'list' });
const handlers: _e.HandlersOption = current.handlers;
const errors: _e.ErrorsOption = current.errors;
inst.config({ handlers: 'hidden', errors: 'throw' });
// @ts-expect-error invalid option value
inst.config({ errors: 'silent' });

void [types, current, handlers, errors];
