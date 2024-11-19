import { WINDOW_PLUGIN } from "@/constants";
import { clipboardStore } from "@/stores/clipboard";
import type { WindowLabel } from "@/types/plugin";
import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
	PhysicalPosition,
	availableMonitors,
	cursorPosition,
} from "@tauri-apps/api/window";

/**
 * 显示窗口
 */
export const showWindow = (label?: WindowLabel) => {
	if (label) {
		emit(LISTEN_KEY.SHOW_WINDOW, label);
	} else {
		invoke(WINDOW_PLUGIN.SHOW_WINDOW);
	}
};

/**
 * 隐藏窗口
 */
export const hideWindow = () => {
	invoke(WINDOW_PLUGIN.HIDE_WINDOW);
};

/**
 * 切换窗口的显示和隐藏
 */
export const toggleWindowVisible = async () => {
	const appWindow = getCurrentWebviewWindow();

	let focused = await appWindow.isFocused();

	if (isLinux()) {
		focused = await appWindow.isVisible();
	}

	if (appWindow.label === WINDOW_LABEL.MAIN) {
		// dock 风格的位置
		const monitors = await availableMonitors();
		if (!monitors.length) return;

		const { width, height } = await appWindow.innerSize();
		const cursor = await cursorPosition();

		for await (const monitor of monitors) {
			const { position, size } = monitor;

			// 检查光标是否在当前显示器内
			if (
				cursor.x < position.x ||
				cursor.y < position.y ||
				cursor.x > position.x + size.width ||
				cursor.y > position.y + size.height
			) {
				continue;
			}

			// 将窗口定位在屏幕底部居中
			const windowX = position.x + (size.width - width) / 2;
			const windowY =
				position.y +
				size.height -
				height -
				clipboardStore.window.bottomDistance;

			await appWindow.setPosition(
				new PhysicalPosition(Math.round(windowX), Math.round(windowY)),
			);
			break;
		}
	}

	if (focused) {
		hideWindow();
	} else {
		showWindow();
	}
};

/**
 * 显示任务栏图标
 */
export const showTaskbarIcon = (show = true) => {
	invoke(WINDOW_PLUGIN.SHOW_TASKBAR_ICON, { show });
};
