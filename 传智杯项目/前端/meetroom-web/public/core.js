export const $ = (q, root = document) => root.querySelector(q);
export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function json(value, fallback = {}) { if (typeof value !== 'string') return value ?? fallback; try { return JSON.parse(value); } catch { return fallback; } }
export const categories = ['普通教室','阶梯教室','计算机机房','专业实验室','语音室','形体健身房','艺术教室','体育场馆'];
export const buildings = ['文观楼','群观楼'];
export const newsCategories = ['公告通知','校园动态'];
export const userFields = [['sex','性别','select',['男','女']],['birth','出生年月','date'],['college','学院系所','text'],['major','所学专业','text'],['item','班级','text'],['year','入学年份','number'],['no','学号','text']];
export const joinFields = [['name','姓名','text'],['phone','手机','tel']];
export function session(role='cust') {return json(sessionStorage.getItem('turboroom.' + role), null);}
export function saveSession(role, value) {if (value) sessionStorage.setItem('turboroom.'+role, JSON.stringify(value)); else sessionStorage.removeItem('turboroom.'+role);}
export async function api(route, body = {}, role = route.startsWith('/admin/') ? 'admin' : 'cust') {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch('/meetroom'+route, {method:'POST',headers:{'Content-Type':'application/json',sub:role,token:session(role)?.token || ''},body:JSON.stringify(body),signal:controller.signal});
    let result; try {result=await response.json();} catch {throw new Error('服务返回了无法识别的响应，请检查 Java 服务。');}
    if (Number(result.code) === 2401) {saveSession(role,null); throw new Error('登录已失效，请重新登录。');}
    if (!response.ok || Number(result.code)!==200) throw new Error(result.msg || '请求失败，请重试。');
    return result.data;
  } catch(e) {if(e.name==='AbortError') throw new Error('请求超时，请稍后重试。');throw e;} finally {clearTimeout(timer);}
}
export function go(route) {location.hash = route;}
let toastTimer;
export function toast(message) {$('#toast').textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').textContent='',6000);}
export function requireLogin(role='cust') {if(session(role)) return true;go(role==='admin'?'/admin/login':'/login');return false;}
export function imageUrl(value) {
  if (typeof value !== 'string') return '';
  try {const u=new URL(value,location.origin);if(!['http:','https:'].includes(u.protocol))return '';if(u.pathname.startsWith('/pic/'))return u.pathname;return u.href;}catch{return '';}
}
export function cover(obj, title, extra='') {const value=json(obj);const url=imageUrl(Array.isArray(value.cover)?value.cover[0]:value.cover);return url?`<img class="cover ${extra}" loading="lazy" src="${esc(url)}" alt="${esc(title)}">`:'<div class="cover-placeholder" aria-hidden="true">专注空间</div>';}
export function rich(value) {const content=json(value, value);if(!Array.isArray(content))return `<p class="rich">${esc(typeof content==='string'?content:'')}</p>`;return content.map(n=>n.type==='img'?`<div class="rich"><img loading="lazy" src="${esc(imageUrl(n.val))}" alt="内容配图"></div>`:`<p class="rich">${esc(n.val)}</p>`).join('');}
export function field(name,label,type='text',value='',options={}) {
  const {required=true,min,max,choices,hint='',readonly=false}=options;
  const attrs=`name="${esc(name)}" id="f-${esc(name)}" ${required?'required':''} ${readonly?'readonly':''}`;
  const length=type==='number'?`${min!=null?`min="${min}"`:''} ${max!=null?`max="${max}"`:''}`:`${min?`minlength="${min}"`:''} ${max?`maxlength="${max}"`:''}`;
  let input=choices?`<select ${attrs}>${choices.map((x,i)=>{const v=Array.isArray(x)?x[0]:x,t=Array.isArray(x)?x[1]:x;return `<option value="${esc(v)}" ${String(value)===String(v)?'selected':''}>${esc(t)}</option>`;}).join('')}</select>`:type==='textarea'?`<textarea ${attrs} ${length}>${esc(value)}</textarea>`:`<input ${attrs} type="${type}" value="${esc(value)}" ${length} ${type==='password'?'autocomplete="current-password"':name==='account'||name==='name'?'autocomplete="username"':''} ${type==='tel'?'pattern="1[0-9]{10}"':''}>`;
  return `<div class="field"><label for="f-${esc(name)}">${esc(label)}${required?' *':''}</label>${input}${hint?`<small>${esc(hint)}</small>`:''}</div>`;
}
export function schemaFields(schema,obj={}) {return schema.map(([mark,title,type,choices])=>field(mark,title,type,obj[mark],{choices,min:['college','major','item'].includes(mark)?2:type==='number'?1900:undefined,max:type==='number'?2100:200})).join('');}
export function payload(schema, values) {const forms=schema.map(([mark,title,type])=>({mark,title,type:type==='tel'?'mobile':type==='number'?'year':type,val:values[mark]}));return {forms:JSON.stringify(forms),obj:JSON.stringify(Object.fromEntries(forms.map(f=>[f.mark,f.val])))};}
export function bindForm(form, handler) {
  form.insertAdjacentHTML('afterbegin','<div class="form-error notice error" role="alert" tabindex="-1" hidden></div>');
  form.addEventListener('submit',async event=>{
    event.preventDefault();const error=$('.form-error',form);error.hidden=true;
    const buttons=[...form.querySelectorAll('button[type=submit]')];buttons.forEach(b=>b.disabled=true);
    try {await handler(Object.fromEntries(new FormData(form)),form);}catch(e){error.textContent=e.message;error.hidden=false;error.focus();}finally {buttons.forEach(b=>b.disabled=false);}
  });
}
export function empty(text='暂无记录') {return `<div class="empty">${esc(text)}</div>`;}
export function pageTitle(title,sub='') {return `<div class="eyebrow">CAMPUS STUDY / TURBOROOM</div><h1>${esc(title)}</h1>${sub?`<p class="muted">${esc(sub)}</p>`:''}`;}
export function pagination(result,params) {
  const page=Math.max(1,Number(params.get('page')||1)), size=Math.max(1,Number(params.get('size')||12)), total=Number(result.total||0), pages=Math.max(1,Math.ceil(total/size));
  const visible=[...new Set([1,page-2,page-1,page,page+1,page+2,pages].filter(n=>n>=1&&n<=pages))];
  const numbers=visible.map((n,i)=>`${i&&n-visible[i-1]>1?'<span class="pagination-gap">…</span>':''}<button class="page-number" data-page="${n}" ${n===page?'aria-current="page"':''}>${n}</button>`).join('');
  return `<div class="pagination" data-pagination><span class="pagination-total">共 ${total} 条</span><select data-page-size aria-label="每页条数"><option value="10" ${size===10?'selected':''}>10 条/页</option><option value="12" ${size===12?'selected':''}>12 条/页</option><option value="20" ${size===20?'selected':''}>20 条/页</option><option value="50" ${size===50?'selected':''}>50 条/页</option></select><button class="page-arrow" data-page="${page-1}" ${page<=1?'disabled':''} aria-label="上一页">‹</button>${numbers}<button class="page-arrow" data-page="${page+1}" ${page>=pages?'disabled':''} aria-label="下一页">›</button><span class="page-jump-label">前往</span><input data-page-jump type="number" min="1" max="${pages}" value="${page}" aria-label="跳转页码"><span>页</span></div>`;
}
export function bindPagination(params) {const route=location.hash.slice(1).split('?')[0];const navigate=(page,size=params.get('size')||'12')=>{const p=new URLSearchParams(params);p.set('page',page);p.set('size',size);go(route+'?'+p);};document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>navigate(b.dataset.page));const size=$('[data-page-size]');if(size)size.onchange=()=>navigate(1,size.value);const jump=$('[data-page-jump]');const jumpTo=()=>{const page=Number(jump.value),max=Number(jump.max);if(page>=1&&page<=max)navigate(page);};if(jump){jump.onchange=jumpTo;jump.onkeydown=e=>{if(e.key==='Enter')jumpTo();};}}
export function pageInput(p, extra={}) {return {page:Number(p.get('page')||1),size:Number(p.get('size')||12),isTotal:true,search:p.get('search')||'',...extra};}
export function searchToolbar(params,choices=[]) {return `<form id="search" class="toolbar"><input name="search" aria-label="搜索关键词" placeholder="搜索名称或关键词" value="${esc(params.get('search'))}">${choices.length?`<select name="cateId" aria-label="分类"><option value="">全部分类</option>${choices.map((t,i)=>`<option value="${i+1}" ${params.get('cateId')===String(i+1)?'selected':''}>${esc(t)}</option>`).join('')}</select>`:''}<button type="submit" class="primary">搜索</button></form>`;}
export function bindSearch(path) {const f=$('#search');if(f)f.onsubmit=e=>{e.preventDefault();go(path+'?'+new URLSearchParams(new FormData(f)));};}
export function historyAdd(type,id,title) {const old=json(localStorage.getItem('turboroom.history'),[]);localStorage.setItem('turboroom.history',JSON.stringify([{type,id,title,time:new Date().toLocaleString()},...old.filter(x=>!(x.type===type&&String(x.id)===String(id)))].slice(0,60)));}
export function favouriteLink(record) {if(/^#\/(meet|news)\?id=\d+$/.test(record.favPath||''))return record.favPath;const type=/news|公告|文章/.test(record.favType+' '+record.favPath)?'news':'meet';return `#/${type}?id=${encodeURIComponent(record.favOid)}`;}
export function statusText(r) {return Number(r.meetJoinStatus)===0?'已取消':Number(r.meetJoinIsCheck)===1?'已签到':'待签到';}
