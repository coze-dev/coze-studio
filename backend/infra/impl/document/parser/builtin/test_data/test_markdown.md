# 1. 欢迎使用 Cmd Markdown 编辑阅读器
<!-- TOC -->

- [1. 欢迎使用 Cmd Markdown 编辑阅读器](#1-欢迎使用-cmd-markdown-编辑阅读器)
    - [1.1. markdown扩展需求](#11-markdown扩展需求)
        - [1.1.1. 一、各种流程图](#111-一各种流程图)
        - [1.1.2. [Windows/Mac/Linux 全平台客户端](https://www.zybuluo.com/cmd/)](#112-windowsmaclinux-全平台客户端httpswwwzybuluocomcmd)
    - [1.2. 什么是 Markdown](#12-什么是-markdown)
        - [1.2.1. 制作一份待办事宜 [Todo 列表](https://www.zybuluo.com/mdeditor?url=https://www.zybuluo.com/static/editor/md-help.markdown#13-待办事宜-todo-列表)](#121-制作一份待办事宜-todo-列表httpswwwzybuluocommdeditorurlhttpswwwzybuluocomstaticeditormd-helpmarkdown13-待办事宜-todo-列表)
        - [1.2.2. 书写一个质能守恒公式[^LaTeX]](#122-书写一个质能守恒公式^latex)
        - [1.2.3. 高亮一段代码[^code]](#123-高亮一段代码^code)
        - [1.2.4. 高效绘制 [流程图](https://www.zybuluo.com/mdeditor?url=https://www.zybuluo.com/static/editor/md-help.markdown#7-流程图)](#124-高效绘制-流程图httpswwwzybuluocommdeditorurlhttpswwwzybuluocomstaticeditormd-helpmarkdown7-流程图)
        - [1.2.5. 高效绘制 [序列图](https://www.zybuluo.com/mdeditor?url=https://www.zybuluo.com/static/editor/md-help.markdown#8-序列图)](#125-高效绘制-序列图httpswwwzybuluocommdeditorurlhttpswwwzybuluocomstaticeditormd-helpmarkdown8-序列图)
        - [1.2.6. 绘制表格](#126-绘制表格)
        - [1.2.7. 更详细语法说明](#127-更详细语法说明)
    - [1.3. 什么是 Cmd Markdown](#13-什么是-cmd-markdown)
        - [1.3.1. 实时同步预览](#131-实时同步预览)
        - [1.3.2. 编辑工具栏](#132-编辑工具栏)
        - [1.3.3. 编辑模式](#133-编辑模式)
        - [1.3.4. 实时的云端文稿](#134-实时的云端文稿)
        - [1.3.5. 离线模式](#135-离线模式)
        - [1.3.6. 管理工具栏](#136-管理工具栏)
        - [1.3.7. 阅读工具栏](#137-阅读工具栏)
        - [1.3.8. 阅读模式](#138-阅读模式)
        - [1.3.9. 标签、分类和搜索](#139-标签分类和搜索)
        - [1.3.10. 文稿发布和分享](#1310-文稿发布和分享)

<!-- /TOC -->

 [ ]  dddd
 [x]  xxxx
第一行
第二行
------
> 一个快速笔记工具，可生成网页快速分享。
## 1.1. markdown扩展需求
1. 目录
2. 表情
3. 粘贴截图
4. 流程图、时序图
5. 数学公式
6. 标签
7. 简单动画



### 1.1.1. 一、各种流程图
1. 时序图

```seq
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks!
```

2. 流程图

```flow
st=>start: Start
op=>operation: Your Operation
cond=>condition: Yes or No?
e=>end

st->op->cond
cond(yes)->e
cond(no)->op
```

3. 甘特图

```gantt
    title 项目开发流程
    section 项目确定
        需求分析       :a1, 2016-06-22, 3d
        可行性报告     :after a1, 5d
        概念验证       : 5d
    section 项目实施
        概要设计      :2016-07-05, 5d
        详细设计      :2016-07-08, 10d
        编码          :2016-07-15, 10d
        测试          :2016-07-22, 5d
    section 发布验收
        发布: 2d
        验收: 3d
```

4. Mermaid 流程图

```graphLR
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result one]
    C -->|Two| E[Result two]
```

5. Mermaid 序列图

```sequence
    Alice->John: Hello John, how are you?
    loop every minute
        John-->Alice: Great!
    end
```

我们理解您需要更便捷更高效的工具记录思想，整理笔记、知识，并将其中承载的价值传播给他人，**Cmd Markdown** 是我们给出的答案 —— 我们为记录思想和分享知识提供更专业的工具。 您可以使用 Cmd Markdown：

> * 整理知识，学习笔记

> * 发布日记，杂文，所见所想
> * 撰写发布技术文稿（代码支持）
> * 撰写发布学术论文（LaTeX 公式支持）

![cmd-markdown-logo](logo.png)

除了您现在看到的这个 Cmd Markdown 在线版本，您还可以前往以下网址下载：

### 1.1.2. [Windows/Mac/Linux 全平台客户端](https://www.zybuluo.com/cmd/)

> 请保留此份 Cmd Markdown 的欢迎稿兼使用说明，如需撰写新稿件，点击顶部工具栏右侧的 <i class="icon-file"></i> **新文稿** 或者使用快捷键 `Ctrl+Alt+N`。

------

## 1.2. 什么是 Markdown

Markdown 是一种方便记忆、书写的纯文本标记语言，用户可以使用这些标记符号以最小的输入代价生成极富表现力的文档：譬如您正在阅读的这份文档。它使用简单的符号标记不同的标题，分割不同的段落，**粗体** 或者 *斜体* 某些文字，更棒的是，它还可以

### 1.2.1. 制作一份待办事宜 [Todo 列表](https://www.zybuluo.com/mdeditor?url=https://www.zybuluo.com/static/editor/md-help.markdown#13-待办事宜-todo-列表)

- [ ] 支持以 PDF 格式导出文稿
- [ ] 改进 Cmd 渲染算法，使用局部渲染技术提高渲染效率
- [x] 新增 Todo 列表功能
- [x] 修复 LaTex 公式渲染问题
- [x] 新增 LaTex 公式编号功能

### 1.2.2. 书写一个质能守恒公式[^LaTeX]

$$E=mc^2$$

### 1.2.3. 高亮一段代码[^code]

```python
@requires_authorization
class SomeClass:
    pass

if __name__ == '__main__':
    # A comment
    print 'hello world'
```

### 1.2.4. 高效绘制 [流程图](https://www.zybuluo.com/mdeditor?url=https://www.zybuluo.com/static/editor/md-help.markdown#7-流程图)

```flow
st=>start: Start
op=>operation: Your Operation
cond=>condition: Yes or No?
e=>end

st->op->cond
cond(yes)->e
cond(no)->op
```

### 1.2.5. 高效绘制 [序列图](https://www.zybuluo.com/mdeditor?url=https://www.zybuluo.com/static/editor/md-help.markdown#8-序列图)

```seq
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks!
```

### 1.2.6. 绘制表格

| 项目        | 价格   |  数量  |
| --------   | -----:  | :----:  |
| 计算机     | \$1600 |   5     |
| 手机        |   \$12   |   12   |
| 管线        |    \$1    |  234  |

### 1.2.7. 更详细语法说明

想要查看更详细的语法说明，可以参考我们准备的 [Cmd Markdown 简明语法手册][1]，进阶用户可以参考 [Cmd Markdown 高阶语法手册][2] 了解更多高级功能。

总而言之，不同于其它 *所见即所得* 的编辑器：你只需使用键盘专注于书写文本内容，就可以生成印刷级的排版格式，省却在键盘和工具栏之间来回切换，调整内容和格式的麻烦。**Markdown 在流畅的书写和印刷级的阅读体验之间找到了平衡。** 目前它已经成为世界上最大的技术分享网站 GitHub 和 技术问答网站 StackOverFlow 的御用书写格式。

---

## 1.3. 什么是 Cmd Markdown

您可以使用很多工具书写 Markdown，但是 Cmd Markdown 是这个星球上我们已知的、最好的 Markdown 工具——没有之一 ：）因为深信文字的力量，所以我们和你一样，对流畅书写，分享思想和知识，以及阅读体验有极致的追求，我们把对于这些诉求的回应整合在 Cmd Markdown，并且一次，两次，三次，乃至无数次地提升这个工具的体验，最终将它演化成一个 **编辑/发布/阅读** Markdown 的在线平台——您可以在任何地方，任何系统/设备上管理这里的文字。

### 1.3.1. 实时同步预览

我们将 Cmd Markdown 的主界面一分为二，左边为**编辑区**，右边为**预览区**，在编辑区的操作会实时地渲染到预览区方便查看最终的版面效果，并且如果你在其中一个区拖动滚动条，我们有一个巧妙的算法把另一个区的滚动条同步到等价的位置，超酷！

### 1.3.2. 编辑工具栏

也许您还是一个 Markdown 语法的新手，在您完全熟悉它之前，我们在 **编辑区** 的顶部放置了一个如下图所示的工具栏，您可以使用鼠标在工具栏上调整格式，不过我们仍旧鼓励你使用键盘标记格式，提高书写的流畅度。

![tool-editor](toolbar-editor.png)

### 1.3.3. 编辑模式

完全心无旁骛的方式编辑文字：点击 **编辑工具栏** 最右测的拉伸按钮或者按下 `Ctrl + M`，将 Cmd Markdown 切换到独立的编辑模式，这是一个极度简洁的写作环境，所有可能会引起分心的元素都已经被挪除，超清爽！

### 1.3.4. 实时的云端文稿

为了保障数据安全，Cmd Markdown 会将您每一次击键的内容保存至云端，同时在 **编辑工具栏** 的最右侧提示 `已保存` 的字样。无需担心浏览器崩溃，机器掉电或者地震，海啸——在编辑的过程中随时关闭浏览器或者机器，下一次回到 Cmd Markdown 的时候继续写作。

### 1.3.5. 离线模式

在网络环境不稳定的情况下记录文字一样很安全！在您写作的时候，如果电脑突然失去网络连接，Cmd Markdown 会智能切换至离线模式，将您后续键入的文字保存在本地，直到网络恢复再将他们传送至云端，即使在网络恢复前关闭浏览器或者电脑，一样没有问题，等到下次开启 Cmd Markdown 的时候，她会提醒您将离线保存的文字传送至云端。简而言之，我们尽最大的努力保障您文字的安全。

### 1.3.6. 管理工具栏

为了便于管理您的文稿，在 **预览区** 的顶部放置了如下所示的 **管理工具栏**：

通过管理工具栏可以：

<i class="icon-share"></i> 发布：将当前的文稿生成固定链接，在网络上发布，分享
<i class="icon-file"></i> 新建：开始撰写一篇新的文稿
<i class="icon-trash"></i> 删除：删除当前的文稿
<i class="icon-cloud"></i> 导出：将当前的文稿转化为 Markdown 文本或者 Html 格式，并导出到本地
<i class="icon-reorder"></i> 列表：所有新增和过往的文稿都可以在这里查看、操作
<i class="icon-pencil"></i> 模式：切换 普通/Vim/Emacs 编辑模式

### 1.3.7. 阅读工具栏

通过 **预览区** 右上角的 **阅读工具栏**，可以查看当前文稿的目录并增强阅读体验。

工具栏上的五个图标依次为：

<i class="icon-list"></i> 目录：快速导航当前文稿的目录结构以跳转到感兴趣的段落
<i class="icon-chevron-sign-left"></i> 视图：互换左边编辑区和右边预览区的位置
<i class="icon-adjust"></i> 主题：内置了黑白两种模式的主题，试试 **黑色主题**，超炫！
<i class="icon-desktop"></i> 阅读：心无旁骛的阅读模式提供超一流的阅读体验
<i class="icon-fullscreen"></i> 全屏：简洁，简洁，再简洁，一个完全沉浸式的写作和阅读环境

### 1.3.8. 阅读模式

在 **阅读工具栏** 点击 <i class="icon-desktop"></i> 或者按下 `Ctrl+Alt+M` 随即进入独立的阅读模式界面，我们在版面渲染上的每一个细节：字体，字号，行间距，前背景色都倾注了大量的时间，努力提升阅读的体验和品质。

### 1.3.9. 标签、分类和搜索

在编辑区任意行首位置输入以下格式的文字可以标签当前文档：

标签： 未分类

标签以后的文稿在【文件列表】（Ctrl+Alt+F）里会按照标签分类，用户可以同时使用键盘或者鼠标浏览查看，或者在【文件列表】的搜索文本框内搜索标题关键字过滤文稿，如下图所示：

![file-list](file-list.png)

### 1.3.10. 文稿发布和分享

在您使用 Cmd Markdown 记录，创作，整理，阅读文稿的同时，我们不仅希望它是一个有力的工具，更希望您的思想和知识通过这个平台，连同优质的阅读体验，将他们分享给有相同志趣的人，进而鼓励更多的人来到这里记录分享他们的思想和知识，尝试点击 <i class="icon-share"></i> (Ctrl+Alt+P) 发布这份文档给好友吧！

------

再一次感谢您花费时间阅读这份欢迎稿，点击 <i class="icon-file"></i> (Ctrl+Alt+N) 开始撰写新的文稿吧！祝您在这里记录、阅读、分享愉快！

作者 [@ghosert][3]     
2015 年 06月 15日    

[^LaTeX]: 支持 **LaTeX** 编辑显示支持，例如：$\sum_{i=1}^n a_i=0$， 访问 [MathJax][4] 参考更多使用方法。

[^code]: 代码高亮功能支持包括 Java, Python, JavaScript 在内的，**四十一**种主流编程语言。

[1]: https://www.zybuluo.com/mdeditor?url=https://www.zybuluo.com/static/editor/md-help.markdown
[2]: https://www.zybuluo.com/mdeditor?url=https://www.zybuluo.com/static/editor/md-help.markdown#cmd-markdown-高阶语法手册
[3]: http://weibo.com/ghosert
[4]: http://meta.math.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference

