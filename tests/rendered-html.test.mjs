import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete overseas performance report", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /海外账号数据汇报/);
  assert.match(html, /Executive Summary｜执行摘要/);
  assert.match(html, /存在问题与原因分析/);
  assert.match(html, /解决方案与验收/);
  assert.match(html, /折线图/);
  assert.match(html, /条形图/);
  assert.match(html, /散点图/);
  assert.match(html, /热力图/);
  assert.match(html, /直方图/);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});

test("keeps collaboration and editable-data safeguards in source", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /create_weekly_report/);
  assert.match(page, /document_already_exists/);
  assert.match(page, /join_weekly_report/);
  assert.match(page, /structure:metrics/);
  assert.match(page, /structure:problems/);
  assert.match(page, /structure:actions/);
  assert.match(page, /contentEditable=\{editing\}/);
  assert.match(page, /访问码仅用于本次验证/);
  assert.match(layout, /海外账号数据汇报/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
  await assert.rejects(
    access(new URL("../app/_sites-preview/preview.css", import.meta.url)),
  );
  await access(new URL("dist/server/index.js", root));
});
