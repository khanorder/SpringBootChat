import {useAppDispatch, useAppSelector} from "@/hooks";
import {MouseEventHandler, useCallback, useEffect, useRef} from "react";
import styles from "@/styles/chatRooms.module.sass";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {enterChatRoomReq, historyChatRoomReq} from "@/stores/reducers/webSocket";
import {Domains} from "@/domains";

export interface ChatRoomProps {
    chatRoom: Domains.ChatRoom;
    onContextMenu: MouseEventHandler<HTMLElement>;
}

export default function ChatRoom({ chatRoom, onContextMenu }: ChatRoomProps) {
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current)
            dispatch(historyChatRoomReq(chatRoom));

    }, [firstRender, chatRoom, dispatch]);

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
    
    const enterButton = useCallback(() => {
        const latestMessage = 0 < chatRoom.chatDatas.length ? chatRoom.chatDatas[chatRoom.chatDatas.length - 1] : null;
        let roomNameIconClass = styles.chatRoomNameIcon;
        switch (chatRoom.openType) {
            case Defines.RoomOpenType.PREPARED:
                roomNameIconClass += ` ${styles.preparedRoom}`;
                break

            case Defines.RoomOpenType.PRIVATE:
                roomNameIconClass += ` ${styles.privateRoom}`;
                break

        }

        return (
            <button className={styles.chatRoomEnterButton}
                    onClick={e => enterChatRoom(chatRoom.roomId)}
                    title={`'${chatRoom.roomName}' 채팅방 입장`}>
                <div className={roomNameIconClass}>
                    <div className={styles.chatRoomNameIconText}>
                        {chatRoom.roomName.substring(0, 1)}
                    </div>
                </div>
                <div className={styles.chatRoomInfoWrapper}>
                    <div className={styles.chatRoomNameWrapper}>
                        <div className={styles.chatRoomName}>{chatRoom.roomName}</div>
                        <div className={styles.latestMessage}>{latestMessage ? latestMessage.message : ""}</div>
                    </div>
                    <div className={styles.chatRoomPreviewWrapper}>
                        <div className={styles.chatRoomPreview}></div>
                    </div>
                </div>
                {/*<div className={styles.chatRoomOpenType}>{Helpers.getChatRoomOpenTypeName(chatRoom.openType)}</div>*/}
            </button>
        );
    }, [chatRoom, enterChatRoom]);

    return (
        <li className={styles.chatRoomListItem} onContextMenu={onContextMenu}>
            {enterButton()}
        </li>
    );
}