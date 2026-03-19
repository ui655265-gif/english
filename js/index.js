let NumPerPage = 10;
let CurrentPage = 1;
let CurrentFilter = 'all';
let CurrentType = 'all';
const dbUpdateTimers = {};
let Allitems = [];
let prev, next, Jump, MaxPage, LogCheck;
window.onload = async function () {
  // ログインするイベント登録
  const login = document.getElementById('log-form');
  login.addEventListener('submit', Login);
  // まずログイン状態かどうかの判定
  Check();
}
async function Check() {
  try {
    const response = await fetch('php/logcheck.php');
    const data = await response.json();
    LogCheck = data.logstatus;
  } catch (error) {
    console.log('セッションエラー', error);
    alert('通信に失敗しました')
    LogCheck = false;
  }
  if (!LogCheck) {
    const logmodal = document.getElementById('modal-login');
    logmodal.style.display = 'flex';
    logmodal.classList.remove('is-hidden');
    const name = document.getElementById('name');
    name.addEventListener('input', () => {
      RemoveClass(name);
    });
    const password = document.getElementById('password');
    password.addEventListener('input', () => {
      RemoveClass(password);
    });
    return;
  }
  initapp();
};
async function initapp() {
  //データの読み取り
  await loadenglish();
  // テスト用のデモデータはこの下に貼ってね

  //前へ、次へボタンのイベント登録
  prev = document.getElementById('prev-btn');
  next = document.getElementById('next-btn');
  prev.onclick = () => PagePrev();
  next.onclick = () => PageNext();
//PC用の入力してページジャンプ
  Jump = document.getElementById('pc-only');
  Jump.onchange = (e) => {
    let NewPage = check(e.target.value);
    CurrentPage = NewPage;
    RefreshUI();
  }
//最初の表示
  RefreshUI();
//スマホ用の選択してページジャンプ
  let selectpage = document.getElementById('selectpage');
  selectpage.onclick = () => {
    selectpage.classList.toggle('page-open');
  }
  let selected = document.getElementById('selected');
  
  let select = document.getElementById('select');
  select.addEventListener('click', (e) => {
    let changepage = e.target.closest('.pageoptions');
    if (!changepage) return;
    selected.textContent = changepage.textContent;
    CurrentPage = parseInt(changepage.dataset.value);
    console.log(changepage.dataset.value);
    RefreshUI();
  })
  
//すべて、苦手なもの、今日復習すべきもの(後述の忘却曲線に基づく)のフィルター機能
  let filter = document.getElementById('filter');
  filter.onclick = () => {
    filter.classList.toggle('is-open');
  }
  window.onclick= (e) => {
    if (filter.classList.contains('is-open') || selectpage.classList.contains('page-open')) {
      if (!filter.contains(e.target) && !selectpage.contains(e.target)) {
        filter.classList.remove('is-open')
        selectpage.classList.remove('page-open')
      } else if (filter.contains(e.target)) {
        selectpage.classList.remove('page-open')
      } else if (selectpage.contains(e.target)) {
        filter.classList.remove('is-open')
      }
    }
  }
  let selectfilter = document.querySelectorAll('.options');
  let currentvalue = document.querySelector('.currentvalue');
  selectfilter.forEach((e) => {
    e.addEventListener('click', () => {
      currentvalue.textContent = e.textContent;
      CurrentFilter = e.dataset.value;
      CurrentPage = 1;
      RefreshUI();
    })
  })
  //すべて、単語、熟語のフィルター機能
  let type = document.querySelectorAll('input[type="radio"]');
  type.forEach((e) => {
    e.addEventListener('change', () => {
      CurrentType = e.value;
      CurrentPage = 1;
      RefreshUI();
    })
  })

//データ登録用のイベント登録
  const apply = document.getElementById('apply')
  apply.addEventListener('submit', HandleFormData);
//苦手切り替えのイベント登録
  const tbody = document.getElementById('tbody');
  tbody.addEventListener('click', ChangeStatus);
  //削除ボタンのイベント登録
  tbody.addEventListener('click', Delete);
  tbody.addEventListener('click', Appierwords);
  tbody.addEventListener('click', Appiermeanings);
  // ログアウト機能
  const logout = document.getElementById('log-out');
  logout.addEventListener('click', LogOut);
  const mediaquery768 = window.matchMedia('(max-width:768px)')
  mediaquery768.addEventListener('change', Widthchange768)
  const mediaquery480 = window.matchMedia('(max-width:480px)')
  mediaquery480.addEventListener('change', Widthchange480)
  Widthchange768(mediaquery768);
  Widthchange480(mediaquery480);
}
//データ読み取りの関数
async function loadenglish() {
  try {
    const response = await fetch('php/api.php');
    Allitems = await response.json();
  } catch (error){
    console.error("データの取得に失敗しました:", error);
    alert("データの読み込みに失敗しました。");
  }
}
//表に表示するための関数
function tableset(items) {
  let start = (CurrentPage - 1) * NumPerPage;
  let end = start + NumPerPage;
  //読み取ったデータをNumPerPage分スライス
  let display = items.slice(start, end)
  
  const tbody = document.getElementById('tbody')

  tbody.innerHTML = "";
//NumPerPage分繰り返して表の中身を追加する
  display.forEach(element => {
    let rowHTML = `
    <tr class="${element.type === '0' ? 'type-word' : 'type-phrase'}">
      <td class="words"><button class="appwords"><span>${h(element.words)}</span></button></td>
      <td class="meanings"><button class="appmeanings"><span>${h(element.meanings)}</span></button></td>
      <td><button class="status ${element.status === 1 ? 'weak' : (element.status === 2 ? 'learned' : 'learning')}" data-id="${element.id}" data-status="${element.status}">${element.status === 1 ? 'Weak' : (element.status === 2 ? 'Learned' : 'Learning')}</button></td>
      <td class="date">${(element.date)}</td>
      <td class="delete"><button class="delete-btn" data-id="${element.id}"></button></td>
    </tr>
    `;
    tbody.innerHTML += rowHTML;
  });

  let maxPage = Math.ceil(items.length / NumPerPage);
//変な挙動を起こさせないために特定の場合にボタンを使えなくする
  prev.disabled = (CurrentPage === 1);
  next.disabled = (CurrentPage === maxPage || maxPage === 0);

  return {
    total: items.length,
    maxPage: maxPage
  };
}
function PagePrev() {
  CurrentPage--;
  RefreshUI();
} 
function PageNext() {
  CurrentPage++;
  RefreshUI();
}
//PC入力のページジャンプ専用のバリデーション、全角数字でも半角に変換する(優しい)
function check(text) {
  let vali = text.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[^0-9]/g, '');
  vali = parseInt(vali);
  if (vali < 1 || isNaN(vali)) {
    vali = 1;
  } else if (vali > MaxPage){
    vali = MaxPage;
  }
  return vali;
}
//データ登録用の関数
async function HandleFormData(event) {
  event.preventDefault(); // 画面遷移を止める
  const form = event.currentTarget;
  const submit = document.getElementById('register');
  submit.disabled = true;
  const formData = new FormData(form);
  try {
    const response = await fetch('php/save.php', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('サーバーエラー');
    form.reset();
    await loadenglish();
    RefreshUI();
    form.querySelector('input[name="words"]').focus();
  } catch {
    console.error('データの登録に失敗しました');
    alert('登録に失敗しました');
  } finally {
    submit.disabled = false;
  }
}
//データ登録など考えたら変更しないといけない箇所多すぎたのでUI変更専用の関数を作成
//最初はtableset関数の中にいたやつもあるがそれだけだとどうしようもなかった
function RefreshUI() {
  let filtered = applyfilter(Allitems);
  const info = tableset(filtered);
  MaxPage = info.maxPage;
  //スマホ用の選択ページジャンプの選択肢作成
  let select = document.getElementById('select');
  select.innerHTML = '';
  for (let i = 1; i <= MaxPage; i++) {
    let selectHtml = `<li class="pageoptions" data-value="${i}">${i}</li>`;
    select.innerHTML += selectHtml;
  }
  let total = document.getElementById('total');
  total.textContent = `全${info.total}件`;
  //現在のページ表示
  if (Jump) Jump.value = CurrentPage;
  selected.textContent = CurrentPage;

  let rows = document.querySelectorAll('tbody tr');
  Fadein(rows);
  let visiword = document.getElementById('visiword');
  const words = document.querySelectorAll('.appwords');
  let visimeanings = document.getElementById('visimeanings');
  const meanings = document.querySelectorAll('.appmeanings');
  if (visiword.disabled) meanings.forEach(meaning => { meaning.classList.add('hide') });
  if (visimeanings.disabled) words.forEach(word => { word.classList.add('hide') });
  visiword.onclick = () => Changevisi(words, visimeanings);
  visimeanings.onclick = () => Changevisi(meanings, visiword);
}
// 苦手ボタンを押すとweak=1になる(デフォルトは0)ボタンを押したタイミングを学習日としてapiに送信する
//weakの値で場合分け、weak=0の場合登録日を参照して日数判定する
//weak=1の場合、学習日を参照して日数判定する(苦手ラベルが押されたタイミングで学習日も登録されるので参照先がないということは存在しないが念のため学習日はデフォルトで登録日を設定しておく)
//フィルターが2種類あるので重ね掛け、trueかつtrueがfilterされる
function applyfilter(items) {
  return items.filter(item => {
    let matchfilter = false;
    if (CurrentFilter === 'all') {
      matchfilter = true;
    } else if (CurrentFilter === 'weak') {
      matchfilter = (item.status === 1);
    } else if (CurrentFilter === 'learning') {
      matchfilter = (item.status === 0 || item.status === 1);
    } else if (CurrentFilter === 'forget') {
      matchfilter = ForgetCurve(item);
    }
    let matchtype = false;
    if (CurrentType === 'all') {
      matchtype = true;
    } else if (CurrentType === 'word') {
      matchtype = (item.type === 0)
    } else if (CurrentType === 'phrase') {
      matchtype = (item.type === 1)
    }
    return matchfilter && matchtype;
    })
  
}
//忘却曲線関数の作成
//まずは過去の日付と現在の日付の差を出す(過去の参照日が2パターンあるので関数化)
function getdiffdays(datesample) {
  const standard = new Date(datesample);
  const today = new Date();
  standard.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const difftime = today.getTime() - standard.getTime();
  return Math.floor(difftime / (1000 * 60 * 60 * 24));
}
//参照日との日数の差がtargetdaysの配列の中身と一致すればtrueを返す関数
function ForgetCurve(item) {
  let diffdays;
  if (item.status === 0) {
    diffdays = getdiffdays(item.date);
  } else if (item.status === 1) {
    diffdays = getdiffdays(item.last_study);
  }
  const targetdays = [1, 3, 7, 14, 30, 60];
  return targetdays.includes(diffdays);
}
//苦手のチェックボックスを入れたときにdbをupdateする
async function ChangeStatus(event) {
  let change = event.target.closest('.status');
  if (!change) return; 

  const id = change.dataset.id;
  let status = parseInt(change.dataset.status);
  if (status === 0) {
    change.classList.replace('learning','weak');
    status++;
    change.textContent = 'Weak'
  } else if (status === 1) {
    change.classList.replace('weak','learned');
    status++;
    change.textContent = 'Learned'
  } else if (status === 2) {
    change.classList.replace('learned','learning');
    status = 0;
    change.textContent = 'Learning'
  }
  change.dataset.status = status;
  const targetItem = Allitems.find(item => item.id == id);
  if (targetItem) {
    targetItem.status = status;
    if (status === 1) targetItem.last_study = new Date().toISOString(); 
  }
  if (dbUpdateTimers[id]) {
    clearTimeout(dbUpdateTimers[id]);
  }
  dbUpdateTimers[id] = setTimeout(async () => {
    try {
      const response = await fetch('php/update-status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${id}&status=${status}`
      });
      if (!response.ok) throw new Error('サーバーエラー');
    } catch {
      console.error('データの登録に失敗しました');
    }
  },1000)
}


