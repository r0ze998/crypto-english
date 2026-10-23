import type { Scene } from './types';

// すべてオリジナルの教材。会話の「You」側は練習用の架空の開発者 Sam で、
// r0ze さんのプロジェクトの仕様・実績ではない。置き換え練習と追加質問で、
// プロジェクト資料（確認済みの項目のみ）や自分の言葉に置き換える。
//
// A2 版: 1文を短く、高頻度語中心。plus 版: 同じ内容をより自然な長さ・口語で。
// 理解度チェックは両方の版で共通（内容は同じ）。

export const SCENES: Scene[] = [
  {
    id: 's01-meet',
    group: 'meet',
    titleJa: '初対面のあいさつ',
    situationJa: 'ハッカソン会場で、海外の開発者 Alex に話しかけられた。',
    goalJa: '名前・拠点・何をしている人かを短く伝える。',
    partnerName: 'Alex',
    youName: 'Sam',
    glossary: [
      { en: 'developer', ja: '開発者' },
      { en: 'onchain game', ja: 'オンチェーンゲーム' },
      { en: 'wallet app', ja: 'ウォレットアプリ' },
      { en: 'be based in ~', ja: '〜を拠点にしている' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: "Hi! I'm Alex. Nice to meet you.", ja: 'やあ、Alex です。はじめまして。' },
        { speaker: 'you', en: "Hi, Alex. I'm Sam. Nice to meet you too.", ja: 'こんにちは Alex。Sam です。こちらこそはじめまして。' },
        { speaker: 'partner', en: 'Where are you from?', ja: 'どこから来たの？' },
        { speaker: 'you', en: "I'm from Japan. I live in Tokyo.", ja: '日本から来ました。東京に住んでいます。' },
        { speaker: 'partner', en: 'Cool. Are you a developer?', ja: 'いいね。開発者なの？' },
        { speaker: 'you', en: 'Yes. I make games. Onchain games.', ja: 'はい。ゲームを作っています。オンチェーンゲームです。' },
        { speaker: 'partner', en: 'Oh, nice! I work on a wallet app.', ja: 'おお、いいね！僕はウォレットアプリを作ってるよ。' },
      ],
      plus: [
        { speaker: 'partner', en: "Hey, I'm Alex. Good to meet you.", ja: 'やあ、Alex です。会えてうれしいよ。' },
        { speaker: 'you', en: "Hi Alex, I'm Sam. Nice to meet you too.", ja: 'こんにちは Alex、Sam です。こちらこそ。' },
        { speaker: 'partner', en: 'So where are you based?', ja: 'で、どこを拠点にしてるの？' },
        { speaker: 'you', en: "I'm based in Tokyo, Japan.", ja: '日本の東京を拠点にしています。' },
        { speaker: 'partner', en: 'Nice. Are you building something here?', ja: 'いいね。ここで何か作ってるの？' },
        { speaker: 'you', en: "Yeah, I'm a game developer. I mainly build onchain games.", ja: 'はい、ゲーム開発者です。主にオンチェーンゲームを作っています。' },
        { speaker: 'partner', en: "Oh, cool. I'm working on a wallet app myself.", ja: 'おお、いいね。僕自身はウォレットアプリを作ってるんだ。' },
      ],
    },
    questions: [
      {
        q: 'Sam はどこに住んでいる？',
        choices: ['東京', '大阪', 'ソウル'],
        answer: 0,
        explainJa: '"I live in Tokyo." / "I\'m based in Tokyo" と言っています。',
      },
      {
        q: 'Alex は何を作っている？',
        choices: ['ゲーム', 'ウォレットアプリ', '取引所'],
        answer: 1,
        explainJa: '最後に "I work on a wallet app." と言っています。',
      },
    ],
    phrases: [
      { id: 's01-p1', en: 'Nice to meet you.', ja: 'はじめまして。' },
      { id: 's01-p2', en: 'Where are you based?', ja: 'どこを拠点にしていますか？', noteJa: '"Where are you from?" より仕事の場で自然なことが多い。' },
      { id: 's01-p3', en: "I'm a game developer.", ja: 'ゲーム開発者です。' },
      { id: 's01-p4', en: 'I make onchain games.', ja: 'オンチェーンゲームを作っています。' },
      { id: 's01-p5', en: "I'm working on ~.", ja: '〜を作っています（取り組んでいます）。' },
    ],
    shadow: { en: "I'm a game developer. I make onchain games.", ja: 'ゲーム開発者です。オンチェーンゲームを作っています。' },
    frame: {
      template: "Hi, I'm {name}. I'm a {role} from {place}.",
      ja: 'こんにちは、{name} です。{place} の {role} です。',
      slots: [
        { key: 'name', labelJa: '名前', placeholder: 'r0ze', fromSetting: 'name' },
        { key: 'role', labelJa: '役割', placeholder: 'game developer', options: ['game developer', 'developer'] },
        { key: 'place', labelJa: '拠点', placeholder: 'Japan', options: ['Japan'] },
      ],
    },
    followUps: [
      {
        en: 'Nice to meet you! What brings you here today?',
        ja: 'はじめまして！今日はどうしてここに？',
        hintJa: '目的を一言で。"I want to ~." / "I\'m here to ~." が使える。',
        models: [
          { en: 'I want to meet other game developers.', ja: '他のゲーム開発者に会いたくて。' },
          { en: "I'm here to learn about new projects.", ja: '新しいプロジェクトについて知りたくて来ました。' },
        ],
      },
      {
        en: 'How long have you been making games?',
        ja: 'ゲームを作ってどれくらい？',
        hintJa: '期間を答える。正確でなくてよい: "for about [ ] years"。',
        models: [
          { en: 'For about [ ] years.', ja: '[ ] 年くらいです。' },
          { en: 'Not long. About one year.', ja: 'そんなに長くないです。1年くらい。' },
        ],
      },
    ],
  },
  {
    id: 's09-repeat',
    group: 'clarify',
    titleJa: '聞き返す・ゆっくり話してもらう',
    situationJa: '騒がしい会場で、相手が早口で知らない言葉を使った。',
    goalJa: 'もう一度言ってもらう・意味を聞く・ゆっくり話してもらう。',
    partnerName: 'Mia',
    youName: 'Sam',
    glossary: [
      { en: 'session key', ja: 'セッションキー（一度の承認で一定時間操作できる鍵）' },
      { en: 'sign', ja: '（トランザクションに）署名する' },
      { en: 'move', ja: '（ゲームの）一手・操作' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: 'So, our game uses session keys.', ja: 'それで、うちのゲームはセッションキーを使ってるの。' },
        { speaker: 'you', en: 'Sorry, could you say that again?', ja: 'すみません、もう一度言ってもらえますか？' },
        { speaker: 'partner', en: 'Sure. Our game uses session keys.', ja: 'もちろん。うちのゲームはセッションキーを使ってるの。' },
        { speaker: 'you', en: 'Session keys? What does that mean?', ja: 'セッションキー？どういう意味ですか？' },
        { speaker: 'partner', en: 'Players sign once. Then they can play without signing every move.', ja: 'プレイヤーは一度だけ署名する。そのあとは毎回署名せずに遊べるの。' },
        { speaker: 'you', en: 'Could you speak a little more slowly?', ja: 'もう少しゆっくり話してもらえますか？' },
        { speaker: 'partner', en: 'Of course. Players sign only once.', ja: 'もちろん。プレイヤーは一回だけ署名するの。' },
        { speaker: 'you', en: 'Got it. Thanks!', ja: 'わかりました。ありがとう！' },
      ],
      plus: [
        { speaker: 'partner', en: 'So in our game, we rely on session keys to keep things smooth.', ja: 'うちのゲームでは、操作をスムーズにするためにセッションキーを使ってるの。' },
        { speaker: 'you', en: "Sorry, I didn't catch that. Could you say it again?", ja: 'すみません、聞き取れませんでした。もう一度お願いできますか？' },
        { speaker: 'partner', en: 'Sure. We use session keys.', ja: 'もちろん。セッションキーを使ってるの。' },
        { speaker: 'you', en: 'What do you mean by "session keys"?', ja: '「セッションキー」とはどういう意味ですか？' },
        { speaker: 'partner', en: "Basically, players approve once, and then they don't have to sign every single move.", ja: '要するに、プレイヤーは一度承認すれば、一手ごとに署名しなくていいの。' },
        { speaker: 'you', en: "Okay. Could you slow down a little? My English isn't perfect yet.", ja: 'なるほど。少しゆっくり話してもらえますか？英語がまだ完璧じゃなくて。' },
        { speaker: 'partner', en: 'No problem. Players approve once at the start.', ja: '大丈夫。プレイヤーは最初に一度だけ承認するの。' },
        { speaker: 'you', en: 'Got it. That makes sense. Thanks.', ja: 'わかりました。納得です。ありがとう。' },
      ],
    },
    questions: [
      {
        q: 'セッションキーを使うと、プレイヤーは？',
        choices: ['一手ごとに署名しなくてよい', '手数料が無料になる', 'ウォレットが要らなくなる'],
        answer: 0,
        explainJa: '"Then they can play without signing every move." と言っています。',
      },
      {
        q: 'Sam が相手に頼んだことは？',
        choices: ['もう一度言う・ゆっくり話す', 'メッセージで送る', '日本語で話す'],
        answer: 0,
        explainJa: '"Could you say that again?" と "Could you speak a little more slowly?" の2つです。',
      },
    ],
    phrases: [
      { id: 's09-p1', en: 'Sorry, could you say that again?', ja: 'すみません、もう一度言ってもらえますか？' },
      { id: 's09-p2', en: "Sorry, I didn't catch that.", ja: 'すみません、聞き取れませんでした。' },
      { id: 's09-p3', en: 'What do you mean by ~?', ja: '〜とはどういう意味ですか？', noteJa: '分からない単語をそのまま入れて聞ける。' },
      { id: 's09-p4', en: 'Could you speak a little more slowly?', ja: 'もう少しゆっくり話してもらえますか？' },
      { id: 's09-p5', en: 'Got it. That makes sense.', ja: 'わかりました。納得です。' },
    ],
    shadow: { en: 'Sorry, could you say that again?', ja: 'すみません、もう一度言ってもらえますか？' },
    frame: {
      template: 'Sorry, what do you mean by {term}?',
      ja: 'すみません、{term} とはどういう意味ですか？',
      slots: [
        { key: 'term', labelJa: '分からなかった言葉', placeholder: 'composability', options: ['session keys', 'composability', 'account abstraction', 'DX'] },
      ],
    },
    followUps: [
      {
        en: "We put the whole game state onchain, so it's fully composable.",
        ja: 'ゲームの状態を全部オンチェーンに置いているから、完全にコンポーザブル（組み合わせ可能）なんだ。',
        hintJa: '分からない語があれば、そのまま聞き返す練習。分かっても聞き返してみよう。',
        models: [
          { en: 'Sorry, what do you mean by "composable"?', ja: 'すみません、「コンポーザブル」とはどういう意味ですか？' },
          { en: 'Could you say that again more slowly?', ja: 'もう一度、ゆっくり言ってもらえますか？' },
        ],
      },
      {
        en: 'Have you tried the new SDK? The DX is way better now.',
        ja: '新しい SDK 試した？DX（開発者体験）がかなり良くなったよ。',
        hintJa: '略語（DX = developer experience）が分からないときの聞き方。',
        models: [
          { en: 'Not yet. Sorry, what does DX mean?', ja: 'まだです。すみません、DX ってどういう意味ですか？' },
          { en: 'Yes, I tried it. It was easier to use.', ja: 'はい、試しました。使いやすかったです。' },
        ],
      },
    ],
  },
  {
    id: 's02-building',
    group: 'meet',
    titleJa: '何を作っているか話す',
    situationJa: '自己紹介のあと「何を作ってるの？」と聞かれた。',
    goalJa: '作っているものを一文で言い、状況を一言添える。',
    partnerName: 'Alex',
    youName: 'Sam',
    glossary: [
      { en: 'strategy game', ja: '戦略ゲーム' },
      { en: 'live', ja: '公開中・稼働中' },
      { en: 'test', ja: 'テストする' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: 'So, what are you building?', ja: 'それで、何を作ってるの？' },
        { speaker: 'you', en: "I'm building an onchain game.", ja: 'オンチェーンゲームを作っています。' },
        { speaker: 'partner', en: 'Oh, nice. What kind of game?', ja: 'へえ、いいね。どんなゲーム？' },
        { speaker: 'you', en: "It's a strategy game. Players build a city together.", ja: '戦略ゲームです。プレイヤーが一緒に街を作ります。' },
        { speaker: 'partner', en: 'Is it live now?', ja: 'もう公開されてる？' },
        { speaker: 'you', en: "Not yet. We're still testing it.", ja: 'まだです。まだテスト中です。' },
        { speaker: 'partner', en: "Cool. I'd like to try it.", ja: 'いいね。試してみたいな。' },
      ],
      plus: [
        { speaker: 'partner', en: 'So what are you working on these days?', ja: '最近は何に取り組んでるの？' },
        { speaker: 'you', en: "I'm building an onchain strategy game.", ja: 'オンチェーンの戦略ゲームを作っています。' },
        { speaker: 'partner', en: "Nice. What's it about?", ja: 'いいね。どんな内容？' },
        { speaker: 'you', en: 'Players build a city together, and the whole world lives onchain.', ja: 'プレイヤーが一緒に街を作って、世界全体がオンチェーンにあります。' },
        { speaker: 'partner', en: 'Is it live yet?', ja: 'もう公開してる？' },
        { speaker: 'you', en: "Not yet. We're still testing it with a small group.", ja: 'まだです。少人数でテストしているところです。' },
        { speaker: 'partner', en: "Sounds fun. I'd love to try it when it's ready.", ja: '楽しそう。準備ができたらぜひ試したいな。' },
      ],
    },
    questions: [
      {
        q: 'Sam のゲームはどんなゲーム？（この会話の中の架空のゲーム）',
        choices: ['みんなで街を作る戦略ゲーム', 'パズルゲーム', 'レースゲーム'],
        answer: 0,
        explainJa: '"It\'s a strategy game. Players build a city together." と言っています。',
      },
      {
        q: 'ゲームはもう公開されている？',
        choices: ['まだテスト中', 'もう公開中', '開発を止めた'],
        answer: 0,
        explainJa: '"Not yet. We\'re still testing it." と言っています。',
      },
    ],
    phrases: [
      { id: 's02-p1', en: 'What are you building?', ja: '何を作っていますか？' },
      { id: 's02-p2', en: "I'm building ~.", ja: '〜を作っています。' },
      { id: 's02-p3', en: 'What kind of game?', ja: 'どんな種類のゲーム？' },
      { id: 's02-p4', en: "Not yet. We're still testing it.", ja: 'まだです。テスト中です。' },
      { id: 's02-p5', en: "I'd love to try it.", ja: 'ぜひ試してみたい。' },
    ],
    shadow: { en: "I'm building an onchain game.", ja: 'オンチェーンゲームを作っています。' },
    frame: {
      template: "I'm building {what}.",
      ja: '{what} を作っています。',
      slots: [
        { key: 'what', labelJa: '作っているもの', placeholder: 'an onchain game', options: ['an onchain game'], projectField: 'oneLiner' },
      ],
    },
    followUps: [
      {
        en: 'What kind of game is it?',
        ja: 'どんな種類のゲーム？',
        hintJa: 'ジャンルを一言 + 一文の説明。プロジェクト資料が未入力なら、自分の言葉で。',
        models: [
          { en: "It's a [genre] game. Players [ ].", ja: '[ジャンル] のゲームです。プレイヤーは [ ]。' },
        ],
        projectFields: ['genre', 'oneLiner'],
      },
      {
        en: 'Is it live yet?',
        ja: 'もう公開されてる？',
        hintJa: '事実に合う答えを選ぶ。言えないことは言わなくてよい。',
        models: [
          { en: "Not yet. We're still building it.", ja: 'まだです。まだ作っています。' },
          { en: 'Yes, you can play it now.', ja: 'はい、今遊べます。' },
          { en: "I can't share the date yet.", ja: '日程はまだ言えないんです。' },
        ],
        projectFields: ['stage'],
      },
    ],
  },
  {
    id: 's03-howtoplay',
    group: 'explain',
    titleJa: 'ゲームの遊び方を説明する',
    situationJa: '相手が「どうやって遊ぶの？」と聞いてきた。（会話のゲームは練習用の架空例）',
    goalJa: 'First / Then を使って、順番に短く説明する。',
    partnerName: 'Alex',
    youName: 'Sam',
    glossary: [
      { en: 'connect your wallet', ja: 'ウォレットを接続する' },
      { en: 'land / plot of land', ja: '土地 / 区画' },
      { en: 'resources', ja: '資源' },
      { en: 'trade', ja: '交換する・取引する' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: 'How do you play your game?', ja: 'そのゲーム、どうやって遊ぶの？' },
        { speaker: 'you', en: 'First, you connect your wallet.', ja: 'まず、ウォレットを接続します。' },
        { speaker: 'you', en: 'Then you get a small piece of land.', ja: '次に、小さな土地をもらいます。' },
        { speaker: 'you', en: 'You collect wood and stone. You build houses.', ja: '木や石を集めて、家を建てます。' },
        { speaker: 'partner', en: 'Can players fight?', ja: 'プレイヤー同士で戦える？' },
        { speaker: 'you', en: 'No. But they can trade items with each other.', ja: 'いいえ。でもお互いにアイテムを交換できます。' },
        { speaker: 'partner', en: 'How long is one game?', ja: '1ゲームはどれくらいの長さ？' },
        { speaker: 'you', en: "There is no end. The world keeps going.", ja: '終わりはありません。世界はずっと続きます。' },
      ],
      plus: [
        { speaker: 'partner', en: 'Okay, walk me through it. How does a player start?', ja: 'じゃあ順に教えて。プレイヤーはどう始めるの？' },
        { speaker: 'you', en: 'First, you connect your wallet, and you get a small plot of land.', ja: 'まずウォレットを接続して、小さな区画をもらいます。' },
        { speaker: 'you', en: 'Then you gather resources like wood and stone, and use them to build.', ja: '次に木や石などの資源を集めて、それで建物を作ります。' },
        { speaker: 'partner', en: 'Is there any combat?', ja: '戦闘はある？' },
        { speaker: 'you', en: 'Not right now. The focus is on trading and building together.', ja: '今はありません。交換と、一緒に作ることが中心です。' },
        { speaker: 'partner', en: 'And how long does a match last?', ja: '1試合はどれくらい続くの？' },
        { speaker: 'you', en: "There aren't really matches. It's a persistent world, so it just keeps running.", ja: '試合という形ではないんです。永続する世界なので、ずっと動き続けます。' },
      ],
    },
    questions: [
      {
        q: '最初にすることは？',
        choices: ['ウォレットを接続する', 'アイテムを買う', 'チームを作る'],
        answer: 0,
        explainJa: '"First, you connect your wallet." と言っています。',
      },
      {
        q: 'プレイヤー同士の戦闘は？',
        choices: ['今はない（交換はできる）', 'ある', '有料プランだけ'],
        answer: 0,
        explainJa: '"No. But they can trade items with each other." と言っています。',
      },
    ],
    phrases: [
      { id: 's03-p1', en: 'First, you ~. Then you ~.', ja: 'まず〜します。次に〜します。' },
      { id: 's03-p2', en: 'Walk me through it.', ja: '順を追って説明して。', noteJa: '相手が使う表現。聞いて分かれば十分。' },
      { id: 's03-p3', en: 'They can trade items with each other.', ja: 'お互いにアイテムを交換できます。' },
      { id: 's03-p4', en: 'The focus is on ~.', ja: '〜が中心です。' },
      { id: 's03-p5', en: 'The world keeps going.', ja: '世界はずっと続きます。' },
    ],
    shadow: { en: 'First, you connect your wallet. Then you get a small piece of land.', ja: 'まずウォレットを接続します。次に小さな土地をもらいます。' },
    frame: {
      template: 'First, you {step1}. Then you {step2}.',
      ja: 'まず {step1}。次に {step2}。',
      slots: [
        { key: 'step1', labelJa: '最初にすること', placeholder: 'connect your wallet', projectField: 'howToPlay' },
        { key: 'step2', labelJa: '次にすること', placeholder: '...', projectField: 'howToPlay' },
      ],
    },
    followUps: [
      {
        en: 'What does a new player do first?',
        ja: '新しいプレイヤーは最初に何をするの？',
        hintJa: '"First, you ~." で一文。仕様が未確定なら "We\'re still deciding." でもよい。',
        models: [
          { en: 'First, you [ ].', ja: 'まず [ ] します。' },
          { en: "We're still deciding that part.", ja: 'そこはまだ検討中です。' },
        ],
        projectFields: ['howToPlay'],
      },
      {
        en: "What's the goal of the game?",
        ja: 'ゲームの目的は何？',
        hintJa: '"The goal is to ~." が便利。',
        models: [
          { en: 'The goal is to [ ].', ja: '目的は [ ] することです。' },
          { en: "There's no single goal. You can [ ].", ja: '決まった目的はありません。[ ] できます。' },
        ],
        projectFields: ['howToPlay'],
      },
    ],
  },
  {
    id: 's04-whychain',
    group: 'explain',
    titleJa: 'なぜブロックチェーンを使うのか',
    situationJa: '「なぜわざわざブロックチェーン？」と率直に聞かれた。',
    goalJa: '理由を2つ、First / Second で言う。弱点を指摘されたら認める。',
    partnerName: 'Jordan',
    youName: 'Sam',
    glossary: [
      { en: 'own', ja: '所有する' },
      { en: 'rules', ja: 'ルール' },
      { en: 'check / verify', ja: '確かめる / 検証する' },
      { en: 'onboarding', ja: '新規ユーザーが使い始めるまでの流れ' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: 'Why do you use a blockchain?', ja: 'なぜブロックチェーンを使うの？' },
        { speaker: 'you', en: 'Good question. There are two reasons.', ja: 'いい質問ですね。理由は2つあります。' },
        { speaker: 'you', en: 'First, players can really own their items.', ja: '1つ目に、プレイヤーがアイテムを本当に所有できます。' },
        { speaker: 'you', en: 'Second, the rules are open. Anyone can check them.', ja: '2つ目に、ルールが公開されています。誰でも確かめられます。' },
        { speaker: 'partner', en: 'But wallets are hard for new players, right?', ja: 'でも、新しいプレイヤーにはウォレットが難しいよね？' },
        { speaker: 'you', en: "Yes, that's true. We want to make it easier.", ja: 'はい、その通りです。もっと簡単にしたいと思っています。' },
      ],
      plus: [
        { speaker: 'partner', en: 'Honest question: why put the game on a blockchain at all?', ja: '率直な質問だけど、そもそもなぜゲームをブロックチェーンに？' },
        { speaker: 'you', en: 'Good question. For us, there are two main reasons.', ja: 'いい質問です。私たちにとっては主な理由が2つあります。' },
        { speaker: 'you', en: 'One, players actually own their items, not just the company.', ja: '1つ目、会社だけでなくプレイヤーが実際にアイテムを所有します。' },
        { speaker: 'you', en: 'Two, the rules are public, so anyone can verify them.', ja: '2つ目、ルールが公開されているので誰でも検証できます。' },
        { speaker: 'partner', en: "Sure, but wallets are still a pain for new players, aren't they?", ja: 'なるほど。でも新しいプレイヤーにとってウォレットはまだ面倒だよね？' },
        { speaker: 'you', en: "That's true. Onboarding is a big challenge, and we're working on it.", ja: 'その通りです。オンボーディングは大きな課題で、取り組んでいるところです。' },
      ],
    },
    questions: [
      {
        q: '1つ目の理由は？',
        choices: ['プレイヤーがアイテムを本当に所有できる', '処理が速い', '開発が簡単'],
        answer: 0,
        explainJa: '"First, players can really own their items." と言っています。',
      },
      {
        q: '相手が指摘した問題は？',
        choices: ['新しいプレイヤーにはウォレットが難しい', '手数料が高い', 'ゲームがつまらない'],
        answer: 0,
        explainJa: '"But wallets are hard for new players, right?" と言っています。',
      },
    ],
    phrases: [
      { id: 's04-p1', en: 'Good question.', ja: 'いい質問ですね。', noteJa: '考える時間を作るのにも使える。' },
      { id: 's04-p2', en: 'There are two reasons.', ja: '理由は2つあります。' },
      { id: 's04-p3', en: 'First, ~. Second, ~.', ja: '1つ目に〜。2つ目に〜。' },
      { id: 's04-p4', en: 'Anyone can check them.', ja: '誰でも確かめられます。' },
      { id: 's04-p5', en: "That's true. We're working on it.", ja: 'その通りです。取り組んでいます。' },
    ],
    shadow: { en: 'First, players can really own their items.', ja: '1つ目に、プレイヤーがアイテムを本当に所有できます。' },
    frame: {
      template: 'We use a blockchain because {reason}.',
      ja: '{reason} なので、ブロックチェーンを使っています。',
      slots: [
        {
          key: 'reason',
          labelJa: '理由（自分のプロジェクトで本当の理由を）',
          placeholder: 'players can own their items',
          options: ['players can own their items', 'the rules are open', 'other developers can build on it'],
          projectField: 'whyBlockchain',
        },
      ],
    },
    followUps: [
      {
        en: "Couldn't you just use a normal server?",
        ja: '普通のサーバーでもよくない？',
        hintJa: 'まず部分的に同意 → "But ~." で理由。',
        models: [
          { en: "Yes, we could. But then players don't really own their items.", ja: 'はい、できます。でもそれだとプレイヤーはアイテムを本当には所有できません。' },
          { en: 'Maybe. But we want the rules to be open.', ja: 'そうかも。でもルールを公開したいんです。' },
        ],
        projectFields: ['whyBlockchain'],
      },
      {
        en: "What's the biggest downside?",
        ja: '一番のデメリットは？',
        hintJa: '弱点を正直に一つ。"One problem is ~."',
        models: [
          { en: 'One problem is wallets. They are hard for new players.', ja: '一つの問題はウォレットです。新しいプレイヤーには難しい。' },
          { en: 'Every action takes a little time.', ja: '操作ごとに少し時間がかかります。' },
        ],
      },
    ],
  },
  {
    id: 's10-dontknow',
    group: 'clarify',
    titleJa: '分からないことを認める',
    situationJa: '数字や予定を聞かれたが、正確には分からない。',
    goalJa: '推測で答えず「確認して連絡する」と言う。',
    partnerName: 'Priya',
    youName: 'Sam',
    glossary: [
      { en: 'exact number', ja: '正確な数字' },
      { en: 'get back to you', ja: '（あとで）折り返し連絡する' },
      { en: 'gas cost', ja: 'ガス代（取引手数料）' },
      { en: 'DM', ja: 'ダイレクトメッセージ（を送る）' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: 'How many players do you have?', ja: 'プレイヤーは何人いるの？' },
        { speaker: 'you', en: "Sorry, I don't have the exact number now.", ja: 'すみません、今は正確な数字が手元にありません。' },
        { speaker: 'you', en: 'Let me check and get back to you.', ja: '確認して、あとで連絡します。' },
        { speaker: 'partner', en: 'Sure. What about your gas costs?', ja: 'わかった。ガス代はどう？' },
        { speaker: 'you', en: "Hmm, I'm not sure. I need to check.", ja: 'うーん、分かりません。確認が必要です。' },
        { speaker: 'partner', en: 'No problem. Just send me a message.', ja: '大丈夫。メッセージで送ってくれればいいよ。' },
        { speaker: 'you', en: "Thanks. I'll send it tomorrow.", ja: 'ありがとう。明日送ります。' },
      ],
      plus: [
        { speaker: 'partner', en: 'How many daily players are you seeing right now?', ja: '今、1日に何人くらいプレイしてる？' },
        { speaker: 'you', en: "I don't have the exact number with me. Can I check and get back to you?", ja: '正確な数字が手元にないんです。確認してから連絡してもいいですか？' },
        { speaker: 'partner', en: "Of course. And what's your average cost per transaction?", ja: 'もちろん。あと、1トランザクションあたりの平均コストは？' },
        { speaker: 'you', en: "Honestly, I'm not sure. I'd rather check than guess.", ja: '正直、分かりません。推測するより確認したいです。' },
        { speaker: 'partner', en: 'Fair enough. Just DM me later.', ja: 'もっともだね。あとで DM して。' },
        { speaker: 'you', en: "Will do. I'll send it over tomorrow.", ja: 'そうします。明日送ります。' },
      ],
    },
    questions: [
      {
        q: 'プレイヤー数を聞かれて、Sam はどうした？',
        choices: ['確認してあとで連絡すると言った', '1000人と答えた', '答えるのを断った'],
        answer: 0,
        explainJa: '"Let me check and get back to you." と言っています。',
      },
      {
        q: 'Sam はいつ連絡する？',
        choices: ['明日', '来週', '今日の夜'],
        answer: 0,
        explainJa: '"I\'ll send it tomorrow." と言っています。',
      },
    ],
    phrases: [
      { id: 's10-p1', en: "I don't have the exact number now.", ja: '今は正確な数字が手元にありません。' },
      { id: 's10-p2', en: 'Let me check and get back to you.', ja: '確認して、あとで連絡します。' },
      { id: 's10-p3', en: "I'm not sure.", ja: '分かりません（確かではありません）。' },
      { id: 's10-p4', en: "I'd rather check than guess.", ja: '推測するより確認したいです。', noteJa: '未確認の数字を言わないための便利な一言。' },
      { id: 's10-p5', en: "I can't share that yet.", ja: 'それはまだ共有できません。' },
    ],
    shadow: { en: 'Let me check and get back to you.', ja: '確認して、あとで連絡します。' },
    frame: {
      template: "I'm not sure about {topic}. Let me check and get back to you.",
      ja: '{topic} については分かりません。確認して連絡します。',
      slots: [
        { key: 'topic', labelJa: '分からないこと', placeholder: 'the exact number', options: ['the exact number', 'the release date', 'the fees'] },
      ],
    },
    followUps: [
      {
        en: 'When are you launching?',
        ja: 'いつローンチするの？',
        hintJa: '確定していなければ推測しない。',
        models: [
          { en: "I'm not sure yet. Let me check and get back to you.", ja: 'まだ分かりません。確認して連絡します。' },
          { en: "We haven't decided yet.", ja: 'まだ決めていません。（事実なら）' },
        ],
        projectFields: ['stage'],
      },
      {
        en: 'Are you raising money right now?',
        ja: '今、資金調達してる？',
        hintJa: '資金調達は事実だけを話す。言えないなら言えないと言う。',
        models: [
          { en: "I can't share that right now.", ja: '今はそれをお伝えできません。' },
          { en: 'Let me check with my team first.', ja: 'まずチームに確認させてください。' },
        ],
        projectFields: ['funding'],
      },
    ],
  },
  {
    id: 's05-solana',
    group: 'explain',
    titleJa: 'Solana を簡単に説明する',
    situationJa: '「なぜ Solana を選んだの？」と聞かれた。（会話の Sam は架空の開発者）',
    goalJa: 'チェーンの特徴を短く言い、ゲームにとってなぜ大事かをつなげる。',
    partnerName: 'Jordan',
    youName: 'Sam',
    glossary: [
      { en: 'fees', ja: '手数料' },
      { en: 'transaction', ja: 'トランザクション（取引・操作の記録）' },
      { en: 'tools / tooling', ja: '開発ツール' },
      { en: 'learning curve', ja: '習得の難しさ' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: 'Why did you choose Solana?', ja: 'なぜ Solana を選んだの？' },
        { speaker: 'you', en: 'Solana is fast.', ja: 'Solana は速いんです。' },
        { speaker: 'you', en: 'And the fees are usually very low.', ja: 'それに手数料がたいていとても安い。' },
        { speaker: 'you', en: 'That is important for games. Players do many small actions.', ja: 'それはゲームにとって大事です。プレイヤーは小さな操作をたくさんするので。' },
        { speaker: 'partner', en: 'Is it hard to build on?', ja: '開発は難しい？' },
        { speaker: 'you', en: 'A little. But there are good tools now.', ja: '少しだけ。でも今は良いツールがあります。' },
      ],
      plus: [
        { speaker: 'partner', en: 'What made you pick Solana?', ja: '何が決め手で Solana にしたの？' },
        { speaker: 'you', en: 'Mainly speed and cost. Transactions confirm quickly, and fees are usually tiny.', ja: '主に速さとコストです。トランザクションがすぐ確定して、手数料もたいていごくわずかです。' },
        { speaker: 'you', en: 'That matters a lot in games, because players make lots of small moves.', ja: 'ゲームではそれがとても重要です。プレイヤーは小さな操作をたくさんするので。' },
        { speaker: 'partner', en: "How's the developer experience?", ja: '開発者体験はどう？' },
        { speaker: 'you', en: "There's a learning curve, but the tooling has gotten much better.", ja: '慣れるまで少し大変ですが、ツールはずっと良くなりました。' },
      ],
    },
    questions: [
      {
        q: 'Solana を選んだ理由は？',
        choices: ['速くて手数料がたいてい安い', '一番有名だから', '完全に無料だから'],
        answer: 0,
        explainJa: '"Solana is fast. And the fees are usually very low." と言っています。',
      },
      {
        q: 'なぜそれがゲームに大事？',
        choices: ['プレイヤーが小さな操作をたくさんするから', 'グラフィックがきれいになるから', '広告が出せるから'],
        answer: 0,
        explainJa: '"Players do many small actions." と言っています。',
      },
    ],
    phrases: [
      { id: 's05-p1', en: 'The fees are usually very low.', ja: '手数料はたいていとても安いです。', noteJa: '"usually" を付けると言い過ぎにならない。' },
      { id: 's05-p2', en: 'That is important for games.', ja: 'それはゲームにとって大事です。' },
      { id: 's05-p3', en: 'Players do many small actions.', ja: 'プレイヤーは小さな操作をたくさんします。' },
      { id: 's05-p4', en: "There's a learning curve.", ja: '慣れるまで少し大変です。' },
      { id: 's05-p5', en: 'The tooling has gotten much better.', ja: 'ツールはずっと良くなりました。' },
    ],
    shadow: { en: 'That is important for games. Players do many small actions.', ja: 'それはゲームにとって大事です。プレイヤーは小さな操作をたくさんします。' },
    frame: {
      template: 'We use {chain} because {reason}.',
      ja: '{reason} なので {chain} を使っています。',
      slots: [
        { key: 'chain', labelJa: 'チェーン', placeholder: '(資料で確認)', projectField: 'chain' },
        { key: 'reason', labelJa: '理由', placeholder: 'it is fast', options: ['it is fast', 'the fees are low', 'the tools are good'] },
      ],
    },
    followUps: [
      {
        en: 'What is Solana, in one sentence?',
        ja: 'Solana って一言でいうと何？',
        hintJa: '一般的な説明でよい。"~ is a blockchain." から。',
        models: [
          { en: 'Solana is a fast blockchain with low fees.', ja: 'Solana は手数料が安い高速なブロックチェーンです。' },
        ],
      },
      {
        en: 'Have you used other chains before?',
        ja: '他のチェーンを使ったことはある？',
        hintJa: '自分の経験を一文で。',
        models: [
          { en: "Yes, I've used [ ] before.", ja: 'はい、以前 [ ] を使いました。' },
          { en: 'No, this is my first one.', ja: 'いいえ、これが初めてです。' },
        ],
      },
    ],
  },
  {
    id: 's06-agents',
    group: 'explain',
    titleJa: 'AI エージェントを説明する',
    situationJa: '「AI エージェントって何？ゲームで何をするの？」と聞かれた。',
    goalJa: 'AI エージェントを一文で定義し、例を一つ挙げる。',
    partnerName: 'Mia',
    youName: 'Sam',
    glossary: [
      { en: 'agent', ja: 'エージェント（自分で動くプログラム）' },
      { en: 'by itself / on its own', ja: '自分で・ひとりで' },
      { en: 'take actions', ja: '行動する' },
      { en: 'cheat', ja: 'ずるをする' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: 'What is an AI agent?', ja: 'AI エージェントって何？' },
        { speaker: 'you', en: "It's a program that can act by itself.", ja: '自分で行動できるプログラムです。' },
        { speaker: 'you', en: 'It can make choices and take actions.', ja: '判断して、行動できます。' },
        { speaker: 'partner', en: 'What do agents do in a game?', ja: 'ゲームの中でエージェントは何をするの？' },
        { speaker: 'you', en: 'They can play like players. For example, they can trade or build.', ja: 'プレイヤーのように遊べます。例えば、交換したり建てたりできます。' },
        { speaker: 'partner', en: 'Can they cheat?', ja: 'ずるはできるの？' },
        { speaker: 'you', en: 'No. They follow the same rules as players.', ja: 'いいえ。プレイヤーと同じルールに従います。' },
      ],
      plus: [
        { speaker: 'partner', en: 'When you say "AI agent," what exactly do you mean?', ja: '「AI エージェント」って、具体的にはどういう意味？' },
        { speaker: 'you', en: "Basically, it's a program that can decide what to do and then act on its own.", ja: '要するに、何をするか決めて、自分で行動できるプログラムです。' },
        { speaker: 'partner', en: 'So what would an agent actually do in a game?', ja: 'じゃあゲームの中で実際に何をするの？' },
        { speaker: 'you', en: 'It could play alongside humans, like trading, building, or even running a shop.', ja: '人間と一緒にプレイできます。交換したり、建てたり、お店を運営したり。' },
        { speaker: 'partner', en: "Doesn't that make cheating easier?", ja: 'それだとずるしやすくならない？' },
        { speaker: 'you', en: 'Not really. Agents go through the same onchain rules as everyone else.', ja: 'そうでもないです。エージェントも他のみんなと同じオンチェーンのルールを通ります。' },
      ],
    },
    questions: [
      {
        q: 'AI エージェントとは？',
        choices: ['自分で判断して行動するプログラム', '人間のプレイヤー', 'ウォレットの一種'],
        answer: 0,
        explainJa: '"It\'s a program that can act by itself." と言っています。',
      },
      {
        q: 'エージェントはずるができる？',
        choices: ['プレイヤーと同じルールに従う', '何でもできる', 'まだ分からない'],
        answer: 0,
        explainJa: '"They follow the same rules as players." と言っています。',
      },
    ],
    phrases: [
      { id: 's06-p1', en: "It's a program that can act by itself.", ja: '自分で行動できるプログラムです。' },
      { id: 's06-p2', en: 'It can make choices and take actions.', ja: '判断して行動できます。' },
      { id: 's06-p3', en: 'For example, ~.', ja: '例えば〜。' },
      { id: 's06-p4', en: 'They follow the same rules as players.', ja: 'プレイヤーと同じルールに従います。' },
      { id: 's06-p5', en: 'on its own', ja: '自分で・単独で' },
    ],
    shadow: { en: "It's a program that can act by itself.", ja: '自分で行動できるプログラムです。' },
    frame: {
      template: 'In our game, AI agents can {action}.',
      ja: '私たちのゲームでは、AI エージェントは {action} ことができます。',
      slots: [
        { key: 'action', labelJa: 'エージェントができること（事実のみ）', placeholder: 'trade items', options: ['trade items', 'build things', 'explore the world'], projectField: 'aiAgents' },
      ],
    },
    followUps: [
      {
        en: 'Who controls the agents?',
        ja: 'エージェントは誰が動かしてるの？',
        hintJa: '仕様が未確認なら推測しない。',
        models: [
          { en: '[ ] can run an agent.', ja: '[ ] がエージェントを動かせます。' },
          { en: "I'm not sure yet. Let me check.", ja: 'まだ分かりません。確認します。' },
        ],
        projectFields: ['aiAgents'],
      },
      {
        en: 'Why do you need agents in a game?',
        ja: 'なぜゲームにエージェントが必要なの？',
        hintJa: '理由を一つ。"Because ~." でよい。',
        models: [
          { en: 'Because they keep the world busy, even when few people are online.', ja: '人が少ない時間でも、世界が動き続けるからです。' },
          { en: 'Because players can build their own agents.', ja: 'プレイヤーが自分のエージェントを作れるからです。' },
        ],
        projectFields: ['aiAgents'],
      },
    ],
  },
  {
    id: 's07-shared',
    group: 'explain',
    titleJa: '共有された世界（shared world）を説明する',
    situationJa: '「shared world ってどういう意味？」と聞かれた。',
    goalJa: '「みんなが同じ世界で遊ぶ」「データが公開」「他の人も作れる」を短く言う。',
    partnerName: 'Alex',
    youName: 'Sam',
    glossary: [
      { en: 'shared world', ja: '共有された世界' },
      { en: 'state / data', ja: '状態 / データ' },
      { en: 'public', ja: '公開されている' },
      { en: 'build on top of ~', ja: '〜の上に（〜を使って）作る' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: 'What do you mean by a shared world?', ja: 'shared world ってどういう意味？' },
        { speaker: 'you', en: 'Everyone plays in the same world.', ja: 'みんなが同じ世界で遊ぶんです。' },
        { speaker: 'you', en: 'The world data is on the blockchain.', ja: '世界のデータはブロックチェーン上にあります。' },
        { speaker: 'you', en: 'So anyone can read it. Other developers can use it too.', ja: 'だから誰でも読めます。他の開発者も使えます。' },
        { speaker: 'partner', en: 'Like a public map?', ja: '公開の地図みたいな？' },
        { speaker: 'you', en: 'Yes, exactly. Other people can build new games on it.', ja: 'はい、まさに。他の人がその上に新しいゲームを作れます。' },
      ],
      plus: [
        { speaker: 'partner', en: 'You keep saying "shared world." What does that mean?', ja: 'ずっと "shared world" って言ってるけど、どういう意味？' },
        { speaker: 'you', en: 'It means everyone is playing in one world, and its state lives onchain.', ja: 'みんなが一つの世界で遊んでいて、その状態がオンチェーンにあるという意味です。' },
        { speaker: 'you', en: 'So the data is public. Anyone can read it, and other devs can build on top of it.', ja: 'だからデータは公開されています。誰でも読めて、他の開発者がその上に作れます。' },
        { speaker: 'partner', en: 'Kind of like a public map that anyone can extend?', ja: '誰でも拡張できる公開地図みたいな感じ？' },
        { speaker: 'you', en: 'Exactly. Someone could even make a new game that uses the same world.', ja: 'まさに。同じ世界を使った新しいゲームを作ることだってできます。' },
      ],
    },
    questions: [
      {
        q: '世界のデータはどこにある？',
        choices: ['ブロックチェーン上', '会社のサーバー', '各プレイヤーのPC'],
        answer: 0,
        explainJa: '"The world data is on the blockchain." と言っています。',
      },
      {
        q: '他の開発者は何ができる？',
        choices: ['その世界を使って新しいゲームを作れる', '見ることだけ', '何もできない'],
        answer: 0,
        explainJa: '"Other people can build new games on it." と言っています。',
      },
    ],
    phrases: [
      { id: 's07-p1', en: 'Everyone plays in the same world.', ja: 'みんなが同じ世界で遊びます。' },
      { id: 's07-p2', en: 'The world data is on the blockchain.', ja: '世界のデータはブロックチェーン上にあります。' },
      { id: 's07-p3', en: 'Anyone can read it.', ja: '誰でも読めます。' },
      { id: 's07-p4', en: 'build on top of ~', ja: '〜の上に作る（〜を土台に作る）' },
      { id: 's07-p5', en: 'Yes, exactly.', ja: 'はい、まさにそうです。' },
    ],
    shadow: { en: 'Everyone plays in the same world.', ja: 'みんなが同じ世界で遊びます。' },
    frame: {
      template: 'In our world, players can {action}, and other developers can {devAction}.',
      ja: '私たちの世界では、プレイヤーは {action} ことができ、他の開発者は {devAction} ことができます。',
      slots: [
        { key: 'action', labelJa: 'プレイヤーができること', placeholder: '...', projectField: 'sharedWorld' },
        { key: 'devAction', labelJa: '他の開発者ができること', placeholder: 'build new games on it', options: ['build new games on it', 'read the data'], projectField: 'sharedWorld' },
      ],
    },
    followUps: [
      {
        en: 'Who decides the rules of the world?',
        ja: 'その世界のルールは誰が決めるの？',
        hintJa: '仕様が未確認なら「確認します」。',
        models: [
          { en: 'Right now, [ ] decides the rules.', ja: '今は [ ] がルールを決めています。' },
          { en: "Good question. I'm not sure yet. Let me check.", ja: 'いい質問です。まだ分かりません。確認します。' },
        ],
        projectFields: ['sharedWorld'],
      },
      {
        en: 'Can I build something on your world?',
        ja: '君たちの世界の上に何か作れる？',
        hintJa: '可能かどうかは事実で答える。',
        models: [
          { en: 'Yes, the data is public. I can send you the docs.', ja: 'はい、データは公開です。ドキュメントを送れます。' },
          { en: 'Not yet, but we want to support that.', ja: 'まだですが、対応したいと思っています。' },
        ],
        projectFields: ['sharedWorld', 'links'],
      },
    ],
  },
  {
    id: 's08-ownership',
    group: 'explain',
    titleJa: '所有権を説明する',
    situationJa: '「プレイヤーは何を所有するの？」と聞かれた。',
    goalJa: '何を・どこに持っていて・何ができるかを言う。限界も正直に言う。',
    partnerName: 'Priya',
    youName: 'Sam',
    glossary: [
      { en: 'item', ja: 'アイテム' },
      { en: 'wallet', ja: 'ウォレット' },
      { en: 'marketplace', ja: 'マーケットプレイス（売買の場）' },
      { en: 'shut down', ja: '（サービスを）終了する' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: 'What do players own in your game?', ja: 'あなたのゲームでプレイヤーは何を所有するの？' },
        { speaker: 'you', en: 'They own their items, like tools and land.', ja: '道具や土地などのアイテムを所有します。' },
        { speaker: 'you', en: 'The items are in their wallet.', ja: 'アイテムは自分のウォレットに入っています。' },
        { speaker: 'partner', en: 'Can they sell them?', ja: '売ることはできる？' },
        { speaker: 'you', en: 'Yes. They can sell them or give them to friends.', ja: 'はい。売ったり、友だちにあげたりできます。' },
        { speaker: 'partner', en: 'What if the game shuts down?', ja: 'もしゲームが終了したら？' },
        { speaker: 'you', en: 'The items stay in the wallet. But they may not be useful.', ja: 'アイテムはウォレットに残ります。でも役に立たないかもしれません。' },
      ],
      plus: [
        { speaker: 'partner', en: 'So what do players actually own?', ja: 'で、プレイヤーは実際に何を所有するの？' },
        { speaker: 'you', en: "Their in-game items, like land and tools. They're held in the player's own wallet.", ja: '土地や道具などのゲーム内アイテムです。プレイヤー自身のウォレットに入っています。' },
        { speaker: 'partner', en: 'Can they trade them outside the game?', ja: 'ゲームの外でも取引できる？' },
        { speaker: 'you', en: 'Yes, they can sell them on a marketplace or send them to a friend.', ja: 'はい、マーケットプレイスで売ったり、友だちに送ったりできます。' },
        { speaker: 'partner', en: 'And if the game shuts down?', ja: 'もしゲームが終了したら？' },
        { speaker: 'you', en: "The items stay in their wallet. To be honest, though, they might not be very useful anymore.", ja: 'アイテムはウォレットに残ります。ただ正直に言うと、あまり役に立たなくなるかもしれません。' },
      ],
    },
    questions: [
      {
        q: 'アイテムはどこにある？',
        choices: ['プレイヤーのウォレット', '会社のサーバーだけ', '取引所'],
        answer: 0,
        explainJa: '"The items are in their wallet." と言っています。',
      },
      {
        q: 'ゲームが終了したら？',
        choices: ['アイテムは残るが、役に立たないかもしれない', 'アイテムは消える', 'お金が返ってくる'],
        answer: 0,
        explainJa: '"The items stay in the wallet. But they may not be useful." と言っています。',
      },
    ],
    phrases: [
      { id: 's08-p1', en: 'They own their items.', ja: 'アイテムを所有しています。' },
      { id: 's08-p2', en: 'The items are in their wallet.', ja: 'アイテムはウォレットに入っています。' },
      { id: 's08-p3', en: 'They can sell them or give them to friends.', ja: '売ったり友だちにあげたりできます。' },
      { id: 's08-p4', en: 'What if ~?', ja: 'もし〜だったら？' },
      { id: 's08-p5', en: 'To be honest, ~', ja: '正直に言うと〜' },
    ],
    shadow: { en: 'The items are in their wallet.', ja: 'アイテムはウォレットに入っています。' },
    frame: {
      template: 'Players own {things}. They can {action}.',
      ja: 'プレイヤーは {things} を所有します。{action} ことができます。',
      slots: [
        { key: 'things', labelJa: '所有するもの（事実のみ）', placeholder: '...', projectField: 'ownership' },
        { key: 'action', labelJa: 'できること', placeholder: 'sell them', options: ['sell them', 'trade them', 'keep them in their wallet'], projectField: 'ownership' },
      ],
    },
    followUps: [
      {
        en: 'Why does ownership matter to players?',
        ja: 'なぜ所有権がプレイヤーにとって大事なの？',
        hintJa: '"Because ~." で一つ理由を。',
        models: [
          { en: 'Because they can keep or sell what they get in the game.', ja: 'ゲームで手に入れたものを持ち続けたり売ったりできるからです。' },
        ],
      },
      {
        en: 'Is everything in the game onchain?',
        ja: 'ゲームの全部がオンチェーンなの？',
        hintJa: '仕様の範囲は資料で確認。分からなければ確認すると言う。',
        models: [
          { en: 'Not everything. [ ] is onchain.', ja: '全部ではありません。[ ] がオンチェーンです。' },
          { en: 'I need to check the details.', ja: '詳細は確認が必要です。' },
        ],
        projectFields: ['ownership', 'sharedWorld'],
      },
    ],
  },
  {
    id: 's11-dig',
    group: 'clarify',
    titleJa: '質問を掘り下げる',
    situationJa: '相手が自分のゲームのローンチの話をしている。もっと聞きたい。',
    goalJa: 'How / Why で質問を重ね、詳しく話してもらう。',
    partnerName: 'Leo',
    youName: 'Sam',
    glossary: [
      { en: 'launch', ja: 'ローンチ（公開）する' },
      { en: 'at once', ja: '一度に' },
      { en: 'queue', ja: '待ち行列' },
      { en: 'indexer', ja: 'インデクサー（チェーンのデータを整理して読むための仕組み）' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: 'We launched our game last month.', ja: '先月ゲームをローンチしたんだ。' },
        { speaker: 'you', en: 'Congratulations! How did it go?', ja: 'おめでとう！どうでした？' },
        { speaker: 'partner', en: 'Pretty good. But the first week was hard.', ja: 'まあまあ良かった。でも最初の週は大変だった。' },
        { speaker: 'you', en: 'Why was it hard?', ja: 'なぜ大変だったんですか？' },
        { speaker: 'partner', en: 'Too many people joined at once. Everything was slow.', ja: '一度に人が来すぎて。全部遅くなったんだ。' },
        { speaker: 'you', en: 'Oh no. How did you fix it?', ja: 'うわあ。どうやって直したんですか？' },
        { speaker: 'partner', en: "We added a queue. Now it's fine.", ja: '待ち行列を入れた。今は大丈夫。' },
        { speaker: 'you', en: 'Interesting. Can you tell me more about the queue?', ja: '面白いですね。その待ち行列についてもっと教えてもらえますか？' },
      ],
      plus: [
        { speaker: 'partner', en: 'We actually launched our game last month.', ja: '実は先月ゲームをローンチしたんだ。' },
        { speaker: 'you', en: "Oh, congrats! How's it going so far?", ja: 'おお、おめでとう！今のところどうですか？' },
        { speaker: 'partner', en: 'Pretty well, but the first week was rough.', ja: 'かなり順調。でも最初の週はきつかった。' },
        { speaker: 'you', en: 'What made it rough?', ja: '何がきつかったんですか？' },
        { speaker: 'partner', en: "Way more people showed up than we expected, and our indexer couldn't keep up.", ja: '予想よりずっと多くの人が来て、インデクサーが追いつかなかったんだ。' },
        { speaker: 'you', en: 'Ouch. How did you deal with that?', ja: 'それは痛い。どう対処したんですか？' },
        { speaker: 'partner', en: "We added a waiting queue and scaled the indexer. It's been stable since.", ja: '待ち行列を入れて、インデクサーを増強した。それ以来安定してるよ。' },
        { speaker: 'you', en: 'Interesting. Could you tell me a bit more about how the queue works?', ja: '面白い。その待ち行列の仕組みをもう少し教えてもらえますか？' },
      ],
    },
    questions: [
      {
        q: '最初の週の問題は？',
        choices: ['一度に人が来すぎて遅くなった', '大きなバグがあった', '誰も来なかった'],
        answer: 0,
        explainJa: '"Too many people joined at once." と言っています。',
      },
      {
        q: 'どうやって解決した？',
        choices: ['待ち行列を追加した', 'ゲームを止めた', '有料にした'],
        answer: 0,
        explainJa: '"We added a queue." と言っています。',
      },
    ],
    phrases: [
      { id: 's11-p1', en: 'How did it go?', ja: 'どうでしたか？' },
      { id: 's11-p2', en: 'Why was it hard?', ja: 'なぜ大変だったんですか？' },
      { id: 's11-p3', en: 'How did you fix it?', ja: 'どうやって直したんですか？' },
      { id: 's11-p4', en: 'Can you tell me more about ~?', ja: '〜についてもっと教えてもらえますか？' },
      { id: 's11-p5', en: 'What made it ~?', ja: '何が〜にしたんですか？（なぜ〜だったの？）' },
    ],
    shadow: { en: 'Can you tell me more about that?', ja: 'それについてもっと教えてもらえますか？' },
    frame: {
      template: 'How did you {verb} {thing}?',
      ja: 'どうやって {thing} を {verb} したんですか？',
      slots: [
        { key: 'verb', labelJa: '動詞', placeholder: 'fix', options: ['fix', 'build', 'design', 'test'] },
        { key: 'thing', labelJa: '対象', placeholder: 'it', options: ['it', 'the queue', 'the onboarding'] },
      ],
    },
    followUps: [
      {
        en: 'We moved our whole backend to a new framework.',
        ja: 'バックエンドを全部新しいフレームワークに移したんだ。',
        hintJa: '相手の話に質問で返す。Why / How / What が使える。',
        models: [
          { en: 'Why did you move?', ja: 'なぜ移したんですか？' },
          { en: 'What was the hardest part?', ja: '一番大変だったのは何ですか？' },
        ],
      },
      {
        en: 'Our players really love the trading system.',
        ja: 'プレイヤーは取引システムをすごく気に入ってるんだ。',
        hintJa: '"What do they like about it?" のように掘り下げる。',
        models: [
          { en: 'What do they like about it?', ja: 'どんなところが好きなんですか？' },
          { en: 'Can you tell me more about it?', ja: 'もっと教えてもらえますか？' },
        ],
      },
    ],
  },
  {
    id: 's12-feedback',
    group: 'feedback',
    titleJa: 'フィードバックを受けて理解を確認する',
    situationJa: '相手がデモを遊んで感想をくれた。',
    goalJa: '例を聞く・言い換えて確認する・お礼を言う。',
    partnerName: 'Jordan',
    youName: 'Sam',
    glossary: [
      { en: 'confusing', ja: '分かりにくい' },
      { en: 'tutorial', ja: 'チュートリアル' },
      { en: 'feedback', ja: 'フィードバック・感想' },
      { en: 'look into ~', ja: '〜を調べる・検討する' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: 'I tried your game yesterday.', ja: '昨日、君のゲームを試したよ。' },
        { speaker: 'you', en: 'Thank you! What do you think?', ja: 'ありがとう！どう思いました？' },
        { speaker: 'partner', en: 'The idea is great. But the start is confusing.', ja: 'アイデアはすごくいい。でも始めが分かりにくい。' },
        { speaker: 'you', en: 'Confusing? Can you give me an example?', ja: '分かりにくい？例を教えてもらえますか？' },
        { speaker: 'partner', en: "I didn't know what to do first.", ja: '最初に何をすればいいか分からなかった。' },
        { speaker: 'you', en: 'I see. So the first step is not clear. Is that right?', ja: 'なるほど。つまり最初のステップが分かりにくいということですね？' },
        { speaker: 'partner', en: 'Yes, exactly. Maybe add a short tutorial.', ja: 'うん、その通り。短いチュートリアルを入れたらいいかも。' },
        { speaker: 'you', en: "That's helpful. Thank you for the feedback.", ja: '助かります。フィードバックありがとうございます。' },
      ],
      plus: [
        { speaker: 'partner', en: 'I played your demo last night.', ja: '昨日の夜、デモを遊んだよ。' },
        { speaker: 'you', en: 'Oh, thanks for trying it! What did you think?', ja: 'わあ、試してくれてありがとう！どうでした？' },
        { speaker: 'partner', en: 'Love the concept, but the first few minutes felt confusing.', ja: 'コンセプトは大好き。でも最初の数分が分かりにくかった。' },
        { speaker: 'you', en: 'Confusing how? Could you give me an example?', ja: 'どう分かりにくかったですか？例をもらえますか？' },
        { speaker: 'partner', en: "I wasn't sure what to do after connecting my wallet.", ja: 'ウォレットを接続したあと、何をすればいいか分からなかった。' },
        { speaker: 'you', en: "Got it. So you mean the next step after connecting wasn't clear?", ja: 'わかりました。接続した後の次のステップが分かりにくかったということですね？' },
        { speaker: 'partner', en: 'Right. A quick tutorial would probably help.', ja: 'そう。短いチュートリアルがあると助かると思う。' },
        { speaker: 'you', en: "That's really useful. Thanks, I'll look into it.", ja: 'とても参考になります。ありがとう、検討します。' },
      ],
    },
    questions: [
      {
        q: '相手の感想は？',
        choices: ['アイデアは良いが、始めが分かりにくい', '全部よかった', '動作が遅い'],
        answer: 0,
        explainJa: '"The idea is great. But the start is confusing." と言っています。',
      },
      {
        q: '相手の提案は？',
        choices: ['短いチュートリアルを入れる', '手数料を下げる', 'ゲームを短くする'],
        answer: 0,
        explainJa: '"Maybe add a short tutorial." と言っています。',
      },
    ],
    phrases: [
      { id: 's12-p1', en: 'What do you think?', ja: 'どう思いますか？' },
      { id: 's12-p2', en: 'Can you give me an example?', ja: '例を教えてもらえますか？' },
      { id: 's12-p3', en: 'So ~. Is that right?', ja: 'つまり〜ということですね？', noteJa: '相手の話を言い換えて理解を確認する。' },
      { id: 's12-p4', en: 'So you mean ~?', ja: 'つまり〜という意味ですか？' },
      { id: 's12-p5', en: 'Thank you for the feedback.', ja: 'フィードバックありがとうございます。' },
      { id: 's12-p6', en: "I'll look into it.", ja: '検討します（調べてみます）。' },
    ],
    shadow: { en: 'So the first step is not clear. Is that right?', ja: 'つまり最初のステップが分かりにくいということですね？' },
    frame: {
      template: 'So you mean {paraphrase}. Is that right?',
      ja: 'つまり {paraphrase} ということですね？',
      slots: [
        { key: 'paraphrase', labelJa: '相手の話の言い換え', placeholder: 'the first step is not clear', options: ['the first step is not clear', 'the screen is too busy', 'the fees are too high'] },
      ],
    },
    followUps: [
      {
        en: 'Honestly, the UI is a bit too busy.',
        ja: '正直、UI がちょっとごちゃごちゃしてる。',
        hintJa: '言い換えて確認 or 具体例を聞く。',
        models: [
          { en: "So you mean there's too much on the screen?", ja: 'つまり画面に情報が多すぎるということですか？' },
          { en: 'Thanks. Which part is too busy?', ja: 'ありがとう。どの部分がごちゃごちゃしてますか？' },
        ],
      },
      {
        en: 'I think the fees might scare new players.',
        ja: '手数料が新しいプレイヤーを怖がらせるかも。',
        hintJa: '言い換えて確認する練習。',
        models: [
          { en: 'So you mean the fees feel too high for new players?', ja: 'つまり、新しいプレイヤーには手数料が高く感じるということですか？' },
          { en: 'Thanks. What would feel okay, do you think?', ja: 'ありがとう。どれくらいなら大丈夫だと思いますか？' },
        ],
      },
    ],
  },
  {
    id: 's13-schedule',
    group: 'meeting',
    titleJa: 'ミーティングの約束をする',
    situationJa: '話が盛り上がり、後日オンラインで話すことになった。',
    goalJa: '曜日・時間・タイムゾーンを確認して約束する。',
    partnerName: 'Mia',
    youName: 'Sam',
    glossary: [
      { en: 'call', ja: '通話・オンライン会議' },
      { en: 'free', ja: '空いている' },
      { en: 'calendar invite', ja: 'カレンダーの招待' },
      { en: '~ time', ja: '〜時間（タイムゾーン）' },
    ],
    versions: {
      a2: [
        { speaker: 'partner', en: "I'd like to talk more. Can we have a call?", ja: 'もっと話したいな。通話できる？' },
        { speaker: 'you', en: 'Sure! Are you free next week?', ja: 'もちろん！来週は空いてますか？' },
        { speaker: 'partner', en: 'Yes. How about Tuesday?', ja: 'うん。火曜日はどう？' },
        { speaker: 'you', en: 'Tuesday is good. What time is good for you?', ja: '火曜日でいいですよ。何時が都合いいですか？' },
        { speaker: 'partner', en: "3 p.m. Singapore time. I'm in Singapore.", ja: 'シンガポール時間の午後3時。シンガポールにいるの。' },
        { speaker: 'you', en: "That's 4 p.m. in Tokyo. That works for me.", ja: '東京だと午後4時ですね。大丈夫です。' },
        { speaker: 'partner', en: "Great. I'll send a calendar invite.", ja: 'よかった。カレンダーの招待を送るね。' },
        { speaker: 'you', en: "Thanks. Let's do 30 minutes.", ja: 'ありがとう。30分にしましょう。' },
      ],
      plus: [
        { speaker: 'partner', en: "I'd love to chat more. Want to set up a call?", ja: 'もっと話したいな。通話を設定しない？' },
        { speaker: 'you', en: 'Definitely. Does sometime next week work for you?', ja: 'ぜひ。来週のどこかで都合はどうですか？' },
        { speaker: 'partner', en: 'Tuesday works. How about 3 p.m. Singapore time?', ja: '火曜日なら大丈夫。シンガポール時間の午後3時はどう？' },
        { speaker: 'you', en: "Let me check... that's 4 p.m. in Tokyo, so that works for me.", ja: 'えっと…東京だと午後4時なので、大丈夫です。' },
        { speaker: 'partner', en: "Great. I'll send over a calendar invite.", ja: 'よかった。カレンダーの招待を送るね。' },
        { speaker: 'you', en: 'Perfect. Thirty minutes should be enough, right?', ja: '完璧です。30分で足りますよね？' },
        { speaker: 'partner', en: 'Yeah, thirty minutes is fine.', ja: 'うん、30分で大丈夫。' },
      ],
    },
    questions: [
      {
        q: 'いつ話す？',
        choices: ['火曜日・シンガポール時間の午後3時（東京で午後4時）', '水曜日の午前10時', '月曜日・東京時間の午後3時'],
        answer: 0,
        explainJa: '"Tuesday" と "3 p.m. Singapore time … 4 p.m. in Tokyo" です。',
      },
      {
        q: 'カレンダーの招待を送るのは？',
        choices: ['相手（Mia）', 'Sam', '誰も送らない'],
        answer: 0,
        explainJa: 'Mia が "I\'ll send a calendar invite." と言っています。',
      },
    ],
    phrases: [
      { id: 's13-p1', en: 'Are you free next week?', ja: '来週は空いていますか？' },
      { id: 's13-p2', en: 'How about Tuesday?', ja: '火曜日はどうですか？' },
      { id: 's13-p3', en: 'What time is good for you?', ja: '何時が都合いいですか？' },
      { id: 's13-p4', en: "That's 4 p.m. in Tokyo.", ja: '東京だと午後4時です。', noteJa: 'タイムゾーンは必ず声に出して確認する。' },
      { id: 's13-p5', en: "I'll send a calendar invite.", ja: 'カレンダーの招待を送ります。' },
      { id: 's13-p6', en: 'That works for me.', ja: 'それで大丈夫です。' },
    ],
    shadow: { en: 'Are you free next week?', ja: '来週は空いていますか？' },
    frame: {
      template: 'How about {day} at {time}, {tz} time?',
      ja: '{tz} 時間の {day} {time} はどうですか？',
      slots: [
        { key: 'day', labelJa: '曜日', placeholder: 'Tuesday', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
        { key: 'time', labelJa: '時刻', placeholder: '4 p.m.', options: ['10 a.m.', '4 p.m.', '9 p.m.'] },
        { key: 'tz', labelJa: 'タイムゾーン', placeholder: 'Tokyo', options: ['Tokyo', 'UTC'] },
      ],
    },
    followUps: [
      {
        en: 'What time zone are you in?',
        ja: 'どのタイムゾーンにいるの？',
        hintJa: '日本なら JST（UTC+9）。',
        models: [
          { en: "I'm in Japan. It's JST, UTC plus nine.", ja: '日本にいます。JST、UTC+9 です。' },
        ],
      },
      {
        en: 'Something came up. Can we move it to Thursday?',
        ja: '用事ができちゃった。木曜日に変えられる？',
        hintJa: 'OK なら一言。無理なら別の案を出す。',
        models: [
          { en: 'Sure, Thursday works.', ja: 'もちろん、木曜日で大丈夫です。' },
          { en: 'Sorry, Thursday is difficult. How about Friday?', ja: 'すみません、木曜日は難しいです。金曜日はどうですか？' },
        ],
      },
    ],
  },
  {
    id: 's14-thanks',
    group: 'meeting',
    titleJa: 'ミーティング後のお礼',
    situationJa: '通話のあと、お礼のメッセージを送る。（Sam のメッセージと相手の返信）',
    goalJa: 'お礼・役に立った点・次の行動を短く書く／言う。',
    partnerName: 'Alex',
    youName: 'Sam',
    glossary: [
      { en: 'helpful', ja: '役に立つ' },
      { en: 'update', ja: '進捗の報告' },
      { en: 'keep in touch', ja: '連絡を取り合う' },
      { en: 'look forward to ~', ja: '〜を楽しみにする' },
    ],
    versions: {
      a2: [
        { speaker: 'you', en: 'Hi Alex, thank you for your time today.', ja: 'Alex さん、今日はお時間をありがとうございました。' },
        { speaker: 'you', en: 'Your feedback on the tutorial was very helpful.', ja: 'チュートリアルについてのフィードバックがとても役に立ちました。' },
        { speaker: 'you', en: "I'll share an update next week.", ja: '来週、進捗をお知らせします。' },
        { speaker: 'you', en: "Let's keep in touch.", ja: 'これからも連絡を取り合いましょう。' },
        { speaker: 'partner', en: 'Thanks, Sam! It was great talking with you.', ja: 'ありがとう、Sam！話せてよかったよ。' },
        { speaker: 'partner', en: "I'm looking forward to the update.", ja: '進捗を楽しみにしてるね。' },
      ],
      plus: [
        { speaker: 'you', en: 'Hi Alex, thanks again for taking the time to chat today.', ja: 'Alex さん、今日は時間を取って話してくれて改めてありがとう。' },
        { speaker: 'you', en: "Your feedback on the tutorial was super helpful. We're already looking into it.", ja: 'チュートリアルへのフィードバックがすごく役に立ちました。もう検討を始めています。' },
        { speaker: 'you', en: "I'll send you an update next week.", ja: '来週、進捗を送ります。' },
        { speaker: 'you', en: "Let's stay in touch!", ja: 'これからも連絡を取り合いましょう！' },
        { speaker: 'partner', en: 'Thanks, Sam! Really enjoyed the chat.', ja: 'ありがとう、Sam！話せて本当に楽しかった。' },
        { speaker: 'partner', en: 'Looking forward to the update.', ja: '進捗を楽しみにしてるよ。' },
      ],
    },
    questions: [
      {
        q: '何が役に立った？',
        choices: ['チュートリアルについてのフィードバック', '資金の紹介', 'デザインの資料'],
        answer: 0,
        explainJa: '"Your feedback on the tutorial was very helpful." と言っています。',
      },
      {
        q: 'Sam はいつ進捗を送る？',
        choices: ['来週', '明日', '来月'],
        answer: 0,
        explainJa: '"I\'ll share an update next week." と言っています。',
      },
    ],
    phrases: [
      { id: 's14-p1', en: 'Thank you for your time today.', ja: '今日はお時間をありがとうございました。' },
      { id: 's14-p2', en: 'Your feedback on ~ was very helpful.', ja: '〜についてのフィードバックがとても役に立ちました。' },
      { id: 's14-p3', en: "I'll share an update next week.", ja: '来週、進捗をお知らせします。' },
      { id: 's14-p4', en: "Let's keep in touch.", ja: 'これからも連絡を取り合いましょう。' },
      { id: 's14-p5', en: "I'm looking forward to ~.", ja: '〜を楽しみにしています。' },
    ],
    shadow: { en: 'Thank you for your time today.', ja: '今日はお時間をありがとうございました。' },
    frame: {
      template: 'Hi {name}, thank you for your time today. Your feedback on {topic} was very helpful.',
      ja: '{name} さん、今日はありがとうございました。{topic} についてのフィードバックがとても役に立ちました。',
      slots: [
        { key: 'name', labelJa: '相手の名前', placeholder: 'Alex' },
        { key: 'topic', labelJa: '役に立った話題', placeholder: 'the tutorial', options: ['the tutorial', 'the onboarding', 'our token design'] },
      ],
    },
    followUps: [
      {
        en: 'Thanks! By the way, when can I try the new version?',
        ja: 'ありがとう！ところで、新しいバージョンはいつ試せる？',
        hintJa: '日程が未確定なら約束しない。',
        models: [
          { en: "I'm not sure yet. I'll let you know.", ja: 'まだ分かりません。お知らせします。' },
          { en: 'Probably in [ ]. I will confirm and tell you.', ja: 'たぶん [ ] です。確認してお伝えします。' },
        ],
        projectFields: ['stage'],
      },
      {
        en: 'Could you also send me your deck?',
        ja: 'ピッチ資料も送ってもらえる？',
        hintJa: '送れるか分からなければ確認すると言う。',
        models: [
          { en: "Sure, I'll send it today.", ja: 'もちろん、今日送ります。' },
          { en: 'Let me check with my team first.', ja: 'まずチームに確認させてください。' },
        ],
      },
    ],
  },
];

