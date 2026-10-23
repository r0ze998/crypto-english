export function AboutPage() {
  return (
    <div className="prose">
      <h1>このアプリについて</h1>

      <h2>練習の考え方</h2>
      <p className="small">
        以下は教材設計の根拠にした研究・資料です。どれも「効果を保証する」ものではなく、効果は人や使い方によって変わります。
      </p>
      <ul className="small">
        <li>
          <strong>分かる英語を聞く（約9割が分かる難度を目安に）</strong> — 未知語が多いと理解が急に下がることが、読解（Hu &amp; Nation, 2000）や聴解（van Zeeland &amp; Schmitt, 2013）の語彙カバー率研究で報告されています。聴解ではおよそ95%以上で安定するという報告もあるため、聞く前にキーワードを確認し、A2 版は短文・高頻度語にしています。「約9割」は目安で、学力判定ではありません。
        </li>
        <li>
          <strong>聞く前に問いを持つ</strong> — 聞く目的を先に示し、聞いた後に理解を確認する流れは、聴解指導の一般的な設計です（Field, 2008, <em>Listening in the Language Classroom</em>）。
        </li>
        <li>
          <strong>まねして言う（シャドーイング／リピート）</strong> — 日本の英語学習者を対象にした研究で、とくに初中級の学習者の聞き取り（語の認識）に効果が見られたという報告があります（Hamada, 2016, <em>Language Teaching Research</em>）。
        </li>
        <li>
          <strong>決まった言い回し（チャンク）を使う</strong> — 定型表現の使用は話す流暢さと関係するとされます。一方で、効果的な教え方はまだ確立していないとも整理されています（Boers &amp; Lindstromberg, 2012）。このアプリでは場面の中で使い、置き換え練習で自分の文にします。
        </li>
        <li>
          <strong>同じ説明を時間を縮めて繰り返す</strong> — Nation の 4/3/2 活動（同じ話を4分・3分・2分で3回）を、A2 向けに 60・45・30 秒に縮めています（Nation, 1989）。
        </li>
        <li>
          <strong>間隔を空けて思い出す復習</strong> — 練習テスト（想起練習）と分散学習は、学習法の大規模レビューで有用性が高いと評価されています（Dunlosky et al., 2013; Roediger &amp; Karpicke, 2006; Cepeda et al., 2006）。復習の間隔（1→2→4→7→15→30→60日）は目安です。
        </li>
        <li>
          <strong>発音は「伝わること」を優先</strong> — 訛りの強さと、伝わりやすさ・理解されやすさは別の尺度だとされます（Munro &amp; Derwing, 1995; Levis, 2005）。このアプリは発音を点数化しません。お手本と自分の録音を聞き比べ、自分でチェックします。
        </li>
        <li>
          <strong>場面（タスク）で練習する</strong> — 単語単位ではなく「自己紹介する」「理由を説明する」「予定を決める」など、実際にやることを単位にしています（Ellis, 2003, <em>Task-based Language Learning and Teaching</em>）。
        </li>
      </ul>

      <h2>教材について</h2>
      <ul className="small">
        <li>会話はすべてこのアプリ用に書いたオリジナルです。既存教材の転載はしていません。</li>
        <li>会話の「Sam」は練習用の架空の開発者です。Sam のゲームの内容は r0ze さんのプロジェクトの説明ではありません。</li>
        <li>あなたのプロジェクトについての文は、「プロジェクト資料」で確認済みにした情報か、あなたが入力した言葉だけを使います。未確認の仕様・実績・資金調達・ユーザー数は作りません。</li>
        <li>0xARK の固定ピッチは、原文が提供されるまで作文・再構成しません。提供後は原文を変更せず保存し、言い換えは別データです。</li>
      </ul>

      <h2>音声とプライバシー</h2>
      <table className="small table">
        <thead>
          <tr>
            <th>機能</th>
            <th>使う仕組み</th>
            <th>データの行き先</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>英語の読み上げ</td>
            <td>ブラウザの音声合成（Web Speech API）</td>
            <td>声の一覧で［端末内］の声は端末内で合成。［ネットワーク］の声は読み上げる英文が提供元（例: Google）へ送られる可能性あり。既定では端末内の声を優先。</td>
          </tr>
          <tr>
            <td>録音・再生</td>
            <td>MediaRecorder</td>
            <td>端末内（IndexedDB）のみ。送信しません。ボタンを押したときだけマイクを使い、停止するとマイクを閉じます。</td>
          </tr>
          <tr>
            <td>音声認識（任意）</td>
            <td>ブラウザの SpeechRecognition</td>
            <td>既定は無効。有効にした場合、Chrome は通常 Google のサーバーで認識、Safari は Apple のサーバーで処理される場合あり。</td>
          </tr>
          <tr>
            <td>AI 会話（任意）</td>
            <td>自分で指定した OpenAI 互換エンドポイント</td>
            <td>既定は接続なし。接続時は入力した答えのテキストと確認済み資料だけを送信。録音は送りません。</td>
          </tr>
        </tbody>
      </table>
      <p className="small muted">
        ブラウザごとの違い: iPhone の Safari / Chrome はどちらも WebKit を使うため、使える声は iOS の設定（設定 → アクセシビリティ → 読み上げコンテンツ → 声）に依存します。Android の Chrome は端末の音声エンジン（Google 音声サービスなど）に依存します。声が1つもない環境では自動的にテキスト練習になります。
      </p>

      <h2>参考文献</h2>
      <ul className="small refs">
        <li>Boers, F., &amp; Lindstromberg, S. (2012). Experimental and intervention studies on formulaic sequences in a second language. <em>Annual Review of Applied Linguistics, 32</em>, 83–110.</li>
        <li>Cepeda, N. J., et al. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. <em>Psychological Bulletin, 132</em>(3), 354–380.</li>
        <li>Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., &amp; Willingham, D. T. (2013). Improving students' learning with effective learning techniques. <em>Psychological Science in the Public Interest, 14</em>(1), 4–58.</li>
        <li>Ellis, R. (2003). <em>Task-based Language Learning and Teaching</em>. Oxford University Press.</li>
        <li>Field, J. (2008). <em>Listening in the Language Classroom</em>. Cambridge University Press.</li>
        <li>Hamada, Y. (2016). Shadowing: Who benefits and how? Uncovering a booming EFL teaching technique for listening comprehension. <em>Language Teaching Research, 20</em>(1), 35–52.</li>
        <li>Hu, M., &amp; Nation, I. S. P. (2000). Unknown vocabulary density and reading comprehension. <em>Reading in a Foreign Language, 13</em>(1), 403–430.</li>
        <li>Levis, J. M. (2005). Changing contexts and shifting paradigms in pronunciation teaching. <em>TESOL Quarterly, 39</em>(3), 369–377.</li>
        <li>Munro, M. J., &amp; Derwing, T. M. (1995). Foreign accent, comprehensibility, and intelligibility in the speech of second language learners. <em>Language Learning, 45</em>(1), 73–97.</li>
        <li>Nation, P. (1989). Improving speaking fluency. <em>System, 17</em>(3), 377–384.</li>
        <li>Roediger, H. L., &amp; Karpicke, J. D. (2006). Test-enhanced learning. <em>Psychological Science, 17</em>(3), 249–255.</li>
        <li>van Zeeland, H., &amp; Schmitt, N. (2013). Lexical coverage in L1 and L2 listening comprehension. <em>Applied Linguistics, 34</em>(4), 457–479.</li>
      </ul>
    </div>
  );
}
