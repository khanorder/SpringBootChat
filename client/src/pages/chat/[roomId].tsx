import {ChangeEvent, createRef, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import ChatRoomLayout from "@/components/layouts/chatRoom";
import {GetServerSideProps} from "next";
import styles from "@/styles/chat.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {enterChatRoomReq, exitChatRoomReq, saveUserNameReq, sendMessageReq} from "@/stores/reducers/webSocket";
import {Domains} from "@/domains";
import {setUserName} from "@/stores/reducers/user";
import {Helpers} from "@/helpers";
import UserIcon from 'public/images/user-circle.svg';
import Image from "next/image";
import Head from "next/head";
import Layout from "@/components/layouts";
import {CommonAPI} from "@/apis/commonAPI";
import dynamic from "next/dynamic";
const ChatInput = dynamic(() => import("@/components/chatContents/chatInput"), { ssr: false });
const ChatImageInputDialog = dynamic(() => import("@/components/dialogs/chatImageInputDialog"), { ssr: false });
const NotFoundChatRoom = dynamic(() => import("@/components/chatContents/notFoundChatRoom"), { ssr: false });
const ChatImageDetailDialog = dynamic(() => import("@/components/dialogs/chatImageDetailDialog"), { ssr: false });
const ChatContents = dynamic(() => import("@/components/chatContents/chatContents"), { ssr: false });

interface ChatRoomProps {
    isProd: boolean;
    roomId: string;
    roomName: string;
    roomOpenType: Defines.RoomOpenType;
    serverHost: string;
}

function ChatRoom({isProd, roomId, roomName, roomOpenType, serverHost}: ChatRoomProps) {
    const firstRender = useRef(true);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const [chatRoomUserListClass, setChatRoomUserListClass] = useState<string>(styles.chatUserList);
    const chatMessageInputRef = createRef<HTMLTextAreaElement>();
    const [message, setMessage] = useState<string>('');
    const chatImageInputRef = createRef<HTMLInputElement>();
    const [chatLargeImage, setChatLargeImage] = useState<string|ArrayBuffer|null>(null);
    const [chatSmallImage, setChatSmallImage] = useState<string|ArrayBuffer|null>(null);
    const [chatDetailImageId, setChatDetailImageId] = useState<string>('');
    const [currentChatRoom, setCurrentChatRoom] = useState<Domains.ChatRoom|null|undefined>(null);
    const [newUserName, setNewUserName] = useState<string>('');

    useEffect(() => {
        if (firstRender.current) {
            if (!isEmpty(roomId) && !isEmpty(roomName))
                setCurrentChatRoom(new Domains.ChatRoom(roomId, roomName, roomOpenType,0));
        } else {
            if (!isEmpty(roomId))
                setCurrentChatRoom(chat.roomList.find(_ => _.roomId == Helpers.getUUIDFromBase62(roomId)));
        }

    }, [firstRender, chat, roomId, roomName, roomOpenType, setCurrentChatRoom]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const exitChatRoom = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(roomId)) {
            alert('채팅방 정보 없음');
        } else {
            dispatch(exitChatRoomReq(Helpers.getUUIDFromBase62(roomId?.toString() ?? '')));
        }
    }, [webSocket, dispatch, roomId]);

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

    const onSaveUserName = useCallback(() => {
        if (!newUserName || 2 > newUserName.length) {
            alert('대화명은 2글자 이상으로 입력해주세요.');
            dispatch(setUserName(user.name));
            return;
        }

        if (10 < newUserName.length) {
            alert('대화명은 10글자 이내로 입력해 주세요.');
            dispatch(setUserName(user.name));
            return;
        }

        if (newUserName != user.name) {
            dispatch(setUserName(newUserName))
            dispatch(saveUserNameReq());
        }
    }, [dispatch, user, newUserName]);

    const onKeyUpUserName = useCallback((e: any) => {
        if (e.key == 'Enter') {
            chatMessageInputRef.current?.focus();
        }
    }, [chatMessageInputRef]);

    const onChangeUserName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setNewUserName(e.target.value.trim());
    }, [setNewUserName]);

    const chatRoomUsers = useCallback(() => {
        const users: ReactElement[] = [];
        users.push(<li key={'userCount'} className={styles.chatRoomUserCount} onClick={toggleChatRoomUserList}>{`참여인원: ${chat.roomUserList.length} 명`}</li>);

        if (0 < chat.roomUserList.length) {
            for (let i = 0; i < chat.roomUserList.length; i++) {
                let chatRoomUserClass = styles.chatRoomUser;
                if (chat.roomUserList[i].userId == user.id)
                    chatRoomUserClass += ' ' + styles.mine;

                users.push(
                    <li key={i} className={chatRoomUserClass}>
                        <div className={styles.chatRoomUserIcon}>
                            <Image className={styles.chatRoomUserIconImage} src={UserIcon} alt='채팅방 입장 사용자' fill={true} priority={true} />
                        </div>
                        <div className={styles.chatRoomUserName}>
                            <div className={styles.currentUserName}>{chat.roomUserList[i].userName}</div>
                            {
                                chat.roomUserList[i].userId == user.id
                                    ?
                                    <div className={styles.userNameInputWrapper}>
                                        <input className={styles.userNameInput} value={newUserName}
                                               onKeyUp={e => onKeyUpUserName(e)}
                                               onChange={e => onChangeUserName(e)}
                                               onBlur={onSaveUserName}
                                               onFocus={e => { setNewUserName(user.name) }}
                                               placeholder={isProd ? '대화명' : ''}/>
                                    </div>
                                    :
                                    <></>
                            }
                        </div>
                    </li>
                );
            }
        }

        return users;
    }, [isProd, chat, user, toggleChatRoomUserList, onKeyUpUserName, onChangeUserName, onSaveUserName, newUserName]);

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

    const enterUser = useCallback(() => {
        return (
            <div className={styles.chatRoomEnterWrapper}>
                <div className={styles.chatRoomInputNotice}>
                    {isProd ? `'${roomName}' 대화방에 입장하시겠습니까?` : ''}
                </div>
                <div className={styles.enterChatRoomButtonWrapper}>
                    <button className={`${styles.enterChatRoomButton} ${stylesCommon.button}`} onClick={enterChatRoom}>입장</button>
                </div>
            </div>
        );
    }, [isProd, roomName, enterChatRoom]);

    const copyShareLink = useCallback(() => {
        if (window) {
            const url = `${location.protocol}//${location.hostname}${('' == location.port || '80' == location.port || '443' == location.port ? '' : `:${location.port}`)}/chat/${roomId}`;
            window.navigator.clipboard.writeText(url);
            alert(`채팅방 주소를 복사했습니다.\n(${url})`);
        }
    }, [roomId]);

    const subscribeChatRoomNotify = useCallback(async () => {
        await CommonAPI.SubscribeChatRoom(currentChatRoom?.roomId ?? '', user.id);
    }, [currentChatRoom, user]);

    const contents = useCallback(() => {
        if (!currentChatRoom)
            return <NotFoundChatRoom isProd={isProd} />

        if (1 > chat.roomUserList.length)
            return enterUser();

        return (
            <>
                <div className={styles.chatRoomHeaderWrapper}>
                    <div className={styles.chatRoomTitleWrapper}>
                        <button className={`${styles.chatRoomShare} ${stylesCommon.button}`} onClick={copyShareLink}>공유</button>
                        {/*<button className={`${styles.chatRoomNotify} ${stylesCommon.button}`} onClick={subscribeChatRoomNotify}>알림</button>*/}
                        <span className={styles.chatRoomTitle}>{roomName}</span>
                        <button className={`${styles.chatRoomExit} ${stylesCommon.button}`} onClick={exitChatRoom}>나가기</button>
                    </div>
                    <div className={styles.chatRoomUserListWrapper}>
                        <ul className={chatRoomUserListClass}>
                            {chatRoomUsers()}
                        </ul>
                    </div>
                </div>
                <ChatContents isProd={isProd} serverHost={serverHost} setChatDetailImageId={setChatDetailImageId} />
                <ChatInput
                    roomId={roomId}
                    isProd={isProd}
                    chatImageInputRef={chatImageInputRef}
                    chatMessageInputRef={chatMessageInputRef}
                    message={message}
                    setMessage={setMessage}
                    setChatSmallImage={setChatSmallImage}
                    setChatLargeImage={setChatLargeImage}
                />
            </>
        );
    }, [currentChatRoom, chat, enterUser, copyShareLink, roomName, exitChatRoom, chatRoomUserListClass, chatRoomUsers, isProd, serverHost, roomId, chatImageInputRef, chatMessageInputRef, message]);

    return (
        <>
            <Head>
                <title>{'채팅방 - ' + roomName}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <meta name="title" content={'채팅방 - ' + roomName}/>
                <meta name="subject" content={'채팅방 - ' + roomName}/>
                <meta name="description" content={'채팅방 - ' + roomName}/>
                <meta name="keyword" content={'채팅방 - ' + roomName}/>
                <meta property="og:title" content={'채팅방 - ' + roomName}/>
                <meta property="og:site_name" content={'채팅방 - ' + roomName}/>
                <meta property="og:type" content={'채팅방 - ' + roomName}/>
                <meta property="og:description" content={'채팅방 - ' + roomName}/>
                <meta property="og:image:alt" content={'채팅방 - ' + roomName}/>
                <meta name="twitter:title" content={'채팅방 - ' + roomName}/>
                <meta name="twitter:description" content={'채팅방 - ' + roomName}/>
            </Head>
            <ChatImageDetailDialog
                chatDetailImageId={chatDetailImageId}
                setChatDetailImageId={setChatDetailImageId}
                serverHost={serverHost} />
            <ChatImageInputDialog
                roomId={roomId}
                chatImageInputRef={chatImageInputRef}
                setChatSmallImage={setChatSmallImage}
                setChatLargeImage={setChatLargeImage}
                chatSmallImage={chatSmallImage}
                chatLargeImage={chatLargeImage} />
            {contents()}
        </>
    );
}

