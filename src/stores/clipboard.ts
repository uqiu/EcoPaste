import type { ClipboardStore } from "@/types/store";
import { proxy } from "valtio";

export const clipboardStore = proxy<ClipboardStore>({
	window: {
		style: "dock",
		position: "remember",
		backTop: false,
		bottomDistance: 0, // 修改初始值为0
	},

	audio: {
		copy: false,
	},

	search: {
		position: "top",
		defaultFocus: false,
		autoClear: false,
	},

	content: {
		autoPaste: "double",
		ocr: true,
		copyPlain: false,
		pastePlain: false,
		cardWidth: 100,
	},

	history: {
		duration: 0,
		unit: 1,
	},
});
