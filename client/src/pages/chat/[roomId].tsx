import {ChangeEvent, createRef, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import ChatRoomLayout from "@/components/layouts/chatRoom";
import {GetServerSideProps, NextPageContext} from "next";
import {useRouter} from "next/router";
import styles from "@/styles/chat.module.sass";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Defines} from "@/defines";
import {dayjs} from "@/helpers/localizedDayjs";
import isEmpty from "lodash/isEmpty";
import {enterChatRoomReq, exitChatRoomReq, sendMessageReq} from "@/stores/reducers/webSocket";
import {Domains} from "@/domains";
import {setUserName} from "@/stores/reducers/user";
import Link from "next/link";
import {Helpers} from "@/helpers";

interface ChatRoomProps {
    isProd: boolean;
}

function ChatRoom({isProd}: ChatRoomProps) {
    const router = useRouter();
    const firstRender = useRef(true);
    const {roomId} = router.query;
    const [currentChatRoom, setCurrentChatRoom] = useState<Domains.ChatRoom | undefined>(undefined);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const [chatRoomUserListClass, setChatRoomUserListClass] = useState<string>(styles.chatUserList);
    const chatContentsRef = createRef<HTMLUListElement>();
    const chatMessageInputRef = createRef<HTMLTextAreaElement>();
    const [message, setMessage] = useState<string>('');

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender, chat]);
    //#endregion

    useEffect(() => {
        if (!firstRender.current) {
            setCurrentChatRoom(chat.roomList.find(_ => _.roomId == Helpers.getUUIDFromBase62(roomId?.toString() ?? '')));

            if (chatContentsRef.current?.scrollHeight)
                chatContentsRef.current.scrollTop = chatContentsRef.current.scrollHeight;

            if (chatMessageInputRef.current)
                chatMessageInputRef.current.focus();
        }

    }, [firstRender, chat, chatContentsRef, chatMessageInputRef, setCurrentChatRoom, roomId]);

    const exitChatRoom = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(roomId)) {
            alert('채팅방 정보 없음');
        } else {
            dispatch(exitChatRoomReq(Helpers.getUUIDFromBase62(roomId?.toString() ?? '')));
        }
    }, [webSocket, dispatch, roomId]);

    const sendMessage = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(user.id)) {
            alert('채팅방에 입장해 주세요.');
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해 주세요.');
        } else if (isEmpty(message.trim())) {
            alert('메세지를 입력해 주세요.');
            setMessage(message.trim())
        } else if (300 < message.trim().length) {
            alert(`채팅내용은 300글자 이내로 입력해주세요.`);
        } else {
            dispatch(sendMessageReq({roomId: Helpers.getUUIDFromBase62(roomId?.toString() ?? ''), message: message}));
            setMessage('');
        }
    }, [webSocket, user, message, setMessage, roomId, dispatch]);

    const changeMessage = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(prev => {
            if (300 < e.target.value.toString().trim().length) {
                alert(`채팅내용은 300글자 이내로 입력해주세요.`);
                return prev.substring(0, 300);
            }

            return e.target.value.toString() ?? '';
        });
    }, [setMessage]);

    const onKeyUpMessage = useCallback((e: any | KeyboardEvent) => {
        if (e.shiftKey && e.key == "Enter") {
            // 쉬프트 엔터 줄바꿈 허용
        } else if (e.key == 'Enter') {
            sendMessage();
        }
    }, [sendMessage, message]);

    const chatRoomUsers = useCallback(() => {
        const users: ReactElement[] = [];
        users.push(<li key={'userCount'} className={styles.chatRoomUserCount}>{`참여인원: ${chat.roomUserList.length} 명`}</li>);

        if (0 < chat.roomUserList.length) {
            for (let i = 0; i < chat.roomUserList.length; i++) {
                users.push(<li key={i} className={styles.chatRoomUser}>{chat.roomUserList[i].userName}</li>);
            }
        }

        return users;
    }, [chat]);

    const chatContents = useCallback(() => {
        const contents: ReactElement[] = [];

        if (0 < chat.chatDatas.length) {
            for (let i = 0; i < chat.chatDatas.length; i++) {
                let chatData = chat.chatDatas[i];
                switch (chatData.type) {
                    case Defines.ChatType.NOTICE:
                        contents.push(<li key={i} className={styles.chatNotice}>{chatData.message}</li>);
                        break;

                    case Defines.ChatType.TALK:
                        const isMine = user.id == chatData.userId;
                        const chatContentsClass = styles.chatContents + (isMine ? ` ${styles.mine}` : '');
                        const chatMessage = styles.chatMessage + (isMine ? ` ${styles.mine}` : '');

                        contents.push(
                            <li key={i} className={chatContentsClass}>
                                <div className={styles.chatWrapper}>
                                    {isMine ? <></> : <div className={styles.chatUserName}>{chatData.userName}</div>}
                                    <div className={chatMessage}
                                         dangerouslySetInnerHTML={{__html: chatData.message.replaceAll('\n', '<br />')}}></div>
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

        return contents;
    }, [chat, user, isProd]);

    const toggleChatRoomUserList = useCallback(() => {
        setChatRoomUserListClass(prev => {
            if (null == prev || '' == prev)
                return styles.chatUserList;

            if (styles.chatUserList == prev) {
                return styles.chatUserList + ' ' + styles.chatUserListScroll;
            } else if (`${styles.chatUserList} ${styles.chatUserListScroll}` == prev) {
                return styles.chatUserList;
            } else {
                return styles.chatUserList;
            }
        });
    }, [setChatRoomUserListClass]);

    const enterChatRoom = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(roomId)) {
            alert('채팅방 정보 없음');
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해 주세요.');
        } else if (10 < user.name.length) {
            alert('대화명은 10글자 이내로 입력해주세요.');
        } else {
            dispatch(enterChatRoomReq(Helpers.getUUIDFromBase62(roomId?.toString() ?? '')));
        }
    }, [webSocket, user, dispatch, roomId]);

    const onKeyUpUserName = useCallback((e: any) => {
        if (e.key == 'Enter')
            enterChatRoom();
    }, [enterChatRoom]);

    const changeUserName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        dispatch(setUserName(e.target.value ? e.target.value.trim() : ''));
    }, [user, dispatch]);

    const createUser = useCallback(() => {
        if (!currentChatRoom)
            return <></>;

        return (
            <>
                <div className={styles.chatroomInputNotice}>
                    {isProd ? `'${currentChatRoom.roomName}' 대화방에서 사용할 대화명을 입력해주세요.` : ''}
                </div>
                <div className={styles.chatRoomInputWrapper}>
                    <input className={styles.userNameInput} value={user.name}
                           onKeyUp={e => onKeyUpUserName(e)}
                           onChange={e => changeUserName(e)}
                           placeholder={isProd ? '대화명' : ''}/>
                    <button className={styles.enterChatRoomButton} onClick={enterChatRoom}>입장
                    </button>
                </div>
            </>
        );
    }, [isProd, user, currentChatRoom, onKeyUpUserName, changeUserName, enterChatRoom]);

    const copyShareLink = useCallback(() => {
        if (window) {
            const url = `${location.protocol}//${location.hostname}${('' == location.port || '80' == location.port || '443' == location.port ? '' : `:${location.port}`)}/chat/${roomId}`;
            window.navigator.clipboard.writeText(url);
            alert(`채팅방 주소를 복사했습니다.\n(${url})`);
        }
    }, [roomId]);

    const contents = useCallback(() => {
        if (!currentChatRoom) {
            return (
                <div className={styles.chatContentsWrapper}>
                    <div className={styles.chatRoomNone}>
                        <div>
                            {isProd ? '채팅방이 없습니다.' : ''}
                        </div>
                        <Link href='/' className={styles.goToMainButton}>메인으로</Link>
                    </div>
                </div>
            );
        }

        if (!user.id)
            return createUser();

        return (
            <>
                <div className={styles.chatRoomTitleWrapper}>
                    <button className={styles.chatRoomShare} onClick={copyShareLink}>공유</button>
                    <span className={styles.chatRoomTitle}>{currentChatRoom.roomName}</span>
                    <button className={styles.chatRoomExit} onClick={exitChatRoom}>나가기</button>
                </div>
                <div className={styles.chatContentsWrapper}>
                    <ul className={chatRoomUserListClass} onClick={toggleChatRoomUserList}>
                        {chatRoomUsers()}
                    </ul>
                    <ul className={styles.chatContentsList} ref={chatContentsRef}>
                        {chatContents()}
                    </ul>
                </div>
                <div className={styles.chatMessageLength}>{message.length}/300</div>
                <div className={styles.chatMessageInputWrapper}>
                    <textarea ref={chatMessageInputRef} value={message} className={styles.chatMessageInput}
                              onKeyUp={e => onKeyUpMessage(e)}
                              onChange={e => changeMessage(e)}
                              placeholder={isProd ? '메세지를 입력해 주세요.' : ''}>
                        {message}
                    </textarea>
                    <button className={styles.chatSendButton} onClick={sendMessage}>전송</button>
                </div>
            </>
        );
    }, [
        currentChatRoom,
        chatRoomUserListClass,
        toggleChatRoomUserList,
        chatRoomUsers,
        chatContentsRef,
        chatMessageInputRef,
        chatContents,
        onKeyUpMessage,
        changeMessage,
        sendMessage,
        exitChatRoom,
        user,
        createUser,
        copyShareLink,
        isProd,
        message
    ]);

    return (
        <main className={styles.main}>
            {contents()}
        </main>
    );
}

ChatRoom.getLayout = function getLayout(page: ReactElement) {
    return (
        <ChatRoomLayout>{page}</ChatRoomLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        props: {
            isProd: ("production" === process.env.NODE_ENV)
        }
    };
}

export default ChatRoom;