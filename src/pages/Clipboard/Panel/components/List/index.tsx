import Scrollbar from "@/components/Scrollbar";
import { ClipboardPanelContext } from "@/pages/Clipboard/Panel";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FloatButton } from "antd";
import { findIndex } from "lodash-es";
import Item from "./components/Item";
import NoteModal, { type NoteModalRef } from "./components/NoteModal";

const List: FC = () => {
	const { state, getList } = useContext(ClipboardPanelContext);
	const outerRef = useRef<HTMLDivElement>(null);
	const noteModelRef = useRef<NoteModalRef>(null);

	const rowVirtualizer = useVirtualizer({
		horizontal: true, // 改为水平方向
		count: state.list.length,
		gap: 12,
		getScrollElement: () => outerRef.current,
		estimateSize: () => 220, // 修改为卡片宽度
		getItemKey: (index) => state.list[index].id,
		overscan: 5, // 增加预渲染数量提升体验
	});

	useMount(() => {
		state.scrollToIndex = rowVirtualizer.scrollToIndex;
	});

	const isFocusWithin = useFocusWithin(document.body);

	useAsyncEffect(async () => {
		rowVirtualizer.scrollToIndex(0);

		await getList?.();

		state.activeId = state.list[0]?.id;
	}, [state.search, state.group, state.favorite]);

	// 滚动到选中
	useEffect(() => {
		const index = findIndex(state.list, { id: state.activeId });

		if (index < 0) return;

		rowVirtualizer.scrollToIndex?.(index);
	}, [state.activeId]);

	// 始终保持有一个选中
	useUpdateEffect(() => {
		if (state.list.length === 0) {
			state.activeId = void 0;
		}

		state.activeId ??= state.list[0]?.id;
	}, [state.list.length]);

	useOSKeyPress(
		[
			"space",
			"enter",
			"backspace",
			"delete",
			"uparrow",
			"downarrow",
			"home",
			"meta.d",
			"ctrl.d",
		],
		(_, key) => {
			state.eventBusId = state.activeId;

			switch (key) {
				// 空格预览
				case "space":
					return state.$eventBus?.emit(LISTEN_KEY.CLIPBOARD_ITEM_PREVIEW);
				// 回车粘贴
				case "enter":
					return state.$eventBus?.emit(LISTEN_KEY.CLIPBOARD_ITEM_PASTE);
				// 删除
				case "backspace":
				case "delete":
					return state.$eventBus?.emit(LISTEN_KEY.CLIPBOARD_ITEM_DELETE);
				// 选中上一个
				case "uparrow":
					return state.$eventBus?.emit(LISTEN_KEY.CLIPBOARD_ITEM_SELECT_PREV);
				// 选中下一个
				case "downarrow":
					return state.$eventBus?.emit(LISTEN_KEY.CLIPBOARD_ITEM_SELECT_NEXT);
				// 回到顶部
				case "home":
					return rowVirtualizer.scrollToIndex?.(0);
				// 收藏和取消收藏
				case "meta.d":
				case "ctrl.d":
					return state.$eventBus?.emit(LISTEN_KEY.CLIPBOARD_ITEM_FAVORITE);
			}
		},
		{
			events: isFocusWithin ? [] : ["keydown"],
		},
	);

	return (
		<div className="h-[220px] w-full overflow-hidden">
			{" "}
			{/* 固定高度为卡片高度 */}
			<Scrollbar
				ref={outerRef}
				offset={3}
				className="h-full px-2"
				onWheel={(e) => {
					// 将垂直滚动转换为水平滚动
					if (outerRef.current) {
						e.preventDefault();
						outerRef.current.scrollLeft += e.deltaY;
					}
				}}
			>
				<div
					data-tauri-drag-region
					className="relative flex h-full gap-3"
					style={{ width: rowVirtualizer.getTotalSize() }}
				>
					{rowVirtualizer.getVirtualItems().map((virtualItem) => {
						const { key, size, start, index } = virtualItem;
						const data = state.list[index];
						let { type, value } = data;

						value = type !== "image" ? value : getSaveImagePath(value);

						return (
							<Item
								key={key}
								index={index}
								data={{ ...data, value }}
								style={{
									width: size,
									transform: `translateX(${start}px)`,
									position: "absolute",
									top: 0,
									left: 0,
								}}
								openNoteModel={() => noteModelRef.current?.open()}
							/>
						);
					})}
				</div>
			</Scrollbar>
			<FloatButton.BackTop
				duration={0}
				target={() => outerRef.current!}
				className="rotate-90" // 旋转按钮使其指向左侧
			/>
			<NoteModal ref={noteModelRef} />
		</div>
	);
};

export default List;
