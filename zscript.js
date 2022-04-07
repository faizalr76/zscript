let dbg_list = ["main: ", "lex: ", "error: "];
Array.prototype.toString = function () {
    return "[" + this.join(", ") + "]";
};

function main () {
    let code = "def n : 99\n"
        + "set! n : 100";
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
        ret.push(parse_one(arr));
    }
    return ret.length > 1 ? ret : ret[1];
}

function parse_one (arr) {
    while (arr.length) {
        let x = arr.shift();
        if (x === "def") {
            let k = arr.shift();
            assert(arr.shift() === ":", "expected :");
            let v = arr.shift();
            return ["def", k, v];
        }
        else if (x === "set!") {
            let k = arr.shift();
            assert(arr.shift() === ":", "expected :");
            let v = arr.shift();
            return ["set!", k, v];
        }
        else {
            dbg("idk");
        }
    }
    return ret;
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
