let resultName='',resultUnit='';
function teacherResultsPanel(){
  const all=demoPlans().flatMap(plan=>plan.receipts.map(receipt=>({plan,receipt}))).reverse().sort((a,b)=>(Date.parse(b.receipt.completedAt)||0)-(Date.parse(a.receipt.completedAt)||0));
  const names=[...new Set(all.map(({plan})=>plan.studentName||'示範學生'))];
  const units=[...new Set(all.map(({plan})=>plan.unit||plan.title))];
  const list=all.filter(({plan})=>(!resultName||(plan.studentName||'示範學生')===resultName)&&(!resultUnit||(plan.unit||plan.title)===resultUnit));
  const statusText={correct:'正確',incorrect:'錯誤',skipped:'不會',review:'待複核'};
  return `<p class="muted-text">學生完成後自動批改，結果僅在教師介面呈現。此處為同分頁展示，尚未跨裝置回傳；公開展示沒有教師登入權限。</p><div class="filter-row"><label>學生<select id="result-name"><option value="">全部學生</option>${names.map(name=>`<option value="${escape(name)}" ${resultName===name?'selected':''}>${escape(name)}</option>`).join('')}</select></label><label>單元<select id="result-unit"><option value="">全部單元</option>${units.map(unit=>`<option value="${escape(unit)}" ${resultUnit===unit?'selected':''}>${escape(unit)}</option>`).join('')}</select></label></div><p class="muted-text">${list.length} 份完成紀錄</p>${list.length?list.map(({plan,receipt})=>{
    const grading=receipt.grading||KexuDispatch.gradePaper(receipt.questionIds,receipt.answers,questions);
    return `<article class="panel teacher-result"><h2>${demoPlanName(plan)} · 第${receipt.sequence}份</h2><p class="muted-text">${plan.track?escape(selfSchoolYearLabel(plan))+' · ':''}${escape(plan.unit||plan.title)} · ${escape(completedTime(receipt))}</p><p class="result-summary">${grading.score===null?'待教師複核，總分未定':`最終答案得分 ${grading.score} / 100`} · 正確 ${grading.correct} · 錯誤 ${grading.incorrect} · 不會 ${grading.skipped} · 待複核 ${grading.review}</p><p class="muted-text">等權計分；自動批改只核對最終答案，解題過程由教師判斷。</p>${grading.items.map((item,index)=>{const q=questions.find(q=>q.id===item.questionId),answer=receipt.answers[item.questionId];return `<details class="result-question"><summary>第${index+1}題 · ${statusText[item.status]}</summary><h3>${math(q.stem)}</h3><p>學生作答：${answer.skipped?'不會':escape(answer.value)}</p>${item.status==='review'?'<p class="notice">此答覆無法可靠自動判定，請教師核對。</p>':''}${solution(q)}</details>`;}).join('')}</article>`;
  }).join(''):'<section class="panel"><h2>尚無作答結果</h2><p class="muted-text">在同一分頁的學生頁完成練習，再回此頁查看。只有完成才產生紀錄，草稿不會送入此處。</p></section>'}`;
}
document.addEventListener('change',event=>{
  const el=event.target;
  if(el.id==='result-name')resultName=el.value;else if(el.id==='result-unit')resultUnit=el.value;else return;
  teacher();
});
