import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';

const SHOTS = process.env.SHOTS_DIR;
async function shot(page: Page, name: string) {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}

function autoDialogs(page: Page) {
  page.on('dialog', (d) => (d.type() === 'prompt' ? d.accept('削除') : d.accept()));
}

/** 英語の声を2つ持つ偽の speechSynthesis（読み上げ内容と速度を記録する） */
const MOCK_TTS = () => {
  const voices = [
    { voiceURI: 'mock-local', name: 'Mock Local', lang: 'en-US', localService: true, default: true },
    { voiceURI: 'mock-net', name: 'Mock Net', lang: 'en-GB', localService: false, default: false },
  ];
  (window as unknown as { __spoken: unknown[] }).__spoken = [];
  class U {
    text: string;
    rate = 1;
    lang = '';
    voice: unknown = null;
    onend: (() => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    constructor(t: string) {
      this.text = t;
    }
  }
  const synth = {
    getVoices: () => voices,
    speak(u: U) {
      (window as unknown as { __spoken: unknown[] }).__spoken.push({ text: u.text, rate: u.rate, voice: (u.voice as { voiceURI?: string })?.voiceURI });
      setTimeout(() => u.onend?.(), 30);
    },
    cancel() {},
    addEventListener() {},
    removeEventListener() {},
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: U, configurable: true });
};

async function next(page: Page) {
  await page.locator('.step-nav').getByRole('button', { name: /次へ|終わる/ }).click();
}

