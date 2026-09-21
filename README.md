# 物语了 · WuyuLe

物语了（WuyuLe）是一个手机优先的趣事记录本：把文字和照片收进史书，公开的故事进入 Gallery，也可以和朋友共同参与一件事。

应用使用 Next.js `basePath` `/wuyule`（`trailingSlash: true`），便于挂在作品集 `https://hanjing-laura.vercel.app/wuyule/`（或项目自身域名下的同一路径）。本地开发请打开 <http://localhost:3000/wuyule/>。

## 本地运行

需要 Node.js 18.17+（或更新版本）。Schema 以 **PostgreSQL** 为准（Vercel 上用 `DATABASE_URL` 即可生成客户端并构建）。本地可以继续用 SQLite：把 `DATABASE_URL` 设成 `file:./dev.db`，`npm run db:push` / `db:generate` 会经 `prisma/with-env.mjs` 临时换成 sqlite provider。

```bash
cd wu-yu-le
npm i
cp .env.example .env
# 编辑 .env，至少把 NEXTAUTH_SECRET 换成随机字符串
# 本地 sqlite：DATABASE_URL="file:./dev.db"
# 本地/生产 Postgres：postgresql://USER:PASSWORD@HOST/DB?sslmode=require
npm run db:push           # 首次运行或修改 schema 后执行
npm run db:seed           # 可选：写入演示账号和一条 Public 故事
npm run dev
```

打开 <http://localhost:3000/wuyule/>（`trailingSlash: true`，无斜杠会 308 到带斜杠的地址）。生产构建可用 `npm run build && npm start`（无真实数据库时，构建会使用占位 `DATABASE_URL` 只做 `prisma generate`）。提交前可运行 `npm run typecheck`。

## 部署（Vercel）

1. 将本仓库接到 Vercel 项目（约定生产域名 `wu-yu-le.vercel.app`；项目尚未创建时不要假设它已存在）。
2. 在 Vercel Marketplace 接入 Postgres（Neon 等），把连接串写入 `DATABASE_URL`（构建只需要该变量存在；运行时才真正连库）。
3. 设置 `NEXTAUTH_SECRET`，以及带 basePath 的 `NEXTAUTH_URL`，例如：
   - `https://hanjing-laura.vercel.app/wuyule`（经作品集反代访问）
   - 或 `https://wu-yu-le.vercel.app/wuyule`（项目自身域名）
   不要把未使用的主机写死在代码里。
4. 首次上线后对生产库执行 `prisma db push` 或迁移（在本地指向生产 URL，或用 Vercel 的一次-off 命令）。

作品集仓库需把 `/wuyule`、`/wuyule/:path*` rewrite 到 `https://wu-yu-le.vercel.app/wuyule/`（与 `/A-le-ge-I` 一样，destination 带 basePath）。本应用 `trailingSlash: true`，因此 `/wuyule/` 返回 200，不会再 308 回 `/wuyule` 与作品集互相跳转。

## 环境变量

`.env.example` 列出了全部变量：

- `DATABASE_URL`：生产为 Postgres URL；本地 sqlite 用 `file:./dev.db`。未设置时，`prisma generate` / `next build` 会使用占位 Postgres URL，以便 Vercel 构建通过。
- `NEXTAUTH_URL`、`NEXTAUTH_SECRET`：Auth.js 会话配置。`NEXTAUTH_URL` 应包含 `/wuyule`。
- `MAIL_MODE`：开发时默认 `console`（验证邮件和重置链接打印到终端）；邮件传输层可替换为 Ethereal。生产邮件可填 `RESEND_API_KEY` 与 `RESEND_FROM`（`EMAIL_FROM` 保留作默认发件人标识）。
- `S3_*`：可选的 S3 兼容图片存储配置。未配置时使用本地 `uploads/` 占位路径。

不要把 `.env` / `.env.local`、数据库文件或邮件密钥提交到仓库。

## MVP 功能

- 邮箱注册、登录、登出、邮箱验证和忘记密码重置；开发态邮件链接可从终端取得。
- 鉴权页面：`/login`、`/register`、`/forgot-password`、`/reset-password`、`/verify-email`（实际 URL 带 `/wuyule` 前缀）。
- 手机底栏五个入口：`史书`、`Gallery`、中央 `+`（添加趣事）、`Friends`、`Me`。
- **史书**：浅鞣黄时间线目录，按日期展示事件卡片；进入事件后可左右翻页阅读文字和图片。
- **Gallery**：只展示 Public 事件的双列瀑布流，图片按自身比例排列，并支持简单评论列表。
- **Add story**：填写 Time、Event、Content、Photos（可选）和 Private/Public；Private 事件仅参与者可见，Public 事件进入 Gallery。
- **Friends**：按邮箱或用户名搜索/邀请朋友；事件可以邀请朋友成为参与者，参与者共享该事件的史书访问权。
- **Me**：资料入口和登出。
- CSS 变量提供浅鞣黄金棕的纸张质感与响应式手机优先布局，窄屏优先同时适配桌面宽度。

## 技术结构

- Next.js App Router + TypeScript；`basePath` 为 `/wuyule`
- Prisma ORM；生产 PostgreSQL（`DATABASE_URL`）；本地 sqlite 可通过 `file:` URL 切换
- Auth.js（NextAuth）会话；客户端 `SessionProvider` 使用 `/wuyule/api/auth`
- 本地 `uploads/` 或 S3 兼容对象存储占位
- `app/` 页面与路由、`components/` UI、`lib/` 数据和鉴权辅助代码

这是可跑的 MVP 骨架。邮件、S3、生产数据库可在不改产品信息架构的情况下替换为正式服务。

执行 `npm run db:seed` 后可使用演示账号 `hello@wuyule.local` / `wuyule-demo` 登录本地环境。

## 品牌

中文名：**物语了**（谐音“无语了”）  
英文名：**WuyuLe**  
GitHub：<https://github.com/HanjingLaura/wu-yu-le>
