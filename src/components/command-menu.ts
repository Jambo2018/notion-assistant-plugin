import { setIcon } from "obsidian";
import {
	CMD_CONFIG,
	COMMAD_ITEM_EIGHT,
	MAX_MENU_HEIGHT,
	MENU_MARGIN,
	MENU_WIDTH,
} from "../constants";
import { CMD_TYPE } from "./plugin-setting";

/**
 * show the menu while input a '/' in an empty line or the end of a line that not empty
 */
export class CommandMenu {
	menu: HTMLDivElement;
	scrollArea?: HTMLDivElement;
	mouseMoved: boolean;
	menuHieght: number;
	constructor(props: {
		scrollArea?: Element;
		onMenu: (content: string) => void;
		cmds: CMD_TYPE[]
	}) {
		this.menu = createDiv({ cls: "command", attr: { id: "command-menu" } });
		this.mouseMoved = false;
		this.scrollArea = props.scrollArea as HTMLDivElement;
		this.menuHieght = Math.min(COMMAD_ITEM_EIGHT * props.cmds.length, MAX_MENU_HEIGHT)
		props.cmds.forEach((item, idx) => {
			const btn = createDiv({
				parent: this.menu,
				cls: "command-option",
				attr: { tabindex: -1, commandType: item },
			});
			const IconDiv = createDiv({ parent: btn });
			setIcon(IconDiv, CMD_CONFIG[item].icon);
			btn.createSpan({ text: CMD_CONFIG[item].title });
			btn.onclick = function () {
				props.onMenu(item);
			};
			btn.onmouseenter = function () {
				if (_this.mouseMoved) {
					btn.focus();
				}
				_this.mouseMoved = false;
			};
		});

		const _this = this;
		this.menu.onmousemove = function (e) {
			_this.mouseMoved = true;
		};
		this.menu.onkeydown = function (e) {
			const { key } = e;
			if (
				key === "ArrowUp" ||
				key === "ArrowDown" ||
				key === "ArrowLeft" ||
				key === "ArrowRight" ||
				key === "Enter"
			) {
				const focusEle = document.activeElement;
				const cmd = focusEle?.getAttribute("commandType");
				if (!cmd) return;
				e?.preventDefault();
				e?.stopPropagation();
				if (key === "Enter") {
					props.onMenu(cmd);
					_this.hide();
				}
				let nextFocusEle: HTMLElement = focusEle as HTMLElement;
				if (key === "ArrowUp" || key === "ArrowLeft") {
					nextFocusEle =
						focusEle?.previousElementSibling as HTMLElement;
					if (!nextFocusEle) {
						nextFocusEle = (this as HTMLElement)
							?.lastElementChild as HTMLElement;
					}
				} else if (key === "ArrowDown" || key === "ArrowRight") {
					nextFocusEle = focusEle?.nextElementSibling as HTMLElement;
					if (!nextFocusEle) {
						nextFocusEle = (this as HTMLElement)
							?.firstElementChild as HTMLElement;
					}
				}
				nextFocusEle?.focus();
			}
		};
		this.scrollArea.appendChild(this.menu);
		this.hide();
	}
	display = function () {
		const range = window?.getSelection()?.getRangeAt(0);
		const rect = range?.getBoundingClientRect();
		const scroll = this.scrollArea.getBoundingClientRect();
		if (!rect) return;
		let { height, top, left } = rect;
		top += height + this.scrollArea.scrollTop;
		top -= scroll.top;
		left -= scroll.left;
		const rightDis = left + MENU_WIDTH - scroll.width;
		if (rightDis > 0) {
			left -= rightDis;
		}

		const upDis =
			top +
			this.menuHieght +
			MENU_MARGIN -
			this.scrollArea.scrollTop -
			this.scrollArea.clientHeight;
		if (upDis > 0) {
			this.scrollArea.scrollTo(0, this.scrollArea.scrollTop + upDis);
		}

		this.menu.style = `top:${top}px;left:${left}px`;
		if (!this.isVisible()) {
			this.menu.removeClass("display-none");
		}
		this.menu.children[0].focus();
		this.scrollArea?.addClass("scroll-disable");
	};
	hide = function () {
		this.menu.addClass("display-none");
		this.scrollArea?.removeClass("scroll-disable");
	};
	isVisible = function () {
		return !this.menu.hasClass("display-none");
	};
	remove = function () {
		this.scrollArea.removeChild(this.menu);
	};
}
