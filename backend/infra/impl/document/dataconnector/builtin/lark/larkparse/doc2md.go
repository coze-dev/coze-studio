package larkparse

import (
	"fmt"
	"reflect"
	"strings"

	larkdocx "github.com/larksuite/oapi-sdk-go/v3/service/docx/v1"
)

type feishuDocxParser struct {
	blockMap      map[string]*larkdocx.Block
	imageTokenMap map[string]string
}

func FeishuDocx2MD(documentID string, blocks []*larkdocx.Block, imageTokenMap map[string]string) string {
	p := feishuDocxParser{
		blockMap:      make(map[string]*larkdocx.Block),
		imageTokenMap: imageTokenMap,
	}
	for _, block := range blocks {
		if block.BlockId == nil {
			continue
		}
		p.blockMap[*block.BlockId] = block
	}
	if p.blockMap[documentID] == nil {
		return ""
	}

	return p.parseFeishuDocxBlock(p.blockMap[documentID], 0)
}

func (p *feishuDocxParser) parseFeishuDocxBlock(block *larkdocx.Block, tapCount int) string {
	buf := new(strings.Builder)
	buf.WriteString(strings.Repeat("\t", tapCount))
	switch *block.BlockType {
	case int(FeishuDocxBlockTypePage):
		buf.WriteString(p.parseFeishuDocxBlockPage(block))
	case int(FeishuDocxBlockTypeText):
		buf.WriteString(p.parseFeishuDocxBlockText(block.Text))
	case int(FeishuDocxBlockTypeHeading1):
		buf.WriteString(p.parseFeishuDocxBlockHeading(block, 1))
	case int(FeishuDocxBlockTypeHeading2):
		buf.WriteString(p.parseFeishuDocxBlockHeading(block, 2))
	case int(FeishuDocxBlockTypeHeading3):
		buf.WriteString(p.parseFeishuDocxBlockHeading(block, 3))
	case int(FeishuDocxBlockTypeHeading4):
		buf.WriteString(p.parseFeishuDocxBlockHeading(block, 4))
	case int(FeishuDocxBlockTypeHeading5):
		buf.WriteString(p.parseFeishuDocxBlockHeading(block, 5))
	case int(FeishuDocxBlockTypeHeading6):
		buf.WriteString(p.parseFeishuDocxBlockHeading(block, 6))
	case int(FeishuDocxBlockTypeHeading7):
		buf.WriteString(p.parseFeishuDocxBlockHeading(block, 7))
	case int(FeishuDocxBlockTypeHeading8):
		buf.WriteString(p.parseFeishuDocxBlockHeading(block, 8))
	case int(FeishuDocxBlockTypeHeading9):
		buf.WriteString(p.parseFeishuDocxBlockHeading(block, 9))
	case int(FeishuDocxBlockTypeBullet):
		buf.WriteString(p.parseFeishuDocxBlockBullet(block, tapCount))
	case int(FeishuDocxBlockTypeOrdered):
		buf.WriteString(p.parseFeishuDocxBlockOrdered(block, tapCount))
	case int(FeishuDocxBlockTypeCode):
		if block.Code != nil && block.Code.Style != nil && block.Code.Style.Language != nil {
			buf.WriteString("```" + FeishuDocxCodeLang2MdStr[FeishuDocxCodeLanguage(*block.Code.Style.Language)] + "\n")
			buf.WriteString(strings.TrimSpace(p.parseFeishuDocxBlockText(block.Code)))
			buf.WriteString("\n```\n")
		}
	case int(FeishuDocxBlockTypeQuote):
		buf.WriteString("> ")
		buf.WriteString(p.parseFeishuDocxBlockText(block.Quote))
	case int(FeishuDocxBlockTypeEquation):
		buf.WriteString("$$\n")
		buf.WriteString(p.parseFeishuDocxBlockText(block.Equation))
		buf.WriteString("\n$$\n")
	case int(FeishuDocxBlockTypeTodo):
		if block.Todo != nil && block.Todo.Style != nil {
			if *block.Todo.Style.Done {
				buf.WriteString("- [x] ")
			} else {
				buf.WriteString("- [ ] ")
			}
			buf.WriteString(p.parseFeishuDocxBlockText(block.Todo))
		}
	case int(FeishuDocxBlockTypeDivider):
		buf.WriteString("---\n")
	case int(FeishuDocxBlockTypeGrid):
		buf.WriteString(p.parseFeishuDocxBlockGrid(block, tapCount))
	case int(FeishuDocxBlockTypeImage):
		buf.WriteString(p.parseFeishuDocxBlockImage(block.Image))
	case int(FeishuDocxBlockTypeTable):
		buf.WriteString(p.ParseDocxBlockTable(block.Table))
	case int(FeishuDocxBlockTypeTableCell):
		buf.WriteString(p.parseFeishuDocxBlockTableCell(block))
	case int(FeishuDocxBlockTypeQuoteContainer):
		buf.WriteString(p.parseFeishuDocxBlockQuoteContainer(block))
	default:
	}
	return buf.String()
}

