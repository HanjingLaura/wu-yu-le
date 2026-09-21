# 物语了 · WuyuLe

物语了（WuyuLe）是一个手机优先的趣事记录本：把文字和照片收进史书，公开的故事进入 Gallery，也可以和朋友共同参与一件事。

## 本地运行

需要 Node.js 18.17+（或更新版本）。SQLite 是默认开发数据库，不需要先启动 Postgres。

```bash
cd wu-yu-le
npm i
cp .env.example .env
# 编辑 .env，至少把 NEXTAUTH_SECRET 换成随机字符串
npm run db:push           # 首次运行或修改 schema 后执行
npm run db:seed           # 可选：写入演示账号和一条 Public 故事
npm run dev
```

打开 <http://localhost:3000>。生产构建可用 `npm run build && npm start`，提交前可运行 `npm run typecheck`。

本 MVP 选择 SQLite 作为零配置开发回退；`file:./dev.db` 只适合本地开发。部署到 Postgres 时，将 `prisma/schema.prisma` 的 datasource provider 改为 `postgresql`，再把 `DATABASE_URL` 换成 Postgres URL，并执行 `npm run db:generate` 与 `npm run db:push`（或迁移）。

## 环境变量

`.env.example` 列出了全部变量：

- `DATABASE_URL`：默认 `file:./dev.db`；迁移到 Postgres 时配合 schema provider 一起切换。
- `NEXTAUTH_URL`、`NEXTAUTH_SECRET`：Auth.js 会话配置。
- `MAIL_MODE`：开发时默认 `console`（验证邮件和重置链接打印到终端）；邮件传输层可替换为 Ethereal。生产邮件可填 `RESEND_API_KEY` 与 `RESEND_FROM`（`EMAIL_FROM` 保留作默认发件人标识）。
- `S3_*`：可选的 S3 兼容图片存储配置。未配置时使用本地 `uploads/` 占位路径。

不要把 `.env` / `.env.local`、数据库文件或邮件密钥提交到仓库。

## MVP 功能

- 邮箱注册、登录、登出、邮箱验证和忘记密码重置；开发态邮件链接可从终端取得。
- 鉴权页面：`/login`、`/register`、`/forgot-password`、`/reset-password`、`/verify-email`。
- 手机底栏五个入口：`史书`、`Gallery`、中央 `+`（添加趣事）、`Friends`、`Me`。
- **史书**：浅鞣黄时间线目录，按日期展示事件卡片；进入事件后可左右翻页阅读文字和图片。
- **Gallery**：只展示 Public 事件的双列瀑布流，图片按自身比例排列，并支持简单评论列表。
- **Add story**：填写 Time、Event、Content、Photos（可选）和 Private/Public；Private 事件仅参与者可见，Public 事件进入 Gallery。
- **Friends**：按邮箱或用户名搜索/邀请朋友；事件可以邀请朋友成为参与者，参与者共享该事件的史书访问权。
- **Me**：资料入口和登出。
- CSS 变量提供浅鞣黄金棕的纸张质感与响应式手机优先布局，窄屏优先同时适配桌面宽度。

## 技术结构

- Next.js App Router + TypeScript
- Prisma ORM；SQLite 开发回退（provider 默认 sqlite，生产迁移时切换到 postgresql）
- Auth.js（NextAuth）会话
- 本地 `uploads/` 或 S3 兼容对象存储占位
- `app/` 页面与路由、`components/` UI、`lib/` 数据和鉴权辅助代码

这是可跑的 MVP 骨架。邮件、S3、生产数据库可在不改产品信息架构的情况下替换为正式服务。

执行 `npm run db:seed` 后可使用演示账号 `hello@wuyule.local` / `wuyule-demo` 登录本地环境。

## 品牌

中文名：**物语了**（谐音“无语了”）  
英文名：**WuyuLe**  
GitHub：<https://github.com/HanjingLaura/wu-yu-le>
