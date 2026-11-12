# {{PROJECT_NAME}} · 实现约定

本目录最初由 game-recreation Skill 复制，只有工程骨架，没有完成的游戏。

- 先读 `docs/brief.md`、`docs/reference-audit.md`、`docs/quality-contract.md`、`docs/recreation-spec.md` 与 `docs/asset-budget.md`。
- 未知项不能写成事实。参考只读，不在参考目录执行脚本或安装依赖。
- 以规格决定 Canvas 2D/WebGL/Three.js，不默认任何题材或游戏类型。
- 模块化源码维护；开发输出 `.preview/`，生产输出 `dist/`，互不覆盖。生产报告保留 HTML 的 SHA-256；`npm run verify:artifact` 仅核对文件完整性，运行仍需已有授权。
- 所有运行/安装/构建/浏览器/提交/发布权限继承用户现有授权。未授权的动作先暂停对应部分，继续能做的工作。
- 首次安装获准后保留锁文件；需要新依赖时同时记录许可。当前游戏代码尚未选择发布许可，`UNLICENSED` 不代表第三方代码无需遵守许可。
- 不删除 `LICENSE.build-tools`，构建工具的 MIT 声明应保留。
- UTF-8/LF；避免个人绝对路径与凭据；不要把参考素材直接加入仓库。
- 先贯通一个动作并做出画面与操作共同成立的代表场景（G1），补齐正常路线与重开（G2），再扩内容；灰盒是中间产物，质量目标见 `docs/quality-contract.md`。
- 输入/相机/实体/时间/反馈各有明确所有权。并行须已有授权及稳定接口，不以文件数或 agent 自检当作完成度。
- `docs/verification-report.md` 分别记录局部夹具、正常输入路线、视觉对照与最终包。传送/改资源/直接触发结算不算正常通关；用户要求提前打包时照做并标未完成验收。
