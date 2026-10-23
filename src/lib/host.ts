// claude.ai の Artifact として表示されているときだけ存在する window.claude を扱う。
// 通常のブラウザ（GitHub Pages など）では undefined。

interface ClaudeHost {
  use(name: string): Promise<unknown>;
}

export function claudeHost(): ClaudeHost | undefined {
  const c = (window as unknown as { claude?: ClaudeHost }).claude;
  return c && typeof c.use === 'function' ? c : undefined;
}

export function inArtifactFrame(): boolean {
  return !!claudeHost();
}

interface Downloads {
  save(r: { filename: string; data: Blob | string }): Promise<{ status: string }>;
}

/** ファイルを保存。Artifact 内では downloads 機能（確認つき）、通常はリンクでダウンロード */
export async function saveFile(filename: string, blob: Blob): Promise<'saved' | 'declined'> {
  const host = claudeHost();
  if (host) {
    const dl = (await host.use('downloads')) as Downloads | null;
    if (!dl) throw new Error('この表示ではファイルを保存できません');
    try {
      await dl.save({ filename, data: blob });
      return 'saved';
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === 'declined') return 'declined';
      throw new Error((e as Error).message || code || '保存できませんでした');
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return 'saved';
}
