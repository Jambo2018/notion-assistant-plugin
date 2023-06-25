import {
	CMD_MAP,
	HEADING_CMDS,
	ICON_MAP,
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
		this.menu = createDiv();
		this.scrollArea = props.scrollArea as HTMLDivElement;
		this.headerHeight = props.headerHeight;
		this.menu.setAttribute("id", "selection");
		this.menu.setAttribute("class", "selection");
		const _this = this;
		const menu_content = createDiv();
		menu_content.setAttribute("class", "selection-content");
		SELECTION_CMDS.forEach((item, idx) => {
			const btn = createDiv();
			btn.setAttribute("class", "selection-btn");
			btn.setAttribute("commandType", `${idx}`);
			btn.innerHTML = idx === 0 ? TEXT_MAP["text"] : ICON_MAP[item];
			btn.onclick = function (e) {
				if (idx === 0) {
					e.preventDefault();
					e.stopPropagation();
					_this.showHeading();
				} else {
					props.onAction(CMD_MAP[item], false);
				}
			};
			menu_content.appendChild(btn);
		});

		this.menu.appendChild(menu_content);
		this.lineMenu = createDiv();
		this.lineMenu.setAttribute("class", "linemenu");
		this.hideHeading();
		HEADING_CMDS.forEach((item, idx) => {
			const btn = createDiv();
			btn.setAttribute("class", "linemenu-option");
			btn.setAttribute("commandType", `${idx}`);
			btn.innerHTML = `<div>${ICON_MAP[item]}</div>${TEXT_MAP[item]}`;
			btn.onclick = function () {
				props.onAction(CMD_MAP[item], true);
			};
			this.lineMenu.appendChild(btn);
		});

		this.menu.appendChild(this.lineMenu);
		document.body.appendChild(this.menu);
	}
	display = function (lineStyle: string) {
		const range = window?.getSelection()?.getRangeAt(0);
		const rect = range?.getBoundingClientRect();
		if (!rect) return;
		let { height, top, left } = rect;
		top += MENU_MARGIN + height;
		const rightDis = left + MENU_WIDTH - this.scrollArea.clientWidth;
		if (rightDis > 0) {
			left -= rightDis;
		}
		this.menu.firstElementChild.firstElementChild.innerHTML = lineStyle;
		if (top < this.headerHeight + 16) {
			top = -999;
		}
		this.menu.style.top = `${top}px`;
		this.menu.style.left = `${left}px`;
		this.menu.style.display = "";
		this.menu.children[0].focus();
	};
	hide = function () {
		this.menu.style.display = "none";
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
		if (topOffset <= 0) {
			this.lineMenu.style = `top:36px`;
		} else {
			this.lineMenu.style = `top:${36 - topOffset}px`;
		}
	};
	hideHeading = function () {
		this.lineMenu.style = "display:none";
	};
	isVisible = function () {
		return !!document.querySelector(".selection");
	};
}
