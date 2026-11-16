var SL = (function(){
  var busy = {1:1,3:1,6:1,8:1,9:1,11:1,13:1,14:1,16:1,17:1};
  var seats = [];
  for (var i = 1; i <= 18; i++) {
    seats.push({ no: i, name: 'A-' + (i < 10 ? '0' : '') + i, region: '서울', gpu: i <= 12 ? 'RTX 3060' : 'RTX 4060', cpu: i <= 12 ? 'Ryzen 5 5600X' : 'Ryzen 5 7500F', ram: '32GB', busy: !!busy[i] });
  }
  function counts(){
    var b = seats.filter(function(s){ return s.busy; }).length;
    var f = document.getElementById('s-free'), u = document.getElementById('s-busy');
    if (f) f.textContent = seats.length - b;
    if (u) u.textContent = b;
  }
  function board(grid, onPick){
    var mine = null;
    seats.forEach(function(s){
      var el = document.createElement('button');
      el.type = 'button'; el.className = 'seat' + (s.busy ? ' busy' : ''); el.innerHTML = '<span>' + s.name.slice(2) + '</span><small>' + (s.busy ? '사용 중' : '가능') + '</small>';
      el.setAttribute('aria-pressed','false');
      el.dataset.no = s.no;
      el.setAttribute('aria-label', s.name + (s.busy ? ' 사용 중' : ' 빈 자리'));
      if (s.busy) el.disabled = true;
      el.addEventListener('click', function(){ if (mine) { mine.classList.remove('mine'); mine.setAttribute('aria-pressed','false'); } mine = el; el.classList.add('mine'); el.setAttribute('aria-pressed','true'); onPick(s); });
      grid.appendChild(el);
    });
    return { clear: function(){ if(mine){ mine.classList.remove('mine'); mine.setAttribute('aria-pressed','false'); mine=null; } }, pick: function(no){ var el = grid.querySelector('[data-no="' + no + '"]'); if (el && !el.disabled) el.click(); } };
  }
  function form(id, msgId){
    var f = document.getElementById(id), msg = document.getElementById(msgId);
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var ok = true;
      Array.prototype.forEach.call(f.querySelectorAll('[data-req]'), function(inp){
        var bad = inp.type === 'checkbox' ? !inp.checked : !inp.value.trim();
        if (!bad && inp.dataset.match) bad = inp.value !== document.getElementById(inp.dataset.match).value;
        var err = document.getElementById(inp.id + '-err');
        if (err) err.classList.toggle('show', bad);
        if (bad) ok = false;
      });
      msg.classList.toggle('show', ok);
    });
    function clear(e){ var err = document.getElementById(e.target.id + '-err'); if (err) err.classList.remove('show'); msg.classList.remove('show'); }
    f.addEventListener('input', clear); f.addEventListener('change', clear);
  }
  function filterList(){
    var togs = document.querySelectorAll('[data-cat]'), items = document.querySelectorAll('.acc'), q = document.getElementById('q'), empty = document.getElementById('empty'), cat = 'all';
    function apply(){
      var v = q ? q.value.trim() : '', shown = 0;
      Array.prototype.forEach.call(items, function(it){
        var ok = (cat === 'all' || it.dataset.c === cat) && (!v || it.textContent.indexOf(v) !== -1);
        it.classList.toggle('hide', !ok); if (ok) shown++;
      });
      if (empty) empty.classList.toggle('show', shown === 0);
    }
    Array.prototype.forEach.call(togs, function(t){ t.addEventListener('click', function(){
      Array.prototype.forEach.call(togs, function(x){ x.classList.remove('on'); }); t.classList.add('on'); cat = t.dataset.cat; apply();
    }); });
    if (q) q.addEventListener('input', apply);
  }
  function duration(points, rate){ var mins = Math.floor(points / rate) * 10, h = Math.floor(mins / 60), m = mins % 60; return '약 ' + (h ? h + '시간' : '') + (m ? ' ' + m + '분' : ''); }
  function won(n){ return n.toLocaleString('ko-KR') + '원'; }
  function pt(n){ return n.toLocaleString('ko-KR') + 'P'; }
  return { duration: duration, seats: seats, counts: counts, board: board, form: form, filterList: filterList, won: won, pt: pt };
})();
