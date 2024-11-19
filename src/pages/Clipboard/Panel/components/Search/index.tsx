import Icon from "@/components/Icon";
import type { InputRef } from "antd";
import { Input } from "antd";
import type { FC } from "react";
import styled from "styled-components";
import { ClipboardPanelContext } from "../..";

const StyledInput = styled(Input)`
  border-color: #666 !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
  
  &:hover, &:focus {
    border-color: white !important;
    box-shadow: none !important;
  }
`;

const Search: FC = () => {
	const { state } = useContext(ClipboardPanelContext);
	const inputRef = useRef<InputRef>(null);
	const [value, setValue] = useState<string>();
	const [isComposition, { setTrue, setFalse }] = useBoolean();
	const { t } = useTranslation();

	useEffect(() => {
		if (isComposition) return;

		state.search = value || void 0;
	}, [value, isComposition]);

	useTauriFocus({
		onFocus() {
			const { search } = clipboardStore;

			// 搜索框默认聚焦
			if (search.defaultFocus) {
				inputRef.current?.focus();
			} else {
				inputRef.current?.blur();
			}
		},
		onBlur() {
			const { window, search } = clipboardStore;

			// 激活窗口时滚动到顶部并选中首项
			if (window.backTop) {
				requestAnimationFrame(() => {
					state.scrollToIndex?.(0);

					state.activeId = state.list[0]?.id;
				});
			}

			// 搜索框自动清空
			if (search.autoClear) {
				setValue(void 0);
			}
		},
	});

	useOSKeyPress(["meta.f", "ctrl.f"], () => {
		inputRef.current?.focus();
	});

	useKeyPress(
		["enter", "uparrow", "downarrow"],
		() => {
			inputRef.current?.blur();
		},
		{
			target: inputRef.current?.input,
		},
	);

	return (
		<StyledInput
			ref={inputRef}
			allowClear
			value={value}
			prefix={<Icon name="i-lucide:search" />}
			size="small"
			placeholder={t("clipboard.hints.search_placeholder")}
			onCompositionStart={setTrue}
			onCompositionEnd={setFalse}
			onChange={(event) => {
				setValue(event.target.value);
			}}
			style={{
				width: "800px",
				backgroundColor: "red !important",
			}}
		/>
	);
};

export default Search;
