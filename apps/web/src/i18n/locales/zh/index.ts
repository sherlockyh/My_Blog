import admin from './admin';

const zh = {
  nav: { home: '首页', about: '关于我', articles: '技术文章', archives: '归档', categories: '分类', tags: '标签', projects: '项目作品', resources: '资源分享', guestbook: '留言板' },
  hero: { viewProjects: '查看我的项目', readArticles: '阅读技术文章', posts: '文章', views: '访问量', followers: '关注者' },
  home: { featured: '推荐文章', featuredProjects: '精选项目', viewAll: '查看全部', viewAllProjects: '查看全部', aboutMe: '关于我', latest: '最新文章', views: '阅读', hotTags: '热门标签', aboutRole: '前端开发 / 产品体验 / 技术写作', aboutBioFallback: '前端开发工程师，热爱技术与设计，喜欢用代码解决问题，创造价值。', aboutFocusFrontend: '现代前端', aboutFocusDesign: '体验设计', aboutFocusProduct: '产品思维', aboutLocationFallback: '浙江，杭州', aboutStatus: '持续学习中', aboutWorkMode: '偏爱把复杂问题做简单' },
  ai: { title: '博客 AI 助手', badge: '基础问答', welcome: '你好，我可以介绍这个博客、作者关注的方向，以及文章、项目和资源。', placeholder: '输入你的问题...', send: '发送', open: '打开 AI 助手', clear: '清空对话', thinking: '正在思考...', error: '暂时无法回答，请稍后再试。', suggestions: ['这个博客主要介绍什么？', '博客有哪些技术文章？', '作者主要关注哪些方向？'] },
  articles: { title: '文章列表', subtitle: '按时间、标签和关键词浏览全部公开文章。', search: '搜索文章...', all: '全部', empty: '暂无文章', back: '返回列表', publishedAt: '发布于', total: '篇文章', emptyContent: '这篇文章的正文还在完善中。', categories: '分类', switchArticle: '按分类切换文章', readingTime: '约 6 分钟阅读', toc: '文章目录', emptyToc: '暂无目录', related: '相关文章', articleTags: '文章标签', copy: '复制', copied: '已复制', backTop: '返回顶部' },
  aboutPage: { badge: '关于我', role: '前端开发 / 产品体验 / 技术写作', status: '持续学习中', kicker: 'Hello, world', title: '我喜欢把复杂想法做成清晰好用的产品', bioFallback: '前端开发工程师，热爱技术与设计，喜欢用代码解决问题，创造价值。', story: '平时关注前端工程化、交互体验、数据可视化和个人效率工具，也会把踩过的坑整理成文章，留给未来的自己和正在路上的朋友。', stack: '常用技术栈', language: '主要语言', keyword: '长期关键词', focusFrontend: '现代前端', focusFrontendDesc: '关注 React、TypeScript、工程化和可维护的组件设计。', focusExperience: '体验设计', focusExperienceDesc: '重视信息层级、交互反馈和真实用户使用时的顺手程度。', focusWriting: '技术沉淀', focusWritingDesc: '把项目经验、问题排查和学习路径整理成可复用的文章。', nowKicker: '正在做的事', nowTitle: '持续构建、持续记录、持续分享', nowDesc: '这个站点会继续沉淀项目作品、技术文章、资源收藏和一些真实开发中的思考。', readArticles: '阅读文章', viewProjects: '查看项目', leaveMessage: '给我留言' },
  archives: { title: '文章归档', subtitle: '按时间线回顾所有公开发布的内容。' },
  categories: { title: '文章分类', subtitle: '按主要技术方向浏览文章。', uncategorized: '未分类', articleCount: '{{count}} 篇文章' },
  tags: { title: '标签云', subtitle: '用标签快速定位感兴趣的主题。', empty: '暂无标签' },
  projects: { title: '项目作品', subtitle: '沉淀做过的产品、工具和实验项目。', search: '搜索项目...', all: '全部项目', empty: '暂无项目' },
  resources: { title: '资源分享', subtitle: '常用工具、资料和链接收藏。', search: '搜索资源...', all: '全部资源', empty: '暂无资源' },
  guestbook: { title: '留言板', subtitle: '欢迎留下你的想法，一起交流～', nickname: '昵称', content: '说点什么吧...', submit: '留言', submitOk: '留言成功', loginFirst: '' },
  footer: { rights: '用代码创造有趣的数字体验', admin: '后台管理' },
  admin,
  common: { loading: '加载中...', loadFailed: '数据加载失败', retry: '重试', view: '查看', learnMore: '了解更多', open: '打开链接', expand: '展开', collapse: '收起', close: '关闭', cancel: '取消', unsavedTitle: '有未保存的修改', unsavedDesc: '离开或重置后，当前修改不会被保存。', leave: '继续' },
};

export default zh;
