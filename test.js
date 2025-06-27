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

_e([/hola/]).log();         //> "Un array: /hola/"
_e(12345).log();            //> "Un número: 12345"
_e('texto', 67890).combine(); //> "Combinado: texto y 567890"

_e.fn({
  Object: {
    extend: (args, target_object) => Object.assign(target_object, args[0])
  }
});

console.log(_e({ a: 1, b: 2 }).extend({ c: 4, d: 5 })); //> "{ c: 4, d: 5, a: 1, b: 2 }"

_e.fn({
  String: {
    repeat: (args, times) => args[0].repeat(times)
  }
});

console.log(_e("hola ").repeat(3)); //> "hola hola hola "

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

console.log(_e.type([])); //> [ 'Object', 'Array', Object: true, Array: true ]

