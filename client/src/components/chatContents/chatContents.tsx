import {
    createElement,
    createRef,
    Dispatch,
    ReactElement,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import styles from "@/styles/chat.module.sass";
import {Defines} from "@/defines";
import {dayjs} from "@/helpers/localizedDayjs";
import {useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import * as DOMPurify from "dompurify";
import NL2BR from "@/components/common/NL2BR";

export interface ChatContentsProps {
    isProd: boolean;
    serverHost: string;
    setChatDetailImageId: Dispatch<SetStateAction<string>>;
} 

export default function ChatContents({isProd, serverHost, setChatDetailImageId}: ChatContentsProps) {
    const firstRender = useRef(true);
    const chatContentsRef = createRef<HTMLUListElement>();
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);

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
    }, [setChatDetailImageId]);

    const list = useCallback(() => {
        const contents: ReactElement[] = [];

        if (0 < chat.chatDatas.length) {
            for (let i = 0; i < chat.chatDatas.length; i++) {
                let chatData = chat.chatDatas[i];
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
            contents.push(<li key={'none'} className={styles.chatNone}>{isProd ? '채팅 내용이 없습니다.' : ''}</li>);
        }

        return (
            <ul className={styles.chatContentsList} ref={chatContentsRef}>
                {contents}
            </ul>
        );
    }, [chat, isProd, openChatImageDetailDialog, serverHost, user, chatContentsRef]);

    return list();

}