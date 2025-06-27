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

_e.subtype({
  Object: (input) => {
    if (input && typeof input.userId === 'string') {
      return 'User';
    }
  }
});

_e.fn({
  User: {
    hello: (args) => console.log(`Hello, ${args[0].name}!`)
  }
});

const user = { userId: 'u-123', name: 'Alex' };
_e(user).hello(); //> "Hello, Alex!"

const miApi = _e.instance('miApi');
const otraApi = _e.instance('otraApi');

miApi.fn({ String: { log: () => console.log('Log de miApi') } });
otraApi.fn({ String: { log: () => console.log('Log de otraApi') } });

miApi('test').log();  //> "Log de miApi"
otraApi('test').log(); //> "Log de otraApi"

const types = _e.type({ id: 1 }); 
console.log(types); //> [ 'Object', Object: true ]

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

// Subtipo para identificar emails

_e.subtype({
  String: (input) => (input.includes('@') ? 'Email' : false)
});

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