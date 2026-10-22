# TurboRoom 校园自习预约系统

参照苍穹外卖常见的 Maven 多模块结构整理，保留本项目的业务、Java 包名和接口路径。

```text
TurboRoom/
├── 后端/studyroom-reservation/ 后端 Maven 父项目
│   ├── pom.xml              统一依赖与编译配置
│   ├── meetroom-common/     常量、注解、异常、校验及基础工具
│   ├── meetroom-pojo/       实体、分页对象、登录 DTO、统一结果
│   ├── meetroom-server/     启动类、配置、Controller、Service、Mapper
│   └── sql/meetroom.sql     数据库初始化脚本
├── meetroom-web/            独立网页前端，public 可直接作为 Nginx 静态目录
├── deploy/                  Nginx 反向代理配置
├── docs/                    原小程序手册（历史参考）
└── package.json             根目录网页启动入口
```

后端依赖方向为 server → pojo → common。原有代码包名保留，因此现有组件扫描、Mapper 扫描与网页请求地址继续适用。与 Spring、配置对象或登录 DTO 耦合的工具仍放在 server，避免模块循环依赖。

## 在 IDEA 中运行

在 IDEA 中打开 `C:\传智杯项目\后端\studyroom-reservation`，将其中的 `pom.xml` 导入为 Maven 项目。项目 SDK、Maven 导入器与运行器统一使用 JDK 11，然后重新加载 Maven。父 POM 统一使用 Spring Boot 2.7.14，并显式配置 Lombok 注解处理器。

先将 `后端/studyroom-reservation/sql/meetroom.sql` 导入 MySQL 8，按照本机情况修改 `后端/studyroom-reservation/meetroom-server/src/main/resources/application-dev.yml` 中的数据库连接信息，检查 `application.yml` 的上传目录。然后在后端目录执行：

```powershell
cd C:\传智杯项目\后端\studyroom-reservation
mvn clean package
java -jar meetroom-server/target/meetroom-server-0.0.1-SNAPSHOT.jar
```

也可在 IDEA 运行 server 模块的 `com.cclinux.SmartWorkApplication`。后端默认端口为 8888。

安装 Node.js 20 或更高版本，在项目根目录执行：

```powershell
npm start
```

浏览器访问 http://localhost:3000。无需安装 npm 依赖，也不要直接双击 HTML。网页默认代理到 http://127.0.0.1:8888；可在执行 npm start 前用 `$env:API_TARGET='http://127.0.0.1:8888'` 调整后端地址。用 Ctrl+C 停止服务。

生产环境参考苍穹外卖的 Nginx 方式：将 `meetroom-web/public` 复制到 `C:\Temp\nginx-1.20.2\html\turboroom`，采用 `deploy/nginx-turboroom.conf`，网页使用 `/meetroom/` 和 `/pic/` 反向代理到 Java 的 8888 端口。

## 验证与已有业务限制

根目录执行 `npm test` 验证网页。Java 编译通过只表示构建成功，登录及预约需真实数据库和后端联调。

原后端 `MeetService.meetJoin` 尚未保存预约，部分管理写入、导出、核销接口返回“功能暂不开放”。本次整理模块与构建配置，没有补齐这些业务实现。网页显示接口真实返回结果。
