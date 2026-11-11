/**
 * Estructura v1.22.0 - Type declarations
 * A lightweight dependency-free JavaScript framework that lets you assign functions to be automatically attached to custom or extended data types, based on one or multiple arguments.
 * 2025 (c) OKZGN
 * @license MIT
 */

declare namespace _e {
	/**
	 * The result of `.type(input)`: the detected type names from the most general (index 0) to the most
	 * specific (last index). Each detected name is also an own property set to `true`, so the array works
	 * as a map for O(1) checks, e.g. `if(types['Array'])`.
	 */
	interface TypeResult extends Array<string> {
		[typeName: string]: unknown;
	}

	/**
	 * The object returned by the dispatcher `_e(...)`, with the resolved methods attached and bound to it.
	 * The methods are only known at runtime, so any method name is allowed; pass a type parameter to the
	 * dispatcher to describe the expected ones: `_e<{ log(): void }>(value).log()`.
	 */
	interface Result {
		[methodName: string]: (...args: any[]) => any;
	}

	/**
	 * A method: a function inside an object of assignments. It is attached to the result object and called
	 * after the dispatch, with `this` set to the result object. How it receives the arguments depends on the
	 * `args` option of the instance:
	 * - `'array'` (default): `([...dispatcherArgs], ...methodArgs)`.
	 * - `'spread'`: `(...dispatcherArgs, methodArgs)`, where `methodArgs` is always an array (the last argument).
	 */
	type Method = (this: Result, ...args: any[]) => any;

	/**
	 * A handler: a function assigned directly to a type, or to the root of an instance with `.fn(handler)`.
	 * It runs automatically during the dispatch when its type sequence matches, receiving the dispatcher
	 * arguments directly, with `this` set to the result object. It may return an object of methods, which is
	 * then used instead of the methods merged into the handler. Any other returned value keeps them.
	 */
	type Handler = (this: Result, ...dispatcherArgs: any[]) => Methods | void | null | undefined | false;

	/** An object of methods, as assigned to a type sequence or returned by a handler. */
	interface Methods {
		[methodName: string]: Method;
	}

	/**
	 * The tree of assignments for `.fn()`. Each key is either a type name, whose value is a nested tree
	 * (the next argument types) or a handler, or a method name, whose value is the method.
	 */
	interface Assignments {
		[typeOrMethodName: string]: Assignments | Method | Handler;
	}

	/**
	 * A subtype evaluator. It receives the value, the name of the type it derives from, and `getTypes()`,
	 * which returns a copy of the types detected so far. It returns the subtype name, `true` to use the
	 * definition name as the subtype name, or a falsy value when the value does not belong to the subtype.
	 */
	type SubtypeEvaluator = (input: any, primitiveType: string, getTypes: () => TypeResult) => string | boolean | null | undefined | void;

	/** A subtype definition: an alias, a list of aliases, an evaluator, or nested definitions. */
	type SubtypeDefinition = string | string[] | SubtypeEvaluator | SubtypeDefinitions;

	/** The definitions for `.subtype()`: each key is the name of the type the definitions derive from. */
	interface SubtypeDefinitions {
		[typeName: string]: SubtypeDefinition;
	}

	/** The names of the predefined subtype sets. */
	type PredefinedSubtypes = 'object-constructors' | 'browser-dom';

	/**
	 * Which definition prevails when an input matches several types that assign a method with the same name:
	 * `'general'` (default) the most general type, `'specific'` the most specific one.
	 */
	type CollisionOption = 'general' | 'specific';

	/**
	 * How the methods receive the arguments: `'array'` (default) as `([...dispatcherArgs], ...methodArgs)`,
	 * `'spread'` as `(...dispatcherArgs, methodArgs)` with `methodArgs` always an array.
	 */
	type ArgsOption = 'array' | 'spread';

	/**
	 * Whether a handler (a function assigned to a type name) is also attached to the result as a method:
	 * `'exposed'` (default) it is, as in previous versions; `'hidden'` it is not: every name starting with an
	 * uppercase letter is a type name, so its function only runs as a handler.
	 */
	type HandlersOption = 'exposed' | 'hidden';

	/**
	 * What happens when a method, a handler or a subtype evaluator throws: `'console'` (default) the error is
	 * reported through the console and the flow continues; `'throw'` the original error is rethrown.
	 */
	type ErrorsOption = 'console' | 'throw';

	/** The instance options, for `.config(options)` and `.instance(name, options)`. */
	interface Options {
		collision?: CollisionOption;
		args?: ArgsOption;
		handlers?: HandlersOption;
		errors?: ErrorsOption;
	}

	/** The current options of an instance, as returned by `.config()`. */
	interface CurrentOptions {
		collision: CollisionOption;
		args: ArgsOption;
		handlers: HandlersOption;
		errors: ErrorsOption;
	}

	/** An Estructura instance: the dispatcher function together with its API. */
	interface Instance {
		/**
		 * The dispatcher. It detects the types of the arguments, runs the matching handlers and returns a new
		 * object with the matching methods attached.
		 */
		<R extends object = Result>(...args: any[]): R;
		/**
		 * Registers methods and handlers for types or type sequences. Repeated calls merge; if a function is
		 * already registered for a name, the first one is kept and the new one is ignored with a warning.
		 * Returns the instance.
		 */
		fn(assignments: Assignments | Handler): this;
		/**
		 * Registers subtypes and aliases, or one of the predefined sets. A name that is a native property of
		 * arrays (e.g., `map`, `length`) cannot be used for a subtype. Returns the instance.
		 */
		subtype(definitions: SubtypeDefinitions | PredefinedSubtypes): this;
		/** Detects all the types of a value, from the most general to the most specific. */
		type(input: any): TypeResult;
		/** Creates or retrieves a named, isolated instance. The options apply only when the instance is created. */
		instance(name: string, options?: Options): Instance;
		/** Returns a copy of the current options of the instance. */
		config(): CurrentOptions;
		/** Changes the options of the instance; invalid values are ignored with a warning. Returns the instance. */
		config(options: Options): this;
	}
}

/** The default Estructura instance. */
declare const _e: _e.Instance;

export = _e;