//削除ボタンを押したときの挙動
async function Delete(event) {
  let delData = event.target.closest('.delete-btn');
  if (!delData) return;
  const overlay = document.getElementById('modal-delete');
  const cancel = document.getElementById('cancel-btn');
  const del = document.getElementById('del-btn');
  let id = null;
  // モーダルウィンドウ表示
  overlay.style.display = 'flex';
  // やめるボタンでウィンドウ非表示
  cancel.onclick = () => {
    overlay.style.display = 'none';
  };
  del.onclick = async () => {
    // 押されたボタンに対応するidを送信
    id = delData.dataset.id;
    try {
      const response = await fetch('php/delete.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `id=${id}`
    });
      if (!response.ok) throw new Error('サーバーエラー');
      // メモリからもデータ削除
      Allitems = Allitems.filter(item => String(item.id) !== id);
      RefreshUI();
    } catch {
      console.error('データの削除に失敗しました');
      alert('削除に失敗しました');
    } finally {
      // デモデータでデータの削除試すときは下の2行コメントを解除してね
      // Allitems = Allitems.filter(item => item.id !== id);
      // RefreshUI();
      overlay.style.display = 'none';
    }
  }
}
async function Login(event) {
  event.preventDefault(); // 画面遷移を止める
  const form = event.currentTarget;
  const statusinform = document.getElementById('log-status');
  const submit = document.getElementById('log-sub');
  const name = document.getElementById('name');
  const password = document.getElementById('password');
  const login = document.getElementById('log-form');
  const logmodal = document.getElementById('modal-login');
  submit.disabled = true;
  const formData = new FormData(form);
  const btntxt = document.getElementById('btntxt');
  const spinner = document.getElementById('spinner');
  const checkicon = document.getElementById('checkicon');

  btntxt.style.display = 'none';
  spinner.style.display = 'block';
  submit.style.pointerEvents = 'none';
  setTimeout(async () => {
    try {
      const response = await fetch('php/login.php', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error('サーバーエラー');
      if (data.status === 'error') {
        btntxt.style.display = 'inline';
        spinner.style.display = 'none';
        submit.style.pointerEvents = 'auto';
        statusinform.textContent = 'ユーザー名またはパスワードが違います';
        name.classList.add('error');
        password.classList.add('error');
      } else if (data.status === 'success') {
        spinner.style.display = 'none';
        checkicon.style.display = 'block'
        setTimeout(() => {
          logmodal.classList.add('is-hidden');
          checkicon.style.display = 'none'
          statusinform.textContent = '';
          login.reset(); name.classList.remove('error');
          password.classList.remove('error');
          btntxt.style.display = 'inline';
          initapp();
        }, 800)
      }
    } catch {
      console.error('データの登録に失敗しました');
      statusinform.textContent = "dbに接続できません";
    } finally {
      submit.disabled = false;
    }
  }, 1000);
}
async function LogOut() {
  await fetch("php/logout.php");
  Check();
}
function RemoveClass(el) {
  if (el.value.trim() !== '') {
    el.classList.remove('error');
  };
  if (el.value.trim() === '') {
    el.classList.add('error')
  };
}
window.addEventListener('pagehide', () => {
  Object.keys(dbUpdateTimers).forEach(id => {
    const targetItem = Allitems.find(item => item.id == id);
    if (!targetItem) return;
    const data = new FormData();
    data.append('id', id);
    data.append('status', targetItem.status);

    navigator.sendBeacon('php/update-status.php', data);
  })
})
function Fadein(items) {
  const observerOptions = {
      root: null,
      threshold: 0.15 // 15%見えたら発火
  };

  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              // 一度表示したら監視を終了して負荷を減らす
              observer.unobserve(entry.target);
          }
      });
  }, observerOptions);

  items.forEach(item => {
      observer.observe(item);
  });
}
function Changevisi(items, button) {
  if (!button.disabled) {
    button.disabled = true;
    items.forEach(item => {
      item.classList.add('hide');
    });
  } else {
    button.disabled = false;
    items.forEach(item => {
      item.classList.remove('hide');
    });
  }
}
function Appierwords(event) {
  let appwords = event.target.closest('.appwords');
  if (!appwords) return;
  appwords.classList.remove('hide');
}
function Appiermeanings(event) {
  let appmeanings = event.target.closest('.appmeanings');
  if (!appmeanings) return;
  appmeanings.classList.remove('hide');
}
function h(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/[&<>'"]/g, c => 
    `&#${c.charCodeAt(0)};`);
}
function Widthchange768(e) {
  if (e.matches) {
    next.textContent = '';
    prev.textContent = '';
  } else {
    next.textContent = '次へ';
    prev.textContent = '前へ';
  }
} function Widthchange480(e) {
  const colgroup = document.getElementById('colgroup');
  if (e.matches) {
    colgroup.innerHTML = '<col style="width: 34%;"><col style="width: 34%;"><col style="width:20%;"><col style="width:18%;">'
  } else {
    colgroup.innerHTML = '<col style="width: 25%;"><col style="width: 25%;"><col style="width:20%;"><col style="width:18%;"><col style="width: 12%;"></col>'
  }
} 