async function runTenMinuteSession(page: Page) {
  await page.getByRole('button', { name: /^10分/ }).click();
  await expect(page.getByRole('heading', { name: '1 聞く' })).toBeVisible();

  // 聞く: 印を付ける・分からないメニュー・難度切替
  await page.getByRole('button', { name: '☆ 印' }).first().click();
  await expect(page.getByRole('button', { name: '★ 印あり' })).toHaveCount(1);
  await page.getByRole('button', { name: '分からない…' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: '日本語訳も表示する' }).click();
  await expect(page.getByText('やあ、Alex です。はじめまして。')).toBeVisible();
  await page.getByRole('button', { name: '少し難しい版' }).click();
  await expect(page.getByText("Hey, I'm Alex. Good to meet you.")).toBeVisible();
  await page.getByRole('button', { name: 'A2（短い文）' }).click();
  await shot(page, '02-listen');
  await next(page);

  // 理解チェック
  await expect(page.getByRole('heading', { name: '2 理解チェック' })).toBeVisible();
  await page.getByRole('button', { name: '東京' }).click();
  await page.getByRole('button', { name: 'ウォレットアプリ' }).click();
  await expect(page.getByText('正解！', { exact: false })).toHaveCount(2);
  await next(page);

  // まねして言う + 録音
  await expect(page.getByRole('heading', { name: '3 まねして言う' })).toBeVisible();
  await page.getByRole('button', { name: '● 録音する' }).click();
  await expect(page.getByText('録音中')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: /■ 停止/ }).click();
  await expect(page.getByRole('button', { name: '▶ 自分' })).toBeVisible();
  await page.getByRole('button', { name: '▶ 自分' }).click();
  await page.getByLabel('最後まで言えた').check();
  await shot(page, '03-imitate');
  await next(page);

  // 置き換え
  await expect(page.getByRole('heading', { name: '3 自分の文に置き換え' })).toBeVisible();
  await page.getByRole('button', { name: 'game developer', exact: true }).click();
  await page.getByRole('button', { name: 'Japan', exact: true }).click();
  await expect(page.locator('.target .en')).toHaveText("Hi, I'm r0ze. I'm a game developer from Japan.");
  await page.getByRole('button', { name: 'この文を表現に保存' }).click();
  await expect(page.getByRole('button', { name: '保存しました' })).toBeVisible();
  await next(page);

  // 追加質問
  await expect(page.getByRole('heading', { name: /4 追加質問に答える/ })).toBeVisible();
  await expect(page.getByText('教材の固定質問')).toBeVisible();
  await expect(page.getByText('AI 接続あり')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /音声入力/ })).toHaveCount(0);
  await page.getByLabel('あなたの答え（入力は任意）').fill('I want to meet other game developers.');
  await page.getByRole('button', { name: 'ヒントと答えの例を見る' }).click();
  await expect(page.locator('.card .plain .en').filter({ hasText: 'I want to meet other game developers.' })).toBeVisible();
  await page.getByRole('button', { name: '詰まった' }).click();
  await shot(page, '04-followup');
  await next(page);

  // 保存
  await expect(page.getByRole('heading', { name: '5 表現を保存' })).toBeVisible();
  await expect(page.getByLabel(/Hi! I'm Alex. Nice to meet you./)).toBeChecked();
  await page.getByRole('button', { name: /選んだ表現を保存/ }).click();
  await expect(page.getByText(/件を復習キューに入れました/)).toBeVisible();
  await next(page);

  await expect(page.getByText('おつかれさまでした。')).toBeVisible();
  await expect(page.getByText('理解チェック: 2/2 問（最初の回答）')).toBeVisible();
  await shot(page, '05-summary');
  await page.getByRole('button', { name: 'ホームへ' }).click();
}

test.describe('音声なし環境（実際のヘッドレス Chromium: 英語の声 0）', () => {
  test('10分コースが最後まで通り、翌日に復習できる', async ({ page }) => {
    autoDialogs(page);
    await page.goto('/');
    await expect(page.getByText('テキスト練習')).toBeVisible({ timeout: 5000 });
    await shot(page, '01-home');
    await runTenMinuteSession(page);

    // 記録と、保存した表現は「翌日」から
    await expect(page.getByText('合計 1 回', { exact: false })).toBeVisible();
    const due = page.locator('.stat').filter({ hasText: '今日の復習' }).locator('.stat-num');
    await expect(due).toHaveText('0');
    await page.getByRole('link', { name: '表現' }).click();
    await expect(page.getByText("Hi, I'm r0ze. I'm a game developer from Japan.")).toBeVisible();
    await expect(page.getByText('次の復習: 今日')).toHaveCount(0);

    await page.getByRole('link', { name: 'ホーム' }).click();
    await page.getByRole('link', { name: '記録を見る' }).click();
    await expect(page.getByText(/初対面のあいさつ（A2）理解 2\/2/)).toBeVisible();

    // 翌日
    await page.clock.setFixedTime(new Date(Date.now() + 26 * 3600 * 1000));
    await page.goto('/');
    const n = Number(await due.textContent());
    expect(n).toBeGreaterThanOrEqual(3);
    await page.getByRole('link', { name: /^復習/ }).click();
    await page.getByRole('button', { name: '復習を始める' }).click();
    for (let i = 0; i < n; i++) {
      await page.getByRole('button', { name: '答えを見る' }).click();
      await page.getByRole('button', { name: /^言えた/ }).click();
    }
    await expect(page.getByText(`復習 ${n} 件が終わりました。`)).toBeVisible();
    await page.getByRole('link', { name: 'ホーム' }).click();
    await expect(due).toHaveText('0');
  });

  test('途中で再読み込みしても再開できる', async ({ page }) => {
    autoDialogs(page);
    await page.goto('/');
    await page.getByRole('button', { name: /^10分/ }).click();
    await next(page);
    await page.getByRole('button', { name: '東京' }).click();
    // 再読み込みすると同じステップから続く
    await page.reload();
    await expect(page.getByRole('heading', { name: '2 理解チェック' })).toBeVisible();
    // ホームに戻っても「続きから再開」できる
    await page.goto('/#/');
    await page.getByRole('button', { name: '続きから再開' }).click();
    await expect(page.getByRole('heading', { name: '2 理解チェック' })).toBeVisible();
    await page.getByRole('button', { name: '終了' }).click();
    await expect(page.getByRole('heading', { name: '今日の練習' })).toBeVisible();
    await expect(page.getByText('続きから再開')).toHaveCount(0);
  });

  test('ピッチ原文は改変されず、言い換えは別データ。エクスポート→全削除→インポートで復元', async ({ page }) => {
    autoDialogs(page);
    await page.goto('/#/project');
    await expect(page.getByText('まだ提供されていません')).toBeVisible();

    // 資料: 確認済みだけが練習に使われる
    const oneLiner = page.getByLabel('一言説明（英語）');
    await oneLiner.fill('TEST-VALUE');
    await expect(page.locator('.fact-card').filter({ hasText: '一言説明' }).getByText('要確認')).toBeVisible();

    const original = '  Line one, with  double spaces.\nLine two!  ';
    await page.getByLabel('原文（入力どおりに保存されます）').fill(original);
    await page.getByRole('button', { name: '原文として保存' }).click();
    await expect(page.locator('pre.original')).toHaveCount(1);
    expect(await page.locator('pre.original').evaluate((e) => e.textContent)).toBe(original);
    await page.getByLabel('言い換えを追加').fill('Short version.');
    await page.getByRole('button', { name: '追加', exact: true }).click();
    await expect(page.locator('.para').getByText('Short version.')).toBeVisible();
    await page.getByRole('button', { name: '聞く・まねる' }).click();
    await expect(page.getByText('原文の整合性 OK')).toBeVisible();
    await shot(page, '06-project');

    // 表現 + 録音を作る
    await page.goto('/#/phrases');
    await page.getByLabel('英語').first().fill('Let me check and get back to you.');
    await page.getByRole('button', { name: '追加', exact: true }).click();
    await page.goto('/#/');
    await page.getByRole('button', { name: /^10分/ }).click();
    await next(page);
    await next(page);
    await page.getByRole('button', { name: '● 録音する' }).click();
    await page.waitForTimeout(1200);
    await page.getByRole('button', { name: /■ 停止/ }).click();
    await expect(page.getByRole('button', { name: '▶ 自分' })).toBeVisible();
    await page.getByRole('button', { name: '終了' }).click();

    // エクスポート（録音込み）
    await page.goto('/#/settings');
    await page.getByLabel('録音も含める（ファイルが大きくなります）').check();
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'バックアップをダウンロード' }).click()]);
    const path = await dl.path();
    const json = JSON.parse(fs.readFileSync(path, 'utf8'));
    expect(json.app).toBe('crypto-english-practice');
    expect(json.data.pitch.originals[0].text).toBe(original);
    expect(json.recordings.length).toBe(1);
    expect(json.recordings[0].base64.length).toBeGreaterThan(100);

    // 全削除
    await page.getByRole('button', { name: 'すべてのデータを削除' }).click();
    await expect(page.getByText('すべて削除しました')).toBeVisible();
    await page.goto('/#/phrases');
    await expect(page.getByText('0 件')).toBeVisible();

    // インポート（置き換え）
    await page.goto('/#/settings');
    await page.getByRole('button', { name: 'すべて置き換え' }).click();
    await page.getByLabel('バックアップファイルを選択').setInputFiles(path);
    await expect(page.getByText(/置き換えました（表現 1 件・記録 \d+ 件・録音 1 件）/)).toBeVisible();
    await page.reload();
    await expect(page.getByText(/録音 1 件/)).toBeVisible();
    await page.goto('/#/phrases');
    await expect(page.getByText('Let me check and get back to you.')).toBeVisible();
    await page.goto('/#/project');
    expect(await page.locator('pre.original').evaluate((e) => e.textContent)).toBe(original);
    await expect(page.locator('.para').getByText('Short version.')).toBeVisible();
    await expect(page.getByLabel('一言説明（英語）')).toHaveValue('TEST-VALUE');

    // 同じファイルを「追加」で取り込んでも重複しない
    await page.goto('/#/settings');
    await page.getByLabel('バックアップファイルを選択').setInputFiles(path);
    await expect(page.getByText(/表現 \+0/)).toBeVisible();
  });

  test('壊れたファイルは取り込まない', async ({ page }) => {
    await page.goto('/#/settings');
    await page.getByLabel('バックアップファイルを選択').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
    await expect(page.getByRole('alert')).toContainText('このアプリのバックアップファイルではありません');
  });
});

