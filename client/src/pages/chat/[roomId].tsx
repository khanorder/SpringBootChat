import {ChangeEvent, createRef, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import ChatRoomLayout from "@/components/layouts/chatRoom";
import {GetServerSideProps, NextPageContext} from "next";
import {useRouter} from "next/router";
import styles from "@/styles/chat.module.sass";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Defines} from "@/defines";
import {dayjs} from "@/helpers/localizedDayjs";
import isEmpty from "lodash/isEmpty";
import {enterChatRoomReq, exitChatRoomReq, saveUserNameReq, sendMessageReq} from "@/stores/reducers/webSocket";
import {Domains} from "@/domains";
import {setUserName} from "@/stores/reducers/user";
import Link from "next/link";
import {Helpers} from "@/helpers";
import Picture from 'public/images/Picture_icon_BLACK.svg';
import UserIcon from 'public/images/user-circle.svg';
import ModifyIcon from 'public/images/modify-icon.svg';
import Image from "next/image";
import Head from "next/head";
import Layout from "@/components/layouts";
import {CommonAPI} from "@/apis/commonAPI";

interface ChatRoomProps {
    isProd: boolean;
    roomId: string;
    roomName: string;
}

function ChatRoom({isProd, roomId, roomName}: ChatRoomProps) {
    const firstRender = useRef(true);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const [chatRoomUserListClass, setChatRoomUserListClass] = useState<string>(styles.chatUserList);
    const chatContentsRef = createRef<HTMLUListElement>();
    const chatMessageInputRef = createRef<HTMLTextAreaElement>();
    const [message, setMessage] = useState<string>('');
    const chatImageInputRef = createRef<HTMLInputElement>();
    const [chatImage, setChatImage] = useState<string|ArrayBuffer|null>(null);
    const [chatImageDialogWrapperClass, setChatImageDialogWrapperClass] = useState<string>(styles.chatImageDialogWrapper)
    const [currentChatRoom, setCurrentChatRoom] = useState<Domains.ChatRoom|null|undefined>(null);
    const [newUserName, setNewUserName] = useState<string>('');

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

            if (!isEmpty(roomId))
                setCurrentChatRoom(chat.roomList.find(_ => _.roomId == Helpers.getUUIDFromBase62(roomId)));
        }

    }, [firstRender, chat, roomId, setCurrentChatRoom, chatContentsRef]);

    // useEffect(() => {
    //     if (chatMessageInputRef.current)
    //         chatMessageInputRef.current.focus();
    //
    // }, [currentChatRoom, chatMessageInputRef]);

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
            dispatch(sendMessageReq({type: Defines.ChatType.TALK, roomId: Helpers.getUUIDFromBase62(roomId?.toString() ?? ''), message: message}));
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
    }, [sendMessage]);

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
        if (e.key == 'Enter')
            onSaveUserName();
    }, [onSaveUserName]);

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

    const chatContents = useCallback(() => {
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
                                    <div className={chatMessageClass}
                                         dangerouslySetInnerHTML={{__html: chatData.message.replaceAll('\n', '<br />')}}></div>
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
                                        <img className={styles.chatImage} src={chatData.message} alt={chatData.id + ' 이미지'} />
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

        return contents;
    }, [chat, user, isProd]);

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
            <>
                <div className={styles.chatroomInputNotice}>
                    {isProd ? `${roomName}' 대화방에 입장하시겠습니까?.` : ''}
                </div>
                <div className={styles.chatRoomInputWrapper}>
                    <button className={styles.enterChatRoomButton} onClick={enterChatRoom}>입장</button>
                </div>
            </>
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

    const onChangeChatImageFile = useCallback(async () => {
        if (chatImageInputRef.current?.files && 0 < chatImageInputRef.current?.files.length) {
            const file = chatImageInputRef.current?.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    if (!e?.target?.result)
                        return;

                    const origDataURL = 'string' == typeof reader.result ? reader.result : '';
                    const resizeDataURL = await Helpers.getDataURLResizeImage(origDataURL, 150, 150, file.type);
                    setChatImage(resizeDataURL);
                }
                reader.readAsDataURL(file);
            }
            setChatImageDialogWrapperClass(`${styles.chatImageDialogWrapper} ${styles.active}`);
        }
    }, [chatImageInputRef, setChatImage, setChatImageDialogWrapperClass]);

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

        if (1 > chat.roomUserList.length)
            return enterUser();

        return (
            <>
                <div className={styles.chatRoomTitleWrapper}>
                    <button className={styles.chatRoomShare} onClick={copyShareLink}>공유</button>
                    <button className={styles.chatRoomNotify} onClick={subscribeChatRoomNotify}>알림</button>
                    <span className={styles.chatRoomTitle}>{roomName}</span>
                    <button className={styles.chatRoomExit} onClick={exitChatRoom}>나가기</button>
                </div>
                <div className={styles.chatContentsWrapper}>
                    <ul className={chatRoomUserListClass}>
                        {chatRoomUsers()}
                    </ul>
                    <ul className={styles.chatContentsList} ref={chatContentsRef}>
                        {chatContents()}
                    </ul>
                </div>
                <div className={styles.chatMessageInputTopWrapper}>
                    <div className={styles.chatMessageLength}>{message.length}/300</div>
                    <div className={styles.chatImageButtonWrapper}>
                        <label className={styles.chatImageButton} htmlFor='chatImageInput'>
                            <Image src={Picture} alt={'이미지 전송'} width={20} height={20} />
                        </label>
                        <input ref={chatImageInputRef} onChange={onChangeChatImageFile} className={styles.chatImageInput} id='chatImageInput' type='file' accept='image/*' />
                    </div>
                </div>
                <div className={styles.chatMessageInputWrapper}>
                    <textarea ref={chatMessageInputRef}
                              value={message}
                              className={styles.chatMessageInput}
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
        chat,
        currentChatRoom,
        roomName,
        chatRoomUserListClass,
        chatRoomUsers,
        chatImageInputRef,
        onChangeChatImageFile,
        chatContentsRef,
        chatMessageInputRef,
        chatContents,
        onKeyUpMessage,
        changeMessage,
        sendMessage,
        exitChatRoom,
        enterUser,
        copyShareLink,
        isProd,
        subscribeChatRoomNotify,
        message
    ]);

    const hideChatImageDialog = useCallback(() => {
        setChatImageDialogWrapperClass(styles.chatImageDialogWrapper);
        setChatImage('');
        if (chatImageInputRef.current)
            chatImageInputRef.current.value = '';
    }, [setChatImageDialogWrapperClass, setChatImage, chatImageInputRef]);

    const onSendImage = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(user.id)) {
            alert('채팅방에 입장해 주세요.');
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해 주세요.');
        } else if (isEmpty(chatImage)) {
            alert('이미지를 선택해 주세요.');
            hideChatImageDialog();
        } else if (!chatImageInputRef.current || !chatImageInputRef.current.files || 1 > chatImageInputRef.current.files.length) {
            alert(`전송할 이미지를 선택해주세요.`);
        } else if (10485760 < chatImageInputRef.current.files[0].size) {
            alert(`파일크기 10MB 이하의 이미지만 전송 가능합니다.`);
        } else {
            dispatch(sendMessageReq({ type: Defines.ChatType.IMAGE, roomId: Helpers.getUUIDFromBase62(roomId?.toString() ?? ''), message: 'string' == typeof chatImage ? chatImage : ''}));
            hideChatImageDialog();
        }
    }, [webSocket, user, chatImage, chatImageInputRef, roomId, hideChatImageDialog, dispatch]);

    const chatImageDialog = useCallback(() =>  {
        return (
            <div className={chatImageDialogWrapperClass}>
                <div className={styles.chatImageDialog}>
                    <div className={styles.chatImageDialogContent}>
                        {
                            chatImage
                            ?
                                <img className={styles.chatImageThumb} src={'string' == typeof chatImage ? chatImage : Picture} alt='업로드 파일' />
                            :
                                <></>
                        }
                    </div>
                    <div className={styles.chatImageDialogButtons}>
                        <button className={styles.chatImageDialogButton} onClick={onSendImage}>전송</button>
                        <button className={styles.chatImageDialogButton} onClick={hideChatImageDialog}>취소</button>
                    </div>
                </div>
                <div className={styles.chatImageDialogPane} onClick={hideChatImageDialog}></div>
            </div>
        );
    }, [chatImageDialogWrapperClass, chatImage, hideChatImageDialog, onSendImage]);

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
            <main className={styles.main}>
                {chatImageDialog()}
                {contents()}
            </main>
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
    const serverHost = process.env.SERVER_HOST ?? 'localhost:8080';

    const url = ('production' === process.env.NODE_ENV ? 'https://' : 'http://') + serverHost + "/api/room/" + Helpers.getUUIDFromBase62(roomId as string ?? '');
    try {
        const response = await fetch(`${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (200 == response.status) {
            const json = await response.json();
            if (json.roomId && json.roomName) {
                roomNameProp = json.roomName;
            }
        }
    } catch (error) {
        console.error(error);
    }

    return {
        props: {
            isProd: ("production" === process.env.NODE_ENV),
            roomId: roomId,
            roomName: roomNameProp
        }
    };
}

export default ChatRoom;