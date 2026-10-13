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
  function unitsFor(questions,track,grade){return [...new Set(questions.filter(q=>q.track===track&&q.grade===Number(grade)).map(q=>q.unit))];}
  function createSelf(input,questions,plans=[]){
    if(typeof input.name!=='string'||!input.name.trim()||input.name.trim().length>40)throw Error('請選擇或輸入40字內的姓名。');
    const name=input.name.trim(),profileKey=name.normalize('NFKC').toLowerCase(),grade=Number(input.grade);
    if(!['普高','技高'].includes(input.track)||![1,2,3].includes(grade))throw Error('請選擇高中／高職及年級。');
    const matching=questions.filter(q=>q.track===input.track&&q.grade===grade&&q.unit===input.unit);
    if(!matching.length)throw Error('這個單元尚無示範題目，請選擇其他單元。');
    const pending=plans.find(p=>p.origin==='self'&&p.profileKey===profileKey&&['active','paused'].includes(p.status));
    if(pending)return pending;
    const used=new Set(plans.filter(p=>p.origin==='self'&&p.profileKey===profileKey&&p.track===input.track&&p.grade===grade&&p.unit===input.unit).flatMap(p=>p.receipts.flatMap(r=>r.questionIds)));
    const ids=matching.filter(q=>!used.has(q.id)).map(q=>q.id);
    if(!ids.length)throw Error('這個單元的示範題已練完，暫無新題可出卷。');
    const plan=create({studentId:input.track==='普高'?'general':'vocational',title:input.unit+'練習',mode:'sequence',perPaper:Math.min(2,ids.length),questionIds:ids},questions.map(q=>q.id));
    return {...plan,origin:'self',studentId:'self:'+profileKey,studentName:name,profileKey,track:input.track,grade,unit:input.unit};
  }
  global.KexuDispatch=Object.freeze({students,create,currentIds,complete,setStatus,unitsFor,createSelf});
})(globalThis);
