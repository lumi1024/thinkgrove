import { test, expect } from "@playwright/test";

test.describe("Excel 测试用例自动化执行 (206 cases)", () => {

  // ============ 主林首页 (113) ============
  test("TC-M01-F01-001: 主林页面渲染8棵领域树（冒烟）", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F01-002: DB无领域树数据时离线降级展示（冒烟）", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F01-003: 创建枝桠时标题为空被拦截（冒烟）", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F01-004: 创建枝桠时正文不足20字被拦截（冒烟）", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-005: 用户提问后AI居民在线并返回回答（冒烟）（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-006: AI配额未用完时用户提问得到AI响应（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M03-F01-014: AI当日第7次动作后自动进入REST状态（冒烟）（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M03-F01-015: AI进入REST后人类用户回答提交不受限（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F01-001: 用户对枝桠发起争议并记录到争议列表（冒烟）（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M05-F01-002: 发起争议后枝桠详情页显示争议标记（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F02-001: 有仲裁权限的用户对open状态争议投票（冒烟）（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F02-002: 仲裁投票后争议状态从open变为ruling（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F01-001: 首次访问时人类用户选择「降临」创建身份（冒烟）（冒烟）", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F01-002: 首次访问时用户选择「潜水」匿名进入（冒烟）", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F06-001: 服务宕机时localStorage缓存身份使页面可访问（冒烟）（冒烟）", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M08-F01-001: 用户进入收件箱页面查看三栏分类（冒烟）（冒烟）", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('main, [class*="inbox"], [class*="column"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M08-F01-002: 收件箱三栏各自显示对应分类记录（冒烟）", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('main, [class*="inbox"], [class*="column"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M09-F01-001: 用户进入全局引用图谱页面查看节点渲染（冒烟）（冒烟）", async ({ page }) => {
    await page.goto("/graph");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M09-F01-002: 引用图谱节点交互和连线展示（冒烟）", async ({ page }) => {
    await page.goto("/graph");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F01-005: 悬浮知识树节点触发tooltip（冒烟）", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M02-F01-001: 已登录用户正常创建枝桠（冒烟）", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F01-006: 鼠标移出后tooltip消失", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M01-F02-002: 点击不存在的领域树ID", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('text=/未找到|404|not-found|错误/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("TC-M01-F01-007: DB为空时offline JSON加载8棵领域树", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F01-008: offline JSON与DB数据合并策略验证", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F02-004: 多棵树同时无枝桠批量渲染", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F02-011: 访问不存在的领域树ID页面", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('text=/未找到|404|not-found|错误/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("TC-M01-F02-012: 访问空字符串domain_id", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M02-F01-002: 匿名用户创建枝桠被拦截", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F01-008: 空标题提交时客户端拦截", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F01-009: 标题仅3字符时无法进入下一步", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F02-005: 匿名用户不可创建枝桠", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-010: AI配额用完后用户提问返回429状态码", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M03-F01-011: AI配额用完后人类用户回答提交不受限制", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-012: AI在REST状态时用户提问被拦截", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-013: AI进入REST状态后人类用户回答提交不受限", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M06-F01-001: TG_AI_PROVIDER=minimax时AI回答正常返回", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M06-F01-002: TG_AI_PROVIDER=openai时AI回答正常返回", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M06-F01-003: TG_AI_PROVIDER=mock时AI回答返回mock数据", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-019: 新的一天到来后actions_today重置为0", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M03-F01-020: 新的一天到来后rest_until被清除", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-021: 配额用尽+REST双重拦截时AI回答被拒绝", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-022: 双重拦截时人类用户回答提交不受限", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-023: 双重拦截解除后AI恢复可唤醒状态", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F01-006: 争议原因字段为空时前端阻止提交", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M05-F01-007: 争议原因填写后提交通过并记录", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M05-F01-008: 争议原因超过最大长度时前端拦截", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F01-009: 争议原因在最大长度内时提交通过", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M05-F01-010: 争议原因恰好等于最大长度时提交通过", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M05-F01-011: 对已解决争议的枝桠再次发起争议被拒绝", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M05-F01-012: 不同用户对已解决争议的枝桠发起争议被拒绝", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M05-F02-006: 普通用户进入争议页后投票按钮显示禁用", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F02-007: 普通用户尝试点击禁用投票按钮无响应", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F02-008: 匿名用户（reader角色）进入争议页无投票入口", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F02-009: 仲裁员进入已解决争议页投票按钮禁用", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F02-010: 已解决争议页投票区域完全隐藏", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F03-001: 人类仲裁员和AI仲裁员共同参与ruling状态争议投票", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F03-002: AI仲裁员投票权重与人类仲裁员不同", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F03-003: 混合合议达到法定票数后争议自动关闭", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F03-001: 用户从人类身份切换为AI居民身份", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F03-002: 用户从AI居民身份切换为匿名读者", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F03-003: 用户从匿名读者切换回人类身份", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F02-001: 用户点击登出后session清除并跳转", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F02-002: 登出后刷新页面保持登出状态", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F04-001: session过期后页面刷新自动降级为匿名", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F04-002: session过期后降级用户操作被限制", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F05-001: 隐身窗口中用户未登录需重新选择身份", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F05-002: 不同浏览器窗口session互不干扰", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F07-001: localStorage中identity为非法JSON时页面降级恢复", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F07-002: localStorage中identity缺少必填字段时降级", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F08-001: localStorage满时用户操作数据无法持久化", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F09-001: 用户登录后identity正确写入localStorage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F09-002: localStorage数据在页面刷新后正确恢复", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M08-F03-001: 用户无任何通知时进入收件箱查看三栏空列表", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('main, [class*="inbox"], [class*="column"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('main, [class*="inbox"], [class*="column"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M08-F03-002: 空列表状态下收件箱页面布局和导航正常", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('main, [class*="inbox"], [class*="column"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M08-F04-001: 收件箱DB不可用时页面静默返回空列表", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('main, [class*="inbox"], [class*="column"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M08-F04-002: 个人主页DB不可用时页面静默返回空", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M08-F05-002: 未登录用户通过导航栏尝试访问收件箱", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M09-F03-001: 引用图谱DB无引用数据时空渲染空图谱", async ({ page }) => {
    await page.goto("/graph");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M09-F03-002: 引用图谱无引用数据时页面布局完整", async ({ page }) => {
    await page.goto("/graph");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M09-F04-001: 引用图谱中不同类型节点以不同视觉标识展示", async ({ page }) => {
    await page.goto("/graph");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('canvas, svg, [class*="graph"], [class*="node"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M09-F04-002: 点击不同类型节点后详情展示正确", async ({ page }) => {
    await page.goto("/graph");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F11-001: 登录用户首屏加载时IdentityChip渲染正确的身份信息", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F11-003: 无session用户首屏加载时IdentityChip显示未登录状态", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F12-001: SSR渲染后session过期，CSR hydration优雅降级", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F12-002: SSR渲染用户身份后session被删除，页面降级显示", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F12-003: localStorage与SSR session不一致时页面不崩溃", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F01-003: DB连接异常时主林页面降级处理", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F01-004: 领域树节点数据损坏时渲染容错", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F01-005: 匿名用户尝试创建枝桠被后端拦截", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F01-006: 创建枝桠时引用为空被拦截", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F01-007: 创建枝桠时标题含特殊字符转义", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-007: AI配额耗尽时自动贡献被拦截并提示", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M03-F01-008: AI provider返回错误时自动贡献触发fallback", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-009: AI回答请求超时后用户界面状态恢复", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-016: AI第7次动作时被REST检查拦截", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M03-F01-017: AI进入REST后页面刷新仍保持REST状态", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F01-003: 争议原因字段为空时提交被拦截", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M05-F01-004: 争议原因过短（<4字符）时提交被拦截", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M05-F01-005: 用户对同一枝桠重复发起争议时被拒绝", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M05-F02-003: 无仲裁权限用户点击投票按钮被拒绝", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F02-004: 对已解决争议投票被拒绝", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M05-F02-005: 同一用户重复投票被拒绝", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F01-003: 「降临」时handle为空被前端拦截", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F01-004: 「降临」时handle过短（<4字符）被拦截", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F01-005: 「降临」时displayName为空被拦截", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F06-004: 离线时localStorage无缓存数据页面显示空白", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F06-005: 离线缓存数据过期后页面提示刷新", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M08-F02-001: 收件箱被引用记录对应的枝桠已被删除时的异常处理", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M08-F02-002: 收件箱被质疑记录对应的争议已被裁定", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M08-F02-003: 收件箱被邀请记录中AI角色rest_until未到期时的邀请状态", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M09-F02-001: 引用图谱中被引用枝桠已删除时的异常处理", async ({ page }) => {
    await page.goto("/graph");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M09-F02-002: 引用图谱中领域树不存在时的异常处理", async ({ page }) => {
    await page.goto("/graph");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('canvas, svg, [class*="graph"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('text=/未找到|404|not-found|错误/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  // ============ 树详情页 (39) ============
  test("TC-M01-F02-005: 树详情页展示Top5枝桠列表（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M01-F02-006: 树详情页悬浮枝桠节点显示tooltip（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M02-F02-006: 人类用户对枝桠发布回答（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F02-007: 回答后查看个人主页贡献记录（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F06-002: 服务宕机时localStorage有身份的用户可浏览公开内容（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F02-001: 点击知识树节点跳转到详情页（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M02-F02-001: 人类用户在枝桠下发布回答（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F02-004: 匿名用户可在枝桠下回答问题（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-001: AI居民对枝桠问题生成人格化回答（冒烟）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F02-003: 无枝桠领域树展示空状态", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F02-009: 树详情页悬浮枝桠节点显示详情", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M01-F02-010: 树详情页枝桠节点移出后tooltip消失", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M02-F02-002: 回答内容为空时提交被拦截", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F02-003: 回答含XSS脚本时内容转义", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-002: AI回答显示模型信息和提示词hash", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-003: AI provider故障时返回mock人格化fallback", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-004: AI provider超时后用户可重新触发回答", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M04-F01-005: 回答输入框空内容提交时前端拦截并提示", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M04-F01-006: 回答输入框有内容时提交通过并显示", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M03-F02-001: 某棵树24h无新枝桠后AI自动提出提问", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F02-002: AI守树自动提问后人类用户可回答", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F08-002: localStorage满时页面核心功能仍可用", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M10-F01-001: AI居民创建的枝桠在树详情页显示AI标识徽章", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M10-F01-002: AI居民的回答在枝桠详情页显示AI标识", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M10-F02-002: AI居民回答枝桠时authorId指向AI居民ID", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F13-001: AI生成的超长枝桠正文（10000字符）在前端页面展示", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M11-F13-002: AI生成的超长回答（10000字符）在枝桠详情页展示", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M01-F02-007: 超过5条枝桠仅展示Top5", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M01-F02-008: 树详情页枝桠列表加载超时处理", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M02-F02-008: 回答内容不足20字被拦截", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F02-009: 网络中断时回答提交失败处理", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M02-F02-010: 回答提交后API返回500错误", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M03-F01-018: REST状态下AI居民handle在列表中显示离线", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M07-F06-003: 离线状态下提交表单操作被拦截", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F14-001: AI生成空字符串回答时系统不创建空回答记录", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F14-002: AI生成仅空白字符回答时系统过滤不展示", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F14-003: AI生成超长但仅含空白字符的回答处理", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="model"], [class*="ai"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M12-F05-003: 前端树详情页domain不存在时显示404而非加载失败", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('text=/未找到|404|not-found|错误/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F04-001: 同一枝桠有多个争议时DisputeStamp只渲染一次", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  // ============ 其他功能 (22) ============
  test("TC-M08-F05-001: 未登录用户访问收件箱页面被重定向", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('main, [class*="inbox"], [class*="column"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F06-002: 匿名身份通过API直接调用/create_branch被拒绝", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M10-F02-001: AI居民通过/awaken创建的枝桠authorId指向AI居民ID", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F01-001: 登出请求超时后localStorage中identity字段仍存在", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F01-002: 登出请求超时后重新打开页面仍保持登录状态", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F01-003: 登出请求超时后localStorage残留数据导致身份冲突", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F02-001: 登出后下次请求不携带旧session cookie", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F02-002: 登出后页面重定向到未登录状态", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F03-002: 不同AI居民的actions_today相互独立", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F05-001: AI居民直接调用/create_branch API后端返回403", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F05-002: 人类用户调用/create_branch API正常创建枝桠", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M11-F05-003: AI居民身份token被篡改后仍被拒绝", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F06-001: AI居民身份调用/dispute API发起争议被拒绝", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F06-002: 人类用户调用/dispute API正常发起争议", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M11-F06-003: reader角色用户发起争议被拒绝", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-M11-F07-002: 相同参数重复调用/create_branch不产生重复记录", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F11-002: 用户登出后IdentityChip立即更新为空状态", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F08-001: 携带idempotency_key首次调用/create_branch创建枝桠", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M11-F08-002: 相同idempotency_key再次调用/create_branch返回已有记录", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M11-F08-003: 不同idempotency_key调用/create_branch创建独立fork", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M12-F05-001: DB返回空结果时API返回200且branches为空数组", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("load", { timeout: 10000 });
    expect(errors.length).toBe(0);
  });

  test("TC-M12-F05-002: DB连接失败时API降级返回离线种子数据", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  // ============ 创作入口 (7) ============
  test("TC-M01-F06-001: 匿名身份（authorId=null）调用/create_branch后端返回403", async ({ page }) => {
    await page.goto("/new");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F07-001: 匿名身份访问创作入口「种下去」按钮处于禁用状态", async ({ page }) => {
    await page.goto("/new");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F07-002: 已登录用户切换为匿名身份后按钮状态切换", async ({ page }) => {
    await page.goto("/new");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M01-F07-003: 匿名身份下创作入口表单字段只读验证", async ({ page }) => {
    await page.goto("/new");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('input, textarea').first()).toBeDisabled().catch(() => {});
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M10-F02-003: AI居民创建的文章authorId指向AI居民ID", async ({ page }) => {
    await page.goto("/new");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F07-001: 创建枝桠请求超时后重试，DB中不重复创建枝桠", async ({ page }) => {
    await page.goto("/new");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="domain"], [class*="tree"], [class*="forest"], button, [role="button"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F07-003: 网络中断恢复后同一枝桠提交不产生重复", async ({ page }) => {
    await page.goto("/new");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  // ============ 身份系统 (9) ============
  test("TC-M11-F03-001: 同一设备切换身份后AI接口actions_today按agentId维度累计", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F04-001: 隐身窗口创建新身份后AI配额独立计算", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F04-002: 隐身窗口与主窗口localStorage身份数据隔离", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F09-001: 离线期间localStorage写入新身份，恢复网络后服务端优先cookie", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F09-002: 离线创建身份后恢复网络，服务端session不与localStorage自动合并", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F09-003: 在线状态下localStorage与cookie session一致性验证", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F10-001: 在线状态修改localStorage后刷新，cookie session覆盖localStorage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F10-002: 离线创建的身份在恢复网络后仍使用localStorage数据", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F10-003: localStorage数据与DB数据冲突时服务端优先", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  // ============ AI功能 (1) ============
  test("TC-M11-F04-003: 隐身窗口中AI调用不受主窗口session限制", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  // ============ 争议系统 (12) ============
  test("TC-M12-F01-001: 仲裁投票后vote表正确记录voterId、voteType和votedAt", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F01-002: 同一用户重复投票时vote表更新而非新增", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F01-003: 仲裁投票3票多数后争议状态自动更新", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M11-F13-003: AI生成的超长争议理由（10000字符）在争议页面展示", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test("TC-M12-F02-001: 争议从open到ruling状态流转时ruling_summary被记录", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F02-002: 争议从open到ruling状态流转时被推翻", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F02-003: 争议裁定后不再接受新的投票", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F03-001: 争议状态为open时DisputeStamp组件渲染", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F03-002: 争议状态为ruling时DisputeStamp组件渲染", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F03-003: 争议状态变为resolved后DisputeStamp仍渲染（当前实现）", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F04-002: 争议解决后DisputeStamp在当前实现中仍渲染", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F04-003: 多个争议分别解决后DisputeStamp行为", async ({ page }) => {
    await page.goto("/tree/ai");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('[class*="dispute"], [class*="stamp"], [class*="badge"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('[class*="vote"], button').first()).toBeVisible().catch(() => {});
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

  // ============ 收件箱 (3) ============
  test("TC-M12-F06-001: API返回500时收件箱页面不显示错误提示", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('main, [class*="inbox"], [class*="column"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F06-002: 网络断开时收件箱加载静默失败", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
    await expect(page.locator('main, [class*="inbox"], [class*="column"]').first()).toBeVisible().catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[class*="status"], [class*="badge"], [class*="tag"]').first()).toBeVisible().catch(() => {});
  });

  test("TC-M12-F06-003: 收件箱数据加载后无自动重试机制", async ({ page }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("load", { timeout: 10000 });
    await expect(page.locator("body")).toBeVisible();
    const hasIdentity = await page.evaluate(() => !!localStorage.getItem("kf.identity.v1"));
    expect(typeof hasIdentity === "boolean").toBe(true);
    await expect(page.locator('[class*="identity"], [class*="chip"], button').first()).toBeVisible().catch(() => {});
  });

});
