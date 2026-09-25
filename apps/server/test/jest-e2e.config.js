/** e2e 冒烟测试：外部依赖（Prisma/Redis）以 mock 替换，CI 无需真实服务 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '.e2e-spec.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
};
