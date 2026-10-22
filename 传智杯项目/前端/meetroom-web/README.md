# meetroom-web

网页端按苍穹外卖资料中的部署方式整理：`public` 是可以直接复制到 Nginx `html/turboroom` 的静态发布目录；`src/services` 保留业务源码，Node 服务用于本地开发时提供静态文件和代理。

本项目不依赖 Vue CLI 的编译产物，避免把用户环境绑定到具体 Node 依赖版本；`vite.config.js` 为可选的 Vite 开发配置。生产部署由 Nginx 负责静态文件和 `/meetroom/`、`/pic/` 反向代理。

本地运行：

```powershell
npm start
```

Nginx 部署：将 `public` 目录复制到 `C:\Temp\nginx-1.20.2\html\turboroom`，使用项目根目录 `deploy/nginx-turboroom.conf` 中的 server 配置，确认 Java 后端监听 `8888` 后运行 `nginx.exe`。
