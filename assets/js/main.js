(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const PLANS = {
    5000: { base: 6000, bonus: 0 },
    10000: { base: 12000, bonus: 600 },
    30000: { base: 36000, bonus: 1200 },
    50000: { base: 60000, bonus: 2400 }
  };
  const number = n => n.toLocaleString('ko-KR');
  const time = (points, rate) => {
    const minutes = Math.floor(points / rate) * 10;
    const hours = Math.floor(minutes / 60), rest = minutes % 60;
    return `약 ${hours ? hours + '시간' : ''}${hours && rest ? ' ' : ''}${rest ? rest + '분' : ''}`;
  };
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 5500);
  }

  // Mobile menu: focus management, Escape, and focus return.
  const menu = $('#menu-pane'), menuButton = $('#btn-allmenu');
  let menuOpen = false;
  function setMenu(open, restoreFocus = true) {
    menuOpen = open;
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '전체 메뉴 닫기' : '전체 메뉴 열기');
    document.body.classList.toggle('menu-open', open);
    $('#main-content').inert = open;
    $('#sh_foot').inert = open;
    if (open) {
      menu.style.top = $('#sh_head').getBoundingClientRect().bottom + 'px';
      $('a', menu).focus();
    } else if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => setMenu(!menuOpen));
  $$('a', menu).forEach(link => link.addEventListener('click', () => setMenu(false, false)));
  document.addEventListener('keydown', e => {
    if (!menuOpen) return;
    if (e.key === 'Escape') setMenu(false);
    if (e.key === 'Tab') {
      const items = [menuButton, ...$$('a', menu)];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('resize', () => {
    if (menuOpen && window.innerWidth > 950) setMenu(false, false);
  });

  // Both the homepage and FAQ page share the same accordion.
  $$('.acc > button').forEach((button, i) => {
    const body = $('.acc-body', button.parentElement);
    if (!body.id) body.id = 'answer-' + i;
    button.setAttribute('aria-controls', body.id);
    body.hidden = true;
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      button.parentElement.classList.toggle('open', open);
      body.hidden = !open;
    });
  });
  $$('#faq-tabs button').forEach(button => button.addEventListener('click', () => {
    $$('#faq-tabs button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    $$('#faq-list .acc').forEach(item => { item.hidden = button.dataset.cat !== 'all' && item.dataset.cat !== button.dataset.cat; });
  }));

  // Homepage seats are a working preview. Availability is immutable during selection.
  const homeGrid = $('#home-seat-grid');
  if (homeGrid) {
    const homeSeats = $$('.seat', homeGrid);
    function selectHome(seat) {
      if (seat.disabled) return;
      homeSeats.filter(el => !el.disabled).forEach(el => {
        el.setAttribute('aria-pressed', String(el === seat));
        el.setAttribute('aria-label', `${el.dataset.id} ${el === seat ? '선택됨' : '이용 가능'}`);
      });
      $('#home-seat-id').textContent = seat.dataset.id;
      $('#home-gpu').textContent = seat.dataset.gpu;
      $('#home-cpu').textContent = seat.dataset.cpu;
      $('#home-ram').textContent = seat.dataset.ram + ' GB';
      $('#home-connect').href = 'seats.html?seat=' + encodeURIComponent(seat.dataset.id);
    }
    homeSeats.forEach(el => el.addEventListener('click', () => selectHome(el)));
    selectHome(homeSeats.find(el => el.dataset.id === 'A-15'));
  }

  // Seat page: GPU filter, compatible frame selection, recommendation, and handoff.
  const seatGrid = $('#seat-grid');
  if (seatGrid) {
    const seats = $$('.seat', seatGrid);
    const RATE = 200;
    let selected = null, filter = 'all', frame = 60, pickedGame = '';
    const filterMatches = el => filter === 'all' || (filter === '144' ? el.dataset.frame === '144' : el.dataset.gpu.endsWith(filter));
    const matches = el => filterMatches(el) && (frame === 60 || el.dataset.frame === '144');
    const pool = () => seats.filter(el => !el.disabled && matches(el));
    function selectSeat(el) {
      if (!el || el.disabled || !matches(el)) return;
      selected = el;
      seats.filter(s => !s.disabled).forEach(s => {
        s.setAttribute('aria-pressed', String(s === el));
        s.setAttribute('aria-label', `${s.dataset.id} ${s === el ? '선택됨' : '이용 가능'}`);
      });
      $('#seat-detail').hidden = false;
      $('#sd-id').textContent = el.dataset.id;
      $('#sd-gpu').textContent = el.dataset.gpu;
      $('#sd-cpu').textContent = el.dataset.cpu;
      $('#sd-ram').textContent = el.dataset.ram + ' GB';
      const frameLabel = $('#sd-frame');
      if (frameLabel) frameLabel.textContent = `${frame}프레임`;
      $('#sd-price').textContent = time(6000, RATE);
      $('#seat-cash-note').textContent = `시간당 약 ${number(Math.round(5000 / ((Math.floor(6000 / RATE) * 10) / 60)))}원 · 10분당 ${RATE}P 차감`;
      $('#seat-charge').href = `charge.html?seat=${encodeURIComponent(el.dataset.id)}&plan=5000`;
    }
    function apply() {
      seats.forEach(el => { el.hidden = !matches(el); });
      const available = pool();
      $('#seat-count').textContent = `이용 가능 ${available.length} / 전체 ${seats.filter(matches).length}석`;
      $('#seat-empty').hidden = available.length > 0;
      $('#recommend-seat').disabled = available.length === 0;
      if (selected && available.includes(selected)) selectSeat(selected);
      else if (available.length) selectSeat(available[0]);
      else {
        selected = null;
        seats.filter(el => !el.disabled).forEach(el => el.setAttribute('aria-pressed', 'false'));
        $('#seat-detail').hidden = true;
      }
    }
    seats.forEach(el => el.addEventListener('click', () => selectSeat(el)));
    $$('.filter-bar [data-filter]').forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.filter;
      $$('.filter-bar [data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      apply();
    }));
    $$('.seat-rate [data-frame-pick]').forEach(button => button.addEventListener('click', () => {
      frame = Number(button.dataset.framePick);
      $$('.seat-rate [data-frame-pick]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      apply();
    }));
    $('#recommend-seat').addEventListener('click', () => {
      const candidates = pool().sort((a, b) => Number(b.dataset.gpu.slice(-4)) - Number(a.dataset.gpu.slice(-4)) || Number(b.dataset.ram) - Number(a.dataset.ram));
      if (!candidates.length) return;
      selectSeat(candidates[0]);
      if (!selected) return;
      selected.focus();
      if (!$('#recommend-seat').hasAttribute('data-connect')) { toast(`${selected.dataset.id} · ${selected.dataset.gpu} 좌석을 선택했어요.`); return; }
      // 홈 패널: 추천 PC로 바로 연결 (시안: 로그인 확인까지만)
      let loggedIn = false;
      try { loggedIn = sessionStorage.getItem('sl_demo_login') === '1'; } catch (e) {}
      if (!loggedIn) { location.href = 'login.html?next=index.html'; return; }
      toast(`${pickedGame ? pickedGame + ' · ' : ''}${selected.dataset.id} (${selected.dataset.gpu}) PC에 연결합니다. 디자인 시안이라 실제 접속은 연결되어 있지 않습니다.`);
    });
    // 홈 패널: 이용 가능한 게임 검색 (목록은 시안용 예시)
    const gameInput = $('#game-search');
    if (gameInput) {
      const GAMES = ['리니지', '리니지2', '리니지W', '아이온2', '로스트아크', '메이플스토리', '던전앤파이터', '배틀그라운드', '리그 오브 레전드', '발로란트', '오버워치 2', '서든어택', 'FC 온라인'];
      const box = $('#game-results');
      const key = text => text.toLowerCase().replace(/\s+/g, '');
      const note = text => { const p = document.createElement('p'); p.textContent = text; box.replaceChildren(p); };
      gameInput.addEventListener('input', () => {
        pickedGame = '';
        const q = key(gameInput.value);
        box.hidden = !q;
        if (!q) { box.replaceChildren(); return; }
        const hits = GAMES.filter(name => key(name).includes(q)).slice(0, 6);
        if (!hits.length) { note('목록에 없는 게임입니다. 1:1 문의로 이용 가능 여부를 확인해 주세요.'); return; }
        box.replaceChildren(...hits.map(name => {
          const hit = document.createElement('button');
          hit.type = 'button';
          hit.className = 'chip';
          hit.textContent = name;
          hit.addEventListener('click', () => {
            pickedGame = name;
            gameInput.value = name;
            note(`${name} · 이용 가능합니다. 아래에서 자리를 고르거나 추천 PC로 연결하세요.`);
          });
          return hit;
        }));
      });
    }
    let requested = params.get('seat') || 'A-15';
    if (/^\d{1,2}$/.test(requested)) requested = 'A-' + requested.padStart(2, '0');
    selected = seats.find(el => el.dataset.id === requested && !el.disabled) || null;
    apply();
  }

  // Charge page: same point totals as homepage; URL inputs are allowlisted.
  const summary = $('#charge-summary');
  if (summary) {
    let amount = Object.hasOwn(PLANS, params.get('plan')) ? Number(params.get('plan')) : 10000;
    const rate = 200; // 프레임과 상관없이 10분당 200P
    const seat = params.get('seat');
    if (seat && /^A-(02|04|05|07|10|12|15|18)$/.test(seat)) {
      $('#charge-seat-info').textContent = `선택한 좌석 ${seat} · 서울 A구역`;
      $('#charge-seat-info').hidden = false;
    }
    const agree = $('#cs-agree'), submit = $('#charge-form button');
    function render() {
      const plan = PLANS[amount], total = plan.base + plan.bonus;
      $$('.plan-pick [data-amount]').forEach(el => el.setAttribute('aria-pressed', String(Number(el.dataset.amount) === amount)));
      $('#cs-base').textContent = number(plan.base) + 'P';
      $('#cs-bonus').textContent = number(plan.bonus) + 'P';
      $('#cs-total').textContent = number(total) + 'P';
      $('#cs-time').textContent = time(total, rate);
      $('#cs-pay').textContent = number(amount) + '원';
      $('[data-pay-total]').textContent = number(amount) + '원';
    }
    $$('.plan-pick [data-amount]').forEach(button => button.addEventListener('click', () => { amount = Number(button.dataset.amount); render(); }));
    agree.addEventListener('change', () => {
      submit.disabled = !agree.checked;
      $('#cs-msg').textContent = agree.checked ? '디자인 시안입니다. 실제 결제는 발생하지 않습니다.' : '약관 안내를 확인하면 시안 흐름을 체험할 수 있습니다.';
    });
    $('#charge-form').addEventListener('submit', event => {
      event.preventDefault();
      if (!agree.checked) return;
      $('#cs-msg').textContent = '충전 화면 확인이 끝났어요. 실제 결제나 포인트 충전은 진행되지 않았습니다.';
      toast('디자인 시안으로 실제 결제는 진행되지 않습니다.');
    });
    render();
  }

  $$('[data-download]').forEach(button => button.addEventListener('click', () => toast('접속기 설치 파일은 준비 중입니다. 현재는 디자인 시안이에요.')));
  const support = $('#support-form');
  if (support) {
    const game = params.get('game');
    if (game) $('#sf-body').value = game.slice(0, 80) + ' 이용 문의\n';
    support.addEventListener('submit', event => {
      event.preventDefault();
      $('#sf-msg').textContent = '문의 작성 화면을 확인했어요. 디자인 시안으로 실제 문의는 전송되지 않습니다.';
      toast('디자인 시안으로 실제 문의는 전송되지 않습니다.');
    });
  }
})();
