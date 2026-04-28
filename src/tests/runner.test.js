import { describe, it, expect, vi } from "vitest";

/**
 * Real or AI — Batch Test Runner
 * ================================
 * Submits test images one-by-one through the app's URL analyzer
 * and compares actual verdicts against expected labels.
 *
 * USAGE — paste into browser DevTools console while on the Home page:
 *
 *   const { runTests } = await import('/src/test/runner.js');
 *   await runTests();                          // run all 30
 *   await runTests({ only: 'real' });          // real photos only
 *   await runTests({ only: 'ai' });            // AI-generated only
 *   await runTests({ ids: ['t001','t021'] });  // specific IDs
 *   await runTests({ limit: 5 });             // first N images
 *
 * Results are logged as a table and saved to:
 *   localStorage["realai_test_results"]
 */

import IMAGES from './images.json';

const ANALYSIS_TIMEOUT_MS = 120_000; // 2 min per image
const INTER_IMAGE_SLEEP_MS = 1_000;  // 1 s between submissions

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Inject a URL into the app's URL input and click Analyze */
async function submitUrl(url) {
  const input = document.querySelector('input[placeholder*="example.com"]');
  if (!input) throw new Error('URL input not found — are you on the Home page?');

  const btn = [...document.querySelectorAll('button')].find(
    (b) => b.textContent.trim() === 'Analyze'
  );
  if (!btn) throw new Error('Analyze button not found');

  // Set value via React's internal setter
  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  ).set;
  nativeSetter.call(input, url);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await sleep(150);
  btn.click();
}

/** Poll localStorage until a new analysis entry appears */
async function waitForResult(beforeCount, timeoutMs = ANALYSIS_TIMEOUT_MS) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await sleep(1500);
    const entries = JSON.parse(localStorage.getItem('verilens_analyses') || '[]');
    if (entries.length > beforeCount) return entries[0]; // newest first
  }
  throw new Error(`Timeout after ${timeoutMs / 1000}s`);
}

function printSummary(results) {
  const total   = results.length;
  const correct = results.filter((r) => r.match).length;
  const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : '—';

  const byLabel = { real: { total: 0, correct: 0 }, ai_generated: { total: 0, correct: 0 } };
  results.forEach((r) => {
    const g = byLabel[r.expected] ?? byLabel.real;
    g.total++;
    if (r.match) g.correct++;
  });

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║    Real or AI — Batch Test Results        ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Total    : ${String(total).padEnd(30)}║`);
  console.log(`║  Correct  : ${String(correct + ' ✅').padEnd(30)}║`);
  console.log(`║  Wrong    : ${String((total - correct) + ' ❌').padEnd(30)}║`);
  console.log(`║  Accuracy : ${String(accuracy + '%').padEnd(30)}║`);
  console.log(`║  Real     : ${String(`${byLabel.real.correct}/${byLabel.real.total}`).padEnd(30)}║`);
  console.log(`║  AI       : ${String(`${byLabel.ai_generated.correct}/${byLabel.ai_generated.total}`).padEnd(30)}║`);
  console.log('╚══════════════════════════════════════════╝\n');

  console.table(results.map((r) => ({
    id:         r.id,
    expected:   r.expected,
    actual:     r.actual,
    score:      r.score != null ? `${r.score}%` : '—',
    match:      r.match ? '✅' : '❌',
    difficulty: r.difficulty || '—',
  })));

  const mismatches = results.filter((r) => !r.match);
  if (mismatches.length) {
    console.warn('\n⚠️  Mismatches:');
    mismatches.forEach((r) =>
      console.warn(`  [${r.id}] expected="${r.expected}" got="${r.actual}" score=${r.score}%`)
    );
  }
}

export async function runTests(opts = {}) {
  let images = [...IMAGES];
  if (opts.only === 'real') images = images.filter((i) => i.label === 'real');
  if (opts.only === 'ai')   images = images.filter((i) => i.label === 'ai_generated');
  if (opts.ids)             images = images.filter((i) => opts.ids.includes(i.id));
  if (opts.limit)           images = images.slice(0, opts.limit);

  console.log(`\n▶  Starting batch test — ${images.length} images\n`);

  const results = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    console.log(`[${i + 1}/${images.length}] ${img.id} (${img.label}) → ${img.url}`);

    const beforeCount = JSON.parse(localStorage.getItem('verilens_analyses') || '[]').length;

    try {
      await submitUrl(img.url);
      const result = await waitForResult(beforeCount);

      const match = result.verdict === img.expected_verdict;
      console.log(`  ${match ? '✅' : '❌'} verdict="${result.verdict}" score=${result.confidence_score}% (expected "${img.expected_verdict}")`);

      results.push({
        id:         img.id,
        label:      img.label,
        category:   img.category,
        expected:   img.expected_verdict,
        actual:     result.verdict,
        score:      result.confidence_score,
        match,
        difficulty: img.difficulty || null,
        url:        img.url,
      });
    } catch (err) {
      console.error(`  💥 ERROR: ${err.message}`);
      results.push({
        id:         img.id,
        label:      img.label,
        expected:   img.expected_verdict,
        actual:     'ERROR',
        score:      null,
        match:      false,
        error:      err.message,
        url:        img.url,
      });
    }

    if (i < images.length - 1) await sleep(INTER_IMAGE_SLEEP_MS);
  }

  printSummary(results);

  const run = {
    timestamp: new Date().toISOString(),
    model: localStorage.getItem('verilens_settings')
      ? JSON.parse(localStorage.getItem('verilens_settings')).lms_model || 'cloud'
      : 'cloud',
    results,
  };
  localStorage.setItem('realai_test_results', JSON.stringify(run));
  console.log('\n💾 Saved to localStorage["realai_test_results"]');

  return results;
}

// Vitest test cases
describe('runTests', () => {
  it('should filter images by label', () => {
    const realOnly = IMAGES.filter(i => i.label === 'real');
    expect(realOnly.length).toBeGreaterThan(0);
    expect(realOnly.every(i => i.label === 'real')).toBe(true);
  });

  it('should filter images by ID', () => {
    const ids = ['t001', 't021'];
    const filtered = IMAGES.filter(i => ids.includes(i.id));
    expect(filtered.length).toBeLessThanOrEqual(ids.length);
  });

  it('should limit images', () => {
    const limit = 5;
    const limited = IMAGES.slice(0, limit);
    expect(limited.length).toBeLessThanOrEqual(limit);
  });

  it('should have valid image data structure', () => {
    expect(IMAGES.length).toBeGreaterThan(0);
    const img = IMAGES[0];
    expect(img).toHaveProperty('id');
    expect(img).toHaveProperty('url');
    expect(img).toHaveProperty('label');
    expect(img).toHaveProperty('expected_verdict');
  });
});