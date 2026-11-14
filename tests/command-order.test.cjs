const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Load the real TypeScript modules without starting Obsidian or adding a test framework.
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
    const full = path.resolve(root, file.endsWith('.ts') ? file : `${file}.ts`);
    if (cache.has(full)) return cache.get(full).exports;
    const module = { exports: {} };
    cache.set(full, module);
    const js = ts.transpileModule(fs.readFileSync(full, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2018, esModuleInterop: true },
    }).outputText;
    const localRequire = id => {
        if (id === 'obsidian') return { setIcon() {} };
        if (id.startsWith('.')) return load(path.resolve(path.dirname(full), id));
        return require(id);
    };
    new Function('require', 'module', 'exports', js)(localRequire, module, module.exports);
    return module.exports;
}
const { normalizeCommandOrder } = load('src/command-order');
const { HEADING_MENU } = load('src/constants');
const { CommandMenu } = load('src/components/command-menu');

function search(settings, query) {
    global.createDiv = () => ({ addClass() {} });
    const menu = new CommandMenu({
        defaultCmds: settings.cmdsSorting,
        allCmds: settings.commandOrder,
        scrollArea: { appendChild() {}, removeClass() {} },
        onMenu() {},
    });
    let result;
    menu.generateMenu = commands => { result = commands; };
    menu.search(query);
    return result;
}

const visible = ['insert-todo-callout', 'insert-text', 'insert-heading1', 'insert-heading2', 'insert-heading3'];

test('a hidden To-do List can rank ahead of a visible Todo Callout and stay out of the initial menu', () => {
    const settings = normalizeCommandOrder({
        commandOrder: ['insert-todo', 'insert-todo-callout'],
        cmdsSorting: visible,
    });
    assert.deepEqual(search(settings, 'to').slice(0, 2), ['insert-todo', 'insert-todo-callout']);
    assert.deepEqual(search(settings, ''), visible);
    assert(!search(settings, '').includes('insert-todo'));
    assert.deepEqual(search(settings, 'TO'), search(settings, 'to'));
    assert.deepEqual(search(settings, 'no-such-command'), []);
});

test('saving and reloading mixed visibility order preserves search priority', () => {
    const before = normalizeCommandOrder({
        commandOrder: ['insert-todo', 'insert-todo-callout', 'insert-abstract-callout', 'insert-text'],
        cmdsSorting: visible,
    });
    const reloaded = normalizeCommandOrder(JSON.parse(JSON.stringify(before)));
    assert.deepEqual(reloaded, before);
    assert.equal(search(reloaded, 'to')[0], 'insert-todo');
});

test('changing visibility does not move a command in search results', () => {
    const before = normalizeCommandOrder({ commandOrder: ['insert-todo', 'insert-todo-callout'], cmdsSorting: visible });
    const shown = normalizeCommandOrder({ ...before, cmdsSorting: [...before.cmdsSorting, 'insert-todo'] });
    const hiddenAgain = normalizeCommandOrder({ ...shown, cmdsSorting: visible });
    assert.deepEqual(shown.commandOrder, before.commandOrder);
    assert.equal(search(shown, '')[0], 'insert-todo');
    assert.deepEqual(search(shown, 'to'), search(hiddenAgain, 'to'));
    assert.deepEqual(hiddenAgain, before);
});

test('PR 31 settings keep both existing group orders during migration', () => {
    const hidden = ['insert-quote-callout', 'insert-todo', 'insert-abstract-callout'];
    const migrated = normalizeCommandOrder({ cmdsSorting: visible, disabledCmdsSorting: hidden });
    assert.deepEqual(migrated.commandOrder.slice(0, visible.length + hidden.length), [...visible, ...hidden]);
    assert.deepEqual(migrated.cmdsSorting, visible);
    assert.deepEqual(migrated.disabledCmdsSorting.slice(0, hidden.length), hidden);
});

test('older settings and a new install retain initial menu visibility', () => {
    const legacy = normalizeCommandOrder({ cmdsSorting: visible });
    assert.deepEqual(legacy.cmdsSorting, visible);
    assert.equal(new Set(legacy.commandOrder).size, HEADING_MENU.length);
    const fresh = normalizeCommandOrder({});
    assert(fresh.cmdsSorting.includes('insert-note-callout'));
    assert(!fresh.cmdsSorting.includes('insert-todo-callout'));
    assert(fresh.disabledCmdsSorting.includes('insert-todo-callout'));
});

test('stale IDs and duplicates are removed and missing commands remain searchable', () => {
    const settings = normalizeCommandOrder({
        commandOrder: ['obsolete', 'insert-todo', 'insert-todo'],
        cmdsSorting: [...visible, 'insert-text', 'obsolete'],
        disabledCmdsSorting: ['insert-text', 'insert-abstract-callout', 'insert-abstract-callout'],
    });
    assert.equal(settings.commandOrder[0], 'insert-todo');
    assert.equal(settings.commandOrder.length, HEADING_MENU.length);
    assert.deepEqual(new Set(settings.commandOrder), new Set(HEADING_MENU));
    assert.deepEqual(settings.cmdsSorting, visible);
    assert(!settings.disabledCmdsSorting.includes('insert-text'));
    assert(search(settings, 'quote').includes('insert-quote-callout'));
});
