const _e = require('./dist/estructura.umd');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
const path = require('path');

// Estructura utiliza un temporizador interno fijo de 1000 ms
// antes de emitir advertencias o errores asíncronos.
// Esperamos 1010 ms para asegurarnos de que el mensaje se ha procesado.
const waitForConsole = (ms = 1010) => new Promise(resolve => setTimeout(resolve, ms));

describe('Estructura Framework v1.21.0 - Pruebas Unitarias', () => {

  // --- 1. GUÍA DE INICIO RÁPIDO ---
  describe('Guía de Inicio Rápido', () => {
    it('debería despachar métodos basados en los tipos de los argumentos', () => {
      const e = _e.instance('quickstart'); // Instancia aislada
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      e.fn({
        Array: {
          log: (args) => console.log(`Un array: ${args[0]}`),
        },
        Number: {
          log: (args) => console.log(`Un número: ${args[0]}`),
        },
        String: {
          Number: {
            combine: (args) => console.log(`Combinado: ${args[0]} y ${args[1]}`),
          },
        },
      });

      e(['hola']).log();
      expect(logSpy).toHaveBeenCalledWith('Un array: hola');

      e(12345).log();
      expect(logSpy).toHaveBeenCalledWith('Un número: 12345');

      e('texto', 67890).combine();
      expect(logSpy).toHaveBeenCalledWith('Combinado: texto y 67890');

      logSpy.mockRestore();
    });
  });

  // --- 2. DOCUMENTACIÓN DE LA API ---
  describe('Documentación de la API', () => {
    let e;

    beforeEach(() => {
      // Crea una instancia fresca para cada prueba en esta sección
      e = _e.instance(`api-test-${Date.now()}${Math.random()}`);
    });

    describe('_e.fn() - Registro de funciones', () => {
      it('debería registrar un método que opera sobre un objeto', () => {
        e.fn({
          Object: {
            keys: (args) => Object.keys(args[0]),
          },
        });
        const keys = e({ a: 1, b: 2 }).keys();
        expect(keys).toEqual(['a', 'b']);
      });

      it('debería registrar métodos que aceptan argumentos adicionales', () => {
        e.fn({
          String: {
            repeat: (args, times) => args[0].repeat(times),
          },
        });
        const repeated = e('hola ').repeat(3);
        expect(repeated).toBe('hola hola hola ');
      });

      it('debería registrar métodos "globales" disponibles para cualquier tipo', () => {
        const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
        e.fn({
          timestamp: () => `Procesado a las: ${Date.now()}`,
        });

        expect(e(123).timestamp()).toBe('Procesado a las: 1700000000000');
        expect(e('abc').timestamp()).toBe('Procesado a las: 1700000000000');
        dateSpy.mockRestore();
      });

      it('debería fusionar registros de métodos para el mismo tipo (registro aditivo)', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        // Registro inicial
        e.fn({
          String: {
            log: (args) => console.log(`[LOG]: ${args[0]}`),
          },
        });
        // Registro de "plugin"
        e.fn({
          String: {
            wordCount: (args) => args[0].split(' ').length,
          },
        });

        const miFrase = e('Estructura es muy flexible');
        miFrase.log();
        expect(logSpy).toHaveBeenCalledWith('[LOG]: Estructura es muy flexible');
        expect(miFrase.wordCount()).toBe(4);
        logSpy.mockRestore();
      });

      it('debería sobrescribir métodos específicos con otros más generales (regla de colisión)', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        e.subtype({ Array: 'CustomList' });

        e.fn({ CustomList: { getPriority: () => 1 } }); // Más específico
        e.fn({ Array: { getPriority: () => 2 } });
        e.fn({ Object: { getPriority: () => 3 } });
        e.fn({ getPriority: () => 4 }); // Global (más general)

        // Según la documentación, el más general (global) debe prevalecer.
        const result = e([]).getPriority();
        expect(result).toBe(4);

        await waitForConsole();
        warnSpy.mockRestore();
      });
    });

    describe('Argumentos para Métodos vs. Manejadores', () => {
        it('debería pasar argumentos agrupados en un array a los MÉTODOS', () => {
            const methodMock = jest.fn();
            e.fn({
                String: { myMethod: methodMock }
            });

            e('Hola').myMethod('extra-arg');
            // El primer argumento del método es el array con los argumentos de `_e()`
            expect(methodMock).toHaveBeenCalledWith(['Hola'], 'extra-arg');
        });

        it('debería pasar argumentos desplegados directamente a los MANEJADORES', () => {
            const handlerMock = jest.fn();
            e.fn({
                String: {
                  String: handlerMock
                }
            });

            e('Hola', 'Mundo');
            expect(handlerMock).toHaveBeenCalledWith('Hola', 'Mundo');
        });
    });

    describe('_e.subtype() - Registro de tipos', () => {
      it('debería registrar y utilizar subtipos, alias y subtipos funcionales', async () => {
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

        // Prueba del subtipo funcional 'User'
        const user = { userId: 'u-123', name: 'Alex' };
        e(user).hello();
        expect(logSpy).toHaveBeenCalledWith('Hello, Alex!');

        // Prueba del alias 'RegexPattern'
        const hasNumber = e(/\d+/).test('abc-123');
        expect(hasNumber).toBe(true);

        // Prueba de los alias múltiples para Array
        const miLista = e([1, 2, 3]);
        expect(miLista.count()).toBe(3);
        expect(miLista.isCollection()).toBe(true);

        logSpy.mockRestore();
      });
    });

    describe('_e.instance() - Instancias aisladas', () => {
      it('debería crear instancias que no comparten configuraciones', () => {
        // Creamos dos instancias diferentes
        const miApi = _e.instance('miApi');
        const otraApi = _e.instance('otraApi');

        const mockLog1 = jest.fn(); // Spy para miApi
        const mockLog2 = jest.fn(); // Spy para otraApi

        // Configuramos cada instancia con su mock propio
        miApi.fn({ String: { log: () => mockLog1('Log de miApi') } });
        otraApi.fn({ String: { log: () => mockLog2('Log de otraApi') } });

        miApi('test').log();
        expect(mockLog1).toHaveBeenCalledWith('Log de miApi');
        expect(mockLog2).not.toHaveBeenCalled();

        otraApi('test').log();
        expect(mockLog2).toHaveBeenCalledWith('Log de otraApi');
        expect(mockLog1).toHaveBeenCalledTimes(1);
      });
    });

    describe('_e.type() - Identificación de tipos', () => {
        it('debería devolver un array con los tipos de un input, de general a específico', () => {
            const types = _e.type({ id: 1 });

            // Comprueba el orden y contenido del array
            expect(types).toEqual(expect.any(Array));
            expect(types[0]).toBe('Object');

            // Comprueba la propiedad de acceso rápido
            expect(types.Object).toBe(true);
        });
    });
  });

  // --- 3. CONCEPTOS AVANZADOS: MANEJADORES ---
  describe('Conceptos Avanzados: Manejadores', () => {
    let e;

    beforeEach(() => {
      e = _e.instance(`handler-test-${Date.now()}${Math.random()}`);
    });

    it('debería auto-ejecutar un manejador cuando los tipos coinciden', () => {
      const handlerMock = jest.fn();
      e.fn({
        String: handlerMock
      });

      e("Mi primer evento");
      expect(handlerMock).toHaveBeenCalledTimes(1);
      expect(handlerMock).toHaveBeenCalledWith("Mi primer evento");
    });

    it('debería ejecutar manejadores en secuencia, del más específico al más general', () => {
      const callOrder = [];
      e.subtype({ Array: 'MyList' }); // Un tipo aún más específico

      e.fn({ MyList: () => callOrder.push('MyList') });
      e.fn({ Array: () => callOrder.push('Array') });
      e.fn({ Object: () => callOrder.push('Object') });
      e.fn(() => callOrder.push('Raíz')); // Manejador raíz

      e([]);

      // Según la documentación, la ejecución es del más específico al más general
      expect(callOrder).toEqual(['MyList', 'Array', 'Object', 'Raíz']);
    });

    it('debería fusionar métodos en un manejador sin que este pierda su capacidad de auto-ejecución', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        // Asignamos un manejador
        e.fn({
            Number: (args) => console.log(`Manejador ejecutado para: ${args}`)
        });

        // Fusionamos un método
        e.fn({
            Number: {
                isEven: (args) => args[0] % 2 === 0
            }
        });

        // Se auto-ejecuta Y tiene el método disponible
        const miNumero = e(10);
        expect(logSpy).toHaveBeenCalledWith('Manejador ejecutado para: 10');
        expect(miNumero.isEven()).toBe(true);

        logSpy.mockRestore();
    });

    it('debería permitir a un manejador sobrescribir dinámicamente los métodos devueltos', () => {
      e.subtype({
        String: (input) => (input.includes('@') ? 'Email' : false),
      });

      const validateEmail = (args) => {
        const email = args; // Los manejadores reciben argumentos desplegados
        if (email.endsWith('@gmail.com')) {
          return {
            send: () => 'Enviando con la API de Gmail...',
            addToContacts: () => 'Añadiendo a contactos de Google.',
          };
        } else {
          return {
            send: () => 'Enviando con SMTP genérico...',
          };
        }
      };

      e.fn({ Email: validateEmail });

      // CASO 1: Email de Gmail
      const gmailUser = e('test@gmail.com');
      expect(gmailUser.send()).toBe('Enviando con la API de Gmail...');
      expect(gmailUser.addToContacts()).toBe('Añadiendo a contactos de Google.');

      // CASO 2: Otro email
      const otherUser = e('user@outlook.com');
      expect(otherUser.send()).toBe('Enviando con SMTP genérico...');
      expect(otherUser.addToContacts).toBeUndefined(); // Verifica que el método no existe
    });
  });

  // --- 4. COBERTURAS EXTRAS ---
  describe('Cobertura extra: Validaciones y colisiones complejas', () => {
    let e;
    let warnSpy;

    beforeEach(() => {
      e = _e.instance(`extra-test-${Date.now()}${Math.random()}`);
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('debería advertir y no registrar métodos con nombres reservados', async () => {
      e.fn({
        String: {
          toString: () => 'Esto no debería registrarse',
        },
      });

      await waitForConsole();

      const result = e('hola');
      expect(typeof result.toString).toBe('function'); // aún existe la versión nativa
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Name "toString" is a reserved word')
      );
    });

    it('debería advertir si se pasa un tipo no válido a _e.fn()', async () => {

      e.fn({
        String: 123, // valor inválido, debe ser Function u Object
      });

      await waitForConsole();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid definition for "fn.String"')
      );
    });

    it('debería aplicar el orden de sobrescritura correcto en colisiones múltiples', async () => {
      // Orden documentado:
      // 1. Subtipos o alias (más específicos)
      // 2. Tipos derivados
      // 3. Tipos principales
      // 4. Métodos globales (más generales) → prevalece
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

  describe('Cobertura extra: Validaciones en _e.subtype()', () => {
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

    it('debería advertir si se intenta registrar un subtipo con nombre reservado', async () => {

      e.subtype({
        Object: 'toString', // Nombre reservado
      });

      await waitForConsole();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Name "toString" is a reserved word')
      );
    });

    it('debería advertir si un función de subtipo devuelve un valor no válido', async () => {

      e.subtype({
          String: () => 42 // Valor inválido, no string ni true
      });

      // Creamos un string para disparar el subtipo
      e('test');

      await waitForConsole();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('should return a string or `true`')
      );
    });

    it('debería capturar errores lanzados en funciones de subtipo y registrarlos como error', async () => {

      e.subtype({
        Number: () => {
          throw new Error('Fallo en definición de subtipo');
        },
      });

      e(123); // Ejecuta la función de subtipo que lanza error

      await waitForConsole();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Subtype definition "Number" function error')
      );
    });

    it('debería ignorar alias duplicados y no romper la ejecución', () => {
      e.subtype({
        Array: ['Collection', 'Collection'], // Duplicado intencional
      });

      // Registrar método para el alias y verificar que funciona
      e.fn({
        Collection: { ok: () => true },
      });

      const result = e([1, 2, 3]).ok();
      expect(result).toBe(true); // Funciona aunque el alias esté repetido
    });
  });

  describe('Cobertura extra: casos límite finales', () => {
    let e;
    let warnSpy;

    beforeEach(() => {
      e = _e.instance(`final-extra-${Date.now()}${Math.random()}`);
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('debería advertir si se intenta registrar un método global con nombre reservado', async () => {

      e.fn({
        toString: () => 'Método global inválido',
      });

      await waitForConsole();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Name "toString" is a reserved word')
      );
    });

    it('debería devolver un objeto vacío si no hay coincidencia de tipo', () => {
      // No registramos nada
      const result = e(Symbol('sin-métodos'));

      // El objeto resultado no debe tener métodos propios
      expect(Object.keys(result)).toHaveLength(0);
      expect(result.constructor).toBe(Object);
    });

    it('debería ejecutar las funciones de validación de subtipos anidados una sola vez (optimización de rendimiento)', () => {
      const validatorSpy = jest.fn((input) => input.isAdmin ? 'Admin' : false);

      e.subtype({
        Object: {
          Admin: validatorSpy
        }
      });

      // Validación de número de ejecuciones
      e({ isAdmin: true });

      // En la v1.18.0 esto era 2, innecesario/redundante. En la v1.20.0 debe ser estrictamente 1.
      expect(validatorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Opciones de instancia (v1.21.0): collision y args', () => {
    let warnSpy;
    let counter = 0;
    const newName = () => `options-${Date.now()}-${counter++}`;

    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    describe('Valores por defecto y configuración', () => {
      it('debería tener por defecto collision "general" y args "array" (comportamiento de la v1.20)', () => {
        const e = _e.instance(newName());
        expect(e.config()).toEqual({ collision: 'general', args: 'array' });
      });

      it('debería aceptar opciones al crear la instancia con .instance(name, options)', () => {
        const e = _e.instance(newName(), { collision: 'specific', args: 'spread' });
        expect(e.config()).toEqual({ collision: 'specific', args: 'spread' });
      });

      it('debería permitir cambiar opciones con .config(options) y devolver la instancia para encadenar', () => {
        const e = _e.instance(newName());
        expect(e.config({ args: 'spread' })).toBe(e);
        expect(e.config()).toEqual({ collision: 'general', args: 'spread' });
      });

      it('.config() debería devolver una copia: modificarla no afecta a la instancia', () => {
        const e = _e.instance(newName());
        e.config().collision = 'specific';
        expect(e.config().collision).toBe('general');
      });

      it('debería ignorar con advertencia las opciones inválidas y conservar el valor actual', async () => {
        const e = _e.instance(newName(), { collision: 'invalid', unknown: true });
        e.config({ args: 123 });
        expect(e.config()).toEqual({ collision: 'general', args: 'array' });

        await waitForConsole();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid value for option "collision"'));
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid value for option "args"'));
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown option "unknown" ignored'));
      });

      it('debería ignorar con advertencia las opciones de .instance() si la instancia ya existe', async () => {
        const name = newName();
        const e = _e.instance(name);
        expect(_e.instance(name, { collision: 'specific' })).toBe(e);
        expect(e.config().collision).toBe('general');

        await waitForConsole();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('The instance already exists'));
      });

      it('debería advertir si las opciones no son un objeto', async () => {
        const e = _e.instance(newName(), 'specific');
        e.config(null);
        expect(e.config()).toEqual({ collision: 'general', args: 'array' });

        await waitForConsole();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Options must be an object'));
      });

      it('.fn() y .subtype() deberían devolver la instancia para encadenar, sin exponer el estado interno', () => {
        const e = _e.instance(newName());
        expect(e.fn({ String: { a: () => 'a' } })).toBe(e);
        expect(e.fn(() => {})).toBe(e);
        expect(e.subtype({ String: 'Text' })).toBe(e);
        expect(e.subtype('browser-dom')).toBe(e);
        expect(e.fn({ Text: { b: () => 'b' } }).subtype({ Number: 'Num' }).config({ args: 'spread' })).toBe(e);
        expect(e('x').b()).toBe('b');
      });

      it('getTypes() en una definición de subtipo debería devolver una copia del array/mapa de tipos detectados', () => {
        const e = _e.instance(newName());
        let detected;
        e.subtype({
          Array: 'Collection',
          Collection: (input, primitiveType, getTypes) => {
            detected = getTypes();
            // Modificar la copia no debe afectar al resultado.
            detected.push('Hacked');
            return primitiveType === 'Collection' ? 'List' : false;
          },
        });

        const types = e.type([1]);
        expect(Array.isArray(detected)).toBe(true);
        expect(detected.slice(0, 3)).toEqual(['Object', 'Array', 'Collection']);
        expect(detected['Array']).toBe(true);
        expect([...types]).toEqual(['Object', 'Array', 'Collection', 'List']); // Copia plana: el resultado también tiene claves de mapa
        expect(types['Hacked']).toBeUndefined();
      });

      it('las opciones de una instancia no deberían afectar a otra', () => {
        const a = _e.instance(newName(), { collision: 'specific', args: 'spread' });
        const b = _e.instance(newName());
        expect(a.config()).toEqual({ collision: 'specific', args: 'spread' });
        expect(b.config()).toEqual({ collision: 'general', args: 'array' });
      });
    });

    describe('collision: orden de especificidad en colisiones', () => {
      const register = (e) => e.fn({
        Array: { who: () => 'Array' },
        Object: { who: () => 'Object' },
        who: () => 'Global',
      });

      it('"general" (por defecto): prevalece el más general (el global)', () => {
        const e = _e.instance(newName());
        register(e);
        expect(e([1, 2]).who()).toBe('Global');
      });

      it('"specific": prevalece el más específico (Array sobre Object y sobre el global)', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        register(e);
        expect(e([1, 2]).who()).toBe('Array');
      });

      it('"specific": sin tipo más específico se usa el siguiente (Object), y el global solo es fallback', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        register(e);
        expect(e({}).who()).toBe('Object');
        expect(e('texto').who()).toBe('Global');
      });

      it('"specific": un subtipo o alias prevalece sobre el tipo principal', () => {
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

      it('"specific": debería funcionar con secuencias de varios argumentos', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        e.fn({
          Array: { String: { who: () => 'Array+String' } },
          Object: { String: { who: () => 'Object+String' } },
        });
        expect(e([1], 'a').who()).toBe('Array+String');
      });

      it('"specific": en secuencias con varios niveles de especificidad prevalece el más específico en cada argumento (el primero pesa más)', () => {
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

      it('"specific": usa la secuencia general si es la única que coincide, aunque exista otra más específica en otro camino', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        e.fn({
          Object: { String: { who: () => 'Object+String' } },
          Array: { Number: { who: () => 'Array+Number' } },
        });
        expect(e([1], 'a').who()).toBe('Object+String');
      });

      it('"specific": debería advertir de la colisión indicando que se ignoró la definición general', async () => {
        const name = newName();
        const e = _e.instance(name, { collision: 'specific' });
        register(e);
        e([1]);

        await waitForConsole();
        // El espía es global: se filtran solo los mensajes de esta instancia.
        const messages = warnSpy.mock.calls.map(call => call[0]).filter(m => m.includes('(' + name + ')'));
        expect(messages.some(m => m.includes('was ignored because a more specific definition'))).toBe(true);
        expect(messages.some(m => m.includes('is overwriting'))).toBe(false);
      });

      it('"specific": no debería cambiar el orden de ejecución de los manejadores (específico -> general)', () => {
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

      it('"specific": los métodos que devuelve un manejador también respetan el orden', () => {
        const e = _e.instance(newName(), { collision: 'specific' });
        e.fn({
          Array: () => ({ who: () => 'Array handler' }),
          Object: { who: () => 'Object' },
        });
        expect(e([1]).who()).toBe('Array handler');
      });

      it('se puede cambiar en caliente con .config() para las siguientes llamadas', () => {
        const e = _e.instance(newName());
        register(e);
        expect(e([1]).who()).toBe('Global');
        e.config({ collision: 'specific' });
        expect(e([1]).who()).toBe('Array');
        e.config({ collision: 'general' });
        expect(e([1]).who()).toBe('Global');
      });
    });

    describe('args: forma de pasar los argumentos a los métodos', () => {
      it('"array" (por defecto): ([dispatcher args], ...method args)', () => {
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

      it('"spread": el array de argumentos del método es [] si se llama sin argumentos', () => {
        const e = _e.instance(newName(), { args: 'spread' });
        const spy = jest.fn();
        e.fn({ String: { m: spy } });
        e('a').m();
        expect(spy).toHaveBeenCalledWith('a', []);
      });

      it('"spread": permite usar parámetros con nombre y devuelve el resultado del método', () => {
        const e = _e.instance(newName(), { args: 'spread' });
        e.fn({
          Array: { String: { join: (arr, sep, [prefix]) => prefix + arr.join(sep) } },
        });
        expect(e([1, 2, 3], '-').join('>')).toBe('>1-2-3');
      });

      it('"spread": aplica también a los métodos globales', () => {
        const e = _e.instance(newName(), { args: 'spread' });
        const spy = jest.fn();
        e.fn({ global: spy });
        e(1, 2, 3).global('z');
        expect(spy).toHaveBeenCalledWith(1, 2, 3, ['z']);
      });

      it('"spread": los manejadores siguen recibiendo los argumentos directamente', () => {
        const e = _e.instance(newName(), { args: 'spread' });
        const handler = jest.fn();
        e.fn({ String: { String: handler } });
        e('a', 'b');
        expect(handler).toHaveBeenCalledWith('a', 'b');
      });

      it('"spread": `this` sigue siendo el objeto resultado (encadenado)', () => {
        const e = _e.instance(newName(), { args: 'spread' });
        e.fn({ String: { self: function(){ return this; } } });
        const result = e('a');
        expect(result.self()).toBe(result);
      });

      it('"spread": un error en el método se maneja igual que antes (se registra y devuelve el resultado)', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const e = _e.instance(newName(), { args: 'spread' });
        e.fn({ String: { boom: () => { throw new Error('fallo'); } } });
        const result = e('a');
        expect(result.boom()).toBe(result);

        await waitForConsole();
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Method "boom" error'));
        errorSpy.mockRestore();
      });

      it('se puede cambiar en caliente con .config(): afecta a los resultados de las llamadas posteriores', () => {
        const e = _e.instance(newName());
        const spy = jest.fn();
        e.fn({ String: { m: spy } });

        e('a').m('x');
        e.config({ args: 'spread' });
        e('a').m('x');

        expect(spy).toHaveBeenNthCalledWith(1, ['a'], 'x');
        expect(spy).toHaveBeenNthCalledWith(2, 'a', ['x']);
      });

      it('"collision" y "args" se pueden combinar', () => {
        const e = _e.instance(newName(), { collision: 'specific', args: 'spread' });
        e.fn({
          Array: { who: (arr, [suffix]) => 'Array' + suffix },
          Object: { who: () => 'Object' },
        });
        expect(e([1]).who('!')).toBe('Array!');
      });
    });
  });

  describe('Build ESM: paridad con la build UMD', () => {
    // Jest no puede cargar el .mjs con require(), así que se ejecuta en un proceso hijo de Node.
    const runInESM = (body) => {
      const url = pathToFileURL(path.join(__dirname, 'dist', 'estructura.esm.mjs')).href;
      const script = `import _e from ${JSON.stringify(url)}; const out = (() => { ${body} })(); console.log(JSON.stringify(out));`;
      return JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' }).trim());
    };

    it('debería exportar por defecto la instancia con la API completa', () => {
      expect(runInESM(`return ['fn', 'subtype', 'type', 'instance', 'config'].map((k) => typeof _e[k]);`)).toEqual(['function', 'function', 'function', 'function', 'function']);
    });

    it('debería ejecutar las funciones de validación de subtipos anidados una sola vez (igual que la build UMD)', () => {
      expect(runInESM(`
        const e = _e.instance('esm-nested'); let calls = 0;
        e.subtype({ Object: { Admin: (input) => { calls++; return input.isAdmin ? 'Admin' : false; } } });
        return [calls, e({ isAdmin: true }) && calls, [...e.type({ isAdmin: true })]];
      `)).toEqual([0, 1, ['Object', 'Admin']]);
    });

    it('debería soportar las opciones collision y args, el encadenado y getTypes()', () => {
      expect(runInESM(`
        const e = _e.instance('esm-options', { collision: 'specific', args: 'spread' });
        let seen;
        e.subtype({ Array: 'Collection', Collection: (input, primitiveType, getTypes) => { seen = [...getTypes()]; return true; } })
         .fn({ Array: { who: (arr, [suffix]) => 'Array' + suffix }, Object: { who: () => 'Object' }, who: () => 'Global' });
        return [e.config(), e([1]).who('!'), e({}).who(), e('s').who(), seen, e.fn(() => {}) === e];
      `)).toEqual([{ collision: 'specific', args: 'spread' }, 'Array!', 'Object', 'Global', ['Object', 'Array', 'Collection'], true]);
    });
  });

});
