# HAWK Homelab 开发部署方法论

> 基于 2025-2026 最佳实践研究整合
> 针对 Mac Pro 2013 + Docker/Colima + Cloudflare Tunnel 环境定制
> 日期：2026-07-24

---

## 总览：全生命周期流水线

```
[ 需求 & 规划 ] ──→ [ 架构 & 设计 ] ──→ [ 代码开发 ] ──→ [ 测试 & 验证 ]
     │                    │                    │                   │
     │  Spec-Driven       │  CLAUDE.md         │  TDD + AI         │  自动化验证
     │  Interview          │  Design Token      │  Writer/Reviewer  │  Hooks + CI
     │                    │                    │                   │
     ▼                    ▼                    ▼                   ▼
[ 持续演进 ] ◄─── [ 监控 & 运维 ] ◄─── [ 部署 & 上线 ] ◄─────────┘
     │                    │                    │
     │  Renovate          │  Uptime Kuma       │  GitHub Actions
     │  迭代反馈          │  Healthchecks      │  + SSH 部署
```

---

## Phase 1：需求 & 规划 — Spec-Driven Development

### 方法论：Harper Reed 的 Spec-Driven 流程

**核心思想**：先用 AI 对话收敛需求，产出结构化 spec，再进入开发。

#### Step 1.1：Idea Honing（需求挖掘）

用推理模型（ChatGPT o3/Claude）做苏格拉底式追问：

```
提示词模板：
"我想要做 [项目描述]。请一次问我一个问题来完善需求规格。
问到覆盖以下维度为止：
1. 目标用户和使用场景
2. 核心功能（MVP 范围）
3. 技术约束和偏好
4. 边界条件和异常处理
5. 验收标准
最后编译成一份 developer-ready specification。"
```

产出：`spec.md`

#### Step 1.2：Planning（计划生成）

将 spec 交给推理模型拆解：

```
提示词模板：
"基于 spec.md，制定分步实施蓝图：
- 拆成迭代式小块（每块 ≤ 2小时工作量）
- 每块有明确的测试驱动验证方式
- 输出 prompt_plan.md（给 AI 编码工具的指令序列）
- 输出 todo.md（人工检查清单）"
```

产出：`prompt_plan.md` + `todo.md`

#### Step 1.3：HAWK 项目特别约定

| 文档 | 位置 | 用途 |
|------|------|------|
| `spec.md` | 项目根目录 | 需求规格 |
| `prompt_plan.md` | 项目根目录 | AI 编码指令序列 |
| `todo.md` | 项目根目录 | 人工检查清单 |
| `docs/brand-brief.md` | hawk-brand-system | 品牌规范 |

---

## Phase 2：架构 & 设计 — 项目上下文工程

### 方法论：CLAUDE.md 体系 + Design Token 驱动

#### Step 2.1：CLAUDE.md 分层架构

每个项目仓库都需要 `CLAUDE.md`，内容精简、高信号：

```markdown
# CLAUDE.md 模板

## 构建与测试
- [具体的 build/test/lint 命令]

## 代码规范
- [项目特有的规范，不是通用常识]

## 架构决策
- [关键技术选型和原因]

## 常见陷阱
- [踩过的坑，AI 容易犯的错]
```

**分层加载优先级**（从宽到窄）：
1. `~/.claude/CLAUDE.md` — 个人全局偏好
2. `./CLAUDE.md` — 项目级（git 提交）
3. `./CLAUDE.local.md` — 本地覆盖（gitignore）
4. `./.claude/rules/*.md` — 按文件类型/目录细分规则

#### Step 2.2：HAWK Design Token 驱动开发

```
hawk-brand-system/tokens/
├── color/dark.json      → 项目直接 import 使用
├── color/light.json     → 主题切换
├── typography.json      → 字体系统
├── spacing.json         → 间距节奏
└── ...
```

**原则**：任何 HAWK 项目的 UI 都从 token 文件取值，不在代码里硬编码颜色/字体/间距。

#### Step 2.3：Skills 知识库

可复用的领域知识编码为 `.claude/skills/` 或 Hermes skills：

```
~/.hermes/skills/
├── hermes-agent/          # Hermes 自身操作
├── home-server/           # Homelab 部署流程
├── hawk-brand-system/     # 品牌系统规范
└── ...
```

---

## Phase 3：代码开发 — AI-Assisted TDD

### 方法论：Test-Driven + Writer/Reviewer 双 Agent 模式

#### Step 3.1：TDD 循环（AI 版）

