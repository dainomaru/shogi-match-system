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

  // サンプルデータ初期化
  initSampleData() {
    if (this.getPlayers().length > 0) return;

    // sakura (渡辺さくら) を含む棋士リスト
    const players = [
      { name: '佐藤　一郎', kyu: '三段', note: '' },
      { name: '鈴木　花子', kyu: '二段', note: '' },
      { name: '田中　次郎', kyu: '四段', note: '' },
      { name: '山田　美咲', kyu: '初段', note: '' },
      { name: '高橋　健一', kyu: '五段', note: '' },
      { name: '渡辺　さくら', kyu: '二段', note: 'ログインID: sakura' },
    ];
    players.forEach(p => this.addPlayer(p));

    const pl = this.getPlayers();
    // pl[5] = 渡辺さくら (sakura)
    const sakura = pl[5];

    const d = (offsetDays) => {
      const dt = new Date('2026-06-27');
      dt.setDate(dt.getDate() + offsetDays);
      return dt.toISOString().split('T')[0];
    };

    const matches = [
      // 第1回戦
      { date: d(-20), blackId: pl[0].id, whiteId: pl[1].id, result: 'black', kifu: '▲7六歩 △8四歩 ▲6八銀 ...', round: '第1回戦', status: 'done' },
      { date: d(-20), blackId: pl[2].id, whiteId: pl[3].id, result: 'black', kifu: '', round: '第1回戦', status: 'done' },
      { date: d(-20), blackId: pl[4].id, whiteId: sakura.id, result: 'white', kifu: '▲7六歩 △3四歩 ▲2六歩 ...', round: '第1回戦', status: 'done' },
      // 第2回戦
      { date: d(-13), blackId: sakura.id, whiteId: pl[0].id, result: 'black', kifu: '▲7六歩 △8四歩 ...', round: '第2回戦', status: 'done' },
      { date: d(-13), blackId: pl[3].id, whiteId: pl[4].id, result: 'white', kifu: '', round: '第2回戦', status: 'done' },
      { date: d(-13), blackId: pl[1].id, whiteId: pl[2].id, result: 'black', kifu: '', round: '第2回戦', status: 'done' },
      // 第3回戦
      { date: d(-6), blackId: pl[2].id, whiteId: sakura.id, result: 'white', kifu: '▲7六歩 △3四歩 ...', round: '第3回戦', status: 'done' },
      { date: d(-6), blackId: pl[1].id, whiteId: pl[4].id, result: 'draw', kifu: '', round: '第3回戦', status: 'done' },
      { date: d(-6), blackId: pl[0].id, whiteId: pl[3].id, result: 'black', kifu: '', round: '第3回戦', status: 'done' },
      // 第4回戦（未了）
      { date: d(7), blackId: sakura.id, whiteId: pl[3].id, result: 'pending', kifu: '', round: '第4回戦', status: 'pending' },
      { date: d(7), blackId: pl[0].id, whiteId: pl[2].id, result: 'pending', kifu: '', round: '第4回戦', status: 'pending' },
      { date: d(7), blackId: pl[4].id, whiteId: pl[1].id, result: 'pending', kifu: '', round: '第4回戦', status: 'pending' },
    ];
    matches.forEach(m => this.addMatch(m));
  }
};
