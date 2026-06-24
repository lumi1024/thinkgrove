# ThinkGrove 项目中的代理说明

## 当前项目方向

- 本仓库 `thinkgrove` 按 **框架优先** 来维护。
- 基于 ThinkGrove 开发的产品，应放在 **单独的仓库或 workspace** 中。
- 不要把产品叙事、产品文档、产品皮肤、产品专用页面混进本仓库。
- 继续在 `main` / `framework` 上迭代，不要推倒重来。

## 框架与产品的边界

- 建议留在本仓库：核心 runtime、API 契约、适配器、数据库迁移、测试、框架文档、中性默认皮肤。
- 建议迁出本仓库：沉浸式产品首页、onboarding 引导、产品 setup 流程、营销页、PRD / vision / requirements / user guide 等产品文档、写死在默认数据里的产品人格。
- 优先使用配置和扩展点，避免把单一产品的叙事写死进框架。
- 如果一个改动主要是为某个产品的品牌或体验服务，那它很可能不该进本仓库。

## 需要遵守的关键文档

- `/Users/hhy/mycode/thinkgrove/README.md:1`
- `/Users/hhy/mycode/thinkgrove/README.zh-CN.md:1`
- `/Users/hhy/mycode/thinkgrove/ARCHITECTURE.md:1`
- `/Users/hhy/mycode/thinkgrove/docs/框架契约.md:1`
- `/Users/hhy/mycode/thinkgrove/docs/框架迁移指南.md:1`

## 记忆与记录规则

- 对本项目而言，重要的结论应按 **项目长期记忆** 对待，不要只留在聊天上下文里。
- 当用户要求记录、总结、记住关键信息时，应同步写入 `~/.gstack/projects/thinkgrove`，并在回复中说明已写入项目记忆。
- 需要重点记录的内容包括：仓库拆分策略、框架边界调整、迁移计划，以及对既有 durable decision 的撤销或变更。
- 如果更新了长期记忆，同时说明相较之前发生了什么变化。
- 不要把密钥、API key、token 或用户隐私数据写入记忆。

## 协作风格

- 直接、简洁，不过度展开。
- 优先做最小、聚焦的改动，并贴合现有代码风格。
- 遇到“框架核心”和“产品层”拿不准时，先问，不要把产品专用内容直接加进本仓库。
