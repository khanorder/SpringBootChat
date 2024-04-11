import {ReactElement, useCallback, useEffect, useRef} from "react";
import styles from "@/styles/list.module.sass";
import {Helpers} from "@/helpers";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {enterChatRoomReq} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
import dynamic from "next/dynamic";
const ChatCreateRoomButton = dynamic(() => import("@/components/chatContents/chatCreateRoomButton"), { ssr: false });
const CreateChatRoomDialog = dynamic(() => import("@/components/dialogs/createChatRoomDialog"), { ssr: false });

export default function ChatRooms() {
    const appConfigs = useAppSelector(state => state.appConfigs);
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

    const enterChatRoom = useCallback((roomId: string) => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(roomId)) {
            alert('채팅방 정보 없음');
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해 주세요.');
        } else if (10 < user.name.length) {
            alert('대화명은 10글자 이내로 입력해주세요.');
        } else {
            dispatch(enterChatRoomReq(roomId));
        }
    }, [webSocket, user, dispatch]);

    const list = useCallback(() => {
        if (!chat.chatRooms || 1 > chat.chatRooms.length) {
            return (
                <li className={styles.chatRoomListItem}>{appConfigs.isProd ? '개설된 채팅방이 없습니다.' : ''}</li>
            );
        } else {
            const list: ReactElement[] = [];
            for (let i = 0; i < chat.chatRooms.length; i++) {
                const room = chat.chatRooms[i];
                let roomNameIconClass = styles.chatRoomNameIcon;
                if (Defines.RoomOpenType.PRIVATE == room.openType)
                    roomNameIconClass += ` ${styles.privateRoom}`;

                list.push(
                    <li key={i} className={styles.chatRoomListItem}>
                        <button className={styles.chatRoomEnterButton} onClick={e => enterChatRoom(room.roomId)} title={`'${room.roomName}' 채팅방 입장`}>
                            <div className={roomNameIconClass}>
                                <div className={styles.chatRoomNameIconText}>
                                    {room.roomName.substring(0, 1)}
                                </div>
                            </div>
                            <div className={styles.chatRoomInfoWrapper}>
                                <div className={styles.chatRoomNameWrapper}>
                                    <div className={styles.chatRoomName}>{room.roomName}</div>
                                    {
                                        room.users.length > 0
                                            ?
                                            <div className={styles.chatRoomUserCount}>{room.users.length}</div>
                                            :
                                            <></>
                                    }
                                </div>
                                <div className={styles.chatRoomPreviewWrapper}>
                                    <div className={styles.chatRoomPreview}></div>
                                </div>
                            </div>
                            <div className={styles.chatRoomOpenType}>{Helpers.getChatRoomOpenTypeName(room.openType)}</div>
                        </button>
                    </li>
                );
            }

            return list;
        }
    }, [appConfigs, chat, enterChatRoom]);

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