func (p *feishuDocxParser) parseFeishuDocxBlockPage(b *larkdocx.Block) string {
	if len(b.Children) == 0 {
		return ""
	}
	buf := new(strings.Builder)

	buf.WriteString("# ")
	buf.WriteString(p.parseFeishuDocxBlockText(b.Page))
	buf.WriteString("\n")

	for _, childId := range b.Children {
		childBlock := p.blockMap[childId]
		buf.WriteString(p.parseFeishuDocxBlock(childBlock, 0))
		buf.WriteString("\n")
	}

	return buf.String()
}

func (p *feishuDocxParser) parseFeishuDocxBlockHeading(b *larkdocx.Block, headingLevel int) string {
	buf := new(strings.Builder)

	buf.WriteString(strings.Repeat("#", headingLevel))
	buf.WriteString(" ")

	headingText := reflect.ValueOf(b).Elem().FieldByName(fmt.Sprintf("Heading%d", headingLevel))
	if text, ok := headingText.Interface().(*larkdocx.Text); ok {
		buf.WriteString(p.parseFeishuDocxBlockText(text))
	}

	for _, childId := range b.Children {
		childBlock := p.blockMap[childId]
		buf.WriteString(p.parseFeishuDocxBlock(childBlock, 0))
	}

	return buf.String()
}

func (p *feishuDocxParser) parseFeishuDocxBlockBullet(b *larkdocx.Block, tapCount int) string {
	buf := new(strings.Builder)

	buf.WriteString("- ")
	buf.WriteString(p.parseFeishuDocxBlockText(b.Bullet))

	for _, childId := range b.Children {
		childBlock := p.blockMap[childId]
		buf.WriteString(p.parseFeishuDocxBlock(childBlock, tapCount+1))
	}

	return buf.String()
}

func (p *feishuDocxParser) parseFeishuDocxBlockOrdered(b *larkdocx.Block, tapCount int) string {
	buf := new(strings.Builder)

	parent := p.blockMap[*b.ParentId]
	var order int
	for idx, childBlockID := range parent.Children {
		if *p.blockMap[childBlockID].BlockType != int(FeishuDocxBlockTypeOrdered) {
			continue
		}
		order = idx + 1
		if childBlockID == *b.BlockId {
			break
		}
	}

	buf.WriteString(fmt.Sprintf("%d. ", order))
	buf.WriteString(p.parseFeishuDocxBlockText(b.Ordered))

	for _, childId := range b.Children {
		childBlock := p.blockMap[childId]
		buf.WriteString(p.parseFeishuDocxBlock(childBlock, tapCount+1))
	}

	return buf.String()
}

func (p *feishuDocxParser) parseFeishuDocxBlockGrid(b *larkdocx.Block, tapCount int) string {
	buf := new(strings.Builder)

	for _, child := range b.Children {
		columnBlock := p.blockMap[child]
		for _, childBlock := range columnBlock.Children {
			block := p.blockMap[childBlock]
			buf.WriteString(p.parseFeishuDocxBlock(block, tapCount))
		}
	}

	return buf.String()
}

func (p *feishuDocxParser) parseFeishuDocxBlockImage(img *larkdocx.Image) string {
	buf := new(strings.Builder)
	tosKey, ok := p.imageTokenMap[*img.Token]
	if !ok {
		return ""
	}
	buf.WriteString(fmt.Sprintf(FeishuImageFormatURLForTos, "", tosKey))
	buf.WriteString("\n")
	return buf.String()
}