```
┌─────────────────────────────────────────────────┐
│  1. 人工写测试（或 AI 写测试，人工审核）          │
│  2. AI 实现代码使测试通过                        │
│  3. AI 运行测试，失败则自修复                    │
│  4. 人工审核实现（或用 Reviewer Agent）          │
│  5. 提交，进入下一个测试                         │
└─────────────────────────────────────────────────┘
```

**Claude Code 实操命令**：
```bash
# TDD 模式：先写测试
claude "写一个 validateEmail 函数。测试用例：'a@b.com' 为 true，'abc' 为 false。
实现后运行测试。"

# 非交互模式（CI 友好）
claude -p '运行所有测试，报告失败项' --allowedTools 'Read,Bash' --max-turns 10
```

#### Step 3.2：Writer/Reviewer 双 Agent 模式

```
Writer Agent（实现）──→ diff 输出 ──→ Reviewer Agent（审查）
     │                                      │
     │  - 写代码                             │  - 全新上下文
     │  - 写测试                             │  - 对照 spec 审查
     │  - 运行测试                           │  - 检查安全/质量
     │                                      │
     ◄──────── 反馈修改 ◄────────────────────┘
```

**Hermes 实操**：
```
# Writer
delegate_task: "根据 spec.md 实现 [模块]，写测试并确保通过"

# Reviewer（独立上下文）
delegate_task: "审查 [模块] 的实现，对照 spec.md 检查：
1. 功能完整性
2. 边界条件处理
3. 安全隐患
4. 代码质量"
```

#### Step 3.3：上下文管理（关键技能）

| 场景 | 操作 |
|------|------|
| 切换不相关任务 | `/clear` 或新 session |
| 上下文快满了 | `/compact` 部分压缩 |
| 调研/探索 | 委派给子 Agent（新鲜上下文） |
| 纠正 3 次还没解决 | `/clear` + 重新描述问题 |
| 大型迁移 | Fan-out 多 Agent 并行 |

**黄金法则**：新 session + 好 prompt > 长 session + 反复纠正

#### Step 3.4：Hooks 自动化质量门

```json
// .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "eslint --fix $FILE"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "check-dangerous-command.sh $COMMAND"
      }
    ]
  }
}
```

---

## Phase 4：测试 & 验证 — 自动化验证体系

### 方法论：多层验证 + 对抗性审查

#### 验证层级

| 层级 | 方式 | 工具 |
|------|------|------|
| L1 · 代码质量 | Lint + Format | ESLint, Prettier, Ruff |
| L2 · 单元测试 | 测试套件 | pytest, vitest, jest |
| L3 · 构建检查 | 完整构建 | `npm run build`, `docker build` |
| L4 · 集成测试 | E2E/截图对比 | Playwright, Cypress |
| L5 · 对抗审查 | 子 Agent 审查 | Fresh context review |

#### 关键原则

> **"Give the AI a way to verify its work."**
> 如果没有测试/构建/lint，AI 无法自验证，你就会变成验证循环。

---

## Phase 5：部署 & 上线 — GitHub Actions + SSH

### 方法论：轻量 GitOps（不用 Kubernetes）

#### 推荐架构：GitHub Actions + SSH + Docker Compose

```
开发者 push ──→ GitHub Actions ──→ SSH 到 Mac Pro ──→ docker compose up -d
     │                │                    │
     │  git push      │  自动触发          │  rsync 文件
     │  main 分支     │  运行测试          │  拉取镜像
     │                │  构建镜像          │  重启服务
```

#### deploy.sh 模板

```bash
#!/bin/bash
# deploy.sh — 轻量部署脚本
set -euo pipefail

STACK=${1:?Usage: deploy.sh <stack-name>}
REMOTE_HOST="hawk@192.168.31.236"
REMOTE_BASE="/opt/stacks"

echo "📦 Syncing $STACK to $REMOTE_HOST..."
rsync -avz --delete \
  "stacks/$STACK/" \
  "$REMOTE_HOST:$REMOTE_BASE/$STACK/"

echo "🚀 Deploying $STACK..."
ssh "$REMOTE_HOST" << 'EOF'
  cd "$REMOTE_BASE/$STACK"
  docker compose pull
  docker compose up -d --remove-orphans
  docker compose ps
EOF

echo "✅ $STACK deployed successfully"
```

#### GitHub Actions 工作流

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
    paths:
      - 'stacks/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test  # 或你的测试命令

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/stacks/${{ github.event.repository.name }}
            git pull
            docker compose pull
            docker compose up -d
