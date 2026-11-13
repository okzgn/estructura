/**
 * Estructura v1.23.0
 * A lightweight dependency-free JavaScript framework that lets you assign functions to be automatically attached to custom or extended data types, based on one or multiple arguments.
 * 2025 (c) OKZGN
 * @license MIT
 */

(function(global, factory){
	'use strict';
	if(typeof exports === 'object' && typeof module !== 'undefined'){
		module.exports = factory();
	}
	else if(typeof define === 'function' && define.amd){
		define(factory);
	}
	else {
		global._e = factory();
	}
}(this, function(){
	'use strict';

	/**
	 * Describes the result of a type analysis operation.
	 * The result is an array of strings, with the most specific type at the end.
	 * This array also acts as a hash map for O(1) lookups.
	 * @typedef {string[]} EstructuraTypeResult
	 */

	/**
	 * The main dispatcher function of an Estructura instance. It analyzes the argument types
	 * and returns a new object containing the methods from all matching function definitions.
	 * @typedef {function(...*): object} EstructuraDispatcher
	 */

	/**
	 * The internal state object for a single sandboxed instance of Estructura.
	 * @typedef {object} EstructuraInstance
	 * @property {string} name - The name of the instance for logging.
	 * @property {object} messages - A queue for pending console messages to prevent flooding.
	 * @property {object} fns - The registry for function dispatching.
	 * @property {object} subtypes - The registry for subtype definitions.
	 * @property {{collision: string, args: string, handlers: string, errors: string}} options - The instance options (see `config`).
	 * @property {number} epoch - Changes on every change of options; a plan record of another epoch is rebuilt.
	 * @property {object} plan - The plan record of the root: a tree parallel to `fns` with the method names of every visited node.
		 */

	/**
	 * The main public interface of an Estructura instance.
	 * @typedef {EstructuraDispatcher & {
	 *   type: function(*): EstructuraTypeResult,
	 *   fn: function(object|Function): EstructuraPublicInterface,
	 *   subtype: function(object|string): EstructuraPublicInterface,
	 *   config: function(object=): (EstructuraPublicInterface|object),
	 *   instance: function(string, object=): EstructuraPublicInterface
	 * }} EstructuraPublicInterface
	 */

	// This typedef is not directly used in the code but helps document the shape of resolved nodes.
	/**
	 * A conceptual wrapper for a resolved function node.
	 * @typedef {object} ResolvedNode
	 * @property {object|Function} fns - The actual function or object of methods at this node.
	 * @property {string} type - The specific type that matched to find this node.
	 */

	var
	messages = {},
	instances = {},
	typeof_str_value = typeof '',
	typeof_obj_value = typeof {},
	typeof_fn_value = typeof function(){},
	typeof_undef_value = typeof undefined,
	get_primitive_type_fn = Object.prototype.toString,
	verify_own_property_fn = Object.prototype.hasOwnProperty,
	primitive_types_map = { 'undefined': 'Undefined', 'null': 'Null', 'function': 'Function', 'string': 'String', 'bigint': 'BigInt', 'symbol': 'Symbol', 'object': 'Object', 'boolean': 'Boolean' },
	// Check for setInterval once at startup for performance.
	setinterval_is_on = typeof setInterval === typeof_fn_value,
	predefined_subtypes = {
		'object-constructors': function(){ return { 'Object': function(input){ return get_primitive_type_fn.call(input).slice(8, -1); } } },
		'browser-dom': function(){
			if(!predefined_subtypes['browser-dom'].cache){
				predefined_subtypes['browser-dom'].cache = {
					'HTMLDocument': 'Document', 'HTMLCollection': 'Nodes', 'HTMLAllCollection': 'Nodes', 'NodeList': 'Nodes', 'HTMLHtmlElement': 'Node', 'HTMLHeadElement': 'Node', 'HTMLTitleElement': 'Node', 'HTMLBaseElement': 'Node', 'HTMLLinkElement': 'Node', 'HTMLMetaElement': 'Node', 'HTMLStyleElement': 'Node', 'HTMLScriptElement': 'Node', 'HTMLModElement': 'Node', 'HTMLBodyElement': 'Node', 'HTMLHeadingElement': 'Node', 'HTMLDivElement': 'Node', 'HTMLElement': 'Node', 'HTMLParagraphElement': 'Node', 'HTMLAnchorElement': 'Node', 'HTMLSpanElement': 'Node', 'HTMLBRElement': 'Node', 'HTMLHRElement': 'Node', 'HTMLPreElement': 'Node', 'HTMLQuoteElement': 'Node', 'HTMLOListElement': 'Node', 'HTMLUListElement': 'Node', 'HTMLLIElement': 'Node', 'HTMLDListElement': 'Node', 'HTMLMenuElement': 'Node', 'HTMLImageElement': 'Node', 'HTMLIFrameElement': 'Node', 'HTMLEmbedElement': 'Node', 'HTMLObjectElement': 'Node', 'HTMLParamElement': 'Node', 'HTMLVideoElement': 'Node', 'HTMLAudioElement': 'Node', 'HTMLSourceElement': 'Node', 'HTMLTrackElement': 'Node', 'HTMLCanvasElement': 'Node', 'HTMLMapElement': 'Node', 'HTMLAreaElement': 'Node', 'HTMLPictureElement': 'Node', 'HTMLTableElement': 'Node', 'HTMLTableCaptionElement': 'Node', 'HTMLTableColElement': 'Node', 'HTMLTableSectionElement': 'Node', 'HTMLTableRowElement': 'Node', 'HTMLTableCellElement': 'Node', 'HTMLFormElement': 'Node', 'HTMLLabelElement': 'Node', 'HTMLInputElement': 'Node', 'HTMLButtonElement': 'Node', 'HTMLSelectElement': 'Node', 'HTMLDataListElement': 'Node', 'HTMLOptGroupElement': 'Node', 'HTMLOptionElement': 'Node', 'HTMLTextAreaElement': 'Node', 'HTMLOutputElement': 'Node', 'HTMLProgressElement': 'Node', 'HTMLMeterElement': 'Node', 'HTMLFieldSetElement': 'Node', 'HTMLLegendElement': 'Node', 'HTMLKeygenElement': 'Node', 'HTMLDetailsElement': 'Node', 'HTMLDialogElement': 'Node', 'HTMLSummaryElement': 'Node', 'HTMLSlotElement': 'Node', 'HTMLTemplateElement': 'Node', 'HTMLMarqueeElement': 'Node', 'HTMLFrameSetElement': 'Node', 'HTMLFrameElement': 'Node', 'HTMLDirectoryElement': 'Node', 'HTMLFontElement': 'Node', 'SVGSVGElement': 'Node', 'SVGElement': 'Node', 'MathMLMathElement': 'Node', 'MathMLElement': 'Node', 'HTMLUnknownElement': 'Node', 'Text': 'Node', 'Comment': 'Node', 'DocumentFragment': 'Node', 'Attr': 'Node',
					// For any input identified as a 'Node', create a more specific hierarchical subtype.
					// e.g., A <div> element becomes 'Node.DIV'.
					'Node': function(input, subtype){ return subtype + '.' + input.tagName; },
					'Window': 'Browser', 'Navigator': 'Browser', 'Screen': 'Browser', 'Location': 'Browser', 'History': 'Browser',
				  	// Solution for some browser incompatibilities that return 'Function' instead of 'Object' for DOM nodes and collections.
					'Function': function(input){ return typeof input.nodeType === "number" || typeof input.item === "function" ? 'Object' : null; }
				};
			}
			return predefined_subtypes['browser-dom'].cache;
		}
	},
	incorrect_fns_and_subtypes_names = {
		// Object/Function prototype properties
		'hasOwnProperty': true, 'toString': true, 'valueOf': true, 'constructor': true, 'isPrototypeOf': true, 'propertyIsEnumerable': true, 'toLocaleString': true, 'name': true, 'arguments': true, 'caller': true, 'apply': true, 'bind': true, 'call': true, '__defineGetter__': true, '__defineSetter__': true, '__lookupGetter__': true, '__lookupSetter__': true, '__proto__': true, 'prototype': true, 'length': true,
		// JavaScript reserved keywords
		'await': true, 'break': true, 'case': true, 'catch': true, 'class': true, 'const': true, 'continue': true, 'debugger': true, 'default': true, 'delete': true, 'do': true, 'else': true, 'enum': true, 'export': true, 'extends': true, 'false': true, 'finally': true, 'for': true, 'function': true, 'if': true, 'implements': true, 'import': true, 'in': true, 'instanceof': true, 'interface': true, 'let': true, 'new': true, 'null': true, 'package': true, 'private': true, 'protected': true, 'public': true, 'return': true, 'static': true, 'super': true, 'switch': true, 'this': true, 'throw': true, 'true': true, 'try': true, 'typeof': true, 'var': true, 'void': true, 'while': true, 'with': true, 'yield': true,
		// Internal framework properties
		'fns': true, 'subtypes': true, 'fn': true, 'subtype': true, 'Default': true,
		// Special methods
		'toJSON': true
	};

	/**
	 * Centralized message handler. Prepends the instance name to messages.
	 * In browser-like environments, it queues identical warnings to prevent
	 * console flooding, delivering them periodically.
	 * @private
	 * @this {{name: string, messages?: object}} The context object, usually an Estructura instance.
	 * @param {'info'|'warn'|'error'} message_type The type of message to display.
	 * @param {string} message The message content.
	 */
	function message(message_type, message){
		deliver_message.call(this, message_type, 'Estructura (' + (this.name || 'Default') + '): ' + message);
	}

	/**
	 * Delivers a complete message: queued (browser-like environments) or straight to the console.
	 * @private
	 * @this {{name: string, messages?: object}}
	 */
	function deliver_message(message_type, message){
		if(typeof console !== typeof_undef_value && console[message_type]){
			if(this.messages && setinterval_is_on){
				this.messages[message] = message_type;
				return;
			}
			console[message_type](message);
		}
		else if(message_type === 'error'){ throw new Error(message); }
	}

	/**
	 * Reports a method name conflict. For a registered node (a record is given) the complete text is built once per node,
	 * name and collision mode, and the same string is delivered afterwards, so a conflict that repeats on every call costs
	 * a property read. For what a handler returns (the record is null) nothing is kept: its names are not bounded.
	 * @private
	 * @this EstructuraInstance
	 */
	function conflict_warning(record, fn_name, resolved_node_type, specific){
		var texts = null, text;
		if(record){
			texts = record.texts || (record.texts = { general: {}, specific: {} });
			texts = specific ? texts.specific : texts.general;
			text = texts[fn_name];
		}
		if(typeof text !== typeof_str_value){
			text = 'Estructura (' + (this.name || 'Default') + '): Conflict for "' + fn_name + '". A definition from type "' + resolved_node_type + '" ' + (specific
				? 'was ignored because a more specific definition with the same name already exists (collision: "specific"). This occurs when an input matches multiple types.'
				: 'is overwriting another same name method or handler. This occurs when an input matches multiple types.');
			if(texts){ texts[fn_name] = text; }
		}
		deliver_message.call(this, 'warn', text);
	}

	/**
	 * Reports that a subtype definition returned the name of a native member of the array of types. One text per
	 * definition and name, built once.
	 * @private
	 * @this EstructuraInstance
	 */
	function native_name_warning(subtype_definition, subtype_name){
		var texts = subtype_definition.native_texts || (subtype_definition.native_texts = {}), text = texts[subtype_name];
		if(typeof text !== typeof_str_value){
			text = texts[subtype_name] = 'Estructura (' + (this.name || 'Default') + '): Subtype name "' + subtype_name + '" cannot be used because it is a native property of the array of types. It was ignored.';
		}
		deliver_message.call(this, 'warn', text);
	}

	/**
	 * Handles an error thrown by a user-provided function (a method, a handler or a subtype definition).
	 * options.errors = 'console' (default): the error is reported through the message handler and the flow continues.
	 * options.errors = 'throw': the original error is rethrown, so it keeps its stack and its class.
	 * @private
	 * @this EstructuraInstance
	 * @param {*} error The value thrown by the user's function.
	 * @param {string} origin The description of the function that failed, for the message.
	 */
	function handle_user_error(error, origin){
		if(this.options.errors === 'throw'){ throw error; }
		message.call(this, 'error', origin + ' error: ' + String(error));
	}

	/**
	 * Checks if a property name is valid for registration.
	 * @private
	 * @this EstructuraInstance
	 * @param {object} object The object containing the property.
	 * @param {string} property The name of the property to check.
	 * @returns {boolean} Returns `true` if the name is valid.
	 */
	function is_correct_object_property_name(object, property){
		// Only the own entries of a definition are registered; what it inherits is skipped without a warning.
		if(!verify_own_property_fn.call(object, property)){ return false; }
		var object_type = raw_type(object);
		var it_is = true;

		if(object_type['Array'] && is_reserved_name(object[property])){
			property = object[property];
			it_is = false;
		}
		else if(object_type['Object'] && is_reserved_name(property)){ it_is = false; }

		if(!it_is){ message.call(this, 'warn', 'Name "' + property + '" is a reserved word and cannot be used.'); }

		return it_is;
	}

	/**
	 * Tells whether a name is reserved. The table is read through its own properties only.
	 * @private
	 */
	function is_reserved_name(name){
		return verify_own_property_fn.call(incorrect_fns_and_subtypes_names, name);
	}

	/**
	 * Detects the structural type of a value for the registrars (`fn` and `subtype`): its primitive type and,
	 * for objects, its constructor name (e.g., 'Array'). It returns the same shape as `type` (an array that also
	 * works as a map), but it never runs the subtype definitions of the instance, so registering has no side
	 * effects on them.
	 * @private
	 * @param {*} input The value to be type-checked.
	 * @returns {EstructuraTypeResult}
	 */
	function raw_type(input){
		var primitive_type = (input == null ? primitive_types_map[String(input)] : (primitive_types_map[typeof input] || 'Number'));
		var types = [primitive_type];
		types[primitive_type] = true;
		if(primitive_type === 'Object'){
			var constructor_name = get_primitive_type_fn.call(input).slice(8, -1);
			if(constructor_name !== primitive_type){
				types.push(constructor_name);
				types[constructor_name] = true;
			}
		}
		return types;
	}

	/**
	 * A simplified, ES3-compatible version of `Object.assign`.
	 * @private
	 * @param {object} destination_object The object to receive the properties.
	 * @param {object} source_object The object from which to copy properties.
	 */
	function simple_object_extend(destination_object, source_object){
		for(var field in source_object){
			if(!verify_own_property_fn.call(source_object, field)){ continue; }
			destination_object[field] = source_object[field];
		}
	}

	/**
	 * Returns the plan record of the child node reached with a type name, creating it if needed. The plan is a tree
	 * parallel to 'fns', built on demand, that keeps for every visited node the list of its method names (see plan_names).
	 * @private
	 */
	function plan_child(record, type_name){
		// Only own records count, so a function added to Object.prototype with a type name is never taken (nor written) as a record.
		return (verify_own_property_fn.call(record.kids, type_name) ? record.kids[type_name] : (record.kids[type_name] = { epoch: -1, node: null, names: null, sources: null, self: null, kids: {}, texts: null }));
	}

	/**
	 * Returns the names of the functions a registered node attaches as methods, in the order `for...in` gives them.
	 * The list is rebuilt only when the record is out of date: after a registration that writes into its node (see
	 * invalidate_records), after a change of options (the instance epoch changes) or when the node itself is another one
	 * (a registration made by a handler in the middle of a dispatch can replace a node that the dispatch still holds).
	 * It also keeps, by name, the user's function behind every copy (`record.sources`) and, for a handler node, the
	 * user's handler itself (`record.self`), so neither dispatching nor calling a method goes through the copies.
	 * @private
	 * @this EstructuraInstance
	 */
	function plan_names(record, node){
		if(record.epoch !== this.epoch || record.node !== node){
			var names = [], hidden_handlers = this.options.handlers === 'hidden', first_char;
			// The user's function behind every copy, by name: the wrapper of a method calls it directly.
			var sources = {};
			for(var fn_name in node){
				if(!verify_own_property_fn.call(node, fn_name) || typeof node[fn_name] !== typeof_fn_value){ continue; }
				if(hidden_handlers && (first_char = fn_name.charAt(0)) !== first_char.toLowerCase()){ continue; }
				names.push(fn_name);
				sources[fn_name] = copy_source(node[fn_name]);
			}
			record.names = names;
			record.sources = sources;
			record.self = (typeof node === typeof_fn_value ? copy_source(node) : null);
			record.node = node;
			record.epoch = this.epoch;
		}
		return record.names;
	}

	/**
	 * Private `this` that makes a copy return the user's function behind it instead of calling it. No user code can
	 * reach this object, so a call made by the user can never take that path.
	 * @private
	 */
	var copy_token = {};

	/**
	 * Returns the user's function behind a copy placed by merge_type_fns_node, in constant time. Every function in the
	 * 'fns' tree is such a copy: merge_type_fns_node is the only place that writes a function into the tree.
	 * Only used when registering and when a plan record is rebuilt, never on a dispatch with an up-to-date plan.
	 * @private
	 */
	function copy_source(copy){
		return copy.call(copy_token);
	}

	/**
	 * Marks for rebuilding the plan records that a registration changes: the record of the node it writes into (its
	 * method names change) and the record of the child it writes (that node may have become a handler). A record that
	 * does not exist yet is created up to date on the next dispatch.
	 * @private
	 */
	function invalidate_records(record, type_name){
		if(!record){ return; }
		record.epoch = -1;
		if(verify_own_property_fn.call(record.kids, type_name)){ record.kids[type_name].epoch = -1; }
	}

	/**
	 * Attaches methods from a resolved node to the result object. Executes hybrid node functions called 'handlers'.
	 * @private
	 * @this EstructuraInstance
	 * @param {object} result_object The object to which methods will be attached.
	 * @param {object|Function} resolved_node The final function-node from the 'fns' tree.
	 * @param {string} resolved_node_type The type string that led to this node.
	 * @param {IArguments} main_fn_args The original arguments from the main dispatcher call.
	 * @param {boolean} should_return_result If true, the function returns the result object.
	 * @param {object} record The plan record of the node (see plan_child).
	 * @param {boolean} may_collide False only when nothing has been attached to the result yet, so no name can collide.
	 * @returns {object|null}
	 */
	function attach_resolved_methods(result_object, resolved_node, resolved_node_type, main_fn_args, should_return_result, record, may_collide){
		var actual_fns = resolved_node, specific = this.options.collision === 'specific', fn_name;
		if(typeof actual_fns === typeof_fn_value){
			// A handler receives the result object as `this`, so it can add properties to it.
			may_collide = true;
			try {
				// A hybrid node called 'handler' can return a new object (or function) of functions to use.
				// If it returns anything else (a falsy value, a string, `true`, a number...), we keep the original node.
				// The node is a copy of the user's function: the plan gives that function, which is called directly.
				plan_names.call(this, record, actual_fns);
				var returned_fns = record.self.apply(result_object, main_fn_args);
				if(typeof returned_fns === typeof_fn_value || (returned_fns && typeof returned_fns === typeof_obj_value)){ actual_fns = returned_fns; }
			}
			catch(error){ handle_user_error.call(this, error, 'Type handler function "' + resolved_node_type + '"'); }
		}
		// If it is a string, the function stops to protect against string iteration. Another data types don't cause issues, including falsy values.
		if(typeof actual_fns === typeof_str_value){ return (should_return_result ? result_object : null); }
		// options.handlers = 'hidden' (default): a name starting with an uppercase letter is a type name, so its function is only a handler
		// (it runs when its type matches) and it is never attached as a method. 'exposed': it is also attached, as before v1.23.0.
		// The nodes are processed from the most specific type to the most general one (inverted iteration order in main_dispatcher,
		// while(type_iterator--)), and the root ('Any') node is processed last.
		// options.collision = 'general' (default): the last processed definition overwrites, so the most general type prevails.
		// options.collision = 'specific': the first processed definition is kept, so the most specific type prevails.
		if(actual_fns === resolved_node){
			// A registered node: its method names come from the plan, so nothing is enumerated or filtered here.
			var names = plan_names.call(this, record, actual_fns), names_length = names.length;
			// `may_collide` is false only for the first node attached to a result that no handler has touched: that result is
			// still empty, so reading it to look for a name conflict is skipped. A conflict is an own property of the result:
			// what a plain object inherits (e.g., a function added to Object.prototype) never collides.
			for(var names_iterator = 0; names_iterator < names_length; names_iterator++){
				fn_name = names[names_iterator];
				if(may_collide && result_object[fn_name] && verify_own_property_fn.call(result_object, fn_name)){
					if(specific){
						conflict_warning.call(this, record, fn_name, resolved_node_type, true);
						continue;
					}
					conflict_warning.call(this, record, fn_name, resolved_node_type, false);
				}
				// record.sources maps each name to the user's function behind its copy, so the call skips the copy.
				result_object[fn_name] = adjust_method(this, fn_name, record.sources, main_fn_args);
			}
			return (should_return_result ? result_object : null);
		}
		// What a handler returned is not registered, so it is enumerated on every call, as before.
		var hidden_handlers = this.options.handlers === 'hidden', first_char;
		for(fn_name in actual_fns){
			if(!verify_own_property_fn.call(actual_fns, fn_name) || typeof actual_fns[fn_name] !== typeof_fn_value){ continue; }
			if(hidden_handlers && (first_char = fn_name.charAt(0)) !== first_char.toLowerCase()){ continue; }
			if(result_object[fn_name] && verify_own_property_fn.call(result_object, fn_name)){
				// Its names are not bounded, so the texts of its conflicts are not kept (no record is given).
				if(specific){
					conflict_warning.call(this, null, fn_name, resolved_node_type, true);
					continue;
				}
				conflict_warning.call(this, null, fn_name, resolved_node_type, false);
			}
			result_object[fn_name] = adjust_method(this, fn_name, actual_fns, main_fn_args);
		}
		return (should_return_result ? result_object : null);
	};

	/**
	 * Creates a wrapper for a user-defined method to provide a consistent argument structure and error handling.
	 * @private
	 * @param {EstructuraInstance} instance_context The current Estructura instance for error logging.
	 * @param {string} method_name The name of the method for error logging.
	 * @param {object} methods The object containing the method function.
	 * @param {IArguments} main_fn_args The original arguments from the main dispatcher call.
	 * @returns {Function} The wrapped method.
	 */
	function adjust_method(instance_context, method_name, methods, main_fn_args){
		// This factory is for compatibility with arrow functions and to provide a unified calling interface.
		// Each argument style has its own wrapper, so a wrapper only carries the code of its style.
		if(instance_context.options.args === 'spread'){
			// options.args = 'spread': the dispatcher arguments are passed one by one, and the method call arguments go together in an array as the last argument.
			// e.g., _e(a, b).method(c, d) -> user's method receives (a, b, [c, d])
			return function(){
				var dispatcher_length = main_fn_args.length, method_args;
				if(dispatcher_length === 1){ method_args = [main_fn_args[0], Array.prototype.slice.call(arguments)]; }
				else if(dispatcher_length === 2){ method_args = [main_fn_args[0], main_fn_args[1], Array.prototype.slice.call(arguments)]; }
				else {
					method_args = Array.prototype.slice.call(main_fn_args);
					method_args.push(Array.prototype.slice.call(arguments));
				}
				try { return methods[method_name].apply(this, method_args); }
				catch(error){ handle_user_error.call(instance_context, error, 'Method "' + method_name + '"'); }
				return this;
			};
		}
		// options.args = 'array' (default): the dispatcher arguments are passed as an array, becoming the first argument for the user's method.
		// e.g., _e(a, b).method(c) -> user's method receives ([a, b], c)
		return function(){
			var args_length = arguments.length, dispatcher_args = Array.prototype.slice.call(main_fn_args), method_args;
			// The usual calls build the array of arguments with its final size.
			if(args_length === 0){ method_args = [dispatcher_args]; }
			else if(args_length === 1){ method_args = [dispatcher_args, arguments[0]]; }
			else if(args_length === 2){ method_args = [dispatcher_args, arguments[0], arguments[1]]; }
			else {
				method_args = [dispatcher_args];
				for(var i = 0; i < args_length; i++){ method_args.push(arguments[i]); }
			}
			try { return methods[method_name].apply(this, method_args); }
			catch(error){ handle_user_error.call(instance_context, error, 'Method "' + method_name + '"'); }
			return this;
		};
	}

	/**
	 * Safely executes a user-provided subtype definition function.
	 * @private
	 * @this EstructuraInstance
	 * @param {string} subtype_name The name of the subtype for error reporting.
	 * @param {Function} subtype_definition_fn The user's subtype function.
	 * @param {*} input The input value passed to the function.
	 * @param {string} primitive_type The base primitive type of the input.
	 * @param {object} matched_subtypes The map of already detected subtypes.
	 * @returns {*|false} The result of the subtype function, or `false` if an error occurs.
	 */
	function subtype_definition_execution(subtype_name, subtype_definition_fn, input, primitive_type, matched_subtypes){
		try { return subtype_definition_fn(input, primitive_type, function(){ var types_copy = []; simple_object_extend(types_copy, matched_subtypes); return types_copy; }); }
		catch(error){ handle_user_error.call(this, error, 'Subtype definition "' + subtype_name + '" function'); }
		return false;
	}

	/**
	 * Resolves the definition of the 'object-constructors' set that every instance registers for itself.
	 * It reports an error exactly as a user-provided definition would (e.g., a revoked Proxy).
	 * @private
	 * @this EstructuraInstance
	 */
	function builtin_constructor_name(input){
		try { return get_primitive_type_fn.call(input).slice(8, -1); }
		catch(error){ handle_user_error.call(this, error, 'Subtype definition "Object" function'); }
		return false;
	}

	/**
	 * Recursively discovers all applicable subtypes for a given input.
	 * @private
	 * @this EstructuraInstance
	 * @param {*} input The value being analyzed.
	 * @param {string[]|object} matched_subtypes The accumulating list of detected types. It starts with the base primitive type.
	 * @returns {string[]} The final list of all detected types.
	 */
	function subtypes_recognition(input, matched_subtypes){
		// The last-added type is the one we are expanding now.
		var primitive_type = matched_subtypes[matched_subtypes.length - 1];
		var subtypes = this.subtypes[primitive_type];
		var iterator = subtypes.length, subtype_found, subtype_definition;
		while(iterator--){
			subtype_definition = subtypes[iterator];
			if(subtype_found = (subtype_definition.value || (subtype_definition.builtin ? builtin_constructor_name.call(this, input) : subtype_definition_execution.call(this, subtype_definition.name, subtype_definition.fn, input, primitive_type, matched_subtypes)))){
				if(typeof subtype_found !== typeof_str_value){
					// The text of this warning only depends on the definition, so it is built once and kept in it.
					if(subtype_found !== true){ deliver_message.call(this, 'warn', subtype_definition.invalid_text || (subtype_definition.invalid_text = 'Estructura (' + (this.name || 'Default') + '): Subtype definition "' + subtype_definition.name + '" should return a string or `true`. The definition name was used as the subtype name.')); }
					subtype_found = subtype_definition.name;
				}
				if(!matched_subtypes[subtype_found]){
					matched_subtypes.push(subtype_found);
					matched_subtypes[subtype_found] = true;
					// If the newly found subtype has its own children, recurse.
					if(this.subtypes[subtype_found]){
						subtypes_recognition.call(this, input, matched_subtypes);
					}
				}
				// A detected type is flagged with an own `true`. Any other value is a native member of the array of types
				// (e.g., 'map', 'length' or an index), so that name cannot be used for a subtype.
				else if(matched_subtypes[subtype_found] !== true){ native_name_warning.call(this, subtype_definition, subtype_found); }
			}
		}
		return matched_subtypes;
	};

	/**
	 * The core type detection engine for an instance. It analyzes an input and returns
	 * an array of all its detected types, from the most general to the most specific.
	 * @private
	 * @this EstructuraInstance
	 * @param {*} input The value to be type-checked.
	 * @returns {EstructuraTypeResult}
	 */
	function type(input){
		// Get base primitive type using a map for performance. Special case for NaN.
		var primitive_type = [(input == null ? primitive_types_map[String(input)] : (primitive_types_map[typeof input] || (isNaN(input) ? 'NaN' : 'Number')))];
		// Also use the type array as a hash map for O(1) lookups.
		primitive_type[primitive_type[0]] = true;
		// If there are registered subtypes for this primitive, start the recognition process.
		return (!this.subtypes[primitive_type[0]] ? primitive_type : subtypes_recognition.call(this, input, primitive_type));
	};


	/**
	 * Places a function node in the dispatch tree. If the previous node is a plain object, its properties are
	 * merged onto the new function, converting it to a hybrid function-object called 'handler'.
	 * If a function is already registered there, it is kept (the first registered one prevails) and the new
	 * one is ignored with a warning.
	 * @private
	 * @this EstructuraInstance
	 * @param {object} target_object The parent object containing the node (the instance itself for the root 'fns' registry).
	 * @param {string} property_name The key of the node.
	 * @param {function} new_function The function to place as the node.
	 */
	function merge_type_fns_node(target_object, property_name, new_function){
		// Only an own node counts: a function inherited by the tree (e.g., from Object.prototype) is not registered.
		var existent_node = (verify_own_property_fn.call(target_object, property_name) ? target_object[property_name] : undefined);
		if(typeof existent_node === typeof_fn_value){
			// Registering the same function again is harmless, so it does not warn. The node is a copy: compare its source.
			if(copy_source(existent_node) !== new_function){ message.call(this, 'warn', 'A method or handler is already registered for "' + (target_object === this ? 'Any' : property_name) + '", so the new one was ignored. The first registered function is kept.'); }
			return;
		}
		// The copy calls the user's function with the same `this` and arguments and returns what it returns; called with
		// the private copy_token as `this`, it returns that function instead (see copy_source). The own properties of the
		// user's function are not copied; the methods of a previous object node are merged into the copy.
		var copy = function(){ return (this === copy_token ? new_function : new_function.apply(this, arguments)); };
		simple_object_extend(copy, existent_node);
		target_object[property_name] = copy;
	}

	/**
	 * Registers functions into the 'fns' dispatch tree for an instance.
	 * @private
	 * @this EstructuraInstance
	 * @param {object|function} new_type_fns An object representing the function tree to merge, or a single function to act as a node.
	 * @param {object} [existent_type_fns] Internal use for recursion.
	 * @param {object|null} [record] Internal use for recursion: the plan record of `existent_type_fns`, if a dispatch has created it.
	 * @returns {undefined}
	 */
	function fn(new_type_fns, existent_type_fns, record){
		if(typeof new_type_fns === typeof_fn_value){
			merge_type_fns_node.call(this, this, 'fns', new_type_fns);
			// The root may have become a handler: its plan record is rebuilt on the next dispatch.
			this.plan.epoch = -1;
			return;
		}
		existent_type_fns = existent_type_fns || this.fns;
		// The plan record of the node being written: the root's on the first level, null where no dispatch has reached yet.
		if(record === undefined){ record = this.plan; }
		for(var type_name in new_type_fns){
			if(!is_correct_object_property_name.call(this, new_type_fns, type_name)){ continue; }
			var new_field = new_type_fns[type_name];
			var new_field_type = raw_type(new_field);
			switch(new_field_type[0]){
				case 'Function':
					merge_type_fns_node.call(this, existent_type_fns, type_name, new_field);
					invalidate_records(record, type_name);
				break;
				case 'Object':
					var existent_field_type = raw_type(verify_own_property_fn.call(existent_type_fns, type_name) ? existent_type_fns[type_name] : undefined);
					if(!existent_field_type['Object'] && !existent_field_type['Function']){
						existent_type_fns[type_name] = {};
					}
					fn.call(this, new_field, existent_type_fns[type_name], (record && verify_own_property_fn.call(record.kids, type_name) ? record.kids[type_name] : null));
				break;
				default: message.call(this, 'warn', 'Invalid definition for "fn.' + type_name + '". Only Function or Object are allowed.');
			}
		}
	};

	/**
	 * Registers subtype definitions for an instance.
	 * @private
	 * @this EstructuraInstance
	 * @param {object|string} subtype_definitions An object with definitions or a predefined set name.
	 * @param {Array} [parent_subtype] Internal use for recursion.
	 * @param {boolean} [should_not_create_nested_definitions] If true, prevents registering functions or values during structural initialization of nested subtypes.
	 * @returns {undefined}
	 */
	function subtype(subtype_definitions, parent_subtype, should_not_create_nested_definitions){
		// A string is the name of a predefined set of subtypes.
		if(typeof subtype_definitions === typeof_str_value){
			if(!verify_own_property_fn.call(predefined_subtypes, subtype_definitions)){
				message.call(this, 'warn', 'Unknown predefined set of subtypes "' + subtype_definitions + '". Nothing was registered.');
				return;
			}
			return subtype.call(this, predefined_subtypes[subtype_definitions](), parent_subtype);
		}
		var current_subtypes = parent_subtype || this.subtypes;
		for(var definition_name in subtype_definitions){
			if(!is_correct_object_property_name.call(this, subtype_definitions, definition_name)){ continue; }
			var subtype_definition_type = raw_type(subtype_definitions[definition_name]);
			var existent_definition_type = raw_type(current_subtypes[definition_name]);
			if(!parent_subtype && !existent_definition_type['Array']){ current_subtypes[definition_name] = []; }
			var existent_subtypes_reference = (!parent_subtype ? current_subtypes[definition_name] : current_subtypes);
			switch(subtype_definition_type[0]){
				case 'Object':
					// Put subtype definitions in the first level of definitions to create container for another subtypes.
					subtype.call(this, subtype_definitions[definition_name], null, true);
					// This puts subtype definitions into the subtype definition that is infered from.
					subtype.call(this, subtype_definitions[definition_name], current_subtypes[definition_name]);
				break;
				case 'Function':
					if(!should_not_create_nested_definitions){
						existent_subtypes_reference.push({ name: definition_name, fn: subtype_definitions[definition_name] });
					}
				break;
				case 'Array': case 'String':
					var inline_subtype_definitions = typeof subtype_definitions[definition_name] === typeof_str_value ? [subtype_definitions[definition_name]] : subtype_definitions[definition_name];
					var inline_subtype_definitions_iterator = inline_subtype_definitions.length;
					while(inline_subtype_definitions_iterator--){
						if(!inline_subtype_definitions[inline_subtype_definitions_iterator] || typeof inline_subtype_definitions[inline_subtype_definitions_iterator] !== typeof_str_value){
							message.call(this, 'warn', 'Subtype definition "' + definition_name + '" contains an invalid value which has been ignored.');
							continue;
						}
						if(!is_correct_object_property_name.call(this, inline_subtype_definitions, inline_subtype_definitions_iterator)){ continue; }
						if(!should_not_create_nested_definitions){
							existent_subtypes_reference.push({ name: definition_name, value: inline_subtype_definitions[inline_subtype_definitions_iterator] });
						}
					}
				break;
				default: message.call(this, 'warn', 'Invalid definition for "subtype.' + definition_name + '". Only Object, Function, Array, or String are allowed.');
			}
		}
	};

	/**
	 * The main dispatcher function of an instance. It resolves and executes functions based on argument types.
	 * This optimized version delays method attachment until the final argument is processed.
	 * @private
	 * @this EstructuraInstance
	 * @param {...*} args - The sequence of arguments to be dispatched.
	 * @returns {object} A new wrapper object with the resolved methods.
	 */
	function main_dispatcher(){
		var args_length = arguments.length, deep_length = args_length - 1, result_object = {}, attached = false;
		var arg_types, type_iterator, type_name, current_node_fns;
		// The dispatching algorithm works by iteratively filtering a list of possible function nodes. It walks down the 'fns' tree,
		// collecting potential next-level nodes (with their plan records) at each step. `attached` tells whether a node has already
		// been attached to the result, so attach_resolved_methods knows when a name can collide.
		if(args_length){
			// First argument: its only candidate is the root, so no array of candidates is needed for it.
			var root_node = this.fns, root_record = this.plan;
			arg_types = type.call(this, arguments[0]);
			type_iterator = arg_types.length;
			if(deep_length === 0){
				// A call with one argument attaches the resolved nodes directly and creates no array at all.
				while(type_iterator--){
					type_name = arg_types[type_iterator];
					// Only an own child is a node: what a node inherits (e.g., a function added to Object.prototype) is never taken as a type.
					// The check goes first because reading some inherited names from a function node throws (e.g., 'caller' or 'arguments').
					if(verify_own_property_fn.call(root_node, type_name) && (current_node_fns = root_node[type_name])){
						attach_resolved_methods.call(this, result_object, current_node_fns, type_name, arguments, false, plan_child(root_record, type_name), attached);
						attached = true;
					}
				}
			}
			else {
				var types_start = [], records_start = [];
				while(type_iterator--){
					type_name = arg_types[type_iterator];
					if(verify_own_property_fn.call(root_node, type_name) && (current_node_fns = root_node[type_name])){ types_start.push(current_node_fns); records_start.push(plan_child(root_record, type_name)); }
				}
				// options.collision = 'specific': the candidate nodes are walked most specific first at every argument level, so the nodes are attached
				// in lexicographic order of specificity (the first argument is the most significant) and the first attached definition prevails.
				// Otherwise the legacy walk order is kept, so the behavior of 'general' (default) is the same as in previous versions.
				var specific_first = this.options.collision === 'specific';
				for(var args_iterator = 1; args_iterator < args_length; args_iterator++){
					// If no potential paths remain, break early.
					if(!types_start.length){ break; }
					var is_last = (args_iterator === deep_length);
					var found_object = [], found_records = [];
					var parents_length = types_start.length, parents_iterator = parents_length, result_iterator, parent_node, parent_record;
					arg_types = type.call(this, arguments[args_iterator]);
					while(parents_iterator--){
						result_iterator = (specific_first ? parents_length - 1 - parents_iterator : parents_iterator);
						parent_node = types_start[result_iterator];
						parent_record = records_start[result_iterator];
						type_iterator = arg_types.length;
						while(type_iterator--){
							type_name = arg_types[type_iterator];
							if(verify_own_property_fn.call(parent_node, type_name) && (current_node_fns = parent_node[type_name])){
								// Only the final set of resolved nodes gets its methods attached; for intermediate arguments the next possible nodes are collected.
								if(is_last){ attach_resolved_methods.call(this, result_object, current_node_fns, type_name, arguments, false, plan_child(parent_record, type_name), attached); attached = true; }
								else { found_object.push(current_node_fns); found_records.push(plan_child(parent_record, type_name)); }
							}
						}
					}
					types_start = found_object;
					records_start = found_records;
				}
			}
		}
		// Finally, attach methods from the root 'this.fns' (the 'Any' type).
		return attach_resolved_methods.call(this, result_object, this.fns, 'Any', arguments, true, this.plan, attached);
	};

	/**
	 * Valid values for each instance option. The first value of each list is the default one.
	 * - collision: 'general' (the most general type prevails on method name collisions) | 'specific' (the most specific type prevails).
	 * - args: 'array' (methods receive `([dispatcher args], ...method args)`) | 'spread' (methods receive `(...dispatcher args, [method args])`).
	 * - handlers: 'hidden' (names starting with an uppercase letter are type names: their functions are only handlers) | 'exposed' (a function assigned to a type name is also attached as a method, as before v1.23.0).
	 * - errors: 'console' (errors thrown by methods, handlers and subtype definitions are reported through the console and the flow continues) | 'throw' (the original error is rethrown).
	 * @private
	 */
	var valid_options = { 'collision': ['general', 'specific'], 'args': ['array', 'spread'], 'handlers': ['hidden', 'exposed'], 'errors': ['console', 'throw'] };

	/**
	 * Validates and applies options to an instance. Invalid options are ignored with a warning.
	 * @private
	 * @this EstructuraInstance
	 * @param {object} options The options to apply.
	 */
	function configure(options){
		if(options === undefined){ return; }
		if(get_primitive_type_fn.call(options) !== '[object Object]'){ message.call(this, 'warn', 'Options must be an object. The given value was ignored.'); return; }
		for(var option_name in options){
			if(!verify_own_property_fn.call(options, option_name)){ continue; }
			if(!verify_own_property_fn.call(valid_options, option_name)){ message.call(this, 'warn', 'Unknown option "' + option_name + '" ignored.'); continue; }
			var accepted_values = valid_options[option_name], value = options[option_name], is_valid = false;
			for(var i = 0; i < accepted_values.length; i++){ if(accepted_values[i] === value){ is_valid = true; break; } }
			if(!is_valid){ message.call(this, 'warn', 'Invalid value for option "' + option_name + '". Accepted values: "' + accepted_values.join('", "') + '". The current value "' + this.options[option_name] + '" was kept.'); continue; }
			this.options[option_name] = value;
			this.epoch++;
		}
	}

	/**
	 * Creates a sandboxed instance of Estructura.
	 * @private
	 * @param {string} name The name for the new instance.
	 * @param {object} [options] Initial options for the instance.
	 * @returns {EstructuraPublicInterface} A new, isolated Estructura instance.
	 */
	function create_instance(name, options){
		messages[name] = {};
		/** @type {EstructuraInstance} */
		var instance = { name: name, messages: messages[name], fns: {}, subtypes: {}, options: {}, epoch: 0, plan: { epoch: -1, node: null, names: null, sources: null, self: null, kids: {}, texts: null } };
		// Every option starts with its default value: the first one of its list of valid values.
		for(var option_name in valid_options){
			if(verify_own_property_fn.call(valid_options, option_name)){ instance.options[option_name] = valid_options[option_name][0]; }
		}
		configure.call(instance, options);
		/** @type {EstructuraPublicInterface} */
		var public_interface = function(){ return main_dispatcher.apply(instance, arguments); };
		public_interface.type = function(input){ return type.call(instance, input); };
		// The registrars return the public interface so the calls can be chained.
		public_interface.fn = function(new_fns){ fn.call(instance, new_fns); return public_interface; };
		public_interface.subtype = function(new_subtypes){ subtype.call(instance, new_subtypes); return public_interface; };
		// Without arguments returns a copy of the current options, otherwise validates and applies the given ones.
		public_interface.config = function(new_options){
			if(arguments.length === 0){ var options_copy = {}; simple_object_extend(options_copy, instance.options); return options_copy; }
			configure.call(instance, new_options);
			return public_interface;
		};
		public_interface.instance = function(name, options){ return get_instance(name, options); };
		subtype.call(instance, 'object-constructors');
		instance.subtypes['Object'][0].builtin = true;
		return public_interface;
	}

	/**
	 * Retrieves or creates a named, sandboxed instance of Estructura.
	 * @private
	 * @param {string} name The name of the instance.
	 * @param {object} [options] Options applied only when the instance is created. To change them later use `config`.
	 * @returns {EstructuraPublicInterface|undefined} The requested instance.
	 */
	function get_instance(name, options){
		if(typeof name !== typeof_str_value){ return; }
		if(is_reserved_name(name)){
			 message.call({ name: name }, 'error', 'Name "' + name + '" is a reserved word. Using default instance instead.');
			 return get_instance('');
		}
		if(!verify_own_property_fn.call(instances, name)){ instances[name] = create_instance(name, options); }
		else if(options !== undefined){ message.call({ name: name, messages: messages[name] }, 'warn', 'The instance already exists, so the options passed to "instance" were ignored. Use "config" to change them.'); }
		return instances[name];
	}

	// Periodically dispatch all queued info, warn, and error messages.
	if(setinterval_is_on){
		var interval = setInterval(function(){
			for(var instance_name in messages){
				if(!verify_own_property_fn.call(messages, instance_name)){ continue; }
				for(var message_content in messages[instance_name]){
					if(verify_own_property_fn.call(messages[instance_name], message_content)){
						console[messages[instance_name][message_content]](message_content);
						delete messages[instance_name][message_content];
					}
				}
			}
    }, 1000);
		if(interval.unref){
			interval.unref();
		}
	}

	/** @type {EstructuraPublicInterface} */
	var _e = get_instance('');
	return _e;
}));
