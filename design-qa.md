# 定制服务页｜工作坊海报切换 Design QA

## 验收范围

- 页面：`/help/`
- 默认状态：第二期（08.29）选中
- 交互：第一期、第二期、第三期缩略图切换右侧海报
- 链接：第一期与第二期海报可进入对应公众号活动页；第三期仅展示海报

## 对照素材

- 第一期：`/Users/wangyi/Desktop/815/815.png`
- 第二期：`docs/public/article-assets/service/workshop-cover.png`
- 第三期：`/Users/wangyi/Desktop/815/912.png`
- 桌面端实现截图：`/private/tmp/workshop-selector-desktop.png`
- 移动端实现截图：`/private/tmp/workshop-selector-mobile.png`

素材与实现截图已在同一视觉比较输入中并排检查。海报内容、比例、裁切和色彩均与原始素材一致；桌面截图中的缩略图及主海报区域清晰，因此不需要额外局部截图。

## 功能与状态

- 默认 `aria-pressed` 状态为 `[false, true, false]`，右侧显示第二期海报及其公众号链接。
- 选择第一期后状态为 `[true, false, false]`，右侧切换为 `workshop-815.png`，链接为 `https://mp.weixin.qq.com/s/q7Bq2kEmsYlgI4pTZ59srw`。
- 选择第三期后状态为 `[false, false, true]`，右侧切换为 `workshop-912.png`，不渲染外链。
- 桌面端三个缩略图横向排列；移动端保持三列紧凑排列。
- 键盘焦点、悬停与选中态均有可见反馈。

## 视觉检查

- 字体：沿用页面现有中英文字体、字重与标签层级。
- 间距：缩略图组与报名按钮、海报及正文间距一致，未造成模块拥挤。
- 颜色：选中态使用现有薄荷绿主色与黑色边框体系。
- 图片：三张真实海报均保持 3:4 比例，无拉伸、错误裁切或占位图。
- 文案：第一期 08.15、第二期 08.29、第三期 09.12 清晰；第二期显示“当前”。

## 响应式与运行状态

- 桌面端无横向溢出。
- 移动端 DOM 实测可视宽度 416px，三列同排、按钮均可见，横向溢出为 0。
- 移动端截图画布受浏览器按域缩放影响，但 DOM 尺寸与溢出检查通过，不影响页面实际布局。
- 页面控制台仅有 Vite 开发连接和热更新 debug 日志，无 warning 或 error。

## 缺陷分级

- P0：0
- P1：0
- P2：0

首次实现对照检查未发现需要返工的视觉或交互问题。

final result: passed
