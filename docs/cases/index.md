---
title: WorkBuddy WB-X 案例集
description: 汇集 WorkBuddy 用户提交的真实案例，了解不同场景使用了哪些 Skills、如何执行以及最终呈现了什么效果。
breadcrumbTitle: 社区案例集
aside: false
outline: false
pageClass: community-cases-page
---

# WorkBuddy WB-X 案例集

这里收录由 WorkBuddy 用户提交的真实实践。每个案例都会说明它解决了什么场景、使用了哪些 Skills、在 WorkBuddy 中怎样执行，以及最终交付了什么结果。

社区案例通过完整性、安全性和可读性审核后即可发布；经过进一步复现和编辑的经典任务，未来可能被收录进《WorkBuddy 实战小白书》正文。

## 如何提交 Case

1. 先搜索左侧的社区 Case 和[小白书目录](/wb-x/)，确认场景或任务没有重复。
2. 打开[需求与案例投稿问卷](/help/#scenario-survey)，在场景描述开头注明“【案例投稿】”。
3. 写清场景、使用的 Skills、操作过程、实际效果和验收标准，并说明可以公开的素材范围。
4. 留下联系方式；需要补充信息时，我们会与你确认。
5. 审核通过后，由维护者整理并发布到案例集。填写问卷即可投稿，无需 GitHub。

::: warning 提交前请自行检查
如果已有 Case 使用相同目标和流程，请优先补充原案例；如果使用了不同的 Skill、方法或交付方式，请在问卷中说明差异。
:::

<div class="case-intro-actions">
  <a class="case-intro-button case-intro-button--primary" href="/help/#scenario-survey">填写问卷投稿</a>
  <a class="case-intro-button" href="/community/case-contributing">查看投稿指南</a>
  <a class="case-intro-button" href="/wb-x/">阅读小白书</a>
</div>

<section class="case-co-create" aria-labelledby="case-co-create-title">
  <div class="case-co-create__copy">
    <p class="case-co-create__label">CONTRIBUTOR COMMUNITY</p>
    <h2 id="case-co-create-title">投稿后，加入 WorkBuddy 共创群</h2>
    <p>如果你正在准备或已经提交 Case，欢迎添加微信。我们会邀请你进入 WorkBuddy 共创群，一起讨论案例结构、复现过程、审核建议和小白书后续选题。</p>
    <strong>添加微信时，请备注：workbuddy共创</strong>
    <ul>
      <li>交流 Case 选题，避免重复提交。</li>
      <li>讨论 Skill、操作步骤和结果证明。</li>
      <li>获取案例审核和内容完善建议。</li>
      <li>参与经典 Case 进入小白书正文的共创。</li>
    </ul>
  </div>
  <a class="case-co-create__qr" href="/article-assets/source-calibration/case-index/001.jpg" target="_blank" rel="noreferrer" aria-label="查看 WorkBuddy 共创联系人微信二维码大图">
    <img src="/article-assets/source-calibration/case-index/001.jpg" alt="王翊旭 Quadr-X 微信二维码，添加时备注 workbuddy共创" loading="lazy">
    <span>扫码添加微信 · 备注“workbuddy共创”</span>
  </a>
</section>

<div class="case-editor-note">
  <strong>从社区案例到小白书正文</strong>
  <p>我们会持续观察案例的可复现性、代表性和读者反馈。通过二次验证的经典任务，将在保留原作者署名的前提下进入小白书正式章节。</p>
</div>

<style>
.community-cases-page .VPDoc .container {
  max-width: 1280px;
}

.community-cases-page .VPDoc .content {
  max-width: none;
}

.case-intro-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 28px 0 8px;
}

.case-intro-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid var(--vp-c-text-1);
  border-radius: 4px;
  color: var(--vp-c-text-1) !important;
  font-weight: 700;
  text-decoration: none !important;
}

.case-intro-button--primary {
  background: var(--vp-c-text-1);
  color: var(--vp-c-bg) !important;
}

.case-editor-note {
  margin-top: 48px;
  padding: 24px;
  border-left: 5px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.case-editor-note strong {
  font-size: 18px;
}

.case-editor-note p {
  margin: 8px 0 0;
}

.case-co-create {
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: stretch;
  margin-top: 48px;
  padding: 34px;
  border: 2px solid var(--vp-c-text-1);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  box-shadow: 10px 10px 0 #32E6B9;
}

.case-co-create__label {
  margin: 0 0 12px !important;
  color: var(--vp-c-brand-1);
  font-family: "Silkscreen", monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
}

.case-co-create h2 {
  margin: 0 0 18px;
  border: 0;
  padding: 0;
  font-size: clamp(26px, 4vw, 40px);
  line-height: 1.25;
}

.case-co-create__copy > p:not(.case-co-create__label) {
  color: var(--vp-c-text-2);
  line-height: 1.8;
}

.case-co-create__copy > strong {
  display: inline-block;
  margin: 10px 0 14px;
  padding: 8px 12px;
  background: #32E6B9;
  color: #0c0f0a;
}

.case-co-create__copy ul {
  margin: 0;
  padding-left: 20px;
  color: var(--vp-c-text-2);
}

.case-co-create__copy li {
  margin: 6px 0;
}

.case-co-create__qr {
  display: grid;
  gap: 12px;
  width: min(100%, 520px);
  margin: 0;
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: #fff;
  color: #303030 !important;
  text-align: center;
  text-decoration: none !important;
}

.case-co-create__qr img {
  display: block;
  width: 100%;
  max-height: 460px;
  margin: 0;
  object-fit: contain;
}

.case-co-create__qr span {
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 720px) {
  .case-co-create {
    padding: 24px;
    box-shadow: 7px 7px 0 #32E6B9;
  }
}
</style>
