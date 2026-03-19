window.onload = async function () {
  //新規登録のイベント登録
  const signup = document.getElementById('signup-form');
  signup.addEventListener('submit', Sinup);
}

async function Sinup(event) {
  event.preventDefault(); // 画面遷移を止める
  const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const repassword = document.getElementById('repassword');
  const form = event.currentTarget;
  if (username.value.length < 3) {
    alert('ユーザー名は3文字以上で入力してください');
    form.reset();
    return;
  }
  if (!passRegex.test(password.value)) {
    alert('パスワードは半角英数字8文字以上で入力してください');
    form.reset();
    return;
  }
  if (!(password.value === repassword.value)) {
    alert('パスワードが一致しません');
    form.reset();
    return;
  }
  
  const submit = document.getElementById('signup-sub');
  submit.disabled = true;
  const formData = new FormData(form);
  try {
    const response = await fetch('php/signup.php', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('サーバーエラー');
    const data = await response.json();
    if (data.status === 'success') {
      window.location.href = "index.html"
    } else if (data.status === "error"){
      alert(data.message);
    }
  } catch (error){
    console.error('エラーの詳細:', error); // これを足す！
    console.error('データの登録に失敗しました');
    alert('登録できませんでした');
  } finally {
    submit.disabled = false;
  }
}

