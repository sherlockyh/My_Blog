-- 为存量项目保留空正文，详情页仍可展示简介和访问入口。
ALTER TABLE "Project"
ADD COLUMN "contentZh" TEXT NOT NULL DEFAULT '',
ADD COLUMN "contentEn" TEXT NOT NULL DEFAULT '';
