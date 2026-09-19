# 60s Decisions — Storm Corridor

纯 HTML/CSS/JavaScript 可交互关卡原型，无 LLM、无后端、无安装依赖。

## 运行

在本目录运行：

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

浏览器打开 http://127.0.0.1:8765 。也可以直接打开 dist/index.html。字体使用 Google Fonts，离线时自动使用系统字体，不影响交互。

## 规则

- 倒计时当前已关闭，所有阶段均没有时间限制。
- Situation → 选择唯一 AI 顾问；当前不扣除时间。
- 六份固定证据，三位顾问各有不同建议；每条必须 TRUST / DON'T TRUST 后才能继续。
- 查看来源会被记录，不额外扣秒，正常计时继续。
- 六条完成后才能下达最终路线指令。
- Minor Detour：安全、准时；Major Detour：安全、晚 25 分钟；Wait 1 hour：遭遇风暴。Timeout 结局暂不可触发。
- 复盘分别计算证据正确率、与 AI 一致次数和来源查看次数；时间管理评分暂时关闭。
- 判断不改变场景事实；超时保留已完成的判断，未判断项单独显示。Replay 完整重置。

## 文件与 Unity 对应

- dist/index.html：入口
- dist/style.css：主题、响应式布局、警告与过渡
- dist/app.js：agents / evidence / routes 固定数据、状态机、全部七个 Screen
- card / evidence-main 可对应 AgentCard / EvidenceCard / DecisionCard prefab。

模拟数据仅用于游戏。页面不保存玩家数据，刷新即重置。

## 手游交互版

当前入口默认显示竖屏手游界面：固定 HUD 与底部操作区、雷达动态背景、左右切换或滑动的顾问卡片、逐张证据、底部来源面板、结算与复盘。

新增文件：`dist/mobile.js`（手游界面与交互）、`dist/mobile.css`（竖屏视觉）。原 `app.js` 保留固定数据和关卡状态机。

右上角提供音效开关和全屏按钮。音效默认关闭，开启后使用本地合成音。全屏能力取决于浏览器支持；原型仍由浏览器承载，不是原生 App 安装包。桌面显示竖屏游戏画面；375×667 与 390×844 尺寸已检查，主要操作无需滚动页面。完整证据复盘在独立面板内滚动。

## Background music and sound effects

`dist/audio.js` creates an original procedural soundtrack locally with Web Audio: slow harmonic pads, sonar-like notes and bass pulses. The last 10 seconds add warning cues and a faster pulse. Advisor linking, source inspection, trust/reject judgments and each outcome have distinct effects. No audio downloads or third-party music are required.

Music and SFX default to enabled but start only after a user gesture. Use the separate MUSIC and SFX controls in the top bar to mute either channel. Audio pauses while the page is hidden; the game timer continues. This replaces the earlier single sound toggle and its default-off behavior.
