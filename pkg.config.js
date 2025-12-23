// pkg 配置文件
export default {
  entry: 'src/index.ts',
  targets: [
    'node18-win-x64',
    'node18-linux-x64',
    'node18-macos-x64'
  ],
  output: 'hooks-bin/',
  options: ['esm'],
  assets: ['config/**/*'],
  scripts: ['dist/**/*.js'],
  minify: true,
  clean: true
}
