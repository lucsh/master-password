const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

// Run the shipped scripts without a browser or build dependencies. Only the
// DOM properties used by the generator are stubbed; hashing stays unmodified.
module.exports = function loadGenerator() {
    const listeners = new Map();
    const saved = new Map();
    const media = { matches: false, addEventListener(event, callback) { this.change = callback; } };
    const elements = new Map();
    const document = {
        querySelector(selector) {
            if (!elements.has(selector)) {
                elements.set(selector, {
                    value: selector === 'input[name="lenght"]' ? '15' : '',
                    checked: true,
                    addEventListener(event, callback) { listeners.set(`${selector}:${event}`, callback); },
                    type: selector.includes("hidden-seed") || selector.includes("new-pass") ? "password" : "text",
                    setAttribute() {},
                    classList: { add() {}, toggle() {} },
                });
            }
            return elements.get(selector);
        },
        querySelectorAll() { return []; },
        documentElement: { dataset: {} },
        body: { classList: { add() {} } },
    };
    const context = vm.createContext({ document, navigator: { userAgent: '' }, console: { log() {} } });
    context.window = context;
    context.matchMedia = () => media;
    context.localStorage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) };
    const source = (name) => readFileSync(resolve(__dirname, '../../src/scripts', name), 'utf8');
    vm.runInContext(source('sha256.js'), context);
    vm.runInContext(source('script.js').replace(/^import '\.\/sha256';\s*/, ''), context);
    const generate = ({ seed, master, length = 15, symbols = true, caps = true }) => {
        document.querySelector('input[name="lenght"]').value = String(length);
        document.querySelector('input[name="symbols"]').checked = symbols;
        document.querySelector('input[name="caps"]').checked = caps;
        return context.getPass(seed, master);
    };
    generate.ui = {
        element: selector => document.querySelector(selector),
        fire: (selector, event) => listeners.get(`${selector}:${event}`)(),
        document, media, saved, navigator: context.navigator,
    };
    return generate;
};
