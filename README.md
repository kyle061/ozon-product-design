# Ozon 商品视觉设计 Skill

面向 Ozon 商品主图、卖点图、尺寸图、场景图和详情套图的 Codex 技能。默认中文沟通、俄语上图，重点是商品保真、俄语本地化、移动端可读性与套图风格统一。

它提供设计流程与提示词，不自带生图模型、付费 API 或设计软件连接。实际生成图片需要当前 Codex 环境有可用的图像工具。

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
npm install --global ./ozon-product-design-1.0.0.tgz
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
使用 $ozon-product-design，为这款商品整理主图和尺寸图的提示词，暂时不要生成图片。
```

建议提供当前 SKU 实拍、真实参数、包含物和已知平台要求。缺少尺寸、材质、兼容型号等数据时，技能不会凭空补写。

## 平台规则

1200 × 1600 px 的画布和 1 + 5 张套图属于设计预设，**不是 Ozon 官方全类目标准**。技能要求根据当前类目和图片位置核对官方文档/后台要求；未核验时会说明。创建时官方文档暂时无法访问，详见 [平台核验说明](references/platform-and-export.md)。

## 开发与验证

```bash
npm test
npm pack
```

测试涵盖首次安装、内容完整性、已有文件保护、更新备份、预演、错误参数、符号链接与并发安装锁。`npm pack` 会先运行测试。

`SKILL.md` 是入口，`references/` 存放按需读取的设计规范与提示词，`agents/openai.yaml` 是技能展示信息，`bin/cli.mjs` 是安装器。

当前包标记为 `UNLICENSED`，尚未授予开源许可。
