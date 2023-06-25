
/**
 * render a card by bookmark-md
 */
export const generateBookMark = (content: string): HTMLDivElement => {
	const obj: Record<string, string> = {};
	(content.split("\n") ?? []).forEach(item => {
		const [str, key, value = ''] = item.match(/([^:]+):(.*)/)
		obj[key] = value
	})
	const linkDiv = createDiv();
	linkDiv.setAttribute("class", "bookmark");
	linkDiv.onclick = () => {
		window.open(obj.url);
	};
	linkDiv.innerHTML = `
	<div class="bookmark-content">
	    ${obj.title ? `<div class="bookmark-title">${obj.title}</div>` : ''}
		${obj.description ? `<div class="bookmark-description">${obj.description}</div>` : ''}
		<div class="bookmark-url">
			${obj.logo ?
			`<div class="bookmark-url-logo" style="background-image: url('${obj.logo}')" ></div>`
			: ''} 
			<div class="bookmark-url-text">${obj.url}</div>
		</div>
	</div>
	${obj.coverImg ? `<div class="bookmark-cover" style="background-image: url('${obj.coverImg}')" ></div>` : ''} `
	return linkDiv;
};
