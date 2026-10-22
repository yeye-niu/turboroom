-- 传智杯自习/场地清单更新
-- 执行前请确认当前数据库为 dev；脚本不会删除历史预约记录。
USE `dev`;
START TRANSACTION;

-- 保留历史记录，停用原有活动场地，避免和新清单重复展示。
UPDATE `meetroom_meet` SET `MEET_STATUS` = 0 WHERE `MEET_STATUS` = 1;

SET @days = JSON_ARRAY(
  DATE_FORMAT(CURDATE(), '%Y-%m-%d'),
  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d'),
  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '%Y-%m-%d'),
  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '%Y-%m-%d'),
  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '%Y-%m-%d')
);
SET @times = JSON_OBJECT('time', JSON_ARRAY(
  JSON_OBJECT('title', '08:00-10:00'), JSON_OBJECT('title', '10:00-12:00'),
  JSON_OBJECT('title', '14:00-16:00'), JSON_OBJECT('title', '16:00-18:00'),
  JSON_OBJECT('title', '19:00-21:00')
));

INSERT INTO `meetroom_meet`
(`MEET_TITLE`,`MEET_CATE_ID`,`MEET_CATE_NAME`,`MEET_STATUS`,`MEET_ORDER`,`MEET_VOUCH`,`MEET_DAYS`,`MEET_VIEW_CNT`,`MEET_MAX_CNT`,`MEET_FORMS`,`MEET_OBJ`,`ADD_TIME`,`EDIT_TIME`)
SELECT j.title, 1, '普通教室', 1, j.ord, 0, @days, 0, 40, '[]', JSON_SET(@times, '$.tag', JSON_ARRAY('普通教室')), UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000
FROM JSON_TABLE('["文观楼 201","文观楼 202","文观楼 203","文观楼 204","文观楼 205","文观楼 206","文观楼 301","文观楼 302","文观楼 303","文观楼 304","文观楼 305","文观楼 401","文观楼 402","文观楼 403","文观楼 501","文观楼 502","文观楼 503","文观楼 504","文观楼 505","文观楼 601","文观楼 602","群观楼 101","群观楼 102","群观楼 103","群观楼 104","群观楼 105","群观楼 201","群观楼 202","群观楼 203","群观楼 204","群观楼 205","群观楼 301","群观楼 302","群观楼 303","群观楼 304","群观楼 305"]', '$[*]' COLUMNS (ord FOR ORDINALITY, title VARCHAR(255) PATH '$')) j;

INSERT INTO `meetroom_meet` (`MEET_TITLE`,`MEET_CATE_ID`,`MEET_CATE_NAME`,`MEET_STATUS`,`MEET_ORDER`,`MEET_VOUCH`,`MEET_DAYS`,`MEET_VIEW_CNT`,`MEET_MAX_CNT`,`MEET_FORMS`,`MEET_OBJ`,`ADD_TIME`,`EDIT_TIME`)
SELECT j.title, 2, '阶梯教室', 1, 100+j.ord, 0, @days, 0, 150, '[]', JSON_SET(@times, '$.tag', JSON_ARRAY('阶梯教室','大座位量')), UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000 FROM JSON_TABLE('["群观楼 113","群观楼 114","群观楼 213","群观楼 214","群观楼 313"]', '$[*]' COLUMNS (ord FOR ORDINALITY, title VARCHAR(255) PATH '$')) j;
INSERT INTO `meetroom_meet` SELECT NULL,j.title,3,'计算机机房',1,200+j.ord,0,@days,0,60,'[]',JSON_SET(@times,'$.tag',JSON_ARRAY('计算机机房')),UNIX_TIMESTAMP()*1000,UNIX_TIMESTAMP()*1000 FROM JSON_TABLE('["文观楼 515","文观楼 516","文观楼 517","文观楼 518","群观楼 F111 财务管理专业机房"]','$[*]' COLUMNS(ord FOR ORDINALITY,title VARCHAR(255) PATH '$')) j;
INSERT INTO `meetroom_meet` SELECT NULL,j.title,4,'专业实验室',1,300+j.ord,0,@days,0,40,'[]',JSON_SET(@times,'$.tag',JSON_ARRAY('专业实验室')),UNIX_TIMESTAMP()*1000,UNIX_TIMESTAMP()*1000 FROM JSON_TABLE('["文观楼 100 新天地实训室","文观楼 103 康复医学实训中心","文观楼 404 装饰材料实验室","群观楼 F112 虚拟商业环境实训室","群观楼 F114 物理实验室（二）","群观楼 117 物理实验室","群观楼 315 健康管理综合实训室","影视教学实验实训室","工艺制作实验室"]','$[*]' COLUMNS(ord FOR ORDINALITY,title VARCHAR(255) PATH '$')) j;
INSERT INTO `meetroom_meet` SELECT NULL,j.title,5,'语音室',1,400+j.ord,0,@days,0,40,'[]',JSON_SET(@times,'$.tag',JSON_ARRAY('语音室')),UNIX_TIMESTAMP()*1000,UNIX_TIMESTAMP()*1000 FROM JSON_TABLE('["群观楼 112 智能语音室"]','$[*]' COLUMNS(ord FOR ORDINALITY,title VARCHAR(255) PATH '$')) j;
INSERT INTO `meetroom_meet` SELECT NULL,j.title,6,'形体健身房',1,500+j.ord,0,@days,0,30,'[]',JSON_SET(@times,'$.tag',JSON_ARRAY('形体健身房')),UNIX_TIMESTAMP()*1000,UNIX_TIMESTAMP()*1000 FROM JSON_TABLE('["文观楼 101 健身房","文观楼 605 形体室"]','$[*]' COLUMNS(ord FOR ORDINALITY,title VARCHAR(255) PATH '$')) j;
INSERT INTO `meetroom_meet` SELECT NULL,j.title,7,'艺术教室',1,600+j.ord,0,@days,0,40,'[]',JSON_SET(@times,'$.tag',JSON_ARRAY('艺术教室')),UNIX_TIMESTAMP()*1000,UNIX_TIMESTAMP()*1000 FROM JSON_TABLE('["文观楼 405 艺术教室","文观楼 406 艺术教室","文观楼 407 艺术教室","文观楼 408 艺术教室","冰雪艺术实验室"]','$[*]' COLUMNS(ord FOR ORDINALITY,title VARCHAR(255) PATH '$')) j;
INSERT INTO `meetroom_meet` SELECT NULL,j.title,8,'体育场馆',1,700+j.ord,0,@days,0,80,'[]',JSON_SET(@times,'$.tag',JSON_ARRAY('体育场馆')),UNIX_TIMESTAMP()*1000,UNIX_TIMESTAMP()*1000 FROM JSON_TABLE('["羽毛球场","足球场","足球场2","篮球场1","篮球场2","篮球场3","篮球场4","排球场1","排球场2","文观楼 102 毽球场地"]','$[*]' COLUMNS(ord FOR ORDINALITY,title VARCHAR(255) PATH '$')) j;

COMMIT;
