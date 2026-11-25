/*
  ===========================================
  全ページ共通の動き
    1. スマホ用メニューの開け閉め
    2. config.js の設定（メール・SNSリンク）をページに反映
    3. メールアドレスのコピーボタン
    4. お問い合わせフォームのチェックと送信
  ===========================================
*/
(function () {
  var config = window.SITE_CONFIG || { email: '', links: {}, formMode: 'off' };

  /* ---------- 1. スマホ用メニュー ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      document.body.classList.toggle('nav-open', open);
    }
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    // メニューの中のリンクを押したら閉じる
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    // Escキーで閉じる
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    // 画面が広くなったら閉じた状態に戻す
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) setOpen(false);
    });
  }

  /* ---------- 2. 設定をページに反映 ---------- */
  // メールアドレス
  document.querySelectorAll('[data-email]').forEach(function (el) {
    el.textContent = config.email;
  });
  document.querySelectorAll('[data-email-placeholder-note]').forEach(function (el) {
    el.hidden = !config.emailIsPlaceholder;
  });
  // SNSなどのリンク：URLが入っているものだけ表示
  var anyLink = false;
  document.querySelectorAll('[data-link]').forEach(function (el) {
    var url = (config.links || {})[el.getAttribute('data-link')];
    var item = el.closest('li') || el;
    if (url) {
      el.href = url;
      item.hidden = false;
      anyLink = true;
    } else {
      item.hidden = true;
    }
  });
  document.querySelectorAll('[data-links-empty]').forEach(function (el) {
    el.hidden = anyLink;
  });

  /* ---------- 3. コピーボタン ---------- */
  document.querySelectorAll('[data-copy-email]').forEach(function (btn) {
    var label = btn.textContent;
    var status = document.getElementById(btn.getAttribute('aria-describedby') || '');
    btn.addEventListener('click', function () {
      function say(msg) {
        btn.textContent = msg;
        if (status) status.textContent = msg;
        setTimeout(function () { btn.textContent = label; }, 2200);
      }
      function fallback() {
        // コピーできない環境では、アドレスを選択した状態にする
        var target = document.querySelector('[data-email]');
        var r = document.createRange();
        r.selectNodeContents(target);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        say('選択しました。Ctrl+Cでコピー');
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(config.email).then(function () { say('コピーしました'); }, fallback);
      } else {
        fallback();
      }
    });
  });

  /* ---------- 4. お問い合わせフォーム ---------- */
  var form = document.getElementById('contact-form');
  if (!form) return;
  var result = document.getElementById('form-result');

  // Netlify に公開したときだけ本当に送信する
  var host = location.hostname;
  var canSend = config.formMode === 'netlify' && (host.endsWith('.netlify.app') || form.dataset.customDomain === host);

  var rules = [
    { id: 'c-name',    check: function (v) { return v.length > 0; },                          msg: 'お名前を入力してください' },
    { id: 'c-email',   check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },   msg: 'メールアドレスの形が正しくありません（例：name@example.com）' },
    { id: 'c-type',    check: function (v) { return v !== ''; },                               msg: 'ご相談の種類を選んでください' },
    { id: 'c-message', check: function (v) { return v.length >= 10; },                         msg: 'ご相談内容を10文字以上で入力してください' }
  ];

  function validate() {
    var firstBad = null;
    rules.forEach(function (r) {
      var input = document.getElementById(r.id);
      var err = document.getElementById(r.id + '-error');
      var ok = r.check(input.value.trim());
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      err.textContent = ok ? '' : r.msg;
      if (!ok && !firstBad) firstBad = input;
    });
    var agree = document.getElementById('c-agree');
    var agreeErr = document.getElementById('c-agree-error');
    agree.setAttribute('aria-invalid', agree.checked ? 'false' : 'true');
    agreeErr.textContent = agree.checked ? '' : '個人情報の取り扱いに同意してください';
    if (!agree.checked && !firstBad) firstBad = agree;
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function showResult(kind, html) {
    result.className = 'form-result is-' + kind;
    result.innerHTML = html;
    result.hidden = false;
    result.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    if (!canSend) {
      // プレビュー中・パソコンで開いているときは送らない
      showResult('info',
        '<strong>このページはまだ公開前なので、フォームは送信されません。</strong>' +
        'お急ぎの場合は <span class="mono">' + config.email + '</span> までメールでご連絡ください。');
      return;
    }

    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = '送信しています…';
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      form.reset();
      showResult('ok', '<strong>送信しました。</strong>内容を確認して、2〜3日以内にメールでお返事します。');
    }).catch(function () {
      showResult('error', '<strong>送信できませんでした。</strong>時間をおいてもう一度試すか、<span class="mono">' + config.email + '</span> までメールでご連絡ください。');
    }).finally(function () {
      button.disabled = false;
      button.textContent = '送信する';
    });
  });
})();
