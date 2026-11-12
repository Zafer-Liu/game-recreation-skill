# 单文件 HTML 构建契约

## 交付定义

最终 HTML 应在声明的平台满足：

- 单独复制到空目录即可启动，无相邻资源、CDN 或服务器 API 的隐式依赖。
- JS/CSS 已打包内联；需要的模型、纹理、音频由代码生成或明确计入体积的内嵌数据提供。
- 若承诺双击即玩，必须测试 `file://`。ESM 多文件开发能跑不代表 file 协议能跑。
- 可读源码、构建脚本、依赖锁文件和第三方许可一起保留。

## 工具职责

### 只读参考扫描

```bash
node "<skill-dir>/scripts/inspect-html.mjs" "<reference.html>"
```

输出 stdout JSON，无文件写入，不执行参考。64 MiB 输入上限防止误读巨型文件；大文件需另选适合的受控方法。URL 和属性只报截断、隐藏 query/userinfo 的候选，不回显内嵌 data URI。扫描器使用启发式正则，结果不能代替浏览器与真实解析器。

### 可选工程骨架

```bash
node "<skill-dir>/scripts/scaffold.mjs" "<new-output-dir>" "<project-name>"
```

- 输出目录必须不存在，父目录须存在；遇到已存在目录直接拒绝。
- 名称为小写字母/数字/连字符。
- 只复制 `templates/web-singlefile/` 与 `templates/specs/`，替换名称占位。
- 不安装依赖、不启动服务、不构建、不写全局配置、不初始化 Git。
- 骨架中的页面只说明“尚未实现游戏”；agent 必须根据规格实现玩法。

运行任何工具前遵守用户/工程的运行授权。制作工作流本身不要求执行脚手架。

## 骨架构建方式

复制后的工程使用 esbuild 本地 devDependency。安装与构建均需对应授权，以下命令在新工程根目录执行：

```bash
npm install
```

```bash
npm run build
```

生产构建：JS 模块 → IIFE bundle → 插入模板；CSS 由独立入口压缩并插入 `<style>`，不通过运行时 `style.innerHTML` 注入。运行产生：

- `dist/index.html`：唯一可玩交付物（实现玩法之后）。
- `dist/build-report.json`：生产模式、输出目录、HTML 的 SHA-256、原始/gzip 字节与 esbuild 输入元信息，供开发核对，不是游戏运行依赖。
- `dist/third-party-licenses.txt`：依赖许可文本；相同文本也放在 HTML 中以满足单文件复制需求。

依赖导入仅允许可打包到 JS 的模块。骨架拒绝外部化 import、额外输出文件与源码模块里的 CSS import；CSS 统一写入 `src/style.css`。这只是骨架能力边界，不是零资产要求。需要图片、模型、字体、worker、WASM 等时设计内嵌策略并扩展对应 loader/许可记录，重新核实额外请求、体积与 file 协议兼容；不得为适配骨架而擅自降低主要资产的表现目标。

## 终止标签与许可

- JS 中大小写不敏感的 `</script` 必须转义，防止浏览器提前结束标签。使用 IIFE classic script 避免 file 协议 ESM 模块加载问题。
- CSS 中出现 `</style` 要明确拒绝或安全编码，不能靠字符串替换糊过去。
- 模板标记必须唯一，构建缺标记/多标记时失败，防止悄悄输出坏 HTML。
- 第三方许可不能因 minify 被丢弃。骨架读取每个非本地 JS 输入对应 npm 包的 `license` 与根许可证文件；缺失/缺少权限说明时失败并要求人工补充，不自动“承认已满足”。工具脚本本身由 MIT 许可分发。
- 自动收集只是保底。人工确认资源许可、传递依赖与包内特殊 notices；不允许把“没有许可文件”推断成可随意发布。

## 开发服务器

模板的 `npm run dev` 监听源码并服务 `.preview/`，需要显式运行授权。可通过 `PORT` 环境变量调整端口，默认 8940。它生成开发 HTML（包含未压缩 JS），不会写入生产 `dist/`。开发报告与生产报告各留在自己的输出目录，避免监听重建覆盖交付包。生产构建期间保持源码不变，同一生产目录只由一个构建进程写入。

宿主有专门的 preview/server 工具时用宿主工具启动该命令；不要绕过宿主。没有则按已授权终端工作流使用。开发服务器不提供发布物的离线证明；最终仍需生产构建 + 禁网 + file 协议验证。

## 产物对应核验

构建后在获准范围内执行：

```bash
npm run verify:artifact
```

`verify-artifact.mjs` 只读取 `dist/index.html` 与 `dist/build-report.json`，核对生产模式/目录、UTF-8/LF、原始字节、gzip 字节、SHA-256、模板标记已替换及许可块存在；不加载或执行游戏。失败返回非零退出码。旧报告缺少哈希或目录字段时应重新构建，不手工修改报告以凑通过。

该命令的通过只叫**产物完整性通过**。视觉质量、正常玩家路线、离线/file 协议仍需相应运行证据，不能自动据此将 G1/G2/G3 全部标通过。验证报告记录同一 SHA-256；源码或成品改变后，旧的运行证据应标明对应旧版本。用户要求提前打包时仍可交付，列清尚未完成的验收。

## 体积归因

esbuild `metafile.outputs[*].inputs[*].bytesInOutput` 可粗略定位 JS 模块贡献，不能与最终 HTML 字节直接相加当精确比例（共享包装、压缩和 CSS/许可另外占字节）。报告同时保留 `inputs`、`outputs`，不通过成品中的行号切割引擎/游戏。
