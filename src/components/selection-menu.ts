import { setIcon } from "obsidian";
import {
	CMD_CONFIG,
	HEADING_CMDS,
	MENU_MARGIN,
	MENU_WIDTH,
	SELECTION_CMDS,
	TEXT_MAP,
} from "../constants";

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
				setIcon(btn, CMD_CONFIG[item].icon);
			}
			btn.onclick = function (e) {
				if (idx === 0) {
					e.preventDefault();
					e.stopPropagation();
					_this.showHeading();
				} else {
					props.onAction(item, false);
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
			setIcon(IconDiv, CMD_CONFIG[item].icon);
			btn.createSpan({ text: CMD_CONFIG[item].title });
			btn.onclick = function () {
				props.onAction(item, true);
			};
			this.lineMenu.appendChild(btn);
		});

		this.menu.appendChild(this.lineMenu);
		this.scrollArea.appendChild(this.menu);
		this.hide();
	}
	display = function (lineStyleText: string) {
		const range = window?.getSelection()?.getRangeAt(0);
		const rect = range?.getBoundingClientRect();
		const scroll = this.scrollArea.getBoundingClientRect();
		if (!rect) return;
		let { height, top, left } = rect;
		top += MENU_MARGIN + height + this.scrollArea.scrollTop - scroll.top;
		left -= scroll.left;

		const upDis =
			top + 56 - this.scrollArea.scrollTop - this.scrollArea.clientHeight;
		if (upDis > 0) {
			this.scrollArea.scrollTo(0, this.scrollArea.scrollTop + upDis);
		}

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
			rect.height +
			430 -
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
	remove = function () {
		this.scrollArea.removeChild(this.menu);
	};
}
