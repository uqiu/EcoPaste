import type { ClipboardStore } from "@/types/store";
import { proxy } from "valtio";

export const clipboardStore = proxy<ClipboardStore>({
	window: {
		style: "dock",
		position: "remember",
		backTop: false,
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
