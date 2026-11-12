# Game Recreation Skill

[English](README.md) · **简体中文**

一套面向 coding agent 的参考驱动游戏复刻 Skill：先做出画面与操作共同成立的可玩切片，再扩内容，并按需求交付模块化工程或离线单文件 HTML。

**本仓库提供 Skill、参考方法、规格模板和工具，不包含具体游戏成品或游戏引擎。** 质量依据是实际参考对照与正常玩家路线，而不是系统数量、代码量或包体大小。

## 用来做什么

- 根据可玩 URL、本地 HTML、截图、录屏、源码材料或描述，实现有辨识度的游戏切片。
- 只做参考分析，不创建游戏。
- 改进已有复刻工程，保留能工作的架构。
- 在资源与运行条件允许时，把 Web 游戏打包成离线单文件 HTML。

适用于 2D 棋盘/解谜、平台游戏、3D 探索等类型。不默认 FPS、Three.js、特定模型服务商或多 agent 编排。面对大型商业游戏，先收缩到一个代表体验，不承诺复刻整部游戏。

## 开始使用

下载或克隆本仓库，让 agent 能读取其中的文件。仅阅读和使用 Skill 不需要安装 npm 依赖。

```bash
git clone https://github.com/Zafer-Liu/game-recreation-skill.git
```

### 放入项目

复制完整的 `skills/game-recreation/` 目录：

| 使用方式 | 目标位置 |
| --- | --- |
| Claude Code 项目级 Skill | `<project>/.claude/skills/game-recreation/` |
| 支持 `.agents/skills/` 的 agent | `<project>/.agents/skills/game-recreation/` |
| 不支持 Skill 自动发现 | 直接让 agent 读取 `skills/game-recreation/SKILL.md` |

分发目录内含参考、模板、脚本与许可，不依赖仓库根目录。是否自动发现由具体 agent 决定，不会自动安装到全局配置。

**语言说明：** Skill 执行指令、详细参考与规格模板目前为简体中文。英文 README 是面向国际读者的入口，agent 仍需读取实际 Skill 文件。

### 请求示例

> 读取 `skills/game-recreation/SKILL.md`，参考我提供的材料，在指定新目录制作有辨识度的可玩切片。先确定代表画面、关键动作和正常玩家路线；做出一个画面与操作都达到目标的场景，再扩内容。按表现需要选择程序化、自制或有许可资产，保留可读模块化源码，并在可行时交付离线单 HTML。运行和发布权限沿用当前约定。调试夹具与正常路线证据分开，未验证事项如实写出。

建议提供参考位置、输出目录、目标平台和最想保留的体验。只有游戏名时，先取得可访问的可靠参考，或明示推断边界；截图不能证明原作交互规则。

只想分析时，明确说“只分析，不创建游戏”。更多请求见 [examples/prompts.md](examples/prompts.md)。

## 四道质量门槛

区分**机制原型、辨识度切片、高还原复刻**。一般复刻请求默认先做辨识度切片；灰盒是中间产物，除非明确只要机制原型。

| 门槛 | 需要的证据 |
| --- | --- |
| **G0 目标可信** | 参考来源或推断边界明确，交付层级与画面/操作目标具体 |
| **G1 代表场景成立** | 真实渲染中取景、轮廓、比例、光色与核心交互共同达到目标 |
| **G2 正常路线成立** | 干净开局以普通输入完成循环、成功/失败和重开 |
| **G3 交付对应成立** | 验收版本对应交付包，需要的独立文件与离线条件有实际证据 |

门槛不是自动评分器，也不是每步追加审批。传送、补资源、直接合并实体或触发胜利，只算局部调试；不能替代普通玩家路线。用户要求提前打包时照做，说明当前层级与未完成验收。

详见 [质量门槛](skills/game-recreation/references/quality-gates.md)、[实现方法](skills/game-recreation/references/procedural-implementation.md)和[验证方法](skills/game-recreation/references/verification.md)。

## 工具

需要 **Node.js 22+**。仓库级工具只用 Node 内置模块，无需安装 npm 依赖；执行仍需符合当前任务授权。

