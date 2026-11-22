(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const number = value => value.toLocaleString('ko-KR');
  const duration = (points, rate) => Math.floor(points / rate) * 10;
  const hourly = (amount, points, rate) => Math.round(amount / (duration(points, rate) / 60));
  const plans = { 5000: 6000, 10000: 12600, 30000: 37200, 50000: 62400 };

  function updateSummary() {
    const summary = $('#charge-summary');
    if (!summary) return;
    const amount = Number($('.plan-pick [aria-pressed="true"]').dataset.amount);
    const rate = Number($('[data-rate][aria-pressed="true"]', summary).dataset.rate);
    $('#cs-hourly').textContent = `약 ${number(hourly(amount, plans[amount], rate))}원`;
  }
  $$('.plan-pick [data-amount], #charge-summary [data-rate]').forEach(button => button.addEventListener('click', updateSummary));
  updateSummary();

  // 시안용 로그인 상태: 이 브라우저 탭에 표시만 남기며 입력 정보는 저장·전송하지 않는다.
  const LOGIN_KEY = 'sl_demo_login';
  let loggedIn = false;
  try { loggedIn = sessionStorage.getItem(LOGIN_KEY) === '1'; } catch (e) {}
  if (loggedIn) {
    $$('.login-link, .menu-account a[href="login.html"]').forEach(link => {
      link.textContent = '로그아웃';
      link.addEventListener('click', event => {
        event.preventDefault();
        try { sessionStorage.setItem(LOGIN_KEY, '0'); } catch (e) {}
        location.href = 'index.html';
      });
    });
    $$('.signup-link, .menu-account a[href="signup.html"]').forEach(link => { link.style.display = 'none'; });
  }

  const account = $('#account-form');
  if (account) {
    const confirm = $('#auth-password-confirm');
    function checkPassword() {
      if (confirm) confirm.setCustomValidity(confirm.value !== $('#auth-password').value ? '비밀번호가 일치하지 않습니다.' : '');
    }
    if (confirm) {
      confirm.addEventListener('input', checkPassword);
      $('#auth-password').addEventListener('input', checkPassword);
    }
    const next = new URLSearchParams(location.search).get('next') || '';
    const safeNext = /^[a-z]+\.html(\?[\w=&.%-]*)?$/.test(next) ? next : '';
    if (account.dataset.mode === 'login' && safeNext) $('#account-msg').textContent = '로그인 후 이용할 수 있습니다.';
    account.addEventListener('submit', event => {
      event.preventDefault();
      if (account.dataset.mode === 'login') {
        try { sessionStorage.setItem(LOGIN_KEY, '1'); } catch (e) {}
        location.href = safeNext || 'index.html';
        return;
      }
      $('#account-msg').textContent = '화면 확인이 끝났어요. 디자인 시안으로 로그인·가입은 진행되지 않았으며 입력 정보는 전송·저장되지 않았습니다.';
      account.reset();
    });
  }
})();
