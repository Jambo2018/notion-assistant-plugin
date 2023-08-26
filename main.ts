import { Editor, MarkdownView, Plugin } from "obsidian";
import { CommandMenu } from "src/command-menu";
import { CMD_MAP, CODE_LAN, CONTENT_MAP, ICON_MAP, TEXT_MAP } from "src/constants";
import { generateBookMark } from "src/link-bookmark";
import { InsertLinkModal } from "src/link-input-modal";
import { SelectionBtns } from "src/selection-menu";
import { linkParse, loadIcons } from "src/util";

export default class TypingAsstPlugin extends Plugin {
	commands: CommandMenu;
	btns: SelectionBtns;
	linkModal: InsertLinkModal;
	scrollArea?: Element;
	async onload() {

		// import svg to Obsidian-Icon 
		loadIcons(ICON_MAP)

		const onSelectionAction = async (
			content: string,
			isHeading: boolean
		) => {
			if (isHeading) {
				const view =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!view?.editor) return;
				const editor = view.editor;
				const cursor = editor.getCursor();
				const lineContent = editor.getLine(cursor.line);
				editor.setLine(cursor.line, lineContent.replace(/^.*?\s/, ""));
			}
			(this.app as any).commands.executeCommandById(content);
			this.btns.hide();
		};

		const formatUnderline = (
			editor: Editor,
			line: number,
			left: number,
			right: number
		) => {
			// range of selected content
			const selectedRange = [
				{ line, ch: left },
				{ line, ch: right },
			] as const;
			let selection = editor.getRange(...selectedRange);
			if (/((?!u>).*?)((<u>(?!u>).*<\/u>)+)((?!u>).*?)/.test(selection)) {
				selection = selection.replace(/<\/?u>/g, "");
			}
			editor.replaceRange(`<u>${selection}</u>`, ...selectedRange);
			const content = editor.getLine(line);
			const arr = content.split(/<\/?u>/g);
			let joinContent = "";
			arr.forEach((item, index) => {
				if (index % 2 === 0) {
					joinContent += item ?? "";
					if (index < arr.length - 1) {
						joinContent += "<u>";
					}
				} else {
					joinContent += (item ?? "") + "</u>";
				}
			});
			joinContent = joinContent.replace(/(<\/u><u>)|(<u><\/u>)/g, "");
			editor.setLine(line, joinContent);
		};

		const onMenuClick = async (content: string) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				const cursor = view.editor.getCursor();
				const editLine = view.editor.getLine(cursor.line);

