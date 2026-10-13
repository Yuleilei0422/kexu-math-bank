/* 純示範狀態，不構成伺服器權限或真實交卷。 */
(function(global){
  const students=[{id:'general',name:'高中示範學生'},{id:'vocational',name:'高職示範學生'}];
  function create(input,knownIds){
    const title=String(input.title||'').trim();
    if(!title||title.length>80)throw Error('請填寫80字內的練習名稱。');
    if(!students.some(s=>s.id===input.studentId))throw Error('請選擇示範學生。');
    if(!['single','sequence'].includes(input.mode))throw Error('派發方式不正確。');
    const ids=input.questionIds;
    if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!knownIds.includes(id)))throw Error('請先從題庫選擇有效題目。');
    const perPaper=input.mode==='single'?ids.length:Number(input.perPaper);
    if(!Number.isInteger(perPaper)||perPaper<1||perPaper>ids.length)throw Error('每份題數必須介於1與已選題數之間。');
    if(input.due&&!/^\d{4}-\d{2}-\d{2}$/.test(input.due))throw Error('期限格式不正確。');
    return {id:global.crypto.randomUUID(),studentId:input.studentId,title,mode:input.mode,perPaper,questionIds:[...ids],due:input.due||'',status:'active',sequence:1,receipts:[],drafts:{}};
  }
  function currentIds(plan){
    if(plan.status!=='active')return [];
    const start=(plan.sequence-1)*plan.perPaper,ids=plan.questionIds.slice(start,start+plan.perPaper);
    return ids.length===plan.perPaper?ids:[];
  }
  function complete(plan,sequence,answers,questions){
    if(plan.receipts.some(r=>r.sequence===sequence))return plan;
    if(plan.status!=='active'||sequence!==plan.sequence)throw Error('這份練習尚不可完成。');
    const ids=currentIds(plan);
    if(!ids.length)throw Error('本輪沒有可完成的練習。');
    for(const id of ids){
      const q=questions.find(q=>q.id===id),a=answers?.[id];
      if(!q||!a||typeof a.value!=='string'||typeof a.skipped!=='boolean')throw Error('每題請作答或明示不會。');
      if(!a.skipped&&(!a.value.trim()||q.options.length&&!q.options.some((_,i)=>String.fromCharCode(65+i)===a.value)))throw Error('每題請作答或明示不會。');
    }
    const next={...plan,receipts:[...plan.receipts,{sequence,questionIds:ids,answers:JSON.parse(JSON.stringify(answers))}],sequence:sequence+1};
    if(plan.mode==='single'||next.questionIds.length-(next.sequence-1)*next.perPaper<next.perPaper)next.status='completed';
    return next;
  }
  function setStatus(plan,status){
    if(!['active','paused','ended'].includes(status))throw Error('狀態不正確。');
    if(['completed','ended'].includes(plan.status))throw Error('這輪已結束，請建立新的練習。');
    return {...plan,status};
  }
  global.KexuDispatch=Object.freeze({students,create,currentIds,complete,setStatus});
})(globalThis);
