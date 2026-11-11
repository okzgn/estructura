# Estructura

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [Español](README.es.md)

Estructura is a lightweight, dependency-free JavaScript framework that lets you assign functions to be automatically attached to custom or extended data types, based on one or multiple arguments.

**[Quick Start Guide](#quick-start-guide)**

### Use Case Example

Imagine having to handle different data types with specific logic for each combination:

```javascript
// ❌ The problem: repetitive code that is hard to maintain

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
  // ... dozens more combinations
}

// ✅ The solution with Estructura: clean, extensible and maintainable

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
    // Here you define: JSON, API, CSV, File, XML, and Database.
});

// Simple and elegant usage
_e(myData, format, destination).process();
```

---

## 📚 Table of Contents

<details>
<summary>Open Table of Contents</summary>

### 1. Introduction
- [Key Features](#key-features)
- [When to Use Estructura](#when-to-use-estructura)

### 2. Installation and Setup
- [Installation](#installation)
  - [npm](#npm)
  - [CDN (Browser)](#cdn-browser)
- [Compatibility](#compatibility)
  - [Module Formats](#module-formats)
  - [Browser Compatibility](#browser-compatibility)
  - [Environment Compatibility](#environment-compatibility)
  - [TypeScript](#typescript)

### 3. Quick Start Guide
- [Basic Example](#quick-start-guide)

### 4. Preliminary Concepts
- [Function Dispatch](#function-dispatch)
  - [What is Function Dispatch?](#what-is-function-dispatch)
- [Single vs. Multiple Dispatch](#single-vs-multiple-dispatch)
  - [Single Dispatch](#single-dispatch)
  - [Multiple Dispatch](#multiple-dispatch)
- [Estructura Terminology](#estructura-terminology)
  - [Dispatcher](#dispatcher)
  - [Methods](#methods)
  - [Handlers](#handlers)
  - [Types, Subtypes and Aliases](#types-subtypes-and-aliases)
- [Why Multiple Dispatch is Useful](#why-multiple-dispatch-is-useful)
  - [Common Problem: Polymorphic Functions](#common-problem-polymorphic-functions)
  - [Key Advantages](#key-advantages)

### 5. API Documentation
- [Main Function or Dispatcher](#_earg1-arg2-)
- [Register Functions for Types](#_efnassignments)
- [Register New Types](#_esubtypedefinitions)
- [Create Instances](#_einstancename-options)
- [Configure Options](#_econfigoptions)
- [Identify Types](#_etypeinput)

### 6. Types and Subtypes
- [Predefined Types](#predefined-types)
- [Browser-DOM Predefined Subtypes](#predefined-subtypes-browser-dom)
  - [Node](#node-subtype)
  - [Nodes](#nodes-subtype)
  - [Document](#document-subtype)
  - [Browser](#browser-subtype)

### 7. Advanced Concepts
- [Handlers](#advanced-concepts-handlers)
  - [Handler Auto-Execution](#handler-auto-execution)
  - [Execution Sequence by Specificity](#execution-sequence-by-specificity)
  - [Handlers as Methods](#handlers-as-methods)
  - [Overriding Methods Dynamically](#overriding-methods-dynamically)

### 8. Additional Information
- [Frequently Asked Questions](#faq-frequently-asked-questions)
- [Common Problems](#common-problems)
- [Considerations](#considerations)
- [Notes on Previous and Current Versions](#notes-on-previous-and-current-versions)
- [License](#license)

</details>

## Key Features

*   **Extensible Type System:** Define your own types ([`.subtype()`](#_esubtypedefinitions)) for any data structure, going far beyond JavaScript's main types.
*   **Isolated Instances (`Sandboxing`):** Create multiple Estructura instances ([`.instance()`](#_einstancename-options)) that do not interfere with each other, each with its own registry of types and functions.
*   **Robust and Predictable:** Calls to the `dispatcher` are deterministic. For the same configuration of types and of functions registered ([`.fn()`](#_efnassignments)) for those types, a call to [`_e(arg1, arg2, ...)`](#_earg1-arg2-) will always follow the same execution sequence and return the same set of `methods`.
*   **Lightweight and Dependency-Free:** About 35 KB uncompressed and under 10 KB gzipped (`ESM` and `UMD`), ideal for the browser or Node.js.

## When to Use Estructura

Estructura is ideal when you need to handle complex logic that depends on the nature of your data, such as in:

*   **Polymorphic `APIs`:** Create functions that resolve automatically, such as `endpoint(url_string, different_data_inputs)`, `render(html_element, content_variations)`.
*   **Plugin Systems:** Let third-party extensions register functions without modifying the core of your application.
*   **Data Processing:** Write clean data flows that adapt to different input formats (JSON, CSV, XML, etc.).
*   **Refactoring Complex Code:** Replace long chains of `if/else` or `switch` checks with a more declarative and maintainable solution.

## Installation

### npm
You can install Estructura through npm:

```bash
npm install estructura-js
```
### CDN (Browser)
You can use it directly in the browser through a CDN:

```html
<script src="https://unpkg.com/estructura-js"></script>
```

## Compatibility

Estructura is designed to be almost universally compatible, working smoothly across a wide range of JavaScript environments, from modern and legacy browsers to Node.js, etc.

**Quick summary:**  
Estructura supports **ESM**, **UMD** and **AMD** in browsers, Node.js and RequireJS.

| Format  | Usage in Node.js       | Modern browser          | Legacy browser     |
|---------|------------------------|-------------------------|--------------------|
| ESM     | `import _e from ...`    | `<script type="module">`| ❌ Needs transpiling |
| UMD     | `require(...)`          | `<script src=...>`      | ✅ Supported         |
| AMD     | `define([...])`         | With RequireJS          | ✅ Supported         |

**Quick decision:**
- If your environment supports modern modules → use **ESM**.  
- If not → use **UMD** or **AMD** as appropriate.

### Module Formats

The package is distributed in several formats to ensure easy integration, in general, with the following module systems:

*   **ES Modules (`ESM`):** The main, modern format. Ideal for use with `import` in Node.js (or similar environments) with build tools such as Vite, Rollup or Webpack, or in up-to-date browsers.
    *   **Node.js:**
    ```javascript
    import _e from 'estructura-js';
    ```
    *   **Current browsers:**
    ```html
    <script type="module">
      import _e from 'https://unpkg.com/estructura-js/dist/estructura.esm.mjs';
    </script>
    ```

*   **`UMD` (Universal Module Definition):** Provides maximum compatibility.
    *   **CommonJS (Node.js):** Works natively with `require()`.
        ```javascript
        const _e = require('estructura-js');
        ```

    *   **Browsers (`Global`):** If included with a regular `<script>` tag, it creates a `global` variable `_e`.
        ```html
        <script src="https://unpkg.com/estructura-js"></script>
        <script>
          // The global variable '_e' has been loaded correctly
          const estructura = _e;

          // Example that shows the data types in the browser console
          let types = _e.type('hello');
          console.log(types); //> [ 'String', String: true ]
        </script>
        ```
    *   **AMD (Asynchronous Module Definition):** Compatible with module loaders such as RequireJS. See [Examples](https://requirejs.org/docs/start.html#examples).

### Browser Compatibility

The code of the **`UMD`** distribution does not need transpiling: it is written in **ES3/ES5-compatible syntax**, which guarantees that it works in all modern browsers and in most legacy ones, including **Internet Explorer 9+**. The **`ESM`** distribution needs transpiling to work in certain browsers.

> **Note:** **The examples use ES6 syntax for brevity**, but they can easily be converted and adapted to ES5 environments (for example, to classic `function(){}` functions) to run them in legacy browsers.

### Environment Compatibility

Estructura works perfectly in any environment that supports ES5 syntax (Node.js, Deno, Bun, etc.). 

### TypeScript

Since v1.21.0 the package includes its type declarations (`.d.ts`), for both `import` and `require`, with nothing else to install:

```typescript
import _e, { type Instance, type TypeResult } from 'estructura-js';

const api: Instance = _e.instance('api', { collision: 'specific' });
const types: TypeResult = api.type([1, 2]); //> ['Object', 'Array'], with types['Array'] === true
```

Since `methods` are only known at runtime, the object returned by the `dispatcher` accepts any `method`. For more precision, describe its shape with the generic parameter:

```typescript
const list = _e<{ join(sep: string): string }>(['a', 'b']);
list.join('-'); // Typed: returns string
```

If you load the `UMD` distribution with a `<script>` (global variable `_e`), declare the global in your project:

```typescript
declare const _e: import('estructura-js').Instance;
```

> **Note:** with `moduleResolution` set to `node16`, `nodenext` or `bundler`, the types are resolved automatically. With classic resolution (`node`/`node10`), `import _e from 'estructura-js'` requires `esModuleInterop` (or `allowSyntheticDefaultImports`); the alternative is `import _e = require('estructura-js')`.

## Quick Start Guide

The core concept is simple: assign functions for types or combinations of types, and call the `dispatcher` `_e()` with the corresponding data.

```javascript
import _e from 'estructura-js';

// Assign methods for specific types
_e.fn({
  Array: {
    log: (args) => console.log(`An array: ${args[0]}`)
  },

  Number: {
    log: (args) => console.log(`A number: ${args[0]}`)
  },

  // Assigns a method for the type sequence (combination) '_e(String, Number)'
  String: {
    Number: {
      combine: (args) => console.log(`Combined: ${args[0]} and ${args[1]}`)
    }
  }
});

// Call the dispatcher
_e(['hello']).log();            //> "An array: hello"
_e(12345).log();                //> "A number: 12345"
_e('text', 67890).combine();    //> "Combined: text and 67890"
```

## Preliminary Concepts

Before diving into Estructura, it is important to understand some fundamental concepts that will help you get the most out of this framework.

### Function Dispatch

#### What is Function Dispatch?

**Function dispatch** is the mechanism that determines which specific function will run when there are multiple options available. It works like a "smart router" that selects the right function based on certain criteria.

**Simple Example:**
```javascript
// Without dispatch: repetitive code
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
  // ... more conditions
}

// With dispatch: more elegant
_e.fn({
  Array: { process: (args) => args[0].map(item => item.toUpperCase()) },
  String: { process: (args) => args[0].toUpperCase() },
  Number: { process: (args) => args[0].toString().toUpperCase() }
});

// Clean usage
_e(['hello', 'world']).process();  //> ["HELLO", "WORLD"]
_e('hello').process();             //> "HELLO"
_e(123).process();                 //> "123"
```

### Single vs. Multiple Dispatch

#### Single Dispatch
This is the one used by **traditional Object-Oriented Programming**. The function to run is determined solely by the **first argument** (the one the method is called on).

```javascript
// Traditional programming: only the type of the first argument matters
class MyArray extends Array {
  combine(anotherArray){  // It only knows that 'this' is a MyArray
    return this.concat(anotherArray);
  }
}

const arr1 = new MyArray(1, 2);
const arr2 = [3, 4];
arr1.combine(arr2); // It only considers the type of 'arr1'
```

#### Multiple Dispatch
Estructura uses **multiple dispatch**, where the function is selected by considering the **types of ALL the arguments**, not just the first one.

```javascript
// With Estructura: it considers ALL the arguments
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

_e([1, 2], [3, 4]).combine();    //> [1, 2, 3, 4]    (Array + Array)
_e([1, 2], '-').combine();       //> "1-2"           (Array + String)
_e('hello', [1, 2]).combine();   //> ["hello", 1, 2] (String + Array)
```

### Estructura Terminology

#### `Dispatcher`
The **main function `_e()`**, which analyzes the arguments and decides what to do with them.

```javascript
// '_e()' is the dispatcher
const result = _e('data', 123); // Analyzes: String + Number
```

#### `Methods`
**Functions that are attached** to the object returned by the dispatcher. They are called **after** the type evaluation.

```javascript
_e.fn({
  String: {
    size: (args) => args[0].length // ← This is a METHOD
  }
});

_e('hello').size(); // Called AFTER the dispatch
```

#### `Handlers`
**Functions that run automatically** when the types match, **before** the object with the `methods` is returned.

```javascript
_e.fn({
  String: (str) => { // ← This is a HANDLER
    console.log('Processing:', str);
    // It runs automatically
  }
});

_e('hello'); //> "Processing: hello" (printed immediately)
```

#### Types, Subtypes and Aliases

**In this documentation, the following terms are all types in a general sense**, although there are small differences between them:

* **Types:** the main categories of data, built in by default; all subtypes derive from them.

* **Subtypes:** custom categories of data that can be created from the main types, with the characteristics you specify.

* **Aliases:** additional names assigned to types and subtypes to categorize, group or relate them.

```javascript
_e.subtype({
   // Create a subtype, from the Object type
  Object: (input) => input.name && input.email ? 'User' : false,

  // Create an alias, from the Array type
  Array: 'Collection'
});


_e.fn({
   // Register a method for the subtype
  User: {
    hello: (args) => `Hello ${args[0].name}!`
  },

   // Register a method for the alias
  Collection: {
    combine: (args, char) => args[0].join(char)
  }
});

// Usage
const person = { name: 'Ana', email: 'ana@email.com' };
_e(person).hello(); //> "Hello Ana!"

const list = ['1', '2', '3'];
_e(list).combine(','); //> "1,2,3"
```

### Why Multiple Dispatch is Useful

#### Common Problem: Polymorphic Functions
For example, a `save()` function that must behave differently depending on the data types:

```javascript
// Traditional approach: spaghetti code
function save(data, to){
  if(typeof data === 'string' && typeof to === 'string'){
    // Save text to a file
  }
  else if(Array.isArray(data) && to instanceof Database){
    // Save an array to a database
  }
  else if(typeof data === 'object' && to.type === 'API'){
    // Send an object to an API
  }
  // ... other combinations
}
```

```javascript
// With Estructura: declarative and extensible
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

// Clean usage
_e('content', 'file.txt').save();
_e([1,2,3], myDB).save();
_e({data: 'json'}, myAPI).save();
```

#### Key Advantages

*   **Extensibility:** Lets you add new combinations while keeping the responsibilities of the code separate.
*   **Readability:** The logic is organized by types, not mixed into `if/else` chains.
*   **Maintainability:** Each combination of types has its own space.
*   **Composability:** Different modules or instances can register their own functions.

---

## `API` Documentation

### `_e(arg1, arg2, ...)`

The main function, or `dispatcher`. **Each argument represents a value (`input`)**.

* It analyzes the types of the provided arguments.
* It looks up assignments for the whole type sequence (combination).
* **It returns a new object (`output`)** with the corresponding `methods` attached and/or runs `handlers`.

---

### `_e.fn(assignments)`

Registers assignments of [`methods`](#methods) and/or [`handlers`](#handlers) for types, subtypes, aliases or combinations.

**`assignments`:** Can be **an object or a function**.

**It returns the instance** *(v1.21.0+)*, so calls can be chained: `_e.fn({ /*...*/ }).subtype({ /*...*/ })`.

* **Object:**

    Each *key* refers to a type name, and each *value* is a nested object with `methods` or a function (`handler`). Each nesting level refers to the type of each argument, in the order in which it is passed to the [`dispatcher`](#_earg1-arg2-) (main function).

    ```javascript
    _e.fn({
      // Assigns methods for '_e(Object)'
      Object: {
        keys: (args) => Object.keys(args[0])
      },

      // The nesting levels refer to '_e(Array, String)' and its methods
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

    The `methods` you register will receive the `dispatcher` arguments as an **`array` in the first argument**. (See "[How the `Dispatcher` Arguments Are Passed](#how-the-dispatcher-arguments-are-passed)").

    ```javascript
    _e.fn({
      String: {
        repeat: (args, times) => args[0].repeat(times)
      }
    });

    const repeated = _e('hello ').repeat(3);
    console.log(repeated); //> "hello hello hello "
    ```
    #### **`Global Methods`**
    You can also assign `methods` that will be available regardless of the type of the arguments (`Any`) of an instance, by registering them at the first level of the assignments object (if a global `method` with the same name already exists, the new one is ignored with a warning; and if the name matches that of a `method` of a type, a [collision](#collision-of-methods-or-handlers) occurs).

    ```javascript
    _e.fn({
      // This method will be available for every call to '_e()'
      timestamp: () => `Processed at: ${Date.now()}`
    });

    console.log(_e(123).timestamp());       //> "Processed at: 1700000000000"
    console.log(_e('abc').timestamp());     //> "Processed at: 1700000000001"
    ```
    #### **Collision of `Methods` or `Handlers`**

    **⚠️ IMPORTANT: Framework Mode, in Collisions the General Overrides the Specific**
    
    When a [value (`input`)](#_earg1-arg2-) matches multiple types, all of their `methods` are merged into the resulting object. If two or more types assign a `method` or `handler` with the same name, a collision occurs. In this case, **the `method` or `handler` of the most general type (the least specific one, the main type) prevails, overriding the one of the more specific subtype or alias**. You can check the specificity order of any value using [`.type()`](#_etypeinput).
    
    **Override order in a method collision:**
    1. If it exists, a global `method`/`handler` is used.
    2. If not, a `method`/`handler` of the main type is used.
    3. If not, a `method`/`handler` of the derived type is used.
    4. If not, the one of the subtype/alias is used.
    
    **Example:**
    
    | Specificity level           | Example                   | Priority ↑  |
    |-----------------------------|---------------------------|-------------|
    | Subtype or Alias            | `AnotherCollection`       | 1           |
    | Derived type                | `Array`                   | 2           |
    | Main type                   | `Object`                  | 3           |
    | Global `Method`/`Handler`   | `myMethod`                | 4           |
    
    1. `Methods` of [**subtypes or aliases**](#_esubtypedefinitions):
    ```javascript
    _e.fn({ AnotherCollection: { myMethod: ... }})
    ```
    
    2. `Methods` of [**derived types**](#predefined-types):
    ```javascript
    _e.fn({ Array: { myMethod: ... }})
    ```
    
    3. `Methods` of [**main types**](#predefined-types):
    ```javascript
    _e.fn({ Object: { myMethod: ... }})
    ```
    
    4. [**Global** `Methods`](#global-methods):
    ```javascript
    _e.fn({ myMethod: ... })
    ```
    
    In the previous example, this means that `myMethod` for `Object` will override the one for `AnotherCollection`.
    
    **Another example:**
    
    ```javascript
    // We register methods with the same name for 'Array' and 'Object'.
    _e.fn({
      // Method for the derived type: Array
      Array: {
        logType: () => console.log('Derived Type: Array')
      },
      // Method for the general (main) type: Object
      Object: {
        logType: () => console.log('General (Main) Type: Object')
      }
    });
    
    // An array is both of type 'Array' and of type 'Object'.
    // Since there is a collision, the method of the most general type (the main type 'Object') prevails.
    _e([1, 2, 3]).logType(); //> "General (Main) Type: Object"
    ```
    
    **Note:** This design decision ensures that global `methods` or `handlers` can act as a predictable and consistent `'fallback'`, guaranteeing that a function is always available if a more specific one is not found. It also serves to prevent more recently registered `methods` or `handlers` from overriding earlier ones.

    **Changing the specificity order (v1.21.0+):** with the `collision` option of [`.config()`](#_econfigoptions) or of [`.instance()`](#_einstancename-options) you choose which definition prevails in a collision:

    | Value                  | Prevails                                                                                           |
    |------------------------|----------------------------------------------------------------------------------------------------|
    | `'general'` (default)  | The most general type (the behavior described above).                                              |
    | `'specific'`           | The most specific type. Global `methods`/`handlers` act only as a true `fallback`.                 |

    ```javascript
    const e = _e.instance('myAPI', { collision: 'specific' });

    e.fn({
      Array: { logType: () => 'Derived Type: Array' },
      Object: { logType: () => 'General (Main) Type: Object' },
      logType: () => 'Global'
    });

    e([1, 2, 3]).logType(); //> "Derived Type: Array"
    e({}).logType();        //> "General (Main) Type: Object"
    e('text').logType();    //> "Global"
    ```

    With `'specific'`, in sequences of several arguments the first argument carries the most weight: the types of the first argument are compared and, if they are equal, those of the second one, and so on. The collision warning is still shown, stating that the more general definition was ignored. The **execution** order of the `handlers` (from the most specific to the most general) **does not change** with this option.

    > **Note:** with `'general'` (the default value), the resolution order of previous versions is kept exactly. In sequences of several arguments, that order does not always follow the rule "the general overrides the specific" (for example, between `Array + String` and `Object + String`, `Array + String` prevails). If you need a consistent order across several arguments, use `'specific'`.

    > **Note:** collisions between `handlers` happen because, by default, a `handler` is also attached to the result as a `method` named after its type. With the `handlers: 'hidden'` option *(v1.22.0+)* they are not attached, so they do not collide. See "[`Handlers` as `Methods`](#handlers-as-methods)".

* **Function:**

    It can be assigned to run **on every call to an instance**; it is called the **root `handler`**.
    ```javascript
    _e.fn((arg1, arg2, /*...,*/ argN) => {
      // Code...
    });
    ```
    See "[Advanced Concepts: `Handlers`](#advanced-concepts-handlers)" or "[Execution Sequence by Specificity](#execution-sequence-by-specificity)".

### Merging Assignment Registrations (Additive Registration)

If you call `.fn()` several times to register assignments of `handlers` or `methods` **for the same types**, the assignments are merged instead of overwritten. This additive behavior is useful for plugin systems or for organizing code into modules, since it lets you add new functionality safely.

* **For `Handlers`:**

    There is an important rule: **once a `handler` is assigned to a type, it remains a `handler`**.

    If you then register an object of `methods` for that same type, the new `methods` are added to the `handler`, but it does not lose its ability to auto-execute.

    ```javascript
    // We assign a handler for 'Number'
    _e.fn({
      Number: (num) => console.log(`Handler executed for: ${num}`)
    });

    // We merge an object with a new method
    _e.fn({
      Number: {
        isEven: (args) => args[0] % 2 === 0
      }
    });

    // The handler auto-executes and has the new method available
    const myNumber = _e(10); //> Handler executed for: 10

    console.log(myNumber.isEven()); //> true
    ```
    See "[Advanced Concepts: `Handlers`](#advanced-concepts-handlers)" and "[Collision of `Methods` or `Handlers`](#collision-of-methods-or-handlers)".

    > **Bad practice:** do not reuse **the same function** as the `handler` of several types. In JavaScript a function is an object, and the `methods` merged into a `handler` are stored as properties of that function, so the types that share it would also share its `methods`. Use a different function for each type:
    >
    > ```javascript
    > const logValue = (value) => console.log(value);
    >
    > // Wrong: 'String' and 'Number' share the function and, with it, the methods merged into it
    > _e.fn({ String: logValue, Number: logValue });
    >
    > // Right: one function per type
    > _e.fn({ String: (value) => logValue(value), Number: (value) => logValue(value) });
    > ```

* **For `Methods`:**

    Objects with `methods` for the same types are merged instead of overwritten.

    ```javascript
    // Initial registration in the core of the application
    _e.fn({
      String: {
        log: (args) => console.log(`[LOG]: ${args[0]}`)
      }
    });

    // Later, a 'plugin' adds new functionality to the String type
    _e.fn({
      String: {
        wordCount: (args) => args[0].split(' ').length
      }
    });

    // Both methods are now available thanks to the merge
    const myText = _e('Estructura is very flexible');

    myText.log();                      //> [LOG]: Estructura is very flexible
    console.log(myText.wordCount());   //> 4
    ```

* **If the function already exists:**

    Merging is not overwriting: **the first registered function prevails**. If you register another `handler` for a type that already has one (or for the root), or another `method` with a name that already exists in the same type sequence, the new one is ignored with a warning *(v1.22.0+; previously it was ignored silently)*. Registering exactly the same function again does not produce any warning.

    ```javascript
    _e.fn({ String: { log: () => 'first' } });
    _e.fn({ String: { log: () => 'second' } }); // Ignored with a warning

    _e('text').log(); //> "first"
    ```

### How the `Dispatcher` Arguments Are Passed

**⚠️ IMPORTANT: Crucial Distinction**

There is a key difference in **how `methods` and `handlers` receive the `dispatcher` arguments**.

- **`Methods`**: receive **all the arguments in an array** as their first parameter.  
- **`Handlers`**: receive **the arguments directly**.

| Kind        | Function arguments            | Access example    |
|-------------|-------------------------------|-------------------|
| `Method`    | `(args, extra...)`            | `args[0]`         |
| `Handler`   | `(arg1, arg2, ...)`           | `arg1`            |

**With the `args: 'spread'` option (v1.21.0+)**, `methods` receive the `dispatcher` arguments one by one, and the arguments the `method` is called with go together in an `array` as the **last** argument (see [`.config()`](#_econfigoptions)):

| `args` option         | Arguments of the `method` function            | For `_e(a, b).method(c, d)`   |
|-----------------------|-----------------------------------------------|-------------------------------|
| `'array'` (default)   | `(args, ...methodArgs)`                       | `([a, b], c, d)`              |
| `'spread'`            | `(...dispatcherArgs, methodArgs)`             | `(a, b, [c, d])`              |

```javascript
const e = _e.instance('spreadAPI', { args: 'spread' });

e.fn({
  Array: {
    String: {
      // (arr, sep) are the dispatcher arguments; [prefix] are the method arguments
      join: (arr, sep, [prefix]) => prefix + arr.join(sep)
    }
  }
});

e([1, 2, 3], '-').join('>'); //> ">1-2-3"
```

With `'spread'` the last parameter is always an `array` (`[]` if the `method` is called without arguments). For a `method` registered in a type sequence, the number of `dispatcher` arguments is fixed: the length of the sequence. For [`global methods`](#global-methods) it varies with each call; that is why the `array` of `method` arguments always goes last: `(...all) => { const methodArgs = all.pop(); /* 'all' is left with the dispatcher arguments */ }`. `Handlers` **do not change**: they still receive the arguments directly.

**Examples:**  

* **`Methods`:**

    ```javascript
    _e.fn({
      String: {
        // 'args' is ['Hello']
        myMethod: (args) => console.log(`The first argument is: ${args[0]}`)
      }
    });

    _e('Hello').myMethod(); //> "The first argument is: Hello"
    ```

* **`Handlers`:**

    ```javascript
    _e.fn({
      // 'arg1' is 'Hello'
      String: (arg1) => { console.log(`Received directly: ${arg1}`); }
    });

    _e('Hello'); //> "Received directly: Hello"
    ```

---

### `_e.subtype(definitions)`

Registers definitions of new types for each Estructura instance. **These are called subtypes and aliases**. It returns the instance *(v1.21.0+)*, so calls can be chained.

**`definitions`:** An object where each *key* is the name of a predefined type and each *value* can be:

*   A text string (`string`) to create a simple alias.
*   An `array` of text strings to assign multiple aliases at once.
*   **An evaluator function** that receives the [value (`input`)](#_earg1-arg2-) and decides the type/subtype of `input`:
    > **Arguments available in the function:**
    > * **`input`**: The value being analyzed.
    > * **`primitive_type`**: The name of the main or derived type it comes from (e.g. `'Object'`, `'String'`).
    > * **`getTypes`**: A function that, when executed as `getTypes()`, returns a safe copy of the *array/map* with all the types detected so far in the recursion chain. (Because it is a function, it guarantees optimal performance by not cloning the map unless you explicitly request it).

    **Values the function can return:**

    * A text string with the new name of the subtype.
    * A *boolean* **`true`** if the name of the *key* should be used as the name of the subtype.
    * If the value does not match the subtype: **`undefined`**, **`null`**, **`false`**, or **`''`**.

    Evaluator functions only run when the types of a value are detected (in the `dispatcher` or in [`.type()`](#_etypeinput)), never when registering with [`.fn()`](#_efnassignments) or `.subtype()` *(v1.22.0+)*.

    > **Disallowed names:** the result of [`.type()`](#_etypeinput) is an `array`, so a subtype or alias cannot be named after a native property of `arrays` (`map`, `filter`, `length`, etc.). Those names are ignored with a warning *(v1.22.0+)*. With the convention of names that start with an uppercase letter (`Email`, `User`) there is no conflict.

```javascript
// Create subtypes
_e.subtype({
  // With a function
  Object: (input) => (input.userId ? 'User' : false),

  // With a string (a simple alias)
  RegExp: 'RegexPattern',

  // With an array (multiple aliases)
  // An 'Array' is now also of type 'Collection' and 'OrderedList'
  Array: ['Collection', 'OrderedList'] 
});

// Register functions for the new types
_e.fn({
  User: {
    hello: (args) => console.log(`Hello, ${args[0].name}!`)
  },
  RegexPattern: {
    test: (args, str) => args[0].test(str)
  },
  // Methods can be registered for ANY alias
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

// Now the methods of both aliases are available
const myList = _e([1, 2, 3]);
console.log(myList.count());         //> 3
console.log(myList.isCollection());  //> true
```
In addition, **`definitions`** can be a text string such as `'browser-dom'`, which loads the [predefined subtypes for the browser DOM](#predefined-subtypes-browser-dom) into instances. If the string is not the name of a predefined set, nothing is registered and a warning is emitted *(v1.22.0+)*.

### Predefined Types
* **Main:**

    `Null`, `Undefined`, `Boolean`, `String`, `Number`, `NaN`, `BigInt`, `Symbol`, `Function`, `Object`.
* **Derived:**

  * **From `Object`:**

    `Array`, `RegExp`, `Date`, etc., which belong to the basic JavaScript specification.

    Or, depending on the environment, the JavaScript specification, or the browser: `Map`, `Set`, `Promise`, etc.

    

### Predefined Subtypes: `'browser-dom'`

This set of subtypes drastically simplifies DOM manipulation by grouping hundreds of browser-specific object types into a few powerful, generic categories.

#### **How to Import or Enable `browser-dom`**

```javascript
// Enable it on the default instance
_e.subtype('browser-dom');

// Or on a named instance
const domAPI = _e.instance('domAPI');
domAPI.subtype('browser-dom');

/*
 * Usage examples in a browser.
 * Note: The result of '.type()' is shown here ordered from the
 * most specific type to the most general one for clarity, but
 * the order that '.type()' returns by default is the reverse.
 */
console.log(domAPI.type(document.head));   //> [ "Node.HEAD", "Node", "HTMLHeadElement", "Object" ]
console.log(domAPI.type(document));        //> [ "Document", "HTMLDocument", "Object" ]
console.log(domAPI.type(window));          //> [ "Browser", "Window", "Object" ]
```

#### Identified Subtypes

##### `Node` Subtype

Represents individual nodes or elements in the DOM. It is the broadest category and covers:

*   **All HTML Elements:** From `HTMLHtmlElement` to `HTMLDivElement`, `HTMLInputElement`, `HTMLTemplateElement`, etc. (any tag that can be written).
  > **Dynamic Subtype: `Node.<TAG_NAME>`**
  >
  > After an element is identified as `Node`, for more precision, the framework creates an additional subtype using its `tagName` property.
  >
  > **Examples:**
  >
  > **Note:** In the following examples, for clarity, the types are shown ordered from the most specific to the most general, but the order that `.type()` returns is the reverse.
  > *   A `<div>` element is classified as `[ "Node.DIV", "Node", "HTMLDivElement", "Object" ]`.
  > *   A `<button>` element is classified as `[ "Node.BUTTON", "Node", "HTMLButtonElement", "Object" ]`.
*   **SVG and MathML Elements:** Such as `SVGSVGElement` and `MathMLMathElement`.
*   **Unknown or obsolete elements:** Such as `HTMLUnknownElement` and `HTMLMarqueeElement`.
*   **Nodes that are not elements:** Text nodes (`Text`), comments (`Comment`), document fragments (`DocumentFragment`) and attributes (`Attr`).

##### `Nodes` Subtype

Represents collections or lists of nodes, which are the result of DOM queries.

*   `NodeList` (returned by `document.querySelectorAll()`).
*   `HTMLCollection` (returned by `document.getElementsByTagName()` or `element.children`).
*   `HTMLAllCollection` (an obsolete collection).

##### `Document` Subtype

Specifically identifies the main `document` object of the page, to normalize the cases where the type of the object is `HTMLDocument` (in certain browsers).

##### `Browser` Subtype

Identifies `global` objects of the browser environment that are not part of the DOM content.

*   `Window` (the `global` object `window`).
*   `Navigator` (the `navigator` object, with information about the browser).
*   `Screen` (the `screen` object, with information about the screen).
*   `Location` (the `location` object, with information about the URL).
*   `History` (the `history` object, for navigation).

---

### `_e.instance(name, options)`

Creates or retrieves an isolated Estructura instance. This is ideal to avoid collisions in large applications or when creating libraries.

**`options`** *(optional, v1.21.0+)*: an object with the initial [options](#_econfigoptions) of the instance. They are only applied when the instance is **created**; if the instance already exists, they are ignored with a warning (use [`.config()`](#_econfigoptions) to change them).

```javascript
const strictAPI = _e.instance('strictAPI', { collision: 'specific', args: 'spread' });
```

```javascript
const myAPI = _e.instance('myAPI');
const anotherAPI = _e.instance('anotherAPI');

// The assignments in 'myAPI' do not affect 'anotherAPI'
myAPI.fn({ String: { log: () => console.log('myAPI log') } });
anotherAPI.fn({ String: { log: () => console.log('anotherAPI log') } });

myAPI('test').log();       //> "myAPI log"
anotherAPI('test').log();  //> "anotherAPI log"
```

---

### `_e.config(options)`

*(v1.21.0+)* Changes the options of an instance (each instance has its own, including the default instance `_e`) and returns the instance for chaining. Called **without arguments**, it returns a copy of the current options. Invalid values and unknown options are ignored with a warning.

| Option        | Values                                   | Description                                                                                                              |
|---------------|------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `collision`   | `'general'` (default), `'specific'`      | Which definition prevails when an `input` matches several types that assign a `method` with the same name. See "[Collision of `Methods` or `Handlers`](#collision-of-methods-or-handlers)". |
| `args`        | `'array'` (default), `'spread'`          | How `methods` receive the arguments. See "[How the `Dispatcher` Arguments Are Passed](#how-the-dispatcher-arguments-are-passed)". |
| `handlers`    | `'exposed'` (default), `'hidden'`        | *(v1.22.0+)* Whether a `handler` is also attached to the result as a `method`. See "[`Handlers` as `Methods`](#handlers-as-methods)". |
| `errors`      | `'console'` (default), `'throw'`         | *(v1.22.0+)* What happens when a `method`, a `handler` or a subtype evaluator function throws an error: it is reported through the console and the flow continues, or the original error is rethrown. |

```javascript
_e.config(); //> { collision: 'general', args: 'array', handlers: 'exposed', errors: 'console' }

_e.config({ collision: 'specific' }).config({ args: 'spread' });
_e.config(); //> { collision: 'specific', args: 'spread', handlers: 'exposed', errors: 'console' }
```

The default values reproduce the behavior of previous versions, so nothing needs to change in existing code. A change of options applies to the subsequent calls to the `dispatcher`; the objects the `dispatcher` has already returned keep the argument-passing style they were created with.

**Errors (`errors`):** by default (`'console'`), if a `method`, a `handler` or a subtype evaluator function throws an error, the error is reported through the console and the flow continues (a `method` that fails returns the result object). With `'throw'` the original error is rethrown, with its stack trace and its class, and nothing is written to the console. The option applies at the moment the error occurs.

```javascript
const api = _e.instance('strict', { errors: 'throw' });

api.fn({ String: { parse: (args) => JSON.parse(args[0]) } });

try {
  api('not JSON').parse();
}
catch(error){
  console.log(error instanceof SyntaxError); //> true
}
```

---

### `_e.type(input)`

A utility that tells you the types of any variable in order of specificity (from the most general at index 0 to the most specific at the last index). It returns an `array` that also works as a map of all the detected types (the properties named after each type, with the value `true`, are useful for quick checks).

```javascript
const types = _e.type({ id: 1 }); 
console.log(types); //> [ 'Object', Object: true ]

if(types['Object']){
  console.log('Quick check: it is an object.');
}
```

> **Note:** the result is an `array`, so it also has the native properties of arrays (`types['filter']` is a function for any value). Use the quick check only with type names; with the convention of names that start with an uppercase letter there is no conflict.

## Advanced Concepts: `Handlers`

These functions behave differently, offer more flexibility and can:

* **Auto-execute:**

  If the type sequence (combination) matches the function (`handler`), it runs automatically *before* the `dispatcher` returns the object with the `methods` (which is available as a reference in **`this`** [if it is a classic function `function(){}`]).

  The `dispatcher` arguments are passed directly to the function (see "[How the `Dispatcher` Arguments Are Passed](#how-the-dispatcher-arguments-are-passed)").

* **Contain more `handlers` or `methods`:**

  Since it is a function, it can have properties that act as `sub-handlers` or `methods` for a deeper dispatch.

* [**Override `methods` dynamically**](#overriding-methods-dynamically).

#### `Handler` Auto-Execution

You can register a function that runs if the types of the arguments match.

```javascript
// We create a function that will run for any 'String'
// Note: The function receives the dispatcher arguments directly

const logString = (str) => {
  console.log(`[LOG]: The string '${str}' was processed.`);
};

// We assign the function directly under the 'String' type

_e.fn({
  String: logString
});

// When '_e()' is called with a string, the function runs automatically

_e('My first event');     //> "[LOG]: The string 'My first event' was processed."
_e('One more event');     //> "[LOG]: The string 'One more event' was processed."
```

#### Execution Sequence by Specificity

It lets you create `middleware` or layers of logic built on top of one another.

When a [value (`input`)](#_earg1-arg2-) belongs to multiple types (such as an `Array`, which is also an `Object`), all the matching `handlers` run in sequence, **from the most specific to the most general**.

**Quick summary:** `Handlers` run from the most specific to the most general.

**Sequence example:**

| Specificity   | Example of detected type              |
|---------------|---------------------------------------|
| 1 (highest)   | `Array`                               |
| 2             | `Object`                              |
| 3 (lowest)    | Root handler (`_e.fn(() => {...})`)   |

```javascript
// Handler for Arrays (very specific)
_e.fn({
  Array: (arr) => console.log(`[LOG]: Handler for Array executed for: ${arr}`)
});

// Handler for Objects (less specific, since an Array is an Object)
_e.fn({
  Object: () => console.log('[LOG]: Handler for Object executed.')
});

// Root handler (the most general one)
_e.fn(() => {
  console.log('[LOG]: Root handler executed.');
});

// When called with an array, the three handlers run in order of specificity
_e(['a', 'b']);
//> "[LOG]: Handler for Array executed for: a,b"
//> "[LOG]: Handler for Object executed."
//> "[LOG]: Root handler executed."
```

#### `Handlers` as `Methods`

By default (`handlers: 'exposed'`), a function assigned to a type name is a `handler` and is also attached to the result as a `method` with that name, just as in previous versions:

```javascript
_e.fn({ String: (str) => console.log(str) });

Object.keys(_e(5)); //> [ 'String' ]
```

With the `handlers: 'hidden'` option *(v1.22.0+)* of [`.config()`](#_econfigoptions) or of [`.instance()`](#_einstancename-options), every name that **starts with an uppercase letter** is treated as a type name: its function only acts as a `handler` (it runs when its type matches) and is never attached as a `method`. Names that start with a lowercase letter are still `methods`.

```javascript
const api = _e.instance('myAPI', { handlers: 'hidden' });

api.fn({
  String: (str) => console.log(`Handler: ${str}`),
  log: () => 'Global method'
});

Object.keys(api(5));  //> [ 'log' ]
api('text');          //> "Handler: text"
```

> **Note:** with `'hidden'` the rule applies at every level (global `methods`, the `methods` of a type and those returned by a `handler`), so the names of `methods` must start with a lowercase letter. It also avoids the collision warnings between `handlers` of different sequences that share a type name (for example, those of `Array + String` and `Object + String` when the `dispatcher` is called with only an `array`).

#### Overriding `Methods` Dynamically

**If a `handler` returns an object or a function**, the `sub-handlers` or `methods` it contains override the set of `methods` that the `dispatcher` is adding to the main object it will return (which is available as a reference in **`this`** [if it is a classic function `function(){}`]).

Any other returned value (`true`, a number, a string, or nothing) leaves the `methods` merged into the `handler` untouched *(v1.22.0+; previously, a value such as `true` or a number left the result without those `methods`)*. To leave the result without the `methods` of that type, return an empty object (`{}`).

This lets you create dynamic `APIs` where the result of a function can change the available `methods`.

**Example: A validator that returns different `methods` depending on the result.**

```javascript
// Subtype to identify emails

_e.subtype({
  String: (input) => (input.includes('@') ? 'Email' : false)
});

// Handler for the 'Email' type
// It receives the email as the first argument, not wrapped in an array

const validateEmail = (email) => {
  console.log(`Validating: ${email}`);

  if(email.endsWith('@gmail.com')){
    // If it is a Gmail email, it returns specific methods

    return {
      send: () => console.log('Sending with the Gmail API...'),
      addToContacts: () => console.log('Adding to Google contacts.')
    };
  }
  else {
    // For other emails, it returns a generic method

    return {
      send: () => console.log('Sending with generic SMTP...')
    };
  }
};

// We register the handler

_e.fn({
  Email: validateEmail
});

// CASE 1: Gmail email

const gmailUser = _e('test@gmail.com');
//> "Validating: test@gmail.com"

gmailUser.send();            //> "Sending with the Gmail API..."
gmailUser.addToContacts();   //> "Adding to Google contacts."

// CASE 2: Another email

const otherUser = _e('user@outlook.com');
//> "Validating: user@outlook.com"

otherUser.send();            //> "Sending with generic SMTP..."
// otherUser.addToContacts(); // This throws an error, because the method was not returned
```

## FAQ (Frequently Asked Questions)

* **Can I use Estructura with TypeScript?**

  Yes. Since v1.21.0 the package includes its type declarations (see "[TypeScript](#typescript)"). Estructura resolves types at runtime, so it remains a lightweight alternative to the verbosity of static typing, and it can now also be used from TypeScript projects.

* **Does it have a built-in way to debug?**

  Yes. Currently, warnings and errors are emitted to the console (or an error is thrown in environments without a console) in these cases:
  * If you register a subtype with a function that has an error or that returns an incorrect type.
  * If you try to use disallowed names for instances or `methods`, such as: names of properties inherited from [`Object.prototype`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), [JavaScript reserved words](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar), and names of properties used by the framework.
  * If the instance you are trying to create already exists.
  * If there was a conflict between `method` names (collisions).
  * If a `method` or a `handler` throws errors when it runs.
  * If you try to register a subtype or a `method` incorrectly.
  * If you register a `handler` or a `method` that already exists: the first one is kept *(v1.22.0+)*.
  * If the name of a predefined set of subtypes does not exist, or if a subtype uses the name of a native property of `arrays` *(v1.22.0+)*.

  With the `errors: 'throw'` option *(v1.22.0+)* of [`.config()`](#_econfigoptions), errors from `methods`, `handlers` and subtype evaluator functions are thrown instead of being reported through the console.

* **How do I debug `methods` that are not found?**

  See "[Common Problems](#common-problems)".

* **Can calls to Estructura be included in highly repetitive loops?**

  See "[Considerations](#considerations)".

## Common Problems

* **A `handler` does not run**

  Check that it was assigned to the right data types or arguments by verifying the detected types with [`.type()`](#_etypeinput). Also review "[Execution Sequence by Specificity](#execution-sequence-by-specificity)" or "[Advanced Concepts: `Handlers`](#advanced-concepts-handlers)".

* **`Methods` not found error**

  If an error appears when invoking a `method`, make sure that the `method` is registered for the correct data types or arguments, and that the data are exactly of those types; you can use [`.type()`](#_etypeinput) to verify the detected types of the data.

* **`Methods` are overridden**

  Review how the override order works for `methods` with the same name in "[Collision of `Methods` or `Handlers`](#collision-of-methods-or-handlers)", and the dynamic override section "[Overriding `Methods` Dynamically](#overriding-methods-dynamically)".

* **A new `handler` or `method` does not replace the previous one**

  When registering with [`.fn()`](#_efnassignments), the first registered function prevails: the new one is ignored with a warning. See "[Merging Assignment Registrations](#merging-assignment-registrations-additive-registration)".

* **`Methods` named after types appear (`String`, `Array`, etc.)**

  By default, a `handler` is also attached as a `method` named after its type. To avoid this, use the `handlers: 'hidden'` option. See "[`Handlers` as `Methods`](#handlers-as-methods)".

* **A `method` returns the result object instead of its value, or an error is not propagated**

  By default, if a `method` throws an error, the error is reported through the console and the `method` returns the result object. To have the error thrown, use the `errors: 'throw'` option of [`.config()`](#_econfigoptions).

## Considerations

* **Performance**

  * **In v1.22.0:**

    Registering with [`.fn()`](#_efnassignments) and [`.subtype()`](#_esubtypedefinitions) no longer runs the subtype evaluator functions, so creating an instance and registering its definitions takes about a third less time (measured with `bench/benchmark.js`: instance + subtypes + 100 `methods`). Dispatch time does not change.

  * **In v1.19.0:**

    The registration of nested subtypes in [`.subtype()`](#_esubtypedefinitions) was optimized, halving the resolution time in deep nesting.

  * **Up to v1.18.0:**

    **On low-end devices**, delays (`lags`) occur in high-frequency loops. For example:
    
    A `lag` of approx. 1 second per 100000 consecutive executions on:

    - **Device:** "HP 15 Notebook PC".
    - **Processor:** "AMD A8-7410 APU with AMD Radeon R5 Graphics, 2200 Mhz, 4 Core(s), 4 Logical Processor(s)".
    - **OS:** "Windows 10 Home", 64-bit.
    - **Simultaneous processes:** common OS processes running.
    - **Runtime environment:** "Google Chrome 138.0".
    - **Execution context:** clean, 10 varied data types defined, with 100 simple `methods` in total assigned evenly.
    - **Execution summary:** a `for` loop of 10000 iterations with 10 calls to the `dispatcher` for the defined types.

* **Inconsistencies**

  As mentioned in the code documentation of [`jQuery`](https://code.jquery.com/jquery-3.7.1.js) (in the comments of the `isFunction` function, line 77), in certain old browser versions there are DOM nodes that could return `'Function'` as their primitive type instead of `'Object'`. That is why the following compatibility solution has been integrated into the `browser-dom` predefined subtypes:

  ```javascript
  _e.subtype({
    'Function': function(input){
      return typeof input.nodeType === "number" || typeof input.item === "function" ? 'Object' : null;
    }
  });
  ```

## Notes on Previous and Current Versions

*   **In v1.22.0:**

    * **New `handlers` option** (`'exposed'` | `'hidden'`) so that `handlers` are not attached as `methods`: see "[`Handlers` as `Methods`](#handlers-as-methods)".
    * **New `errors` option** (`'console'` | `'throw'`) to rethrow the errors of `methods`, `handlers` and subtype evaluator functions: [`.config()`](#_econfigoptions).
    * **New warnings** in cases that were previously ignored silently: when registering a `handler` or a `method` that already exists (the first one prevails), when using in [`.subtype()`](#_esubtypedefinitions) the name of a predefined set that does not exist, and when a subtype uses the name of a native property of `arrays`.
    * **`Bugfix`:** a `handler` that returned a value that is neither an object nor a function (such as `true` or a number) left the result without the `methods` merged into it. Now only an object or a function replaces them.
    * **`Bugfix`:** [`.fn()`](#_efnassignments) and [`.subtype()`](#_esubtypedefinitions) ran the subtype evaluator functions on the definition objects when registering. Now they only run when types are detected.
    * **Performance:** as a consequence, registration takes about a third less time (see "[Considerations](#considerations)"). Dispatch time does not change.
    * **TypeScript:** new `HandlersOption` and `ErrorsOption` types; `Options` and `CurrentOptions` include the new options.
    * **Documentation:** the default documentation (`README.md`) is now in English; the Spanish version is kept in [`README.es.md`](README.es.md). The unit tests, the type tests and the `benchmark` are now in English as well. Also: a bad-practice note about reusing the same function as the `handler` of several types (see "[Merging Assignment Registrations](#merging-assignment-registrations-additive-registration)"), the size updated (about 35 KB uncompressed), a fix to the "[`Methods`](#methods)" example, which used the reserved name `length`, and a fix to the browser `ESM` import example via CDN, which now points to the `ESM` file.
    * **Tests:** continuous integration with GitHub Actions (unit tests, type tests and the build checks of `npm run check`: `ES3` syntax of the `UMD` distribution, `UMD` and `ESM` distributions in sync, and version). The same checks run automatically before publishing (`prepublishOnly`).
    * No `breaking changes`: the default values keep the behavior of v1.21.0. [`.config()`](#_econfigoptions) without arguments also returns the new options.

*   **In v1.21.0:**

    * **New `collision` option** (`'general'` | `'specific'`) to choose which definition prevails in `method` collisions: [`.config()`](#_econfigoptions).
    * **New `args` option** (`'array'` | `'spread'`) to choose how `methods` receive the arguments: `(...dispatcher arguments, [method arguments])`.
    * New [`.config()`](#_econfigoptions) method and optional second parameter in [`.instance()`](#_einstancename-options).
    * **TypeScript:** type declarations (`.d.ts`) are included for `import` and `require`, with type tests (`npm run test:types`). See "[TypeScript](#typescript)".
    * [`.fn()`](#_efnassignments) and [`.subtype()`](#_esubtypedefinitions) return the instance, so they can be chained with [`.config()`](#_econfigoptions).
    * **`Bugfix`:** `getTypes()` in the evaluator functions of [`.subtype()`](#_esubtypedefinitions) returned `undefined` instead of the copy of the *array/map* of detected types.
    * **`Bugfix`:** [`.fn()`](#_efnassignments) with a root `handler` returned the internal state of the instance.
    * **`Bugfix`:** the `ESM` distribution did not include the v1.19.0 optimization for nested subtypes (the evaluator functions ran twice). Both distributions are synchronized again, and the unit tests now also cover the `ESM` distribution.
    * No `breaking changes`: the default values keep the behavior of v1.20.0.

*   **Up to v1.20.0:**

    * **Notable fix:** `.unref()` is now called on the `setInterval` of the internal console message system, specifically for environments such as Node.js, so that the process can exit instead of staying active indefinitely.
    * Small consistency adjustments in the documentation.
    * In general, the functionality has remained stable.

*   **In v1.19.0:**

    * **Critical `Bugfix`:** a memory leak (`Memory Leak`) in the internal console message queue system (`setInterval`) was fixed.
    * **Performance:** the registration of nested subtypes was optimized (`trash code` removed in [`.subtype()`](#_esubtypedefinitions)), halving the resolution time in deep nesting.
    * The JSDoc comments of the code and the documentation were improved or updated.

*   **In v1.18.0:**

    * Redundancies were removed and the flow of console messages was fixed.

*   **In v1.17.0:**

    * Safety was improved in `subtype_definition_execution` and in the display of warnings and errors in the console.
    * Inconsistencies were fixed in `subtype`, `is_correct_object_property_name`, `merge_type_fns_node` and the console messages.
    * Built-in compatibility for inconsistencies of certain browsers, with the `browser-dom` predefined subtypes.
    * The minimum Jest version for the unit tests was lowered to v29.7+ to ensure compatibility with older versions of Node.js (v14.15+).
    * Unit tests were improved and added for extra coverage.
    * The updates focused mainly on the documentation.

*   **In v1.15.0:**

    * Unit tests with Jest were added.
    * In the `browser-dom` predefined subtypes, the `Browser` alias for the `Document` subtype was removed (`no breaking change`).
    * The `JSDoc` documentation of the code was updated to reflect the references to "`handlers`".

*   **In v1.14.0:**

    In the documentation, "`handlers`" replaced the "hybrid node(s)".

*   **In v1.9.0:**

    The `JSDoc` documentation of the code was updated to reflect changes from previous versions.

*   **In v1.8.0:**

    Improved: the `methods` attacher (`attach_resolved_methods`), and the isolation of instances in the function (`fn`) and subtype (`subtype`) registrars for JavaScript environments such as Node.js.

*   **Before v1.6.0:**

    The module in `ESM` format was not configured correctly, which could cause import problems.

## License

MIT License

Copyright (c) 2025 [OKZGN](https://okzgn.com)

---

[Back to top](#estructura)
