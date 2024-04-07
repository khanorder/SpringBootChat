import {ChangeEvent, ReactElement, RefObject, useCallback, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {exitChatRoomReq, saveUserNameReq} from "@/stores/reducers/webSocket";
import styles from "@/styles/chatRoomHeader.module.sass";
import {setUserName} from "@/stores/reducers/user";
import Image from "next/image";
import UserIcon from "public/images/user-circle.svg";
import stylesCommon from "@/styles/common.module.sass";
import {CommonAPI} from "@/apis/commonAPI";
import {Domains} from "@/domains";

export interface ChatRoomHeaderProps {
    chatMessageInputRef: RefObject<HTMLTextAreaElement>;
}

export default function ChatRoomHeader({ chatMessageInputRef }: ChatRoomHeaderProps) {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const [chatRoomUserListClass, setChatRoomUserListClass] = useState<string>(styles.chatUserList);
    const [newUserName, setNewUserName] = useState<string>('');

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const exitChatRoom = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (!chat || isEmpty(chat.currentChatRoomId)) {
            alert('채팅방에 입장한 상태가 아닙니다.');
            return;
        }

        dispatch(exitChatRoomReq(chat.currentChatRoomId));
    }, [webSocket, chat, dispatch]);

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

    const copyShareLink = useCallback(() => {
        if (!chat || isEmpty(chat.currentChatRoomId)) {
            alert('채팅방에 입장한 상태가 아닙니다.');
            return;
        }

        if (window) {
            const url = `${location.protocol}//${location.hostname}${('' == location.port || '80' == location.port || '443' == location.port ? '' : `:${location.port}`)}/chat/${chat.currentChatRoomId}`;
            window.navigator.clipboard.writeText(url);
            alert(`채팅방 주소를 복사했습니다.\n(${url})`);
        }
    }, [chat]);

    const subscribeChatRoomNotify = useCallback(async () => {
        if (!chat || isEmpty(chat.currentChatRoomId)) {
            alert('채팅방에 입장한 상태가 아닙니다.');
            return;
        }

        await CommonAPI.SubscribeChatRoom(chat.currentChatRoomId ?? '', user.id);
    }, [chat, user]);

    const chatRoomUsers = useCallback(() => {
        let chatRoomUsers: Domains.ChatRoomUser[] = [];
        if (chat && !isEmpty(chat.currentChatRoomId)) {
            const chatRoom = chat.chatRooms.find(_ => _.roomId == chat.currentChatRoomId);
            if (chatRoom)
                chatRoomUsers = chatRoom.users;
        }

        const users: ReactElement[] = [];
        users.push(<li key={'userCount'} className={styles.chatRoomUserCount} onClick={toggleChatRoomUserList}>{`참여인원: ${chatRoomUsers.length} 명`}</li>);

        if (0 < chatRoomUsers.length) {
            for (let i = 0; i < chatRoomUsers.length; i++) {
                let chatRoomUserClass = styles.chatRoomUser;
                if (chatRoomUsers[i].userId == user.id)
                    chatRoomUserClass += ' ' + styles.mine;

                users.push(
                    <li key={i} className={chatRoomUserClass}>
                        <div className={styles.chatRoomUserIcon}>
                            <Image className={styles.chatRoomUserIconImage} src={UserIcon} alt='채팅방 입장 사용자' fill={true} priority={true} />
                        </div>
                        <div className={styles.chatRoomUserName}>
                            <div className={styles.currentUserName}>{chatRoomUsers[i].userName}</div>
                            {
                                chatRoomUsers[i].userId == user.id
                                    ?
                                    <div className={styles.userNameInputWrapper}>
                                        <input className={styles.userNameInput} value={newUserName}
                                               onKeyUp={e => onKeyUpUserName(e)}
                                               onChange={e => onChangeUserName(e)}
                                               onBlur={onSaveUserName}
                                               onFocus={e => { setNewUserName(user.name) }}
                                               placeholder={appConfigs.isProd ? '대화명' : ''}/>
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
    }, [appConfigs, chat, user, toggleChatRoomUserList, onKeyUpUserName, onChangeUserName, onSaveUserName, newUserName]);

    const title = useCallback(() => {
        let title = appConfigs.isProd ? appConfigs.name : "";
        if (chat && !isEmpty(chat.currentChatRoomId)) {
            const chatRoom = chat.chatRooms.find(_ => _.roomId == chat.currentChatRoomId);
            if (chatRoom)
                title = appConfigs.isProd ? chatRoom.roomName : "";
        }

        return (
            <span className={styles.chatRoomTitle}>{title}</span>
        );
    }, [appConfigs, chat]);

    return (
        <div className={styles.chatRoomHeaderWrapper}>
            <div className={styles.chatRoomTitleWrapper}>
                <div className={styles.chatRoomMenuButtonWrapper}>

                </div>
                <button className={`${styles.chatRoomShare} ${stylesCommon.button}`} onClick={copyShareLink}>공유</button>
                {/*<button className={`${styles.chatRoomNotify} ${stylesCommon.button}`} onClick={subscribeChatRoomNotify}>알림</button>*/}
                {title()}
                <button className={`${styles.chatRoomExit} ${stylesCommon.button}`} onClick={exitChatRoom}>나가기</button>
            </div>
            <div className={styles.chatRoomUserListWrapper}>
                <ul className={chatRoomUserListClass}>
                    {chatRoomUsers()}
                </ul>
            </div>
        </div>
    );
}