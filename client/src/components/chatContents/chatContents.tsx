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

export interface ChatContentsProps {
    serverHost: string;
    setChatDetailImageId: Dispatch<SetStateAction<string>>;
} 

export default function ChatContents({serverHost, setChatDetailImageId}: ChatContentsProps) {
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

    const openChatImageDetailDialog = useCallback((chatId: string) => {
        if (isEmpty(chatId))
            return;

        setChatDetailImageId(chatId);
        dispatch(setIsActiveChatImageDetail(true));
    }, [setChatDetailImageId, dispatch]);

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
                const isMine = user.id == chatData.userId;
                let chatContentsClass = styles.chatContents + (isMine ? ` ${styles.mine}` : '');
                let chatMessageClass = styles.chatMessage + (isMine ? ` ${styles.mine}` : '');

                switch (chatData.type) {
                    case Defines.ChatType.NOTICE:
                        contents.push(<li key={i} className={styles.chatNotice}>{chatData.message}</li>);
                        break;

                    case Defines.ChatType.TALK:
                        contents.push(
                            <li key={i} className={chatContentsClass}>
                                <div className={styles.chatWrapper}>
                                    {isMine ? <></> : <div className={styles.chatUserName}>{chatData.userName}</div>}
                                    <div className={chatMessageClass}>
                                        <NL2BR text={chatData.message} />
                                    </div>
                                    <div className={styles.chatTime}>{dayjs(chatData.time).fromNow(true)}</div>
                                </div>
                            </li>
                        );
                        break;

                    case Defines.ChatType.IMAGE:
                        chatContentsClass += ' ' + styles.chatContentsImage;
                        chatMessageClass += ' ' + styles.chatMessageImage;
                        contents.push(
                            <li key={i} className={chatContentsClass}>
                                <div className={styles.chatWrapper}>
                                    {isMine ? <></> : <div className={styles.chatUserName}>{chatData.userName}</div>}
                                    <div className={chatMessageClass}>
                                        <img className={styles.chatImage}
                                             src={`${serverHost}/api/chatSmallImage/${chatData.id}`}
                                             alt={chatData.id + ' 이미지'}
                                             onClick={e => openChatImageDetailDialog(chatData.id)}/>
                                    </div>
                                    <div className={styles.chatTime}>{dayjs(chatData.time).fromNow(true)}</div>
                                </div>
                            </li>
                        );
                        break;
                }
            }
        } else {
            contents.push(<li key={'none'} className={styles.chatNone}>{appConfigs.isProd ? '채팅 내용이 없습니다.' : ''}</li>);
        }

        return (
            <ul className={styles.chatContentsList} ref={chatContentsRef}>
                {contents}
            </ul>
        );
    }, [appConfigs, chat, openChatImageDetailDialog, serverHost, user, chatContentsRef]);

    return (
        <div className={styles.chatContentsWrapper}>
            {list()}
        </div>
    );

}