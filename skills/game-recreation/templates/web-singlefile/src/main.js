// 工程骨架，仅显示状态。先完成 docs/ 的参考规格，再实现具体玩法。
// 2D 项目可以从 Canvas 2D 开始；需要 3D 时再添加并锁定相应依赖。
const ui = document.getElementById('ui');
const heading = document.createElement('h1');
heading.textContent = '{{PROJECT_NAME}}';
const status = document.createElement('p');
status.textContent = '工程骨架就绪。尚未实现游戏，请先完成参考分析与复刻规格。';
ui.append(heading, status);

// 从这里按实际需求加入：状态/输入/玩法/程序化内容/音频/UI。
// 不预设 FPS、港口场景、敌人或物理引擎。
