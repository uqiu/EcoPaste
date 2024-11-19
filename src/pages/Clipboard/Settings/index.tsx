import Audio from "@/components/Audio";
import ProList from "@/components/ProList";
import ProSwitch from "@/components/ProSwitch";
import { InputNumber, Typography } from "antd"; // 添加 InputNumber 导入
import { useSnapshot } from "valtio";
import AutoPaste from "./components/AutoPaste";
import SearchPosition from "./components/SearchPosition";
import WindowPosition from "./components/WindowPosition";

const ClipboardSettings = () => {
	const { window, audio, search, content } = useSnapshot(clipboardStore);
	const { t } = useTranslation();

	return (
		<>
			<ProList header={t("preference.clipboard.window_settings.title")}>
				<WindowPosition />

				<ProSwitch
					title={t("preference.clipboard.window_settings.label.back_top")}
					description={t("preference.clipboard.window_settings.hints.back_top")}
					value={window.backTop}
					onChange={(value) => {
						clipboardStore.window.backTop = value;
					}}
				/>
			</ProList>

			<ProList header={t("preference.clipboard.audio_settings.title")}>
				<ProSwitch
					title={t("preference.clipboard.audio_settings.label.copy_audio")}
					value={audio.copy}
					onChange={(value) => {
						clipboardStore.audio.copy = value;
					}}
				>
					<Audio
						iconProps={{
							size: 22,
							className: "flex!",
						}}
					/>
				</ProSwitch>
			</ProList>

			<ProList header={t("preference.clipboard.search_box_settings.title")}>
				<SearchPosition key={1} />

				<ProSwitch
					title={t(
						"preference.clipboard.search_box_settings.label.default_focus",
					)}
					description={t(
						"preference.clipboard.search_box_settings.hints.default_focus",
					)}
					value={search.defaultFocus}
					onChange={(value) => {
						clipboardStore.search.defaultFocus = value;
					}}
				/>

				<ProSwitch
					title={t("preference.clipboard.search_box_settings.label.auto_clear")}
					description={t(
						"preference.clipboard.search_box_settings.hints.auto_clear",
					)}
					value={search.autoClear}
					onChange={(value) => {
						clipboardStore.search.autoClear = value;
					}}
				/>
			</ProList>

			<ProList header={t("preference.clipboard.content_settings.title")}>
				<AutoPaste />

				<div className="flex items-center justify-between">
					<div>
						<div className="font-medium text-base">{t("Card Width Size")}</div>
						<div className="text-[var(--color-text-3)] text-sm">
							{t("max=500 , min=50")}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<InputNumber
							min={50}
							max={500}
							value={content.cardWidth}
							onChange={(value) => {
								clipboardStore.content.cardWidth = value || 100;
							}}
							addonAfter="W"
						/>
					</div>
				</div>

				<div className="flex items-center justify-between">
					<div>
						<div className="font-medium text-base">
							{t("bottom margin Size")}
						</div>
						<div className="text-[var(--color-text-3)] text-sm">
							{t("max=1000 , min=0")}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<InputNumber
							min={0}
							max={1000}
							value={content.bottomMargin}
							onChange={(value) => {
								clipboardStore.content.bottomMargin = value || 100;
							}}
							addonAfter="W"
						/>
					</div>
				</div>

				<ProSwitch
					title={t("preference.clipboard.content_settings.label.image_ocr")}
					description={
						isLinux() && (
							<>
								{t("preference.clipboard.content_settings.hints.image_ocr")}{" "}
								<Typography.Link href="https://github.com/tesseract-ocr/tesseract">
									tesseract
								</Typography.Link>
							</>
						)
					}
					value={content.ocr}
					onChange={(value) => {
						clipboardStore.content.ocr = value;
					}}
				/>

				<ProSwitch
					title={t("preference.clipboard.content_settings.label.copy_as_plain")}
					description={t(
						"preference.clipboard.content_settings.hints.copy_as_plain",
					)}
					value={content.copyPlain}
					onChange={(value) => {
						clipboardStore.content.copyPlain = value;
					}}
				/>

				<ProSwitch
					title={t(
						"preference.clipboard.content_settings.label.paste_as_plain",
					)}
					description={t(
						"preference.clipboard.content_settings.hints.paste_as_plain",
					)}
					value={content.pastePlain}
					onChange={(value) => {
						clipboardStore.content.pastePlain = value;
					}}
				/>
			</ProList>
		</>
	);
};

export default ClipboardSettings;