/** 学習の推奨順（聞き返し・分からないときの表現を早めに） */
export const CURRICULUM_ORDER = [
  's01-meet',
  's09-repeat',
  's02-building',
  's03-howtoplay',
  's04-whychain',
  's10-dontknow',
  's05-solana',
  's06-agents',
  's07-shared',
  's08-ownership',
  's11-dig',
  's12-feedback',
  's13-schedule',
  's14-thanks',
];

export const GROUP_LABEL: Record<Scene['group'], string> = {
  meet: '初対面・自己紹介',
  explain: '説明する',
  clarify: '聞き返す・質問する',
  feedback: 'フィードバック',
  meeting: 'ミーティング',
};

export function getScene(id: string): Scene | undefined {
  return SCENES.find((s) => s.id === id);
}

/** 「分からない」ときにすぐ使える聞き返し表現（ヘルプから再生できる） */
export const RESCUE_PHRASES = [
  { en: 'Sorry, could you say that again?', ja: 'すみません、もう一度言ってもらえますか？' },
  { en: 'Could you speak a little more slowly?', ja: 'もう少しゆっくり話してもらえますか？' },
  { en: 'What do you mean by that?', ja: 'それはどういう意味ですか？' },
  { en: 'Sorry, my English is not perfect.', ja: 'すみません、英語がまだ完璧ではなくて。' },
];
