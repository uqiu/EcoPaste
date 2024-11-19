import Scrollbar from "@/components/Scrollbar";
import { ClipboardPanelContext } from "@/pages/Clipboard/Panel";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FloatButton } from "antd";
import { findIndex } from "lodash-es";
import { useSnapshot } from "valtio";
import Item from "./components/Item";
import NoteModal, { type NoteModalRef } from "./components/NoteModal";

const List: FC = () => {
	const { state, getList } = useContext(ClipboardPanelContext);
	const outerRef = useRef<HTMLDivElement>(null);
	const noteModelRef = useRef<NoteModalRef>(null);
	const { content } = useSnapshot(clipboardStore);

	const rowVirtualizer = useVirtualizer({
		horizontal: true, // 改为水平方向
		count: state.list.length,
		gap: 12,
		getScrollElement: () => outerRef.current,
		estimateSize: () => content.cardWidth, // 使用store中的宽度
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
		<div className="h-full w-full overflow-hidden">
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
					className="relative flex h-full gap-3"
					style={{ width: rowVirtualizer.getTotalSize() }}
				>
					{rowVirtualizer.getVirtualItems().map((virtualItem) => {
						const { key, start, index } = virtualItem;
						const data = state.list[index];
						let { type, value } = data;

						value = type !== "image" ? value : getSaveImagePath(value);

						return (
							<div
								key={key}
								className="sss1"
								style={{
									width: content.cardWidth,
									height: "100%",
									transform: `translateX(${start}px)`,
									position: "absolute",
									top: 0,
									left: 0, // 移除这里的 left: 20
									//  color: "white",
									//  border: "0px solid black !important",
								}}
							>
								{/* 毛玻璃背景层 */}
								{/*<div
      className="sss2"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
		margin: "11px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
		filter: "blur(200px)",
        //border: "0px solid black !important",
      }}
    />*/}
								{/* 清晰内容层 */}
								<Item
									key={key}
									index={index}
									data={{ ...data, value }}
									style={{
										width: "100%",
										height: "100%",
										position: "absolute",
										zIndex: 1,
										border: "0px solid black !important",
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										backgroundColor: "rgba(0, 0, 0, 0.4)",
										color: "rgba(255, 255, 255, 0.8)",
										borderColor: "rgba(0, 0, 0, 0.2)",
										boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
									}}
									openNoteModel={() => noteModelRef.current?.open()}
								/>
							</div>
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
