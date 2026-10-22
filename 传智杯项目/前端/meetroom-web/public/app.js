import {$,esc,session,saveSession,go,empty} from './core.js';
import {studentRoute} from './student.js';
let renderId=0;
export async function render() {
  const version=++renderId;
  const hash=location.hash.slice(1)||'/home';const [path,query]=hash.split('?');const params=new URLSearchParams(query);
  const admin=path.startsWith('/admin'); const role=admin?'admin':'cust',user=session(role);
  $('#nav').innerHTML=(admin?[['/home','学生端'],['/admin','管理中心']]:[['/home','首页'],['/meets','自习场地'],['/news-list','校园公告'],['/bookings','我的预约'],['/profile','个人中心']]).map(([url,title])=>`<a href="#${url}" ${path===url?'aria-current="page"':''}>${title}</a>`).join('');
  $('#account').innerHTML=user?`<span>${esc(user.name||user.account)}</span><button id="logout">退出</button>`:`<a class="button" href="#${admin?'/admin/login':'/login'}">登录</a>`;
  const logout=$('#logout');if(logout)logout.onclick=()=>{saveSession(role,null);go(admin?'/admin/login':'/home');render();};
  $('#main').innerHTML='<p class="loading" role="status">正在加载…</p>';
  try {
    const route=admin?(await import('./admin.js')).adminRoute:studentRoute;
    const view=await route(path,params);
    if(version!==renderId||!view)return;
    $('#main').innerHTML=view.html;document.title=(view.title||'校园自习预约')+' · TurboRoom';view.bind?.();
  }catch(e){if(version!==renderId)return;$('#main').innerHTML=`<h1>暂时无法加载</h1><div class="notice error" role="alert">${esc(e.message)}</div><div class="actions"><button id="retry">重新加载</button><a class="button" href="#${admin?'/admin/login':'/login'}">重新登录</a></div>`;$('#retry').onclick=render;}
}
$('.skip').addEventListener('click',event=>{event.preventDefault();$('#main').focus();});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});render();
