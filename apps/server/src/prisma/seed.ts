import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const articles = [
  {
    slug: 'pnpm-turborepo-monorepo',
    titleZh: 'Monorepo 实践：用 pnpm + Turborepo 管理全栈项目',
    titleEn: 'Monorepo in Practice: pnpm + Turborepo',
    summaryZh: '把前端、后端、共享类型放进同一个仓库，用 pnpm workspace 与 Turborepo 串起开发流。',
    summaryEn: 'Put frontend, backend and shared types in one repo, wiring the dev flow with pnpm workspace and Turborepo.',
    contentZh: `## 为什么是 Monorepo

全栈个人项目最大的痛点是**类型不同步**：后端改了 DTO，前端还在用旧字段。把代码放进同一个仓库，共享包就成了唯一的事实来源。

## 仓库结构

\`\`\`
apps/
  web/        # React 前端
  server/     # NestJS 后端
packages/
  shared/     # 共享类型
\`\`\`

## pnpm workspace

根目录的 \`pnpm-workspace.yaml\` 声明子包：

\`\`\`yaml
packages:
  - "apps/*"
  - "packages/*"
\`\`\`

子包之间通过 \`workspace:*\` 互相引用，安装时 pnpm 会做软链，改 shared 包立即生效。

## Turborepo 编排

\`turbo.json\` 里定义 \`build\` 任务并声明 \`dependsOn: ["^build"]\`，turbo 会按依赖图并行构建并缓存产物。

> 小技巧：dev 任务设置 \`cache: false\` 与 \`persistent: true\`，一条命令同时拉起前后端。
`,
    contentEn: `## Why Monorepo

The biggest pain of full-stack side projects is **type drift**: backend changes a DTO while frontend still uses the old shape. A single repo with a shared package becomes the single source of truth.

## Layout

\`\`\`
apps/
  web/        # React frontend
  server/     # NestJS backend
packages/
  shared/     # shared types
\`\`\`

Sub-packages reference each other via \`workspace:*\`; pnpm links them so edits to the shared package apply instantly.
`,
    cover: '',
    tags: ['工程化', 'Monorepo'],
    status: 'PUBLISHED',
  },
  {
    slug: 'antd-dark-mode',
    titleZh: 'Ant Design 5 深色模式正确姿势',
    titleEn: 'Dark Mode Done Right with Ant Design 5',
    summaryZh: '用 ConfigProvider 的 darkAlgorithm 加上 CSS 变量，让自定义区块也完美融入暗色主题。',
    summaryEn: 'Combine ConfigProvider darkAlgorithm with CSS variables so custom sections blend into the dark theme.',
    contentZh: `## 两个层面

1. **antd 组件**：切换 \`theme.algorithm\` 为 \`darkAlgorithm\`；
2. **自定义样式**：全部走 CSS 变量，亮暗两套值。

## 主题切换

\`\`\`tsx
<ConfigProvider
  theme={{
    algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: { colorPrimary: '#1677ff' },
  }}
>
\`\`\`

## CSS 变量

\`\`\`css
:root { --bg: #f4f7fc; --card: #fff; }
[data-theme='dark'] { --bg: #0b1220; --card: #131c31; }
\`\`\`

切换时给 \`document.documentElement\` 设置 \`data-theme\` 属性即可，组件样式无需重写。

> 暗色下把卡片阴影换成微弱外发光，质感会好很多。
`,
    contentEn: `## Two layers

1. **antd components**: switch \`theme.algorithm\` to \`darkAlgorithm\`;
2. **custom styles**: route everything through CSS variables with light/dark value sets.

Toggling only flips a \`data-theme\` attribute on \`document.documentElement\`.
`,
    cover: '',
    tags: ['前端', 'React'],
    status: 'PUBLISHED',
  },
  {
    slug: 'redis-view-counter',
    titleZh: '用 Redis 实现文章浏览量计数',
    titleEn: 'Article View Counting with Redis',
    summaryZh: 'INCR 计数、IP 防刷、定时回写数据库：一个轻量可靠的浏览量方案。',
    summaryEn: 'INCR counting, IP dedup and scheduled DB flush: a lightweight and reliable view-count design.',
    contentZh: `## 为什么不直接写数据库

每次阅读都 UPDATE 数据库，写放大严重；Redis 的 \`INCR\` 是原子操作，天然适合计数。

## 核心设计

- \`counter:article:{id}\`：存**总量**，首次 miss 用 DB 基值初始化；
- \`dedup:article:{id}:{ip}\`：SETNX + 60s TTL，同 IP 一分钟内不重复计数；
- 每 5 分钟 cron 把计数器整体写回 DB，进程退出时再 flush 一次。

## 关键代码

\`\`\`ts
const acquired = await redis.set(dedupKey, '1', 'EX', 60, 'NX');
if (acquired) {
  await redis.incr(counterKey);
}
\`\`\`

Redis 里存的是总量而非增量，因此重启后从 DB 重新初始化即可，无需清零逻辑。
`,
    contentEn: `## Why not write to the DB directly

Updating the database on every read causes write amplification. Redis \`INCR\` is atomic and perfect for counters.

The counter stores the **total** (initialized from DB on first miss), so after a restart we simply re-initialize from DB — no delta bookkeeping needed.
`,
    cover: '',
    tags: ['后端', 'Redis'],
    status: 'PUBLISHED',
  },
  {
    slug: 'nestjs-rest-api',
    titleZh: 'NestJS 入门：从零搭建 REST API',
    titleEn: 'Getting Started with NestJS: Building a REST API',
    summaryZh: '模块、控制器、服务三件套，加上全局拦截器统一响应结构。（草稿）',
    summaryEn: 'Modules, controllers, providers, plus a global interceptor for unified response shape. (draft)',
    contentZh: `## 三件套

NestJS 的核心是 **Module / Controller / Service**：控制器负责路由，服务负责逻辑，模块负责组装。

## 统一响应

用全局拦截器把返回值包成 \`{ code, data, message }\`，前端封装一次解包即可。

（本文还在撰写中……）
`,
    contentEn: `## The trio

NestJS core is **Module / Controller / Service**.

(Work in progress...)
`,
    cover: '',
    tags: ['后端', 'NestJS'],
    status: 'DRAFT',
  },
];

