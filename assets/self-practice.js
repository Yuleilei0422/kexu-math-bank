const selfSelectionKey='kexu-self-selection-v1',selfCurrentKey='kexu-self-current-v1';
let selfDraft=null,selfSettingsOpen=false;
function selfSelection(){
  if(!selfDraft){let stored={};try{stored=JSON.parse(sessionStorage.getItem(selfSelectionKey)||'{}')||{};}catch{}
    selfDraft={name:typeof stored.name==='string'?stored.name:'',track:['普高','技高'].includes(stored.track)?stored.track:'普高',grade:[1,2,3].includes(Number(stored.grade))?Number(stored.grade):1,unit:typeof stored.unit==='string'?stored.unit:''};
  }
  const units=KexuDispatch.unitsFor(questions,selfDraft.track,selfDraft.grade);
  if(!units.includes(selfDraft.unit))selfDraft.unit=units[0]||'';
  return selfDraft;
}
function selfCurrentId(){try{return sessionStorage.getItem(selfCurrentKey);}catch{return null;}}
function selfSchoolYearLabel(plan){return `${plan.track==='普高'?'高中':'高職'} · 高${['一','二','三'][Number(plan.grade)-1]||'未指定'}`;}
function selfSelectionPanel(plan){
  const s=selfSelection(),units=KexuDispatch.unitsFor(questions,s.track,s.grade),names=[...new Set(['示範學生一','示範學生二',...demoPlans().filter(p=>p.origin==='self').map(p=>p.studentName)])];
  const form=`<form id="self-practice-form"><div class="self-form-grid"><label>姓名<input name="name" list="self-name-options" required maxlength="40" value="${escape(s.name)}" placeholder="選擇或輸入姓名" autocomplete="off"><datalist id="self-name-options">${names.map(n=>`<option value="${escape(n)}"></option>`).join('')}</datalist></label><label>高中／高職<select name="track"><option value="普高" ${s.track==='普高'?'selected':''}>高中</option><option value="技高" ${s.track==='技高'?'selected':''}>高職</option></select></label><label>年級<select name="grade">${[1,2,3].map(g=>`<option value="${g}" ${s.grade===g?'selected':''}>高${['一','二','三'][g-1]}</option>`).join('')}</select></label><label>單元<select name="unit" required>${units.map(u=>`<option ${u===s.unit?'selected':''}>${escape(u)}</option>`).join('')||'<option value="">尚無題目</option>'}</select></label></div><button class="button primary" ${units.length?'':'disabled'}>開始練習</button><p class="self-note">姓名僅作本分頁識別，非登入。單元為自編示範分類，尚未對照各校教材。</p></form>`;
  if(plan?.origin==='self'&&plan.status==='active')return `<details class="self-settings" ${selfSettingsOpen?'open':''}><summary>更換姓名、年級或單元</summary>${form}</details>`;
  return `<section class="panel self-select"><h2>選擇練習</h2>${form}</section>`;
}
document.addEventListener('toggle',event=>{if(event.target.classList?.contains('self-settings'))selfSettingsOpen=event.target.open;},true);
document.addEventListener('input',event=>{const el=event.target;if(el.closest('#self-practice-form')&&el.name)selfSelection()[el.name]=el.value;});
document.addEventListener('change',event=>{
  const el=event.target;if(!el.closest('#self-practice-form')||!el.name)return;
  const selection=selfSelection();selection[el.name]=el.name==='grade'?Number(el.value):el.value;
  if(['track','grade'].includes(el.name)){selection.unit='';selfSettingsOpen=true;student();}
});
document.addEventListener('submit',event=>{
  if(event.target.id!=='self-practice-form')return;event.preventDefault();dispatchNotice='';dispatchError='';
  const input=Object.fromEntries(new FormData(event.target));
  try{
    const plans=demoPlans(),plan=KexuDispatch.createSelf(input,questions,plans),resumed=plans.some(p=>p.id===plan.id);
    saveDemoPlan(plan);selfDraft={name:plan.studentName,track:plan.track,grade:plan.grade,unit:plan.unit};
    sessionStorage.setItem(selfSelectionKey,JSON.stringify(selfDraft));sessionStorage.setItem(selfCurrentKey,plan.id);selfSettingsOpen=false;studentMode='online';
    dispatchNotice=resumed?'已接續尚未完成的練習；完成後再選其他單元。':'練習卷已準備好，可直接開始作答。';student();
  }catch(e){
    const key=typeof input.name==='string'?input.name.trim().normalize('NFKC').toLowerCase():'';
    const completed=demoPlans().filter(p=>p.origin==='self'&&p.profileKey===key&&p.track===input.track&&p.grade===Number(input.grade)&&p.unit===input.unit&&p.status==='completed').at(-1);
    if(completed){selfDraft={name:completed.studentName,track:completed.track,grade:completed.grade,unit:completed.unit};try{sessionStorage.setItem(selfCurrentKey,completed.id);sessionStorage.setItem(selfSelectionKey,JSON.stringify(selfDraft));}catch{}}
    dispatchError=e.message;student();
  }
});
