import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createServer } from '../server.mjs';
import {esc,json,payload,joinFields,favouriteLink,statusText,api,saveSession,session} from '../public/core.js';
import {drawImg} from '../public/qrcode.js';
import {studentRoute,submitBooking} from '../public/student.js';
import {adminRoute} from '../public/admin.js';
const store=new Map();globalThis.sessionStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
test('dynamic forms preserve the Java/mini-program schema and escape untrusted text',()=>{
  const result=payload(joinFields,{name:'张同学',phone:'13800138000'});
  assert.equal(json(result.forms)[1].type,'mobile');assert.equal(json(result.obj).name,'张同学');
  assert.equal(esc('<script>"&'), '&lt;script&gt;&quot;&amp;');
  assert.equal(favouriteLink({favPath:'/projects/meetroom/pages/news/detail?id=12',favOid:12}), '#/news?id=12');
  assert.equal(statusText({meetJoinStatus:0,meetJoinIsCheck:1}),'已取消');
  assert.match(drawImg('meet=123456789012345'),/^data:image\/gif;base64,/);
});
test('proxy forwards JSON, role and token, serves modules, rejects traversal and handles backend failure',async()=>{
  let received;
  const backend=http.createServer(async(req,res)=>{let body='';for await(const chunk of req)body+=chunk;received={url:req.url,headers:req.headers,body:JSON.parse(body)};res.setHeader('content-type','application/json');res.end(JSON.stringify({code:200,data:{ok:true}}));});
  await new Promise(resolve=>backend.listen(0,'127.0.0.1',resolve));
  const server=createServer(new URL(`http://127.0.0.1:${backend.address().port}`));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    const home=await fetch(base);assert.equal(home.status,200);assert.match(await home.text(),/lang="zh-CN"/);
    assert.match((await fetch(base+'/student.js')).headers.get('content-type'),/javascript/);
    assert.notEqual((await fetch(base+'/%2e%2e%2fpackage.json')).status,200);
    const reply=await fetch(base+'/meetroom/meet/list',{method:'POST',headers:{'content-type':'application/json',token:'test-token',sub:'cust'},body:JSON.stringify({page:1,size:12})});
    assert.equal((await reply.json()).data.ok,true);assert.equal(received.url,'/meetroom/meet/list');assert.equal(received.headers.token,'test-token');assert.equal(received.headers.sub,'cust');assert.equal(received.body.size,12);
    await new Promise(resolve=>backend.close(resolve));
    assert.equal((await fetch(base+'/meetroom/home/list',{method:'POST',body:'{}'})).status,502);
  }finally{await new Promise(resolve=>server.close(resolve));if(backend.listening)await new Promise(resolve=>backend.close(resolve));}
});
test('API auth separation, errors and expired-token invalidation',async()=>{
  const original=globalThis.fetch;let received;
  saveSession('cust',{token:'student'});saveSession('admin',{token:'manager'});
  globalThis.fetch=async(url,options)=>{received={url,...options};return {ok:true,json:async()=>({code:200,data:{ok:true}})};};
  try{
    await api('/admin/home');assert.equal(received.headers.token,'manager');assert.equal(received.headers.sub,'admin');
    await api('/passport/my/detail');assert.equal(received.headers.token,'student');
    globalThis.fetch=async()=>({ok:true,json:async()=>({code:1600,msg:'该功能暂不开放'})});await assert.rejects(api('/meet/join'),/暂不开放/);
    globalThis.fetch=async()=>({ok:true,json:async()=>({code:2401})});await assert.rejects(api('/passport/my/detail'),/重新登录/);assert.equal(session(),null);assert.equal(session('admin').token,'manager');
  }finally{globalThis.fetch=original;store.clear();}
});
test('student and administrator pages accept original Java data shapes without fake records',async()=>{
  const original=globalThis.fetch;
  globalThis.location={origin:'http://localhost:3000',hash:''};
  globalThis.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
  saveSession('cust',{token:'student'});saveSession('admin',{token:'manager'});
  const meet={meetId:7,meetTitle:'图书馆阅览室',meetMaxCnt:20,meetDays:[{label:'2026-10-15',times:[{label:'08:00-10:00',cnt:2}]}],meetObj:JSON.stringify({cover:[],tag:['安静'],desc:[{type:'text',val:'预约须知'}],time:[{title:'08:00-10:00'}]})};
  const booking={meetJoinId:9,meetJoinMeetId:7,meetTitle:meet.meetTitle,meetJoinStatus:1,meetJoinCode:'123456789012345',meetJoinForms:'[{"mark":"name","title":"姓名","val":"张同学"}]',meetJoinDay:'2026-10-15',meetJoinTime:'08:00-10:00'};
  const routes={
    '/home/list':{meetList:[meet],newsList:[]},'/meet/list':{list:[meet],total:1},'/meet/list/by/day':[meet],'/meet/view':meet,
    '/meet/detail/for/join':{meetTitle:meet.meetTitle,myForms:null},'/meet/my/join/list':{list:[booking],total:1},'/meet/my/join/detail':booking,
    '/passport/my/detail':{userAccount:'student',userName:'张同学',userObj:'{"college":"测试学院"}'},'/fav/is':{isFav:false},'/fav/my/list':{list:[],total:0},
    '/setup/get':'[{"type":"text","val":"使用协议"}]','/admin/home':[{cnt:1,title:'用户数'}],
    '/admin/meet/list':{list:[{...meet,meetStatus:1,meetDays:'["2026-10-15"]'}],total:1},'/admin/meet/detail':{...meet,meetDays:'["2026-10-15"]'},
    '/admin/news/list':{list:[]},'/admin/user/list':{list:[]},'/admin/mgr/list':{list:[]},'/admin/meet/join/list':{list:[booking]},'/admin/user/detail':{userName:'张同学',userForms:booking.meetJoinForms}
  };
  globalThis.fetch=async url=>{assert.ok(url.startsWith('/meetroom/'));const route=url.slice('/meetroom'.length);assert.ok(route in routes,'unexpected API: '+route);return {ok:true,json:async()=>({code:200,data:routes[route]})};};
  try{
    for(const path of ['/home','/meets','/meet','/join','/bookings','/booking','/login','/register','/profile','/password','/favourites','/history','/about','/agreement']){
      const view=await studentRoute(path,new URLSearchParams('id=7&day=2026-10-15&time=08:00-10:00'));assert.ok(view.html.includes('<'),'empty route '+path);assert.doesNotMatch(view.html,/undefined|null/,path);
    }
    for(const path of ['/admin','/admin/login','/admin/meets','/admin/news','/admin/users','/admin/managers','/admin/edit','/admin/days','/admin/joins','/admin/user','/admin/setup','/admin/password']){
      const view=await adminRoute(path,new URLSearchParams('id=7&type=meet'));assert.ok(view.html.includes('<'),'empty route '+path);assert.doesNotMatch(view.html,/undefined|null/,path);
    }
    assert.equal((await studentRoute('/join',new URLSearchParams('id=7'))).html.includes('预约成功'),false);
  }finally{globalThis.fetch=original;store.clear();}
});
test('empty backend join implementation and existing bookings never produce a success confirmation',async()=>{
  const original=globalThis.fetch,input={meetId:7,day:'2026-10-15',time:'08:00-10:00'};
  const existing={meetJoinId:1,meetJoinMeetId:7,meetJoinDay:input.day,meetJoinTime:input.time,meetJoinStatus:1};
  let calls=0,mode='empty';
  globalThis.fetch=async url=>{let data;
    if(url.endsWith('/join/list')){calls++;data={list:calls===1||mode==='empty'?[existing]:[existing,{...existing,meetJoinId:2}]};}
    return {ok:true,json:async()=>({code:200,data})};
  };
  try{await assert.rejects(submitBooking(input),/尚未确认/);calls=0;mode='saved';assert.equal((await submitBooking(input)).meetJoinId,2);}finally{globalThis.fetch=original;}
});
