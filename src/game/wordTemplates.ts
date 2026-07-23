export type Counter = 'こ' | 'まい' | 'だい';

// 題材の性質を表すタグ。テンプレート側が requires で要求する。
// edible:      たべられる
// usable:      「つかう」が自然(文房具・消耗品)
// buyable:     おみせで かえる(売り買いの文に使える)
// pickable:    こうえん等で ひろうのが自然
// collectible: 「あつめる」のが自然(コレクション対象)
// craftable:   じぶんで「つくる」のが自然
// growable:    はたけで とれる
// light:       かるくて かぜで とぶ
// round:       まるくて ころがる
// colored:     あかい/あおい などの色ちがいが自然
// tree:        きの うえに あるのが自然
export type ItemTag =
  | 'edible'
  | 'usable'
  | 'buyable'
  | 'pickable'
  | 'collectible'
  | 'craftable'
  | 'growable'
  | 'light'
  | 'round'
  | 'colored'
  | 'tree';

export type ItemDef = {
  name: string;      // ひらがな/カタカナの題材名
  counter: Counter;  // 助数詞
  tags: ItemTag[];   // この題材に当てはまる性質
};

export type WordTemplate = {
  id: string;                    // 一意なID 例 'add-01' 'sub-01'
  op: 'addition' | 'subtraction';
  requires?: ItemTag[];          // 題材に要求するタグ(すべて満たす題材のみ差し込む)。省略時は全題材OK
  text: string;                  // プレースホルダ {item} {a} {b} {c} を含む文
};

export const ITEMS: ItemDef[] = [
  { name: 'いちご', counter: 'こ', tags: ['edible', 'buyable', 'growable'] },
  { name: 'みかん', counter: 'こ', tags: ['edible', 'buyable', 'growable', 'round', 'tree'] },
  { name: 'あめ', counter: 'こ', tags: ['edible', 'buyable', 'round', 'colored'] },
  { name: 'たまご', counter: 'こ', tags: ['edible', 'buyable'] },
  { name: 'ミニトマト', counter: 'こ', tags: ['edible', 'buyable', 'growable', 'round'] },
  { name: 'さくらんぼ', counter: 'こ', tags: ['edible', 'buyable', 'round', 'tree'] },
  { name: 'どんぐり', counter: 'こ', tags: ['pickable', 'collectible', 'round', 'tree'] },
  { name: 'ふうせん', counter: 'こ', tags: ['buyable', 'light', 'colored'] },
  { name: 'けしゴム', counter: 'こ', tags: ['buyable', 'usable'] },
  { name: 'ボール', counter: 'こ', tags: ['buyable', 'pickable', 'round', 'colored'] },
  { name: 'おはじき', counter: 'こ', tags: ['buyable', 'pickable', 'collectible', 'colored'] },
  { name: 'ビーだま', counter: 'こ', tags: ['buyable', 'pickable', 'collectible', 'round', 'colored'] },
  { name: 'クッキー', counter: 'まい', tags: ['edible', 'buyable', 'craftable'] },
  { name: 'せんべい', counter: 'まい', tags: ['edible', 'buyable'] },
  { name: 'シール', counter: 'まい', tags: ['buyable', 'usable', 'collectible', 'light', 'colored'] },
  { name: 'おりがみ', counter: 'まい', tags: ['buyable', 'usable', 'craftable', 'light', 'colored'] },
  { name: 'カード', counter: 'まい', tags: ['buyable', 'collectible', 'craftable', 'light', 'colored'] },
  { name: 'きって', counter: 'まい', tags: ['buyable', 'usable', 'collectible', 'light'] },
  { name: 'ミニカー', counter: 'だい', tags: ['buyable', 'collectible', 'colored'] },
];

