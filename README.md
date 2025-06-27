# Estructura.js

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Estructura.js** es un framework de JavaScript, ligero y sin dependencias, que implementa el **despacho múltiple (multiple dispatch)** basado en un sistema de tipado dinámico y extensible.

En lugar de la programación orientada a objetos tradicional (`objeto.metodo()`), Estructura te permite definir funciones que se ejecutan basándose en los tipos de los argumentos proporcionados en tiempo de ejecución. Esto permite crear APIs altamente polimórficas, flexibles y declarativas.

---

## Características Principales

*   **Despacho Múltiple Basado en Tipos:** Selecciona la lógica a ejecutar basándose en la combinación de tipos de todos los argumentos, no solo del primero.
*   **Sistema de Tipos Extensible:** Define tus propios tipos y jerarquías (`subtype`) para cualquier estructura de datos, yendo mucho más allá de los tipos primitivos de JavaScript.
*   **Instancias Aisladas (Sandboxing):** Crea múltiples instancias de Estructura (`_e.instance('miApi')`) que no interfieren entre sí, cada una con su propio registro de tipos y funciones.
*   **Ligero y sin Dependencias:** Menos de 8 KB (minificado), ideal para el navegador y Node.js sin añadir peso innecesario.
*   **Robusto y Predecible:** Diseño sin estado que garantiza que el resultado de una llamada dependa únicamente de las entradas actuales, evitando efectos secundarios inesperados (como mutación de objetos).

## ¿Por qué usar Estructura?

Estructura es ideal cuando necesitas manejar lógica compleja que depende de la naturaleza de tus datos. Es ideal para:

*   **APIs Polimórficas:** Crear funciones como `draw(shape)`, `draw(shape, context)`, `draw(arrayOfShapes)` que se resuelven automáticamente.
*   **Sistemas de Plugins:** Permitir que extensiones de terceros registren manejadores para nuevos tipos de datos sin modificar el núcleo de tu aplicación.
*   **Procesamiento de Datos:** Escribir tuberías de datos limpias que reaccionan a diferentes formatos de entrada (JSON, XML, CSV, etc.).
*   **Refactorizar Código Complejo:** Reemplazar largas cadenas de `if/else` o `switch` que comprueban `typeof` e `instanceof`.

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

Estructura está diseñado para ser universalmente compatible, funcionando sin problemas en una amplia gama de entornos de JavaScript, desde navegadores modernos y antiguos hasta Node.js.

### Formatos de Módulo

El paquete se distribuye en múltiples formatos para asegurar una integración sencilla con cualquier sistema de módulos:

*   **Módulos ES (ESM):** El formato principal y moderno. Ideal para usar con `import` en navegadores modernos (`<script type="module">`) y herramientas de compilación como Vite, Rollup o Webpack.
    ```javascript
    import _e from 'estructura-js';
    ```

*   **UMD (Universal Module Definition):** Proporciona máxima compatibilidad.
    *   **Navegadores (Global):** Si se incluye con un tag `<script>` normal, crea una variable global `_e`.
        ```html
        <script src="https://unpkg.com/estructura-js"></script>
        <script>
          _e('hola');
        </script>
        ```
    *   **CommonJS (Node.js):** Funciona de forma nativa en Node.js con `require()`.
        ```javascript
        const _e = require('estructura-js');
        ```
    *   **AMD (Asynchronous Module Definition):** Compatible con cargadores de módulos como RequireJS.

### Compatibilidad con Navegadores

El código de la distribución **UMD** está escrito en **sintaxis compatible con ES3/ES5**, lo que garantiza su funcionamiento en todos los navegadores modernos y en la mayoría de los antiguos, incluyendo **Internet Explorer 9+**, sin necesidad de transpilación.

También incluye subtipos predefinidos para elementos del DOM y el navegador, para importarlos en instancias use `_e.subtype('browser-dom')`.

### Compatibilidad con Node.js

Estructura funciona perfectamente en cualquier versión de Node.js que soporte la sintaxis ES5 en modo CommonJS.

## Guía de Inicio Rápido

El concepto central es simple: defines funciones para combinaciones de tipos y luego llamas al despachador principal `_e()` con tus datos.

```javascript
import _e from 'estructura-js';

// 1. Definir funciones para tipos específicos

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

// 2. Llamar al despachador

_e(['hola']).log();             //> "Un array: hola"
_e(12345).log();                //> "Un número: 12345"
_e('texto', 67890).combine();   //> "Combinado: texto y 67890"
```

## Documentación de la API

### `_e(arg1, arg2, ...)`

La función despachadora principal.

*   Analiza los tipos de los argumentos proporcionados.
*   Busca en el registro `fns` una función que coincida con la secuencia de tipos.
*   Devuelve un nuevo objeto con los métodos correspondientes adjuntos.

### `.fn(definitions)`

Registra las funciones que se ejecutarán para combinaciones de tipos.

*   **`definitions`**: Un objeto anidado donde las claves son nombres de tipos. El valor final debe ser una función o un objeto con más definiciones.

```javascript
_e.fn({
  Object: {
    keys: (args) => Object.keys(args[0])
  }
});

const keys = _e({ a: 1, b: 2 }).keys();
console.log(keys); //> ["a", "b"]
```

Los métodos que registras siempre reciben los argumentos originales del despachador como un **array en la primera posición**.

```javascript
_e.fn({
  String: {
    repeat: (args, times) => args[0].repeat(times)
  }
});

const repeated = _e("hola ").repeat(3);
console.log(repeated); //> "hola hola hola "
```

### `.subtype(definitions)`

Extiende el sistema de tipos de Estructura. Es la característica más potente.

*   **`definitions`**: Un objeto donde las claves son tipos existentes y los valores son funciones que definen un nuevo subtipo.

La función de subtipo recibe el `input` y debe devolver:
*   Un `string` con el nombre del nuevo subtipo.
*   `true` si el nombre de la definición debe usarse como el nombre del subtipo.
*   `false` o `undefined` si no hay coincidencia.

```javascript
// Crear un subtipo para objetos 'User'

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
```

### `.instance(name)`

Crea o recupera una instancia aislada de Estructura. Esto es ideal para evitar colisiones en aplicaciones grandes o al crear librerías.

```javascript
const miApi = _e.instance('miApi');
const otraApi = _e.instance('otraApi');

// Las definiciones en miApi no afectan a otraApi
miApi.fn({ String: { log: () => console.log('Log de miApi') } });
otraApi.fn({ String: { log: () => console.log('Log de otraApi') } });

miApi('test').log();  //> "Log de miApi"
otraApi('test').log(); //> "Log de otraApi"
```

### `.type(input)`

Una herramienta de utilidad que te permite saber los tipos de cualquier variable. Devuelve un array/mapa de todos los tipos detectados.

```javascript
const types = _e.type({ id: 1 }); 
console.log(types); //> [ 'Object', Object: true ]
```

## Licencia

MIT © 2025 OKZGN