test.describe('音声あり（偽の音声合成で操作を検証）', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(MOCK_TTS);
  });

  test('会話の再生・速度変更・字幕なし表示', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('音声あり')).toBeVisible();
    await page.getByRole('button', { name: /^10分/ }).click();
    await expect(page.locator('.hidden-line')).toHaveCount(7);
    await page.getByRole('button', { name: '▶ 会話を全部聞く' }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __spoken: unknown[] }).__spoken.length), { timeout: 10000 }).toBe(7);
    const spoken = await page.evaluate(() => (window as unknown as { __spoken: { text: string; rate: number; voice: string }[] }).__spoken);
    expect(spoken[0]).toMatchObject({ text: "Hi! I'm Alex. Nice to meet you.", rate: 0.8, voice: 'mock-local' });
    // 自分側は別の声
    expect(spoken[1].voice).toBe('mock-net');
    await page.getByRole('button', { name: '0.7' }).click();
    await page.getByRole('button', { name: '3行目をもう一度聞く' }).click();
    const last = await page.evaluate(() => (window as unknown as { __spoken: { text: string; rate: number }[] }).__spoken.at(-1));
    expect(last).toMatchObject({ text: 'Where are you from?', rate: 0.7 });
    await page.locator('.line').first().getByRole('button', { name: '英文', exact: true }).click();
    await expect(page.locator('.hidden-line')).toHaveCount(6);
    await shot(page, '07-listen-audio');
  });

  test('設定にネットワーク音声の注意が出る', async ({ page }) => {
    await page.goto('/#/settings');
    await expect(page.getByText('英語の声 2 種、うち端末内 1')).toBeVisible();
    await expect(page.getByText('この声はネットワーク経由の音声です', { exact: false })).toBeVisible();
    await expect(page.getByLabel('音声認識を使う（外部送信の可能性あり）')).not.toBeChecked();
    await shot(page, '08-settings');
  });
});

