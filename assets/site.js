/* 課序公開展示：作答結果暫存在同一分頁，不呼叫後端。 */
const root = document.body.dataset.root || './';
const page = document.body.dataset.page;
const questions = [
  {id:'q1',track:'普高',course:'數學 A',unit:'指數與對數',type:'單選題',stem:'若 $2^x=8$，則 $x$ 的值為何？',options:['2','3','4','8'],answer:'B',steps:['將 $8$ 寫成 $2^3$。','由 $2^x=2^3$，可得 $x=3$。'],concept:'同底數指數比較',mistake:'把底數與指數相加。',tip:'先將等號兩邊改成相同底數。'},
  {id:'q2',track:'普高',course:'數學 A',unit:'指數與對數',type:'單選題',stem:'$\u005clog_{10}1000$ 等於多少？',options:['2','3','10','100'],answer:'B',steps:['對數是指數的反向問題。','$10^3=1000$，故 $\u005clog_{10}1000=3$。'],concept:'對數定義',mistake:'把1000除以10。',tip:'請學生把對數式寫回指數式。'},
  {id:'q3',track:'普高',course:'共同數學',unit:'數列與級數',type:'計算題',stem:'等差數列首項為 $3$、公差為 $2$，求第 $8$ 項。',options:[],answer:'17',steps:['使用 $a_n=a_1+(n-1)d$。','$a_8=3+7\u005ctimes2=17$。'],concept:'等差數列通項',mistake:'以8乘公差，漏掉首項位置。',tip:'先列前3項，再解釋第8項與首項相距7次。'},
  {id:'q4',track:'普高',course:'共同數學',unit:'數列與級數',type:'計算題',stem:'求 $1+2+\u005ccdots+10$ 的值。',options:[],answer:'55',steps:['首尾配對，每對和為11，共5對。','$5\u005ctimes11=55$。'],concept:'等差級數求和',mistake:'漏算首項或末項。',tip:'用首尾配對介紹求和公式。'},
  {id:'q5',track:'技高',course:'數學 B',unit:'計數原理',type:'單選題',stem:'某餐點有 $2$ 種主食與 $3$ 種飲料，各選一種，共有幾種搭配？',options:['5','6','8','9'],answer:'B',steps:['每一種主食都能配3種飲料。','$2\u005ctimes3=6$ 種。'],concept:'乘法原理',mistake:'把兩階段選擇數相加。',tip:'畫2列3欄的搭配表。'},
  {id:'q6',track:'技高',course:'數學 B',unit:'計數原理',type:'計算題',stem:'將三本不同的書排列在書架上，共有幾種順序？',options:[],answer:'6',steps:['第一個位置3種、第二個2種、第三個1種。','$3!=3\u005ctimes2\u005ctimes1=6$。'],concept:'不同元素排列',mistake:'忽略順序，把排列當組合。',tip:'請学生列出3本書的6種排列。'},
  {id:'q7',track:'技高',course:'共同數學',unit:'一元一次方程式',type:'計算題',stem:'解方程式 $3x+2=14$。',options:[],answer:'4',steps:['兩邊同減2，得到 $3x=12$。','兩邊同除以3，得到 $x=4$。'],concept:'等式運算',mistake:'只改變等式一邊。',tip:'以天平比喻兩邊做相同運算。'},
  {id:'q8',track:'普高',course:'共同數學',unit:'機率',type:'單選題',stem:'擲一次公平骰子，出現偶數點的機率為何？',options:['$1/6$','$1/3$','$1/2$','$2/3$'],answer:'C',steps:['偶數點為2、4、6，共3種。','所有等可能結果6種，故 $3/6=1/2$。'],concept:'古典機率',mistake:'把有利結果數當成機率。',tip:'先列完整樣本空間，再圈出有利結果。'}
];
questions.forEach(q=>q.grade=['q1','q2','q7'].includes(q.id)?1:['q3','q4','q5','q6'].includes(q.id)?2:3);
function addStudentQuestion(id,track,grade,unit,stem,answer,steps){questions.push({id,track,grade,unit,course:'示範數學',type:'計算題',stem,options:[],answer,steps,concept:unit,mistake:'先確認題目條件，避免漏算或錯用運算。',tip:'請學生寫出算式，再逐步核對答案。'});}
addStudentQuestion('q9','普高',1,'指數與對數','計算 $2^5$。','32',['將2連乘5次。','$2×2×2×2×2=32$。']);
addStudentQuestion('q10','普高',1,'指數與對數','100 的常用對數為何？','2',['常用對數以10為底。','$10^2=100$，故答案為2。']);
addStudentQuestion('q11','普高',2,'數列與級數','等差數列首項2、公差3，求第4項。','11',['從首項到第4項增加3次公差。','$2+3×3=11$。']);
addStudentQuestion('q12','普高',2,'數列與級數','等比數列首項3、公比2，求第4項。','24',['第4項是首項乘3次公比。','$3×2^3=24$。']);
addStudentQuestion('q13','普高',3,'機率','擲一次公平硬幣，出現正面的機率為何？','1/2',['正反面有2種等可能結果。','正面占1種，故機率為 $1/2$。']);
addStudentQuestion('q14','普高',3,'機率','擲一次公平骰子，點數大於4的機率為何？','1/3',['符合的點數為5、6，共2種。','$2/6=1/3$。']);
addStudentQuestion('q15','普高',3,'機率','獨立擲兩次公平硬幣，兩次都是正面的機率為何？','1/4',['每次正面的機率為 $1/2$。','獨立事件相乘，得到 $1/2×1/2=1/4$。']);
addStudentQuestion('q16','技高',1,'一元一次方程式','解方程式 $2x-5=7$。','6',['兩邊加5，得 $2x=12$。','兩邊除以2，得 $x=6$。']);
addStudentQuestion('q17','技高',1,'一元一次方程式','解方程式 $5x=20$。','4',['兩邊除以5。','$x=20/5=4$。']);
addStudentQuestion('q18','技高',1,'一元一次方程式','解方程式 $x/2+3=7$。','8',['兩邊減3，得 $x/2=4$。','兩邊乘2，得 $x=8$。']);
addStudentQuestion('q19','技高',2,'計數原理','3件不同上衣與4件不同褲子，各選一件，共有幾種搭配？','12',['每件上衣可配4件褲子。','$3×4=12$ 種。']);
addStudentQuestion('q20','技高',2,'計數原理','4本不同的書排成一列，共有幾種排列？','24',['依序有4、3、2、1種選擇。','$4×3×2×1=24$ 種。']);
addStudentQuestion('q21','技高',3,'統計','資料 $2,4,6$ 的平均數為何？','4',['先求和 $2+4+6=12$。','再除以3，得 $12/3=4$。']);
addStudentQuestion('q22','技高',3,'統計','資料 $1,3,8$ 的中位數為何？','3',['資料已由小至大排列。','3個資料的正中央是第2個值3。']);
addStudentQuestion('q23','技高',3,'統計','資料 $1,2,2,3$ 的眾數為何？','2',['2出現2次，其餘各出現1次。','出現最多次的值為2。']);
addStudentQuestion('q24','技高',3,'統計','資料 $2,5,9$ 的全距為何？','7',['全距是最大值減最小值。','$9-2=7$。']);
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const math = value => `<span class="math-text">${escape(value)}</span>`;
const button = (name,action,kind='') => `<button class="button ${kind}" data-action="${action}">${name}</button>`;
const selected = new Set();
let tab=['sequence','results'].includes(new URLSearchParams(location.search).get('tab'))?'results':'questions',focus='q1',search='',track='',unit='',studentMode='online';
const drafts = {};
function typeset(){ if(window.renderMathInElement)renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false,trust:false}); }
function banner(){return '<div class="demo-banner">展示版｜紀錄僅存本分頁，尚未跨裝置回傳</div>';}
function shell(content,role='teacher'){
 const nav=role==='teacher'?[['questions','題庫與詳解'],['builder','考卷編輯台'],['results','作答結果']]:[['practice','我的練習'],['history','完成紀錄']];
 document.querySelector('#app').innerHTML=`${banner()}<div class="site-wrap"><header class="site-header"><a class="brand" href="${root}">課序<span>數學題庫</span></a><nav class="site-nav" aria-label="${role==='teacher'?'教師':'學生'}功能">${nav.map(([id,label])=>`<button data-tab="${id}" class="${(role==='teacher'?tab:studentMode==='history'?'history':'practice')===id?'active':''}">${label}</button>`).join('')}</nav><a class="home-link" href="${root}">首頁</a></header><main class="main">${content}</main></div>`;
 typeset();
}
function heading(title,text){return `<header class="page-heading"><div><h1>${title}</h1>${text?`<p>${text}</p>`:''}</div></header>`;}
function solution(q){return `<div class="solution-block"><h3>詳解</h3><div class="answer-line">答案 <strong>${math(q.options.length?q.answer+' · '+q.options[q.answer.charCodeAt(0)-65]:q.answer)}</strong></div><ol>${q.steps.map(s=>`<li>${math(s)}</li>`).join('')}</ol><details class="teaching-notes"><summary>教學補充</summary><dl><dt>核心考點</dt><dd>${q.concept}</dd><dt>常見錯誤</dt><dd>${q.mistake}</dd><dt>教學提示</dt><dd>${q.tip}</dd></dl></details></div>`;}
function printLink(variant){const ids=[...selected].join(',');return `<a class="button" href="${root}print/?variant=${variant}&q=${encodeURIComponent(ids)}" target="_blank" rel="noopener">${variant==='teacher'?'教師詳解':'學生卷'} · 列印／存PDF</a>`;}
function teacher(){
 let content=heading(tab==='questions'?'題庫與備課詳解':tab==='builder'?'考卷編輯台':'作答結果','');

 if(tab==='questions'){
  const list=questions.filter(q=>(!track||q.track===track)&&(!unit||q.unit===unit)&&(!search||[q.stem,q.unit,q.course].join(' ').includes(search)));
  const q=list.find(q=>q.id===focus)||list[0];
  content+=`<div class="library-toolbar"><div class="search-field"><input id="search" aria-label="搜尋題目" placeholder="搜尋示範題目或單元" value="${escape(search)}"></div>${button('已選 '+selected.size+' 題 →','builder')}</div><div class="filter-row"><select id="track" aria-label="學制"><option value="">全部學制</option><option value="普高" ${track==='普高'?'selected':''}>高中</option><option value="技高" ${track==='技高'?'selected':''}>高職</option></select><select id="unit" aria-label="單元"><option value="">全部單元</option>${[...new Set(questions.map(q=>q.unit))].map(u=>`<option ${unit===u?'selected':''}>${u}</option>`).join('')}</select></div><div class="library-layout"><section class="question-list"><div class="section-label">${list.length} 道示範題目</div>${list.map(q=>`<button class="question-row ${focus===q.id?'active':''}" data-focus="${q.id}"><div class="row-meta"><span>${q.track==='普高'?'高中':'高職'} · ${q.course}</span><span class="badge green">自編示範</span></div><strong>${math(q.stem)}</strong><div class="row-tags"><span>${q.unit}</span><span>${q.type}</span>${selected.has(q.id)?'<span class="selected-tag">已選</span>':''}</div></button>`).join('')||'<div class="empty"><h3>沒有符合的示範題目</h3><p>請調整篩選條件。</p></div>'}</section><section class="question-detail">${q?`<div class="row-tags"><span>${q.course}</span><span>${q.unit}</span></div><h2>${math(q.stem)}</h2>${q.options.length?`<div class="option-list">${q.options.map((o,i)=>`<div><span>${String.fromCharCode(65+i)}</span>${math(o)}</div>`).join('')}</div>`:''}<div class="source-reference">課序自編示範題 · 非學校原卷 · 教材出版社／版本未對照</div>${button(selected.has(q.id)?'已選入試卷 · 移除':'選入試卷','toggle:'+q.id,'primary full')}${solution(q)}`:''}</section></div>`;
 }else if(tab==='builder'){
  content+=`<div class="builder-layout"><section class="panel"><h2>示範選題</h2><p class="muted-text">每次離開或重整頁面，示範選題會清空。</p><div class="ordered-list">${[...selected].map((id,i)=>{const q=questions.find(q=>q.id===id);return `<div class="ordered-row"><span class="number">${i+1}</span><div><strong>${math(q.stem)}</strong><small>${q.unit}</small></div><div class="order-actions"><button data-action="toggle:${id}" aria-label="移除第${i+1}題">移除</button></div></div>`;}).join('')||'<div class="empty"><h3>先選幾道題目</h3><p>從題庫加入題目，再預覽學生卷與詳解。</p></div>'}${button('回到題庫選題','questions')}</div></section><section class="panel"><h2>配對列印預覽</h2><p class="muted-text">展示版使用瀏覽器列印。開啟預覽後選「另存為 PDF」，可查看自編示範卷的排版。</p>${selected.size?`<div class="pdf-links">${printLink('student')}${printLink('teacher')}</div>`:'<div class="notice info">請先選至少一道題目。</div>'}<p class="muted-text">教師可生成學生卷與成對詳解；學生自行選單元開始練習。</p></section></div>`;
 }else{
  content+=teacherResultsPanel();
 }
 shell(content);
}
function student(){renderAssignedStudent();}
function home(){document.querySelector('#app').innerHTML=`${banner()}<main class="simple-home"><h1>課序數學題庫</h1><p>高中、高職數學題庫與練習。</p><div class="home-actions"><a class="button primary" href="teacher/">教師：題庫與組卷</a><a class="button" href="student/">學生：開始練習</a></div><p class="home-note">${questions.length} 題自編示範；無須登入。</p><a class="repo-link" href="https://github.com/Yuleilei0422/kexu-math-bank" target="_blank" rel="noopener">GitHub</a></main>`;}
function print(){const p=new URLSearchParams(location.search),teacherVersion=p.get('variant')==='teacher',ids=(p.get('q')||'').split(','),qs=ids.map(id=>questions.find(q=>q.id===id)).filter(Boolean);document.querySelector('#app').innerHTML=`<div class="print-actions">${button('列印／另存 PDF','print','primary')}<a class="button" href="${root}teacher/">回教師展示</a><p>展示自編題；學生卷與教師詳解在此都是公開預覽。</p></div><div class="print-paper"><header><span class="eyebrow">課序 · 公開展示</span><h1>數學示範練習卷</h1><p>${teacherVersion?'教師備課詳解':'學生作答卷'} · ${qs.length} 題 · 自編示範</p>${teacherVersion?'':'<p>姓名：＿＿＿＿＿＿　日期：＿＿＿＿＿＿</p>'}</header>${qs.map((q,i)=>`<article><h2>${i+1}. ${math(q.stem)}</h2>${q.options.length?`<ol type="A">${q.options.map(o=>`<li>${math(o)}</li>`).join('')}</ol>`:''}${teacherVersion?solution(q):'<div class="answer-space"></div>'}</article>`).join('')||'<p>尚未選題，請回教師展示選題。</p>'}</div>`;typeset();}
document.addEventListener('click',event=>{
 const el=event.target.closest('button');if(!el)return;
 if(el.dataset.focus){focus=el.dataset.focus;teacher();return;}
 if(el.dataset.tab){if(page==='teacher'){tab=el.dataset.tab;teacher();}else{studentMode=el.dataset.tab==='history'?'history':'online';student();}return;}
 const action=el.dataset.action;if(!action)return;
 if(action==='print'){window.print();return;}
 if(action.startsWith('toggle:')){const id=action.slice(7);selected.has(id)?selected.delete(id):selected.add(id);teacher();}
 else if(['questions','builder'].includes(action)){tab=action;teacher();}
 else if(['online','upload'].includes(action)){studentMode=action;student();}
});
document.addEventListener('change',event=>{const el=event.target;if(el.id==='track'){track=el.value;teacher();}else if(el.id==='unit'){unit=el.value;teacher();}else if(page==='student'&&el.name){drafts[el.name]=el.value;}});
document.addEventListener('input',event=>{const el=event.target;if(el.id==='search'){const position=el.selectionStart;search=el.value;teacher();const input=document.querySelector('#search');input.focus();input.setSelectionRange(position,position);}else if(page==='student'&&el.name)drafts[el.name]=el.value;});
if(page==='teacher')teacher();else if(page==='student')student();else if(page==='print')print();else home();
if(page==='print')document.querySelectorAll('.teaching-notes').forEach(notes=>notes.open=true);
