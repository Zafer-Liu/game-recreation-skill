# {{PROJECT_NAME}}

这是供参考驱动复刻使用的工程骨架，**尚未实现游戏**。`docs/` 存放输入、证据、质量契约、玩法规格、预算和验证记录。先完成一个画面与操作共同成立的代表切片，再扩内容；不把灰盒、构建成功或小包体称为高质量成品。

## 文件

- `src/main.js`：JS 模块入口，可 import 自己的源码；没有预置引擎。
- `src/style.css`：唯一 CSS 入口，不使用外链、`@import` 或 `url()`。
- `src/template.html`：HTML 模板，脚本/样式/许可证标记须各保留一次。
- `scripts/pipeline.mjs`：esbuild → IIFE + 压缩 CSS → 单文件 HTML；收集 npm 输入包的根许可证。
- `scripts/build.mjs`：生产构建入口。
- `scripts/dev.mjs`：监听 `src/`、向 `.preview/` 生成开发 HTML 的本地服务器，无自动刷新。
- `scripts/verify-artifact.mjs`：只读核对生产 HTML 与报告的模式、字节/gzip、哈希和许可标记，不执行游戏。
- `LICENSE.build-tools`：构建脚本的 MIT 许可；游戏内容的发布许可需另行决定。
- `THIRD_PARTY_NOTICES.md`：人工许可与素材来源记录。

## 获准后运行

需要 Node.js 22+。没有全局安装步骤。下面的命令均在本工程根目录执行，须符合用户当前运行授权。

```bash
npm install
```

```bash
npm run build
```

```bash
npm run dev
```

生产构建完成后，获准时核对产物：

```bash
npm run verify:artifact
```

默认开发地址 `http://127.0.0.1:8940`，端口可用 `PORT` 环境变量调整。源码变化后浏览器需重新加载；有专用预览工具的宿主应通过该工具启动。

## 构建输出

- `dist/index.html`：单文件产物，内联 JS/CSS/许可证。只有实现并验证玩法后才能称为可玩游戏。
- `dist/build-report.json`：生产模式、输出目录、HTML SHA-256、UTF-8 原始/gzip 字节与 esbuild metafile；是核对报告，不是运行依赖。
- `dist/third-party-licenses.txt`：与 HTML 中相同的许可证副本。

开发输出及其报告在 `.preview/`，生产输出在 `dist/`，两者互不覆盖。最终验收记录生产 HTML 的 SHA-256；核对文件完整性不证明画面、玩法与离线已通过。

骨架未内置引擎或资产库。必要的图片/模型等可以设计内嵌方案，扩展骨架 loader 与许可记录，不为迎合骨架而改成低质占位物。引入 Three.js 等包后，首次安装保留锁文件。构建静态检查不能证明绝对离线；最终需以独立 HTML 在禁网和 `file://` 下实际验证。

## 发布前填写

实际玩法、操作、成功/失败/重开、兼容平台、原始/gzip 体积、验证证据、已知限制、游戏代码许可。未构建/未测的字段保留“未验证”。
