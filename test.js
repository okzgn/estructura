var _e = require('./dist/estructura.umd.js');

console.log("Test:\n");

_e.fn({
  Array: {
    log: (args) => console.log(`Un array: ${args[0]}`)
  },

  Number: {
    log: (args) => console.log(`Un número: ${args[0]}`)
  },

  String: {
    Number: {
      combine: (args) => console.log(`Combinado: ${args[0]} y ${args[1]}`)
    }
  }
});

_e(['hola']).log();         //> "Un array: hola"
_e(12345).log();            //> "Un número: 12345"
_e('texto', 67890).combine(); //> "Combinado: texto y 67890"

_e.fn({
  Object: {
    keys: (args) => Object.keys(args[0])
  }
});

const keys = _e({ a: 1, b: 2 }).keys();
console.log(keys); //> ["a", "b"]

_e.fn({
  String: {
    repeat: (args, times) => args[0].repeat(times)
  }
});

const repeated = _e("hola ").repeat(3);
console.log(repeated); //> "hola hola hola "

_e.fn({
  // Este método estará disponible en todas las llamadas a _e()
  timestamp: () => `Procesado a las: ${Date.now()}`
});

console.log(_e(123).timestamp());       //> "Procesado a las: 1700000000000"
console.log(_e("abc").timestamp());     //> "Procesado a las: 1700000000001"

// 1. Registro inicial en el núcleo de la aplicación
_e.fn({
  String: {
    log: (args) => console.log(`[Log]: ${args[0]}`)
  }
});

// 2. Más tarde, un "plugin" añade nueva funcionalidad al tipo String
_e.fn({
  String: {
    wordCount: (args) => args[0].split(' ').length
  }
});

// 3. Ambos métodos están ahora disponibles gracias a la fusión
const miFrase = _e("Estructura es muy flexible");

miFrase.log();                      //> [LOG]: Estructura es muy flexible
console.log(miFrase.wordCount());   //> 4

// 1. Definimos un nodo híbrido para 'Number'
_e.fn({
  Number: (num) => console.log(`Nodo híbrido ejecutado para: ${num}`)
});

// 2. Fusionamos un objeto con un nuevo método
_e.fn({
  Number: {
    isEven: (args) => args[0] % 2 === 0
  }
});

// 3. El nodo se auto-ejecuta Y tiene el nuevo método disponible
const miNumero = _e(10); //> Nodo híbrido ejecutado para: 10

console.log(miNumero.isEven()); //> true

// Crear subtipos
_e.subtype({
  // 1. Con una función
  Object: (input) => (input.userId ? 'User' : false),

  // 2. Con un string (un alias simple)
  RegExp: 'RegexPattern',

  // 3. Con un array (múltiples alias)
  // Un Array ahora también es de tipo 'Coleccion' y 'ListaOrdenada'
  Array: ['Coleccion', 'ListaOrdenada'] 
});

// Registrar funciones para los nuevos tipos
_e.fn({
  User: {
    hello: (args) => console.log(`Hello, ${args[0].name}!`)
  },
  RegexPattern: {
    test: (args, str) => args[0].test(str)
  },
  // Se pueden registrar métodos para CUALQUIER alias
  Coleccion: {
    esColeccion: () => true
  },
  ListaOrdenada: {
    count: (args) => args[0].length
  }
});

const user = { userId: 'u-123', name: 'Alex' };
_e(user).hello(); //> "Hello, Alex!"

const hasNumber = _e(/\d+/).test('abc-123'); 
console.log(hasNumber); //> true

// Ahora los métodos de ambos alias están disponibles
const miLista = _e([1, 2, 3]);
console.log(miLista.count());       //> 3
console.log(miLista.esColeccion()); //> true

const miApi = _e.instance('miApi');
const otraApi = _e.instance('otraApi');

miApi.fn({ String: { log: () => console.log('Log de miApi') } });
otraApi.fn({ String: { log: () => console.log('Log de otraApi') } });

miApi('test').log();  //> "Log de miApi"
otraApi('test').log(); //> "Log de otraApi"

const types = _e.type({ id: 1 }); 
console.log(types); //> [ 'Object', Object: true ]

_e.fn({
  String: {
    // 'args' es ['Hola']
    miMetodo: (args) => console.log(`El primer argumento es: ${args[0]}`)
  }
});
_e('Hola').miMetodo(); //> "El primer argumento es: Hola"

_e.fn({
  // 'arg1' es 'Hola'
  String: (arg1) => console.log(`Recibí directamente: ${arg1}`)
});
_e('Hola'); //> "Recibí directamente: Hola"

// Definimos una función que se ejecutará para cualquier 'String'
// Nota: La función recibe los argumentos del despachador directamente.

const logString = (str) => {
  console.log(`[LOG]: La string "${str}" fue procesada.`);
};

// Registramos la función directamente bajo el tipo 'String'

_e.fn({
  String: logString
});

// Al llamar a _e con una string, la función se ejecuta automáticamente.

_e("Mi primer evento");   //> "[LOG]: La string "Mi primer evento" fue procesada."
_e("Otro evento más");    //> "[LOG]: La string "Otro evento más" fue procesada."

// Nodo para Arrays (muy específico)
_e.fn({
  Array: (args) => console.log(`[LOG]: Nodo para Array ejecutado para: ${args}`)
});

// Nodo para Objects (menos específico, ya que Array es un Object)
_e.fn({
  Object: () => console.log('[LOG]: Nodo para Object ejecutado.')
});

// Nodo híbrido raíz (el más general)
_e.fn(function(){
  console.log('[LOG]: Nodo raíz ejecutado.');
});

// Al llamar con un array, se disparan los tres nodos en orden de especificidad.
_e(['a', 'b']);
//> "[LOG]: Nodo para Array ejecutado para: a,b"
//> "[LOG]: Nodo para Object ejecutado."
//> "[LOG]: Nodo raíz ejecutado."

// Subtipo para identificar emails

_e.subtype({
  String: (input) => (input.includes('@') ? 'Email' : false)
});

// Nodo híbrido para el tipo 'Email'.
// Recibe el email como primer argumento, no envuelto en un array.

const validateEmail = (email) => {
  console.log(`Validando: ${email}`);

  if (email.endsWith('@gmail.com')) {
    // Si es un email de Gmail, devuelve métodos específicos.

    return {
      send: () => console.log('Enviando con la API de Gmail...'),
      addToContacts: () => console.log('Añadiendo a contactos de Google.')
    };
  } else {
    // Para otros emails, devuelve un método genérico.

    return {
      send: () => console.log('Enviando con SMTP genérico...')
    };
  }
};

// Registramos el nodo híbrido

_e.fn({
  Email: validateEmail
});

// --- Caso 1: Email de Gmail ---

const gmailUser = _e('test@gmail.com');
//> "Validando: test@gmail.com"

gmailUser.send();            //> "Enviando con la API de Gmail..."
gmailUser.addToContacts();   //> "Añadiendo a contactos de Google."

// --- Caso 2: Otro email ---

const otherUser = _e('user@outlook.com');
//> "Validando: user@outlook.com"

otherUser.send();            //> "Enviando con SMTP genérico..."
// otherUser.addToContacts(); // Esto daría un error, porque el método no fue devuelto.