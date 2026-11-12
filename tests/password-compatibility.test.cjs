const { test } = require('node:test');
const assert = require('node:assert/strict');
const loadGenerator = require('./helpers/generator.cjs');
const fixtures = require('./password-fixtures.json');

// These literal outputs were captured from the unchanged generator. Do not
// regenerate them to make a refactor pass: existing users depend on them.
for (const { name, input, expected } of fixtures) {
    test(`password compatibility: ${name}`, () => {
        const generate = loadGenerator();
        assert.equal(generate(input), expected);
    });
}

test('default settings preserve the baseline password', () => {
    const generate = loadGenerator();
    const { seed, master } = fixtures[0].input;
    assert.equal(generate({ seed, master }), fixtures[0].expected);
});

test('changing settings and restoring them reproduces the same password', () => {
    const generate = loadGenerator();
    for (const fixture of [...fixtures, ...[...fixtures].reverse()]) {
        assert.equal(generate(fixture.input), fixture.expected, fixture.name);
    }
});
