/**
 * Estructura v1.3.0
 * A lightweight, type-based dispatching JavaScript Framework.
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
	 */
	
	/**
	 * The main public interface of an Estructura instance.
	 * @typedef {EstructuraDispatcher & {
	 *   type: function(*): EstructuraTypeResult,
	 *   fn: function(object|Function): EstructuraPublicInterface,
	 *   subtype: function(object|string): EstructuraPublicInterface,
	 *   instance: function(string): EstructuraPublicInterface
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
					'Window': 'Browser', 'Document': 'Browser', 'Navigator': 'Browser', 'Screen': 'Browser', 'Location': 'Browser', 'History': 'Browser'
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
	 * Checks if a property name is valid for registration.
	 * @private
	 * @this EstructuraInstance
	 * @param {object} object The object containing the property.
	 * @param {string} property The name of the property to check.
	 * @returns {boolean} Returns `true` if the name is valid.
	 */
	function is_correct_object_property_name(object, property){
		if(!verify_own_property_fn.call(object, property)){ return false; }
		if(incorrect_fns_and_subtypes_names[property]){
			message.call(this, 'warn', 'Name "' + property + '" is a reserved word and cannot be used.');
			return false;
		}
		return true;
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
	 * Attaches methods from a resolved node to the result object. Executes hybrid node functions.
	 * @private
	 * @this EstructuraInstance
	 * @param {object} result_object The object to which methods will be attached.
	 * @param {object|Function} resolved_node The final function-node from the 'fns' tree.
	 * @param {string} resolved_node_type The type string that led to this node.
	 * @param {IArguments} main_fn_args The original arguments from the main dispatcher call.
	 * @param {boolean} [return_mode] If true, ensures the function returns the result object.
	 * @returns {object|void}
	 */
	function attach_resolved_methods(result_object, resolved_node, resolved_node_type, main_fn_args, return_mode){
		var actual_fns = resolved_node;
		if(typeof actual_fns === typeof_fn_value){
			try {
				// A hybrid node can return a new object of functions to use.
				// If it returns a falsy value, we fall back to the original node.
				// If it returns a non-object, we also fall back to protect against errors.
				actual_fns = actual_fns.apply(result_object, main_fn_args) || resolved_node;
				if(typeof actual_fns === typeof_str_value){ actual_fns = resolved_node; }
			}
			catch(error){ message.call(this, 'error', 'Type function "' + resolved_node_type + '" error: ' + String(error)); }
		}
		for(var fn_name in actual_fns){
			if(!verify_own_property_fn.call(actual_fns, fn_name) || typeof actual_fns[fn_name] !== typeof_fn_value){ continue; }
			if(result_object[fn_name]){ message.call(this, 'warn', 'Method conflict for "' + fn_name + '". A definition from type "' + resolved_node_type + '" is overwriting a previously attached method. This occurs when an input matches multiple types; the last-processed definition takes precedence.'); }
			result_object[fn_name] = adjust_method(this, fn_name, actual_fns, main_fn_args);
		}
		if(return_mode){ return result_object; }
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
		return function(){
			// The original dispatcher arguments are consistently passed as an array, becoming the first argument for the user's method.
			// e.g., _e(a, b).method(c) -> user's method receives ([a, b], c)
			var method_args = [Array.prototype.slice.call(main_fn_args)];
			for(var i = 0; i < arguments.length; i++){ method_args.push(arguments[i]); }
			try { return methods[method_name].apply(this, method_args); }
			catch(error){ message.call(instance_context, 'error', 'Method "' + method_name + '" error: '  + String(error)); }
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
		try { return subtype_definition_fn(input, primitive_type, matched_subtypes); }
		catch(error){ message.call(this, 'error', 'Subtype definition "' + subtype_name + '" function error: '  + String(error)); }
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
			}
		}
		return matched_subtypes;
	};

	/**
	 * The core type detection engine for an instance. It analyzes an input and returns
	 * an array of all its detected types, from most to least specific.
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
	 * Replaces a node in the dispatch tree, preserving the properties of the original node
	 * by merging them onto the new one. This handles converting plain objects to hybrid
	 * function-objects and merging properties between them.
	 * @private
	 * @param {object} target_object The parent object containing the node to be replaced (e.g., the 'fns' registry).
	 * @param {string} property_name The key of the node to be replaced.
	 * @param {function|object} new_function_or_object The new function or object that will replace the existing node.
	 */
	function merge_type_fns_node(target_object, property_name, new_function_or_object){
		var previous_object_or_fn_copy = {};
		// Note: The extend operation is safe; it will do nothing if target_object[property_name] is not an object.
		simple_object_extend(previous_object_or_fn_copy, target_object[property_name]);
		target_object[property_name] = new_function_or_object;
		simple_object_extend(target_object[property_name], previous_object_or_fn_copy);
	}


	/**
	 * Registers functions into the 'fns' dispatch tree for an instance.
	 * @private
	 * @this EstructuraInstance
	 * @param {object|function} new_type_fns An object representing the function tree to merge, or a single function to act as a node.
	 * @param {object} [existent_type_fns] Internal use for recursion.
	 * @returns {EstructuraInstance} The instance itself, to allow for chaining.
	 */
	function fn(new_type_fns, existent_type_fns){
		if(typeof new_type_fns === typeof_fn_value){
			merge_type_fns_node(this, 'fns', new_type_fns);
			return this;
		}
		existent_type_fns = existent_type_fns || this.fns;
		for(var type_name in new_type_fns){
			if(!is_correct_object_property_name.call(this, new_type_fns, type_name)){ continue; }
			var new_field = new_type_fns[type_name];
			var new_field_type = type.call(this, new_field);
			switch(new_field_type[0]){
				case 'Function':
					merge_type_fns_node(existent_type_fns, type_name, new_field);
				break;
				case 'Object':
					var existent_field_type = type.call(this, existent_type_fns[type_name]);
					if(!existent_field_type['Object'] && !existent_field_type['Function']){
						existent_type_fns[type_name] = {};
					}
					fn.call(this, new_field, existent_type_fns[type_name]);
				break;
				default: message.call(this, 'warn', 'Invalid definition for "fn.' + type_name + '". Only Function or Object are allowed.');
			}
		}
		return this;
	};

	/**
	 * Registers subtype definitions for an instance.
	 * @private
	 * @this EstructuraInstance
	 * @param {object|string} subtype_definitions An object with definitions or a predefined set name.
	 * @param {Array} [parent_subtype] Internal use for recursion.
	 * @returns {EstructuraInstance} The instance itself, to allow for chaining.
	 */
	function subtype(subtype_definitions, parent_subtype){
		if(typeof subtype_definitions === typeof_str_value && typeof predefined_subtypes[subtype_definitions] === typeof_fn_value){
			return subtype.call(this, predefined_subtypes[subtype_definitions](), parent_subtype);
		}
		var current_subtypes = parent_subtype || this.subtypes;
		for(var definition_name in subtype_definitions){
			if(!is_correct_object_property_name.call(this, subtype_definitions, definition_name)){ continue; }
			var subtype_definition_type = type.call(this, subtype_definitions[definition_name]);
			var existent_definition_type = type.call(this, current_subtypes[definition_name]);
			if(!parent_subtype && !existent_definition_type['Array']){ current_subtypes[definition_name] = []; }
			var existent_subtypes_reference = (!parent_subtype ? current_subtypes[definition_name] : current_subtypes);
			switch(subtype_definition_type[0]){
				case 'Object':
					subtype.call(this, subtype_definitions[definition_name]);
					subtype.call(this, subtype_definitions[definition_name], current_subtypes[definition_name]);
				break;
				case 'Function':
					existent_subtypes_reference.push({ name: definition_name, fn: subtype_definitions[definition_name] });
				break;
				case 'Array': case 'String':
					var inline_subtype_definitions = typeof subtype_definitions[definition_name] === typeof_str_value ? [subtype_definitions[definition_name]] : subtype_definitions[definition_name];
					var inline_subtype_definitions_iterator = inline_subtype_definitions.length;
					while(inline_subtype_definitions_iterator--){
						if(!inline_subtype_definitions[inline_subtype_definitions_iterator] || typeof inline_subtype_definitions[inline_subtype_definitions_iterator] !== typeof_str_value){
							message.call(this, 'warn', 'Subtype definition "' + definition_name + '" contains an invalid value which has been ignored.');
							continue;
						}
						existent_subtypes_reference.push({ name: definition_name, value: inline_subtype_definitions[inline_subtype_definitions_iterator] });
					}
				break;
				default: message.call(this, 'warn', 'Invalid definition for "subtype.' + definition_name + '". Only Object, Function, Array, or String are allowed.');
			}
		}
		return this;
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

		// The dispatching algorithm works by iteratively filtering a list of possible function nodes.
		// It walks down the 'fns' tree, collecting potential next-level nodes at each step.
		for(var args_iterator = 0; args_iterator < arguments.length; args_iterator++){
			// If no potential paths remain, break early.
			if(!types_start.length){ break; }
			var found_object = [];
			var result_iterator = types_start.length;
			var arg_types_iterator = type.call(this, arguments[args_iterator]);
			var type_iterator;
			while(result_iterator--){
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
		// Always attach methods from the root 'Any' type as a final step.
		return attach_resolved_methods.call(this, result_object, this.fns, 'Any', arguments, true);
	};

	/**
	 * Creates a sandboxed instance of Estructura.
	 * @private
	 * @param {string} name The name for the new instance.
	 * @returns {EstructuraPublicInterface} A new, isolated Estructura instance.
	 */
	function create_instance(name){
		messages[name] = {};
		/** @type {EstructuraInstance} */
		var instance = { name: name, messages: messages[name], fns: {}, subtypes: {} };
		/** @type {EstructuraPublicInterface} */
		var public_interface = function(){ return main_dispatcher.apply(instance, arguments); };
		public_interface.type = function(input){ return type.call(instance, input); };
		public_interface.fn = function(new_fns){ return fn.call(instance, new_fns); };
		public_interface.subtype = function(new_subtypes){ return subtype.call(instance, new_subtypes); };
		public_interface.instance = get_instance;
		subtype.call(instance, 'object-constructors');
		return public_interface;
	}

	/**
	 * Retrieves or creates a named, sandboxed instance of Estructura.
	 * @private
	 * @param {string} name The name of the instance.
	 * @returns {EstructuraPublicInterface|undefined} The requested instance.
	 */
	function get_instance(name){
		if(typeof name !== typeof_str_value){ return; }
		if(incorrect_fns_and_subtypes_names[name]){
			 message.call({ name: name }, 'error', 'Name "' + name + '" is a reserved word. Using default instance instead.');
			 return get_instance('');
		}
		if(!instances[name]){ instances[name] = create_instance(name); }
		return instances[name];
	}

	// Periodically dispatch all queued info, warn, and error messages.
	if(setinterval_is_on){
		setInterval(function(){
			for(var instance_name in messages){
				for(var message_content in messages[instance_name]){
					if(verify_own_property_fn.call(messages[instance_name], message_content)){
						console[messages[instance_name][message_content]](message_content);
					}
				}
			}
			messages = {};
		}, 1000);
	}

	/** @type {EstructuraPublicInterface} */
	var _e = get_instance('');
	/**
	 * Retrieves or creates a named, sandboxed instance of Estructura.
	 * @param {string} name The name of the instance. Use an empty string ('') for the default instance.
	 * @returns {EstructuraPublicInterface} The requested instance.
	 */
	_e.instance = get_instance;
	return _e;
}));