ChatRoom.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            <ChatRoomLayout>{page}</ChatRoomLayout>
        </Layout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { roomId } = context.query;
    if (!roomId || isEmpty(roomId)) {
        return {
            props: {
                isProd: ("production" === process.env.NODE_ENV),
                roomId: '',
                roomName: ''
            }
        };
    }

    let roomNameProp: string = '';
    let roomOpenTypeProp: Defines.RoomOpenType = Defines.RoomOpenType.PRIVATE;
    const serverHost = process.env.SERVER_HOST ?? 'localhost:8080';
    const serverHostProp = ('production' === process.env.NODE_ENV ? 'https://' : 'http://') + serverHost;

    const url = serverHostProp + "/api/room/" + Helpers.getUUIDFromBase62(roomId as string ?? '');
    try {
        const response = await fetch(`${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (200 == response.status) {
            const json = await response.json();
            if (json.roomId && json.roomName) {
                roomNameProp = json.roomName;
                roomOpenTypeProp = json.roomOpenType;
            }
        }
    } catch (error) {
        console.error(error);
    }

    return {
        props: {
            isProd: ("production" === process.env.NODE_ENV),
            roomId: roomId,
            roomName: roomNameProp,
            roomOpenType: roomOpenTypeProp,
            serverHost: serverHostProp
        }
    };
}

export default ChatRoom;