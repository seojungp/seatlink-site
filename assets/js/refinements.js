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

  const tabs = $$('.guide-tabs [role="tab"]');
  function activate(tab, focus = false) {
    tabs.forEach(other => {
      const selected = tab === other;
      other.setAttribute('aria-selected', String(selected));
      other.tabIndex = selected ? 0 : -1;
      document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = tabs[(i + 1) % tabs.length];
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') target = tabs[(i + tabs.length - 1) % tabs.length];
      if (event.key === 'Home') target = tabs[0];
      if (event.key === 'End') target = tabs[tabs.length - 1];
      if (target) { event.preventDefault(); activate(target, true); }
    });
  });
  const guideList = $('.guide-tabs');
  if (guideList) {
    const orientation = () => guideList.setAttribute('aria-orientation', innerWidth <= 950 ? 'horizontal' : 'vertical');
    orientation(); addEventListener('resize', orientation);
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
    account.addEventListener('submit', event => {
      event.preventDefault();
      $('#account-msg').textContent = '화면 확인이 끝났어요. 디자인 시안으로 로그인·가입은 진행되지 않았으며 입력 정보는 전송·저장되지 않았습니다.';
      account.reset();
    });
  }
})();