async function main() {
  await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      hero: {
        greeting: 'Hi, 我是 yh',
        titleZh: '用代码创造有趣的数字体验',
        titleEn: 'Creating fun digital experiences with code',
        descZh: '热爱前端开发与产品设计，喜欢把复杂的想法变成简洁、美观且好用的 Web 应用。',
        descEn: 'Passionate about frontend development and product design, turning complex ideas into simple, beautiful and usable web apps.',
      },
      features: [
        { icon: 'thunder', titleZh: '高效开发', titleEn: 'Efficiency', descZh: '专注工程化和性能体验，打造高质量 Web 应用', descEn: 'Focused on engineering and performance for high-quality web apps' },
        { icon: 'box', titleZh: '用户体验', titleEn: 'UX', descZh: '注重细节与交互设计，让产品更清晰、更好用', descEn: 'Attention to detail and interaction design for clearer, friendlier products' },
        { icon: 'layers', titleZh: '持续学习', titleEn: 'Learning', descZh: '保持好奇，探索新技术，不断提升技术边界', descEn: 'Stay curious, explore new tech, keep pushing the boundary' },
        { icon: 'team', titleZh: '分享交流', titleEn: 'Sharing', descZh: '乐于分享知识，与志同道合的伙伴交流', descEn: 'Love sharing knowledge with like-minded peers' },
      ],
      weatherCity: 'Hangzhou',
      announcement: '',
    },
  });

  await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'yh',
      avatar: '/images/avatar.svg',
      bioZh: '前端开发工程师，热爱技术与设计，喜欢用代码解决问题，创造价值。',
      bioEn: 'Frontend engineer who loves tech and design, solving problems with code.',
      location: '浙江，杭州',
      socials: [
        { label: 'GitHub', url: 'https://github.com' },
        { label: 'Email', url: 'mailto:hi@example.com' },
      ],
    },
  });

  for (const a of articles) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        ...a,
        status: a.status as any,
        publishedAt: a.status === 'PUBLISHED' ? new Date() : null,
      },
    });
  }

  if ((await prisma.project.count()) === 0) {
    await prisma.project.createMany({
      data: [
        { titleZh: '数据可视化平台', titleEn: 'Insight Dashboard', descZh: '基于 Vue3 + ECharts 的数据可视化解决方案。', descEn: 'A data visualization solution built with Vue3 + ECharts.', cover: '/images/projects/dataviz.svg', tags: ['Vue3', 'ECharts'], link: 'https://github.com', featured: true, sort: 1 },
        { titleZh: '任务管理应用', titleEn: 'TaskFlow', descZh: '简洁优雅的待办事项和项目管理工具。', descEn: 'A clean and elegant todo & project management tool.', cover: '/images/projects/taskflow.svg', tags: ['React', 'Node.js'], link: 'https://github.com', featured: true, sort: 2 },
        { titleZh: '个人旅行博客', titleEn: 'Travel Journal', descZh: '分享旅行故事与照片的静态博客。', descEn: 'A static blog sharing travel stories and photos.', cover: '/images/projects/travel.svg', tags: ['静态博客', '摄影'], link: 'https://github.com', featured: true, sort: 3 },
      ],
    });
  }

  if ((await prisma.resource.count()) === 0) {
    await prisma.resource.createMany({
      data: [
        { titleZh: 'React 官方文档', titleEn: 'React Docs', descZh: 'React 官方教程与 API 参考。', descEn: 'Official React tutorial and API reference.', link: 'https://react.dev', category: '文档' },
        { titleZh: 'Ant Design', titleEn: 'Ant Design', descZh: '企业级 UI 组件库。', descEn: 'Enterprise-class UI component library.', link: 'https://ant.design', category: '组件库' },
        { titleZh: 'NestJS 文档', titleEn: 'NestJS Docs', descZh: '渐进式 Node.js 框架官方文档。', descEn: 'Official docs of the progressive Node.js framework.', link: 'https://docs.nestjs.com', category: '文档' },
        { titleZh: 'Open-Meteo', titleEn: 'Open-Meteo', descZh: '免费无需 Key 的天气 API。', descEn: 'Free weather API without an API key.', link: 'https://open-meteo.com', category: 'API' },
      ],
    });
  }

  if ((await prisma.message.count()) === 0) {
    await prisma.message.createMany({
      data: [
        { nickname: '小明', content: '博客设计真好看，暗色模式爱了！' },
        { nickname: 'Alice', content: 'Great articles, keep it up!' },
      ],
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed done');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
