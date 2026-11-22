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
    const rate = 200;
    $('#cs-hourly').textContent = `약 ${number(hourly(amount, plans[amount], rate))}원`;
  }
  $$('.plan-pick [data-amount]').forEach(button => button.addEventListener('click', updateSummary));
  updateSummary();

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
    const agreeAll = $('#agree-all');
    if (agreeAll) {
      const checks = $$('.agree-check', account);
      agreeAll.addEventListener('change', () => checks.forEach(box => { box.checked = agreeAll.checked; }));
      checks.forEach(box => box.addEventListener('change', () => { agreeAll.checked = checks.every(item => item.checked); }));
    }
  }
})();
