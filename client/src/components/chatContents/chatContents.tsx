import {
    createRef,
    ReactElement,
    useCallback,
    useEffect,
    useRef
} from "react";
import styles from "@/styles/chatContents.module.sass";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {dayjs} from "@/helpers/localizedDayjs";
import isEmpty from "lodash/isEmpty";
import dynamic from "next/dynamic";
import {Domains} from "@/domains";
const ChatMessage = dynamic(() => import("@/components/chatContents/chatMessage"), { ssr: false });

export default function ChatContents() {
    const firstRender = useRef(true);
    const chatContentsRef = createRef<HTMLUListElement>();
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    useEffect(() => {
        if (firstRender.current)
            return;

        if (chatContentsRef.current?.scrollHeight)
            chatContentsRef.current.scrollTop = chatContentsRef.current.scrollHeight;

    }, [firstRender, chatContentsRef]);

    const list = useCallback(() => {
        let chatDatas: Domains.Chat[] = [];
        if (chat && !isEmpty(chat.currentChatRoomId)) {
            const chatRoom = chat.chatRooms.find(_ => _.roomId == chat.currentChatRoomId);
            if (chatRoom)
                chatDatas = chatRoom.chatDatas;
        }
        const contents: ReactElement[] = [];

        if (0 < chatDatas.length) {
            for (let i = 0; i < chatDatas.length; i++) {
                let chatData = chatDatas[i];
                let isContinually = false;
                let isContinuallyLast = true;
                const next = chatDatas[i - 1];
                if (next && next.userId === chatData.userId) {
                    if (dayjs(chatData.time).tz().format("YYYY-MM-DD HH:mm") === dayjs(next.time).tz().format("YYYY-MM-DD HH:mm"))
                        isContinuallyLast = false;
                }

                if (i < chatDatas.length - 1) {
                    const prev = chatDatas[i + 1];
                    if (prev && prev.userId === chatData.userId) {
                        if (dayjs(chatData.time).tz().format("YYYY-MM-DD HH:mm") === dayjs(prev.time).tz().format("YYYY-MM-DD HH:mm"))
                            isContinually = true;
                    }

                }
                contents.push(<ChatMessage key={i} data={chatData} isContinually={isContinually} isContinuallyLast={isContinuallyLast} />);
            }
        } else {
            contents.push(<li key={'none'} className={styles.chatNone}>{appConfigs.isProd ? '채팅 내용이 없습니다.' : ''}</li>);
        }

        return (
            <ul className={styles.chatContentsList} ref={chatContentsRef}>
                {contents}
            </ul>
        );
    }, [appConfigs, chat, chatContentsRef]);

    return (
        <div className={styles.chatContentsWrapper}>
            {list()}
        </div>
    );

}