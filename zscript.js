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
    let ret = parse_var(arr);
    if (arr[0] === "*" || arr[0] === "/") {
        while (arr[0] === "*" || arr[0] === "/") {
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
    else if (!isNaN(x)){
        return new Number(x);
    }
    else {
        return x;
    }
}

function assert (flag, s) {
    if (!flag) throw s;
}

function dbg (...arr) {
    if (dbg_list.indexOf(arr[0]) === -1) return;
    let s = arr.join("");
    console.log(s);
}

try {
    main();
}
catch (e) {
    dbg("error: ", e);
}
