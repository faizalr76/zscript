let dbg_list = ["main: ", 
    //"lex: ", 
    "error: "];
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
    test(`def n : 2`, ["def", "n", 2]);
    test(`def n : 2 + 3`, ["def", "n", ["+", 2, 3]]);
    test(`def n : 2 + 3 + 4`, ["def", "n", ["+", ["+", 2, 3], 4]]);
    test(`def n : 2 + 3 * 4`, ["def", "n", ["+", 2, ["*", 3, 4]]]);
    test(`def n : 2 / 3 * 4`, ["def", "n", ["*", ["/", 2, 3], 4]]);
    test(`set! n : 2`, ["set!", "n", 2]);
    test(`2 + 3 > 4 * 5`, [">", ["+", 2, 3], ["*", 4, 5]]);
    test(`
        def fac : fun (n)
            if n < 2 then
                n
            else
                n * fac(n - 1)
            fi
        nuf
        `,
        ["def", "fac", ["fun", ["n"],
            ["if", ["<", "n", 2], "n",
                  ["*", "n", ["fac", ["-", "n", 1]]]]
        ]]);
    //let ast = read(code);
    //dbg("main: ", ast);
}

function test(code, expected) {
    let ast = read(code);
    if (eq(ast, expected)) {
        console.log("pass: ", code, " => ", ast);
    }
    else {
        console.log("fail: ", ast, " not= ", expected);
        throw "bail !";
    }
}

function eq (a, b) {
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
        for (let i = 0; i < a.length; i += 1) {
            if (!eq(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    else {
        return a === b;
    }
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
    let kw = ["nuf", "elif", "else", "fi"]
    while (arr.length) {
        if (kw.includes(arr[0])) {
            return ret.length === 2 ? ret[1] : ret;
        }
        ret.push(parse_first(arr));
    }
    return ret.length === 2 ? ret[1] : ret;
}

function parse_first (arr) {
// aka parse_gt
    let ret = parse_plus(arr);
    while (arr[0] === "<" || arr[0] === "<=" ||
           arr[0] === ">" || arr[0] === ">="  ) {
        ret = [arr.shift(), ret, parse_plus(arr)];
    }
    return ret;
}

// hierarchy: +|- *|/ var
function parse_plus (arr) {
    let ret = parse_mult(arr);
    while (arr[0] === "+" || arr[0] === "-") {
        ret = [arr.shift(), ret, parse_mult(arr)];
    }
    return ret;
}

function parse_mult (arr) {
    let ret = parse_var(arr);
    while (arr[0] === "*" || arr[0] === "/") {
        ret = [arr.shift(), ret, parse_var(arr)];
    }
    return ret;
}

function parse_var (arr) {
    let x = arr.shift();
    if (x === "def") {
        let k = arr.shift();
        assert(arr.shift() === ":", "expected :");
        let v = parse_first(arr);
        return ["def", k, v];
    }
    else if (x === "set!") {
        let k = arr.shift();
        assert(arr.shift() === ":", "expected :");
        let v = parse_first(arr);
        return ["set!", k, v];
    }
    else if (x === "fun") {
        let parms = parse_first(arr);
        let body = parse(arr);
        assert(arr.shift() === "nuf", "expected nuf !")
        return ["fun", parms, body];
    }
    else if (x === "if") {
        let cond = parse_first(arr);
        assert(arr.shift() === "then", "expected then !");

        let conseq = parse(arr);
        let alt = "nil";
        if (arr[0] === "elif") {
            arr[0] = "if";
            alt = parse(arr);
        }
        else if (arr[0] === "else") {
            arr.shift();
            alt = parse(arr);
        }
        assert(arr.shift() === "fi", "expected fi !");
        return ["if", cond, conseq, alt];
    }
    else if (x === "(") {
        //console.log("parens: arr: " + arr);
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
                ret.push(parse_first(arr));
            }
        } // elihw
    }
    else if (!isNaN(x)){
        return +x;
    }
    else if (arr[0] === "(") { // fun call ?
        let args = parse_var(arr);
        return [x].concat(args);
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
