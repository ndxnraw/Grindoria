let desktopUpdateState=null,desktopUpdateUnsubscribe=null;
function desktopUpdateMessage(state){
 return {idle:'Kontrola aktualizácií je pripravená.',checking:'Kontrolujem aktualizácie…',available:'Je dostupná nová verzia.',current:'Máš aktuálnu verziu.',downloading:'Sťahovanie: '+Math.floor(state.percent||0)+' %',downloaded:'Aktualizácia je pripravená na inštaláciu.',installing:'Inštalujem aktualizáciu…',error:'Aktualizáciu sa nepodarilo overiť alebo stiahnuť. Môžeš hrať offline.',offline:'Kontrola trvá príliš dlho. Môžeš hrať offline.',development:'Kontrola aktualizácií je dostupná v nainštalovanej hre.'}[state.status]||'Aktualizácie';
}
function renderDesktopUpdates(){
 const state=desktopUpdateState;if(!state)return;
 const busy=['checking','downloading','installing'].includes(state.status),action=state.status==='available'?'download':state.status==='downloaded'?'install':'check';
 modal('<h2>Aktualizácie</h2><p>Verzia '+escapeHTML(state.currentVersion)+(state.version?' → '+escapeHTML(state.version):'')+'</p><p role="status">'+escapeHTML(desktopUpdateMessage(state))+'</p><button class="primary" id="desktop-update-action" '+(busy||state.status==='development'?'disabled':'')+'>'+(action==='download'?'Stiahnuť aktualizáciu':action==='install'?'Uložiť a reštartovať':'Skontrolovať znova')+'</button><p id="desktop-update-error" role="alert"></p>',{key:'desktop-updates'});
 const errorMessage=$('desktop-update-error');
 $('desktop-update-action').onclick=async()=>{
  if(action==='install'&&!saveActiveCharacter()){errorMessage.textContent='Postavu sa nepodarilo uložiť. Aktualizácia sa nespustila.';return;}
  try{await window.grindoriaDesktop.updates[action]();}catch{errorMessage.textContent='Aktualizáciu sa nepodarilo spustiť.';}
 };
}
function initializeDesktopUpdates(){
 const api=window.grindoriaDesktop?.updates;if(!api)return;
 const button=$('desktop-updates');button.hidden=false;
 const changed=state=>{desktopUpdateState=state;button.innerHTML='<span>↓</span><kbd>'+ (state.status==='downloading'?Math.floor(state.percent||0)+'%':['available','downloaded'].includes(state.status)?'!':'')+'</kbd>';button.title=desktopUpdateMessage(state);button.setAttribute('aria-label',button.title);if(gameWindows.has('desktop-updates'))withGameWindow('desktop-updates',renderDesktopUpdates);};
 button.onclick=renderDesktopUpdates;desktopUpdateUnsubscribe?.();desktopUpdateUnsubscribe=api.onChange(changed);api.get().then(changed).catch(()=>{});
}
