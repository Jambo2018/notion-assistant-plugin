/**
 * render a card by bookmark-md
 */
export const generateBookMark = (content: string): HTMLDivElement => {
	const obj: Record<string, string> = {};
	(content.split("\n") ?? []).forEach((item) => {
		const [str, key, value = ""] = item.match(/([^:]+):(.*)/) ?? [];
		obj[key] = value;
	});
	const linkDiv = createDiv();
	linkDiv.setAttribute("class", "bookmark");
	linkDiv.onclick = () => {
		window.open(obj.url);
	};
	const contentDiv = createDiv({ parent: linkDiv, cls: "bookmark-content" });
	if (obj.title) {
		contentDiv.createDiv({ cls: "bookmark-title", text: obj.title });
	}
	if (obj.description) {
		contentDiv.createDiv({
			cls: "bookmark-description",
			text: obj.description,
		});
	}
	const urlDiv = contentDiv.createDiv({  cls: "bookmark-url" });
	if (obj.logo) {
		urlDiv.createDiv({
			cls: "bookmark-url-logo",
			attr: { style: `background-image: url('${obj.logo}')` },
		});
	}
	urlDiv.createSpan({ cls: "bookmark-url-text", text: obj.url });
	if(obj.coverImg){
		linkDiv.createDiv({cls:"bookmark-cover",attr:{style:`background-image: url('${obj.coverImg}')`}})
	}
	return linkDiv;
};