func (p *feishuDocxParser) ParseDocxBlockTable(t *larkdocx.Table) string {
	// - First row as header
	// - Ignore cell merging
	var rows [][]string
	for i, blockId := range t.Cells {
		block := p.blockMap[blockId]
		cellContent := p.parseFeishuDocxBlock(block, 0)
		cellContent = strings.ReplaceAll(cellContent, "\n", "")
		rowIndex := i / *t.Property.ColumnSize
		if len(rows) < int(rowIndex)+1 {
			rows = append(rows, []string{})
		}
		rows[rowIndex] = append(rows[rowIndex], cellContent)
	}
	buf := new(strings.Builder)
	for i, row := range rows {
		buf.WriteString("| ")
		buf.WriteString(strings.Join(row, " | "))
		buf.WriteString(" |\n")
		if i == 0 {
			buf.WriteString(strings.Repeat("| --- ", *t.Property.ColumnSize))
			buf.WriteString("|\n")
		}
	}
	return buf.String()
}

func (p *feishuDocxParser) parseFeishuDocxBlockTableCell(b *larkdocx.Block) string {
	buf := new(strings.Builder)

	for _, child := range b.Children {
		block := p.blockMap[child]
		content := p.parseFeishuDocxBlock(block, 0)
		buf.WriteString(content)
	}

	return buf.String()
}

func (p *feishuDocxParser) parseFeishuDocxBlockQuoteContainer(b *larkdocx.Block) string {
	buf := new(strings.Builder)

	for _, child := range b.Children {
		block := p.blockMap[child]
		buf.WriteString("> ")
		buf.WriteString(p.parseFeishuDocxBlock(block, 0))
	}

	return buf.String()
}

func (p *feishuDocxParser) parseFeishuDocxBlockText(b *larkdocx.Text) string {
	buf := new(strings.Builder)
	numElem := len(b.Elements)
	for _, e := range b.Elements {
		inline := numElem > 1
		buf.WriteString(p.parseFeishuDocxTextElement(e, inline))
	}
	buf.WriteString("\n")
	return buf.String()
}

func (p *feishuDocxParser) parseFeishuDocxTextElement(e *larkdocx.TextElement, inline bool) string {
	buf := new(strings.Builder)
	if e.TextRun != nil {
		buf.WriteString(p.parseFeishuDocxTextElementTextRun(e.TextRun))
	}
	if e.MentionUser != nil && e.MentionUser.UserId != nil {
		buf.WriteString(*e.MentionUser.UserId)
	}
	if e.MentionDoc != nil && e.MentionDoc.Title != nil && e.MentionDoc.Url != nil {
		buf.WriteString(
			fmt.Sprintf("[%s](%s)", *e.MentionDoc.Title, *e.MentionDoc.Url))
	}
	if e.Equation != nil && e.Equation.Content != nil {
		symbol := "$$"
		if inline {
			symbol = "$"
		}
		buf.WriteString(symbol + strings.TrimSuffix(*e.Equation.Content, "\n") + symbol)
	}
	return buf.String()
}

func (p *feishuDocxParser) parseFeishuDocxTextElementTextRun(tr *larkdocx.TextRun) string {
	buf := new(strings.Builder)
	postWrite := ""
	if style := tr.TextElementStyle; style != nil {
		if style.Bold != nil && *style.Bold { // 粗体
			buf.WriteString("**")
			postWrite = "**"
		} else if style.Italic != nil && *style.Italic { // 斜体
			buf.WriteString("*")
			postWrite = "*"
		} else if style.Strikethrough != nil && *style.Strikethrough { // 删除线
			buf.WriteString("~~")
			postWrite = "~~"
		} else if style.Underline != nil && *style.Underline { // 下划线
			buf.WriteString("<u>")
			postWrite = "</u>"
		} else if style.InlineCode != nil && *style.InlineCode {
			buf.WriteString("`")
			postWrite = "`"
		} else if link := style.Link; link != nil && link.Url != nil {
			buf.WriteString("[")
			postWrite = fmt.Sprintf("](%s)", *link.Url)
		}
	}
	if tr.Content != nil {
		buf.WriteString(*tr.Content)
	}
	buf.WriteString(postWrite)
	return buf.String()
}
func GetExcelTitle(columnNumber int32) string {
	var ans []byte
	for columnNumber > 0 {
		a0 := (columnNumber-1)%26 + 1
		ans = append(ans, 'A'+byte(a0-1))
		columnNumber = (columnNumber - a0) / 26
	}
	for i, n := 0, len(ans); i < n/2; i++ {
		ans[i], ans[n-1-i] = ans[n-1-i], ans[i]
	}
	return string(ans)
}
