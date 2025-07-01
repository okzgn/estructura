# Estructura
> A lightweight, type-based dispatching JavaScript Framework.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Estructura es un framework JavaScript ligero y sin dependencias que implementa **despacho múltiple (multiple dispatch)** basado en un sistema de tipos dinámico y extensible.

En lugar de la programación orientada a objetos tradicional, donde los métodos pertenecen a clases estáticas (`miInstancia.method()`), Estructura te permite definir funciones que se "adjuntan" a un objeto dinámico basado en los tipos de todos los argumentos. Esto resulta en una sintaxis de uso fluida (`_e(datos).method()`), pero con una lógica de despacho mucho más flexible y polimórfica.

**[Guía rápida, ejemplo básico...](#guía-de-inicio-rápido)**

---

## Índice General

### 1. Introducción
- [Características principales](#características-principales)
- [¿Por qué usar Estructura?](#por-qué-usar-estructura)

### 2. Instalación y Configuración
- [Instalación](#instalación)
  - [npm](#npm)
  - [CDN (navegador)](#cdn-navegador)
- [Compatibilidad](#compatibilidad)
  - [Formatos de módulo](#formatos-de-módulo)
  - [Navegadores](#compatibilidad-con-navegadores)
  - [Entornos](#compatibilidad-con-entornos)

### 3. Guía Rápida
- [Ejemplo básico](#guía-de-inicio-rápido)

### 4. Documentación de la API
- [Función principal `_e()`](#_earg1-arg2-)
- [`_e.fn()`](#_efnassignments): registrar funciones
- [`_e.subtype()`](#_esubtypedefinitions): registrar nuevos tipos
- [`_e.instance()`](#_einstancename): crear instancias
- [`_e.type()`](#_etypeinput): identificar tipos

### 5. Tipos y Subtipos
- [Tipos predefinidos](#tipos-predefinidos)
- [Subtipos predefinidos `browser-dom`](#subtipos-predefinidos-browser-dom)
  - [Node](#subtipo-node)
  - [Nodes](#subtipo-nodes)
  - [Document](#subtipo-document)
  - [Browser](#subtipo-browser)

### 6. Conceptos Avanzados
- [`Manejadores`](#conceptos-avanzados-manejadores)
  - [Auto-ejecución](#1-auto-ejecución-de-manejadores)
  - [Secuencia de ejecución](#2-secuencia-de-ejecución-por-especificidad)
  - [Sobrescritura de métodos](#3-sobrescribir-métodos-dinámicamente)

### 7. Adicionales
- [Notas de versiones](#notas-importantes-sobre-versiones-anteriores)
- [Preguntas frecuentes](#faq-preguntas-frecuentes)
- [Problemas comunes](#problemas-comunes)
- [Consideraciones](#consideraciones)
- [Licencia](#licencia)

## Características Principales

*   **Despacho Múltiple Basado en Tipos:** Selecciona la lógica a ejecutar y/o métodos a despachar, basándose en la combinación de los tipos de los argumentos ([`.type()`](#_etypeinput)), no solo del primer argumento.
*   **Sistema de Tipos Extensible:** Define tus propios tipos y jerarquías ([`.subtype()`](#_esubtypedefinitions)) para cualquier estructura de datos, yendo mucho más allá de los tipos primitivos de JavaScript.
*   **Instancias Aisladas (Sandboxing):** Crea múltiples instancias de Estructura ([`.instance()`](#_einstancename)) que no interfieren entre sí, cada una con su propio registro de tipos y funciones.
*   **Ligero y sin Dependencias:** Menos de 30 KB (menos de 5 KB minificado y comprimido [gzipped]), ideal para el navegador o Node.js sin añadir peso innecesario.
*   **Robusto y Predecible:** Las llamadas al despachador son deterministas. Para una misma configuración de tipos y funciones registradas ([`.fn()`](#_efnassignments)), una llamada a [`_e(arg1, arg2, ...)`](#_earg1-arg2-) siempre seguirá una misma secuencia de ejecución y devolverá el mismo conjunto de métodos, sin efectos secundarios inesperados.

## ¿Por qué usar Estructura?

Estructura es ideal cuando necesitas manejar lógica compleja que depende de la naturaleza de tus datos, como en:

*   **`APIs` Polimórficas:** Crear funciones como `render(shape)`, `render(shape, context)`, `render(arrayOfShapes)` que se resuelven automáticamente.
*   **Sistemas de Plugins:** Permitir que extensiones de terceros registren manejadores para nuevos tipos de datos sin modificar el núcleo de tu aplicación.
*   **Procesamiento de Datos:** Escribir tuberías de datos limpias que reaccionan a diferentes formatos de entrada (JSON, CSV, XML, etc.).
*   **Refactorización de Código Complejo:** Reemplazar largas cadenas de `if/else` o `switch` que comprueban `typeof` e `instanceof` con una solución más declarativa y mantenible.

## Instalación

### npm
Puedes instalar Estructura a través de npm:

```bash
npm install estructura-js
```
### CDN (navegador)
Puedes usarlo directamente en el navegador a través de un CDN:

```html
<script src="https://unpkg.com/estructura-js"></script>
```

## Compatibilidad

Estructura está diseñado para ser casi universalmente compatible, funcionando sin problemas en una amplia gama de entornos de JavaScript, desde navegadores modernos y antiguos hasta Node.js, etc.

### Formatos de Módulo

El paquete se distribuye en varios formatos para asegurar una integración sencilla, en general, con los siguientes sistemas de módulos:

*   **Módulos ES (ESM):** El formato principal y moderno. Ideal para usar con `import` en Node.js con herramientas de compilación como Vite, Rollup, Webpack, o en navegadores actualizados.
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

*   **UMD (Universal Module Definition):** Proporciona máxima compatibilidad.
    *   **CommonJS (Node.js):** Funciona de forma nativa con `require()`.
        ```javascript
        const _e = require('estructura-js');
        ```

    *   **Navegadores (Global):** Si se incluye con un tag `<script>` normal, crea una variable global `_e`.
        ```html
        <script src="https://unpkg.com/estructura-js"></script>
        <script>
          // La variable global '_e' se ha cargado correctamente
          const estructura = _e;

          // Ejemplo para mostrar los tipos de datos en la consola
          let tipos = _e.type('hola');
          console.log(tipos); //> [ 'String', String: true ]
        </script>
        ```
    *   **AMD (Asynchronous Module Definition):** Compatible con cargadores de módulos como RequireJS. [Ejemplos](https://requirejs.org/docs/start.html#examples).

> **Nota:** **Los ejemplos utilizan sintaxis de ES6 por brevedad**, pero pueden ser fácilmente convertidos para entornos ES5 (como a funciones clásicas `function(){}`).

### Compatibilidad con Navegadores

El código de la distribución **UMD** está escrito en **sintaxis compatible con ES3/ES5**, lo que garantiza su funcionamiento en todos los navegadores modernos y en la mayoría de los antiguos, incluyendo **Internet Explorer 9+**, sin necesidad de transpilación.

### Compatibilidad con Entornos

Estructura funciona perfectamente en cualquier entorno que soporte la sintaxis ES5 (Node.js, Deno, Bun, etc.). 

## Guía de Inicio Rápido

El concepto central es simple: asignas funciones para tipos o combinaciones de tipos y luego llamas al despachador principal `_e()` con tus datos.

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

## Documentación de la `API`

### `_e(arg1, arg2, ...)`

La función despachadora principal. **Cada argumento representa un valor (`input`)**.

* Analiza los tipos de los argumentos proporcionados.
* Busca asignaciones para toda la secuencia (combinación) de tipos.
* Devuelve un nuevo objeto con los métodos correspondientes adjuntos y/o ejecuta funciones `manejadoras`.

---

### `_e.fn(assignments)`

Registra asignaciones de `métodos` y/o funciones [`manejadoras`](#conceptos-avanzados-manejadores), para los tipos o combinaciones de tipos:
* **`Métodos`:** que son funciones dentro de objetos y se invocan explícitamente (`_e(input).method()`).
* **`Manejadores`:** que son funciones asignadas directamente y se ejecutan automáticamente (`_e(input)`) antes de devolver el objeto con los métodos correspondientes adjuntos.

**`assignments`:** Puede ser **un objeto o una función**: 

* **Objeto:**

    Donde cada *clave* se refiere a un nombre de tipo y cada *valor* es un objeto anidado con más métodos o una función (`manejador`). Cada nivel de anidación está relacionado directamente con los argumentos que se pasen a la función despachadora y sus tipos.

    ```javascript
    _e.fn({
      Object: {
        keys: (args) => Object.keys(args[0])
      }
    });

    const keys = _e({ a: 1, b: 2 }).keys();
    console.log(keys); //> ["a", "b"]
    ```

    Los métodos que registras reciben los argumentos del despachador como un **array en la primera posición**. (Véase "[Distinción Crucial: Cómo se Pasan los Argumentos de `_e()`](#distinción-crucial-cómo-se-pasan-los-argumentos-de-_e)").

    ```javascript
    _e.fn({
      String: {
        repeat: (args, times) => args[0].repeat(times)
      }
    });

    const repeated = _e("hola ").repeat(3);
    console.log(repeated); //> "hola hola hola "
    ```

    También puedes asignar métodos "globales" para una instancia y estarán disponibles sin importar el tipo de los argumentos (`Any`). Para ello, regístralos en el primer nivel del objeto de asignaciones.

    ```javascript
    _e.fn({
      // Este método estará disponible en todas las llamadas a '_e()'
      timestamp: () => `Procesado a las: ${Date.now()}`
    });

    console.log(_e(123).timestamp());       //> "Procesado a las: 1700000000000"
    console.log(_e("abc").timestamp());     //> "Procesado a las: 1700000000001"
    ```
    #### **Colisión de Métodos: Lo General Sobrescribe a lo Específico**
    > **IMPORTANTE. Modo por Defecto del Framework**
    >
    > Cuando un [valor (`input`)](#_earg1-arg2-) corresponde a múltiples tipos, todos sus métodos se fusionan en el objeto resultante. Si dos o más tipos asignan un método con el mismo nombre, se producirá una colisión. En este caso, **el método del tipo más general (menos específico) prevalecerá, sobrescribiendo al del tipo más específico**. Puedes consultar el orden de especificidad de cualquier valor usando [`.type()`](#_etypeinput).
    >
    > El orden de sobrescritura es el siguiente (el de abajo sobrescribe al de arriba):
    > 1. Métodos de **subtipos o alias**: Subtipos definidos con `.subtype()`.
    > ```javascript
    > _e.fn({ AnotherCollection: { myMethod: ... }})
    > ```
    >
    > 2. Métodos de **tipos derivados**: [Tipos derivados](#tipos-predefinidos) del valor (`Array`, `RegExp`, `Date`, etc.).
    > ```javascript
    > _e.fn({ Array: { myMethod: ... }})
    > ```
    >
    > 3. Métodos de **tipos primitivos**: [Tipos primitivos](#tipos-predefinidos) del valor (`Object`, `Function`, `String`, etc.).
    > ```javascript
    > _e.fn({ Object: { myMethod: ... }})
    > ```
    >
    > 4. Métodos **globales**: Asignados en la raíz del objeto con `.fn()`.
    > ```javascript
    > _e.fn({ myMethod: ... })
    > ```
    >
    > En estos ejemplos, significa que un método para `Object` sobrescribirá a uno con el mismo nombre en `AnotherCollection`.
    >
    >```javascript
    >// Registramos métodos con el mismo nombre para 'Array' y 'Object'.
    >_e.fn({
    > // Método para el tipo específico: Array
    > Array: {
    >   logType: () => console.log('Tipo Específico: Array')
    > },
    > // Método para el tipo general: Object
    > Object: {
    >   logType: () => console.log('Tipo General: Object')
    > }
    >});
    >// Un array es tanto de tipo 'Array' como de tipo 'Object'.
    >// Al haber una colisión, se ejecutará el método del tipo más general ('Object').
    >_e([1, 2, 3]).logType();
    >```
    >
    >**Nota:** Esta decisión de diseño garantiza que los métodos globales (`Any`) puedan actuar como un `'fallback'` predecible y consistente, asegurando que una función siempre esté disponible si no se encuentra una más específica. O para prevenir que métodos menos importantes sobrescriban a otros de mayor importancia o precedencia.

* **Función:**

    Puedes asignarla para que se ejecute **para cualquier llamada a una instancia**, se llama **`manejador` raíz**.
    ```javascript
    _e.fn((arg1, arg2, /*...,*/ argN) => {
      // Código...
    })
    ```
    Véase "[Conceptos Avanzados: `Manejadores`](#conceptos-avanzados-manejadores)".

### Fusión de Registros de Asignaciones (Registro Aditivo)

Si llamas a `.fn()` varias veces para registrar asignaciones de `manejadores` o métodos **para los mismos tipos**, estas se fusionan en lugar de sobrescribirse. Este comportamiento aditivo sirve para sistemas de plugins o para organizar el código en módulos, ya que permite añadir nueva funcionalidad de forma segura.

* **Para `Manejadores`:**

    Tiene una regla importante: **una vez que un tipo se asigna como un `manejador`, siempre se comportará como tal**.

    Si posteriormente registras un objeto de métodos para ese mismo tipo, los nuevos métodos se añadirán a la función `manejadora`, pero esta no perderá su capacidad de auto-ejecutarse.

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
    const miNumero = _e(10); //> Manejador ejecutado para: 10

    console.log(miNumero.isEven()); //> true
    ```
    Véase "[Conceptos Avanzados: `Manejadores`](#conceptos-avanzados-manejadores)".

* **Para Métodos:**

    Los objetos con métodos para los mismos tipos se fusionarán en lugar de sobrescribirse.

    ```javascript
    // Registro inicial en el núcleo de la aplicación
    _e.fn({
      String: {
        log: (args) => console.log(`[LOG]: ${args[0]}`)
      }
    });

    // Más tarde, un "plugin" añade nueva funcionalidad al tipo String
    _e.fn({
      String: {
        wordCount: (args) => args[0].split(' ').length
      }
    });

    // Ambos métodos están ahora disponibles gracias a la fusión
    const miFrase = _e("Estructura es muy flexible");

    miFrase.log();                      //> [LOG]: Estructura es muy flexible
    console.log(miFrase.wordCount());   //> 4
    ```

### Distinción Crucial: Cómo se Pasan los Argumentos de `_e()`

Hay una diferencia clave en **cómo tus métodos o `manejadores` reciben los argumentos**:

* **Métodos:**

    Reciben los argumentos de `_e()` agrupados en un único array, que se pasa como el primer parámetro.

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

    Reciben los argumentos de `_e()` de forma **desplegada y directa**.

    ```javascript
    _e.fn({
      // 'arg1' es 'Hola'
      String: (arg1) => { console.log(`Recibí directamente: ${arg1}`); }
    });
    _e('Hola'); //> "Recibí directamente: Hola"
    ```

---

### `_e.subtype(definitions)`

Registra definiciones de tipos nuevos para cada instancia de Estructura (`subtipos`).

**`definitions`:** Un objeto donde las *claves* son nombres de tipos predefinidos y los *valores* pueden ser:

*   Una cadena de texto (`string`) para crear un alias simple.
*   Un `array` de cadenas de texto para asignar múltiples alias nuevos a la vez.
*   Una función que recibe el [valor (`input`)](#_earg1-arg2-) y puede devolver:
    * Una cadena de texto con el nombre del subtipo nuevo.
    * Un *booleano* **`true`** si el nombre de la *clave* debe usarse como el nombre del subtipo.
    * Un *booleano* **`false`**, o **`undefined`, `null`, `void`**. Si no coincide con el subtipo.

```javascript
// Crear subtipos
_e.subtype({
  // Con una función
  Object: (input) => (input.userId ? 'User' : false),

  // Con un string (un alias simple)
  RegExp: 'RegexPattern',

  // Con un array (múltiples alias)
  // Un Array ahora también es de tipo 'Collection' y 'OrderedList'
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
const miLista = _e([1, 2, 3]);
console.log(miLista.count());       //> 3
console.log(miLista.isCollection()); //> true
```
Además, **`definitions`** podría ser una cadena de texto como `'browser-dom'`, que sirve para cargar en instancias [subtipos predefinidos para el DOM de navegadores](#subtipos-predefinidos-browser-dom).

### Tipos Predefinidos
* **Primitivos:**

    `Null`, `Undefined`, `Boolean`, `String`, `Number`, `NaN`, `Bigint`, `Symbol`, `Function`, `Object`.
* **Derivados de `Object`:**

    `Array`, `RegExp`, `Date`, `Map`, `Set`, `Promise`, etc.

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

Representa nodos o elementos individuales en el DOM. Esta es la categoría más amplia y abarca:

*   **Todos los Elementos HTML:** Desde `HTMLHtmlElement` hasta `HTMLDivElement`, `HTMLInputElement`, `HTMLTemplateElement`, etc. (cualquier etiqueta que puedas escribir).
  > **Subtipo Dinámico: `Node.<TAG_NAME>`**
  >
  > Después de que un elemento es identificado como `Node`, el framework crea un subtipo adicional usando su propiedad `tagName` para más precisión.
  >
  > **Ejemplos:**
  >
  > **Nota:** Para mayor claridad, en los siguientes ejemplos, los tipos se muestran ordenados desde el más específico al más general, pero el orden que `.type()` devuelve por defecto es el inverso.
  > *   Un elemento `<div>` se clasifica como `[ "Node.DIV", "Node", "HTMLDivElement", "Object" ]`.
  > *   Un elemento `<button>` se clasifica como `[ "Node.BUTTON", "Node", "HTMLButtonElement", "Object" ]`.
*   **Elementos SVG y MathML:** Como `SVGSVGElement` y `MathMLMathElement`.
*   **Elementos desconocidos u obsoletos:** Como `HTMLUnknownElement` y `HTMLMarqueeElement`.
*   **Nodos que no son elementos:** Nodos de texto (`Text`), comentarios (`Comment`), fragmentos de documento (`DocumentFragment`) y atributos (`Attr`).

##### Subtipo `Nodes`

Representa colecciones o listas de nodos, que típicamente son el resultado de consultas al DOM.

*   `NodeList` (devuelto por `document.querySelectorAll()`).
*   `HTMLCollection` (devuelto por `document.getElementsByTagName()` o `element.children`).
*   `HTMLAllCollection` (una colección obsoleta).

##### Subtipo `Document`

Identifica específicamente el objeto `document` principal de la página cuando el tipo del objeto es `HTMLDocument` (en algunos navegadores).

##### Subtipo `Browser`

Identifica objetos globales del entorno del navegador que no son parte del contenido del DOM.

*   `Window` (el objeto global `window`).
*   `Navigator` (el objeto `navigator` con información del navegador).
*   `Screen` (el objeto `screen` con información de la pantalla).
*   `Location` (el objeto `location` con información de la URL).
*   `History` (el objeto `history` para la navegación).

---

### `_e.instance(name)`

Crea o recupera una instancia aislada de Estructura. Esto es ideal para evitar colisiones en aplicaciones grandes o al crear librerías.

```javascript
const miApi = _e.instance('miApi');
const otraApi = _e.instance('otraApi');

// Las asignaciones en miApi no afectan a otraApi
miApi.fn({ String: { log: () => console.log('Log de miApi') } });
otraApi.fn({ String: { log: () => console.log('Log de otraApi') } });

miApi('test').log();  //> "Log de miApi"
otraApi('test').log(); //> "Log de otraApi"
```

---

### `_e.type(input)`

Una herramienta de utilidad que te permite saber los tipos de cualquier variable en orden de especificidad (desde el más general en el índice 0, hasta el más específico en el último índice). Devuelve un array que también funciona como mapa de todos los tipos detectados (las propiedades devueltas con el nombre del tipo y valor `true` sirven para verificaciones rápidas).

```javascript
const types = _e.type({ id: 1 }); 
console.log(types); //> [ 'Object', Object: true ]

if(types['Object']){
  console.log('Verificación rápida, es un objeto.');
}
```

## Conceptos Avanzados: `Manejadores`

Estas funciones se comportan de manera especial, ofrecen más flexibilidad y pueden:
* **Auto-ejecutarse:** Si la secuencia (combinación) de tipos coincide con la función, se ejecutará automáticamente. Los argumentos del despachador se pasan directamente a esta función.

* **Contener más `asignaciones`:** Al ser una función, puede tener propiedades adjuntas que actúen como `sub-manejadores` para un despacho más profundo.

#### Auto-ejecución de `Manejadores`

Puedes registrar una función que se ejecute si los tipos de los argumentos coinciden.

```javascript
// Creamos una función que se ejecutará para cualquier 'String'
// Nota: La función recibe los argumentos del despachador directamente

const logString = (str) => {
  console.log(`[LOG]: La cadena "${str}" fue procesada.`);
};

// Asignamos la función directamente bajo el tipo 'String'

_e.fn({
  String: logString
});

// Al llamar a '_e()' con una string, la función se ejecuta automáticamente

_e("Mi primer evento");   //> "[LOG]: La cadena "Mi primer evento" fue procesada."
_e("Otro evento más");    //> "[LOG]: La cadena "Otro evento más" fue procesada."
```

#### Secuencia de Ejecución por Especificidad

Cuando un [valor (`input`)](#_earg1-arg2-) pertenece a múltiples tipos (como un `Array`, que también es un `Object`), se ejecutarán en secuencia todos los `manejadores` que coincidan, desde el más específico hasta el más general.

Esto permite crear "middleware" o capas de lógica que se construyen unas sobre otras.

**Ejemplo de secuencia:**

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

#### Sobrescribir Métodos Dinámicamente

Un `manejador` incluso puede **devolver un objeto**. Si lo hace, los métodos de ese objeto sobrescribirán el conjunto de métodos que el despachador está construyendo.

Esto permite crear `APIs` dinámicas donde el resultado de una función puede cambiar los métodos disponibles.

**Ejemplo: Un validador que devuelve métodos diferentes según el resultado.**

```javascript
// Subtipo para identificar emails

_e.subtype({
  String: (input) => (input.includes('@') ? 'Email' : false)
});

// Manejador para el tipo 'Email'
// Recibe el email como primer argumento, no envuelto en un array

const validateEmail = (email) => {
  console.log(`Validando: ${email}`);

  if (email.endsWith('@gmail.com')) {
    // Si es un email de Gmail, devuelve métodos específicos

    return {
      send: () => console.log('Enviando con la API de Gmail...'),
      addToContacts: () => console.log('Añadiendo a contactos de Google.')
    };
  } else {
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

Esta característica avanzada te permite construir mecanismos y flujos de trabajo de una manera declarativa y potente.

## Notas Importantes sobre Versiones Anteriores

*   **Hasta la v1.15.0:**

    * Las actualizaciones se centraron principalmente en la documentación.
    * Se agregaron pruebas unitarias con Jest v30.0.0.
    * En los subtipos predefinidos `browser-dom` se eliminó el alias `Browser` para el subtipo `Document`.
    * Se actualizó la documentación `JSDoc` del código para reflejar las referencias a "`manejador/es`".
    * En general, la funcionalidad se ha mantenido igual y estable.
*   **En la v1.14.0:**

    Se cambiaron las referencias a "nodo/s híbrido/s" por "`manejador/es`" en la documentación.
*   **En la v1.9.0:**

    Se actualizó la documentación `JSDoc` del código para reflejar cambios de versiones anteriores.
*   **En la v1.8.0:**

    Se mejoró: el adjuntador de métodos (`attach_resolved_methods`), y el aislamiento de instancias en los registradores de funciones (`fn`) y subtipos (`subtype`) para entornos JavaScript como Node.js.
*   **Anteriores a la v1.6.0:**

    El módulo en formato `ESM` no estaba configurado correctamente, lo que podía causar problemas de importación.

## FAQ (Preguntas Frecuentes)

* **¿Puedo usar Estructura con TypeScript?**

  No está diseñado para usarse con TypeScript, Estructura es una alternativa a la verbosidad de TypeScript.

* **¿Tiene alguna manera para depurar integrada?**

  Sí, actualmente se emiten advertencias y errores en consola (o se lanza una excepción en entornos sin consola) en estos casos:
  * Si registras un subtipo con una función con error o si devuelve un tipo incorrecto.
  * Si tratas de usar nombres no permitidos para instancias o métodos.
  * Si la instancia que tratas de crear ya existe.
  * Si hubo un conflicto con nombres de métodos (colisiones).
  * Si un `manejador` presenta errores al ejecutarse.
  * Si tratas de registrar un subtipo o método de manera incorrecta.

* **¿Cómo depurar métodos no encontrados?**

  Véase "[Problemas comunes](#problemas-comunes)".

* **¿Es posible incluir llamadas a Estructura dentro de bucles muy repetitivos?**

  Véase "[Consideraciones](#consideraciones)".

## Problemas comunes

* **`Manejador` no se ejecuta**

  Compruebe que fue asignado a los tipos de datos o argumentos correctos verificando con [`.type()`](#_etypeinput) los tipos detectados. Y revise como funciona el orden de ejecución en "[Secuencia de Ejecución por Especificidad](#secuencia-de-ejecución-por-especificidad)".

* **Error de métodos no encontrados**

  Si al invocar un método aparece un error, asegúrese de que el método esté registrado para los tipos de datos o argumentos correctos, y que los datos sean exactamente de esos tipos, se puede usar [`.type()`](#_etypeinput) para verificar los tipos detectados de los datos.

* **Métodos se sobrescriben**

  Revise cómo funciona el orden de sobrescritura en caso de métodos con el mismo nombre en "[Colisión de Métodos: Lo General Sobrescribe a lo Específico](#colisión-de-métodos-lo-general-sobrescribe-a-lo-específico)" y la sección de sobrescritura dinámica "[Sobrescribir Métodos Dinámicamente](#3-sobrescribir-métodos-dinámicamente)".

## Consideraciones

* **Rendimiento**

  Dependiendo del entorno de ejecución, podría no ser una buena idea usarlo en bucles de alta frecuencia, ya que podrían experimentarse retrasos (`lags`) de aprox. 1 segundo por cada 100000 ejecuciones seguidas.

* **Inconsistencias**

  Como se menciona en la documentación del código de [`jQuery`](https://code.jquery.com/jquery-3.7.1.js) (en los comentarios de la función `.isFunction()`), en ciertas versiones antiguas de navegadores (pocos casos y raros) hay nodos del DOM que podrían retornar como tipo primitivo `'Function'` en lugar de `'Object'`, lo que causaría que en esas versiones de navegadores no sean disponibles los subtipos predefinidos `browser-dom`.

## Licencia

MIT © Desarrollado por [OKZGN](https://okzgn.com)

---

[Volver arriba](#estructura)