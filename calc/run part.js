function run_function(func, stack, built_ins, operators, end_time) {
	if(!func.is_ref || /function|operator/.test(func.type)) {
		switch(func.type) {
			case "function":
				var args = {};
				var variables = {};
				var scopes = func.scopes.concat(args, variables);
				
				for(let cou = 0; cou < func.args.length; cou++) {
					args[func.args[func.args.length - cou - 1]] = stack.pop();
				}
				
				for(let cou = 0; cou < func.variables.length; cou++) {
					run_block(func.variables[cou].data, stack, scopes, built_ins, operators, end_time);
					variables[func.variables[cou].name] = stack.pop();
				}
				
				run_block(func.data, stack, scopes, built_ins, operators, end_time);
				break;
			case "symbol":
				built_ins[func.data]();
				break;
			case "operator":
				operators[func.data]();
				break;
		}
	} else {
		stack.push({data: JSON.parse(JSON.stringify(func.data)), type: func.type});
	}
}

function get_variable(name, scopes) {
	for(let cou = scopes.length - 1; cou >= 0; cou--) {
		if(scopes[cou][name]) {
			return scopes[cou][name];
		}
	}
	return undefined;
}

function run_block(block, stack, scopes, built_ins, operators, end_time) {
	for(let instruccion_pointer = 0; instruccion_pointer < block.length; instruccion_pointer++) {
		if(Date.now() > end_time) {
			throw "Error: code took too long to run, stopped.";
		}
		
		switch(block[instruccion_pointer].type) {
			case "symbol":
				if(get_variable(block[instruccion_pointer].data, scopes)) {
					switch(get_variable(block[instruccion_pointer].data, scopes).type) {
						case "function":
							run_function(get_variable(block[instruccion_pointer].data, scopes), stack, built_ins, operators, end_time);
							break;
						case "symbol":
							built_ins[get_variable(block[instruccion_pointer].data, scopes).data]();
							break;
						case "operator":
							operators[get_variable(block[instruccion_pointer].data, scopes).data]();
							break;
						default:
							stack.push(get_variable(block[instruccion_pointer].data, scopes));
							break;
					}
				} else if(built_ins[block[instruccion_pointer].data]) {
					built_ins[block[instruccion_pointer].data]();
				} else {
					throw `Symbol \`${block[instruccion_pointer].data}\` found in main expression without being a built-in function.`;
				}
				break;
			case "number":
			case "string":
				stack.push(block[instruccion_pointer]);
				break;
			case "list":
				var list = [];
				for(let cou = 0; cou < block[instruccion_pointer].data; cou++) {
					list.push(stack.pop());
				}
				stack.push({data: list.reverse(), type: "list"});
				break;
			case "function":
				var scoped_function = block[instruccion_pointer];
				scoped_function.scopes = scopes;
				stack.push(scoped_function);
				break;
			case "operator":
				if(block[instruccion_pointer].data != "$") {
					operators[block[instruccion_pointer].data]();
				} else {
					instruccion_pointer++;
					switch(block[instruccion_pointer].type) {
						case "symbol":
							if(get_variable(block[instruccion_pointer].data, scopes)) {
								var passed_function = get_variable(block[instruccion_pointer].data, scopes);
								passed_function.name = block[instruccion_pointer].data;
								passed_function.scopes = get_variable;
								passed_function.is_ref = true;
								stack.push(passed_function);
							} else {
								stack.push(block[instruccion_pointer]);
							}
							break;
						case "operator":
							stack.push(block[instruccion_pointer]);
							break;
						default:
							var reference = block[instruccion_pointer];
							reference.scopes = get_variable;
							reference.is_ref = true;
							stack.push(reference);
							break;
					}
				}
				break;
		}
	}
}

module.exports = {run_function, run_block};