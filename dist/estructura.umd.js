/**
 * Estructura v1.22.0
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
		message = 'Estructura (' + (this.name || 'Default') + '): ' + message;
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
		var object_type = raw_type(object);
		var it_is = true;

		if(object_type['Array'] && incorrect_fns_and_subtypes_names[object[property]]){
			property = object[property];
			it_is = false;
		}
		else if(object_type['Object'] && (!verify_own_property_fn.call(object, property) || incorrect_fns_and_subtypes_names[property])){ it_is = false; }

		if(!it_is){ message.call(this, 'warn', 'Name "' + property + '" is a reserved word and cannot be used.'); }

		return it_is;
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
	 * Attaches methods from a resolved node to the result object. Executes hybrid node functions called 'handlers'.
	 * @private
	 * @this EstructuraInstance
	 * @param {object} result_object The object to which methods will be attached.
	 * @param {object|Function} resolved_node The final function-node from the 'fns' tree.
	 * @param {string} resolved_node_type The type string that led to this node.
	 * @param {IArguments} main_fn_args The original arguments from the main dispatcher call.
	 * @param {boolean} [should_return_result] If true, ensures the function returns the result object.
	 * @returns {object|null}
	 */
	function attach_resolved_methods(result_object, resolved_node, resolved_node_type, main_fn_args, should_return_result){
		var actual_fns = resolved_node;
		if(typeof actual_fns === typeof_fn_value){
			try {
				// A hybrid node called 'handler' can return a new object (or function) of functions to use.
				// If it returns anything else (a falsy value, a string, `true`, a number...), we keep the original node.
				var returned_fns = actual_fns.apply(result_object, main_fn_args);
				if(typeof returned_fns === typeof_fn_value || (returned_fns && typeof returned_fns === typeof_obj_value)){ actual_fns = returned_fns; }
			}
			catch(error){ handle_user_error.call(this, error, 'Type handler function "' + resolved_node_type + '"'); }
		}
		// If it is a string, the function stops to protect against string iteration. Another data types don't cause issues, including falsy values.
		if(typeof actual_fns === typeof_str_value){ return (should_return_result ? result_object : null); }
		// options.handlers = 'exposed' (default): a function assigned to a type name is also attached as a method, as in previous versions.
		// options.handlers = 'hidden': a name starting with an uppercase letter is a type name, so its function is only a handler
		// (it runs when its type matches) and it is never attached as a method.
		var hidden_handlers = this.options.handlers === 'hidden', first_char;
		for(var fn_name in actual_fns){
			if(!verify_own_property_fn.call(actual_fns, fn_name) || typeof actual_fns[fn_name] !== typeof_fn_value){ continue; }
			if(hidden_handlers && (first_char = fn_name.charAt(0)) !== first_char.toLowerCase()){ continue; }
			// The nodes are processed from the most specific type to the most general one (inverted iteration order in main_dispatcher,
			// while(type_iterator--)), and the root ('Any') node is processed last.
			// options.collision = 'general' (default): the last processed definition overwrites, so the most general type prevails.
			// options.collision = 'specific': the first processed definition is kept, so the most specific type prevails.
			if(result_object[fn_name]){
				if(this.options.collision === 'specific'){
					message.call(this, 'warn', 'Conflict for "' + fn_name + '". A definition from type "' + resolved_node_type + '" was ignored because a more specific definition with the same name already exists (collision: "specific"). This occurs when an input matches multiple types.');
					continue;
				}
				message.call(this, 'warn', 'Conflict for "' + fn_name + '". A definition from type "' + resolved_node_type + '" is overwriting another same name method or handler. This occurs when an input matches multiple types.');
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
		var spread_args = instance_context.options.args === 'spread';
		return function(){
			var method_args;
			if(spread_args){
				// options.args = 'spread': the dispatcher arguments are passed one by one, and the method call arguments go together in an array as the last argument.
				// e.g., _e(a, b).method(c, d) -> user's method receives (a, b, [c, d])
				method_args = Array.prototype.slice.call(main_fn_args);
				method_args.push(Array.prototype.slice.call(arguments));
			}
			else {
				// options.args = 'array' (default): the dispatcher arguments are passed as an array, becoming the first argument for the user's method.
				// e.g., _e(a, b).method(c) -> user's method receives ([a, b], c)
				method_args = [Array.prototype.slice.call(main_fn_args)];
				for(var i = 0; i < arguments.length; i++){ method_args.push(arguments[i]); }
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
			if(subtype_found = (subtype_definition.value || subtype_definition_execution.call(this, subtype_definition.name, subtype_definition.fn, input, primitive_type, matched_subtypes))){
				if(typeof subtype_found !== typeof_str_value){
					if(subtype_found !== true){ message.call(this, 'warn', 'Subtype definition "' + subtype_definition.name + '" should return a string or `true`. The definition name was used as the subtype name.'); }
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
				else if(matched_subtypes[subtype_found] !== true){ message.call(this, 'warn', 'Subtype name "' + subtype_found + '" cannot be used because it is a native property of the array of types. It was ignored.'); }
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
		var existent_node = target_object[property_name];
		if(typeof existent_node === typeof_fn_value){
			// Registering the same function again is harmless, so it does not warn.
			if(existent_node !== new_function){ message.call(this, 'warn', 'A method or handler is already registered for "' + (target_object === this ? 'Any' : property_name) + '", so the new one was ignored. The first registered function is kept.'); }
			return;
		}
		// Note: The extend operation is safe; it will do nothing if there is no previous node.
		simple_object_extend(new_function, existent_node);
		target_object[property_name] = new_function;
	}


	/**
	 * Registers functions into the 'fns' dispatch tree for an instance.
	 * @private
	 * @this EstructuraInstance
	 * @param {object|function} new_type_fns An object representing the function tree to merge, or a single function to act as a node.
	 * @param {object} [existent_type_fns] Internal use for recursion.
	 * @returns {undefined}
	 */
	function fn(new_type_fns, existent_type_fns){
		if(typeof new_type_fns === typeof_fn_value){
			merge_type_fns_node.call(this, this, 'fns', new_type_fns);
			return;
		}
		existent_type_fns = existent_type_fns || this.fns;
		for(var type_name in new_type_fns){
			if(!is_correct_object_property_name.call(this, new_type_fns, type_name)){ continue; }
			var new_field = new_type_fns[type_name];
			var new_field_type = raw_type(new_field);
			switch(new_field_type[0]){
				case 'Function':
					merge_type_fns_node.call(this, existent_type_fns, type_name, new_field);
				break;
				case 'Object':
					var existent_field_type = raw_type(existent_type_fns[type_name]);
					if(!existent_field_type['Object'] && !existent_field_type['Function']){
						existent_type_fns[type_name] = {};
					}
					fn.call(this, new_field, existent_type_fns[type_name]);
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
		var deep_length = arguments.length - 1, types_start = [this.fns], result_object = {};
		// options.collision = 'specific': the candidate nodes are walked most specific first at every argument level, so the nodes are attached
		// in lexicographic order of specificity (the first argument is the most significant) and the first attached definition prevails.
		// Otherwise the legacy walk order is kept, so the behavior of 'general' (default) is the same as in previous versions.
		var specific_first = this.options.collision === 'specific';

		// The dispatching algorithm works by iteratively filtering a list of possible function nodes.
		// It walks down the 'fns' tree, collecting potential next-level nodes at each step.
		for(var args_iterator = 0; args_iterator < arguments.length; args_iterator++){
			// If no potential paths remain, break early.
			if(!types_start.length){ break; }
			var found_object = [];
			var parents_length = types_start.length;
			var parents_iterator = parents_length;
			var result_iterator;
			var arg_types_iterator = type.call(this, arguments[args_iterator]);
			var type_iterator;
			while(parents_iterator--){
				result_iterator = (specific_first ? parents_length - 1 - parents_iterator : parents_iterator);
				type_iterator = arg_types_iterator.length;
				while(type_iterator--){
					var current_node_fns = types_start[result_iterator];
					if(current_node_fns && (current_node_fns = current_node_fns[arg_types_iterator[type_iterator]])){
						// Optimization: Only attach methods for the final set of resolved nodes.
						// For intermediate arguments, just collect the next possible nodes.
						if(args_iterator !== deep_length){ found_object.push(current_node_fns); }
						else { attach_resolved_methods.call(this, result_object, current_node_fns, arg_types_iterator[type_iterator], arguments); }
					}
				}
			}
			types_start = found_object;
		}
		// Finally, attach methods from the root 'this.fns' (the 'Any' type).
		return attach_resolved_methods.call(this, result_object, this.fns, 'Any', arguments, true);
	};

	/**
	 * Valid values for each instance option. The first value of each list is the default one.
	 * - collision: 'general' (the most general type prevails on method name collisions) | 'specific' (the most specific type prevails).
	 * - args: 'array' (methods receive `([dispatcher args], ...method args)`) | 'spread' (methods receive `(...dispatcher args, [method args])`).
	 * - handlers: 'exposed' (a function assigned to a type name is also attached as a method) | 'hidden' (names starting with an uppercase letter are type names: their functions are only handlers).
	 * - errors: 'console' (errors thrown by methods, handlers and subtype definitions are reported through the console and the flow continues) | 'throw' (the original error is rethrown).
	 * @private
	 */
	var valid_options = { 'collision': ['general', 'specific'], 'args': ['array', 'spread'], 'handlers': ['exposed', 'hidden'], 'errors': ['console', 'throw'] };

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
		var instance = { name: name, messages: messages[name], fns: {}, subtypes: {}, options: {} };
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
		if(incorrect_fns_and_subtypes_names[name]){
			 message.call({ name: name }, 'error', 'Name "' + name + '" is a reserved word. Using default instance instead.');
			 return get_instance('');
		}
		if(!instances[name]){ instances[name] = create_instance(name, options); }
		else if(options !== undefined){ message.call({ name: name, messages: messages[name] }, 'warn', 'The instance already exists, so the options passed to "instance" were ignored. Use "config" to change them.'); }
		return instances[name];
	}

	// Periodically dispatch all queued info, warn, and error messages.
	if(setinterval_is_on){
		var interval = setInterval(function(){
			for(var instance_name in messages){
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
