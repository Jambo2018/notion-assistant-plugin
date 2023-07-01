import { addIcon, request } from "obsidian";

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

export const loadIcons = (icons: Record<string, string>): void => {
	for (const key in icons) {
		addIcon(key, icons[key])
	}
}