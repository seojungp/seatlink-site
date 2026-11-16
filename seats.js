(function(){
  var $=function(id){return document.getElementById(id);},cur=null,rate=200,freeOnly=true,view='list',visible=[];
  var go=$('go'),msg=$('go-msg'),pcs=$('pcs');
  function refreshRate(){
    $('seat-rate').textContent=SL.pt(rate);
    $('seat-duration').textContent=(rate===200?'60':'144')+'프레임 기준 '+SL.duration(14400,rate)+' 이용 가능';
    document.querySelectorAll('[data-rate]').forEach(function(btn){var on=Number(btn.dataset.rate)===rate;btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',String(on));});
  }
  function select(s){
    cur=s;$('d-seat').textContent=s.name;$('d-gpu').textContent=s.gpu;$('d-cpu').textContent=s.cpu;$('d-ram').textContent=s.ram;
    $('selected-status').hidden=false;go.disabled=false;go.textContent=s.name+' 접속 미리보기';msg.classList.remove('show');
    document.querySelectorAll('.pc').forEach(function(card){var on=Number(card.dataset.no)===s.no;card.classList.toggle('selected',on);var btn=card.querySelector('button');if(!btn.disabled){btn.textContent=on?'선택한 좌석':'좌석 선택';btn.setAttribute('aria-pressed',String(on));}});
  }
  var board=SL.board($('seat-grid'),select);
  function clear(){
    cur=null;board.clear();$('d-seat').textContent='좌석 선택';['d-gpu','d-cpu','d-ram'].forEach(function(id){$(id).textContent='—';});$('selected-status').hidden=true;go.disabled=true;go.textContent='자리를 먼저 골라 주세요';msg.classList.remove('show');
    document.querySelectorAll('.pc').forEach(function(card){card.classList.remove('selected');var btn=card.querySelector('button');if(!btn.disabled){btn.textContent='좌석 선택';btn.setAttribute('aria-pressed','false');}});
  }
  [['f-gpu','gpu'],['f-cpu','cpu'],['f-reg','region']].forEach(function(pair){
    Array.from(new Set(SL.seats.map(function(s){return s[pair[1]];}))).forEach(function(value){var option=document.createElement('option');option.value=value;option.textContent=value;$(pair[0]).appendChild(option);});
  });
  SL.seats.forEach(function(s){
    var card=document.createElement('article');card.className='pc'+(s.busy?' busy':'');card.dataset.no=s.no;
    card.innerHTML='<div class="top"><span class="nm">'+s.name+'</span><span class="st '+(s.busy?'wait':'done')+'">'+(s.busy?'사용 중':'이용 가능')+'</span></div><div class="pc-gpu">'+s.gpu+'</div><dl><dt>프로세서</dt><dd>'+s.cpu+'</dd><dt>메모리</dt><dd>'+s.ram+' RAM</dd><dt>지역</dt><dd>'+s.region+' A구역</dd></dl><button type="button" class="btn line" aria-label="'+s.name+' 좌석 선택"'+(s.busy?' disabled':' aria-pressed="false"')+'>'+(s.busy?'사용 중':'좌석 선택')+'</button>';
    if(!s.busy)card.querySelector('button').addEventListener('click',function(){board.pick(s.no);if(matchMedia('(max-width:620px)').matches){document.querySelector('.selection-panel').scrollIntoView({block:'start'});}});
    pcs.appendChild(card);
  });
  function apply(){
    var q=$('f-q').value.trim().toLowerCase(),gpu=$('f-gpu').value,cpu=$('f-cpu').value,region=$('f-reg').value;
    visible=SL.seats.filter(function(s){return (!gpu||s.gpu===gpu)&&(!cpu||s.cpu===cpu)&&(!region||s.region===region)&&(!freeOnly||!s.busy)&&(!q||(s.name+' '+s.region+' '+s.gpu+' '+s.cpu).toLowerCase().includes(q));});
    SL.seats.forEach(function(s){var ok=visible.includes(s),tile=$('seat-grid').querySelector('[data-no="'+s.no+'"]');pcs.querySelector('[data-no="'+s.no+'"]').hidden=!ok;tile.classList.toggle('dim',!ok);tile.disabled=s.busy||!ok;});
    $('cnt').textContent=visible.length;$('empty').classList.toggle('show',visible.length===0);$('map-panel').hidden=view!=='map'||visible.length===0;pcs.hidden=view!=='list';
    var avail=visible.filter(function(s){return !s.busy;});$('reco').disabled=!avail.length;
    if(cur&&!visible.includes(cur))clear();
    $('f-free').classList.toggle('on',freeOnly);$('f-free').setAttribute('aria-pressed',String(freeOnly));
  }
  ['f-q','f-gpu','f-cpu','f-reg'].forEach(function(id){$(id).addEventListener('input',apply);});
  $('f-free').addEventListener('click',function(){freeOnly=!freeOnly;apply();});
  $('filter-reset').addEventListener('click',function(){['f-q','f-gpu','f-cpu','f-reg'].forEach(function(id){$(id).value='';});freeOnly=true;apply();});
  document.querySelectorAll('[data-view]').forEach(function(btn){btn.addEventListener('click',function(){view=btn.dataset.view;document.querySelectorAll('[data-view]').forEach(function(b){var on=b===btn;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});apply();});});
  document.querySelectorAll('[data-rate]').forEach(function(btn){btn.addEventListener('click',function(){rate=Number(btn.dataset.rate);refreshRate();msg.classList.remove('show');});});
  $('reco').addEventListener('click',function(){var available=visible.filter(function(s){return !s.busy;}).sort(function(a,b){return b.gpu.localeCompare(a.gpu)||a.no-b.no;});if(available[0])board.pick(available[0].no);});
  go.addEventListener('click',function(){if(!cur)return;msg.textContent='접속 미리보기 · '+cur.name+' / '+(rate===200?'60':'144')+'프레임 / 10분 '+SL.pt(rate)+'. 실제 접속과 포인트 차감은 연결되어 있지 않습니다.';msg.classList.add('show');});
  apply();refreshRate();
  var requested=Number(new URLSearchParams(location.search).get('seat')),initial=SL.seats.find(function(s){return s.no===requested&&!s.busy;});
  if(initial)board.pick(initial.no);else board.pick(15);
})();
