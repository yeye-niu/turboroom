import {$,esc,json,api,go,toast,session,saveSession,requireLogin,categories,buildings,newsCategories,userFields,joinFields,field,schemaFields,payload,bindForm,cover,rich,empty,pageTitle,pagination,bindPagination,pageInput,searchToolbar,bindSearch,historyAdd,favouriteLink,statusText} from './core.js';
import {drawImg} from './qrcode.js';
const submit = (label='保存') => `<button class="primary" type="submit">${label}</button>`;
function cards(list,type='meet') {return list?.length?list.map(r=>`<article class="card">${cover(r[type+'Obj'],r[type+'Title'])}<div class="card-body"><span class="chip">${esc(r[type+'CateName']||'校园')}</span><h3>${esc(r[type+'Title'])}</h3><p class="muted">${type==='meet'?'选择开放日期与时段，安排你的专注时间。':esc(json(r.newsObj).desc||'查看完整公告')}</p><a class="button" href="#/${type}?id=${r[type+'Id']}">${type==='meet'?'查看与预约':'阅读公告'} <span aria-hidden="true">→</span></a></div></article>`).join(''):empty(type==='meet'?'暂无开放场地，请稍后再来。':'暂无公告');}
async function favourite(type,id,title) {if(!requireLogin())return;const r=await api('/fav/update',{oid:id,title,type:type==='meet'?'预约':'公告',path:`#/${type}?id=${id}`});$('#fav').textContent=r.isFav?'取消收藏':'收藏';toast(r.isFav?'已收藏':'已取消收藏');}
async function favState(id){if(!session())return false;return (await api('/fav/is',{oid:id})).isFav;}
function recordRows(list){return list?.length?list.map(r=>`<article class="record"><div><h3>${esc(r.meetTitle||'自习预约')}</h3><p>${esc(r.meetJoinDay)} / ${esc(r.meetJoinTime)}</p><span class="chip">${statusText(r)}</span></div><a class="button" href="#/booking?id=${r.meetJoinId}">查看凭证</a></article>`).join(''):empty('暂无预约记录，先去挑选一个自习场地吧。');}
export async function submitBooking(input){
  const before=await api('/meet/my/join/list',{page:1,size:100,isTotal:true});const ids=new Set((before.list||[]).map(x=>String(x.meetJoinId)));
  await api('/meet/join',input);
  const after=await api('/meet/my/join/list',{page:1,size:100,isTotal:true});
  const saved=(after.list||[]).find(x=>!ids.has(String(x.meetJoinId))&&String(x.meetJoinMeetId)===String(input.meetId)&&x.meetJoinDay===input.day&&x.meetJoinTime===input.time&&Number(x.meetJoinStatus)!==0);
  if(!saved)throw new Error('服务已响应，但未发现新增预约记录，本次预约尚未确认。请联系管理员核实，勿凭此页面入场。');
  return saved;
}
export async function studentRoute(path,p) {
  if(path==='/home'){
    // The welcome and navigation stay useful when the Java service is offline.
    let data={},error='';try{data=await api('/home/list')||{};}catch(e){error=e.message;}
    return {title:'首页',html:`<section class="hero"><div><span class="eyebrow">MAKE ROOM FOR FOCUS</span><h1>找到你的空间，<br>开启一段专注时光。</h1><p class="muted">从图书馆到校园自修室，按自己的节奏安排学习。<br>选择场地、预约时段，让每一次自习都有计划。</p><a class="button primary" href="#/meets">寻找自习场地 <span aria-hidden="true">→</span></a></div><div class="hero-art" aria-hidden="true"><span class="eyebrow">YOUR STUDY SPACE</span><div class="book"></div><div class="book"></div><div class="book"></div><h2>留一点时间<br>给更好的自己。</h2><p class="muted">图书馆 / 教学楼 / 自修室</p></div></section>${error?`<div class="notice error" role="alert">${esc(error)} <button id="home-retry">重试</button></div>`:''}<div class="section-head"><h2>发现自习场地</h2><a href="#/meets">查看全部 →</a></div><div class="grid">${cards(data.meetList)}</div><div class="section-head"><h2>校园公告</h2><a href="#/news-list">全部公告 →</a></div><div class="grid">${cards(data.newsList,'news')}</div>`,bind(){const b=$('#home-retry');if(b)b.onclick=()=>location.reload();}};
  }
  if(path==='/meets'||path==='/news-list'){
    const type=path==='/meets'?'meet':'news';let r;
    if(type==='meet'){
      const filters={...pageInput(p),building:p.get('building')||'',roomType:p.get('roomType')||'',day:p.get('day')||''};
      r=await api('/meet/list',filters);
    }
    else {
      const cateId=p.get('cateId');
      const filters=cateId?{cateId:Number(cateId)}:{};
      r=await api('/'+type+'/list',pageInput(p,filters));
    }
    const toolbar=type==='meet'?`<form id="meet-search" class="toolbar"><input name="search" aria-label="搜索名称或关键词" placeholder="搜索名称或关键词" value="${esc(p.get('search'))}"><select name="building" aria-label="教学楼"><option value="">全部教学楼</option>${buildings.map(x=>`<option value="${x}" ${p.get('building')===x?'selected':''}>${x}</option>`).join('')}</select><select name="roomType" aria-label="教室种类"><option value="">全部教室种类</option>${categories.map(x=>`<option value="${x}" ${p.get('roomType')===x?'selected':''}>${x}</option>`).join('')}</select><input id="day" type="date" name="day" aria-label="开放日期" value="${esc(p.get('day'))}"><button class="primary" type="submit">查询</button><a class="button" href="#/meets">重置</a></form>`:searchToolbar(p,newsCategories);
    return {title:type==='meet'?'自习场地':'校园公告',html:pageTitle(type==='meet'?'找到适合你的自习空间':'校园公告',type==='meet'?'按教学楼、教室种类和开放日期查找场地。':'校园资讯与预约通知。')+toolbar+`<div class="grid">${cards(r.list,type)}</div>`+pagination(r,p),bind(){const f=$('#meet-search');if(f)f.onsubmit=e=>{e.preventDefault();const q=new URLSearchParams(new FormData(f));q.set('page','1');go('/meets?'+q);};if(type==='news'){bindSearch(path);bindPagination(p);}else bindPagination(new URLSearchParams(new FormData(f||document.createElement('form'))));}};
  }
  if(path==='/meet'||path==='/news'){
    const type=path.slice(1),id=p.get('id');const r=await api('/'+type+'/view',{id});if(!r)return {html:empty('内容已下架或不存在')};
    const obj=json(r[type+'Obj']),isFav=await favState(id);historyAdd(type,id,r[type+'Title']);
    let days=json(r.meetDays,[]);if(!Array.isArray(days))days=[];
    return {title:r[type+'Title'],html:`<a href="#/${type==='meet'?'meets':'news-list'}">← 返回列表</a>`+pageTitle(r[type+'Title'],r[type+'CateName'])+`<div class="layout"><section>${cover(obj,r[type+'Title'],'detail-cover')}<div class="panel"><h2>${type==='meet'?'场地介绍与预约须知':'公告正文'}</h2><div class="chips">${(obj.tag||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div>${rich(type==='meet'?obj.desc:obj.content)}<button id="fav">${isFav?'取消收藏':'收藏'}</button></div></section>${type==='meet'?`<aside class="panel"><h2>选择预约时段</h2><p class="muted">每时段最多 ${esc(r.meetMaxCnt)} 人</p><div class="field"><label for="date">开放日期</label><select id="date">${days.map((d,i)=>`<option value="${i}">${esc(d.label||d)}</option>`).join('')}</select></div><div id="slots"></div><p class="muted">预约后可在“我的预约”查看凭证。</p></aside>`:`<aside class="panel"><h2>校园公告</h2><p>${esc(obj.desc)}</p><a href="#/news-list">更多校园资讯 →</a></aside>`}</div>`,bind(){
      $('#fav').onclick=()=>favourite(type,id,r[type+'Title']).catch(e=>toast(e.message));
      if(type!=='meet')return;const date=$('#date');const slots=()=>{const d=days[Number(date.value)];const times=d?.times||[];$('#slots').innerHTML=times.length?times.map((t,i)=>{const remaining=Math.max(0,Number(r.meetMaxCnt)-Number(t.cnt||0));return `<div class="field"><button class="slot" data-slot="${i}" ${remaining<=0?'disabled':''}><span>${esc(t.label)}</span><span class="muted">${remaining>0?`余 ${remaining} 人`:'已满'}</span></button></div>`;}).join(''):empty('该日期暂无可约时段');document.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{if(requireLogin())go('/join?'+new URLSearchParams({id,day:d.label,time:times[b.dataset.slot].label}));});};date.onchange=slots;slots();
    }};
  }
  if(path==='/login'||path==='/register') {
    const register=path==='/register';return {title:register?'注册':'登录',html:`<div class="panel form ${register?'':'narrow'}">${pageTitle(register?'创建校园账户':'欢迎回来',register?'完善基本信息，即可使用预约服务。':'登录后管理你的自习预约。')}<form id="auth">${field('account','用户名','text','',{min:3,max:30})}${register?field('name','昵称','text','',{max:30}):''}${field('password','密码','password','',{min:6,max:30})}${register?`<div class="fields">${schemaFields(userFields)}</div><label class="check"><input type="checkbox" required>我已阅读并同意 <a href="#/agreement" target="_blank">用户使用协议</a></label><br>`:''}${submit(register?'注册并登录':'登录')}</form><p><a href="#/${register?'login':'register'}">${register?'已有账户？去登录':'没有账户？注册'}</a></p></div>`,bind(){bindForm($('#auth'),async v=>{const result=await api(register?'/passport/register':'/passport/login',{account:v.account,name:v.name,password:v.password,...(register?payload(userFields,v):{})});saveSession('cust',result.token);go('/profile');});}};
  }
  if(['/join','/bookings','/booking','/profile','/password','/favourites'].includes(path)&&!requireLogin())return;
  if(path==='/join'){
    const info=await api('/meet/detail/for/join',{meetId:p.get('id'),day:p.get('day'),time:p.get('time')});const values=Object.fromEntries(json(info.myForms,[]).map(f=>[f.mark,f.val]));
    return {title:'确认预约',html:`<a href="#/meet?id=${esc(p.get('id'))}">← 返回场地</a><div class="panel form">${pageTitle('确认预约',info.meetTitle)}<div class="notice">${esc(p.get('day'))} / ${esc(p.get('time'))}</div><form id="join">${schemaFields(joinFields,values)}${submit('提交预约')}</form><div id="join-result" role="status"></div></div>`,bind(){bindForm($('#join'),async v=>{
      const input={meetId:p.get('id'),day:p.get('day'),time:p.get('time'),...payload(joinFields,v)};
      const saved=await submitBooking(input);go('/booking?id='+saved.meetJoinId);toast('预约已保存');
    });}};
  }
  if(path==='/bookings') {const r=await api('/meet/my/join/list',pageInput(p));return {title:'我的预约',html:pageTitle('我的预约','查看预约状态、出示凭证或取消预约。')+searchToolbar(p)+`<section class="panel">${recordRows(r.list)}</section>`+pagination(r,p),bind(){bindSearch(path);bindPagination(p);}};}
  if(path==='/booking'){
    const r=await api('/meet/my/join/detail',{meetJoinId:p.get('id')});if(!r)return {html:empty('预约不存在')};const active=Number(r.meetJoinStatus)!==0;
    return {title:'预约凭证',html:pageTitle('预约凭证',r.meetTitle)+`<div class="panel form center"><h2>${esc(r.meetTitle||r.meet?.meetTitle)}</h2><p>${esc(r.meetJoinDay)} / ${esc(r.meetJoinTime)}</p><span class="chip">${statusText(r)}</span>${active&&r.meetJoinCode?`<img class="qr" src="${drawImg('meet='+r.meetJoinCode,{size:280})}" alt="预约核销二维码"><p>核销码：<strong>${esc(r.meetJoinCode)}</strong></p>`:'<p class="notice">此预约已取消，凭证不可使用。</p>'}${json(r.meetJoinForms,[]).map(f=>`<p>${esc(f.title)}：${esc(f.val)}</p>`).join('')}${active&&Number(r.meetJoinIsCheck)!==1?'<button class="danger" id="cancel">取消预约</button>':''} <button id="print">打印凭证</button></div>`,bind(){const b=$('#cancel');if(b)b.onclick=async()=>{if(!confirm('确定取消此预约？'))return;b.disabled=true;try{await api('/meet/my/join/cancel',{meetJoinId:p.get('id')});toast('已取消预约');go('/bookings');}catch(e){toast(e.message);b.disabled=false;}};$('#print').onclick=()=>window.print();}};
  }
  if(path==='/profile'){
    const r=await api('/passport/my/detail');const obj=json(r.userObj);
    return {title:'个人中心',html:pageTitle('个人中心','管理个人资料与学习记录。')+`<div class="actions"><a class="button" href="#/bookings">我的预约</a><a class="button" href="#/favourites">我的收藏</a><a class="button" href="#/history">浏览足迹</a><a class="button" href="#/password">修改密码</a></div><div class="panel form"><h2>个人资料</h2><form id="profile">${field('account','用户名','text',r.userAccount,{max:30})}${field('name','昵称','text',r.userName,{max:30})}<div class="fields">${schemaFields(userFields,obj)}</div>${submit('保存资料')}</form></div>`,bind(){bindForm($('#profile'),async v=>{await api('/passport/my/edit',{account:v.account,name:v.name,...payload(userFields,v)});saveSession('cust',{...session(),name:v.name,account:v.account});toast('资料已更新');});}};
  }
  if(path==='/password')return {title:'修改密码',html:`<div class="panel form narrow">${pageTitle('修改密码')}<form id="password">${field('oldPassword','旧密码','password','',{min:6,max:30})}${field('newPassword','新密码','password','',{min:6,max:30})}${field('confirm','确认新密码','password','',{min:6,max:30})}${submit()}</form></div>`,bind(){bindForm($('#password'),async v=>{if(v.newPassword!==v.confirm)throw new Error('两次新密码不一致');await api('/passport/pwd',{oldPassword:v.oldPassword,newPassword:v.newPassword});saveSession('cust',null);go('/login');toast('密码已修改，请重新登录');});}};
  if(path==='/history'||path==='/favourites'){
    const fav=path==='/favourites',r=fav?await api('/fav/my/list',pageInput(p)):null,list=fav?r.list:json(localStorage.getItem('turboroom.history'),[]);
    return {title:fav?'我的收藏':'浏览足迹',html:pageTitle(fav?'我的收藏':'浏览足迹')+(fav?'':'<button id="clear-history">清空足迹</button>')+`<div class="panel">${list?.length?list.map(x=>`<article class="record"><a href="${esc(fav?favouriteLink(x):`#/${x.type}?id=${x.id}`)}">${esc(fav?x.favTitle:x.title)}</a>${fav?`<button data-delete-fav="${x.favOid}">移除收藏</button>`:`<small>${esc(x.time)}</small>`}</article>`).join(''):empty()}</div>`+(fav?pagination(r,p):''),bind(){if(fav){bindPagination(p);document.querySelectorAll('[data-delete-fav]').forEach(b=>b.onclick=async()=>{try{await api('/fav/del',{oid:b.dataset.deleteFav});b.closest('article').remove();toast('已移除收藏');}catch(e){toast(e.message);}});}else $('#clear-history').onclick=()=>{if(confirm('清空当前浏览器中的浏览足迹？')){localStorage.removeItem('turboroom.history');location.reload();}};}};
  }
  if(path==='/about'||path==='/agreement'){const r=await api('/setup/get',{key:path==='/about'?'SETUP_CONTENT_ABOUT':'SETUP_YS'});return {title:path==='/about'?'关于我们':'用户使用协议',html:pageTitle(path==='/about'?'关于我们':'用户使用协议')+`<article class="panel">${r?rich(r):empty('暂未配置内容')}</article>`};}
  return {title:'页面不存在',html:pageTitle('页面不存在')+'<a class="button" href="#/home">返回首页</a>'};
}
