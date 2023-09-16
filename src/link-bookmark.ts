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
	linkDiv.setAttribute("class", "ta-bookmark");
	linkDiv.onclick = () => {
		window.open(obj.url);
	};
	const contentDiv = createDiv({ parent: linkDiv, cls: "ta-bookmark-content" });
	if (obj.title) {
		contentDiv.createDiv({ cls: "ta-bookmark-title", text: obj.title });
	}
	if (obj.description) {
		contentDiv.createDiv({
			cls: "ta-bookmark-description",
			text: obj.description,
		});
	}
	const urlDiv = contentDiv.createDiv({  cls: "ta-bookmark-url" });
	if (obj.logo) {
		urlDiv.createDiv({
			cls: "ta-bookmark-url-logo",
			attr: { style: `background-image: url('${obj.logo}')` },
		});
	}
	urlDiv.createSpan({ cls: "ta-bookmark-url-text", text: obj.url });
	if(obj.coverImg){
		linkDiv.createDiv({cls:"ta-bookmark-cover",attr:{style:`background-image: url('${obj.coverImg}')`}})
	}
	return linkDiv;
};
