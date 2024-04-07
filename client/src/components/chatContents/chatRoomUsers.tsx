import {ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {saveUserNameReq} from "@/stores/reducers/webSocket";
import styles from "@/styles/chatRoomUsers.module.sass";
import {setUserName} from "@/stores/reducers/user";
import Image from "next/image";
import UserIcon from "public/images/user-circle.svg";
import {Domains} from "@/domains";

export default function ChatRoomUsers() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();
    const [newUserName, setNewUserName] = useState<string>('');

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

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
        }
    }, []);

    const onChangeUserName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setNewUserName(e.target.value.trim());
    }, [setNewUserName]);

    const list = useCallback(() => {
        if (!chat || isEmpty(chat.currentChatRoomId))
            return <></>;

        let chatRoomUsers: Domains.ChatRoomUser[] = [];
        const chatRoom = chat.chatRooms.find(_ => _.roomId == chat.currentChatRoomId);
        if (chatRoom)
            chatRoomUsers = chatRoom.users;

        const users: ReactElement[] = [];
        users.push(<li key={'userCount'} className={styles.chatRoomUserCount}>{`참여인원: ${chatRoomUsers.length} 명`}</li>);

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

        return (
            <ul className={styles.chatUserList}>
                {users}
            </ul>
        );
    }, [chat, user, newUserName, onSaveUserName, appConfigs, onKeyUpUserName, onChangeUserName]);

    return (
        <div className={styles.chatRoomUserListWrapper}>
            {list()}
        </div>
    );
}