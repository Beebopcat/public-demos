import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadDemo(relativePath, window = {}) {
  const html = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, { textContent: '', value: '' });
      return elements.get(id);
    },
    querySelectorAll() { return []; },
  };
  const context = vm.createContext({ document, window });
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script, 'test must execute the actual inline demo script');
  vm.runInContext(script[1], context);
  return { elements, context, document };
}

function permissions() {
  const demo = loadDemo('../permissions/index.html');
  return {
    run(command) {
      demo.document.getElementById('cmd').value = command;
      demo.document.getElementById('run').onclick();
    },
    state() {
      return {
        mode: vm.runInContext('modeStr()', demo.context),
        display: demo.document.getElementById('mode').textContent,
        output: demo.document.getElementById('out').textContent,
      };
    },
    reset() { demo.document.getElementById('reset').onclick(); },
  };
}

test('a rejected later symbolic clause leaves model and display unchanged', () => {
  for (const command of ['chmod g+r,bad supply-ledger.txt', 'chmod g+r,z+r supply-ledger.txt']) {
    const demo = permissions();
    demo.run(command);
    assert.equal(demo.state().mode, '0600');
    assert.equal(demo.state().display, '0600');
    assert.match(demo.state().output, /unsupported/);
    assert.doesNotMatch(demo.state().output, /Goal met/);
  }
});

test('octal special bits are rejected without silently discarding them', () => {
  for (const mode of ['1640', '2640', '4640', '7640']) {
    const demo = permissions();
    demo.run(`chmod ${mode} supply-ledger.txt`);
    assert.equal(demo.state().mode, '0600');
    assert.equal(demo.state().display, '0600');
    assert.match(demo.state().output, /unsupported/);
  }
});

test('overbroad octal modes never satisfy the exercise policy', () => {
  for (const mode of ['641', '740', '777']) {
    const demo = permissions();
    demo.run(`chmod ${mode} supply-ledger.txt`);
    assert.equal(demo.state().mode, `0${mode}`);
    assert.doesNotMatch(demo.state().output, /Goal met/);
  }
});

test('symbolic execute and group write permissions cannot report success', () => {
  const demo = permissions();
  demo.run('chmod a+x,g+rw supply-ledger.txt');
  assert.equal(demo.state().mode, '0771');
  assert.doesNotMatch(demo.state().output, /Goal met/);
});

test('equivalent symbolic and octal solutions all report success at 0640', () => {
  for (const command of ['chmod g+r supply-ledger.txt', 'chmod 640 supply-ledger.txt', 'chmod 0640 supply-ledger.txt']) {
    const demo = permissions();
    demo.run(command);
    assert.equal(demo.state().mode, '0640');
    assert.equal(demo.state().display, '0640');
    assert.match(demo.state().output, /Goal met/);
  }
});

test('reset clears the attempt and restores owner-only access', () => {
  const demo = permissions();
  demo.run('chmod 777 supply-ledger.txt');
  demo.reset();
  assert.deepEqual(demo.state(), { mode: '0600', display: '0600', output: 'reset to 0600\n' });
});

test('Stop is safe when the browser has no speech synthesis', () => {
  const demo = loadDemo('../dialogue/index.html');
  assert.doesNotThrow(() => demo.document.getElementById('stop').onclick());
});

test('Stop cancels the available speech provider without starting playback', () => {
  let cancelled = 0;
  const demo = loadDemo('../dialogue/index.html', { speechSynthesis: { cancel() { cancelled += 1; } } });
  assert.equal(cancelled, 0);
  demo.document.getElementById('stop').onclick();
  assert.equal(cancelled, 1);
});
