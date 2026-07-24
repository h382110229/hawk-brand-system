# HAWK Logo 设计任务 — Agent Briefing

## 你的角色

你是 HAWK 品牌的 Logo 设计师。请先 clone 这个仓库，阅读所有材料后设计新的 Logo 候选。

```bash
git clone https://github.com/h382110229/hawk-brand-system.git
cd hawk-brand-system
```

## 第一步：理解品牌（必读）

阅读 `docs/brand-brief.md`，这是完整品牌简报。核心要点：

- **品牌名**：HAWK（全大写）
- **调性**：轻奢 · 现代 · 智能
- **核心视觉元素**：H·A·W·K 四字母几何交织，与鹰/鸟类完全无关
- **参考气质**：Google Material Design 的克制感
- **拒绝**：花哨、传统企业风、赛博朋克、3D金属质感、鹰/动物图形
- **色彩**：Dark 模式金色 #D4AF37 + 黑底 #0A0A0A；Light 模式蓝色 #4285F4 + 白底
- **盾牌**：非必须，只是容器，不是灵魂

## 第二步：看历史尝试（必读）

查看 `assets/logo-candidates/` 下所有 round 文件夹，了解**什么不行**：

| Round | 问题 |
|-------|------|
| round1 | 3D金属质感太重，太像纹章/徽章 |
| round2 | 平面了但变成普通文字排版，没有交织感 |
| round3 | Antigravity 生成，var3 和 taskb 方向最接近但不够精致 |
| round4 | 6个概念方向探索 + 去文字盾牌标，都不理想 |

**用户最喜欢的方向**：round3 的 taskb（H和K构成左右两翼，中间是抽象几何纹样），以及 round3 的 var3（四字母真正交织且保持可读）。但都觉得不够精致。

**用户原话**："还是这个好看"（指带 "HAWK HOME SERVER" 文字的金属盾牌标），但去掉文字后觉得更丑了。

## 第三步：设计要求

### 硬性要求
1. H·A·W·K 四字母必须以某种方式呈现（交织/融合/嵌套）
2. 必须是**纯平面设计**（flat design），不要3D金属质感、不要渐变、不要浮雕效果
3. 纯直线、锐角、无曲线
4. 不能出现鹰/鸟类/动物图形
5. 结构必须在 32×32 像素下仍可辨识
6. 必须同时有 Dark 版（金+黑）和 Light 版（蓝+白）

### 设计方向建议
- HAWK 四个字母是**灵魂**，字母交织结构本身就应该构成 Logo
- 参考经典交织字母 Logo：Yankees NY、Chanel CC、LV——但要几何化、直线化
- 参考 Google/Material Design 图标级别的极简线条感
- 允许字母自然形成某种轮廓（比如盾形、菱形），但不要刻意加外框

### 排除项
- ❌ 普通文字排版（四个字母平铺）
- ❌ 3D 金属浮雕效果
- ❌ 鹰/翅膀/鸟类图形
- ❌ 盾牌外框（如果字母本身不构成盾形就不要加）
- ❌ 圆角/曲线
- ❌ 渐变/阴影/投影

## 产出要求

1. 设计 **3-5 个方案**，每个方案保存为 SVG 矢量文件
2. 同时导出 PNG 版本（1024×1024）
3. 每个方案生成 32×32 缩略版测试可读性
4. Dark 版和 Light 版都要（结构一致，仅换色）
5. 所有文件存入 `assets/logo-candidates/round5/`
6. 完成后写一份 `assets/logo-candidates/round5/README.md` 说明每个方案的设计思路

## 文件命名规范

```
assets/logo-candidates/round5/
├── README.md
├── concept-01/
│   ├── dark.svg
│   ├── dark.png
│   ├── dark-small.png        # 32×32
│   ├── light.svg
│   ├── light.png
│   └── light-small.png       # 32×32
├── concept-02/
│   └── ...
└── concept-05/
    └── ...
```

## 最后

不要急于交付，先花时间理解品牌简报和历史尝试。目标是做出一个**用户真正满意**的 Logo，而不是快速完成任务。如果不确定方向，可以先出 2 个风格差异大的草稿让用户选择，再深入细化。
