# ads_front — 换链系统管理后台前端

React 19 + Vite。构建产物部署到 track.lunalvabeau.com，与 ads_runner 同域。

## 系统全景（本仓库是其中一环）

广告联盟链接自动换链系统，共三个独立仓库（都在 GitHub，工作区通常放在 `TestTool/` 下并排）：
- **ads_front（本仓库）**：管理后台前端，Normal/Matrix 任务、ShiftLink、Post Back 统计管理，并生成贴到 Google Ads 的脚本模板。
- **ads_runner**：后端服务（Spring Boot 3 + Java 17，端口 8080，Windows 服务器 `C:\ads_app` 部署），定时生成联盟链接、换链调度（最新优先）、点击/花费上报、postback 归因。
- **lunalvabeau_site**：对外联盟导购内容站（React 静态站，lunalvabeau.com），投放落地载体。

数据流：本仓库生成的 Google Ads 脚本每小时调后端拉模板 + 上报点击/花费；联盟订单 postback 回调后端归因；本仓库的 Conversions 页展示 ROAS 等投入产出。后端接口协议详见 ads_runner 仓库的 `AGENTS.md`。

## 结构（重要：先读这个再动手）

- `src/App.jsx`：**超大集中式编排文件（6000+ 行）**，持有全部页面状态、API 调用和弹窗逻辑，把 props 分发给各 Section 组件。加功能时通常要同时改 App.jsx（状态+handler）和 Section 组件（展示+回调）。
- `src/components/<XxxSection>/`：各功能面板，只做展示与交互，通过 `onXxx` 回调调 App 的 handler。
  - `NormalAdsManagementSection` / `MatrixAdsManagementSection`：任务管理（Pause/Active/Edit/Delete）。
  - `ShiftLinkManagementSection`：链接管理（列表、批量导入、文件夹导入）。Status 列与 Pause/Active 按钮待移除（见下）。
  - `AffiliatePostBackManagementSection`：Post Back 三页签（Click / Conversions / Historical Import），投入产出统计在这里。
  - `GoogleAdsScriptPanel`：**生成贴到 Google Ads 的脚本模板**（见下）。
- `src/hooks/`：useAffiliatePostBacks、useShiftLinks 等，封装 requestApi 调用。
- `src/constants/`、`src/utils/formatters.js`（状态文案/Pause 按钮文案）、`src/lib/adsPortal.js`。

## API 约定

- `requestApi(path, { token })`：登录 token 走 header `AMtoken`。
- 对外开放接口（拉模板、点击上报）不用 token，用 `api_key` query param。

## Google Ads 脚本（GoogleAdsScriptPanel.jsx）

脚本模板是前后端协议的一部分，改它要同步考虑后端：
- 每次运行先 POST `/api/track/report`（body `{data:[{name,clicks,cost,currency}]}`，`api_key` 在 URL query）上报**累计**点击数和花费（`metrics.costMicros` 换算，账户币种 `AdsApp.currentAccount().getCurrencyCode()`）。
- `AdsApp.search` 返回**嵌套对象**：`row.campaign.name`、`row.metrics.clicks`，不是 `row['campaign.name']`（踩过坑，全部数据变 null）。
- 再逐 campaign GET `/api/normal/ads|/api/matrix/ads?campaign_name=...&api_key=...` 拿模板（纯文本，`{lpurl}` 占位），`mutateAll` + partialFailure 写 tracking template，瞬时错误自动重试。
- 服务器地址走 env：`VITE_ADS_SCRIPT_NORMAL_BASE_URL` / `VITE_ADS_SCRIPT_MATRIX_BASE_URL`（见 `.env.production`，默认 `https://track.lunalvabeau.com`）。
- **后端协议变化（如新增 cost 字段）后，用户必须重新复制脚本贴到 Google Ads，旧脚本不会自动更新**。

## 投入产出页（Conversions）要点

- 数据来自 `GET /postback/stats`，字段：tasks[]（每任务 adCost/adCostUsd/commission/profitUsd/roas/refundedOrderCount/conversionRate 等）和汇总。
- By Normal Task 表列头可点击排序（taskSortKey/taskSortDir），决策列在前（Campaign/Orders/Refunded/Conversion/Ad Cost USD/Profit/ROAS），参考列在后。
- 利润为负、退单>0 红色显示（`.pb-negative`）。

## 已定设计

- ShiftLink 链接**没有状态概念**：停投/恢复只由 Normal/Matrix 任务（Ads 级）控制，列表只有 Edit/Delete。早期版本有 Status 列和 Pause/Active 按钮，已按"链接状态无意义、会导致 ads 一直用同一条链"的结论移除。
- Normal/Matrix 任务编辑弹窗在 App.jsx（payload 见 `handleSaveNormalAds` 一带），字段名是后端拼写 `campainName`/`affiliteUrl`（历史拼写，别改）。
- 验证：`npm run build` 必须通过。
