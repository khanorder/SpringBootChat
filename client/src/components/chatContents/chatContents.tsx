import {
    createRef,
    Dispatch,
    ReactElement,
    SetStateAction,
    useCallback,
    useEffect,
    useRef
} from "react";
import styles from "@/styles/chat.module.sass";
import {Defines} from "@/defines";
import {dayjs} from "@/helpers/localizedDayjs";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {setIsActiveChatImageDetail} from "@/stores/reducers/ui";
import dynamic from "next/dynamic";
import {Domains} from "@/domains";
const NL2BR = dynamic(() => import("@/components/common/NL2BR"), { ssr: false });
const ChatMessage = dynamic(() => import("@/components/chatContents/chatMessage"), { ssr: false });

export interface ChatContentsProps {
    setChatDetailImageId: Dispatch<SetStateAction<string>>;
} 

export default function ChatContents() {
    const firstRender = useRef(true);
    const chatContentsRef = createRef<HTMLUListElement>();
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    useEffect(() => {
        if (!firstRender.current) {
            if (chatContentsRef.current?.scrollHeight)
                chatContentsRef.current.scrollTop = chatContentsRef.current.scrollHeight;
        }

    }, [firstRender, chat]);

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
                contents.push(<ChatMessage key={i} data={chatData} />);
            }
        } else {
            contents.push(<li key={'none'} className={styles.chatNone}>{appConfigs.isProd ? '채팅 내용이 없습니다.' : ''}</li>);
        }

        return (
            <ul className={styles.chatContentsList} ref={chatContentsRef}>
                {contents}
            </ul>
        );
    }, [appConfigs, chat, user, chatContentsRef]);

    return (
        <div className={styles.chatContentsWrapper}>
            {list()}
        </div>
    );

}