				if (content === "bookmark") {
					view.editor.blur();
					this.linkModal.open();
				} else if (content === "code") {
					(this.app as any).commands.executeCommandById(CMD_MAP["code"]);
				} else {
					if (editLine.length > 1) {
						view.editor.replaceRange(
							`\n${content}`,
							{ line: cursor.line, ch: cursor.ch - 1 },
							cursor
						);
						view.editor.setCursor({
							line: cursor.line + 1,
							ch: content.length,
						});
					} else {
						view.editor.setLine(cursor.line, content);
						view.editor.setCursor({
							line: cursor.line,
							ch: content.length,
						});
					}
					view.editor.focus();
				}
			}
		};

		const onLinkSubmit = async (url: string) => {
			const parsedResult = await linkParse(url);
			let codeStr = "```" + CODE_LAN + "\n";
			for (const key in parsedResult) {
				codeStr += key + ":" + (parsedResult as any)[key] + "\n";
			}
			codeStr += "```\n";
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				const cursor = view.editor.getCursor();
				const editLine = view.editor.getLine(cursor.line);
				if (editLine.length > 0) {
					view.editor.replaceRange(
						`\n${codeStr}`,
						{ line: cursor.line, ch: cursor.ch - 1 },
						cursor
					);
					view.editor.setCursor({
						line: cursor.line + 1,
						ch: codeStr.length,
					});
				} else {
					view.editor.setLine(cursor.line, codeStr);
					view.editor.setCursor({
						line: cursor.line,
						ch: codeStr.length,
					});
				}
			}
		};

		const handleSelection = () => {
			const selection = document.getSelection()?.toString();
			if (selection) {
				const view =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!view?.editor) return;
				const editor = view.editor;
				const cursor = editor.getCursor();
				const lineContent = editor.getLine(cursor.line);

				let lineStyle = "Text";
				for (const cmd in CONTENT_MAP) {
					if (cmd === "text") {
						continue;
					} else if (lineContent.startsWith((CONTENT_MAP as any)[cmd])) {
						lineStyle = (TEXT_MAP as any)[cmd];
						break;
					} else if (/^[\d]+\.\s/.test(lineContent)) {
						lineStyle = TEXT_MAP["numberList"];
						break;
					}
				}
				this.btns.display(lineStyle);
			}
		};

		this.linkModal = new InsertLinkModal(this.app, onLinkSubmit);

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "underline",
			name: "Underline/Cancel underline",
			editorCallback: (editor: Editor) => {
				const from = editor.getCursor("from");
				const to = editor.getCursor("to");
				for (let i = from.line; i <= to.line; i++) {
					const len = editor.getLine(i).length;
					if (from.line === to.line) {
						formatUnderline(editor, i, from.ch, to.ch);
					} else if (i === from.line && i < to.line) {
						formatUnderline(editor, i, from.ch, len);
					} else if (i > from.line && i < to.line) {
						formatUnderline(editor, i, 0, len);
					} else if (i > from.line && i === to.line) {
						formatUnderline(editor, i, 0, to.ch);
					}
				}
			},
		});

		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			if (this.commands.isVisible()) {
				this.commands.hide();
			}
			const selection = document.getSelection()?.toString();
			if (!selection && this.btns.isVisible()) {
				this.btns.hide();
			}
		});

		this.registerDomEvent(document, "mouseup", (evt: MouseEvent) => {
			handleSelection();
		});

		this.registerDomEvent(document, "keydown", (evt: KeyboardEvent) => {
			if (this.commands.isVisible()) {
				const { key } = evt;
				if (
					key !== "ArrowUp" &&
					key !== "ArrowDown" &&
					key !== "ArrowLeft" &&
					key !== "ArrowRight"
				) {
					this.commands.hide();
					const view =
						this.app.workspace.getActiveViewOfType(MarkdownView);
					if (view) {
						view.editor.focus();
					}
				}
			}
			if (this.btns.isVisible()) {
				this.btns.hide();
			}
		});
		const scrollEvent = () => {
			if (this.btns.isVisible()) {
				handleSelection();
			}
		}
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				if (this.scrollArea) {
					this.scrollArea.removeEventListener("scroll", scrollEvent);
				}
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!view) return;
				this.scrollArea = view.containerEl.querySelector(".cm-scroller") ?? undefined;
				console.log('view=====>',view)
				const appHeader = document.querySelector(".titlebar");
				const viewHeader = view.containerEl.querySelector(".view-header");
				const headerHeight =
					(appHeader?.clientHeight ?? 0) +
					(viewHeader?.clientHeight ?? 0);

				if (!this.scrollArea) return;
				const scrollArea = this.scrollArea;
				if (this.commands) {
					this.commands.clear()
				}
				this.commands = new CommandMenu({
					scrollArea,
					onMenu: onMenuClick,
				});
				if (this.btns) {
					this.btns.clear()
				}
				this.btns = new SelectionBtns({
					scrollArea,
					headerHeight,
					onAction: onSelectionAction,
				});
				scrollArea?.addEventListener("scroll", scrollEvent);
			}));

		this.registerDomEvent(document, "input", (evt: InputEvent) => {
			if (this.linkModal.isOpen) return;
			if (evt && evt.data === "/") {
				const view =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!view) return;
				const cursor = view.editor.getCursor();
				const editLine = view.editor.getLine(cursor.line);
				if (editLine.replace(/[\s]*$/, "").length <= cursor.ch) {
					this.commands.display();
				} else {
					if (this.commands.isVisible()) {
						this.commands.hide();
					}
				}
			}
		});

		this.registerMarkdownCodeBlockProcessor(CODE_LAN, (source, el, ctx) => {
			const bookmark = generateBookMark(source);
			el?.appendChild(bookmark);
		});
	}

	onunload() { }
}
