import { request } from "obsidian";

export interface LinkResult {
	url: string;
	title?: string;
	logo?: string;
	description?: string;
	coverImg?: string;
}

const handleUrlPrefix = (link: string, url: string) => {
	if (/^\/\//.test(url)) {
		url = link.split(":")[0] + ":" + url;
	} else if (/^\/[^/]/.test(url)) {
		url = link.split("?")[0] + url;
	}
	return url;
};
export const linkParse = async (link: string): Promise<LinkResult> => {
	const result: LinkResult = { url: link };
	try {
		const html = await request(link);
		if (html) {
			let titleMatch = html.match(
				/<meta[^>]*title[^>]*content="(.*?)"[^>]*>/
			);
			if (!titleMatch || titleMatch.length <= 1) {
				titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/);
			}
			result.title = titleMatch?.[1] ?? "";

			const desMatch = html.match(
				/<meta[^>]*description[^>]*content="(.*?)"[^>]*>/
			);
			result.description = desMatch?.[1] ?? "";

			let imgMatch = html.match(
				/<meta[^>]*image[^>]*content="(.*?)"[^>]*>/
			);
			if (!imgMatch || imgMatch.length <= 1) {
				imgMatch = html.match(/<img[^>]*src="(.*?)"[^>]*>/);
			}
			result.coverImg = imgMatch?.[1] ?? "";
			if (result.coverImg) {
				result.coverImg = handleUrlPrefix(link, result.coverImg);
			}
			const logoMatch = html.match(
				/<link[^>]*icon[^>]*href="([^"]*)"[^>]*>/
			);
			result.logo = logoMatch?.[1] ?? "";
			if (result.logo) {
				result.logo = handleUrlPrefix(link, result.logo);
			}
		}
		return result;
	} catch (e) {
		console.warn("request link error:", e);
		return result;
	}
};

export const debounce = (fn: Function, delay: number) => {
	let handle: NodeJS.Timeout | null = null;
	return function () {
		if (handle) clearTimeout(handle);
		handle = setTimeout(() => {
			fn();
			handle = null;
		}, delay);
	};
};

export function htmlToJson(html:string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;
  const json = {
    tag: body.tagName.toLowerCase(),
    attrs: {},
    children: []
  };
  console.log('json',json)
  const attrs = body.attributes;
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    json.attrs[attr.name] = attr.value;
  }
  const children = body.childNodes;
  console.log('children',children.length)
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === Node.ELEMENT_NODE) {
    //   json.children.push(htmlToJson(child.outerHTML));
    } else if (child.nodeType === Node.TEXT_NODE) {
      json.children.push(child.textContent);
    }
  }
  return json;
}


// export const parseSvgToJson=(svg:string)=>{
// 	const /
// }
