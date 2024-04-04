import {ReactElement, useCallback, useEffect, useRef} from "react";
import styles from "@/styles/list.module.sass";
import {Helpers} from "@/helpers";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {enterChatRoomReq} from "@/stores/reducers/webSocket";

export interface ChatRoomListProps {
    isProd: boolean;
}

export default function ChatRoomList({ isProd }: ChatRoomListProps) {
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const firstRender = useRef(true);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const enterChatRoom = useCallback((enterChatRoomId: string) => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(enterChatRoomId)) {
            alert('채팅방 정보 없음');
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해 주세요.');
        } else if (10 < user.name.length) {
            alert('대화명은 10글자 이내로 입력해주세요.');
        } else {
            dispatch(enterChatRoomReq(enterChatRoomId));
        }
    }, [webSocket, user, dispatch]);

    const list = useCallback(() => {
        if (!chat.roomList || 1 > chat.roomList.length) {
            return (
                <li className={styles.chatRoomListItem}>{isProd ? '개설된 채팅방이 없습니다.' : ''}</li>
            );
        } else {
            const list: ReactElement[] = [];
            for (let i = 0; i < chat.roomList.length; i++) {
                list.push(
                    <li key={i} className={styles.chatRoomListItem}>
                        <button className={styles.chatRoomEnterButton} onClick={e => enterChatRoom(chat.roomList[i].roomId)}>
                            <div className={styles.chatRoomNameIcon}>
                                <div className={styles.chatRoomNameIconText}>
                                    {chat.roomList[i].roomName.substring(0, 1)}
                                </div>
                            </div>
                            <div className={styles.chatRoomInfoWrapper}>
                                <div className={styles.chatRoomNameWrapper}>
                                    <div className={styles.chatRoomName}>{chat.roomList[i].roomName}</div>
                                    {
                                        chat.roomList[i].userCount > 0
                                            ?
                                            <div className={styles.chatRoomUserCount}>{chat.roomList[i].userCount}</div>
                                            :
                                            <></>
                                    }
                                </div>
                                <div className={styles.chatRoomPreviewWrapper}>
                                    <div className={styles.chatRoomPreview}></div>
                                </div>
                            </div>
                            <div className={styles.chatRoomOpenType}>{Helpers.getChatRoomOpenTypeName(chat.roomList[i].openType)}</div>
                        </button>
                    </li>
                );
            }

            return list;
        }
    }, [chat, enterChatRoom, isProd]);

    return (
        <div className={styles.chatRoomListWrapper}>
            <ul className={styles.chatRoomList}>
                {list()}
            </ul>
        </div>
    );
}