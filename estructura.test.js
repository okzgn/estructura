const _e = require('./dist/estructura.umd');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
const path = require('path');

// Estructura uses a fixed internal 1000 ms timer
// before emitting asynchronous warnings or errors.
// We wait 1010 ms to make sure the message has been processed.
const waitForConsole = (ms = 1010) => new Promise(resolve => setTimeout(resolve, ms));

describe('Estructura Framework v1.22.0 - Unit Tests', () => {

  // --- 1. QUICK START GUIDE ---
  describe('Quick Start Guide', () => {
    it('should dispatch methods based on the types of the arguments', () => {
      const e = _e.instance('quickstart'); // Isolated instance
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      e.fn({
        Array: {
          log: (args) => console.log(`An array: ${args[0]}`),
        },
        Number: {
          log: (args) => console.log(`A number: ${args[0]}`),
        },
        String: {
          Number: {
            combine: (args) => console.log(`Combined: ${args[0]} and ${args[1]}`),
          },
        },
      });

      e(['hello']).log();
      expect(logSpy).toHaveBeenCalledWith('An array: hello');

      e(12345).log();
      expect(logSpy).toHaveBeenCalledWith('A number: 12345');

      e('text', 67890).combine();
      expect(logSpy).toHaveBeenCalledWith('Combined: text and 67890');

      logSpy.mockRestore();
    });
  });

  // --- 2. API DOCUMENTATION ---
  describe('API Documentation', () => {
    let e;

    beforeEach(() => {
      // Creates a fresh instance for each test in this section
      e = _e.instance(`api-test-${Date.now()}${Math.random()}`);
    });

    describe('_e.fn() - Function registration', () => {
      it('should register a method that operates on an object', () => {
        e.fn({
          Object: {
            keys: (args) => Object.keys(args[0]),
          },
        });
        const keys = e({ a: 1, b: 2 }).keys();
        expect(keys).toEqual(['a', 'b']);
      });

      it('should register methods that accept additional arguments', () => {
        e.fn({
          String: {
            repeat: (args, times) => args[0].repeat(times),
          },
        });
        const repeated = e('hello ').repeat(3);
        expect(repeated).toBe('hello hello hello ');
      });

      it('should register "global" methods available for any type', () => {
        const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
        e.fn({
          timestamp: () => `Processed at: ${Date.now()}`,
        });

        expect(e(123).timestamp()).toBe('Processed at: 1700000000000');
        expect(e('abc').timestamp()).toBe('Processed at: 1700000000000');
        dateSpy.mockRestore();
      });

      it('should merge method registrations for the same type (additive registration)', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        // Initial registration
        e.fn({
          String: {
            log: (args) => console.log(`[LOG]: ${args[0]}`),
          },
        });
        // "Plugin" registration
        e.fn({
          String: {
            wordCount: (args) => args[0].split(' ').length,
          },
        });

        const myPhrase = e('Estructura is very flexible');
        myPhrase.log();
        expect(logSpy).toHaveBeenCalledWith('[LOG]: Estructura is very flexible');
        expect(myPhrase.wordCount()).toBe(4);
        logSpy.mockRestore();
      });

      it('should overwrite specific methods with more general ones (collision rule)', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        e.subtype({ Array: 'CustomList' });

        e.fn({ CustomList: { getPriority: () => 1 } }); // Most specific
        e.fn({ Array: { getPriority: () => 2 } });
        e.fn({ Object: { getPriority: () => 3 } });
        e.fn({ getPriority: () => 4 }); // Global (most general)

        // According to the documentation, the most general one (global) must prevail.
        const result = e([]).getPriority();
        expect(result).toBe(4);

        await waitForConsole();
        warnSpy.mockRestore();
      });
    });

    describe('Arguments for Methods vs. Handlers', () => {
        it('should pass arguments grouped in an array to METHODS', () => {
            const methodMock = jest.fn();
            e.fn({
                String: { myMethod: methodMock }
            });

            e('Hello').myMethod('extra-arg');
            // The first argument of the method is the array with the arguments of `_e()`
            expect(methodMock).toHaveBeenCalledWith(['Hello'], 'extra-arg');
        });

        it('should pass spread arguments directly to HANDLERS', () => {
            const handlerMock = jest.fn();
            e.fn({
                String: {
                  String: handlerMock
                }
            });

            e('Hello', 'World');
            expect(handlerMock).toHaveBeenCalledWith('Hello', 'World');
        });
    });

    describe('_e.subtype() - Type registration', () => {
      it('should register and use subtypes, aliases and functional subtypes', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        e.subtype({
          Object: (input) => (input.userId ? 'User' : false),
          RegExp: 'RegexPattern',
          Array: ['Collection', 'OrderedList'],
        });

        e.fn({
          User: {
            hello: (args) => console.log(`Hello, ${args[0].name}!`),
          },
          RegexPattern: {
            test: (args, str) => args[0].test(str),
          },
          Collection: {
            isCollection: () => true,
          },
          OrderedList: {
            count: (args) => args[0].length,
          },
        });

        // Test of the functional subtype 'User'
        const user = { userId: 'u-123', name: 'Alex' };
        e(user).hello();
        expect(logSpy).toHaveBeenCalledWith('Hello, Alex!');

        // Test of the alias 'RegexPattern'
        const hasNumber = e(/\d+/).test('abc-123');
        expect(hasNumber).toBe(true);

        // Test of the multiple aliases for Array
        const myList = e([1, 2, 3]);
        expect(myList.count()).toBe(3);
        expect(myList.isCollection()).toBe(true);

        logSpy.mockRestore();
      });
    });

    describe('_e.instance() - Isolated instances', () => {
      it('should create instances that do not share configurations', () => {
        // We create two different instances
        const myApi = _e.instance('myApi');
        const otherApi = _e.instance('otherApi');

        const mockLog1 = jest.fn(); // Spy for myApi
        const mockLog2 = jest.fn(); // Spy for otherApi

        // We configure each instance with its own mock
        myApi.fn({ String: { log: () => mockLog1('Log from myApi') } });
        otherApi.fn({ String: { log: () => mockLog2('Log from otherApi') } });

        myApi('test').log();
        expect(mockLog1).toHaveBeenCalledWith('Log from myApi');
        expect(mockLog2).not.toHaveBeenCalled();

        otherApi('test').log();
        expect(mockLog2).toHaveBeenCalledWith('Log from otherApi');
        expect(mockLog1).toHaveBeenCalledTimes(1);
      });
    });

    describe('_e.type() - Type identification', () => {
        it('should return an array with the types of an input, from general to specific', () => {
            const types = _e.type({ id: 1 });

            // Checks the order and content of the array
            expect(types).toEqual(expect.any(Array));
            expect(types[0]).toBe('Object');

            // Checks the quick-access property
            expect(types.Object).toBe(true);
        });
    });
  });

  // --- 3. ADVANCED CONCEPTS: HANDLERS ---
  describe('Advanced Concepts: Handlers', () => {
    let e;

    beforeEach(() => {
      e = _e.instance(`handler-test-${Date.now()}${Math.random()}`);
    });

    it('should auto-execute a handler when the types match', () => {
      const handlerMock = jest.fn();
      e.fn({
        String: handlerMock
      });

      e("My first event");
      expect(handlerMock).toHaveBeenCalledTimes(1);
      expect(handlerMock).toHaveBeenCalledWith("My first event");
    });

    it('should execute handlers in sequence, from the most specific to the most general', () => {
      const callOrder = [];
      e.subtype({ Array: 'MyList' }); // An even more specific type

      e.fn({ MyList: () => callOrder.push('MyList') });
      e.fn({ Array: () => callOrder.push('Array') });
      e.fn({ Object: () => callOrder.push('Object') });
      e.fn(() => callOrder.push('Root')); // Root handler

      e([]);

      // According to the documentation, execution goes from the most specific to the most general
      expect(callOrder).toEqual(['MyList', 'Array', 'Object', 'Root']);
    });

    it('should merge methods into a handler without it losing its auto-execution capability', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        // We assign a handler
        e.fn({
            Number: (args) => console.log(`Handler executed for: ${args}`)
        });

        // We merge a method
        e.fn({
            Number: {
                isEven: (args) => args[0] % 2 === 0
            }
        });

        // It auto-executes AND has the method available
        const myNumber = e(10);
        expect(logSpy).toHaveBeenCalledWith('Handler executed for: 10');
        expect(myNumber.isEven()).toBe(true);

        logSpy.mockRestore();
    });

    it('should allow a handler to dynamically overwrite the returned methods', () => {
      e.subtype({
        String: (input) => (input.includes('@') ? 'Email' : false),
      });

      const validateEmail = (args) => {
        const email = args; // Handlers receive spread arguments
        if (email.endsWith('@gmail.com')) {
          return {
            send: () => 'Sending with the Gmail API...',
            addToContacts: () => 'Adding to Google contacts.',
          };
        } else {
          return {
            send: () => 'Sending with generic SMTP...',
          };
        }
      };

      e.fn({ Email: validateEmail });

      // CASE 1: Gmail email
      const gmailUser = e('test@gmail.com');
      expect(gmailUser.send()).toBe('Sending with the Gmail API...');
      expect(gmailUser.addToContacts()).toBe('Adding to Google contacts.');

      // CASE 2: Another email
      const otherUser = e('user@outlook.com');
      expect(otherUser.send()).toBe('Sending with generic SMTP...');
      expect(otherUser.addToContacts).toBeUndefined(); // Verifies that the method does not exist
    });
  });

  // --- 4. EXTRA COVERAGE ---
  describe('Extra coverage: Validations and complex collisions', () => {
    let e;
    let warnSpy;

    beforeEach(() => {
      e = _e.instance(`extra-test-${Date.now()}${Math.random()}`);
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should warn and not register methods with reserved names', async () => {
      e.fn({
        String: {
          toString: () => 'This should not be registered',
        },
      });

      await waitForConsole();

      const result = e('hello');
      expect(typeof result.toString).toBe('function'); // the native version still exists
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Name "toString" is a reserved word')
      );
    });

    it('should warn if an invalid type is passed to _e.fn()', async () => {

      e.fn({
        String: 123, // invalid value, must be Function or Object
      });

      await waitForConsole();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid definition for "fn.String"')
      );
    });

    it('should apply the correct overwrite order in multiple collisions', async () => {
      // Documented order:
      // 1. Subtypes or aliases (most specific)
      // 2. Derived types
      // 3. Main types
      // 4. Global methods (most general) → prevails
      e.subtype({ Array: 'AliasArray' });

      e.fn({ AliasArray: { whoWins: () => 'AliasArray' } });
      e.fn({ Array: { whoWins: () => 'Array' } });
      e.fn({ Object: { whoWins: () => 'Object' } });
      e.fn({ whoWins: () => 'Global' });

      const result = e([]).whoWins();
      expect(result).toBe('Global');

      await waitForConsole();
    });
  });

  describe('Extra coverage: Validations in _e.subtype()', () => {
    let e;
    let warnSpy;
    let errorSpy;

    beforeEach(() => {
      e = _e.instance(`subtype-extra-${Date.now()}${Math.random()}`);
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('should warn when trying to register a subtype with a reserved name', async () => {

      e.subtype({
        Object: 'toString', // Reserved name
      });

      await waitForConsole();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Name "toString" is a reserved word')
      );
    });

    it('should warn if a subtype function returns an invalid value', async () => {

      e.subtype({
          String: () => 42 // Invalid value, neither a string nor true
      });

      // We create a string to trigger the subtype
      e('test');

      await waitForConsole();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('should return a string or `true`')
      );
    });

    it('should catch errors thrown in subtype functions and log them as errors', async () => {

      e.subtype({
        Number: () => {
          throw new Error('Failure in subtype definition');
        },
      });

      e(123); // Runs the subtype function that throws an error

      await waitForConsole();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Subtype definition "Number" function error')
      );
    });

    it('should ignore duplicate aliases and not break execution', () => {
      e.subtype({
        Array: ['Collection', 'Collection'], // Intentional duplicate
      });

      // Register a method for the alias and verify that it works
      e.fn({
        Collection: { ok: () => true },
      });

      const result = e([1, 2, 3]).ok();
      expect(result).toBe(true); // Works even though the alias is repeated
    });
  });

  describe('Extra coverage: final edge cases', () => {
    let e;
    let warnSpy;

    beforeEach(() => {
      e = _e.instance(`final-extra-${Date.now()}${Math.random()}`);
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should warn when trying to register a global method with a reserved name', async () => {

      e.fn({
        toString: () => 'Invalid global method',
      });

      await waitForConsole();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Name "toString" is a reserved word')
      );
    });

    it('should return an empty object if there is no type match', () => {
      // We register nothing
      const result = e(Symbol('no-methods'));

      // The result object must not have own methods
      expect(Object.keys(result)).toHaveLength(0);
      expect(result.constructor).toBe(Object);
    });

    it('should execute the validation functions of nested subtypes only once (performance optimization)', () => {
      const validatorSpy = jest.fn((input) => input.isAdmin ? 'Admin' : false);

      e.subtype({
        Object: {
          Admin: validatorSpy
        }
      });

      // Validation of the number of executions
      e({ isAdmin: true });

      // In v1.18.0 this was 2, unnecessary/redundant. In v1.20.0 it must be strictly 1.
      expect(validatorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Instance options (v1.21.0): collision and args', () => {
    let warnSpy;
    let counter = 0;
    const newName = () => `options-${Date.now()}-${counter++}`;

    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    describe('Default values and configuration', () => {
      it('should default to collision "general" and args "array" (v1.20 behavior)', () => {
        const e = _e.instance(newName());
        expect(e.config()).toEqual({ collision: 'general', args: 'array', handlers: 'exposed', errors: 'console' });
      });

      it('should accept options when creating the instance with .instance(name, options)', () => {
        const e = _e.instance(newName(), { collision: 'specific', args: 'spread' });
        expect(e.config()).toEqual({ collision: 'specific', args: 'spread', handlers: 'exposed', errors: 'console' });
      });

      it('should allow changing options with .config(options) and return the instance for chaining', () => {
        const e = _e.instance(newName());
        expect(e.config({ args: 'spread' })).toBe(e);
        expect(e.config()).toEqual({ collision: 'general', args: 'spread', handlers: 'exposed', errors: 'console' });
      });

      it('.config() should return a copy: modifying it does not affect the instance', () => {
        const e = _e.instance(newName());
        e.config().collision = 'specific';
        expect(e.config().collision).toBe('general');
      });

      it('should ignore invalid options with a warning and keep the current value', async () => {
        const e = _e.instance(newName(), { collision: 'invalid', unknown: true });
        e.config({ args: 123 });
        expect(e.config()).toEqual({ collision: 'general', args: 'array', handlers: 'exposed', errors: 'console' });

        await waitForConsole();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid value for option "collision"'));
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid value for option "args"'));
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown option "unknown" ignored'));
      });

      it('should ignore the .instance() options with a warning if the instance already exists', async () => {
        const name = newName();
        const e = _e.instance(name);
        expect(_e.instance(name, { collision: 'specific' })).toBe(e);
        expect(e.config().collision).toBe('general');

        await waitForConsole();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('The instance already exists'));
      });

      it('should warn if the options are not an object', async () => {
        const e = _e.instance(newName(), 'specific');
        e.config(null);
        expect(e.config()).toEqual({ collision: 'general', args: 'array', handlers: 'exposed', errors: 'console' });

        await waitForConsole();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Options must be an object'));
      });

      it('.fn() and .subtype() should return the instance for chaining, without exposing the internal state', () => {
        const e = _e.instance(newName());
        expect(e.fn({ String: { a: () => 'a' } })).toBe(e);
        expect(e.fn(() => {})).toBe(e);
        expect(e.subtype({ String: 'Text' })).toBe(e);
        expect(e.subtype('browser-dom')).toBe(e);
        expect(e.fn({ Text: { b: () => 'b' } }).subtype({ Number: 'Num' }).config({ args: 'spread' })).toBe(e);
        expect(e('x').b()).toBe('b');
      });

      it('getTypes() in a subtype definition should return a copy of the array/map of detected types', () => {
        const e = _e.instance(newName());
        let detected;
        e.subtype({
          Array: 'Collection',
          Collection: (input, primitiveType, getTypes) => {
            detected = getTypes();
            // Modifying the copy must not affect the result.
            detected.push('Hacked');
            return primitiveType === 'Collection' ? 'List' : false;
          },
        });

        const types = e.type([1]);
        expect(Array.isArray(detected)).toBe(true);
        expect(detected.slice(0, 3)).toEqual(['Object', 'Array', 'Collection']);
        expect(detected['Array']).toBe(true);
        expect([...types]).toEqual(['Object', 'Array', 'Collection', 'List']); // Flat copy: the result also has map keys
        expect(types['Hacked']).toBeUndefined();
      });

      it('the options of one instance should not affect another', () => {
        const a = _e.instance(newName(), { collision: 'specific', args: 'spread' });
        const b = _e.instance(newName());
        expect(a.config()).toEqual({ collision: 'specific', args: 'spread', handlers: 'exposed', errors: 'console' });
        expect(b.config()).toEqual({ collision: 'general', args: 'array', handlers: 'exposed', errors: 'console' });
      });
    });

    describe('collision: specificity order in collisions', () => {
      const register = (e) => e.fn({
        Array: { who: () => 'Array' },
        Object: { who: () => 'Object' },
        who: () => 'Global',
      });

      it('"general" (default): the most general one (the global) prevails', () => {
        const e = _e.instance(newName());
        register(e);
        expect(e([1, 2]).who()).toBe('Global');
      });

      it('"specific": the most specific one prevails (Array over Object and over the global)', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        register(e);
        expect(e([1, 2]).who()).toBe('Array');
      });

      it('"specific": without a more specific type the next one (Object) is used, and the global is only a fallback', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        register(e);
        expect(e({}).who()).toBe('Object');
        expect(e('text').who()).toBe('Global');
      });

      it('"specific": a subtype or alias prevails over the main type', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        e.subtype({ Array: 'Collection' });
        e.fn({
          Collection: { who: () => 'Collection' },
          Array: { who: () => 'Array' },
          Object: { who: () => 'Object' },
        });
        expect(e.type([1])).toEqual(expect.arrayContaining(['Array', 'Collection']));
        expect(e([1]).who()).toBe('Collection');
      });

      it('"specific": should work with multi-argument sequences', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        e.fn({
          Array: { String: { who: () => 'Array+String' } },
          Object: { String: { who: () => 'Object+String' } },
        });
        expect(e([1], 'a').who()).toBe('Array+String');
      });

      it('"specific": in sequences with several levels of specificity, the most specific one in each argument prevails (the first one weighs more)', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        e.subtype({ String: 'Text' });
        e.fn({
          Object: { String: { who: () => 'Object+String' }, Text: { who: () => 'Object+Text' } },
          Array: { String: { who: () => 'Array+String' }, Text: { who: () => 'Array+Text' } },
          who: () => 'Global',
        });
        expect(e([1], 'a').who()).toBe('Array+Text');
        expect(e({}, 'a').who()).toBe('Object+Text');
        expect(e([1], 1).who()).toBe('Global');
      });

      it('"specific": uses the general sequence if it is the only one that matches, even if a more specific one exists on another path', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        e.fn({
          Object: { String: { who: () => 'Object+String' } },
          Array: { Number: { who: () => 'Array+Number' } },
        });
        expect(e([1], 'a').who()).toBe('Object+String');
      });

      it('"specific": should warn about the collision, indicating that the general definition was ignored', async () => {
        const name = newName();
        const e = _e.instance(name, { collision: 'specific' });
        register(e);
        e([1]);

        await waitForConsole();
        // The spy is global: only the messages of this instance are kept.
        const messages = warnSpy.mock.calls.map(call => call[0]).filter(m => m.includes('(' + name + ')'));
        expect(messages.some(m => m.includes('was ignored because a more specific definition'))).toBe(true);
        expect(messages.some(m => m.includes('is overwriting'))).toBe(false);
      });

      it('"specific": should not change the execution order of handlers (specific -> general)', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        const order = [];
        e.fn({
          Array: () => { order.push('Array'); },
          Object: () => { order.push('Object'); },
        });
        e.fn(() => { order.push('root'); });
        e([1]);
        expect(order).toEqual(['Array', 'Object', 'root']);
      });

      it('"specific": the methods returned by a handler also respect the order', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        e.fn({
          Array: () => ({ who: () => 'Array handler' }),
          Object: { who: () => 'Object' },
        });
        expect(e([1]).who()).toBe('Array handler');
      });

      it('can be changed on the fly with .config() for subsequent calls', () => {
        const e = _e.instance(newName());
        register(e);
        expect(e([1]).who()).toBe('Global');
        e.config({ collision: 'specific' });
        expect(e([1]).who()).toBe('Array');
        e.config({ collision: 'general' });
        expect(e([1]).who()).toBe('Global');
      });
    });

    describe('args: how arguments are passed to methods', () => {
      it('"array" (default): ([dispatcher args], ...method args)', () => {
        const e = _e.instance(newName());
        const spy = jest.fn();
        e.fn({ String: { Number: { m: spy } } });
        e('a', 1).m('x', 'y');
        expect(spy).toHaveBeenCalledWith(['a', 1], 'x', 'y');
      });

      it('"spread": (...dispatcher args, [method args])', () => {
        const e = _e.instance(newName(), { args: 'spread' });
        const spy = jest.fn();
        e.fn({ String: { Number: { m: spy } } });
        e('a', 1).m('x', 'y');
        expect(spy).toHaveBeenCalledWith('a', 1, ['x', 'y']);
      });

      it('"spread": the method arguments array is [] if called without arguments', () => {
        const e = _e.instance(newName(), { args: 'spread' });
        const spy = jest.fn();
        e.fn({ String: { m: spy } });
        e('a').m();
        expect(spy).toHaveBeenCalledWith('a', []);
      });

      it('"spread": allows using named parameters and returns the result of the method', () => {
        const e = _e.instance(newName(), { args: 'spread' });
        e.fn({
          Array: { String: { join: (arr, sep, [prefix]) => prefix + arr.join(sep) } },
        });
        expect(e([1, 2, 3], '-').join('>')).toBe('>1-2-3');
      });

      it('"spread": also applies to global methods', () => {
        const e = _e.instance(newName(), { args: 'spread' });
        const spy = jest.fn();
        e.fn({ global: spy });
        e(1, 2, 3).global('z');
        expect(spy).toHaveBeenCalledWith(1, 2, 3, ['z']);
      });

      it('"spread": handlers still receive the arguments directly', () => {
        const e = _e.instance(newName(), { args: 'spread' });
        const handler = jest.fn();
        e.fn({ String: { String: handler } });
        e('a', 'b');
        expect(handler).toHaveBeenCalledWith('a', 'b');
      });

      it('"spread": `this` is still the result object (chaining)', () => {
        const e = _e.instance(newName(), { args: 'spread' });
        e.fn({ String: { self: function(){ return this; } } });
        const result = e('a');
        expect(result.self()).toBe(result);
      });

      it('"spread": an error in the method is handled as before (it is logged and the result is returned)', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const e = _e.instance(newName(), { args: 'spread' });
        e.fn({ String: { boom: () => { throw new Error('failure'); } } });
        const result = e('a');
        expect(result.boom()).toBe(result);

        await waitForConsole();
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Method "boom" error'));
        errorSpy.mockRestore();
      });

      it('can be changed on the fly with .config(): affects the results of subsequent calls', () => {
        const e = _e.instance(newName());
        const spy = jest.fn();
        e.fn({ String: { m: spy } });

        e('a').m('x');
        e.config({ args: 'spread' });
        e('a').m('x');

        expect(spy).toHaveBeenNthCalledWith(1, ['a'], 'x');
        expect(spy).toHaveBeenNthCalledWith(2, 'a', ['x']);
      });

      it('"collision" and "args" can be combined', () => {
        const e = _e.instance(newName(), { collision: 'specific', args: 'spread' });
        e.fn({
          Array: { who: (arr, [suffix]) => 'Array' + suffix },
          Object: { who: () => 'Object' },
        });
        expect(e([1]).who('!')).toBe('Array!');
      });
    });
  });

  describe('Functional fixes (v1.22.0)', () => {
    let warnSpy;
    let errorSpy;
    let counter = 0;
    const newName = () => `fixes-${Date.now()}-${counter++}`;
    // The spies are global: only the messages of the given instance are kept.
    const messagesOf = (spy, name) => spy.mock.calls.map(call => call[0]).filter(m => m.includes('(' + name + ')'));

    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    describe('New options: handlers and errors', () => {
      it('should default to handlers "exposed" and errors "console" (v1.21 behavior)', () => {
        const e = _e.instance(newName());
        expect(e.config()).toEqual({ collision: 'general', args: 'array', handlers: 'exposed', errors: 'console' });
      });

      it('should accept them in .instance() and in .config(), and ignore invalid values with a warning', async () => {
        const name = newName();
        const e = _e.instance(name, { handlers: 'hidden', errors: 'throw' });
        expect(e.config()).toEqual({ collision: 'general', args: 'array', handlers: 'hidden', errors: 'throw' });

        e.config({ handlers: 'none', errors: true });
        expect(e.config().handlers).toBe('hidden');
        expect(e.config().errors).toBe('throw');

        await waitForConsole();
        const warnings = messagesOf(warnSpy, name);
        expect(warnings.some(m => m.includes('Invalid value for option "handlers"'))).toBe(true);
        expect(warnings.some(m => m.includes('Invalid value for option "errors"'))).toBe(true);
      });
    });

    describe('handlers: handlers as methods', () => {
      it('"exposed" (default): a handler is also attached as a method, as in previous versions', () => {
        const e = _e.instance(newName());
        const handler = jest.fn();
        e.fn({ String: handler });

        expect(Object.keys(e(5))).toEqual(['String']);
        expect(handler).not.toHaveBeenCalled();
      });

      it('"hidden": a handler is not attached as a method and is still executed', () => {
        const e = _e.instance(newName(), { handlers: 'hidden' });
        // A plain function instead of jest.fn(): a mock has its own methods, which would be attached as methods of the type.
        const calls = [];
        e.fn({ String: (input) => { calls.push(input); } });

        expect(Object.keys(e(5))).toEqual([]);
        expect(calls).toEqual([]);
        expect(Object.keys(e('text'))).toEqual([]);
        expect(calls).toEqual(['text']);
      });

      it('"hidden": keeps the methods of the type, the global ones and the ones returned by a handler', () => {
        const e = _e.instance(newName(), { handlers: 'hidden' });
        e.fn({
          String: () => ({ fromHandler: () => 'handler' }),
          Number: { double: (args) => args[0] * 2 },
          global: () => 'global',
        });

        const text = e('a');
        expect(Object.keys(text).sort()).toEqual(['fromHandler', 'global']);
        expect(text.fromHandler()).toBe('handler');

        const number = e(4);
        expect(Object.keys(number).sort()).toEqual(['double', 'global']);
        expect(number.double()).toBe(8);
        expect(number.global()).toBe('global');
      });

      it('"hidden": a capitalized name is a type and a lowercase name is a method', () => {
        const e = _e.instance(newName(), { handlers: 'hidden' });
        e.fn({ Log: () => 'type', log: () => 'method' });

        expect(Object.keys(e(1))).toEqual(['log']);
      });

      it('"hidden": sequence handlers do not generate a collision warning among themselves', async () => {
        const exposedName = newName();
        const hiddenName = newName();
        const register = (e) => e.fn({ Array: { String: () => {} }, Object: { String: () => {} } });
        const exposed = register(_e.instance(exposedName));
        const hidden = register(_e.instance(hiddenName, { handlers: 'hidden' }));

        expect(Object.keys(exposed([1]))).toEqual(['String']);
        expect(Object.keys(hidden([1]))).toEqual([]);

        await waitForConsole();
        expect(messagesOf(warnSpy, exposedName).some(m => m.includes('Conflict for "String"'))).toBe(true);
        expect(messagesOf(warnSpy, hiddenName)).toEqual([]);
      });

      it('can be changed on the fly with .config() for subsequent calls', () => {
        const e = _e.instance(newName());
        e.fn({ String: () => {} });

        expect(Object.keys(e(5))).toEqual(['String']);
        e.config({ handlers: 'hidden' });
        expect(Object.keys(e(5))).toEqual([]);
      });
    });

    describe('Registration: the first registered function prevails', () => {
      it('should keep the first handler (of a type and root) and warn that the second one was ignored', async () => {
        const name = newName();
        const e = _e.instance(name);
        const calls = [];
        e.fn({ String: () => { calls.push('first'); } });
        e.fn({ String: () => { calls.push('second'); } });
        e.fn(() => { calls.push('root first'); });
        e.fn(() => { calls.push('root second'); });

        e('x');
        expect(calls).toEqual(['first', 'root first']);

        await waitForConsole();
        const warnings = messagesOf(warnSpy, name);
        expect(warnings.some(m => m.includes('already registered for "String"'))).toBe(true);
        expect(warnings.some(m => m.includes('already registered for "Any"'))).toBe(true);
      });

      it('should keep the first method registered under a name and warn that the second one was ignored', async () => {
        const name = newName();
        const e = _e.instance(name);
        e.fn({ String: { v: () => 'first' }, g: () => 'global first' });
        e.fn({ String: { v: () => 'second' }, g: () => 'global second' });

        expect(e('s').v()).toBe('first');
        expect(e('s').g()).toBe('global first');

        await waitForConsole();
        const warnings = messagesOf(warnSpy, name);
        expect(warnings.some(m => m.includes('already registered for "v"'))).toBe(true);
        expect(warnings.some(m => m.includes('already registered for "g"'))).toBe(true);
      });

      it('should not warn when registering the same function again or when merging new methods', async () => {
        const name = newName();
        const e = _e.instance(name);
        const handler = () => {};
        const method = () => 1;
        e.fn({ String: handler, Number: { m: method } });
        e.fn({ String: handler, Number: { m: method, other: () => 2 } });
        e.fn({ String: { extra: () => 3 } });

        expect(e(1).m()).toBe(1);
        expect(e(1).other()).toBe(2);
        expect(e('s').extra()).toBe(3);

        await waitForConsole();
        expect(messagesOf(warnSpy, name)).toEqual([]);
      });
    });

    describe('Value returned by a handler', () => {
      it('should keep the merged methods if the handler returns something that is neither an object nor a function', () => {
        [true, 5, 'text', null, undefined, 0, false].forEach((returned) => {
          const e = _e.instance(newName());
          e.fn({ String: { m: () => 'ok' } });
          e.fn({ String: () => returned });

          expect(e('x').m()).toBe('ok');
        });
      });

      it('should replace the merged methods if the handler returns an object or a function', () => {
        const e = _e.instance(newName());
        const withMethods = () => {};
        withMethods.fromFunction = () => 'function';
        e.fn({ String: { m: () => 'original' }, Number: { m: () => 'original' }, Boolean: { m: () => 'original' } });
        e.fn({ String: () => ({ replaced: () => 'object' }), Number: () => withMethods, Boolean: () => ({}) });

        const text = e('x');
        expect(text.replaced()).toBe('object');
        expect(text.m).toBeUndefined();

        const number = e(1);
        expect(number.fromFunction()).toBe('function');
        expect(number.m).toBeUndefined();

        // An empty object is the way to leave the result without the methods of the type.
        expect(e(true).m).toBeUndefined();
      });
    });

    describe('Predefined sets of subtypes', () => {
      it('should warn and register nothing if the set name does not exist', async () => {
        const name = newName();
        const e = _e.instance(name);

        expect(e.subtype('browser-doms')).toBe(e);
        expect(e.subtype('toString')).toBe(e);
        expect([...e.type('x')]).toEqual(['String']);

        await waitForConsole();
        const warnings = messagesOf(warnSpy, name);
        expect(warnings.some(m => m.includes('Unknown predefined set of subtypes "browser-doms"'))).toBe(true);
        expect(warnings.some(m => m.includes('Unknown predefined set of subtypes "toString"'))).toBe(true);
      });

      it('should still register the existing predefined sets without warning', async () => {
        const name = newName();
        const e = _e.instance(name).subtype('browser-dom').subtype('object-constructors');

        expect([...e.type(new Date())]).toEqual(['Object', 'Date']);

        await waitForConsole();
        expect(messagesOf(warnSpy, name)).toEqual([]);
      });
    });

    describe('Registration without executing the subtype definitions', () => {
      it('should not execute the evaluator functions when registering with .fn() or .subtype()', async () => {
        const name = newName();
        const e = _e.instance(name);
        // This function fails with any object without `profile`, such as the definition objects.
        const evaluator = jest.fn((input) => (input.profile.role === 'admin' ? 'Admin' : false));

        e.subtype({ Object: { Admin: evaluator } });
        e.subtype({ Admin: 'Superuser', Array: ['List'] });
        e.fn({ Object: { m: () => 1 }, Admin: { grant: () => 'ok' }, Array: { n: () => 2 } });
        expect(evaluator).not.toHaveBeenCalled();

        const admin = e({ profile: { role: 'admin' } });
        expect(evaluator).toHaveBeenCalledTimes(1);
        expect(admin.grant()).toBe('ok');

        await waitForConsole();
        expect(messagesOf(errorSpy, name)).toEqual([]);
      });
    });

    describe('Disallowed subtype names', () => {
      it('should warn if a subtype uses the name of a native member of the types array', async () => {
        const name = newName();
        const e = _e.instance(name);
        e.subtype({ String: { Short: () => 'map', Text: () => 'PlainText' }, Number: 'filter' });

        const types = e.type('x');
        expect([...types]).toEqual(['String', 'PlainText']);
        expect(typeof types.map).toBe('function');
        expect([...e.type(1)]).toEqual(['Number']);

        await waitForConsole();
        const warnings = messagesOf(warnSpy, name);
        expect(warnings.some(m => m.includes('Subtype name "map" cannot be used'))).toBe(true);
        expect(warnings.some(m => m.includes('Subtype name "filter" cannot be used'))).toBe(true);
      });

      it('should not warn when an already detected type is detected again', async () => {
        const name = newName();
        const e = _e.instance(name);
        e.subtype({ Array: ['List', 'List'], String: { A: () => 'Text', B: () => 'Text' } });

        expect([...e.type([])]).toEqual(['Object', 'Array', 'List']);
        expect([...e.type('x')]).toEqual(['String', 'Text']);
        expect([...e.type({})]).toEqual(['Object']);

        await waitForConsole();
        expect(messagesOf(warnSpy, name)).toEqual([]);
      });
    });

    describe('errors: error propagation', () => {
      it('"console" (default): errors are logged with the same message and the flow continues', async () => {
        const name = newName();
        const e = _e.instance(name);
        e.subtype({ Number: () => { throw new Error('subtype'); } });
        e.fn({ String: () => { throw new Error('handler'); }, Boolean: { boom: () => { throw new Error('method'); } } });

        expect(() => e(1)).not.toThrow();
        expect(() => e('x')).not.toThrow();
        const result = e(true);
        expect(result.boom()).toBe(result);

        // It can be changed on the fly: the option applies at the moment the error occurs.
        e.config({ errors: 'throw' });
        expect(() => result.boom()).toThrow('method');
        e.config({ errors: 'console' });
        expect(result.boom()).toBe(result);

        await waitForConsole();
        const errors = messagesOf(errorSpy, name);
        expect(errors.some(m => m.includes('Subtype definition "Number" function error: Error: subtype'))).toBe(true);
        expect(errors.some(m => m.includes('Type handler function "String" error: Error: handler'))).toBe(true);
        expect(errors.some(m => m.includes('Method "boom" error: Error: method'))).toBe(true);
      });

      it('"throw": rethrows the original error of methods, handlers and subtype functions, without writing to the console', async () => {
        const name = newName();
        const e = _e.instance(name, { errors: 'throw' });
        const subtypeError = new TypeError('subtype');
        const handlerError = new RangeError('handler');
        const methodError = new Error('method');
        e.subtype({ Number: () => { throw subtypeError; } });
        e.fn({ String: () => { throw handlerError; }, Boolean: { boom: () => { throw methodError; } } });

        const caught = (run) => { try { run(); } catch(error){ return error; } };
        expect(caught(() => e(1))).toBe(subtypeError);
        expect(caught(() => e.type(1))).toBe(subtypeError);
        expect(caught(() => e('x'))).toBe(handlerError);
        expect(caught(() => e(true).boom())).toBe(methodError);

        await waitForConsole();
        expect(messagesOf(errorSpy, name)).toEqual([]);
      });
    });
  });

  describe('ESM build: parity with the UMD build', () => {
    // Jest cannot load the .mjs with require(), so it is run in a Node child process.
    const runInESM = (body) => {
      const url = pathToFileURL(path.join(__dirname, 'dist', 'estructura.esm.mjs')).href;
      const script = `import _e from ${JSON.stringify(url)}; const out = (() => { ${body} })(); console.log(JSON.stringify(out));`;
      return JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' }).trim());
    };

    it('should default-export the instance with the full API', () => {
      expect(runInESM(`return ['fn', 'subtype', 'type', 'instance', 'config'].map((k) => typeof _e[k]);`)).toEqual(['function', 'function', 'function', 'function', 'function']);
    });

    it('should execute the validation functions of nested subtypes only once (same as the UMD build)', () => {
      expect(runInESM(`
        const e = _e.instance('esm-nested'); let calls = 0;
        e.subtype({ Object: { Admin: (input) => { calls++; return input.isAdmin ? 'Admin' : false; } } });
        return [calls, e({ isAdmin: true }) && calls, [...e.type({ isAdmin: true })]];
      `)).toEqual([0, 1, ['Object', 'Admin']]);
    });

    it('should support the collision and args options, chaining and getTypes()', () => {
      expect(runInESM(`
        const e = _e.instance('esm-options', { collision: 'specific', args: 'spread' });
        let seen;
        e.subtype({ Array: 'Collection', Collection: (input, primitiveType, getTypes) => { seen = [...getTypes()]; return true; } })
         .fn({ Array: { who: (arr, [suffix]) => 'Array' + suffix }, Object: { who: () => 'Object' }, who: () => 'Global' });
        return [e.config(), e([1]).who('!'), e({}).who(), e('s').who(), seen, e.fn(() => {}) === e];
      `)).toEqual([{ collision: 'specific', args: 'spread', handlers: 'exposed', errors: 'console' }, 'Array!', 'Object', 'Global', ['Object', 'Array', 'Collection'], true]);
    });

    it('should support the handlers and errors options and the v1.22.0 fixes (same as the UMD build)', () => {
      expect(runInESM(`
        const e = _e.instance('esm-fixes', { handlers: 'hidden', errors: 'throw' });
        let calls = 0, thrown = null;
        e.subtype({ Object: { Admin: (input) => { calls++; return input.isAdmin ? 'Admin' : false; } } })
         .fn({ String: () => true, Number: { boom: () => { throw new Error('failure'); } }, Object: { m: () => 1 } })
         .fn({ String: { kept: () => 'kept' } });
        try { e(1).boom(); } catch(error){ thrown = error.message; }
        return [e.config(), calls, Object.keys(e('x')), e('x').kept(), thrown];
      `)).toEqual([{ collision: 'general', args: 'array', handlers: 'hidden', errors: 'throw' }, 0, ['kept'], 'kept', 'failure']);
    });
  });

});
