
let css = {
    // Query selector. É executado sobre o elemento processado, afetando seus filhos
    selector: ".green",

    /*
    Variáveis que podem ser acessadas dentro de properties usando function 
    Caso seja informado uma function, o retorno dela é acessado
    */
    vars: {
        // As function recebem o próprio objeto vars no argumento, que já vem com o elemento HTML
        style: vars => vars.element.style,

        // Isso não funciona pois width é informado em properties, que executa depois de vars
        width: vars => vars.element.style.width
    },
    properties: {
        backgroundColor: "green",
        width: "200px",
        height: "150px"
    },

    // Os query selectors em childs são executados sobre os elementos HTML filhos, afetando os netos
    childs: [
        {
            selector: ".yellow", // A div yellow é filha de green e neta do body
            vars: {
                // A propriedade super acessa o vars do objeto pai
                parentH: vars => vars.super.style.height,

                // É possível acessar as variáveis do mesmo objeto (parentH), seguindo a sequencia de declaração
                size: vars => `calc(${vars.parentH} * 0.6)`,

                // Também é possível acessar o style do elemento pai dessa maneira
                parentStyle: vars => vars.element.parentElement.style
            },
            properties: {
                backgroundColor: "yellow",
                rotate: "45deg",
                width: vars => vars.size,
                height: vars => vars.size,
                position: "relative",
                top: "20%",
                left: "27%"
            }
        },
        {
            selector: ".blue",
            properties: {
                backgroundColor: "blue",
                width: "80%",
                height: "80%",
                borderRadius: "50%",
                position: "relative",
                top: "10%",
                left: "10%"
            }
        }
    ]
};

function render() {
    let greendiv = create("div");
    let yellowdiv = create("div");
    let bluediv = create("div");

    greendiv.className = "green";
    yellowdiv.className = "yellow";
    bluediv.className = "blue";

    document.body.append(greendiv);
    greendiv.append(yellowdiv);
    yellowdiv.append(bluediv);

    processCss(css, document.body);
}

function create(name) {
    return document.createElement(name);
}

function processCss(css, element) {
    if (!css || !element) {
        return;
    }
    if (Array.isArray(css)) {
        css.forEach(i => processCss(i, element));
        return;
    }
    if (Array.isArray(element) || element instanceof NodeList) {
        element.forEach(el > processCss(css, el));
        return;
    }
    if (element.id) {
        element = document.getElementById(element.id) || element;
    }
    let elements = element.querySelectorAll(css.selector);
    if (elements) {
        elements.forEach(el => processElementCss(css, el));
    }
}

function processElementCss(css, element) {
    if (!css || !element) {
        return;
    }
    if (element.id) {
        element = document.getElementById(element.id) || element;
    }
    let vars = processVars(css, element);
    if (css.properties)
        Object.keys(css.properties).forEach(prop => {
            let value = css.properties[prop];
            if (value instanceof Function) {
                value = value(vars);
            }
            if (value != null)
                element.style[prop] = value;
        });
    if (css.childs && element.childNodes) {
        css.childs.forEach(c => c.super = css);
        processCss(css.childs, element);
    }
}

function processVars(css, element) {
    let vars = { element };
    if (!css || !element || !css.vars) {
        return vars;
    }
    if (css.super?.procVars) {
        vars.super = css.super.procVars;
    }
    Object.keys(css.vars).forEach(prop => {
        let value = css.vars[prop];
        if (value instanceof Function) {
            value = value(vars);
        }
        vars[prop] = value
    });
    css.procVars = vars;
    return vars;
}
