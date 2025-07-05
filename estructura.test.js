const _e = require('./dist/estructura.umd');

describe('Estructura Framework v1.16.0 - Pruebas Unitarias', () => {

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

      it('debería sobrescribir métodos específicos con otros más generales (regla de colisión)', () => {
        e.subtype({ Array: 'CustomList' });

        e.fn({ CustomList: { getPriority: () => 1 } }); // Más específico
        e.fn({ Array: { getPriority: () => 2 } });
        e.fn({ Object: { getPriority: () => 3 } });
        e.fn({ getPriority: () => 4 }); // Global (más general)

        // Según la documentación, el más general (global) debe prevalecer.
        const result = e([]).getPriority();
        expect(result).toBe(4);
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
      it('debería registrar y utilizar subtipos, alias y subtipos funcionales', () => {
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
});