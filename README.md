# Ozon 商品视觉设计 Skill

面向 Ozon 商品主图、卖点图、尺寸图、场景图和详情套图的技能。支持独立的**原图文字翻译与替换**：识别中文、英文等源语言，翻译为俄语，并保留原图尺寸、商品外观和视觉风格。默认中文沟通、俄语上图。

它提供设计流程与提示词，不自带 OCR、翻译/生图模型、付费 API 或设计软件连接。实际图片翻译需要图片理解或 OCR、翻译模型及图像编辑/排版工具。仅有文字模型时只能交付译文或替换方案。

## 安装

需要 Node.js 20 或更新版本。包无第三方运行依赖，也没有 postinstall 脚本。npm 安装提供命令，随后执行 `install` 把技能写入 Codex。

从 GitHub 安装（推荐）：

```bash
npm install --global github:kyle061/ozon-product-design
ozon-product-design install
```

或者在当前项目安装，再运行安装命令：

```bash
npm install github:kyle061/ozon-product-design
npx ozon-product-design install
```

从本地源码安装：

```bash
npm install --global .
ozon-product-design install
```

从 npm 压缩包安装：

```bash
npm install --global ./ozon-product-design-1.1.0.tgz
ozon-product-design install
```

仓库地址：[kyle061/ozon-product-design](https://github.com/kyle061/ozon-product-design)。目前通过 GitHub 分发，尚未发布到 npmjs.com，请使用上面的完整 GitHub 安装命令。

默认技能目录为 `$CODEX_HOME/skills/ozon-product-design`；未设置 `CODEX_HOME` 时为 `~/.codex/skills/ozon-product-design`。也可指定目录：

```bash
ozon-product-design install --codex-home /path/to/codex
ozon-product-design path
ozon-product-design install --dry-run
```

已有同名技能时停止且不改动。需要更新时运行：

```bash
ozon-product-design install --force
```

旧技能完整保留在 Codex 的 `skill-backups` 目录，命令会输出具体位置。备份位于 `skills` 之外，避免被重复发现。此操作不会自动合并自定义内容。若安装中断留下安装锁，确认没有安装进程后再移除命令指出的空锁目录。

## 使用

安装后在 Codex 新任务中输入；若未发现技能，重新打开 Codex 再试：

```text
使用 $ozon-product-design，基于我上传的商品实拍与参数，
制作 1 张 Ozon 主图和 5 张补充图，中文沟通、俄语上图。
保留商品颜色、结构、Logo 和配件数量，先使用简洁现代风格。
```

也可以只做单张、改背景、俄语化或策划提示词：

```text
使用 $ozon-product-design，把这张中文商品图改成俄语，保留商品与真实包装。
使用 $ozon-product-design，把这张英文商品图的标题、说明和尺寸标签换成俄语，保留原图布局和尺寸，直接交付改好的图片。
使用 $ozon-product-design，批量把这些商品图的文字翻译为俄语，每张原图对应一张结果，统一术语但分别核对 SKU 参数。
使用 $ozon-product-design，只提取并翻译图中文字，输出原文和俄语对照，暂时不要修改图片。
使用 $ozon-product-design，为这款商品整理主图和尺寸图的提示词，暂时不要生成图片。
```

建议提供当前 SKU 实拍、真实参数、包含物和已知平台要求。缺少尺寸、材质、兼容型号等数据时，技能不会凭空补写。

## 原图文字翻译

“把图片翻译为俄语”默认交付换字后的图片，而不是只给译文。技能会逐区读取标题、说明、表格、尺寸标签和脚注，核对译文后局部清字、俄语排版，再查看实际导出图片。俄语较长时局部换行或微调文字框，不自动换画布或扩成多张套图。

外加文字可翻译替换；品牌、Logo、型号、条码和真实商品/包装印字默认保留。用户明确要求包装本地化时可制作设计稿，交付会区分拟议设计与当前实物。模糊文字不猜读，不把未知参数补成确定值；未完成区域会明确标注。

完整流程、替换范围、语言例子和检查要求见 [图片文字翻译与原位替换](references/image-translation.md)。

## 在 ERP 中复用

后端可加载 `SKILL.md`，处理原图翻译时再加载 `references/image-translation.md` 及其中相关规范，传入图片、商品资料和用户要求。该文件也提供可选的逐区域 JSON 结果格式，区分已完成、部分完成、仅译文和受阻状态。

ERP 仍需连接图片理解/OCR、翻译模型、图像编辑与存储服务。安装 npm 包只提供技能文件和安装命令，不会自动注册 ERP API 或提供生图能力。部署时建议固定仓库提交或包版本，并保留原始素材。

## 平台规则

1200 × 1600 px 的画布和 1 + 5 张套图属于设计预设，**不是 Ozon 官方全类目标准**。技能要求根据当前类目和图片位置核对官方文档/后台要求；未核验时会说明。创建时官方文档暂时无法访问，详见 [平台核验说明](references/platform-and-export.md)。

## 开发与验证

```bash
npm test
npm pack
```

测试涵盖首次安装、内容完整性、已有文件保护、更新备份、预演、错误参数、符号链接与并发安装锁。`npm pack` 会先运行测试。

`SKILL.md` 是入口，`references/` 存放按需读取的设计规范与提示词，`references/image-translation.md` 是原图翻译专项流程，`agents/openai.yaml` 是技能展示信息，`bin/cli.mjs` 是安装器。安装测试校验资源随包安装的完整性，不代表真实 OCR、翻译模型和图片编辑服务已完成端到端测试。

当前包标记为 `UNLICENSED`，尚未授予开源许可。
