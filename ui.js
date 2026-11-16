(function(){
  var toggle = document.getElementById('menu-toggle'), drawer = document.getElementById('mobile-drawer');
  if(toggle && drawer){
    function close(){drawer.hidden=true;toggle.setAttribute('aria-expanded','false');}
    toggle.addEventListener('click',function(){var open=drawer.hidden;drawer.hidden=!open;toggle.setAttribute('aria-expanded',String(open));});
    drawer.querySelectorAll('a').forEach(function(a){a.addEventListener('click',close);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!drawer.hidden){close();toggle.focus();}});
    document.addEventListener('click',function(e){if(!e.target.closest('header'))close();});
  }
  var game = new URLSearchParams(location.search).get('game');
  var content = document.getElementById('ct'), category = document.getElementById('ty');
  if(game && content && category){
    category.value='기타 문의';
    content.value=game.slice(0,100)+'의 실행 가능 여부와 PC방 혜택 적용 여부를 확인하고 싶습니다.';
  }
})();
