/*
  ===========================================
  サイトの設定（★ 公開前にここだけ書きかえればOK）
  -------------------------------------------
  ・email    … 仕事用のメールアドレス
  ・links    … GitHub、foriio、SNS のURL。
               空っぽ（''）のものはページに表示されない。
               アカウントを作ったら URL を入れるだけで自動で表示される
  ・formMode … お問い合わせフォームの送り方
       'netlify' : Netlify に公開したとき用（Netlify Forms で届く）
       'off'     : 送信しない（フォームの代わりにメールを案内する）
  ===========================================
*/
window.SITE_CONFIG = {
  email: 'shibawork32@gmail.com',    // ★ 仕事用のメールアドレス
  emailIsPlaceholder: false,         // 仮のアドレスのときだけ true にする

  links: {
    github: 'https://github.com/shibawork32-web',
    foriio: '',     // 例）'https://www.foriio.com/あなたのID'
    x: '',          // 例）'https://x.com/あなたのID'
    instagram: '',  // 例）'https://www.instagram.com/あなたのID'
    crowdworks: ''  // 例）クラウドワークスのプロフィールURL
  },

  formMode: 'netlify'
};
