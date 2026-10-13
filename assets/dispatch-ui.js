const demoStoreKey='kexu-dispatch-demo-v1';
let dispatchForm={studentId:'general',title:'單元練習',mode:'sequence',perPaper:2,due:''};
let dispatchPreview=null,dispatchNotice='',dispatchError='';
function invalidateDispatchPreview(){dispatchPreview=null;const button=document.querySelector('[data-action="dispatch-confirm"]');if(button)button.disabled=true;}
function demoPlans(){
  try{
    const list=JSON.parse(sessionStorage.getItem(demoStoreKey)||'[]');
    return Array.isArray(list)?list.filter(p=>p&&typeof p.id==='string'&&typeof p.title==='string'&&Array.isArray(p.questionIds)&&p.questionIds.every(id=>questions.some(q=>q.id===id))&&Number.isInteger(p.perPaper)&&p.perPaper>0&&Number.isInteger(p.sequence)&&Array.isArray(p.receipts)&&p.drafts&&typeof p.drafts==='object'):[];
  }catch{return [];}
}
function saveDemoPlan(plan){
  const plans=demoPlans(),index=plans.findIndex(p=>p.id===plan.id);
  if(index<0)plans.push(plan);else plans[index]=plan;
  try{sessionStorage.setItem(demoStoreKey,JSON.stringify(plans));}catch{throw Error('此瀏覽器無法暫存示範，請允許網站儲存空間。');}
}
function demoStudentName(id){return KexuDispatch.students.find(s=>s.id===id)?.name||'示範學生';}
function demoPlanName(plan){return escape(plan.studentName||demoStudentName(plan.studentId));}
function demoStatus(plan){return {active:plan.drafts[plan.sequence]?'作答中（示範）':'未開始（示範）',paused:'教師已暫停',ended:'教師已結束',completed:'本輪已完成'}[plan.status]||'狀態未確認';}
function studentPreviewLink(plan){return `${root}student/?assignment=${encodeURIComponent(plan.id)}`;}
function dispatchPanel(){
  const plans=demoPlans();
  return `<div class="dispatch-notice">示範學生與派發只暫存於同一瀏覽器分頁，不是真實派發。</div>${dispatchError?`<div class="notice" role="alert">${escape(dispatchError)}</div>`:''}${dispatchNotice?`<div class="notice" role="status">${escape(dispatchNotice)}</div>`:''}<div class="builder-layout"><section class="panel"><h2>派發練習</h2><p class="muted-text">已選 ${selected.size} 題。先選題，再設定派發。</p><form id="dispatch-form"><label>學生<select name="studentId">${KexuDispatch.students.map(s=>`<option value="${s.id}" ${dispatchForm.studentId===s.id?'selected':''}>${s.name}</option>`).join('')}</select></label><label>練習名稱<input name="title" value="${escape(dispatchForm.title)}" required maxlength="80"></label><label>派發方式<select name="mode"><option value="single" ${dispatchForm.mode==='single'?'selected':''}>單份考卷</option><option value="sequence" ${dispatchForm.mode==='sequence'?'selected':''}>連續練習 · 完成後接續</option></select></label>${dispatchForm.mode==='sequence'?`<label>每份題數<input name="perPaper" type="number" min="1" max="${selected.size||1}" value="${dispatchForm.perPaper}" required></label>`:''}<label>期限（選填）<input name="due" type="date" value="${escape(dispatchForm.due)}"></label><button class="button primary" ${selected.size?'':'disabled'}>預覽派發</button> ${button('回題庫選題','questions')}</form><details class="teaching-notes"><summary>學生如何加入老師？</summary><p>正式版以教師邀請碼建立師生關係；此處使用示範學生，邀請與註冊尚未開放。</p></details></section><section class="panel"><h2>${dispatchPreview?'確認派發內容':'派發預覽'}</h2>${dispatchPreview?`<p><strong>${escape(dispatchPreview.title)}</strong></p><p class="muted-text">${demoStudentName(dispatchPreview.studentId)} · ${dispatchPreview.mode==='single'?'單份':'連續練習'} · 每份${dispatchPreview.perPaper}題${dispatchPreview.due?' · 期限'+escape(dispatchPreview.due):''}</p><ol>${KexuDispatch.currentIds(dispatchPreview).map(id=>`<li>${math(questions.find(q=>q.id===id).stem)}</li>`).join('')}</ol><p class="muted-text">共${Math.floor(dispatchPreview.questionIds.length/dispatchPreview.perPaper)}份完整練習；連續模式完成當前卷後才接續。</p>${button('確認派發（示範）','dispatch-confirm','primary')}`:'<p class="muted-text">選擇學生與派發方式後，先確認第一份考卷。</p>'}</section></div><section class="panel dispatch-records"><h2>派發紀錄（示範）</h2>${plans.length?plans.map(p=>`<article class="dispatch-record"><div><strong>${escape(p.title)}</strong><p>${demoPlanName(p)} · ${p.mode==='single'?'單份':'連續'} · 已完成${p.receipts.length}份 · ${demoStatus(p)}</p></div><div class="dispatch-actions"><a class="button" href="${studentPreviewLink(p)}">查看學生預覽</a>${p.status==='active'?button('暫停','plan-pause:'+p.id):p.status==='paused'?button('恢復','plan-resume:'+p.id):''}${['active','paused'].includes(p.status)?button('結束','plan-end:'+p.id):''}</div></article>`).join(''):'<p class="muted-text">尚未建立示範派發。</p>'}</section>`;
}
function viewedDemoPlan(){const id=new URLSearchParams(location.search).get('assignment')||selfCurrentId(),plans=demoPlans();return plans.find(p=>p.id===id);}
function demoAnswers(plan){return plan.drafts[plan.sequence]||{};}
function completedDemoQuestions(plan){const a=demoAnswers(plan);return KexuDispatch.currentIds(plan).filter(id=>a[id]&&(a[id].skipped||typeof a[id].value==='string'&&a[id].value.trim())).length;}
function updateDemoProgress(plan){
  const count=completedDemoQuestions(plan),total=KexuDispatch.currentIds(plan).length,label=document.querySelector('#demo-progress');
  if(label)label.textContent=`${count} / ${total} 題已登記`;
  const submit=document.querySelector('[data-action="simulate-submit"]');if(submit)submit.disabled=count!==total||total===0;
}
function demoHistory(plan){return `<section class="panel"><h2>完成紀錄（示範）</h2>${plan?.receipts.length?plan.receipts.map(r=>`<article class="history-entry"><h3>第${r.sequence}份 · 示範完成</h3><p class="muted-text">${r.questionIds.length}題；沒有送出作答或建立真實交卷紀錄。</p><ol>${r.questionIds.map(id=>`<li>${math(questions.find(q=>q.id===id).stem)}<p>示範答覆：${r.answers[id].skipped?'不會':escape(r.answers[id].value)}</p></li>`).join('')}</ol></article>`).join(''):'<p class="muted-text">尚無完成紀錄。</p>'}</section>`;}
function renderAssignedStudent(){
  const plan=viewedDemoPlan();
  const teacherLink=new URLSearchParams(location.search).has('assignment');
  let content=heading(teacherLink?'老師派給我的練習':'學生練習',teacherLink?'所有派發與完成操作均為示範，不送出資料。':'選姓名、學制、年級與單元，系統自動組卷。');
  if(dispatchNotice)content+=`<div class="notice" role="status">${escape(dispatchNotice)}</div>`;
  if(dispatchError)content+=`<div class="notice" role="alert">${escape(dispatchError)}</div>`;
  if(!teacherLink)content+=selfSelectionPanel(plan);
  if(studentMode==='history'){shell(content+demoHistory(plan),'student');return;}
  if(!plan){shell(content+(teacherLink?`<section class="panel"><h2>尚未收到老師派發的練習</h2><p class="muted-text">先在教師展示中選題並確認派發，再回到學生預覽。</p><a class="button" href="${root}teacher/?tab=sequence">前往教師派發</a></section>`:''),'student');return;}
  if(plan.status!=='active'){shell(content+`<section class="panel"><h2>${demoStatus(plan)}</h2><p class="muted-text">${['completed','ended'].includes(plan.status)?plan.origin==='self'?'本輪示範題已完成，可選擇其他單元或年級。':'請老師安排新一輪練習。':'老師恢復後，才可繼續這份練習。'}</p>${plan.origin==='self'?'':`<a class="button" href="${root}teacher/?tab=sequence">回教師展示</a>`}</section>`+demoHistory(plan),'student');return;}
  const ids=KexuDispatch.currentIds(plan),qs=ids.map(id=>questions.find(q=>q.id===id)),answers=demoAnswers(plan);
  content+=`<section class="assignment-header"><div><span class="badge">第 ${plan.sequence} 份 · ${plan.origin==='self'?'自動出卷示範':'教師派發示範'}</span><h2>${escape(plan.title)}</h2><p>${demoPlanName(plan)}${plan.origin==='self'?' · '+selfSchoolYearLabel(plan):''} · ${qs.length}題${plan.due?' · 期限'+escape(plan.due):''}</p></div><a class="button" href="${root}print/?variant=student&q=${encodeURIComponent(ids.join(','))}" target="_blank" rel="noopener">學生卷 · 列印預覽</a></section><div class="practice-toolbar"><div class="segmented">${button('線上作答預覽','online',studentMode==='online'?'active':'')}${button('紙本回傳預覽','upload',studentMode==='upload'?'active':'')}</div><span id="demo-progress">${completedDemoQuestions(plan)} / ${qs.length} 題已登記</span></div>`;
  if(studentMode==='upload'){shell(content+`<section class="panel paper-upload"><h2>紙本回傳介面</h2><p>正式版可回傳照片／PDF，確認有效交卷後才續卷。</p><div class="dropzone"><strong>JPG、PNG 或 PDF</strong><span>展示版不讀取或上傳檔案</span></div><button class="button primary" disabled>回傳與交卷 · 展示版未啟用</button></section>`,'student');return;}
  content+=`<div class="practice-questions">${qs.map((q,i)=>{const a=answers[q.id]||{value:'',skipped:false};return `<section class="practice-question"><div class="practice-question-heading"><span class="question-number">${i+1}</span><span>${q.type}</span><span class="unit-tag">${q.unit}</span></div><h3>${math(q.stem)}</h3>${q.options.length?`<div class="answer-options">${q.options.map((o,k)=>`<label><input type="radio" name="${q.id}" data-answer-id="${q.id}" value="${String.fromCharCode(65+k)}" ${a.value===String.fromCharCode(65+k)?'checked':''} ${a.skipped?'disabled':''}><strong>${String.fromCharCode(65+k)}</strong>${math(o)}</label>`).join('')}</div>`:`<label>示範答案<textarea name="${q.id}" data-answer-id="${q.id}" aria-label="第${i+1}題示範答案" ${a.skipped?'disabled':''}>${escape(a.value)}</textarea></label>`}<label class="skip-control"><input type="checkbox" data-skip-id="${q.id}" ${a.skipped?'checked':''}>這題不會（示範）</label></section>`;}).join('')}<div class="submission-footer"><div><strong>每題作答或明示不會，才能模擬完成。</strong><p>${plan.mode==='sequence'?'完成後自動接續，同一輪不重複題目。':'單份練習完成後結束。'}</p></div><div>${button('暫存示範草稿','save-demo-draft')}<button class="button primary" data-action="simulate-submit" ${completedDemoQuestions(plan)===qs.length?'':'disabled'}>模擬完成這份</button></div></div><p class="muted-text">示範只暫存於本分頁，真實交卷未啟用。</p></div>`;
  shell(content,'student');
}
function updateDemoAnswer(el,isSkip){
  const plan=viewedDemoPlan();if(!plan||plan.status!=='active')return;
  const id=isSkip?el.dataset.skipId:el.dataset.answerId;if(!KexuDispatch.currentIds(plan).includes(id))return;
  const answers={...demoAnswers(plan)},previous=answers[id]||{value:'',skipped:false};
  answers[id]=isSkip?{...previous,skipped:el.checked}:{value:el.value,skipped:previous.skipped};
  const updated={...plan,drafts:{...plan.drafts,[plan.sequence]:answers}};
  try{saveDemoPlan(updated);if(isSkip)student();else updateDemoProgress(updated);}catch(e){dispatchError=e.message;student();}
}
document.addEventListener('submit',event=>{
  if(event.target.id!=='dispatch-form')return;event.preventDefault();dispatchError='';dispatchNotice='';
  const input=Object.fromEntries(new FormData(event.target));dispatchForm={...dispatchForm,...input};
  try{dispatchPreview=KexuDispatch.create({...dispatchForm,questionIds:[...selected]},questions.map(q=>q.id));}catch(e){dispatchPreview=null;dispatchError=e.message;}
  teacher();
});
document.addEventListener('change',event=>{
  const el=event.target;
  if(el.closest('#dispatch-form')&&el.name){dispatchForm[el.name]=el.value;invalidateDispatchPreview();if(el.name==='mode')teacher();}
  if(el.dataset.skipId)updateDemoAnswer(el,true);else if(el.dataset.answerId)updateDemoAnswer(el,false);
});
document.addEventListener('input',event=>{
  const el=event.target;if(el.closest('#dispatch-form')&&el.name){dispatchForm[el.name]=el.value;invalidateDispatchPreview();}
  if(el.dataset.answerId)updateDemoAnswer(el,false);
});
document.addEventListener('click',event=>{
  const action=event.target.closest('button')?.dataset.action;if(!action)return;
  try{
    if(action==='dispatch-confirm'){
      if(!dispatchPreview)return;
      if(demoPlans().some(p=>p.studentId===dispatchPreview.studentId&&['active','paused'].includes(p.status)))throw Error('此示範學生已有進行中的練習，請先完成或結束。');
      saveDemoPlan(dispatchPreview);dispatchPreview=null;dispatchError='';dispatchNotice='示範派發已建立。點「查看學生預覽」體驗，沒有派發到真實帳號。';teacher();
    }else if(action.startsWith('plan-')){
      const [operation,id]=action.split(':'),plan=demoPlans().find(p=>p.id===id);if(!plan)return;
      saveDemoPlan(KexuDispatch.setStatus(plan,{'plan-pause':'paused','plan-resume':'active','plan-end':'ended'}[operation]));dispatchNotice='示範狀態已更新。';teacher();
    }else if(action==='simulate-submit'){
      const plan=viewedDemoPlan();if(!plan)return;const updated=KexuDispatch.complete(plan,plan.sequence,demoAnswers(plan),questions);saveDemoPlan(updated);dispatchError='';dispatchNotice=updated.status==='completed'?'本輪示範已完成，沒有送出作答。':'已接續下一份示範，沒有送出作答。';student();
    }else if(action==='save-demo-draft'){dispatchNotice='示範草稿已暫存於本瀏覽器分頁。';student();}
  }catch(e){dispatchError=e.message;if(page==='teacher')teacher();else student();}
});
