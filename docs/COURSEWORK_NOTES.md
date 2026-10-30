# 课程设计改动说明（学生仓库）

> 对应《人工智能》课程设计模板 3.4「最小改进 / 测试验证 / 迭代反思」三个阶段。
> 所有命令均在本机实际执行，数据可复现。

## 1. 基线信息

| 项目 | 内容 |
|---|---|
| 上游来源 | https://github.com/afountain/MindTrace-Agent （非本人原创，仅作基线导入） |
| 学生仓库 | https://github.com/Yvwye/MindTrace-Agent |
| 基线提交 | `chore: 导入 MindTrace-Agent 基线代码`（main 分支） |
| 改进分支 | `feature/evidence-tags` |
| 基线状态 | vitest 2 passed；`vite build` 产物 JS 75.81 kB |

技术栈：Vue 3 + Vite 7 + TypeScript + Vitest 3（本机实测 Vite v7.3.7、Vitest v3.2.7）。

## 2. 改动内容（一项小而真实的优化）

**问题**：基线只返回一句自然语言 `feedback`，教师端证据记录里没有可复核的结构化字段，
无法判断"为什么给出这条反馈"，也无法对全班回答做统计。

**改动**（`frontend/src/adapters/learning.ts`）：

- 抽出 `RULES` 规则表（`concept_overfit` / `evidence_gap` / `action_plan`），
  原先内联的三个正则改为查表，规则与判定逻辑解耦；
- 新增 `classify(text)`，返回 `{ tags, hits }`，`hits` 保存**命中的原文片段**，
  使每条反馈都能追溯到输入中的具体词句；
- `EvidenceRecord` 增加 `tags` 与 `hits` 字段，随证据一并写入 localStorage；
- 新增 `MAX_ANSWER_LENGTH = 2000`，超长输入在写入前抛出明确错误，避免撑爆存储。

**兼容性**：`diagnosis` / `feedback` 的四个分支判定逻辑未变，
系统**仍不自动给学生评级**，只输出证据供教师人工复核。

## 3. 本机验证记录

环境：Windows 11 / Node v22.22.2 / npm 10.9.7

```bash
npm --prefix frontend install        # 安装 81 个依赖包
npm --prefix frontend run dev        # VITE v7.3.7 ready in 765 ms，HTTP 200
npm --prefix frontend test           # vitest：4 passed（基线为 2 passed）
npm --prefix frontend run build      # ✓ built in 1.06s
```

| 指标 | 改进前 | 改进后 |
|---|---|---|
| 单元测试用例 | 2 passed | 4 passed |
| 构建产物 JS | 75.81 kB | 76.47 kB（gzip 30.96 kB） |

新增的 2 条用例：

1. `exposes traceable tags and hits for each answer`——正常路径，校验标签数量与命中线索一致；
2. `rejects overlong answers`——异常路径，校验超长输入被拦截。

原有 2 条用例无回归，全部通过。产物体积增加约 0.66 kB，来自 `RULES` 规则表与 `classify()`。

## 4. 未解决的问题与待办

| 优先级 | 问题 |
|---|---|
| 高 | 规则为硬编码正则，同义表述（如"泛化能力差"未写"过拟合"）会被漏判，需引入同义词表或小模型 |
| 中 | `hits` 只保存首个匹配片段，长回答中的多处证据只能追溯一处 |
| 中 | 证据仅存于 localStorage，换浏览器即丢失，未做导出/持久化 |
| 低 | 无真实课堂数据验证规则命中率，当前结论仅基于 DEMO 输入 |

## 5. 合规声明

- 演示数据均为 DEMO / SAMPLE，不含真实学生姓名、学号等个人信息；
- 不含任何密钥、Token 或环境变量（`.env` 已被 `.gitignore` 忽略，仓库仅保留 `.env.example`）；
- 上游代码来源与许可见 `docs/LICENSES_AND_PROVENANCE.md`、`docs/MIGRATION_MANIFEST.md`。
