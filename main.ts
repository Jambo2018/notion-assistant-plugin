import { MarkdownView, Plugin } from "obsidian";
import { CommandMenu } from "src/components/command-menu";
import {
	CMD_CONFIG,
	CODE_LAN,
	CONTENT_MAP,
	HEADING_MENU,
	ICON_MAP,
	TEXT_MAP,
} from "src/constants";
import { InsertLinkModal } from "src/components/link-input-modal";
import { SelectionBtns } from "src/components/selection-menu";
import { type ExamplePluginSettings, ExampleSettingTab, CMD_TYPE } from "src/components/plugin-setting";
import { linkParse, loadIcons, loadCommands, generateBookMark } from "src/util/util";

export default class TypingAsstPlugin extends Plugin {
	commands: CommandMenu;
	btns: SelectionBtns;
	linkModal: InsertLinkModal;
	scrollArea?: Element;
	settings: ExamplePluginSettings;

	async loadSettings() {
		const initialMenu = HEADING_MENU.filter(item => item === 'insert-note-callout' || !item.includes("callout"));
		this.settings = Object.assign({}, { showPlaceholder: true, cmdsSorting: initialMenu }, await this.loadData());
		// console.log('commands======>', this.app.commands.commands)
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload() {

		await this.loadSettings();

		loadCommands.call(this)

		this.addSettingTab(new ExampleSettingTab(this.app, this));

		// import svg to Obsidian-Icon
		loadIcons(ICON_MAP);

		const onSelectionAction = async (
			content: string,
			isHeading: boolean
		) => {
			const view =
				this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view?.editor) return;
			if (isHeading) {
				const editor = view.editor;
				const cursor = editor.getCursor();
				const lineContent = editor.getLine(cursor.line);
				editor.setLine(cursor.line, lineContent.replace(/^.*?\s/, ""));
			}
			(this.app as any).commands.executeCommandById((CMD_CONFIG as any)[content].cmd);
			if (content === "set-link") {
				view.editor.focus();
			}
			this.btns.hide();
		};


		const onMenuClick = async (content: CMD_TYPE) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				if (content === "bookmark") {
					view.editor.blur();
					this.linkModal.open();
				} else {
					(this.app as any).commands.executeCommandById(
						CMD_CONFIG[content].cmd
					);
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
						// } else if (/^\> \[!/.test(lineContent)) {
						// 	lineStyle = TEXT_MAP["callout"];
						// 	break;
					} else if (/^\`\`\`/.test(lineContent)) {
						lineStyle = TEXT_MAP["code"];
						break;
					} else if (
						lineContent.startsWith((CONTENT_MAP as any)[cmd])
					) {
						lineStyle = (TEXT_MAP as any)[cmd];
						break;
					} else if (/^[\d]+\.\s/.test(lineContent)) {
						lineStyle = TEXT_MAP["numberList"];
						break;
					}
				}
				this.btns?.display(lineStyle);
			}
		};

		this.linkModal = new InsertLinkModal(this.app, onLinkSubmit);

		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			this.commands?.hide();
			const selection = document.getSelection()?.toString();
			if (!selection && this.btns?.isVisible()) {
				this.btns.hide();
			}
		});

		this.registerDomEvent(document, "mouseup", (evt: MouseEvent) => {
			handleSelection();
		});

		this.registerDomEvent(document, "keydown", (evt: KeyboardEvent) => {
			const view =
				this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				view.editor.focus();
			}
		})

		this.registerDomEvent(document, "keyup", (evt: KeyboardEvent) => {
			renderEmptyText();
			if (this.commands?.isVisible()) {
				const { key } = evt;
				if (
					key !== "ArrowUp" &&
					key !== "ArrowDown" &&
					key !== "ArrowLeft" &&
					key !== "ArrowRight"
				) {
					const view =
						this.app.workspace.getActiveViewOfType(MarkdownView);
					if (view) {
						const cursor = view.editor.getCursor();
						const editLine = view.editor.getLine(cursor.line);
						const _cmd = (editLine?.match(/[^\/]*$/)?.[0] || '')
						this.commands?.search(_cmd);
						view.editor.focus();
					}
				}
			}
			this.btns?.hide();
		});
		const scrollEvent = () => {
			if (this.btns?.isVisible()) {
				// handleSelection();
			}
		};

		const renderPlugin = () => {
			if (this.scrollArea) {
				this.scrollArea.removeEventListener("scroll", scrollEvent);
			}
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view) return;
			this.scrollArea =
				view.containerEl.querySelector(".cm-scroller") ?? undefined;
			const appHeader = document.querySelector(".titlebar");
			const viewHeader = view.containerEl.querySelector(".view-header");
			const headerHeight =
				(appHeader?.clientHeight ?? 0) +
				(viewHeader?.clientHeight ?? 0);

			if (!this.scrollArea) return;
			const scrollArea = this.scrollArea;

			this.commands?.remove();
			this.commands = new CommandMenu({
				scrollArea,
				onMenu: onMenuClick,
				defaultCmds: this.settings.cmdsSorting
			});

			this.btns?.remove();
			this.btns = new SelectionBtns({
				scrollArea,
				headerHeight,
				onAction: onSelectionAction,
			});

			scrollArea?.addEventListener("scroll", scrollEvent);
		};

		/**Ensure that the plugin can be loaded and used immediately after it is turned on */
		renderPlugin();

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", renderPlugin)
		);

		this.registerDomEvent(document, "input", (evt: InputEvent) => {
			if (this.linkModal.isOpen) return;
			if (evt && evt.data === "/") {
				const view =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!view) return;
				const cursor = view.editor.getCursor();
				const editLine = view.editor.getLine(cursor.line);
				if (editLine.replace(/[\s]*$/, "").length <= cursor.ch) {
					this.commands?.display();
				} else {
					// this.commands?.hide();
				}
			}
		});

		const renderEmptyText = () => {
			if (!this.settings.showPlaceholder) return;
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view) return;
			setTimeout(() => {
				const activeEle = view.containerEl.querySelector(".cm-active");
				activeEle?.setAttribute(
					"promote-text",
					"💡Please input ‘ / ’ for more commands..."
				);
			}, 50);
		};
		this.registerDomEvent(document, "pointermove", () => {
			renderEmptyText();
		});
		this.registerDomEvent(document, "click", () => {
			renderEmptyText();
		});

		this.registerMarkdownCodeBlockProcessor(CODE_LAN, (source, el, ctx) => {
			const bookmark = generateBookMark(source);
			el?.appendChild(bookmark);
		});
	}

	onunload() {
		this.commands?.remove();
		this.btns?.remove();
	}
}
