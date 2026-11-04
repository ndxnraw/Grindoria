let journalTab='active';
function journal(){
 if(!running)return;
 const active=questEntries().filter(q=>!q.completed),done=questEntries().filter(q=>q.completed);
 const bio=p.career.biology;
 for(let i=0;i<bio.stage;i++)done.push({id:'bio-'+i,title:'Biológ · '+BIOLOGY[i].name,completed:true,reward:BIOLOGY[i].text,goals:[]});
 if(p.huntClaimed)done.push({id:'hunts',title:'Lovec · dokončené '+p.huntClaimed+'×',completed:true,reward:'Celkom '+(60*p.huntClaimed)+' Yang + '+p.huntClaimed+' tréningových pečatí',goals:[]});
 const entries=journalTab==='completed'?done:active;
 modal('<h2>Úlohy</h2><nav class="quest-tabs"><button data-quest-tab="active" aria-pressed="'+(journalTab==='active')+'">Aktívne · '+active.length+'</button><button data-quest-tab="completed" aria-pressed="'+(journalTab==='completed')+'">Splnené · '+done.length+'</button></nav>'+entries.map(q=>'<article class="journal-entry"><h3>'+q.title+'</h3>'+q.goals.map(([name,have,need])=>requirementRow(name,have,need)).join('')+'<p class="quest-reward">Odmena: '+q.reward+'</p>'+(q.completed?'<small>Splnené</small>':q.id==='biology'?'<p>Úroveň '+q.minLevel+' · '+q.info+'</p><button data-quest-biology>Podrobnosti výskumu</button>':'<button class="primary" data-quest-claim="'+q.id+'" '+(q.ready?'':'disabled')+'>Vyzdvihnúť odmenu</button>')+'</article>').join('')+(journalTab==='active'?worldEventsJournalCard():''),{key:'journal',refresh:journal});
 panelQueryAll('[data-quest-tab]').forEach(button=>button.onclick=()=>{journalTab=button.dataset.questTab;journal();});
 panelQueryAll('[data-quest-claim]').forEach(button=>button.onclick=()=>{const q=questEntries().find(q=>q.id===button.dataset.questClaim);if(q?.ready)q.claim();journal();updateHUD();});
 panelQueryAll('[data-quest-biology]').forEach(button=>button.onclick=()=>careerPanel('biology'));
}
function updateQuestHUD(){
 const q=trackedQuest(),panel=$('quest-tracker');panel.hidden=!q;if(!q)return;
 $('quest-title').textContent=q.title;
 setHUDHTML('q-wolves',q.goals[0]?escapeHTML(q.goals[0][0])+' <b>'+q.goals[0][1]+' / '+q.goals[0][2]+'</b>':'');
 setHUDHTML('q-stones',q.goals[1]?escapeHTML(q.goals[1][0])+' <b>'+q.goals[1][1]+' / '+q.goals[1][2]+'</b>':'');
 $('q-stones').hidden=!q.goals[1];$('claim').hidden=!q.ready||!q.claim;$('claim').classList.toggle('is-ready',q.ready);$('questnote').textContent=q.info||'Odmena: '+q.reward;
}
