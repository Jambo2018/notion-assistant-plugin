import { setIcon } from "obsidian";
import {
	CMD_MAP,
	HEADING_CMDS,
	MENU_MARGIN,
	MENU_WIDTH,
	SELECTION_CMDS,
	TEXT_MAP,
} from "./constants";

/**
 * the menu visible while text selected
 */
export class SelectionBtns {
	menu: HTMLDivElement;
	lineMenu: HTMLDivElement;
	headerHeight: number;
	scrollArea?: HTMLDivElement;
	constructor(props: {
		scrollArea?: Element;
		headerHeight: number;
		onAction: (content: string, isHeading: boolean) => void;
	}) {
		const commandEle = document.body.querySelector("#selection-menu");
		if (commandEle) {
			document.body.removeChild(commandEle);
		}
		this.menu = createDiv({
			cls: "selection",
			attr: { id: "selection-menu" },
		});
		this.scrollArea = props.scrollArea as HTMLDivElement;
		this.headerHeight = props.headerHeight;
		const _this = this;
		const menu_content = createDiv({ cls: "selection-content" });
		SELECTION_CMDS.forEach((item, idx) => {
			const btn = createDiv({
				cls: "selection-btn",
				attr: { commandType: idx },
			});
			if (idx === 0) {
				btn.createSpan(TEXT_MAP["text"]);
			} else {
				setIcon(btn, item);
			}
			btn.onclick = function (e) {
				if (idx === 0) {
					e.preventDefault();
					e.stopPropagation();
					_this.showHeading();
				} else {
					props.onAction((CMD_MAP as any)[item], false);
				}
			};
			menu_content.appendChild(btn);
		});

		this.menu.appendChild(menu_content);
		this.lineMenu = createDiv({ cls: "linemenu" });
		this.hideHeading();
		HEADING_CMDS.forEach((item, idx) => {
			const btn = createDiv({
				cls: "linemenu-option",
				attr: { commandType: idx },
			});
			const IconDiv = createDiv({
				parent: btn,
				cls: "linemenu-option-svg",
			});
			setIcon(IconDiv, item);
			btn.createSpan({ text: TEXT_MAP[item] });
			btn.onclick = function () {
				props.onAction((CMD_MAP as any)[item], true);
			};
			this.lineMenu.appendChild(btn);
		});

		this.menu.appendChild(this.lineMenu);
		this.scrollArea.appendChild(this.menu);
		this.hide()
	}
	display = function (lineStyleText: string) {
		const range = window?.getSelection()?.getRangeAt(0);
		const rect = range?.getBoundingClientRect();
		const scroll = this.scrollArea.getBoundingClientRect();
		if (!rect) return;
		let { height, top, left } = rect;
		top -= scroll.top;
		top += MENU_MARGIN + height;
		left -=scroll.left;
		const rightDis = left + MENU_WIDTH - this.scrollArea.clientWidth;
		if (rightDis > 0) {
			left -= rightDis;
		}
		this.menu.firstElementChild.firstElementChild.textContent =
		lineStyleText;
		if (top < this.headerHeight + 16) {
			top = -999;
		}
		this.menu.style = `top:${top}px;left:${left}px`;
		this.menu.removeClass("display-none");
		this.menu.children[0].focus();
	};
	hide = function () {
		this.menu.addClass("display-none");
		this.hideHeading();
	};
	showHeading = function () {
		const rect = this.menu?.getBoundingClientRect();
		const contentRect = this.scrollArea.getBoundingClientRect();
		const topOffset =
			rect.top +
			36 +
			386 -
			this.scrollArea.clientHeight -
			contentRect.top +
			MENU_MARGIN;
		const containerTopBorder = topOffset <= 0 ? 36 : 36 - topOffset;
		this.lineMenu.style = `top:${containerTopBorder}px`;
	};
	hideHeading = function () {
		this.lineMenu.style = "display:none";
	};
	isVisible = function () {
		return !!document.querySelector(".selection");
	};
	clear = function () {
		this.scrollArea.removeChild(this.menu);
	};
}
