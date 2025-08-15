# Estructura

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Estructura es un framework JavaScript ligero y sin dependencias, que te permite asignar funciones que se adjuntarán automáticamente a tipos de datos que puedes crear o extender y que pueden ser de uno o múltiples argumentos.

**[Guía de inicio rápido](#guía-de-inicio-rápido)**

### Ejemplo de Caso de Uso

Imagina tener que manejar diferentes tipos de datos con lógica específica para cada combinación:

```javascript
// ❌ El problema: código repetitivo y difícil de mantener

function processData(data, format, destination){
  if(typeof data === 'string' && format === 'json' && destination.type === 'api'){
    return sendJSONToAPI(data, destination);
  }
  else if(Array.isArray(data) && format === 'csv' && destination.type === 'file'){
    return saveArrayAsCSV(data, destination);
  }
  else if(typeof data === 'object' && format === 'xml' && destination.type === 'database'){
    return insertXMLToDB(data, destination);
  }
  // ... decenas de combinaciones más
}

// ✅ La solución con Estructura: limpio, extensible y mantenible

_e.fn({
  String: {
    JSON: {
      API: { process: (args) => sendJSONToAPI(...args) }
    }
  },
  Array: {
    CSV: {
      File: { process: (args) => saveArrayAsCSV(...args) }
    }
  },
  Object: {
    XML: {
      Database: { process: (args) => insertXMLToDB(...args) }
    }
  }
});

_e.subtype({
    // Aquí defines: JSON, API, CSV, File, XML, y Database.
});

// Uso simple y elegante
_e(myData, format, destination).process();
```

---

## 📚 Índice de Contenidos

<details>
<summary>Abrir Índice</summary>

### 1. Introducción
- [Características Principales](#características-principales)
- [¿Cuándo Usar Estructura?](#cuándo-usar-estructura)

### 2. Instalación y Configuración
- [Instalación](#instalación)
  - [npm](#npm)
  - [CDN (Navegador)](#cdn-navegador)
- [Compatibilidad](#compatibilidad)
  - [Formatos de Módulo](#formatos-de-módulo)
  - [Compatibilidad con Navegadores](#compatibilidad-con-navegadores)
  - [Compatibilidad con Entornos](#compatibilidad-con-entornos)

### 3. Guía de Inicio Rápido
- [Ejemplo Básico](#guía-de-inicio-rápido)

### 4. Conceptos Previos
- [Despacho de Funciones](#despacho-de-funciones)
  - [¿Qué es el Despacho de Funciones?](#qué-es-el-despacho-de-funciones)
- [Despacho Simple vs. Múltiple](#despacho-simple-vs-múltiple)
  - [Despacho Simple](#despacho-simple)
  - [Despacho Múltiple](#despacho-múltiple)
- [Terminología de Estructura](#terminología-de-estructura)
  - [Despachador](#despachador)
  - [Métodos](#métodos)
  - [Manejadores](#manejadores)
  - [Tipos, Subtipos y Alias](#tipos-subtipos-y-alias)
- [Por Qué es Útil el Despacho Múltiple](#por-qué-es-útil-el-despacho-múltiple)
  - [Problema Común: Funciones Polimórficas](#problema-común-funciones-polimórficas)
  - [Ventajas Clave](#ventajas-clave)

### 5. Documentación de la API
- [Función Principal o Despachador](#_earg1-arg2-)
- [Registrar Funciones para Tipos](#_efnassignments)
- [Registrar Nuevos Tipos](#_esubtypedefinitions)
- [Crear Instancias](#_einstancename)
- [Identificar Tipos](#_etypeinput)

### 6. Tipos y Subtipos
- [Tipos Predefinidos](#tipos-predefinidos)
- [Subtipos Predefinidos Browser-DOM](#subtipos-predefinidos-browser-dom)
  - [Node](#subtipo-node)
  - [Nodes](#subtipo-nodes)
  - [Document](#subtipo-document)
  - [Browser](#subtipo-browser)

### 7. Conceptos Avanzados
- [Manejadores](#conceptos-avanzados-manejadores)
  - [Auto-Ejecución de Manejadores](#auto-ejecución-de-manejadores)
  - [Secuencia de Ejecución por Especificidad](#secuencia-de-ejecución-por-especificidad)
  - [Sobrescribir Métodos Dinámicamente](#sobrescribir-métodos-dinámicamente)

### 8. Adicionales
- [Notas sobre Versiones Anteriores y Actual](#notas-sobre-versiones-anteriores-y-actual)
- [Preguntas Frecuentes](#faq-preguntas-frecuentes)
- [Problemas Comunes](#problemas-comunes)
- [Consideraciones](#consideraciones)
- [Licencia](#licencia)

</details>

## Características Principales

*   **Sistema de Tipos Extensible:** Define tus propios tipos ([`.subtype()`](#_esubtypedefinitions)) para cualquier estructura de datos, yendo mucho más allá de los tipos principales de JavaScript.
*   **Instancias Aisladas (`Sandboxing`):** Crea múltiples instancias de Estructura ([`.instance()`](#_einstancename)) que no interfieren entre sí, cada una con su propio registro de tipos y funciones.
*   **Robusto y Predecible:** Las llamadas al `despachador` son deterministas. Para una misma configuración de tipos y funciones registradas ([`.fn()`](#_efnassignments)) para esos tipos, una llamada a [`_e(arg1, arg2, ...)`](#_earg1-arg2-) siempre seguirá una misma secuencia de ejecución y devolverá el mismo conjunto de `métodos`.
*   **Ligero y sin Dependencias:** Menos de 30 KB sin comprimir (`ESM` y `UMD`), ideal para el navegador o Node.js.

## ¿Cuándo Usar Estructura?

Estructura es ideal cuando necesitas manejar lógica compleja que depende de la naturaleza de tus datos, como en:

*   **`APIs` Polimórficas:** Crea funciones que se resuelven automáticamente, como `endpoint(url_string, different_data_inputs)`, `render(html_element, content_variations)`.
*   **Sistemas de Plugins:** Permite que extensiones de terceros registren funciones sin modificar el núcleo de tu aplicación.
*   **Procesamiento de Datos:** Escribe flujos de datos limpios que se adaptan a diferentes formatos de entrada (JSON, CSV, XML, etc.).
*   **Refactorización de Código Complejo:** Reemplaza largas cadenas de `if/else` o `switch` de comprobaciones con una solución más declarativa y mantenible.

## Instalación

### npm
Puedes instalar Estructura a través de npm:

```bash
npm install estructura-js
```
### CDN (Navegador)
Puedes usarlo directamente en el navegador a través de un CDN:

```html
<script src="https://unpkg.com/estructura-js"></script>
```

## Compatibilidad

Estructura está diseñado para ser casi universalmente compatible, funcionando sin problemas en una amplia gama de entornos de JavaScript, desde navegadores modernos y antiguos hasta Node.js, etc.

**Resumen rápido:**  
Estructura soporta **ESM**, **UMD** y **AMD** en navegadores, Node.js y RequireJS.

| Formato | Uso en Node.js         | Navegador moderno       | Navegador antiguo |
|---------|------------------------|-------------------------|-------------------|
| ESM     | `import _e from ...`    | `<script type="module">`| ❌ Necesita transpilar |
| UMD     | `require(...)`          | `<script src=...>`      | ✅ Soportado           |
| AMD     | `define([...])`         | Con RequireJS           | ✅ Soportado           |

**Decisión rápida:**
- Si tu entorno soporta módulos modernos → usa **ESM**.  
- Si no → usa **UMD** o **AMD** según corresponda.

### Formatos de Módulo

El paquete se distribuye en varios formatos para asegurar una integración sencilla, en general, con los siguientes sistemas de módulos:

*   **Módulos ES (`ESM`):** El formato principal y moderno. Ideal para usar con `import` en Node.js (o entornos similares) con herramientas de compilación como Vite, Rollup, Webpack, o en navegadores actualizados.
    *   **Node.js:**
    ```javascript
    import _e from 'estructura-js';
    ```
    *   **Navegadores actuales:**
    ```html
    <script type="module">
      import _e from 'https://unpkg.com/estructura-js';
    </script>
    ```

*   **`UMD` (Universal Module Definition):** Proporciona máxima compatibilidad.
    *   **CommonJS (Node.js):** Funciona de forma nativa con `require()`.
        ```javascript
        const _e = require('estructura-js');
        ```

    *   **Navegadores (`Global`):** Si se incluye con un tag `<script>` normal, crea una variable `global` `_e`.
        ```html
        <script src="https://unpkg.com/estructura-js"></script>
        <script>
          // La variable global '_e' se ha cargado correctamente
          const estructura = _e;

          // Ejemplo para mostrar los tipos de datos en la consola del navegador
          let tipos = _e.type('hola');
          console.log(tipos); //> [ 'String', String: true ]
        </script>
        ```
    *   **AMD (Asynchronous Module Definition):** Compatible con cargadores de módulos como RequireJS. Véase [Ejemplos](https://requirejs.org/docs/start.html#examples).

### Compatibilidad con Navegadores

El código de la distribución **`UMD`** no necesita transpilación, está escrito en **sintaxis compatible con ES3/ES5**, lo que garantiza su funcionamiento en todos los navegadores modernos y en la mayoría de los antiguos, incluyendo **Internet Explorer 9+**. La distribución **`ESM`** necesita transpilación para funcionar en ciertos navegadores.

> **Nota:** **Los ejemplos utilizan sintaxis de ES6 por brevedad**, pero pueden ser convertidos fácilmente y adaptarse a entornos ES5 (como a funciones clásicas `function(){}`) para ejecutarlos en navegadores antiguos.

### Compatibilidad con Entornos

Estructura funciona perfectamente en cualquier entorno que soporte la sintaxis ES5 (Node.js, Deno, Bun, etc.). 

## Guía de Inicio Rápido

El concepto central es simple: asigna funciones para tipos o combinaciones de tipos y llama al `despachador` `_e()` con los datos correspondientes.

```javascript
import _e from 'estructura-js';

// Asignar métodos para tipos específicos
_e.fn({
  Array: {
    log: (args) => console.log(`Un array: ${args[0]}`)
  },

  Number: {
    log: (args) => console.log(`Un número: ${args[0]}`)
  },

  // Asigna un método para la secuencia (combinación) de tipos '_e(String, Number)'
  String: {
    Number: {
      combine: (args) => console.log(`Combinado: ${args[0]} y ${args[1]}`)
    }
  }
});

// Llamar al despachador
_e(['hola']).log();             //> "Un array: hola"
_e(12345).log();                //> "Un número: 12345"
_e('texto', 67890).combine();   //> "Combinado: texto y 67890"
```

## Conceptos Previos

Antes de profundizar en Estructura, es importante entender algunos conceptos fundamentales que te ayudarán a aprovechar al máximo este framework.

### Despacho de Funciones

#### ¿Qué es el Despacho de Funciones?

El **despacho de funciones** es el mecanismo que determina qué función específica se ejecutará cuando hay múltiples opciones disponibles. Es como un "enrutador inteligente" que selecciona la función correcta basándose en ciertos criterios.

**Ejemplo Simple:**
```javascript
// Sin despacho: código repetitivo
function processData(data){
  if(Array.isArray(data)){
    return data.map(item => item.toUpperCase());
  }
  else if(typeof data === 'string'){
    return data.toUpperCase();
  }
  else if(typeof data === 'number'){
    return data.toString().toUpperCase();
  }
  // ... más condiciones
}

// Con despacho: más elegante
_e.fn({
  Array: { process: (args) => args[0].map(item => item.toUpperCase()) },
  String: { process: (args) => args[0].toUpperCase() },
  Number: { process: (args) => args[0].toString().toUpperCase() }
});

// Uso limpio
_e(['hola', 'mundo']).process();  //> ["HOLA", "MUNDO"]
_e('hola').process();             //> "HOLA"
_e(123).process();                //> "123"
```

### Despacho Simple vs. Múltiple

#### Despacho Simple
Es el que usa la **Programación Orientada a Objetos tradicional**. La función a ejecutar se determina únicamente por el **primer argumento** (basándose en el cual se llama el método).

```javascript
// Programación tradicional: solo importa el tipo del primer argumento
class MyArray extends Array {
  combine(anotherArray){  // Solo sabe que 'this' es MyArray
    return this.concat(anotherArray);
  }
}

const arr1 = new MyArray(1, 2);
const arr2 = [3, 4];
arr1.combine(arr2); // Solo considera el tipo de 'arr1'
```

#### Despacho Múltiple
Estructura utiliza **despacho múltiple**, donde la función se selecciona considerando los **tipos de TODOS los argumentos**, no solo del primero.

```javascript
// Con Estructura: considera TODOS los argumentos
_e.fn({
  Array: {
    Array: {
      combine: (args) => args[0].concat(args[1]) // Array + Array
    },
    String: {
      combine: (args) => args[0].join(args[1]) // Array + String
    }
  },
  String: {
    Array: {
      combine: (args) => [args[0]].concat(args[1]) // String + Array
    }
  }
});

_e([1, 2], [3, 4]).combine();    //> [1, 2, 3, 4] (Array + Array)
_e([1, 2], '-').combine();       //> "1-2"       (Array + String)
_e('hola', [1, 2]).combine();    //> ["hola", 1, 2] (String + Array)
```

### Terminología de Estructura

#### `Despachador`
La **función principal `_e()`** que analiza los argumentos y decide qué hacer con ellos.

```javascript
// '_e()' es el despachador
const result = _e('datos', 123); // Analiza: String + Number
```

#### `Métodos`
**Funciones que se adjuntan** al objeto que devuelve el despachador. Se llaman **después** de la evaluación de tipos.

```javascript
_e.fn({
  String: {
    length: (args) => args[0].length // ← Esto es un MÉTODO
  }
});

_e('hola').length(); // Se llama DESPUÉS del despacho
```

#### `Manejadores`
**Funciones que se ejecutan automáticamente** cuando los tipos coinciden, **antes** de devolver el objeto con `métodos`.

```javascript
_e.fn({
  String: (str) => { // ← Esto es un MANEJADOR
    console.log('Procesando:', str);
    // Se ejecuta automáticamente
  }
});

_e('hola'); //> "Procesando: hola" (se imprime inmediatamente)
```

#### Tipos, subtipos y alias

**En la documentación, los siguientes términos son tipos en sentido general**, aunque tienen pequeñas diferencias entre sí:

* **Tipos:** categorías principales de datos, integrados por defecto, de estos se derivan todos los subtipos.

* **Subtipos:** categorías personalizadas de datos que se pueden crear a partir de los tipos principales, con las características que se especifiquen.

* **Alias:** nombres adicionales que se asignan a tipos y subtipos para categorizar, agrupar o relacionar.

```javascript
_e.subtype({
   // Crear un subtipo, a partir del tipo Object
  Object: (input) => input.name && input.email ? 'User' : false,

  // Crear un alias, a partir del tipo Array
  Array: 'Collection'
});


_e.fn({
   // Registrar método para el subtipo
  User: {
    hello: (args) => `¡Hola ${args[0].name}!`
  },

   // Registrar método para el alias
  Collection: {
    combine: (args, char) => args[0].join(char)
  }
});

// Usos
const person = { name: 'Ana', email: 'ana@email.com' };
_e(person).hello(); //> "¡Hola Ana!"

const list = ['1', '2', '3'];
_e(list).combine(','); //> "1,2,3"
```

### Por Qué es Útil el Despacho Múltiple

#### Problema Común: Funciones Polimórficas
Por ejemplo, una función `save()` que debe comportarse diferente según los tipos de datos:

```javascript
// Enfoque tradicional: código espagueti
function save(data, to){
  if(typeof data === 'string' && typeof to === 'string'){
    // Guardar texto en archivo
  }
  else if(Array.isArray(data) && to instanceof Database){
    // Guardar array en base de data
  }
  else if(typeof data === 'object' && to.type === 'API'){
    // Enviar objeto a API
  }
  // ... otras combinaciones
}
```

```javascript
// Con Estructura: declarativo y extensible
_e.fn({
  String: {
    String: {
      save: (args) => saveTextFile(args[0], args[1])
    }
  },
  Array: {
    Database: {
      save: (args) => saveToDB(args[0], args[1])
    }
  },
  Object: {
    API: {
      save: (args) => sendToAPI(args[0], args[1])
    }
  }
});

// Uso limpio
_e('contenido', 'archivo.txt').save();
_e([1,2,3], myDB).save();
_e({data: 'json'}, myAPI).save();
```

#### Ventajas Clave

*   **Extensibilidad:** Permite añadir nuevas combinaciones manteniendo separadas las responsabilidades del código.
*   **Legibilidad:** La lógica está organizada por tipos, no mezclada en `if/else`.
*   **Mantenibilidad:** Cada combinación de tipos tiene su propio espacio.
*   **Composabilidad:** Diferentes módulos o instancias pueden registrar sus propias funciones.

---

## Documentación de la `API`

### `_e(arg1, arg2, ...)`

La función principal o `despachador`. **Cada argumento representa un valor (`input`)**.

* Analiza los tipos de los argumentos proporcionados.
* Busca asignaciones para toda la secuencia (combinación) de tipos.
* **Devuelve un nuevo objeto (`output`)** con los `métodos` correspondientes adjuntos y/o ejecuta `manejadores`.

---

### `_e.fn(assignments)`

Registra asignaciones de [`métodos`](#métodos) y/o [`manejadores`](#manejadores) para tipos, subtipos, alias o combinaciones.

**`assignments`:** Puede ser **un objeto o una función**.

* **Objeto:**

    En el cual cada *clave* se refiere a un nombre de tipo y cada *valor* es un objeto anidado con `métodos` o una función (`manejador`). Cada nivel de anidación se refiere al tipo de cada argumento en orden que se pasa al [`despachador`](#_earg1-arg2-) (función principal).

    ```javascript
    _e.fn({
      // Asigna métodos para '_e(Object)'
      Object: {
        keys: (args) => Object.keys(args[0])
      },

      // Los niveles de anidación se refieren a '_e(Array, String)' y sus métodos
      Array: {
        String: {
          join: (args) => args[0].join(args[1])
        }
      }
    });

    const keys = _e({ a: 1, b: 2 }).keys();
    console.log(keys); //> ["a", "b"]

    const join = _e(['1', '2', '3'], ',').join();
    console.log(join); //> "1,2,3"
    ```

    Los `métodos` que registres recibirán los argumentos del `despachador` como un **`array` en el primer argumento**. (Véase "[Cómo se Pasan los Argumentos del `Despachador`](#cómo-se-pasan-los-argumentos-del-despachador)").

    ```javascript
    _e.fn({
      String: {
        repeat: (args, times) => args[0].repeat(times)
      }
    });

    const repeated = _e('hola ').repeat(3);
    console.log(repeated); //> "hola hola hola "
    ```
    #### **`Métodos Globales`**
    También puedes asignar `métodos` que estarán disponibles sin importar el tipo de los argumentos (`Any`) de una instancia registrándolos en el primer nivel del objeto de asignaciones (el `método` no estará disponible y se generará una colisión si ya existe un método con el mismo nombre).

    ```javascript
    _e.fn({
      // Este método estará disponible para todas las llamadas a '_e()'
      timestamp: () => `Procesado a las: ${Date.now()}`
    });

    console.log(_e(123).timestamp());       //> "Procesado a las: 1700000000000"
    console.log(_e('abc').timestamp());     //> "Procesado a las: 1700000000001"
    ```
    #### **Colisión de `Métodos` o `Manejadores`**

    **⚠️ IMPORTANTE: Modo del Framework, Lo General Sobrescribe a lo Específico**
    
    Cuando un [valor (`input`)](#_earg1-arg2-) corresponde a múltiples tipos, todos sus `métodos` se fusionan en el objeto resultante. Si dos o más tipos asignan un `método` o `manejador` con el mismo nombre, se producirá una colisión. En este caso, **el `método` o `manejador` del tipo más general (menos específico, principal) prevalecerá, sobrescribiendo al de subtipo o alias más específico**. Puedes consultar el orden de especificidad de cualquier valor usando [`.type()`](#_etypeinput).
    
    **Orden de sobrescritura en colisión de métodos:**
    1. Si existe, se usa un `método`/`manejador` global.
    2. Si no, se usa un `método`/`manejador` de tipo principal.
    3. Si no, se usa un `método`/`manejador` de tipo derivado.
    4. Si no, usa el de subtipo/alias.
    
    **Ejemplo:**
    
    | Nivel de especificidad      | Ejemplo                   | Prioridad ↑ |
    |-----------------------------|---------------------------|-------------|
    | Subtipo o Alias             | `AnotherCollection`       | 1           |
    | Tipo derivado               | `Array`                   | 2           |
    | Tipo principal              | `Object`                  | 3           |
    | `Método`/`Manejador` global | `myMethod`                | 4           |
    
    1. `Métodos` de [**subtipos o alias**](#_esubtypedefinitions):
    ```javascript
    _e.fn({ AnotherCollection: { myMethod: ... }})
    ```
    
    2. `Métodos` de [**tipos derivados**](#tipos-predefinidos):
    ```javascript
    _e.fn({ Array: { myMethod: ... }})
    ```
    
    3. `Métodos` de [**tipos principales**](#tipos-predefinidos):
    ```javascript
    _e.fn({ Object: { myMethod: ... }})
    ```
    
    4. [`Métodos **globales**`](#métodos-globales):
    ```javascript
    _e.fn({ myMethod: ... })
    ```
    
    En el ejemplo anterior, significa que `myMethod` para `Object` sobrescribirá al de `AnotherCollection`.
    
    **Otro ejemplo:**
    
    ```javascript
    // Registramos métodos con el mismo nombre para 'Array' y 'Object'.
    _e.fn({
      // Método para el tipo derivado: Array
      Array: {
        logType: () => console.log('Tipo Derivado: Array')
      },
      // Método para el tipo general (principal): Object
      Object: {
        logType: () => console.log('Tipo General (Principal): Object')
      }
    });
    
    // Un array es tanto de tipo 'Array' como de tipo 'Object'.
    // Al haber una colisión, se prevalecerá el método del tipo más general (principal 'Object').
    _e([1, 2, 3]).logType(); //> "Tipo General (Principal): Object"
    ```
    
    **Nota:** Esta decisión de diseño garantiza que los `métodos` o `manejadores globales` puedan actuar como un `'fallback'` predecible y consistente, asegurando que una función siempre esté disponible si no se encuentra una más específica. O para prevenir que `métodos` o `manejadores` registrados más recientes sobrescriban a los anteriores.

* **Función:**

    Se puede asignar para que se ejecute **en cualquier llamada a una instancia**, se llama **`manejador` raíz**.
    ```javascript
    _e.fn((arg1, arg2, /*...,*/ argN) => {
      // Código...
    });
    ```
    Véase "[Conceptos Avanzados: `Manejadores`](#conceptos-avanzados-manejadores)" o "[Secuencia de Ejecución por Especificidad](#secuencia-de-ejecución-por-especificidad)".

### Fusión de Registros de Asignaciones (Registro Aditivo)

Si llamas a `.fn()` varias veces para registrar asignaciones de `manejadores` o `métodos` **para los mismos tipos**, las asignaciones se fusionan en lugar de sobrescribirse. Este comportamiento aditivo sirve para sistemas de plugins o para organizar el código en módulos, ya que permite añadir nueva funcionalidad de forma segura.

* **Para `Manejadores`:**

    Hay una regla importante: **una vez que se asigna un `manejador` a un tipo, seguirá siendo un `manejador`**.

    Si a continuación registras un objeto de `métodos` para ese mismo tipo, los nuevos `métodos` se añadirán al `manejador`, pero no perderá su capacidad de auto-ejecutarse.

    ```javascript
    // Asignamos un manejador para 'Number'
    _e.fn({
      Number: (num) => console.log(`Manejador ejecutado para: ${num}`)
    });

    // Fusionamos un objeto con un nuevo método
    _e.fn({
      Number: {
        isEven: (args) => args[0] % 2 === 0
      }
    });

    // El manejador se auto-ejecuta y tiene el nuevo método disponible
    const myNumber = _e(10); //> Manejador ejecutado para: 10

    console.log(myNumber.isEven()); //> true
    ```
    Véase "[Conceptos Avanzados: `Manejadores`](#conceptos-avanzados-manejadores)" y "[Colisión de `Métodos` o `Manejadores`](#colisión-de-métodos-o-manejadores)".

* **Para `Métodos`:**

    Los objetos con `métodos` para los mismos tipos se fusionarán en lugar de sobrescribirse.

    ```javascript
    // Registro inicial en el núcleo de la aplicación
    _e.fn({
      String: {
        log: (args) => console.log(`[LOG]: ${args[0]}`)
      }
    });

    // Más tarde, un 'plugin' añade nueva funcionalidad al tipo String
    _e.fn({
      String: {
        wordCount: (args) => args[0].split(' ').length
      }
    });

    // Ambos métodos están ahora disponibles gracias a la fusión
    const myText = _e('Estructura es muy flexible');

    myText.log();                      //> [LOG]: Estructura es muy flexible
    console.log(myText.wordCount());   //> 4
    ```

### Cómo se Pasan los Argumentos del `Despachador`

**⚠️ IMPORTANTE: Distinción Crucial**

Hay una diferencia clave en **cómo los `métodos` o `manejadores` reciben los argumentos del `despachador`**.

- **`Métodos`**: reciben **todos los argumentos en un array** como primer parámetro.  
- **`Manejadores`**: reciben **los argumentos directamente**.

| Tipo        | Argumentos de función         | Ejemplo de acceso |
|-------------|-------------------------------|-------------------|
| `Método`    | `(args, extra...)`            | `args[0]`         |
| `Manejador` | `(arg1, arg2, ...)`           | `arg1`            |

**Ejemplos:**  

* **`Métodos`:**

    ```javascript
    _e.fn({
      String: {
        // 'args' es ['Hola']
        myMethod: (args) => console.log(`El primer argumento es: ${args[0]}`)
      }
    });

    _e('Hola').myMethod(); //> "El primer argumento es: Hola"
    ```

* **`Manejadores`:**

    ```javascript
    _e.fn({
      // 'arg1' es 'Hola'
      String: (arg1) => { console.log(`Recibí directamente: ${arg1}`); }
    });

    _e('Hola'); //> "Recibí directamente: Hola"
    ```

---

### `_e.subtype(definitions)`

Registra definiciones de tipos nuevos para cada instancia de Estructura. **Se llaman subtipos y alias**.

**`definitions`:** Un objeto donde cada *clave* es un nombre de tipo predefinido y cada *valor* puede ser:

*   Una cadena de texto (`string`) para crear un alias simple.
*   Un `array` de cadenas de texto para asignar múltiples alias a la vez.
*   Una función que recibe el [valor (`input`)](#_earg1-arg2-) y puede devolver:
    * Una cadena de texto con el nombre nuevo del subtipo.
    * Un *booleano* **`true`** si el nombre de la *clave* debe usarse como el nombre del subtipo.
    * Si no coincide con el subtipo: **`undefined`**, **`null`**, **`false`**, o **`''`**.

```javascript
// Crear subtipos
_e.subtype({
  // Con una función
  Object: (input) => (input.userId ? 'User' : false),

  // Con un string (un alias simple)
  RegExp: 'RegexPattern',

  // Con un array (múltiples alias)
  // Un 'Array' ahora también es de tipo 'Collection' y 'OrderedList'
  Array: ['Collection', 'OrderedList'] 
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
  Collection: {
    isCollection: () => true
  },
  OrderedList: {
    count: (args) => args[0].length
  }
});

const user = { userId: 'u-123', name: 'Alex' };
_e(user).hello(); //> "Hello, Alex!"

const hasNumber = _e(/\d+/).test('abc-123'); 
console.log(hasNumber); //> true

// Ahora los métodos de ambos alias están disponibles
const myList = _e([1, 2, 3]);
console.log(myList.count());         //> 3
console.log(myList.isCollection());  //> true
```
Además, **`definitions`** puede ser una cadena de texto como `'browser-dom'`, que sirve para cargar [subtipos predefinidos para el DOM de navegadores](#subtipos-predefinidos-browser-dom) en instancias.

### Tipos Predefinidos
* **Principales:**

    `Null`, `Undefined`, `Boolean`, `String`, `Number`, `NaN`, `BigInt`, `Symbol`, `Function`, `Object`.
* **Derivados:**

  * **De `Object`:**

    `Array`, `RegExp`, `Date`, etc. propios de la especificación básica de JavaScript.

    O dependiendo del entorno, especificación JavaScript, o navegador: `Map`, `Set`, `Promise`, etc.

    

### Subtipos Predefinidos: `'browser-dom'`

Este conjunto de subtipos simplifica drásticamente la manipulación del DOM al agrupar cientos de tipos de objetos específicos del navegador en unas pocas categorías potentes y genéricas.

#### **Cómo Importar o Activar `browser-dom`**

```javascript
// Activar en la instancia por defecto
_e.subtype('browser-dom');

// O en una instancia nombrada
const domAPI = _e.instance('domAPI');
domAPI.subtype('browser-dom');

/*
 * Ejemplos de uso en un navegador.
 * Nota: El resultado de '.type()' se muestra aquí ordenado desde el
 * tipo más específico al más general para mayor claridad, pero
 * el orden que devuelve '.type()' por defecto es el inverso.
 */
console.log(domAPI.type(document.head));   //> [ "Node.HEAD", "Node", "HTMLHeadElement", "Object" ]
console.log(domAPI.type(document));        //> [ "Document", "Browser", "HTMLDocument", "Object" ]
console.log(domAPI.type(window));          //> [ "Browser", "Window", "Object" ]
```

#### Subtipos Identificados

##### Subtipo `Node`

Representa nodos o elementos individuales en el DOM. Es la categoría más amplia y abarca:

*   **Todos los Elementos HTML:** Desde `HTMLHtmlElement` hasta `HTMLDivElement`, `HTMLInputElement`, `HTMLTemplateElement`, etc. (cualquier etiqueta que se pueda escribir).
  > **Subtipo Dinámico: `Node.<TAG_NAME>`**
  >
  > Después de que un elemento es identificado como `Node`, para más precisión, el framework crea un subtipo adicional usando su propiedad `tagName`.
  >
  > **Ejemplos:**
  >
  > **Nota:** En los siguientes ejemplos, por claridad, los tipos se muestran ordenados desde el más específico al más general, pero el orden que devuelve `.type()` es el inverso.
  > *   Un elemento `<div>` se clasifica como `[ "Node.DIV", "Node", "HTMLDivElement", "Object" ]`.
  > *   Un elemento `<button>` se clasifica como `[ "Node.BUTTON", "Node", "HTMLButtonElement", "Object" ]`.
*   **Elementos SVG y MathML:** Como `SVGSVGElement` y `MathMLMathElement`.
*   **Elementos desconocidos u obsoletos:** Como `HTMLUnknownElement` y `HTMLMarqueeElement`.
*   **Nodos que no son elementos:** Nodos de texto (`Text`), comentarios (`Comment`), fragmentos de documento (`DocumentFragment`) y atributos (`Attr`).

##### Subtipo `Nodes`

Representa colecciones o listas de nodos, que son el resultado de consultas al DOM.

*   `NodeList` (devuelto por `document.querySelectorAll()`).
*   `HTMLCollection` (devuelto por `document.getElementsByTagName()` o `element.children`).
*   `HTMLAllCollection` (una colección obsoleta).

##### Subtipo `Document`

Identifica específicamente el objeto `document` principal de la página, para normalizar cuando el tipo del objeto es `HTMLDocument` (en ciertos navegadores).

##### Subtipo `Browser`

Identifica objetos `globales` del entorno del navegador que no son parte del contenido del DOM.

*   `Window` (el objeto `global` `window`).
*   `Navigator` (el objeto `navigator` con información del navegador).
*   `Screen` (el objeto `screen` con información de la pantalla).
*   `Location` (el objeto `location` con información de la URL).
*   `History` (el objeto `history` para la navegación).

---

### `_e.instance(name)`

Crea o recupera una instancia aislada de Estructura. Esto es ideal para evitar colisiones en aplicaciones grandes o al crear librerías.

```javascript
const myAPI = _e.instance('myAPI');
const anotherAPI = _e.instance('anotherAPI');

// Las asignaciones en 'myAPI' no afectan a 'anotherAPI'
myAPI.fn({ String: { log: () => console.log('Log de myAPI') } });
anotherAPI.fn({ String: { log: () => console.log('Log de anotherAPI') } });

myAPI('test').log();    //> "Log de myAPI"
anotherAPI('test').log();  //> "Log de anotherAPI"
```

---

### `_e.type(input)`

Una herramienta de utilidad que te permite saber los tipos de cualquier variable en orden de especificidad (desde el más general en el índice 0, hasta el más específico en el último índice). Devuelve un `array` que también funciona como mapa de todos los tipos detectados (las propiedades devueltas con el nombre del tipo y valor `true` sirven para verificaciones rápidas).

```javascript
const types = _e.type({ id: 1 }); 
console.log(types); //> [ 'Object', Object: true ]

if(types['Object']){
  console.log('Verificación rápida, es un objeto.');
}
```

## Conceptos Avanzados: `Manejadores`

Estas funciones se comportan de manera diferente, ofrecen más flexibilidad y pueden:

* **Auto-ejecutarse:**

  Si la secuencia (combinación) de tipos coincide con la función (`manejador`), se ejecutará automáticamente *antes* de que el `despachador` devuelva el objeto con los `métodos` (que está como referencia en **`this`** [si es función clásica `function(){}`]).

  Los argumentos del `despachador` se pasan directamente a la función (véase "[Cómo se Pasan los Argumentos del `Despachador`](#cómo-se-pasan-los-argumentos-del-despachador)").

* **Contener más `manejadores` o `métodos`:**

  Al ser una función, puede tener propiedades que actúen como `sub-manejadores` o `métodos` para un despacho más profundo.

* [**Sobrescribir `métodos` dinámicamente**](#sobrescribir-métodos-dinámicamente).

#### Auto-ejecución de `Manejadores`

Puedes registrar una función que se ejecute si los tipos de los argumentos coinciden.

```javascript
// Creamos una función que se ejecutará para cualquier 'String'
// Nota: La función recibe los argumentos del despachador directamente

const logString = (str) => {
  console.log(`[LOG]: La cadena '${str}' fue procesada.`);
};

// Asignamos la función directamente bajo el tipo 'String'

_e.fn({
  String: logString
});

// Al llamar a '_e()' con una string, la función se ejecuta automáticamente

_e('Mi primer evento');   //> "[LOG]: La cadena 'Mi primer evento' fue procesada."
_e('Otro evento más');    //> "[LOG]: La cadena 'Otro evento más' fue procesada."
```

#### Secuencia de Ejecución por Especificidad

Permite crear `middleware` o capas de lógica que se construyen unas sobre otras.

Cuando un [valor (`input`)](#_earg1-arg2-) pertenece a múltiples tipos (como un `Array`, que también es un `Object`), se ejecutarán en secuencia todos los `manejadores` que coincidan, **desde el más específico hasta el más general**.

**Resumen rápido:** Los `manejadores` se ejecutan del más específico al más general.

**Ejemplo de secuencia:**

| Especificidad | Ejemplo de tipo detectado             |
|---------------|---------------------------------------|
| 1 (más alto)  | `Array`                               |
| 2             | `Object`                              |
| 3 (más bajo)  | Manejador raíz (`_e.fn(() => {...})`) |

```javascript
// Manejador para Arrays (muy específico)
_e.fn({
  Array: (arr) => console.log(`[LOG]: Manejador para Array ejecutado para: ${arr}`)
});

// Manejador para Objects (menos específico, ya que Array es un Object)
_e.fn({
  Object: () => console.log('[LOG]: Manejador para Object ejecutado.')
});

// Manejador raíz (el más general)
_e.fn(() => {
  console.log('[LOG]: Manejador raíz ejecutado.');
});

// Al llamar con un array, se ejecutan los tres manejadores en orden de especificidad
_e(['a', 'b']);
//> "[LOG]: Manejador para Array ejecutado para: a,b"
//> "[LOG]: Manejador para Object ejecutado."
//> "[LOG]: Manejador raíz ejecutado."
```

#### Sobrescribir `Métodos` Dinámicamente

**Si un `manejador` devuelve un objeto o función**, los `sub-manejadores` o `métodos` que contenga sobrescribirán el conjunto de `métodos` que el `despachador` está agregando al objeto principal que devolverá (que está como referencia en **`this`** [si es función clásica `function(){}`]).

Esto permite crear `APIs` dinámicas donde el resultado de una función puede cambiar los `métodos` disponibles.

**Ejemplo: Un validador que devuelve `métodos` diferentes según el resultado.**

```javascript
// Subtipo para identificar emails

_e.subtype({
  String: (input) => (input.includes('@') ? 'Email' : false)
});

// Manejador para el tipo 'Email'
// Recibe el email como primer argumento, no envuelto en un array

const validateEmail = (email) => {
  console.log(`Validando: ${email}`);

  if(email.endsWith('@gmail.com')){
    // Si es un email de Gmail, devuelve métodos específicos

    return {
      send: () => console.log('Enviando con la API de Gmail...'),
      addToContacts: () => console.log('Añadiendo a contactos de Google.')
    };
  }
  else {
    // Para otros emails, devuelve un método genérico

    return {
      send: () => console.log('Enviando con SMTP genérico...')
    };
  }
};

// Registramos el manejador

_e.fn({
  Email: validateEmail
});

// CASO 1: Email de Gmail

const gmailUser = _e('test@gmail.com');
//> "Validando: test@gmail.com"

gmailUser.send();            //> "Enviando con la API de Gmail..."
gmailUser.addToContacts();   //> "Añadiendo a contactos de Google."

// CASO 2: Otro email

const otherUser = _e('user@outlook.com');
//> "Validando: user@outlook.com"

otherUser.send();            //> "Enviando con SMTP genérico..."
// otherUser.addToContacts(); // Esto causa error, porque el método no fue devuelto
```

## Notas sobre Versiones Anteriores y Actual

*   **Hasta la v1.17.0:**

    * Se ha mejorado la seguridad en `subtype_definition_execution` y muestra de advertencias y errores en consola.
    * Se corregieron inconsistencias en `subtype`, `is_correct_object_property_name`, `merge_type_fns_node` y mensajes de consola.
    * Compatibilidad integrada para inconsistencias de ciertos navegadores con subtipos predefinidos `browser-dom`.
    * Se ha degradado la versión de Jest para pruebas unitarias a v29.7+ para asegurar la compatibilidad con versiones anteriores de Node.js (v14.15+).
    * Se mejoraron y agregaron pruebas unitarias para cobertura extra.
    * Las actualizaciones se centraron principalmente en la documentación.
    * En general, la funcionalidad se ha mantenido estable.

*   **En la v1.15.0:**

    * Se agregaron pruebas unitarias con Jest.
    * En los subtipos predefinidos `browser-dom` se eliminó el alias `Browser` para el subtipo `Document` (`no breaking change`).
    * Se actualizó la documentación `JSDoc` del código para reflejar las referencias a "`manejadores`".

*   **En la v1.14.0:**

    En la documentación, los "`manejadores`" reemplazaron a los "nodo/s híbrido/s".

*   **En la v1.9.0:**

    Se actualizó la documentación `JSDoc` del código para reflejar cambios de versiones anteriores.

*   **En la v1.8.0:**

    Se mejoró: el adjuntador de `métodos` (`attach_resolved_methods`), y el aislamiento de instancias en los registradores de funciones (`fn`) y subtipos (`subtype`) para entornos JavaScript como Node.js.

*   **Anteriores a la v1.6.0:**

    El módulo en formato `ESM` no estaba configurado correctamente, lo que podía causar problemas de importación.

## FAQ (Preguntas Frecuentes)

* **¿Puedo usar Estructura con TypeScript?**

  No está diseñado para usarse con TypeScript, Estructura es una alternativa a la verbosidad de TypeScript.

* **¿Tiene alguna manera integrada para depurar?**

  Sí, actualmente se emiten advertencias y errores en consola (o se lanza un error en entornos sin consola) en estos casos:
  * Si registras un subtipo con una función con error o si devuelve un tipo incorrecto.
  * Si tratas de usar nombres no permitidos para instancias o `métodos`, como: nombres de propiedades heredadas de [`Object.prototype`](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object), [palabras reservadas de JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Lexical_grammar), y nombres de propiedades que usa el framework.
  * Si la instancia que tratas de crear ya existe.
  * Si hubo un conflicto con nombres de `métodos` (colisiones).
  * Si un `manejador` presenta errores al ejecutarse.
  * Si tratas de registrar un subtipo o `método` de manera incorrecta.

* **¿Cómo depurar `métodos` no encontrados?**

  Véase "[Problemas comunes](#problemas-comunes)".

* **¿Se puede incluir llamadas a Estructura en bucles muy repetitivos?**

  Véase "[Consideraciones](#consideraciones)".

## Problemas comunes

* **`Manejador` no se ejecuta**

  Compruebe que fue asignado a los tipos de datos o argumentos adecuados verificando con [`.type()`](#_etypeinput) los tipos detectados. Y revise "[Secuencia de Ejecución por Especificidad](#secuencia-de-ejecución-por-especificidad)" o "[Conceptos Avanzados: `Manejadores`](#conceptos-avanzados-manejadores)".

* **Error de `métodos` no encontrados**

  Si al invocar un `método` aparece un error, asegúrese de que el `método` esté registrado para los tipos de datos o argumentos correctos, y que los datos sean exactamente de esos tipos, se puede usar [`.type()`](#_etypeinput) para verificar los tipos detectados de los datos.

* **`Métodos` se sobrescriben**

  Revise cómo funciona el orden de sobrescritura en caso de `métodos` con el mismo nombre en "[Colisión de `Métodos` o `Manejadores`](#colisión-de-métodos-o-manejadores)" y la sección de sobrescritura dinámica "[Sobrescribir `Métodos` Dinámicamente](#sobrescribir-métodos-dinámicamente)".

## Consideraciones

* **Rendimiento**

  **En dispositivos de gama baja** se experimentan retrasos (`lags`) en bucles de alta frecuencia. Por ejemplo:
  
  `Lag` de aprox. 1 segundo por cada 100000 ejecuciones seguidas en:

  - **Dispositivo:** "HP 15 Notebook PC".
  - **Procesador:** "AMD A8-7410 APU with AMD Radeon R5 Graphics, 2200 Mhz, 4 Core(s), 4 Logical Processor(s)".
  - **S.O.:** "Windows 10 Home" de 64 bits.
  - **Procesos simultáneos:** procesos comunes del S.O. ejecutándose.
  - **Entorno de ejecución:** "Google Chrome 138.0".
  - **Contexto de ejecución:** limpio, 10 tipos de datos variados definidos con 100 `métodos` simples en total asignados equitativamente.
  - **Resumen:** bucle `for` de 10000 repeticiones con 10 llamadas al `despachador` para los tipos definidos.

* **Inconsistencias**

  Como se menciona en la documentación del código de [`jQuery`](https://code.jquery.com/jquery-3.7.1.js) (en los comentarios de la función `isFunction`, línea 77), en ciertas versiones antiguas de navegadores hay nodos del DOM que podrían retornar como tipo primitivo `'Function'` en lugar de `'Object'`. Por eso se ha integrado la siguiente solución de compatibilidad con los subtipos predefinidos `browser-dom`:

  ```javascript
  _e.subtype({
    'Function': function(input){
      return typeof input.nodeType === "number" || typeof input.item === "function" ? 'Object' : null;
    }
  });
  ```

## Licencia

MIT © Desarrollado por [OKZGN](https://okzgn.com)

---

[Volver arriba](#estructura)