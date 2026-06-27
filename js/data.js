// LocalStorageベースのデータ管理
const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },

  nextId(arr) {
    return arr.length === 0 ? 1 : Math.max(...arr.map(x => x.id)) + 1;
  },

  // 棋士
  getPlayers() { return this.get('players'); },
  savePlayers(arr) { this.set('players', arr); },
  addPlayer(p) {
    const arr = this.getPlayers();
    p.id = this.nextId(arr);
    arr.push(p);
    this.savePlayers(arr);
    return p;
  },
  updatePlayer(id, data) {
    const arr = this.getPlayers().map(p => p.id === id ? { ...p, ...data } : p);
    this.savePlayers(arr);
  },
  deletePlayer(id) {
    this.savePlayers(this.getPlayers().filter(p => p.id !== id));
  },

  // 対局
  getMatches() { return this.get('matches'); },
  saveMatches(arr) { this.set('matches', arr); },
  addMatch(m) {
    const arr = this.getMatches();
    m.id = this.nextId(arr);
    m.createdAt = new Date().toISOString();
    arr.push(m);
    this.saveMatches(arr);
    return m;
  },
  updateMatch(id, data) {
    const arr = this.getMatches().map(m => m.id === id ? { ...m, ...data } : m);
    this.saveMatches(arr);
  },
  deleteMatch(id) {
    this.saveMatches(this.getMatches().filter(m => m.id !== id));
  },

  // 段級位順序（昇順）
  RANK_ORDER: ['30級','29級','28級','27級','26級','25級','24級','23級','22級','21級','20級','19級','18級','17級','16級','15級','14級','13級','12級','11級','10級','9級','8級','7級','6級','5級','4級','3級','2級','1級','初段','二段','三段','四段','五段','六段','七段','八段','九段'],

  TEAI_LIST: ['平手','香落ち','角落ち','飛車落ち','飛車香落ち','二枚落ち','四枚落ち','六枚落ち','八枚落ち','十枚落ち'],

  // 棋力差から手合い割と上手を計算
  // upper: 'black'=先手が上手, 'white'=後手が上手, null=平手
  calcTeai(kyuBlack, kyuWhite) {
    const idxB = this.RANK_ORDER.indexOf(kyuBlack);
    const idxW = this.RANK_ORDER.indexOf(kyuWhite);
    if (idxB === -1 || idxW === -1) return { teai: '平手', upper: null };
    const diff = Math.abs(idxB - idxW);
    const upper = idxW > idxB ? 'white' : (idxB > idxW ? 'black' : null);
    let teai;
    if (diff <= 2) teai = '平手';
    else if (diff <= 3) teai = '香落ち';
    else if (diff <= 4) teai = '角落ち';
    else if (diff <= 5) teai = '飛車落ち';
    else if (diff <= 6) teai = '飛車香落ち';
    else if (diff <= 8) teai = '二枚落ち';
    else if (diff <= 10) teai = '四枚落ち';
    else if (diff <= 12) teai = '六枚落ち';
    else if (diff <= 14) teai = '八枚落ち';
    else teai = '十枚落ち';
    return { teai, upper: teai === '平手' ? null : upper };
  },

  nextRank(kyu) {
    const idx = this.RANK_ORDER.indexOf(kyu);
    if (idx === -1 || idx >= this.RANK_ORDER.length - 1) return null;
    return this.RANK_ORDER[idx + 1];
  },

  // 勝利を記録し、昇格条件を満たした場合は昇格して情報を返す
  // 昇格なし → null, 昇格あり → { name, from, to }
  recordWin(playerId) {
    const player = this.getPlayers().find(p => p.id === playerId);
    if (!player || !player.kyu) return null;
    const isDan = ['初段','二段','三段','四段','五段','六段','七段','八段','九段'].includes(player.kyu);
    const threshold = isDan ? 5 : 3;
    const wins = (player.levelWins || 0) + 1;
    const next = this.nextRank(player.kyu);
    if (next && wins >= threshold) {
      this.updatePlayer(playerId, { kyu: next, levelWins: 0 });
      return { playerId, name: player.name, from: player.kyu, to: next };
    }
    this.updatePlayer(playerId, { levelWins: wins });
    return null;
  },

  // データ初期化（さくら将棋教室の実データ）
  initSampleData() {
    // バージョン管理: 対局データを一度リセット
    const DATA_VER = '3';
    if (localStorage.getItem('dataVer') !== DATA_VER) {
      localStorage.removeItem('matches');
      localStorage.setItem('dataVer', DATA_VER);
    }
    if (this.getPlayers().length > 0) return;

    const players = [
      { memberCode: 1,  name: '下田智晴',   kana: 'しもだともはる',       kyu: '10級', memberType: '正会員', note: '' },
      { memberCode: 2,  name: '井上晴翔',   kana: 'いのうえはると',       kyu: '5級',  memberType: '正会員', note: '' },
      { memberCode: 3,  name: '伊藤奏汰',   kana: 'いとうそうた',         kyu: '初段', memberType: '正会員', note: '' },
      { memberCode: 4,  name: '大坊僚汰',   kana: 'だいぼうりょうた',     kyu: '2級',  memberType: '正会員', note: '' },
      { memberCode: 5,  name: '大坊漣',     kana: 'だいぼうれん',         kyu: '10級', memberType: '正会員', note: '' },
      { memberCode: 6,  name: '大谷洋平',   kana: 'おおたにようへい',     kyu: '6級',  memberType: '正会員', note: '' },
      { memberCode: 7,  name: '小宮沙雪',   kana: 'こみやさゆき',         kyu: '30級', memberType: '正会員', note: '' },
      { memberCode: 8,  name: '小宮誠司',   kana: 'こみやせいじ',         kyu: '13級', memberType: '正会員', note: '' },
      { memberCode: 9,  name: '山本翔平',   kana: 'やまもとしょうへい',   kyu: '15級', memberType: '正会員', note: '' },
      { memberCode: 10, name: '新井佑基',   kana: 'あらいゆうき',         kyu: '8級',  memberType: '正会員', note: '' },
      { memberCode: 11, name: '新出直之',   kana: 'しんでなおゆき',       kyu: '3級',  memberType: '正会員', note: '' },
      { memberCode: 12, name: '杉山兼斗',   kana: 'すぎやまけんと',       kyu: '14級', memberType: '正会員', note: '' },
      { memberCode: 13, name: '杉山晟斗',   kana: 'すぎやませいと',       kyu: '15級', memberType: '正会員', note: '' },
      { memberCode: 14, name: '澤井悠磨',   kana: 'さわいゆうま',         kyu: '初段', memberType: '正会員', note: '' },
      { memberCode: 15, name: '田畑春馬',   kana: 'たばたはるま',         kyu: '15級', memberType: '正会員', note: '' },
      { memberCode: 16, name: '落合博優',   kana: 'おちあいひろまさ',     kyu: '15級', memberType: '正会員', note: '' },
      { memberCode: 17, name: '関口結人',   kana: 'せきぐちゆいと',       kyu: '19級', memberType: '正会員', note: '' },
      { memberCode: 18, name: '齊藤朝陽',   kana: 'さいとうあさひ',       kyu: '7級',  memberType: '正会員', note: '' },
      { memberCode: 19, name: '上遠野隆一', kana: 'かとうのりゅういち',   kyu: '2級',  memberType: '正会員', note: '' },
      { memberCode: 20, name: '上遠野旭弘', kana: 'かとうのあきひろ',     kyu: '4級',  memberType: '正会員', note: '' },
      { memberCode: 21, name: '家泉和真',   kana: 'いえずみかずま',       kyu: '8級',  memberType: '正会員', note: '' },
      { memberCode: 22, name: '齋藤伸乃介', kana: 'さいとうしんのすけ',   kyu: '15級', memberType: '正会員', note: '' },
      { memberCode: 23, name: '森奏太',     kana: 'もりそうた',           kyu: '15級', memberType: '正会員', note: '' },
      { memberCode: 24, name: '中村太洋',   kana: 'なかむらたいよう',     kyu: '15級', memberType: '正会員', note: '' },
      { memberCode: 25, name: '大坊和美',   kana: 'だいぼうかずみ',       kyu: '六段', memberType: '指導員', note: '' },
      { memberCode: 26, name: '小林良輔',   kana: 'こばやしりょうすけ',   kyu: '七段', memberType: '指導員', note: '' },
      { memberCode: 27, name: '大坊功司',   kana: 'だいぼうあつし',       kyu: '1級',  memberType: '指導員', note: '' },
      { memberCode: 28, name: '大坊颯汰',   kana: 'だいぼうそうた',       kyu: '初段', memberType: '指導員', note: '' },
      { memberCode: 30, name: '細田麗水',   kana: 'ほそだれみ',           kyu: '6級',  memberType: '正会員', note: '' },
      { memberCode: 31, name: '細田櫂生',   kana: 'ほそだかい',           kyu: '7級',  memberType: '正会員', note: '' },
    ];
    players.forEach(p => this.addPlayer(p));
  }
};
