import {ReactElement, useCallback, useEffect, useRef} from "react";
import styles from "@/styles/chatRooms.module.sass";
import {useAppDispatch, useAppSelector} from "@/hooks";
import dynamic from "next/dynamic";
const ChatRoom = dynamic(() => import("@/components/chatContents/chatRoom"), { ssr: false });
const ChatCreateRoomButton = dynamic(() => import("@/components/chatContents/chatCreateRoomButton"), { ssr: false });
const CreateChatRoomDialog = dynamic(() => import("@/components/dialogs/createChatRoomDialog"), { ssr: false });

export default function ChatRooms() {
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const firstRender = useRef(true);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const list = useCallback(() => {
        if (!chat.chatRooms || 1 > chat.chatRooms.length) {
            return (
                <li className={styles.chatRoomListItem}>{appConfigs.isProd ? '개설된 채팅방이 없습니다.' : ''}</li>
            );
        } else {
            const list: ReactElement[] = [];
            for (let i = 0; i < chat.chatRooms.length; i++) {
                const chatRoom = chat.chatRooms[i];

                list.push(<ChatRoom key={i} chatRoom={chatRoom} />);
            }

            return list;
        }
    }, [appConfigs, chat]);

    return (
        <>
            <CreateChatRoomDialog />
            <div className={`${styles.chatRoomListWrapper}${appConfigs.isProd ? '' : ` ${styles.dev}`}`}>
                <ul className={styles.chatRoomList}>
                    {list()}
                </ul>
            </div>
            <ChatCreateRoomButton />
        </>
    );
}