export const WORD_TEMPLATES: WordTemplate[] = [
  // ===== 足し算 (addition) =====
  { id: 'add-01', op: 'addition', text: '{item}が {a} {c} あります。そこへ {b} {c} ふえました。{item}は ぜんぶで なん{c} に なりましたか?' },
  { id: 'add-02', op: 'addition', text: '{item}を {a} {c} もって います。ともだちに {b} {c} もらいました。ぜんぶで なん{c} ですか?' },
  { id: 'add-03', op: 'addition', text: 'かごに {item}が {a} {c} あります。あとから {b} {c} いれました。ぜんぶで なん{c} ですか?' },
  { id: 'add-04', op: 'addition', text: 'はこの なかに {item}が {a} {c} あります。{b} {c} いれました。ぜんぶで なん{c} ですか?' },
  { id: 'add-05', op: 'addition', requires: ['pickable'], text: 'こうえんに {item}が {a} {c} おちて います。あとから {b} {c} ふえました。ぜんぶで なん{c} ですか?' },
  { id: 'add-06', op: 'addition', text: 'わたしは {item}を {a} {c} もって います。おかあさんから {b} {c} もらいました。あわせて なん{c} ですか?' },
  { id: 'add-07', op: 'addition', text: '{item}が {a} {c} ならんで います。となりに {b} {c} ならべました。ぜんぶで なん{c} ですか?' },
  { id: 'add-08', op: 'addition', requires: ['colored'], text: 'あかい {item}が {a} {c} あります。あおい {item}が {b} {c} あります。あわせて なん{c} ですか?' },
  { id: 'add-09', op: 'addition', text: 'みぎの てに {item}を {a} {c}、ひだりの てに {b} {c} もって います。あわせて なん{c} ですか?' },
  { id: 'add-10', op: 'addition', text: 'つくえの うえに {item}が {a} {c} あります。ひきだしに {b} {c} あります。あわせて なん{c} ですか?' },
  { id: 'add-11', op: 'addition', requires: ['buyable'], text: 'きのう {item}を {a} {c} かいました。きょう {b} {c} かいました。あわせて なん{c} ですか?' },
  { id: 'add-12', op: 'addition', text: 'おにいさんが {item}を {a} {c}、いもうとが {b} {c} もって います。あわせて なん{c} ですか?' },
  { id: 'add-13', op: 'addition', text: '{item}が {a} {c} あります。おじいさんが {b} {c} くれました。ぜんぶで なん{c} ですか?' },
  { id: 'add-14', op: 'addition', text: 'おおきい はこに {item}が {a} {c}、ちいさい はこに {b} {c} はいって います。あわせて なん{c} ですか?' },
  { id: 'add-15', op: 'addition', requires: ['pickable'], text: 'あさ {item}を {a} {c} ひろいました。ゆうがた {b} {c} ひろいました。あわせて なん{c} ですか?' },
  { id: 'add-16', op: 'addition', requires: ['buyable'], text: '{item}を {a} {c} もって いました。おみせで {b} {c} かいました。ぜんぶで なん{c} ですか?' },
  { id: 'add-17', op: 'addition', text: 'ふくろに {item}が {a} {c} はいって います。あとから {b} {c} いれました。ぜんぶで なん{c} ですか?' },
  { id: 'add-18', op: 'addition', text: 'いえに {item}が {a} {c} あります。おみやげで {b} {c} もらいました。ぜんぶで なん{c} ですか?' },
  { id: 'add-19', op: 'addition', text: '{item}が {a} {c} ありました。あたらしく {b} {c} ふえました。ぜんぶで なん{c} ですか?' },
  { id: 'add-20', op: 'addition', text: 'たろうくんは {item}を {a} {c} もって います。はなこさんは {b} {c} もって います。あわせて なん{c} ですか?' },
  { id: 'add-21', op: 'addition', text: 'きょうしつに {item}が {a} {c} あります。せんせいが {b} {c} もって きました。ぜんぶで なん{c} ですか?' },
  { id: 'add-22', op: 'addition', requires: ['edible'], text: 'おさらに {item}が {a} {c} あります。もう {b} {c} のせました。ぜんぶで なん{c} ですか?' },
  { id: 'add-23', op: 'addition', requires: ['craftable'], text: '{item}を {a} {c} つくりました。あとで {b} {c} つくりました。あわせて なん{c} ですか?' },
  { id: 'add-24', op: 'addition', requires: ['growable'], text: 'はたけで {item}が {a} {c} とれました。となりの はたけで {b} {c} とれました。あわせて なん{c} ですか?' },
  { id: 'add-25', op: 'addition', requires: ['collectible'], text: 'きのう {item}を {a} {c} あつめました。きょう {b} {c} あつめました。あわせて なん{c} ですか?' },
  { id: 'add-26', op: 'addition', requires: ['light'], text: '{item}が {a} {c} あります。そこに {b} {c} とんで きました。ぜんぶで なん{c} ですか?' },
  { id: 'add-27', op: 'addition', requires: ['edible'], text: 'おかしの はこに {item}が {a} {c} あります。{b} {c} もらって いれました。ぜんぶで なん{c} ですか?' },
  { id: 'add-28', op: 'addition', text: 'うえの たなに {item}が {a} {c}、したの たなに {b} {c} あります。あわせて なん{c} ですか?' },
  { id: 'add-29', op: 'addition', requires: ['buyable'], text: '{item}を {a} {c} かって かえりました。いえに {b} {c} ありました。ぜんぶで なん{c} ですか?' },
  { id: 'add-30', op: 'addition', text: 'こどもたちが {item}を {a} {c} もって きました。あとから {b} {c} ふえました。ぜんぶで なん{c} ですか?' },
  { id: 'add-31', op: 'addition', text: 'かごの なかの {item}は {a} {c} です。{b} {c} いれると ぜんぶで なん{c} ですか?' },
  { id: 'add-32', op: 'addition', text: 'おとうとが {item}を {a} {c} もって います。おねえさんが {b} {c} あげました。ぜんぶで なん{c} ですか?' },
  { id: 'add-33', op: 'addition', text: 'まえに {item}が {a} {c} ならんで います。うしろに {b} {c} ならべました。あわせて なん{c} ですか?' },
  { id: 'add-34', op: 'addition', text: '{item}が {a} {c} あります。もう {b} {c} みつけました。ぜんぶで なん{c} ですか?' },
  { id: 'add-35', op: 'addition', text: 'ポケットに {item}が {a} {c} あります。かばんに {b} {c} あります。あわせて なん{c} ですか?' },
  { id: 'add-36', op: 'addition', requires: ['craftable'], text: 'きょう {item}を {a} {c} つくって、あした {b} {c} つくります。あわせて なん{c} ですか?' },
  { id: 'add-37', op: 'addition', text: '{item}を {a} {c} もって います。プレゼントで {b} {c} もらいました。ぜんぶで なん{c} ですか?' },
  { id: 'add-38', op: 'addition', text: 'はこに {item}が {a} {c} はいって います。あとで {b} {c} いれました。ぜんぶで なん{c} ですか?' },
  { id: 'add-39', op: 'addition', requires: ['light'], text: 'にわに {item}が {a} {c} あります。かぜで {b} {c} とんで きました。ぜんぶで なん{c} ですか?' },
  { id: 'add-40', op: 'addition', text: 'あさ {item}が {a} {c} ありました。おひるに {b} {c} ふえました。ぜんぶで なん{c} ですか?' },
  { id: 'add-41', op: 'addition', requires: ['buyable'], text: 'おみせに {item}が {a} {c} ならんで います。てんいんさんが {b} {c} ならべました。ぜんぶで なん{c} ですか?' },
  { id: 'add-42', op: 'addition', text: 'わたしの {item}は {a} {c}、ともだちの {item}は {b} {c} です。あわせて なん{c} ですか?' },
  { id: 'add-43', op: 'addition', requires: ['buyable'], text: '{item}を {a} {c} かいました。おまけで {b} {c} もらいました。ぜんぶで なん{c} ですか?' },
  { id: 'add-44', op: 'addition', requires: ['round'], text: 'かごに {item}が {a} {c} あります。あとから {b} {c} ころがって きました。ぜんぶで なん{c} ですか?' },
  { id: 'add-45', op: 'addition', text: '{item}が {a} {c} あります。おともだちが {b} {c} くれました。ぜんぶで なん{c} に なりましたか?' },
  { id: 'add-46', op: 'addition', requires: ['tree'], text: 'きの うえに {item}が {a} {c} あります。したに {b} {c} おちて います。あわせて なん{c} ですか?' },
  { id: 'add-47', op: 'addition', text: 'はじめに {item}が {a} {c} ありました。{b} {c} もらって ふえました。ぜんぶで なん{c} ですか?' },
  { id: 'add-48', op: 'addition', text: '{item}を {a} {c} ならべました。あとで {b} {c} ならべました。あわせて なん{c} ですか?' },
  { id: 'add-49', op: 'addition', requires: ['pickable'], text: 'こうえんに {item}が {a} {c} おちて います。もう {b} {c} みつけました。あわせて なん{c} ですか?' },
  { id: 'add-50', op: 'addition', requires: ['collectible'], text: 'かぞくで {item}を {a} {c} あつめました。しんせきが {b} {c} くれました。ぜんぶで なん{c} ですか?' },

  // ===== 引き算 (subtraction) =====
  { id: 'sub-01', op: 'subtraction', requires: ['edible'], text: '{item}が {a} {c} あります。そのうち {b} {c} たべました。{item}は なん{c} のこって いますか?' },
  { id: 'sub-02', op: 'subtraction', text: '{item}が {a} {c} あります。ともだちに {b} {c} あげました。のこりは なん{c} ですか?' },
  { id: 'sub-03', op: 'subtraction', requires: ['usable'], text: '{item}が {a} {c} あります。{b} {c} つかいました。のこりは なん{c} ですか?' },
  { id: 'sub-04', op: 'subtraction', text: '{item}を {a} {c} もって います。{b} {c} おとしました。のこりは なん{c} ですか?' },
  { id: 'sub-05', op: 'subtraction', requires: ['edible'], text: '{item}が {a} {c} あります。{b} {c} たべました。のこりは なん{c} ですか?' },
  { id: 'sub-06', op: 'subtraction', text: 'かごに {item}が {a} {c} あります。{b} {c} とりだしました。のこりは なん{c} ですか?' },
  { id: 'sub-07', op: 'subtraction', text: '{item}が {a} {c} あります。ともだちに {b} {c} くばりました。のこりは なん{c} ですか?' },
  { id: 'sub-08', op: 'subtraction', text: '{item}が {a} {c} あります。{b} {c} なくしました。のこりは なん{c} ですか?' },
  { id: 'sub-09', op: 'subtraction', text: '{item}を {a} {c} もって いました。おとうとに {b} {c} あげました。のこりは なん{c} ですか?' },
  { id: 'sub-10', op: 'subtraction', requires: ['light'], text: '{item}が {a} {c} あります。かぜで {b} {c} とんで いきました。のこりは なん{c} ですか?' },
  { id: 'sub-11', op: 'subtraction', requires: ['edible'], text: 'おさらに {item}が {a} {c} あります。{b} {c} たべました。のこりは なん{c} ですか?' },
  { id: 'sub-12', op: 'subtraction', text: '{item}が {a} {c} あります。{b} {c} どこかへ いって しまいました。のこりは なん{c} ですか?' },
  { id: 'sub-13', op: 'subtraction', text: '{item}が {a} {c} あります。{b} {c} おともだちに わけました。のこりは なん{c} ですか?' },
  { id: 'sub-14', op: 'subtraction', requires: ['usable'], text: '{item}を {a} {c} もって います。{b} {c} つかって しまいました。のこりは なん{c} ですか?' },
  { id: 'sub-15', op: 'subtraction', text: 'はこに {item}が {a} {c} あります。{b} {c} だしました。のこりは なん{c} ですか?' },
  { id: 'sub-16', op: 'subtraction', requires: ['buyable'], text: 'おみせに {item}が {a} {c} ならんで います。{b} {c} うれました。のこりは なん{c} ですか?' },
  { id: 'sub-17', op: 'subtraction', requires: ['edible'], text: '{item}が {a} {c} あります。おやつに {b} {c} たべました。のこりは なん{c} ですか?' },
  { id: 'sub-18', op: 'subtraction', text: '{item}が {a} {c} あります。{b} {c} プレゼントしました。のこりは なん{c} ですか?' },
  { id: 'sub-19', op: 'subtraction', text: '{item}を {a} {c} もって います。いもうとに {b} {c} あげました。のこりは なん{c} ですか?' },
  { id: 'sub-20', op: 'subtraction', requires: ['pickable'], text: 'こうえんに {item}が {a} {c} おちて います。{b} {c} もって かえりました。のこりは なん{c} ですか?' },
  { id: 'sub-21', op: 'subtraction', requires: ['edible'], text: '{item}が {a} {c} あります。{b} {c} たべました。あと なん{c} ありますか?' },
  { id: 'sub-22', op: 'subtraction', text: '{item}が {a} {c} あります。{b} {c} かたづけて しまいました。のこりは なん{c} ですか?' },
  { id: 'sub-23', op: 'subtraction', text: 'かごの {item}が {a} {c} あります。{b} {c} とりました。のこりは なん{c} ですか?' },
  { id: 'sub-24', op: 'subtraction', requires: ['usable'], text: '{item}を {a} {c} もって います。きょう {b} {c} つかいました。のこりは なん{c} ですか?' },
  { id: 'sub-25', op: 'subtraction', text: '{item}が {a} {c} あります。ともだちと わけて {b} {c} あげました。のこりは なん{c} ですか?' },
  { id: 'sub-26', op: 'subtraction', requires: ['edible'], text: '{item}が {a} {c} あります。ゆうがたに {b} {c} たべました。のこりは なん{c} ですか?' },
  { id: 'sub-27', op: 'subtraction', text: '{item}が {a} {c} あります。{b} {c} がっこうに もって いきました。のこりは なん{c} ですか?' },
  { id: 'sub-28', op: 'subtraction', requires: ['usable'], text: 'ふくろに {item}が {a} {c} あります。{b} {c} とりだして つかいました。のこりは なん{c} ですか?' },
  { id: 'sub-29', op: 'subtraction', text: '{item}が {a} {c} あります。おきゃくさんに {b} {c} あげました。のこりは なん{c} ですか?' },
  { id: 'sub-30', op: 'subtraction', requires: ['edible'], text: '{item}が {a} {c} あります。{b} {c} たべて しまいました。のこりは なん{c} ですか?' },
  { id: 'sub-31', op: 'subtraction', text: 'つくえに {item}が {a} {c} あります。{b} {c} かたづけました。のこりは なん{c} ですか?' },
  { id: 'sub-32', op: 'subtraction', text: '{item}が {a} {c} あります。おともだちに {b} {c} かしました。のこりは なん{c} ですか?' },
  { id: 'sub-33', op: 'subtraction', text: '{item}を {a} {c} もって います。{b} {c} おとして なくしました。のこりは なん{c} ですか?' },
  { id: 'sub-34', op: 'subtraction', requires: ['edible'], text: '{item}が {a} {c} あります。あさごはんに {b} {c} たべました。のこりは なん{c} ですか?' },
  { id: 'sub-35', op: 'subtraction', text: '{item}が {a} {c} あります。{b} {c} おにいさんに あげました。のこりは なん{c} ですか?' },
  { id: 'sub-36', op: 'subtraction', requires: ['buyable'], text: 'おみせに {item}が {a} {c} ならんで います。{b} {c} うれて いきました。のこりは なん{c} ですか?' },
  { id: 'sub-37', op: 'subtraction', text: '{item}が {a} {c} あります。せんせいに {b} {c} わたしました。のこりは なん{c} ですか?' },
  { id: 'sub-38', op: 'subtraction', requires: ['edible'], text: '{item}が {a} {c} あります。おやつの じかんに {b} {c} たべました。のこりは なん{c} ですか?' },
  { id: 'sub-39', op: 'subtraction', text: 'かごに {item}が {a} {c} あります。{b} {c} だして ともだちに あげました。のこりは なん{c} ですか?' },
  { id: 'sub-40', op: 'subtraction', text: '{item}が {a} {c} あります。{b} {c} はこに しまいました。のこりは なん{c} ですか?' },
  { id: 'sub-41', op: 'subtraction', text: '{item}を {a} {c} もって います。{b} {c} おともだちに くばりました。のこりは なん{c} ですか?' },
  { id: 'sub-42', op: 'subtraction', requires: ['edible'], text: '{item}が {a} {c} あります。おひるに {b} {c} たべました。のこりは なん{c} ですか?' },
  { id: 'sub-43', op: 'subtraction', text: '{item}が {a} {c} あります。{b} {c} もって おでかけしました。のこりは なん{c} ですか?' },
  { id: 'sub-44', op: 'subtraction', requires: ['usable'], text: 'はこの {item}が {a} {c} あります。{b} {c} つかいました。あと なん{c} ですか?' },
  { id: 'sub-45', op: 'subtraction', text: '{item}が {a} {c} あります。おとうさんに {b} {c} あげました。のこりは なん{c} ですか?' },
  { id: 'sub-46', op: 'subtraction', text: '{item}が {a} {c} あります。{b} {c} となりの こに あげました。のこりは なん{c} ですか?' },
  { id: 'sub-47', op: 'subtraction', requires: ['edible'], text: '{item}が {a} {c} あります。ばんごはんの あとに {b} {c} たべました。のこりは なん{c} ですか?' },
  { id: 'sub-48', op: 'subtraction', requires: ['usable'], text: '{item}を {a} {c} もって いました。{b} {c} つかいました。のこりは なん{c} ですか?' },
  { id: 'sub-49', op: 'subtraction', text: '{item}が {a} {c} あります。{b} {c} おともだちの いえに もって いきました。のこりは なん{c} ですか?' },
  { id: 'sub-50', op: 'subtraction', requires: ['edible'], text: '{item}が {a} {c} あります。みんなで {b} {c} たべました。のこりは なん{c} ですか?' },
];
