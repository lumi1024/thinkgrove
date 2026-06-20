// Global setup: read test cases from Excel
import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export interface TestCase {
  用例编号: string;
  项目: string;
  类型: string;
  需求: string;
  优先级: string;
  标题: string;
  用例菜单: string;
  预置条件: string;
  步骤: string;
  期望结果: string;
  是否冒烟用例: string;
  创建者: string;
  经办人: string;
  用例类型: string;
  测试类别: string;
  执行结果: string;
  截图: string;
  测试用例集: string;
  备注: string;
  _clean_results?: string[];
}

// Load test cases from cached JSON
const CASES_PATH = path.join(__dirname, 'test-cases.json');
let allCases: TestCase[] = [];

function loadCases() {
  if (allCases.length === 0 && fs.existsSync(CASES_PATH)) {
    allCases = JSON.parse(fs.readFileSync(CASES_PATH, 'utf-8'));
  }
  return allCases;
}

// Create a typed test with our fixtures
export const test = base.extend<{
  testCase: TestCase;
}>({
  testCase: async ({}, use) => {
    const cases = loadCases();
    // Filter to runnable cases
    const runnable = cases.filter(c => {
      const results = c._clean_results || [];
      // Must have at least original expected results or be smoke test
      return results.length > 0 || c.是否冒烟用例 === '是';
    });
    await use(runnable);
  },
});

export { expect } from '@playwright/test';