### 静态分析本地 HTML

在本仓库运行：

```bash
node skills/game-recreation/scripts/inspect-html.mjs ./reference.html
```

输出原始/gzip 字节、哈希、script/style 估计和资源/API 静态线索的 JSON。不执行 HTML、不写报告文件。启发式扫描不能证明离线、性能、作者或玩法。

### 复制无玩法工程骨架

```bash
node skills/game-recreation/scripts/scaffold.mjs ../my-game my-game
```

目标目录必须不存在，父目录须存在；项目名使用小写字母/数字与连字符。只复制 Web 骨架和六份规格模板到 `docs/`，不安装、不构建、不初始化 Git、不覆盖现有工程。

生成页面只是占位页，实现与验证玩法是后续工作。

### 构建单文件 HTML

实现游戏后，在**生成工程根目录**获得相应运行授权再执行：

```bash
npm install
```

```bash
npm run build
```

```bash
npm run verify:artifact
```

模板通过 esbuild 把 JavaScript 打为内联 IIFE，内联 CSS 并保留第三方许可。生产输出在 `dist/`；`npm run dev` 默认监听端口 `8940`，生成并服务 `.preview/`，避免开发监听覆盖生产包。

| 输出 | 用途 |
| --- | --- |
| `dist/index.html` | 单文件产物；玩法与资源策略实现并验证后才能称独立可玩 |
| `dist/build-report.json` | 模式、目录、HTML SHA-256、原始/gzip 字节及 esbuild 元信息 |
| `dist/third-party-licenses.txt` | 许可副本；同样的文本也嵌在 HTML 中 |

`verify:artifact` 只读核对生产模式/目录、UTF-8/LF、原始/gzip 字节、SHA-256、模板标记替换与许可块。**它不评价游戏玩法、视觉质量或离线运行。**

基础模板接受可打包 JS 和单一 CSS 入口，拒绝外部化 import 与未支持的额外输出。图片、模型、字体、worker、WASM 等需要明确扩展内嵌与构建方案，复核许可、体积及 `file://`。单文件不等于零资产，base64 是编码而非压缩。

详见[工程 README](skills/game-recreation/templates/web-singlefile/README.md)与[构建契约](skills/game-recreation/references/single-file-contract.md)。

## 文件入口

- [SKILL.md](skills/game-recreation/SKILL.md)：agent 执行入口。
- [WORKFLOW.md](WORKFLOW.md)：人类可读工作流。
- [quality-contract.md](skills/game-recreation/templates/specs/quality-contract.md)：质量目标、阶段门槛与证据模板。
- [templates/web-singlefile](skills/game-recreation/templates/web-singlefile/README.md)：可选构建骨架，不含游戏。
- [examples/prompts.md](examples/prompts.md)：请求示例。
- [examples/regression-cases.md](examples/regression-cases.md)：待评估回归场景，不是已通过的案例。
- [QUALITY_REVIEW.md](QUALITY_REVIEW.md)：设计复盘与局限。

## 当前验证状态与边界

最近一次仓库修改做过文件完整性、UTF-8/LF、空白、JSON 与本地链接静态核对。**修订后的脚手架、构建管线、产物核对工具和跨游戏质量流程，尚未在本仓库通过安装/构建/浏览器回归验证。** 下游历史游戏的运行不能证明新版模板已通过。

没有预构建游戏、性能保证或“已实测提高所有模型生成质量”的承诺。参考输入只读，第三方代码与素材各自遵循授权和许可；工作流不授予专有角色、商标、音乐或美术的复用权。不要求模型 API key、付费生成服务或自动发布。

## 贡献

改进应覆盖跨游戏类型的通用失效方式，说明参考条件、观察到的问题、修改及真实验证状态。分发必需文件留在 `skills/game-recreation/`，使用 UTF-8/LF，不提交下载参考、密钥、生成游戏或本地审阅产物。

## 许可

Skill、工作流、模板与工具采用 [MIT](LICENSE)，版权 © 2026 **Zafer_Liu**。具体游戏内容与第三方依赖的许可分别决定。

[zaferliu.me](https://www.zaferliu.me)