test('AI 接続（任意）: キーなしで送信し、AI 応答として表示する', async ({ page }) => {
  let auth: string | undefined = 'unset';
  let body = '';
  await page.route('http://ai.example.test/v1/chat/completions', async (route) => {
    auth = route.request().headers()['authorization'];
    body = route.request().postData() ?? '';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ choices: [{ message: { content: 'Cool! Who do you want to meet?' } }] }),
    });
  });
  await page.goto('/#/settings');
  await page.getByRole('button', { name: 'OpenAI 互換（キーなし）' }).click();
  await page.getByLabel('Base URL').fill('http://ai.example.test/v1');
  await page.getByLabel('モデル名').fill('test-model');
  await page.goto('/#/');
  await page.getByRole('button', { name: /^10分/ }).click();
  for (let i = 0; i < 4; i++) await next(page);
  await expect(page.getByText('接続先: test-model @ http://ai.example.test/v1')).toBeVisible();
  await page.getByLabel('あなたの答え（入力は任意）').fill('I want to meet developers.');
  await page.getByRole('button', { name: 'AI に追加で質問してもらう' }).click();
  await expect(page.getByText('Cool! Who do you want to meet?')).toBeVisible();
  await expect(page.locator('.ai-bubble .badge-ai')).toHaveText('AI 応答');
  expect(auth).toBeUndefined();
  expect(body).toContain('Never invent facts');
  expect(body).toContain('I want to meet developers.');
  await shot(page, '09-ai');
});

test('オフラインでも開ける（Service Worker）', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByRole('heading', { name: '今日の練習' })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: '今日の練習' })).toBeVisible();
  await page.getByRole('button', { name: /^10分/ }).click();
  await expect(page.getByRole('heading', { name: '1 聞く' })).toBeVisible();
  await context.setOffline(false);
});

test('30分コース: 2場面 → 繰り返し説明 → まとめ', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^30分/ }).click();
  // 1場面 = 聞く・理解・まねる・置き換え・追加質問2・保存 = 7ステップ
  for (let i = 0; i < 14; i++) {
    if (i === 1 || i === 8) {
      await page.locator('.question').first().getByRole('button').first().click();
    }
    await next(page);
  }
  await expect(page.getByRole('heading', { name: '繰り返し説明' })).toBeVisible();
  for (const sec of [60, 45, 30]) {
    await expect(page.getByText(`${sec}秒`, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'スタート' }).click();
    await page.getByRole('button', { name: '話し終えた' }).click();
  }
  await expect(page.getByText('3回終わりました。', { exact: false })).toBeVisible();
  await next(page);
  await expect(page.getByText('繰り返し説明: 3 回')).toBeVisible();
  await expect(page.getByText(/場面: 初対面のあいさつ、聞き返す/)).toBeVisible();
});
