/* 同分頁練習展示；真正的交卷與教師權限需共享後端。 */
const demoStoreKey='kexu-dispatch-demo-v1';
let dispatchNotice='',dispatchError='';
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
function demoPlanName(plan){return escape(plan.studentName||KexuDispatch.students.find(s=>s.id===plan.studentId)?.name||'示範學生');}
function completedTime(receipt){const time=new Date(receipt.completedAt);return Number.isNaN(time.getTime())?'舊紀錄未保存時間':time.toLocaleString('zh-TW',{hour12:false});}
function viewedDemoPlan(){return demoPlans().find(p=>p.id===selfCurrentId());}
function demoAnswers(plan){return plan.drafts[plan.sequence]||{};}
function completedDemoQuestions(plan){const a=demoAnswers(plan);return KexuDispatch.currentIds(plan).filter(id=>a[id]&&(a[id].skipped||typeof a[id].value==='string'&&a[id].value.trim())).length;}
function updateDemoProgress(plan){
  const count=completedDemoQuestions(plan),total=KexuDispatch.currentIds(plan).length,label=document.querySelector('#demo-progress');
  if(label)label.textContent=`${count} / ${total} 題已登記`;
  const submit=document.querySelector('[data-action="simulate-submit"]');if(submit)submit.disabled=count!==total||total===0;
}
function demoHistory(plan){
  return `<section class="panel"><h2>完成紀錄（示範）</h2>${plan?.receipts.length?plan.receipts.map(r=>`<article class="history-entry"><h3>第${r.sequence}份 · 已完成</h3><p class="muted-text">${r.questionIds.length}題 · ${escape(completedTime(r))}</p></article>`).join(''):'<p class="muted-text">尚無完成紀錄。</p>'}</section>`;
}
function renderAssignedStudent(){
  const plan=viewedDemoPlan();
  let content=heading('學生練習','選姓名、學制、年級與單元，系統自動組卷。');
  if(dispatchNotice)content+=`<div class="notice" role="status">${escape(dispatchNotice)}</div>`;
  if(dispatchError)content+=`<div class="notice" role="alert">${escape(dispatchError)}</div>`;
  content+=selfSelectionPanel(plan);
  if(studentMode==='history'){shell(content+demoHistory(plan),'student');return;}
  if(!plan){shell(content,'student');return;}
  if(plan.status!=='active'){
    shell(content+`<section class="panel"><h2>${plan.status==='completed'?'本輪已完成':'這輪練習已停止'}</h2><p class="muted-text">可選擇其他單元或年級開始練習。</p></section>`+demoHistory(plan),'student');return;
  }
  const ids=KexuDispatch.currentIds(plan),qs=ids.map(id=>questions.find(q=>q.id===id)),answers=demoAnswers(plan);
  content+=`<section class="assignment-header"><div><span class="badge">第 ${plan.sequence} 份 · 自動出卷示範</span><h2>${escape(plan.title)}</h2><p>${demoPlanName(plan)} · ${selfSchoolYearLabel(plan)} · ${qs.length}題</p></div><a class="button" href="${root}print/?variant=student&q=${encodeURIComponent(ids.join(','))}" target="_blank" rel="noopener">學生卷 · 列印預覽</a></section><div class="practice-toolbar"><div class="segmented">${button('線上作答預覽','online',studentMode==='online'?'active':'')}${button('紙本回傳預覽','upload',studentMode==='upload'?'active':'')}</div><span id="demo-progress">${completedDemoQuestions(plan)} / ${qs.length} 題已登記</span></div>`;
  if(studentMode==='upload'){shell(content+`<section class="panel paper-upload"><h2>紙本回傳介面</h2><p>正式版可回傳照片／PDF，確認有效交卷後才續卷。</p><div class="dropzone"><strong>JPG、PNG 或 PDF</strong><span>展示版不讀取或上傳檔案</span></div><button class="button primary" disabled>回傳與交卷 · 展示版未啟用</button></section>`,'student');return;}
  content+=`<div class="practice-questions">${qs.map((q,i)=>{const a=answers[q.id]||{value:'',skipped:false};return `<section class="practice-question"><div class="practice-question-heading"><span class="question-number">${i+1}</span><span>${q.type}</span><span class="unit-tag">${q.unit}</span></div><h3>${math(q.stem)}</h3>${q.options.length?`<div class="answer-options">${q.options.map((o,k)=>`<label><input type="radio" name="${q.id}" data-answer-id="${q.id}" value="${String.fromCharCode(65+k)}" ${a.value===String.fromCharCode(65+k)?'checked':''} ${a.skipped?'disabled':''}><strong>${String.fromCharCode(65+k)}</strong>${math(o)}</label>`).join('')}</div>`:`<label>示範答案<textarea name="${q.id}" data-answer-id="${q.id}" aria-label="第${i+1}題示範答案" placeholder="填寫最終答案，如 4、1/2；解題過程由教師複核" ${a.skipped?'disabled':''}>${escape(a.value)}</textarea></label>`}<label class="skip-control"><input type="checkbox" data-skip-id="${q.id}" ${a.skipped?'checked':''}>這題不會（示範）</label></section>`;}).join('')}<div class="submission-footer"><div><strong>每題作答或明示不會，才能模擬完成。</strong><p>完成後自動接續，同一輪不重複題目。批改由教師查看。</p></div><div>${button('暫存示範草稿','save-demo-draft')}<button class="button primary" data-action="simulate-submit" ${completedDemoQuestions(plan)===qs.length?'':'disabled'}>模擬完成這份</button></div></div><p class="muted-text">示範僅存本分頁，尚未跨裝置送給教師。</p></div>`;
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
document.addEventListener('change',event=>{const el=event.target;if(el.dataset.skipId)updateDemoAnswer(el,true);else if(el.dataset.answerId)updateDemoAnswer(el,false);});
document.addEventListener('input',event=>{if(event.target.dataset.answerId)updateDemoAnswer(event.target,false);});
document.addEventListener('click',event=>{
  const action=event.target.closest('button')?.dataset.action;
  if(!['simulate-submit','save-demo-draft'].includes(action))return;
  try{
    if(action==='simulate-submit'){
      const plan=viewedDemoPlan();if(!plan)return;
      const updated=KexuDispatch.complete(plan,plan.sequence,demoAnswers(plan),questions);saveDemoPlan(updated);
      dispatchError='';dispatchNotice=updated.status==='completed'?'已完成。本輪練習結束。':'已完成，已接續下一份。';student();
    }else{dispatchNotice='示範草稿已暫存於本瀏覽器分頁。';student();}
  }catch(e){dispatchError=e.message;student();}
});
