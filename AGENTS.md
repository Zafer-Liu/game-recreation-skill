# Repository instructions

本仓库交付的是可复用的游戏复刻 Skill、工作流参考、规格模板和工具。除非用户另行要求，不在这里实现某个具体游戏，不携带参考游戏源码或资产。

## 工作约定

- 核心 Skill 是 `skills/game-recreation/SKILL.md`；保持简洁，通过相对链接读取阶段参考。质量目标与门槛的单一说明在 `references/quality-gates.md`（相对 Skill 目录）。
- 所有分发必需文件都在 `skills/game-recreation/` 内，使单独安装该目录也能使用。
- 新增功能同时更新实际存在文件的索引、用法与适用边界。不要先写不存在的功能。
- 工具应跨平台、基于 Node 内置模块；不硬编码本机路径，不引入付费服务。
- 参考输入只读；不执行其脚本，不在参考目录运行包管理器或解释器。
- 不以游戏名/题材限制流程，不把 FPS 或 Three.js 作为所有参考的默认选择；不用本次失败的游戏参数固化通用规则。
- 优先修参考对照、代表场景与正常玩家路线；体积、程序化资产和并行是手段，不代替质量证据。
- 证据、推断和未验证事项分开写；不得从库名、注释或静态扫描推断作者/性能/制作工具。
- 文件为 UTF-8、LF。不要写入密钥或绝对个人路径。
- 本仓库当前未授权安装依赖、运行工具/测试/构建、浏览器执行或生成运行产物；默认只做 diff、UTF-8 与 LF 检查。后续按用户明确授权扩大验证。
- Git 提交、推送、公开仓库和部署分别需要明确授权。不要替用户发布。

## 目录职责

- `skills/game-recreation/references/`：各阶段方法与可核验的工程约束。
- `skills/game-recreation/templates/specs/`：输入、证据、规格、体积、验收、交付记录。
- `skills/game-recreation/templates/web-singlefile/`：可选的无玩法 Web 工程骨架。
- `skills/game-recreation/scripts/`：只读 HTML 检查、无覆盖脚手架。
- `examples/`：给用户/agent 的示例请求，不是假造的验证报告。
