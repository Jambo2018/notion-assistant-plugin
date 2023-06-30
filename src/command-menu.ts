import { addIcon, setIcon } from "obsidian";
import { CONTENT_MAP, HEADING_MENU, ICON_MAP, MENU_HEIGHT, MENU_MARGIN, MENU_WIDTH, TEXT_MAP } from "./constants";

/**
 * show the menu while input a '/' in an empty line or the end of a line that not empty
 */
export class CommandMenu {
	menu: HTMLDivElement;
	scrollArea?: HTMLDivElement;
	mouseMoved: boolean;
	constructor(props: {
		scrollArea?: Element;
		onMenu: (content: string) => void;
	}) {
		this.menu = createDiv();
		this.mouseMoved = false;
		this.scrollArea = props.scrollArea as HTMLDivElement;
		this.menu.setAttribute("id", "command-menu");
		this.menu.setAttribute("class", "command");
		addIcon('icon-text', ICON_MAP['text'])
		HEADING_MENU.forEach((item, idx) => {
			const btn = createDiv();
			btn.addClass("command-option")
			btn.setAttribute("tabindex", "-1");
			btn.setAttribute("commandType", `${item}`);
			setIcon(btn, item)
			// btn.createSpan({ text: TEXT_MAP[item] })
			// btn.innerHTML = `<div>${ICON_MAP[item]}</div>${TEXT_MAP[item]}`;
			btn.onclick = function () {
				props.onMenu(CONTENT_MAP[item]);
			};
			btn.onmouseenter = function () {
				if (_this.mouseMoved) {
					btn.focus();
				}
				_this.mouseMoved = false;
			};
			this.menu.appendChild(btn);
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
				if (key === "Enter") {
					e?.preventDefault();
					e?.stopPropagation();
					props.onMenu((CONTENT_MAP as any)[cmd]);
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
				setTimeout(() => {
					nextFocusEle.scrollIntoView();
				}, 150);
			}
		};
		document.body.appendChild(this.menu);
	}
	display = function () {
		const range = window?.getSelection()?.getRangeAt(0);
		const rect = range?.getBoundingClientRect();
		const scrollAreaRect = this.scrollArea.getBoundingClientRect();
		if (!rect) return;
		let { height, top, left } = rect;
		top += height;
		const rightDis = left + MENU_WIDTH - this.scrollArea.clientWidth
		if (rightDis > 0) {
			left -= rightDis;
		}
		const upDis = top + MENU_HEIGHT - this.scrollArea.clientHeight - scrollAreaRect.top + MENU_MARGIN;
		if (upDis > 0) {
			this.scrollArea.scrollTo(0, this.scrollArea.scrollTop + upDis);
			top -= upDis;
		}
		this.menu.style.top = `${top}px`;
		this.menu.style.left = `${left}px`;
		this.menu.style.display = 'block'
		this.menu.children[0].focus();
		this.scrollArea?.setAttribute("style", "overflow:hidden;margin-right:12px");
	};
	hide = function () {
		this.menu.style.display = 'none'
		this.scrollArea?.setAttribute("style", "");
	};
	isVisible = function () {
		return this.menu.style.display !== "none"
	};
}
