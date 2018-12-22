"use strict";

var lex = require("./lex");
var parse = require("./parse");
var run = require("./run");
var types = require("./types");

function calc(code_, max_time) {
	if(code_.substr(0, 5) != "calc=") {
		throw "There is no \"calc=\".";
	}
	var code = code_.substr(5, code_.length);
	var tokens = lex(code);
	var ast = parse(tokens);
	try {
		return run(ast, max_time);
	} catch(err) {
		throw err_to_string(err);
	}
}

function print(value) {
	if(value instanceof Array) {
		var result = "calc=";
		for(let cou = 0; cou < value.length; cou++) {
			result += print(value[cou]);
			if(cou < value.length - 1) {
				result += " ";
			}
		}
		return result;
	} else {
		
		switch(value.type) {
			case types.str:
			case types.sym:
			case types.op:
				return value.data;
				break;
			case types.num:
				return Math.floor(value.data * 100000) / 100000;
			case types.list:
				var list = "[";
				for(let cou = 0; cou < value.data.length; cou++) {
					list += print(value.data[cou]);
					if(cou < value.data.length - 1) {
						list += ", ";
					}
				}
				list += "]";
				return list;
				break;
			case types.func:
				return `{${value.args.join(" ")} -> <function definition>}`;
				break;
		}
		
	}
}

var err_to_string = err => "calc=" + (!(err instanceof Error)
	? err
	: "\n" + err.stack.split("\n").slice(0, 2).join("\n\t"));

module.exports = {calc, print, err_to_string};