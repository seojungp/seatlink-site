(function(){
  SL.counts();
  var board=SL.board(document.getElementById('seat-grid'),function(s){
    document.getElementById('home-seat').textContent=s.name;
    document.getElementById('home-gpu').textContent=s.gpu;
    document.getElementById('home-cpu').textContent=s.cpu;
    document.getElementById('home-connect').href='seats.html?seat='+s.no;
  });
  board.pick(15);
  var rate=200;
  function pricing(){
    document.querySelectorAll('[data-duration]').forEach(function(el){el.textContent=SL.duration(Number(el.dataset.duration),rate);});
    document.querySelectorAll('[data-home-rate]').forEach(function(btn){var on=Number(btn.dataset.homeRate)===rate;btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',String(on));});
    document.querySelectorAll('[data-plan-link]').forEach(function(a){a.href='charge.html?plan='+a.dataset.planLink+'&rate='+rate;});
    document.getElementById('home-rate-note').textContent=(rate===200?'60':'144')+'프레임 · 10분 '+rate+'P · 부가세 포함 · 10분 단위 선차감';
  }
  document.querySelectorAll('[data-home-rate]').forEach(function(btn){btn.addEventListener('click',function(){rate=Number(btn.dataset.homeRate);pricing();});});
  document.getElementById('game-search').addEventListener('input',function(){
    var q=this.value.trim().toLowerCase(),n=0;
    document.querySelectorAll('[data-game]').forEach(function(card){var match=card.dataset.game.toLowerCase().includes(q);card.hidden=!match;if(match)n++;});
    document.getElementById('game-empty').classList.toggle('show',n===0);
  });
  document.getElementById('download-button').addEventListener('click',function(){document.getElementById('download-feedback').hidden=false;});
  pricing();
})();
