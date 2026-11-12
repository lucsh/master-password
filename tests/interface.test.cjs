const { test } = require('node:test');
const assert = require('node:assert/strict');
const loadGenerator = require('./helpers/generator.cjs');

function populated() {
    const { ui } = loadGenerator();
    ui.element('input[name="seed"]').value = 'user@example.com';
    ui.element('#hidden-seed').value = 'correct horse battery staple';
    ui.fire('input[name="seed"]', 'input');
    return ui;
}

test('live generation keeps the baseline and clears stale output', () => {
    const ui = populated();
    assert.equal(ui.element('input[name="new-pass"]').value, '615f1$A38F7&7b6');
    assert.equal(ui.element('#btn_copy').disabled, false);
    ui.element('input[name="seed"]').value = '';
    ui.element('#hidden-seed').value = '';
    ui.fire('#hidden-seed', 'input');
    assert.equal(ui.element('input[name="new-pass"]').value, '');
    assert.equal(ui.element('#btn_copy').disabled, true);
});

test('invalid lengths clear output and recover when corrected', () => {
    const ui = populated();
    for (const value of ['', '0', '65', '3.5', '-1', 'abc']) {
        ui.element('input[name="lenght"]').value = value;
        ui.fire('input[name="lenght"]', 'input');
        assert.equal(ui.element('input[name="new-pass"]').value, '');
        assert.equal(ui.element('#btn_copy').disabled, true);
        assert.match(ui.element('#length-error').textContent, /whole number/);
    }
    ui.element('input[name="lenght"]').value = '15';
    ui.fire('input[name="lenght"]', 'input');
    assert.equal(ui.element('input[name="new-pass"]').value, '615f1$A38F7&7b6');
});

test('both reveal controls toggle password visibility', () => {
    const ui = populated();
    for (const [button, input] of [['#btn_peek', '#hidden-seed'], ['#btn_result_peek', 'input[name="new-pass"]']]) {
        ui.fire(button, 'click');
        assert.equal(ui.element(input).type, 'text');
        ui.fire(button, 'click');
        assert.equal(ui.element(input).type, 'password');
    }
});

test('copy writes the generated value and reports clipboard failure', async () => {
    const ui = populated();
    let copied;
    ui.navigator.clipboard = { async writeText(value) { copied = value; } };
    await ui.fire('#btn_copy', 'click');
    assert.equal(copied, '615f1$A38F7&7b6');
    assert.equal(ui.element('#copy-status').textContent, 'Copied to clipboard.');
    ui.navigator.clipboard.writeText = async () => { throw new Error('denied'); };
    await ui.fire('#btn_copy', 'click');
    assert.match(ui.element('#copy-status').textContent, /Copy unavailable/);
});

test('system changes apply only in system mode and only appearance is stored', () => {
    const ui = populated();
    ui.media.matches = true;
    ui.media.change();
    assert.equal(ui.document.documentElement.dataset.theme, 'dark');
    ui.element('#theme').value = 'light';
    ui.fire('#theme', 'change');
    ui.media.change();
    assert.equal(ui.document.documentElement.dataset.theme, 'light');
    assert.deepEqual([...ui.saved], [['password-theme', 'light']]);
});
