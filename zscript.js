let dbg_list = ["main: ", "lex: ", "error: "];
Array.prototype.toString = function () {
    return "[" + this.join(", ") + "]";
};

function main () {
    let code = ` 
        def n : 1 + 2
        def n : 99 + 1 + 2
        def n : 99 + 1 * 2
        def n : 99 + 1 * 2 / 3
        set! n : 100
        if n < 2 then
            n
        else
            n + 1
        fi
        if n < 2 then
            n
        elif n < 3 then
            n + 1
        else
            n + 2
        fi
        `;
    let ast = read(code);
    dbg("main: ", ast);
}

function read (s) {
    let toks = lex(s);
    let ast = parse(toks);
    return ast;
}

function lex (s) {
    let ret = s.match(/[()[\]{}:]|[^()[\]{}:\n\s\t]+/g);
    dbg("lex: ", "return: ", ret);
    return ret;
}

function parse (arr) {
    let ret = ["do"];
    while (arr.length) {
        ret.push(parse_plus(arr));
    }
    return ret.length > 1 ? ret : ret[1];
}

// hierarchy: +|- *|/ var
function parse_plus (arr) {
    let ret = parse_mult(arr);
    if (arr[0] === "+" || arr[0] === "-") {
        while (arr[0] === "+" || arr[0] === "-") {
            ret = [arr.shift(), ret, parse_mult(arr)];
        }
    }
    return ret;
}

function parse_mult (arr) {
    let ret = parse_gt(arr);
    if (arr[0] === "*" || arr[0] === "/") {
        while (arr[0] === "*" || arr[0] === "/") {
            ret = [arr.shift(), ret, parse_gt(arr)];
        }
    }
    return ret;
}

function parse_gt (arr) {
    let ret = parse_var(arr);
    if (arr[0] === "<" || arr[0] === "<=" ||
        arr[0] === ">" || arr[0] === ">="  ) {
        while (arr[0] === "<" || arr[0] === "<=" ||
               arr[0] === ">" || arr[0] === ">="  ) {
            ret = [arr.shift(), ret, parse_var(arr)];
        }
    }
    return ret;
}

function parse_var (arr) {
    let x = arr.shift();
    if (x === "def") {
        let k = arr.shift();
        assert(arr.shift() === ":", "expected :");
        let v = parse_plus(arr);
        return ["def", k, v];
    }
    else if (x === "set!") {
        let k = arr.shift();
        assert(arr.shift() === ":", "expected :");
        let v = parse_plus(arr);
        return ["set!", k, v];
    }
    else if (x === "fun") {
        arr.shift();
        let parms = parse_var(arr);
        let body = parse(arr);
        return ["fun", parms, body];
    }
    else if (x === "if") {
        let cond = parse_plus(arr);
        console.log("if: cond: " + cond);
        assert(arr.shift() === "then", "expected then !");

        let conseq = ["do"];
        let alt = null;
        while (1) {
            if (arr.length === 0) {
                throw "expected fi !"
            }
            else if (arr[0] === "elif") {
                arr[0] = "if";
                return ["if", cond, 
                              conseq.length === 2 ? conseq[1] : conseq, 
                              parse_plus(arr)];
            }
            else if (arr[0] === "else") {
                arr.shift();
                break;
            }
            else if (arr[0] === "fi") {
                arr.shift();
                return ["if", cond, 
                              conseq.length === 2 ? conseq[1] : conseq, 
                              alt.length === 2 ? alt[1] : alt 
                       ];
            }
            else {
                conseq.push(parse_plus(arr));
            }
        } // elihw

        alt = ["do"];
        while (1) {
            if (arr.length === 0) {
                throw "expected fi !"
            }
            else if (arr[0] === "fi") {
                arr.shift();
                return ["if", cond, 
                              conseq.length === 2 ? conseq[1] : conseq, 
                              alt.length === 2 ? alt[1] : alt 
                       ];
            }
            else {
                alt.push(parse_plus(arr));
            }
        } // elihw
    }
    else if (x === "(") {
        let ret = [];
        while (1) {
            if (arr.length === 0) {
                throw "expected closing paren !"
            }
            else if (arr[0] === ")") {
                arr.shift();
                return ret;
            }
            else {
                ret.push(parse_plus(arr));
            }
        }
    } // elihw
    else if (!isNaN(x)){
        return new Number(x);
    }
    else {
        return x;
    }
}

function assert (flag, s) {
    if (!flag) throw("error: "+ s);
}

function dbg (...arr) {
    if (dbg_list.indexOf(arr[0]) === -1) return;
    let s = arr.join("");
    console.log(s);
}

//try {
    main();
//}
//catch (e) {
    //dbg("error: ", e);
//}
