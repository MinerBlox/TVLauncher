/* Tonight TV interaction layer: no changes to the LG launch implementation. */
(function(){
  function init(){
    var search=document.getElementById('tonight-query');
    var status=document.getElementById('tonight-status');
    var hero=document.getElementById('tonight-hero');
    var drawer=document.getElementById('realappbarbtu');
    if(!search || !drawer) return;
    search.addEventListener('keydown',function(e){
      if(e.key==='Enter'){
        e.preventDefault();
        status.textContent=search.value.trim() ? 'Streaming availability search is not connected yet.' : 'Enter a movie or TV show title.';
      }
      if(e.key==='Escape'){ search.blur(); }
    });
    document.addEventListener('wheel',function(e){
      if(e.deltaY>20 && !drawer.checked && !e.target.closest('input')){ drawer.checked=true; }
      else if(e.deltaY< -20 && drawer.checked && e.target.closest('#appbar')){drawer.checked=false;}
    },{passive:true});
    document.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown' && !drawer.checked && !document.activeElement.matches('input,textarea') && !e.defaultPrevented){
        drawer.checked=true;
      }
    });
    var palette=['rgba(49,142,255,.55)','rgba(255,72,123,.52)','rgba(143,80,255,.5)','rgba(34,209,156,.55)','rgba(28,155,247,.55)','rgba(255,181,42,.5)'];
    function setGlow(tile,index) {
      if(tile.dataset.tonightGlow) return;
      var icon=tile.querySelector('img');
      var color=icon && icon.style.backgroundColor;
      tile.style.setProperty('--tile-glow',color || palette[index%palette.length]);
      tile.dataset.tonightGlow='true';
    }
    function updateTiles(){document.querySelectorAll('.appitem').forEach(setGlow);}
    new MutationObserver(updateTiles).observe(document.getElementById('maindiv'),{subtree:true,childList:true});
    updateTiles();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
