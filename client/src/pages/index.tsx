import styles from 'src/styles/index.module.css'
import chatStyles from 'src/styles/chat.module.css'
import {
    ChangeEvent,
    createRef,
    ReactElement,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import {v4 as uuid} from 'uuid';
import {Helpers} from "@/helpers";
import {Defines} from "@/defines";
import {Errors} from "@/defines/errors";
import {Domains} from "@/domains";
import deepmerge from "deepmerge";
import { dayjs } from '@/helpers/localizedDayjs';
import {NextPageContext} from "next";
import DefaultLayout from "@/components/layouts/default";

interface HomeProps {
    isProd: boolean;
    serverHost: string;
}

function Home({ isProd, serverHost }: HomeProps) {
    const firstRender = useRef(true);
    const [chatSocket, setWebsocket] = useState<WebSocket|null>(null);
    const [socketState, setSocketState] = useState<0|1|2|3>(WebSocket.CLOSED);
    const [chatRoomId, setChatRoomId] = useState<string>('');
    const [chatRoomName, setChatRoomName] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [chatRoomList, setChatRoomList] = useState<Domains.ChatRoom[]>([]);
    const [chatRoomUserList, setChatRoomUserList] = useState<Domains.ChatRoomUser[]>([]);
    const [chatDatas, setChatDatas] = useState<Domains.Chat[]>([]);
    const [message, setMessage] = useState<string>('');
    const [chatRoomUserListClass, setChatRoomUserListClass] = useState<string>(chatStyles.chatUserList);
    const chatContentsRef = createRef<HTMLUListElement>();

    const connect = useCallback(() => {
        setSocketState(WebSocket.CONNECTING);
        if (null == chatSocket || WebSocket.CLOSED === socketState) {
            setUserId('');
            setUserName('');
            setChatRoomId('');
            setChatRoomName('');
            setChatRoomList([]);
            setChatRoomUserList([]);
            setChatDatas([]);
            const newChatSocket = new WebSocket(`${isProd ? 'wss' : 'ws'}://${serverHost}/ws/chat`);
            newChatSocket.binaryType = 'arraybuffer';

            newChatSocket.onopen = function (e) {
                console.log('open server!')
                setSocketState(WebSocket.OPEN);
            };

            newChatSocket.onclose=function(e){
                console.log('disconnect');
                setSocketState(WebSocket.CLOSED);
            }

            newChatSocket.onerror = function (e){
                console.log(e);
                setSocketState(WebSocket.CLOSING);
            }

            //메세지 수신했을 때 이벤트.
            newChatSocket.onmessage = function (e) {
                if (e.data instanceof ArrayBuffer) {
                    const byteLen = e.data.byteLength;
                    if (1 < byteLen) {
                        const flag= new Uint8Array(e.data, 0, 1);

                        switch (flag[0]) {
                            case Defines.PacketType.CREATE_CHAT_ROOM:
                                const createChatRoomRes = Domains.CreateChatRoomRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));
                                if (null == createChatRoomRes) {
                                    alert('데이터 형식 오류.');
                                    return;
                                }

                                switch (createChatRoomRes.result) {
                                    case Errors.CreateChatRoom.NONE:
                                        setMessage('');
                                        setChatDatas([]);
                                        setChatRoomId(createChatRoomRes.roomId);
                                        setUserId(createChatRoomRes.userId);
                                        break;

                                    case Errors.CreateChatRoom.EXISTS_ROOM:
                                        alert('이미 개설된 채팅방 이름입니다.');
                                        break;
                                }
                                break;

                            case Defines.PacketType.UPDATE_CHAT_ROOMS:
                                const updateChatRoomsRes= Domains.UpdateChatRoomsRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));
                                setChatRoomList([]);
                                if (null != updateChatRoomsRes && 0 < updateChatRoomsRes.roomIds.length) {
                                    const list: Domains.ChatRoom[] = [];
                                    for (let i = 0; i < updateChatRoomsRes.roomIds.length; i++) {
                                       list.push(new Domains.ChatRoom(updateChatRoomsRes.roomIds[i], updateChatRoomsRes.roomNames[i]));

                                    }
                                    setChatRoomList(list);
                                }
                                break;

                            case Defines.PacketType.UPDATE_CHAT_ROOM:
                                const updateChatRoomUsersRes= Domains.UpdateChatRoomUsersRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));
                                setChatRoomUserList([]);
                                if (null != updateChatRoomUsersRes && 0 < updateChatRoomUsersRes.userIds.length) {
                                    const list: Domains.ChatRoomUser[] = [];
                                    for (let i = 0; i < updateChatRoomUsersRes.userIds.length; i++) {
                                        list.push(new Domains.ChatRoomUser(updateChatRoomUsersRes.userIds[i], updateChatRoomUsersRes.userNames[i]));

                                    }
                                    setChatRoomUserList(list);
                                }
                                break;

                            case Defines.PacketType.ENTER_CHAT_ROOM:
                                const enterChatRoomRes = Domains.EnterChatRoomRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));

                                if (null == enterChatRoomRes) {
                                    alert('데이터 형식 오류.');
                                    return;
                                }

                                switch (enterChatRoomRes.result) {
                                    case Errors.EnterChatRoom.NONE:
                                        setMessage('');
                                        setChatDatas([]);
                                        setChatRoomId(enterChatRoomRes.roomId);
                                        setUserId(enterChatRoomRes.userId);
                                        const chatRoom = chatRoomList.find(_ => _.roomId == enterChatRoomRes.roomId);
                                        setChatRoomName(chatRoom?.roomName ?? '');
                                        break;

                                    case Errors.EnterChatRoom.NO_EXISTS_ROOM:
                                        alert('그런 채팅방은 없습니다..');
                                        break;

                                    case Errors.EnterChatRoom.ALREADY_IN_ROOM:
                                        alert('이미 입장한 채팅방 입니다.');
                                        break;
                                }
                                break;

                            case Defines.PacketType.EXIT_CHAT_ROOM:
                                const exitChatRoomRes = Domains.ExitChatRoomRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));

                                if (null == exitChatRoomRes) {
                                    alert('데이터 형식 오류.');
                                    return;
                                }

                                switch (exitChatRoomRes.result) {
                                    case Errors.ExitChatRoom.NONE:
                                        break;

                                    case Errors.ExitChatRoom.ROOM_REMOVED:
                                        alert('삭제된 채팅방입니다.');
                                        break;

                                    case Errors.ExitChatRoom.NO_EXISTS_ROOM:
                                        alert('그 채팅방은 없습니다.');
                                        break;

                                    case Errors.ExitChatRoom.NOT_IN_ROOM:
                                        alert('현재 그 채팅방에 입장중이 아닙니다.');
                                        break;

                                    case Errors.ExitChatRoom.FAILED_TO_EXIT:
                                        alert('채팅방 나가기 실패.');
                                        break;
                                }
                                setChatDatas([]);
                                setChatRoomId('');
                                setChatRoomName('');
                                setUserId('');
                                setUserName('');
                                setMessage('');
                                setChatRoomUserList([]);
                                break;

                            case Defines.PacketType.NOTICE_ENTER_CHAT_ROOM:
                                const noticeEnterChatRoomRes = Domains.NoticeEnterChatRoomRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));

                                const enterNotice = new Domains.Chat(Defines.ChatType.NOTICE, chatRoomId, uuid(), uuid(), new Date().getTime(), '', `'${noticeEnterChatRoomRes?.userName}'님이 입장했습니다.`);
                                setChatDatas(prev => {
                                    if (null == prev)
                                        return [];

                                    prev.push(enterNotice);
                                    return deepmerge([], prev);
                                });
                                break;

                            case Defines.PacketType.NOTICE_EXIT_CHAT_ROOM:
                                const noticeExitChatRoomRes = Domains.NoticeExitChatRoomRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));

                                const exitNotice = new Domains.Chat(Defines.ChatType.NOTICE, chatRoomId, uuid(), uuid(), new Date().getTime(), '', `'${noticeExitChatRoomRes?.userName}'님이 퇴장했습니다.`);
                                setChatDatas(prev => {
                                    if (null == prev)
                                        return [];

                                    prev.push(exitNotice);
                                    return deepmerge([], prev);
                                });
                                break;

                            case Defines.PacketType.TALK_CHAT_ROOM:
                                const chatRes = Domains.Chat.decode(new Uint8Array(e.data, 2, byteLen - 2).slice(0, byteLen - 2));
                                setChatDatas(prev => {
                                    if (null == prev)
                                        return [];

                                    prev.push(chatRes as Domains.Chat);
                                    return deepmerge([], prev);
                                });
                                break;
                        }
                    }
                } else {

                }
            }

            setWebsocket(newChatSocket);
        } else {
            console.log('이미 연결중');
        }
    }, [
        isProd,
        serverHost,
        chatSocket,
        socketState,
        chatRoomList,
        chatRoomId,
        chatDatas,
        setWebsocket,
        setSocketState,
        setChatRoomName,
        setChatRoomId,
        setUserId,
        setUserName,
        setChatRoomList,
        setChatDatas
    ]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            connect();
        }

    }, [firstRender, socketState, connect]);
    //#endregion

    useEffect(() => {
        if (!firstRender.current) {
            if (chatContentsRef.current?.scrollHeight)
                chatContentsRef.current.scrollTop = chatContentsRef.current.scrollHeight;
        }

    }, [firstRender, chatDatas, chatContentsRef]);

    const createChatRoom = useCallback(() => {
        if (null == chatSocket) {
            alert('연결 안됨');
        } else if ('' == chatRoomName) {
            alert('채팅방 정보를 입력해주세요.');
        } else if (10 < chatRoomName.length) {
            alert('채팅방 이름은 10글자 이내로 입력해주세요.');
        } else if ('' == userName) {
            alert('대화명을 입력해주세요.');
        } else if (10 < userName.length) {
            alert('대화명은 10글자 이내로 입력해주세요.');
        } else if ('' != chatRoomId) {
            alert('이미 채팅방에 들어와 있습니다.');
        } else {
            const flag = new Uint8Array(1);
            flag[0] = Defines.PacketType.CREATE_CHAT_ROOM;
            const bytesChatRoomName = new Uint8Array(Buffer.from(chatRoomName.trim(), 'utf-8'));
            const bytesUserName = new Uint8Array(Buffer.from(userName.trim(), 'utf-8'));
            const bytesChatRoomNameLength = Helpers.getByteArrayFromInt(bytesChatRoomName.byteLength);
            const bytesUserNameLength = Helpers.getByteArrayFromInt(bytesUserName.byteLength);
            const packet = new Uint8Array(flag.byteLength + 8 + bytesChatRoomName.byteLength + bytesUserName.byteLength);
            packet.set(flag);
            packet.set(bytesChatRoomNameLength, flag.byteLength);
            packet.set(bytesUserNameLength, flag.byteLength + 4);
            packet.set(bytesChatRoomName, flag.byteLength + 8);
            packet.set(bytesUserName, flag.byteLength + 8 + bytesChatRoomName.byteLength);
            chatSocket.send(packet);
        }
    }, [chatSocket, chatRoomId, chatRoomName, userName]);

    const enterChatRoom = useCallback((enterChatRoomId: string) => {
        if (null == chatSocket) {
            alert('연결 안됨');
        } else if ('' == enterChatRoomId) {
            alert('채팅방 정보 없음');
        } else if ('' == userName) {
            alert('대화명을 입력해 주세요.');
        } else if (10 < userName.length) {
            alert('대화명은 10글자 이내로 입력해주세요.');
        } else {
            const flag = new Uint8Array(1);
            flag[0] = Defines.PacketType.ENTER_CHAT_ROOM;
            const bytesChatRoomId = Helpers.getByteArrayFromUUID(enterChatRoomId.trim());
            const bytesUserName = new Uint8Array(Buffer.from(userName.trim(), 'utf8'));
            const packet = new Uint8Array(flag.byteLength + bytesChatRoomId.byteLength + bytesUserName.byteLength);
            packet.set(flag);
            packet.set(bytesChatRoomId, flag.byteLength);
            packet.set(bytesUserName, flag.byteLength + bytesChatRoomId.byteLength);
            chatSocket.send(packet);
        }
    }, [chatSocket, userName]);

    const exitChatRoom = useCallback(() => {
        if (null == chatSocket) {
            alert('연결 안됨');
        } else if ('' == chatRoomId) {
            alert('채팅방 정보 없음');
        } else {
            const flag = new Uint8Array(1);
            flag[0] = Defines.PacketType.EXIT_CHAT_ROOM;
            const message = Helpers.getByteArrayFromUUID(chatRoomId);
            const packet = new Uint8Array(flag.byteLength + message.byteLength);
            packet.set(flag);
            packet.set(message, flag.byteLength);
            chatSocket.send(packet);
        }
    }, [chatSocket, chatRoomId]);

    const sendMessage = useCallback(() => {
        if (null == chatSocket) {
            alert('연결 안됨');
        } else if ('' == chatRoomId) {
            alert('채팅방에 입장해 주세요.');
        } else if ('' == userId) {
            alert('채팅방에 입장해 주세요.');
        } else if ('' == userName) {
            alert('대화명을 입력해 주세요.');
        } else if ('' == message.trim()) {
            alert('메세지를 입력해 주세요.');
            setMessage(message.trim());
        } else {
            const flag = new Uint8Array(1);
            flag[0] = Defines.PacketType.TALK_CHAT_ROOM;
            const bytesChatRoomId = Helpers.getByteArrayFromUUID(chatRoomId.trim());
            const bytesUserId = Helpers.getByteArrayFromUUID(userId.trim());
            const bytesMessage = new Uint8Array(Buffer.from(message.trim(), 'utf8'));
            const bytesMessageByteLength = Helpers.getByteArrayFromInt(bytesMessage.byteLength);

            const packet = new Uint8Array(flag.byteLength + bytesChatRoomId.byteLength + bytesUserId.byteLength + bytesMessageByteLength.length + bytesMessage.byteLength);
            packet.set(flag);
            packet.set(bytesChatRoomId, flag.byteLength);
            packet.set(bytesUserId, flag.byteLength + bytesChatRoomId.byteLength);
            packet.set(bytesMessageByteLength, flag.byteLength + bytesChatRoomId.byteLength + bytesUserId.byteLength);
            packet.set(bytesMessage, flag.byteLength + bytesChatRoomId.byteLength + bytesUserId.byteLength + bytesMessageByteLength.length);

            chatSocket.send(packet);
            setMessage('');
        }
    }, [chatSocket, chatRoomId, userId, userName, message, setMessage]);

    const onKeyUpChatRoomName = useCallback((e: any) => {
        if (e.key == 'Enter')
            createChatRoom();
    }, [createChatRoom]);

    const changeChatRoomName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value && 10 < e.target.value.toString().length) {
            alert('채팅방 이름은 10글자 이내로 입력해주세요.')
            setChatRoomName(prev => {
                if (null == prev) {
                    return '';
                }

                return prev.trim();
            });
        } else {
            setChatRoomName(e.target.value ? e.target.value.trim() : '');
        }
    }, [setChatRoomName]);

    const onKeyUpUserName = useCallback((e: any) => {
        if (e.key == 'Enter')
            createChatRoom();
    }, [createChatRoom]);

    const changeUserName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value && 10 < e.target.value.toString().length) {
            alert('대화명은 10글자 이내로 입력해주세요.')
            setUserName(prev => {
                if (null == prev) {
                    return '';
                }

                return prev.trim();
            });
        } else {
            setUserName(e.target.value ? e.target.value.trim() : '');
        }
    }, [setUserName]);

    const onKeyUpMessage = useCallback((e: any|KeyboardEvent) => {
        if (e.shiftKey && e.key == "Enter") {
            // 쉬프트 엔터 줄바꿈 허용
        } else if (e.key == 'Enter') {
            sendMessage();
        }
    }, [sendMessage]);

    const changeMessage = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value && 300 < e.target.value.toString().length) {
            alert('채팅내용은 300글자 이내로 입력해주세요.')
            setMessage(prev => {
                if (null == prev) {
                    return '';
                }

                return prev.trim();
            });
        } else {
            setMessage(e.target.value ?? '');
        }
    }, [setMessage]);

    const chatRooms = useCallback(() => {
        if (null == chatRoomList || 1 > chatRoomList.length) {
            return (
                <ul className={chatStyles.chatRoomList}>
                    <li className={chatStyles.chatRoomListItem}>{isProd ? '개설된 채팅방이 없습니다.' : ''}</li>
                </ul>
            );
        } else {
            const list: ReactElement[] = [];
            for (let i = 0; i < chatRoomList.length; i++) {
                list.push(
                    <li key={i} className={chatStyles.chatRoomListItem}>
                        <button className={chatStyles.chatRoomEnterButton} onClick={e => enterChatRoom(chatRoomList[i].roomId)}>{chatRoomList[i].roomName}{isProd ? ` 채팅방 입장` : ''}</button>
                    </li>
                )
            }

            return (
                <ul className={chatStyles.chatRoomList}>{list}</ul>
            );
        }
    }, [chatRoomList, enterChatRoom, isProd]);

    const chatRoomUsers = useCallback(() => {
        const users: ReactElement[] = [];
        users.push(<li key={'userCount'} className={chatStyles.chatRoomUserCount}>{`참여인원: ${chatRoomUserList.length} 명`}</li>)

        if (0 < chatRoomUserList.length) {
            for (let i = 0; i < chatRoomUserList.length; i++) {
                users.push(<li key={i} className={chatStyles.chatRoomUser}>{chatRoomUserList[i].userName}</li>);
            }
        }

        return users;
    }, [chatRoomUserList]);

    const chatContents = useCallback(() => {
        const contents: ReactElement[] = [];

        if (0 < chatDatas.length) {
            for (let i = 0; i < chatDatas.length; i++) {
                let chat = chatDatas[i];
                switch (chat.type) {
                    case Defines.ChatType.NOTICE:
                        contents.push(<li key={i} style={{ listStyle: 'none', textAlign: 'center', marginTop: 5, padding: 5, borderRadius: 8, background: '#e9e9e9' }}>{chat.message}</li>);
                        break;

                    case Defines.ChatType.TALK:
                        contents.push(
                            <li key={i} style={{ listStyle: 'none', display: 'flex', marginTop: 5, justifyContent: userId == chat.userId ? 'end' : 'start' }}>
                                <div style={{ flex: '0 1 auto', display: 'flex', flexDirection: 'column' }}>
                                    {
                                        userId == chat.userId
                                            ?
                                            <></>
                                            :
                                            <div style={{ marginBottom: 5, fontSize: 13 }}>{chat.userName}</div>
                                    }
                                    <div style={{ display: 'block', border: (userId == chat.userId ? '1px solid #3399dd' : '1px solid #d9d9d9'), borderRadius: 8, textAlign: 'left', marginLeft: 8, marginRight: 8, padding: 8, background: (userId == chat.userId ? '#66bbff' : '#ffffff'), color: (userId == chat.userId ? '#ffffff' : '#000000') }} dangerouslySetInnerHTML={{ __html: chat.message.replaceAll('\n', '<br />') }}></div>
                                    <div style={{ marginTop: 5, fontSize: 12, textAlign: 'right' }}>{dayjs(chat.time).fromNow(true)}</div>
                                </div>
                            </li>
                        );
                        break;
                }
            }
        } else {
            contents.push(<li key={'none'} style={{ listStyle: 'none', textAlign: 'center' }}>{isProd ? '채팅 내용이 없습니다.' : ''}</li>);
        }

        return contents;
    }, [chatDatas, userId, isProd]);

    const toggleChatRoomUserList = useCallback(() => {
        setChatRoomUserListClass(prev => {
            if (null == prev || '' == prev)
                return chatStyles.chatUserList;

            if (chatStyles.chatUserList == prev) {
                return chatStyles.chatUserList + ' ' + chatStyles.chatUserListScroll;
            } else if (`${chatStyles.chatUserList} ${chatStyles.chatUserListScroll}` == prev) {
                return chatStyles.chatUserList;
            } else {
                return chatStyles.chatUserList;
            }
        });
    }, [setChatRoomUserListClass]);

    const contents = useCallback(() => {
        return (
            <>
                {
                    chatSocket && WebSocket.OPEN === socketState
                        ?
                        (
                            '' == chatRoomId || '' == userId
                                ?
                                <>
                                    <div className={chatStyles.chatRoomInputWrapper}>
                                        <input className={chatStyles.userNameInput} value={userName} onKeyUp={e => onKeyUpUserName(e)} onChange={e => changeUserName(e)} placeholder={isProd ? '대화명' : '' } />
                                        <input className={chatStyles.roomNameInput} value={chatRoomName} onKeyUp={e => onKeyUpChatRoomName(e)} onChange={e => changeChatRoomName(e)} placeholder={isProd ? '채팅방 이름' : ''} />
                                        <button className={chatStyles.createRoomButton} onClick={createChatRoom}>만들기</button>
                                    </div>
                                    <div className={chatStyles.chatRoomListWrapper}>
                                        {chatRooms()}
                                    </div>
                                </>
                                :
                                <>
                                    <div className={chatStyles.chatContentsWrapper}>
                                        <ul className={chatRoomUserListClass} onClick={toggleChatRoomUserList}>
                                            {chatRoomUsers()}
                                        </ul>
                                        <ul className={chatStyles.chatContentsList} ref={chatContentsRef}>
                                            {chatContents()}
                                        </ul>
                                    </div>
                                    <div className={chatStyles.chatMessageInputWrapper}>
                                        <textarea value={message} style={{ flex: '1 1 auto', padding: 5, resize: 'none' }} onKeyUp={e => onKeyUpMessage(e)} onChange={e => changeMessage(e)} placeholder={isProd ? '메세지를 입력해 주세요.' : ''}>
                                            {message}
                                        </textarea>
                                        <button style={{ marginLeft: 5, padding: '0 5px' }} onClick={sendMessage}>전송</button>
                                        <button style={{ marginLeft: 5, padding: '0 5px' }} onClick={exitChatRoom}>나가기</button>
                                    </div>
                                </>
                        )
                        :
                        <div style={{ textAlign: 'center' }}></div>
                }
            </>
        );
    }, [
        isProd,
        chatSocket,
        socketState,
        chatRoomId,
        chatRoomName,
        userId,
        userName,
        changeChatRoomName,
        changeUserName,
        createChatRoom,
        message,
        sendMessage,
        chatRooms,
        exitChatRoom,
        changeMessage,
        chatContents,
        chatRoomUsers,
        onKeyUpUserName,
        onKeyUpChatRoomName,
        onKeyUpMessage,
        toggleChatRoomUserList,
        chatRoomUserListClass,
        chatContentsRef
    ]);

    return (
        <main className={styles.main}>
            {contents()}
        </main>
    )
}

Home.getLayout = function getLayout(page: ReactElement) {
    return (
        <DefaultLayout>{page}</DefaultLayout>
    );
}

Home.getInitialProps = ({ res, err }: NextPageContext) => {
    let serverHost: string = process.env.SERVER_HOST ?? "";
    if ('undefined' == typeof serverHost || null == serverHost || '' == serverHost)
        return { notFound: true };

    return { isProd: ("production" === process.env.NODE_ENV), serverHost: serverHost };
}

export default Home;