// 시트링크 회원가입·로그인 (Supabase Auth).
// 비밀번호는 Supabase 로만 전송되며 이 사이트의 코드는 저장하지 않는다.
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const root = document.documentElement;
  const config = window.SEATLINK_SUPABASE || {};
  const configured = Boolean(config.url && config.key && window.supabase);
  const client = configured
    ? window.supabase.createClient(config.url, config.key, { auth: { persistSession: true, autoRefreshToken: true } })
    : null;

  // 로그인 뒤 돌아갈 곳: 같은 사이트의 화면 이름만 허용한다 (외부 주소로 넘기지 않음).
  const safePage = value => (/^[a-z]+\.html(\?[\w=&.%-]*)?$/.test(value || '') ? value : '');
  const here = () => location.pathname.split('/').pop() || 'index.html';
  const loginUrl = next => 'login.html' + (safePage(next) ? '?next=' + encodeURIComponent(next) : '');

  async function getSession() {
    if (!client) return null;
    try {
      const { data } = await client.auth.getSession();
      return data.session || null;
    } catch (e) {
      return null;
    }
  }

  const MESSAGES = [
    [/invalid login credentials/i, '이메일 또는 비밀번호가 올바르지 않습니다.'],
    [/email not confirmed/i, '이메일 인증이 끝나지 않았습니다. 가입할 때 받은 메일의 링크를 눌러 주세요.'],
    [/already registered|already been registered/i, '이미 가입된 이메일입니다. 로그인해 주세요.'],
    [/password should be|weak password/i, '비밀번호는 8자 이상으로 입력해 주세요.'],
    [/rate limit|too many|security purposes/i, '요청이 많습니다. 잠시 후 다시 시도해 주세요.'],
    [/unable to validate email|invalid.*email/i, '이메일 주소를 다시 확인해 주세요.'],
  ];
  const explain = error => {
    const text = (error && error.message) || '';
    const hit = MESSAGES.find(([pattern]) => pattern.test(text));
    return hit ? hit[1] : '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
  };

  function showLoggedIn() {
    $$('.login-link, .menu-account a[href="login.html"]').forEach(link => {
      link.textContent = '로그아웃';
      link.setAttribute('href', '#');
      link.addEventListener('click', async event => {
        event.preventDefault();
        try { await client.auth.signOut(); } catch (e) { /* 세션이 이미 없으면 그대로 진행 */ }
        location.href = 'index.html';
      });
    });
    $$('.signup-link, .menu-account a[href="signup.html"]').forEach(link => { link.style.display = 'none'; });
  }

  const ready = getSession().then(session => {
    if (session) showLoggedIn();
    // 로그인해야 보는 화면: 확인될 때까지 본문을 숨기고, 로그인 상태가 아니면 로그인 화면으로 보낸다.
    if (root.dataset.auth === 'required') {
      if (session) root.dataset.authOk = '1';
      else location.replace(loginUrl(here() + location.search));
    }
    return session;
  });

  window.SL_AUTH = { configured, ready, session: getSession, loginUrl };

  const form = $('#account-form');
  if (!form) return;
  const message = $('#account-msg');
  const button = $('button[type="submit"]', form);
  const mode = form.dataset.mode;
  const next = safePage(new URLSearchParams(location.search).get('next'));
  const say = text => { message.textContent = text; };

  if (!configured) say('회원 서버가 아직 연결되지 않았습니다. 잠시 후 다시 이용해 주세요.');
  else if (mode === 'login' && next) say('로그인 후 이용할 수 있습니다.');

  // 이미 로그인한 상태로 로그인·가입 화면에 오면 원래 가려던 곳으로 보낸다.
  ready.then(session => { if (session) location.replace(next || 'index.html'); });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!configured) { say('회원 서버가 아직 연결되지 않았습니다. 잠시 후 다시 이용해 주세요.'); return; }
    const email = $('#auth-email').value.trim();
    const password = $('#auth-password').value;
    button.disabled = true;
    say(mode === 'login' ? '로그인하는 중입니다.' : '가입하는 중입니다.');
    try {
      if (mode === 'login') {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) { say(explain(error)); return; }
        location.href = next || 'index.html';
        return;
      }
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { name: $('#auth-name').value.trim(), nickname: $('#auth-nickname').value.trim() },
          emailRedirectTo: new URL('login.html', location.href).href,
        },
      });
      if (error) { say(explain(error)); return; }
      // 이미 가입된 이메일이면 Supabase 는 오류 대신 빈 identities 를 돌려준다.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        say('이미 가입된 이메일입니다. 로그인해 주세요.');
        return;
      }
      if (data.session) { location.href = 'index.html'; return; }
      form.reset();
      say('확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.');
    } catch (e) {
      say('연결에 실패했습니다. 인터넷 상태를 확인하고 다시 시도해 주세요.');
    } finally {
      button.disabled = false;
    }
  });
})();
