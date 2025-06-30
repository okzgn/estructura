# Estructura

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Estructura** es un framework de JavaScript, ligero y sin dependencias, que implementa el **despacho múltiple (multiple dispatch)** basado en un sistema de tipado dinámico y extensible.

En lugar de la programación orientada a objetos tradicional, donde los métodos pertenecen a clases estáticas (`miInstancia.method()`), Estructura te permite definir funciones que se "adjuntan" a un objeto dinámico basado en los tipos de todos los argumentos. Esto resulta en una sintaxis de uso fluida (`_e(datos).method()`), pero con una lógica de despacho mucho más flexible y polimórfica.

---

## Índice General

### 1. Introducción
- [Características principales](#características-principales)  
- [¿Por qué usar Estructura?](#por-qué-usar-estructura)  

### 2. Instalación y Configuración
- [Instalación](#instalación)  
  - [npm](#instalación)  
  - [CDN (navegador)](#instalación)  
- [Compatibilidad](#compatibilidad)  
  - [Formatos de Módulo](#formatos-de-módulo)  
  - [Navegadores](#compatibilidad-con-navegadores)  
  - [Node.js](#compatibilidad-con-nodejs)  

### 3. Guía Rápida
- [Ejemplo básico](#guía-de-inicio-rápido)  

### 4. Documentación de la API
- [Función principal `_e()`](#_earg1-arg2-)  
- [`_e.fn()`](#_efndefinitions)  
- [`_e.subtype()`](#_esubtypedefinitions)  
- [`_e.instance()`](#_einstancename)  
- [`_e.type()`](#_etypeinput)  

### 5. Tipos y Subtipos
- [Tipos predefinidos](#tipos-predefinidos)  
- [Subtipo `browser-dom`](#subtipos-predefinidos-browser-dom)  
  - [Node](#subtipo-node)
  - [Nodes](#subtipo-nodes)  
  - [Document](#subtipo-document)  
  - [Browser](#subtipo-browser)  

### 6. Conceptos Avanzados
- [Manejadores](#conceptos-avanzados-manejadores)  
  - [Auto-ejecución](#1-auto-ejecución-de-manejadores)  
  - [Secuencia de ejecución](#2-secuencia-de-ejecución-por-especificidad)  
  - [Métodos dinámicos](#3-sobrescribir-métodos-dinámicamente)  

### 7. Notas Adicionales
- [Versiones anteriores](#notas-importantes-sobre-versiones-anteriores)  
- [Licencia](#licencia)  

## Características Principales

*   **Despacho Múltiple Basado en Tipos:** Selecciona la lógica a ejecutar y/o métodos a despachar, basándose en la combinación de los tipos de los argumentos (no solo del primero).
*   **Sistema de Tipos Extensible:** Define tus propios tipos y jerarquías (`subtype`) para cualquier estructura de datos, yendo mucho más allá de los tipos primitivos de JavaScript.
*   **Instancias Aisladas (Sandboxing):** Crea múltiples instancias de Estructura (`instance`) que no interfieren entre sí, cada una con su propio registro de tipos y funciones.
*   **Ligero y sin Dependencias:** Menos de 30 KB (menos de 5 KB minificado y comprimido [gzipped]), ideal para el navegador o Node.js sin añadir peso innecesario.
*   **Robusto y Predecible:** Las llamadas al despachador son deterministas. Para una misma configuración de tipos y funciones registradas, una llamada a `_e(arg1, arg2)` siempre seguirá una misma secuencia de ejecución y devolverá el mismo conjunto de métodos, evitando efectos secundarios inesperados.

## ¿Por qué usar Estructura?

Estructura es ideal cuando necesitas manejar lógica compleja que depende de la naturaleza de tus datos, como en:

*   **APIs Polimórficas:** Crear funciones como `render(shape)`, `render(shape, context)`, `render(arrayOfShapes)` que se resuelven automáticamente.
*   **Sistemas de Plugins:** Permitir que extensiones de terceros registren manejadores para nuevos tipos de datos sin modificar el núcleo de tu aplicación.
*   **Procesamiento de Datos:** Escribir tuberías de datos limpias que reaccionan a diferentes formatos de entrada (JSON, XML, CSV, etc.).
*   **Refactorización de Código Complejo:** Reemplazar largas cadenas de `if/else` o `switch` que comprueban `typeof` e `instanceof` con una solución más declarativa y mantenible.

## Instalación

Puedes instalar Estructura a través de npm:

```bash
npm install estructura-js
```

O usarlo directamente en el navegador a través de un CDN:

```html
<script src="https://unpkg.com/estructura-js"></script>
```

## Compatibilidad

Estructura está diseñado para ser casi universalmente compatible, funcionando sin problemas en una amplia gama de entornos de JavaScript, desde navegadores modernos y antiguos hasta Node.js, etc.

### Formatos de Módulo

El paquete se distribuye en múltiples formatos para asegurar una integración sencilla con cualquier sistema de módulos:

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
          // La variable global "_e" se ha cargado correctamente.
          const estructura = _e;

          // Ejemplo para mostrar los tipos de datos en la consola.
          let tipos = _e.type('hola');
          console.log(tipos); //> [ 'String', String: true ]
        </script>
        ```

    *   **AMD (Asynchronous Module Definition):** Compatible con cargadores de módulos como RequireJS.

### Compatibilidad con Navegadores

El código de la distribución **UMD** está escrito en **sintaxis compatible con ES3/ES5**, lo que garantiza su funcionamiento en todos los navegadores modernos y en la mayoría de los antiguos, incluyendo **Internet Explorer 9+**, sin necesidad de transpilación.

**Nota:** Los ejemplos utilizan sintaxis de ES6 por brevedad, pero pueden ser fácilmente convertidos a funciones `function() { ... }` para su uso en entornos ES5.

### Compatibilidad con `Node.js`

Estructura funciona perfectamente en cualquier versión de Node.js que soporte la sintaxis ES5.

## Guía de Inicio Rápido

El concepto central es simple: defines funciones para tipos o combinaciones de tipos y luego llamas al despachador principal `_e()` con tus datos.

```javascript
import _e from 'estructura-js';

// 1. Definir funciones para tipos específicos.
_e.fn({
  Array: {
    log: (args) => console.log(`Un array: ${args[0]}`)
  },

  Number: {
    log: (args) => console.log(`Un número: ${args[0]}`)
  },

  // Define un método para la combinación de tipos _e(String, Number)
  String: {
    Number: {
      combine: (args) => console.log(`Combinado: ${args[0]} y ${args[1]}`)
    }
  }
});

// 2. Llamar al despachador.
_e(['hola']).log();             //> "Un array: hola"
_e(12345).log();                //> "Un número: 12345"
_e('texto', 67890).combine();   //> "Combinado: texto y 67890"
```

## Documentación de la `API`

### `_e(arg1, arg2, ...)`

La función despachadora principal. Cada argumento representa un valor (`input`).

1. Analiza los tipos de los argumentos proporcionados.
2. Busca una función que coincida con toda la secuencia (combinación) de tipos.
3. Ejecuta funciones manejadoras y/o devuelve un nuevo objeto con los métodos correspondientes adjuntos.

---

### `_e.fn(definitions)`

Registra funciones directas (`manejadores`) y/o métodos para los tipos y sus combinaciones. Es crucial distinguir dos patrones: los `Métodos`, que son funciones dentro de un objeto de definición y se invocan explícitamente (`_e(data).miMetodo()`), y los `Manejadores`, que son funciones asignadas directamente a un tipo y se ejecutan automáticamente cuando ese tipo coincide (`_e(data)` tal cual);

**`definitions`**: Puede ser **un objeto o una función**. En general, se llaman **definiciones**. 

**1. Objeto:** Donde cada *clave* debe ser un nombre de tipo y cada *valor* una función (`manejador`) o un objeto anidado con más funciones. **Cada nivel de anidación está relacionado directamente con los argumentos que se pasen a la función despachadora y sus tipos.**

```javascript
_e.fn({
  Object: {
    keys: (args) => Object.keys(args[0])
  }
});

const keys = _e({ a: 1, b: 2 }).keys();
console.log(keys); //> ["a", "b"]
```

Los métodos que registras reciben los argumentos originales del despachador como un **array en la primera posición**. (Véase más abajo "Una Distinción Crucial: Cómo se Pasan los Argumentos").

```javascript
_e.fn({
  String: {
    repeat: (args, times) => args[0].repeat(times)
  }
});

const repeated = _e("hola ").repeat(3);
console.log(repeated); //> "hola hola hola "
```

También puedes definir métodos "globales" para una instancia y estarán disponibles sin importar el tipo de los argumentos (`Any`). Para ello, regístralos en el primer nivel del objeto de definiciones:

```javascript
_e.fn({
  // Este método estará disponible en todas las llamadas a '_e()'.
  timestamp: () => `Procesado a las: ${Date.now()}`
});

console.log(_e(123).timestamp());       //> "Procesado a las: 1700000000000"
console.log(_e("abc").timestamp());     //> "Procesado a las: 1700000000001"
```

> **IMPORTANTE. Decisión de Diseño Clave**
>
> **Precedencia y Colisiones de Métodos Invertida**
>
> Cuando un valor (`input`) corresponde a múltiples tipos, todos sus métodos se fusionan en el objeto resultante. Si dos o más tipos definen un método con el mismo nombre, se producirá una colisión. En este caso, **el método del tipo más general (menos específico) prevalecerá, sobrescribiendo al del tipo más específico**.
>
> El orden de sobrescritura es el siguiente (el de abajo sobrescribe al de arriba):
> 1. Métodos de **subtipos o alias**: Definidos con `.subtype()`. Ejemplo:
> ```javascript
> _e.fn({ AnotherCollection: { myMethod: ... }})
> ```
>
> 2. Métodos de **tipos base**: Tipos primitivos del valor (`Object`, `Array`, etc.). Ejemplo:
> ```javascript
> _e.fn({ Array: { myMethod: ... }})
> ```
>
> 3. Métodos **globales**: Definidos en la raíz del objeto con `.fn()`. Ejemplo:
> ```javascript
> _e.fn({ myMethod: ... })
> ```
>
> En los ejemplos, esto significa que un método para `Array` sobrescribirá a uno con el mismo nombre en `AnotherCollection`.
> Se puede saber el orden de especificidad con `.type()`.
>
>**Nota:** Esta decisión de diseño garantiza que los métodos globales (`Any`) puedan actuar como un `'fallback'` predecible y consistente, asegurando que una función siempre esté disponible si no se encuentra una más específica. O para prevenir que métodos menos importantes sobrescriban a otros de mayor importancia.

**2. Función:**  Puedes asignarla para que se ejecute **para cualquier llamada a una instancia**, se llama **manejador raíz**, por ejemplo:
> ```javascript
> _e.fn((arg1, arg2, /*...,*/ argN) => { ... })
> ```


#### Fusión de Definiciones (Registro Aditivo)

Si llamas a `.fn()` varias veces para registrar **definiciones con objetos o funciones** para los mismos tipos, estas se fusionan en lugar de sobrescribirse. Este comportamiento aditivo es ideal para sistemas de plugins o para organizar el código en módulos, ya que permite añadir nueva funcionalidad de forma segura.

**1. Para Funciones (Manejadores)**

Tiene una regla importante: **una vez que un tipo se define como un manejador, siempre se comportará como tal**.

Si posteriormente registras un objeto de métodos para ese mismo tipo, los nuevos métodos se añadirán a la función manejador, pero esta no perderá su capacidad de auto-ejecutarse.

**Ejemplo:**
```javascript
// 1. Definimos un manejador para 'Number'.
_e.fn({
  Number: (num) => console.log(`Manejador ejecutado para: ${num}`)
});

// 2. Fusionamos un objeto con un nuevo método.
_e.fn({
  Number: {
    isEven: (args) => args[0] % 2 === 0
  }
});

// 3. El manejador se auto-ejecuta y tiene el nuevo método disponible.
const miNumero = _e(10); //> Manejador ejecutado para: 10

console.log(miNumero.isEven()); //> true
```

**2. Para Objetos**

Los objetos para los mismos tipos se fusionarán en lugar de sobrescribirse.

**Ejemplo:**

```javascript
// 1. Registro inicial en el núcleo de la aplicación.
_e.fn({
  String: {
    log: (args) => console.log(`[LOG]: ${args[0]}`)
  }
});

// 2. Más tarde, un "plugin" añade nueva funcionalidad al tipo String.
_e.fn({
  String: {
    wordCount: (args) => args[0].split(' ').length
  }
});

// 3. Ambos métodos están ahora disponibles gracias a la fusión.
const miFrase = _e("Estructura es muy flexible");

miFrase.log();                      //> [LOG]: Estructura es muy flexible
console.log(miFrase.wordCount());   //> 4
```

### Una Distinción Crucial: Cómo se Pasan los Argumentos de `_e()`

Es vital entender una diferencia clave en cómo tus funciones reciben los argumentos, dependiendo de cómo las registres.

1.  **Métodos Estándar (dentro de un objeto):**
Reciben todos los argumentos originales de la llamada a `_e()` agrupados en un **único array como primer parámetro**.

```javascript
_e.fn({
  String: {
    // 'args' es ['Hola']
    myMethod: (args) => console.log(`El primer argumento es: ${args[0]}`)
  }
});
_e('Hola').myMethod(); //> "El primer argumento es: Hola"
```

1.  **Manejadores (funciones directas):**
Reciben los argumentos originales de `_e()` de forma **desplegada y directa**.

```javascript
_e.fn({
  // 'arg1' es 'Hola'
  String: (arg1) => { console.log(`Recibí directamente: ${arg1}`); }
});
_e('Hola'); //> "Recibí directamente: Hola"
```

---

### `_e.subtype(definitions)`

Extiende el sistema de tipos de Estructura. Es la característica más potente.

**`definitions`**: Un objeto donde las *claves* son nombres de tipos predefinidos y los *valores* pueden ser:

*   Una cadena de texto para crear un alias simple.
*   Un `array` de cadenas de texto para asignar múltiples alias nuevos a la vez.
*   Una función que recibe el valor (`input`) y debe devolver:
    * Un `string` con el nombre del subtipo nuevo.
    * `true` si el nombre de la definición debe usarse como el nombre del subtipo.
    * `false`, `undefined`, `null`, etc. si no hay coincidencia.

```javascript
// Crear subtipos.
_e.subtype({
  // 1. Con una función.
  Object: (input) => (input.userId ? 'User' : false),

  // 2. Con un string (un alias simple).
  RegExp: 'RegexPattern',

  // 3. Con un array (múltiples alias).
  // Un Array ahora también es de tipo 'Collection' y 'OrderedList'.
  Array: ['Collection', 'OrderedList'] 
});

// Registrar funciones para los nuevos tipos.
_e.fn({
  User: {
    hello: (args) => console.log(`Hello, ${args[0].name}!`)
  },
  RegexPattern: {
    test: (args, str) => args[0].test(str)
  },
  // Se pueden registrar métodos para CUALQUIER alias.
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

// Ahora los métodos de ambos alias están disponibles.
const miLista = _e([1, 2, 3]);
console.log(miLista.count());       //> 3
console.log(miLista.isCollection()); //> true
```
Además, **`definitions`** puede ser una cadena de texto como `'browser-dom'`, que sirve para cargar en la instancia subtipos predefinidos para el DOM de navegadores.

### Tipos Predefinidos
* Primitivos: `Null`, `Undefined`, `Boolean`, `String`, `Number`, `NaN`, `Bigint`, `Symbol`, `Function`, `Object`.
* Derivados de **`Object`**: `Array`, `RegExp`, `Date`, `Map`, `Set`, `Promise`, etc.

### Subtipos Predefinidos: 'browser-dom'

Este conjunto de subtipos simplifica drásticamente la manipulación del DOM al agrupar cientos de tipos de objetos específicos del navegador en unas pocas categorías potentes y genéricas.

**Cómo Importar o Activar `browser-dom`**

```javascript
// Activar en la instancia por defecto.
_e.subtype('browser-dom');

// O en una instancia nombrada.
const domAPI = _e.instance('domAPI');
domAPI.subtype('browser-dom');

/*
 * Ejemplos de uso en un navegador.
 * Nota: El resultado de .type() se muestra aquí ordenado desde el
 * tipo más específico al más general para mayor claridad.
 */
console.log(domAPI.type(document.head));   //> [ "Node.HEAD", "Node", "HTMLHeadElement", "Object" ]
console.log(domAPI.type(document));        //> [ "Document", "Browser", "HTMLDocument", "Object" ]
console.log(domAPI.type(window));          //> [ "Browser", "Window", "Object" ]
```

**Resumen de Subtipos Identificados:**

#### Subtipo: Node

Representa cualquier elemento o nodo individual en el DOM. Esta es la categoría más amplia y abarca:

*   **Todos los Elementos HTML:** Desde `HTMLHtmlElement` hasta `HTMLDivElement`, `HTMLInputElement`, `HTMLTemplateElement`, etc. (para cualquier etiqueta que puedas escribir).
*   **Elementos SVG y MathML:** Como `SVGSVGElement` y `MathMLMathElement`.
*   **Nodos que no son elementos:** Incluye nodos de texto (`Text`), comentarios (`Comment`), fragmentos de documento (`DocumentFragment`) y atributos (`Attr`).
*   **Elementos desconocidos u obsoletos:** Como `HTMLUnknownElement` y `HTMLMarqueeElement`.

> **Subtipo Dinámico: `Node.<TAG_NAME>`**
>
> La característica más potente de este conjunto es la creación de subtipos dinámicos. Después de que un elemento es identificado como `Node`, el framework crea un subtipo adicional usando su propiedad `tagName`. Esto permite un despacho increíblemente granular.
>
> **Ejemplos:**
> *   Un elemento `<div>` se clasifica como `[ "Node.DIV", "Node", "HTMLDivElement", "Object" ]`.
> *   Un elemento `<button>` se clasifica como `[ "Node.BUTTON", "Node", "HTMLButtonElement", "Object" ]`.

#### Subtipo: Nodes

Representa colecciones o listas de nodos, que típicamente son el resultado de consultas al DOM.

*   `NodeList` (devuelto por `document.querySelectorAll()`).
*   `HTMLCollection` (devuelto por `document.getElementsByTagName()` o `element.children`).
*   `HTMLAllCollection` (una colección legacy).

#### Subtipo: Document

Identifica específicamente el objeto `document` principal de la página.

*   Se activa cuando el tipo del objeto es `HTMLDocument`.

#### Subtipo: Browser

Identifica objetos globales de alto nivel del entorno del navegador que no son parte del contenido del DOM.

*   `Window` (el objeto global `window`).
*   `Navigator` (el objeto `navigator` con información del navegador).
*   `Screen` (el objeto `screen` con información de la pantalla).
*   `Location` (el objeto `location` con información de la URL).
*   `History` (el objeto `history` para la navegación).
*   También se aplica al objeto `Document` como un tipo más general.

---

### `_e.instance(name)`

Crea o recupera una instancia aislada de Estructura. Esto es ideal para evitar colisiones en aplicaciones grandes o al crear librerías.

```javascript
const miApi = _e.instance('miApi');
const otraApi = _e.instance('otraApi');

// Las definiciones en miApi no afectan a otraApi.
miApi.fn({ String: { log: () => console.log('Log de miApi') } });
otraApi.fn({ String: { log: () => console.log('Log de otraApi') } });

miApi('test').log();  //> "Log de miApi"
otraApi('test').log(); //> "Log de otraApi"
```

---

### `_e.type(input)`

Una herramienta de utilidad que te permite saber los tipos de cualquier variable. Devuelve un array/mapa de todos los tipos detectados. Las propiedades que devuelve cuyo nombre es el tipo y valor `true` sirve para verificaciones rápidas.

```javascript
const types = _e.type({ id: 1 }); 
console.log(types); //> [ 'Object', Object: true ]

if(types['Object']){
  console.log('Verificación rápida, es un objeto.');
}
```

## Conceptos Avanzados: `Manejadores`

Estas funciones se comportan de manera especial y ofrecen una gran flexibilidad.

Un manejador puede hacer dos cosas a la vez:
1.  **Auto-ejecutarse:** Si la secuencia (combinación) completa de tipos coincide con la función, esa función se ejecutará automáticamente. Los argumentos del despachador se pasan directamente a esta función.

2.  **Contener más definiciones:** Al ser una función, puede tener propiedades adjuntas que actúen como sub-manejadores para un despacho más profundo.

### 1. Auto-ejecución de manejadores

Puedes registrar una función que se ejecute en cuanto los tipos de los argumentos coincidan.

```javascript
// Definimos una función que se ejecutará para cualquier 'String'.
// Nota: La función recibe los argumentos del despachador directamente.

const logString = (str) => {
  console.log(`[LOG]: La cadena "${str}" fue procesada.`);
};

// Registramos la función directamente bajo el tipo 'String'.

_e.fn({
  String: logString
});

// Al llamar a _e con una string, la función se ejecuta automáticamente.

_e("Mi primer evento");   //> "[LOG]: La cadena "Mi primer evento" fue procesada."
_e("Otro evento más");    //> "[LOG]: La cadena "Otro evento más" fue procesada."
```

### 2. Secuencia de Ejecución por Especificidad

Cuando un valor (`input`) pertenece a múltiples tipos (como un `Array`, que también es un `Object`), se ejecutarán en secuencia todos los manejadores que coincidan, desde el más específico hasta el más general.

Esto permite crear "middleware" o capas de lógica que se construyen unas sobre otras.

**Ejemplo de secuencia:**

```javascript
// Manejador para Arrays (muy específico).
_e.fn({
  Array: (arr) => console.log(`[LOG]: Manejador para Array ejecutado para: ${arr}`)
});

// Manejador para Objects (menos específico, ya que Array es un Object).
_e.fn({
  Object: () => console.log('[LOG]: Manejador para Object ejecutado.')
});

// Manejador raíz (el más general).
_e.fn(() => {
  console.log('[LOG]: Manejador raíz ejecutado.');
});

// Al llamar con un array, se disparan los tres manejadores en orden de especificidad.
_e(['a', 'b']);
//> "[LOG]: Manejador para Array ejecutado para: a,b"
//> "[LOG]: Manejador para Object ejecutado."
//> "[LOG]: Manejador raíz ejecutado."
```

### 3. Sobrescribir Métodos Dinámicamente

Un manejador puede, además, **devolver un objeto**. Si lo hace, los métodos de ese objeto sobrescribirán el conjunto de métodos que el despachador está construyendo.

Esto permite crear APIs dinámicas donde el resultado de una función puede cambiar los métodos disponibles.

**Ejemplo: Un validador que devuelve métodos diferentes según el resultado.**

```javascript
// Subtipo para identificar emails.

_e.subtype({
  String: (input) => (input.includes('@') ? 'Email' : false)
});

// Manejador para el tipo 'Email'.
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

// Registramos el manejador

_e.fn({
  Email: validateEmail
});

// CASO 1: Email de Gmail.

const gmailUser = _e('test@gmail.com');
//> "Validando: test@gmail.com"

gmailUser.send();            //> "Enviando con la API de Gmail..."
gmailUser.addToContacts();   //> "Añadiendo a contactos de Google."

// CASO 2: Otro email.

const otherUser = _e('user@outlook.com');
//> "Validando: user@outlook.com"

otherUser.send();            //> "Enviando con SMTP genérico..."
// otherUser.addToContacts(); // Esto causa error, porque el método no fue devuelto.
```

Esta característica avanzada te permite construir mecanismos y flujos de trabajo de una manera increíblemente declarativa y potente.

## Notas Importantes sobre Versiones Anteriores

*   **Hasta la v1.13.0**: Las actualizaciones se centraron principalmente en la documentación. La funcionalidad se ha mantenido estable.
*   **En la v1.9.0**: Se actualizó la documentación `JSDoc` del código para reflejar cambios de versiones anteriores.
*   **En la v1.8.0**: Se mejoró el adjuntador de métodos (`attach_resolved_methods`) y el aislamiento de instancias en los registradores de funciones (`fn`) y subtipos (`subtype`).
*   **Anteriores a la v1.6.0**: El módulo en formato `ESM` no estaba configurado correctamente, lo que podía causar problemas de importación.

## Licencia

MIT © 2025 OKZGN