```

#### 自动依赖更新：Renovate

```json
// renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "docker-compose": { "enabled": true },
  "packageRules": [
    {
      "matchUpdateTypes": ["patch"],
      "automerge": true
    },
    {
      "matchPackageNames": ["postgres"],
      "matchUpdateTypes": ["major"],
      "enabled": false
    }
  ]
}
```

---

## Phase 6：监控 & 运维 — 轻量可观测

### 推荐栈

| 工具 | 用途 | 优先级 |
|------|------|--------|
| **Uptime Kuma** | HTTP/TCP 健康检查 + 告警 | 🔴 必装 |
| **Healthchecks.io** | Dead man's switch（应该发生的事没发生） | 🟡 推荐 |
| **Coolify/Dokploy 内置监控** | 容器/服务器指标 | 🟢 可选 |
| **Prometheus + Grafana** | 深度指标 | ⚪ 过重，暂不需要 |

#### 部署后验证流程

```
部署完成 ──→ Uptime Kuma 检查 ──→ 成功？
                                      │
                              是 ──→ 记录部署日志
                              否 ──→ 告警 + 自动回滚
```

---

## Phase 7：持续演进 — 反馈循环

### 方法论：Spec → Build → Measure → Learn

```
用户反馈 ──→ 更新 spec.md ──→ AI 重新规划 ──→ 增量开发 ──→ 部署
     ▲                                                        │
     └────────────────── 监控数据 ◄────────────────────────────┘
```

#### 迭代节奏

| 活动 | 频率 | 工具 |
|------|------|------|
| 代码提交 | 每个功能点 | Git + GitHub |
| 部署 | Push to main 自动触发 | GitHub Actions |
| 依赖更新 | 每周 Renovate PR | Renovate |
| 健康检查 | 每 5 分钟 | Uptime Kuma |
| 架构回顾 | 每月 | 手动 + AI 辅助 |

---

## AI 工具矩阵

| 工具 | 最佳用途 | 使用阶段 |
|------|----------|----------|
| **Hermes Agent** | 多工具协调、定时任务、跨平台消息 | 全生命周期 |
| **Claude Code** | 交互式编码、TDD、代码审查 | 开发 + 测试 |
| **ChatGPT/o3** | 需求挖掘、Spec 生成 | 规划 |
| **Claude Code -p** | CI/CD 自动化、非交互任务 | 部署 |
| **Aider** | 快速代码修改、自修复循环 | 开发 |
| **Cursor/Windsurf** | IDE 内多文件编辑 | 开发 |
| **repomix** | 代码库打包给 LLM 分析 | 调试 + 审查 |

### 多工具协作模式

```
[ChatGPT/o3]  需求挖掘 ──→ spec.md
      │
      ▼
[Claude Code]  计划生成 ──→ prompt_plan.md
      │
      ▼
[Claude Code]  编码实现 ──→ 代码 + 测试
      │
      ▼
[Hermes Agent] 审查调度 ──→ 子 Agent 对抗审查
      │
      ▼
[GitHub Actions] CI/CD ──→ 自动测试 + 部署
      │
      ▼
[Hermes Agent] 监控告警 ──→ 定时健康检查
```

---

## HAWK 项目快速启动清单

新项目启动时按此清单执行：

- [ ] `git init` + 创建仓库
- [ ] 编写 `CLAUDE.md`（build/test/lint 命令 + 项目规范）
- [ ] 编写 `spec.md`（Spec-Driven 流程产出）
- [ ] 创建 `.claude/settings.json`（Hooks 配置）
- [ ] 创建 GitHub Actions workflow（测试 + 部署）
- [ ] 配置 Renovate（依赖自动更新）
- [ ] 部署到 Mac Pro（docker compose up）
- [ ] 添加 Uptime Kuma 监控
- [ ] 导入 HAWK Design Token（品牌一致性）

---

## 参考来源

- [Anthropic Claude Code Docs](https://code.claude.com/docs/en/) — 官方最佳实践
- [Harper Reed's LLM Codegen Workflow](https://harper.blog/2025/02/06/my-llm-codegen-workflow-atm/) — Spec-Driven 方法论
- [Karan Sharma's Homelab Deploy](https://mrkaran.dev) — rsync + SSH 部署模式
- [teqqy.de GitOps](https://teqqy.de) — Gitea + Renovate + Webhook 模式
- [Coolify](https://github.com/coollabsio/coolify) — 自托管 PaaS
- [Dokploy](https://github.com/Dokploy/dokploy) — 轻量 PaaS
- [Komodo](https://github.com/moghtech/komodo) — Rust GitOps for Docker
- [SWE-agent](https://github.com/SWE-agent/SWE-agent) — 多 Agent 编码模式

---

*本文档由 HAWK × Hermes Agent 协作完成，基于 2025-2026 最新实践研究整合。*
