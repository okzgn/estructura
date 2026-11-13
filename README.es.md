# Estructura

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | **Español**

Estructura es un framework de JavaScript ligero y sin dependencias que te permite asignar funciones que se vincularán automáticamente a tipos de datos personalizados o extendidos, basándose en uno o múltiples argumentos.

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
  - [TypeScript](#typescript)

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
- [Crear Instancias](#_einstancename-options)
- [Configurar Opciones](#_econfigoptions)
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
  - [Manejadores como Métodos](#manejadores-como-métodos)
  - [Sobrescribir Métodos Dinámicamente](#sobrescribir-métodos-dinámicamente)

### 8. Adicionales
- [Preguntas Frecuentes](#faq-preguntas-frecuentes)
- [Problemas Comunes](#problemas-comunes)
- [Consideraciones](#consideraciones)
- [Notas sobre Versiones Anteriores y Actual](#notas-sobre-versiones-anteriores-y-actual)
- [Licencia](#licencia)

</details>

## Características Principales

*   **Sistema de Tipos Extensible:** Define tus propios tipos ([`.subtype()`](#_esubtypedefinitions)) para cualquier estructura de datos, yendo mucho más allá de los tipos principales de JavaScript.
*   **Instancias Aisladas (`Sandboxing`):** Crea múltiples instancias de Estructura ([`.instance()`](#_einstancename-options)) que no interfieren entre sí, cada una con su propio registro de tipos y funciones.
*   **Robusto y Predecible:** Las llamadas al `despachador` son deterministas. Para una misma configuración de tipos y funciones registradas ([`.fn()`](#_efnassignments)) para esos tipos, una llamada a [`_e(arg1, arg2, ...)`](#_earg1-arg2-) siempre seguirá una misma secuencia de ejecución y devolverá el mismo conjunto de `métodos`.
*   **Ligero y sin Dependencias:** Unos 48 KB sin comprimir y menos de 13 KB con gzip (`ESM` y `UMD`), ideal para el navegador o Node.js.

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
      import _e from 'https://unpkg.com/estructura-js/dist/estructura.esm.mjs';
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

### TypeScript

Desde la v1.21.0 el paquete incluye sus declaraciones de tipos (`.d.ts`), tanto para `import` como para `require`, sin instalar nada más:

```typescript
import _e, { type Instance, type TypeResult } from 'estructura-js';

const api: Instance = _e.instance('api', { collision: 'specific' });
const types: TypeResult = api.type([1, 2]); //> ['Object', 'Array'], con types['Array'] === true
```

Como los `métodos` solo se conocen en tiempo de ejecución, el objeto que devuelve el `despachador` admite cualquier `método`. Para más precisión, indica su forma con el parámetro genérico:

```typescript
const list = _e<{ join(sep: string): string }>(['a', 'b']);
list.join('-'); // Tipado: devuelve string
```

Si cargas la distribución `UMD` con un `<script>` (variable global `_e`), declara el global en tu proyecto:

```typescript
declare const _e: import('estructura-js').Instance;
```

> **Nota:** con `moduleResolution` `node16`, `nodenext` o `bundler` los tipos se resuelven automáticamente. Con la resolución clásica (`node`/`node10`), `import _e from 'estructura-js'` requiere `esModuleInterop` (o `allowSyntheticDefaultImports`); la alternativa es `import _e = require('estructura-js')`.

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
    size: (args) => args[0].length // ← Esto es un MÉTODO
  }
});

_e('hola').size(); // Se llama DESPUÉS del despacho
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
    // Guardar array en base de datos
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

**Devuelve la instancia** *(v1.21.0+)*, por lo que las llamadas se pueden encadenar: `_e.fn({ /*...*/ }).subtype({ /*...*/ })`.

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
    También puedes asignar `métodos` que estarán disponibles sin importar el tipo de los argumentos (`Any`) de una instancia registrándolos en el primer nivel del objeto de asignaciones (si ya existe un `método` global con el mismo nombre, el nuevo se ignora con una advertencia; y si el nombre coincide con el de un `método` de un tipo, se genera una [colisión](#colisión-de-métodos-o-manejadores)).

    ```javascript
    _e.fn({
      // Este método estará disponible para todas las llamadas a '_e()'
      timestamp: () => `Procesado a las: ${Date.now()}`
    });

    console.log(_e(123).timestamp());       //> "Procesado a las: 1700000000000"
    console.log(_e('abc').timestamp());     //> "Procesado a las: 1700000000001"
    ```
    #### **Colisión de `Métodos` o `Manejadores`**

    **⚠️ IMPORTANTE: Modo del Framework, En Colisiones Lo General Sobrescribe a lo Específico**
    
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
    // Al haber una colisión, prevalecerá el método del tipo más general (principal 'Object').
    _e([1, 2, 3]).logType(); //> "Tipo General (Principal): Object"
    ```
    
    **Nota:** Esta decisión de diseño garantiza que los `métodos` o `manejadores globales` puedan actuar como un `'fallback'` predecible y consistente, asegurando que una función siempre esté disponible si no se encuentra una más específica. O para prevenir que `métodos` o `manejadores` registrados más recientes sobrescriban a los anteriores.

    **Cambiar el orden de especificidad (v1.21.0+):** con la opción `collision` de [`.config()`](#_econfigoptions) o de [`.instance()`](#_einstancename-options) se elige qué definición prevalece en una colisión:

    | Valor                  | Prevalece                                                                                          |
    |------------------------|----------------------------------------------------------------------------------------------------|
    | `'general'` (defecto) | El tipo más general (comportamiento descrito arriba).                                              |
    | `'specific'`          | El tipo más específico. Los `métodos`/`manejadores` globales actúan solo como `fallback` real.    |

    ```javascript
    const e = _e.instance('myAPI', { collision: 'specific' });

    e.fn({
      Array: { logType: () => 'Tipo Derivado: Array' },
      Object: { logType: () => 'Tipo General (Principal): Object' },
      logType: () => 'Global'
    });

    e([1, 2, 3]).logType(); //> "Tipo Derivado: Array"
    e({}).logType();        //> "Tipo General (Principal): Object"
    e('texto').logType();   //> "Global"
    ```

    Con `'specific'`, en las secuencias de varios argumentos el primer argumento es el que más pesa: se comparan los tipos del primer argumento y, a igualdad, los del segundo, y así sucesivamente. La advertencia de colisión se sigue mostrando, indicando que se ignoró la definición más general. El orden de **ejecución** de los `manejadores` (del más específico al más general) **no cambia** con esta opción.

    > **Nota:** con `'general'` (el valor por defecto) se conserva exactamente el orden de resolución de las versiones anteriores. En secuencias de varios argumentos ese orden no sigue siempre la regla "lo general sobrescribe a lo específico" (por ejemplo, entre `Array + String` y `Object + String` prevalece `Array + String`). Si necesitas un orden consistente en varios argumentos usa `'specific'`.

    > **Nota:** las colisiones entre `manejadores` se deben a que, con `handlers: 'exposed'`, un `manejador` también queda adjunto al resultado como `método` con el nombre de su tipo. Con `'hidden'`, el valor por defecto desde la v1.23.0, no se adjuntan, así que no colisionan. Véase "[`Manejadores` como `Métodos`](#manejadores-como-métodos)".

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

    > **Nota:** *(v1.23.0+)* Estructura guarda su propia copia de cada función registrada. Los `métodos` que se fusionan con un `manejador` no se guardan en tu función, así que varios tipos pueden reutilizar **la misma función** como `manejador` sin compartir sus `métodos`, y las propiedades que añadas tú a la función nunca se adjuntan como `métodos`: [`.fn()`](#_efnassignments) es la única forma de añadir `métodos` a un tipo.
    >
    > ```javascript
    > const logValue = (value) => console.log(value);
    >
    > _e.fn({ String: logValue, Number: logValue });
    > _e.fn({ String: { upper: (args) => args[0].toUpperCase() } });
    >
    > _e('texto').upper(); //> "TEXTO"
    > _e(5).upper;         //> undefined: 'Number' no recibe los métodos de 'String'
    > ```

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

* **Si la función ya existe:**

    Fusionar no es sobrescribir: **prevalece la primera función registrada**. Si registras otro `manejador` para un tipo que ya tiene uno (o para la raíz), u otro `método` con un nombre que ya existe en la misma secuencia de tipos, el nuevo se ignora con una advertencia *(v1.22.0+; antes se ignoraba sin avisar)*. Registrar de nuevo exactamente la misma función no genera ninguna advertencia.

    ```javascript
    _e.fn({ String: { log: () => 'primero' } });
    _e.fn({ String: { log: () => 'segundo' } }); // Se ignora con una advertencia

    _e('texto').log(); //> "primero"
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

**Con la opción `args: 'spread'` (v1.21.0+)**, los `métodos` reciben los argumentos del `despachador` uno a uno, y los argumentos con los que se llama al `método` van juntos en un `array` como **último** argumento (véase [`.config()`](#_econfigoptions)):

| Opción `args`        | Argumentos de función del `método`           | Para `_e(a, b).method(c, d)` |
|-----------------------|-----------------------------------------------|-------------------------------|
| `'array'` (defecto)  | `(args, ...methodArgs)`                       | `([a, b], c, d)`              |
| `'spread'`           | `(...dispatcherArgs, methodArgs)`             | `(a, b, [c, d])`              |

```javascript
const e = _e.instance('spreadAPI', { args: 'spread' });

e.fn({
  Array: {
    String: {
      // (arr, sep) son los argumentos del despachador; [prefix] son los del método
      join: (arr, sep, [prefix]) => prefix + arr.join(sep)
    }
  }
});

e([1, 2, 3], '-').join('>'); //> ">1-2-3"
```

Con `'spread'` el último parámetro es siempre un `array` (`[]` si el `método` se llama sin argumentos). Para un `método` registrado en una secuencia de tipos, la cantidad de argumentos del `despachador` es fija: la longitud de la secuencia. Para los [`métodos globales`](#métodos-globales) varía con cada llamada; por eso el `array` de argumentos del `método` va siempre al final: `(...all) => { const methodArgs = all.pop(); /* 'all' queda con los del despachador */ }`. Los `manejadores` **no cambian**: siguen recibiendo los argumentos directamente.

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

Registra definiciones de tipos nuevos para cada instancia de Estructura. **Se llaman subtipos y alias**. Devuelve la instancia *(v1.21.0+)*, por lo que las llamadas se pueden encadenar.

**`definitions`:** Un objeto donde cada *clave* es un nombre de tipo predefinido y cada *valor* puede ser:

*   Una cadena de texto (`string`) para crear un alias simple.
*   Un `array` de cadenas de texto para asignar múltiples alias a la vez.
*   **Una función evaluadora** que recibe el [valor (`input`)](#_earg1-arg2-) y decide el tipo/subtipo de `input`:
    > **Argumentos disponibles en la función:**
    > * **`input`**: El valor que se está analizando.
    > * **`primitive_type`**: El nombre del tipo principal o derivado del que proviene (ej. `'Object'`, `'String'`).
    > * **`getTypes`**: Una función que, al ejecutarse `getTypes()`, devuelve una copia segura del *array/mapa* con todos los tipos detectados hasta ese momento en la cadena de recursividad. (Al ser una función, garantiza un rendimiento óptimo al no clonar el mapa a menos que lo solicites explícitamente).

    **Valores que puede retornar la función:**

    * Una cadena de texto con el nombre nuevo del subtipo.
    * Un *booleano* **`true`** si el nombre de la *clave* debe usarse como el nombre del subtipo.
    * Si no coincide con el subtipo: **`undefined`**, **`null`**, **`false`**, o **`''`**.

    Las funciones evaluadoras solo se ejecutan al detectar los tipos de un valor (en el `despachador` o en [`.type()`](#_etypeinput)), nunca al registrar con [`.fn()`](#_efnassignments) o `.subtype()` *(v1.22.0+)*.

    > **Nombres no permitidos:** el resultado de [`.type()`](#_etypeinput) es un `array`, así que un subtipo o alias no puede llamarse como una propiedad nativa de los `arrays` (`map`, `filter`, `length`, etc.). Esos nombres se ignoran con una advertencia *(v1.22.0+)*. Con la convención de nombres con mayúscula inicial (`Email`, `User`) no hay conflicto.

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
Además, **`definitions`** puede ser una cadena de texto como `'browser-dom'`, que sirve para cargar [subtipos predefinidos para el DOM de navegadores](#subtipos-predefinidos-browser-dom) en instancias. Si la cadena no es el nombre de un conjunto predefinido, no se registra nada y se emite una advertencia *(v1.22.0+)*.

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
console.log(domAPI.type(document));        //> [ "Document", "HTMLDocument", "Object" ]
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

### `_e.instance(name, options)`

Crea o recupera una instancia aislada de Estructura. Esto es ideal para evitar colisiones en aplicaciones grandes o al crear librerías.

**`options`** *(opcional, v1.21.0+)*: objeto con las [opciones](#_econfigoptions) iniciales de la instancia. Solo se aplican cuando la instancia se **crea**; si la instancia ya existe se ignoran con una advertencia (usa [`.config()`](#_econfigoptions) para cambiarlas).

```javascript
const strictAPI = _e.instance('strictAPI', { collision: 'specific', args: 'spread' });
```

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

### `_e.config(options)`

*(v1.21.0+)* Cambia las opciones de una instancia (cada instancia tiene las suyas, la instancia por defecto `_e` incluida) y devuelve la instancia para encadenar. Llamada **sin argumentos**, devuelve una copia de las opciones actuales. Los valores inválidos y las opciones desconocidas se ignoran con una advertencia.

| Opción        | Valores                                  | Descripción                                                                                                              |
|---------------|------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `collision`  | `'general'` (defecto), `'specific'`      | Qué definición prevalece cuando un `input` coincide con varios tipos que asignan un `método` con el mismo nombre. Véase "[Colisión de `Métodos` o `Manejadores`](#colisión-de-métodos-o-manejadores)". |
| `args`       | `'array'` (defecto), `'spread'`           | Cómo reciben los argumentos los `métodos`. Véase "[Cómo se Pasan los Argumentos del `Despachador`](#cómo-se-pasan-los-argumentos-del-despachador)". |
| `handlers`   | `'hidden'` (defecto), `'exposed'`         | *(v1.22.0+; `'hidden'` por defecto desde la v1.23.0)* Si un `manejador` queda además adjunto al resultado como `método`, y si un nombre que empieza con mayúscula es un tipo. Véase "[`Manejadores` como `Métodos`](#manejadores-como-métodos)". |
| `errors`     | `'console'` (defecto), `'throw'`          | *(v1.22.0+)* Qué ocurre cuando un `método`, un `manejador` o una función evaluadora de subtipos lanza un error: se informa por consola y el flujo continúa, o se relanza el error original. |

```javascript
_e.config(); //> { collision: 'general', args: 'array', handlers: 'hidden', errors: 'console' }

_e.config({ collision: 'specific' }).config({ args: 'spread' });
_e.config(); //> { collision: 'specific', args: 'spread', handlers: 'hidden', errors: 'console' }
```

Desde la v1.23.0 el valor por defecto de `handlers` es `'hidden'`; los demás valores por defecto reproducen el comportamiento de las versiones anteriores. Para mantener el comportamiento de la v1.22.0 usa `handlers: 'exposed'` (véase "[`Manejadores` como `Métodos`](#manejadores-como-métodos)"). Un cambio de opciones se aplica a las llamadas al `despachador` posteriores; los objetos que ya devolvió el `despachador` conservan la forma de pasar argumentos con la que se crearon.

**Errores (`errors`):** por defecto (`'console'`), si un `método`, un `manejador` o una función evaluadora de subtipos lanza un error, este se informa por consola y el flujo continúa (un `método` que falla devuelve el objeto resultado). Con `'throw'` se relanza el error original, con su traza y su clase, y no se escribe en consola. La opción se aplica en el momento en que ocurre el error.

```javascript
const api = _e.instance('strict', { errors: 'throw' });

api.fn({ String: { parse: (args) => JSON.parse(args[0]) } });

try {
  api('no es JSON').parse();
}
catch(error){
  console.log(error instanceof SyntaxError); //> true
}
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

> **Nota:** el resultado es un `array`, por lo que también tiene sus propiedades nativas (`types['filter']` es una función para cualquier valor). Usa la verificación rápida solo con nombres de tipos; con la convención de nombres con mayúscula inicial no hay conflicto.

## Conceptos Avanzados: `Manejadores`

Estas funciones se comportan de manera diferente, ofrecen más flexibilidad y pueden:

* **Auto-ejecutarse:**

  Si la secuencia (combinación) de tipos coincide con la función (`manejador`), se ejecutará automáticamente *antes* de que el `despachador` devuelva el objeto con los `métodos` (que está como referencia en **`this`** [si es función clásica `function(){}`]).

  Los argumentos del `despachador` se pasan directamente a la función (véase "[Cómo se Pasan los Argumentos del `Despachador`](#cómo-se-pasan-los-argumentos-del-despachador)").

* **Contener más `manejadores` o `métodos`:**

  Con [`.fn()`](#_efnassignments) se le pueden fusionar `sub-manejadores` o `métodos` para un despacho más profundo (véase "[Fusión de Registros de Asignaciones](#fusión-de-registros-de-asignaciones-registro-aditivo)").

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

#### `Manejadores` como `Métodos`

Por defecto (`handlers: 'hidden'`, *v1.23.0+*), todo nombre que **empieza con mayúscula** se trata como un nombre de tipo: su función solo actúa como `manejador` (se ejecuta cuando su tipo coincide) y nunca se adjunta como `método`. Los nombres que empiezan con minúscula son `métodos`.

```javascript
_e.fn({
  String: (str) => console.log(`Manejador: ${str}`),
  log: () => 'Método global'
});

Object.keys(_e(5));  //> [ 'log' ]
_e('texto');         //> "Manejador: texto"
```

Con la opción `handlers: 'exposed'` *(v1.22.0+)* de [`.config()`](#_econfigoptions) o de [`.instance()`](#_einstancename-options), el valor por defecto hasta la v1.22.0, una función asignada a un nombre de tipo es un `manejador` y, además, queda adjunta al resultado como un `método` con ese nombre:

```javascript
const api = _e.instance('myAPI', { handlers: 'exposed' });

api.fn({ String: (str) => console.log(str) });

Object.keys(api(5)); //> [ 'String' ]
```

> **Nota:** con `'hidden'` la regla se aplica en todos los niveles (`métodos` globales, `métodos` de un tipo y los que devuelve un `manejador`), así que los nombres de los `métodos` deben empezar con minúscula: un `método` llamado `Format` es un tipo y no se adjunta. También evita las advertencias de colisión entre `manejadores` de secuencias distintas que comparten el nombre de un tipo (por ejemplo, los de `Array + String` y `Object + String` al llamar al `despachador` solo con un `array`).

> **Migrar desde la v1.22.0:** si tu código llama a un `manejador` como `método` (`_e(5).String()`) o tiene `métodos` cuyo nombre empieza con mayúscula, usa `_e.config({ handlers: 'exposed' })` (o `_e.instance(nombre, { handlers: 'exposed' })`), o renombra esos `métodos` para que empiecen con minúscula.

#### Sobrescribir `Métodos` Dinámicamente

**Si un `manejador` devuelve un objeto o función**, los `sub-manejadores` o `métodos` que contenga sobrescribirán el conjunto de `métodos` que el `despachador` está agregando al objeto principal que devolverá (que está como referencia en **`this`** [si es función clásica `function(){}`]).

Cualquier otro valor devuelto (`true`, un número, una cadena, o nada) deja intactos los `métodos` fusionados con el `manejador` *(v1.22.0+; antes, un valor como `true` o un número dejaba el resultado sin esos `métodos`)*. Para dejar el resultado sin los `métodos` de ese tipo, devuelve un objeto vacío (`{}`).

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

## FAQ (Preguntas Frecuentes)

* **¿Puedo usar Estructura con TypeScript?**

  Sí. Desde la v1.21.0 el paquete incluye sus declaraciones de tipos (véase "[TypeScript](#typescript)"). Estructura resuelve los tipos en tiempo de ejecución, así que sigue siendo una alternativa ligera a la verbosidad del tipado estático, y ahora también puede usarse desde proyectos TypeScript.

* **¿Tiene alguna manera integrada para depurar?**

  Sí, actualmente se emiten advertencias y errores en consola (o se lanza un error en entornos sin consola) en estos casos:
  * Si registras un subtipo con una función con error o si devuelve un tipo incorrecto.
  * Si tratas de usar nombres no permitidos para instancias o `métodos`, como: nombres de propiedades heredadas de [`Object.prototype`](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object), [palabras reservadas de JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Lexical_grammar), y nombres de propiedades que usa el framework.
  * Si la instancia que tratas de crear ya existe.
  * Si hubo un conflicto con nombres de `métodos` (colisiones).
  * Si un `método` o un `manejador` presenta errores al ejecutarse.
  * Si tratas de registrar un subtipo o `método` de manera incorrecta.
  * Si registras un `manejador` o un `método` que ya existe: se conserva el primero *(v1.22.0+)*.
  * Si el nombre de un conjunto predefinido de subtipos no existe, o si un subtipo usa el nombre de una propiedad nativa de los `arrays` *(v1.22.0+)*.

  Con la opción `errors: 'throw'` *(v1.22.0+)* de [`.config()`](#_econfigoptions), los errores de `métodos`, `manejadores` y funciones evaluadoras de subtipos se lanzan en lugar de informarse por consola.

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

* **Un `manejador` o `método` nuevo no reemplaza al anterior**

  Al registrar con [`.fn()`](#_efnassignments) prevalece la primera función registrada: la nueva se ignora con una advertencia. Véase "[Fusión de Registros de Asignaciones](#fusión-de-registros-de-asignaciones-registro-aditivo)".

* **Aparecen `métodos` con nombres de tipos (`String`, `Array`, etc.)**

  Con `handlers: 'exposed'`, un `manejador` queda adjunto también como `método` con el nombre de su tipo. El valor por defecto, `'hidden'` *(v1.23.0+)*, lo evita. Véase "[`Manejadores` como `Métodos`](#manejadores-como-métodos)".

* **Falta en el resultado un `método` cuyo nombre empieza con mayúscula**

  Desde la v1.23.0 (`handlers: 'hidden'` por defecto), un nombre que empieza con mayúscula es un tipo, no un `método`. Renombra el `método` para que empiece con minúscula, o usa `handlers: 'exposed'`. Véase "[`Manejadores` como `Métodos`](#manejadores-como-métodos)".

* **Un `método` devuelve el objeto resultado en lugar de su valor, o un error no se propaga**

  Por defecto, si un `método` lanza un error, este se informa por consola y el `método` devuelve el objeto resultado. Para que el error se lance usa la opción `errors: 'throw'` de [`.config()`](#_econfigoptions).

## Consideraciones

* **Rendimiento**

  * **En la v1.23.0:**

    El `despachador` guarda, para cada nodo del árbol, la lista de sus `métodos` y solo la rehace tras un registro que cambia ese nodo o tras un cambio de opciones. Ya no recorre en cada llamada todos los tipos registrados en la raíz, y el texto de una advertencia que se repite en cada llamada se construye una sola vez. Medido con `bench/benchmark.js` (Node.js 24, mediana de tres corridas de 31 muestras):

    | Escenario | v1.22.0 | v1.23.0 |
    |---|---|---|
    | 1 argumento, despacho + llamada (escenario del README) | 712 ns | 577 ns |
    | 2 argumentos, despacho + llamada | 723 ns | 640 ns |
    | Subtipos personalizados, despacho + llamada | 1,33 µs | 1,18 µs |
    | Un conflicto de nombres en cada llamada | 1,81 µs | 602 ns |
    | 50 tipos registrados en la raíz | 2,80 µs | 315 ns |
    | Un tipo con 20 `métodos` | 2,37 µs | 1,17 µs |
    | 10 `manejadores` en la raíz (opciones por defecto) | 870 ns | 474 ns |
    | Un registro seguido de un despacho, con 3000 `métodos` en la raíz | 559 µs | 204 µs |

    Registrar cuesta entre un 2 % y un 9 % más (una instancia con 100 `métodos`: unos 47 µs), porque Estructura guarda ahora su propia copia de cada función registrada. Una llamada que adjunta 20 `métodos` o más sigue siendo claramente más lenta que una que adjunta 19 (en ese escenario, 1,17 µs frente a 0,49 µs): con tantas propiedades, los motores de JavaScript guardan el objeto resultado en un modo más lento.

  * **En la v1.22.0:**

    El registro con [`.fn()`](#_efnassignments) y [`.subtype()`](#_esubtypedefinitions) ya no ejecuta las funciones evaluadoras de subtipos, por lo que crear una instancia y registrar sus definiciones tarda alrededor de un tercio menos (medido con `bench/benchmark.js`: instancia + subtipos + 100 `métodos`). El tiempo de despacho no cambia.

  * **En la v1.19.0:**

    Se optimizó el registro de subtipos anidados en [`.subtype()`](#_esubtypedefinitions), reduciendo a la mitad el tiempo de resolución en anidaciones profundas.

  * **Hasta la v1.18.0:**

    **En dispositivos de gama baja** se experimentan retrasos (`lags`) en bucles de alta frecuencia. Por ejemplo:
    
    `Lag` de aprox. 1 segundo por cada 100000 ejecuciones seguidas en:

    - **Dispositivo:** "HP 15 Notebook PC".
    - **Procesador:** "AMD A8-7410 APU with AMD Radeon R5 Graphics, 2200 Mhz, 4 Core(s), 4 Logical Processor(s)".
    - **S.O.:** "Windows 10 Home" de 64 bits.
    - **Procesos simultáneos:** procesos comunes del S.O. ejecutándose.
    - **Entorno de ejecución:** "Google Chrome 138.0".
    - **Contexto de ejecución:** limpio, 10 tipos de datos variados definidos con 100 `métodos` simples en total asignados equitativamente.
    - **Resumen de ejecución:** bucle `for` de 10000 repeticiones con 10 llamadas al `despachador` para los tipos definidos.

* **Inconsistencias**

  Como se menciona en la documentación del código de [`jQuery`](https://code.jquery.com/jquery-3.7.1.js) (en los comentarios de la función `isFunction`, línea 77), en ciertas versiones antiguas de navegadores hay nodos del DOM que podrían retornar como tipo primitivo `'Function'` en lugar de `'Object'`. Por eso se ha integrado la siguiente solución de compatibilidad con los subtipos predefinidos `browser-dom`:

  ```javascript
  _e.subtype({
    'Function': function(input){
      return typeof input.nodeType === "number" || typeof input.item === "function" ? 'Object' : null;
    }
  });
  ```

## Notas sobre Versiones Anteriores y Actual

*   **En la v1.23.0:**

    * **Rendimiento:** el despacho tarda entre un 10 % y un 20 % menos en los casos habituales, hasta un 89 % menos con muchos tipos registrados en la raíz, y un conflicto de nombres que se repite en cada llamada cuesta un 67 % menos. Registrar cuesta entre un 2 % y un 9 % más. Véase "[Consideraciones](#consideraciones)".
    * **`Breaking change`:** el valor por defecto de la opción `handlers` pasa a ser `'hidden'`: un nombre que empieza con mayúscula es un tipo, así que ni los `manejadores` ni los `métodos` con nombres así se adjuntan ya como `métodos`. `handlers: 'exposed'` recupera el comportamiento anterior. Véase "[`Manejadores` como `Métodos`](#manejadores-como-métodos)".
    * **Cambio:** Estructura guarda su propia copia de cada función registrada. [`.fn()`](#_efnassignments) ya no escribe los `métodos` de un tipo en tu `manejador`, las propiedades que añadas tú a esa función nunca se adjuntan como `métodos`, y los tipos que reutilizan la misma función ya no comparten sus `métodos`.
    * **`Bugfix`:** lo heredado de `Object.prototype` ya no cuenta como nombre reservado, nodo, tipo, instancia ni colisión. En la v1.22.0 una función añadida ahí podía bloquear un registro, ejecutarse como `manejador` de un tipo con su nombre o, con `collision: 'specific'`, ejecutarse en lugar del `método` registrado.
    * **Pruebas y `benchmark`:** pruebas nuevas para el comportamiento que se mantiene y para estos cambios. `bench/benchmark.js` usa nombres de `método` en minúscula, así que mide igual la v1.22.0 y la v1.23.0, y añade escenarios con muchos tipos, muchos `métodos`, `manejadores`, una llamada repetida a un `método` y un registro seguido de un despacho.
    * **Documentación:** ya no hace falta la nota de mala práctica sobre reutilizar la misma función como `manejador` de varios tipos, y se actualiza el tamaño (unos 48 KB sin comprimir).

*   **En la v1.22.0:**

    * **Nueva opción `handlers`** (`'exposed'` | `'hidden'`) para que los `manejadores` no queden adjuntos como `métodos`: véase "[`Manejadores` como `Métodos`](#manejadores-como-métodos)".
    * **Nueva opción `errors`** (`'console'` | `'throw'`) para relanzar los errores de `métodos`, `manejadores` y funciones evaluadoras de subtipos: [`.config()`](#_econfigoptions).
    * **Nuevas advertencias** en casos que antes se ignoraban en silencio: al registrar un `manejador` o un `método` que ya existe (prevalece el primero), al usar en [`.subtype()`](#_esubtypedefinitions) el nombre de un conjunto predefinido que no existe, y cuando un subtipo usa el nombre de una propiedad nativa de los `arrays`.
    * **`Bugfix`:** un `manejador` que devolvía un valor que no es un objeto ni una función (como `true` o un número) dejaba el resultado sin los `métodos` fusionados con él. Ahora solo un objeto o una función los reemplazan.
    * **`Bugfix`:** [`.fn()`](#_efnassignments) y [`.subtype()`](#_esubtypedefinitions) ejecutaban las funciones evaluadoras de subtipos sobre los objetos de definiciones al registrar. Ahora solo se ejecutan al detectar tipos.
    * **Rendimiento:** como consecuencia, el registro tarda alrededor de un tercio menos (véase "[Consideraciones](#consideraciones)"). El tiempo de despacho no cambia.
    * **TypeScript:** nuevos tipos `HandlersOption` y `ErrorsOption`; `Options` y `CurrentOptions` incluyen las opciones nuevas.
    * **Documentación:** la documentación por defecto (`README.md`) pasa a estar en inglés; esta versión en español se mantiene en `README.es.md`. Las pruebas unitarias, las de tipos y el `benchmark` también pasan al inglés. Además: nota de mala práctica sobre reutilizar la misma función como `manejador` de varios tipos (véase "[Fusión de Registros de Asignaciones](#fusión-de-registros-de-asignaciones-registro-aditivo)"), tamaño actualizado (unos 35 KB sin comprimir), corrección del ejemplo de "[`Métodos`](#métodos)", que usaba el nombre reservado `length`, y corrección del ejemplo de importación `ESM` por CDN en navegadores, que ahora apunta al archivo `ESM`.
    * **Pruebas:** integración continua con GitHub Actions (pruebas unitarias, pruebas de tipos y las comprobaciones de `npm run check`: sintaxis `ES3` de la distribución `UMD`, distribuciones `UMD` y `ESM` sincronizadas, y versión). Las mismas comprobaciones se ejecutan automáticamente antes de publicar (`prepublishOnly`).
    * Sin `breaking changes`: los valores por defecto mantienen el comportamiento de la v1.21.0. [`.config()`](#_econfigoptions) sin argumentos devuelve también las opciones nuevas.

*   **En la v1.21.0:**

    * **Nueva opción `collision`** (`'general'` | `'specific'`) para elegir qué definición prevalece en las colisiones de `métodos`: [`.config()`](#_econfigoptions).
    * **Nueva opción `args`** (`'array'` | `'spread'`) para elegir cómo reciben los argumentos los `métodos`: `(...argumentos del despachador, [argumentos del método])`.
    * Nuevo método [`.config()`](#_econfigoptions) y segundo parámetro opcional en [`.instance()`](#_einstancename-options).
    * **TypeScript:** se incluyen declaraciones de tipos (`.d.ts`) para `import` y `require`, con pruebas de tipos (`npm run test:types`). Véase "[TypeScript](#typescript)".
    * [`.fn()`](#_efnassignments) y [`.subtype()`](#_esubtypedefinitions) devuelven la instancia, por lo que se pueden encadenar con [`.config()`](#_econfigoptions).
    * **`Bugfix`:** `getTypes()` en las funciones evaluadoras de [`.subtype()`](#_esubtypedefinitions) devolvía `undefined` en lugar de la copia del *array/mapa* de tipos detectados.
    * **`Bugfix`:** [`.fn()`](#_efnassignments) con un `manejador` raíz devolvía el estado interno de la instancia.
    * **`Bugfix`:** la distribución `ESM` no incluía la optimización de la v1.19.0 para subtipos anidados (las funciones evaluadoras se ejecutaban dos veces). Ambas distribuciones vuelven a estar sincronizadas y las pruebas unitarias ahora también cubren la `ESM`.
    * Sin `breaking changes`: los valores por defecto mantienen el comportamiento de la v1.20.0.

*   **Hasta la v1.20.0:**

    * **Corrección relevante:** se inicializó `.unref()` en el `setInterval` del sistema interno de mensajes de consola, específicamente para entornos como Node.js, de modo que el proceso pueda terminar en lugar de mantenerse indefinidamente activo.
    * Pequeños ajustes de coherencia en la documentación.
    * En general, la funcionalidad se ha mantenido estable.

*   **En la v1.19.0:**

    * **`Bugfix` crítico:** se resolvió una fuga de memoria (`Memory Leak`) en el sistema interno de cola de mensajes de consola (`setInterval`).
    * **Rendimiento:** se optimizó el registro de subtipos anidados (`trash code` eliminado en [`.subtype()`](#_esubtypedefinitions)), reduciendo a la mitad el tiempo de resolución en anidaciones profundas.
    * Se mejoraron o actualizaron los comentarios JSDoc del código y documentación.

*   **En la v1.18.0:**

    * Se han eliminado redundancias y se ha corregido el flujo de mensajes de consola.

*   **En la v1.17.0:**

    * Se ha mejorado la seguridad en `subtype_definition_execution` y muestra de advertencias y errores en consola.
    * Se corrigieron inconsistencias en `subtype`, `is_correct_object_property_name`, `merge_type_fns_node` y mensajes de consola.
    * Compatibilidad integrada para inconsistencias de ciertos navegadores con subtipos predefinidos `browser-dom`.
    * Se ha degradado la versión mínima de Jest para pruebas unitarias a v29.7+ para asegurar la compatibilidad con versiones anteriores de Node.js (v14.15+).
    * Se mejoraron y agregaron pruebas unitarias para cobertura extra.
    * Las actualizaciones se centraron principalmente en la documentación.

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

## Licencia

MIT License

Copyright (c) 2025 [OKZGN](https://okzgn.com)

---

[Volver arriba](#estructura)
