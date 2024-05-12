import {ReactElement, useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import styles from "@/styles/chatRoomUsers.module.sass";
import {Domains} from "@/domains";
import useOthersUserInfo from "@/components/common/useOthersUserInfo";
import useCurrentUser from "@/components/common/useCurrentUser";
import Image from "next/image";
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;
import {setIsActiveChatRoomInfo, setIsActiveProfile, setProfileDetailUserId} from "@/stores/reducers/ui";

export default function ChatRoomUsers() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const [currentUser] = useCurrentUser();
    const [getOthersUserInfo] = useOthersUserInfo();
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const openUserProfile = useCallback((userId: string) => {
        dispatch(setIsActiveChatRoomInfo(false));
        dispatch(setProfileDetailUserId(userId));
        dispatch(setIsActiveProfile(true));
    }, [dispatch])

    const userProfile = useCallback((userId: string) => {
        const isMine = user.id == userId;
        const userInfo = getOthersUserInfo(userId);
        let imgUrl = `${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${userInfo.userId}?${(new Date()).getTime()}`;
        let nickName = userInfo.nickName;
        if (isMine) {
            imgUrl = `${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${currentUser.userId}?${(new Date()).getTime()}`;
            nickName = currentUser.nickName;
        }

        return (
            <div className={styles.chatRoomUserProfileWrapper}>
                <Image className={styles.chatRoomUserProfile} src={imgUrl} title={nickName} alt={nickName} fill={true} priority={true} />
            </div>
        );
    }, [appConfigs, user, getOthersUserInfo, currentUser]);

    const nickName = useCallback((userId: string) => {
        const isMine = user.id == userId;
        const userInfo = getOthersUserInfo(userId);

        return (
            <div className={styles.chatRoomUserInfo}>
                <div className={styles.nickName}>{isMine ? currentUser.nickName : userInfo.nickName}</div>
                <div className={styles.userMessage}>{isMine ? currentUser.message : userInfo.message}</div>
            </div>
        );
    }, [user, getOthersUserInfo, currentUser]);

    const list = useCallback(() => {
        if (!chat || isEmpty(chat.currentChatRoomId))
            return <></>;

        let chatRoomUsers: Domains.User[] = [];
        const chatRoom = chat.chatRooms.find(_ => _.roomId == chat.currentChatRoomId);
        if (chatRoom)
            chatRoomUsers = chatRoom.users;

        const users: ReactElement[] = [];
        users.push(<li key={'userCount'} className={styles.chatRoomUserCount}>{`참여인원: ${chatRoomUsers.length} 명`}</li>);

        if (0 < chatRoomUsers.length) {
            for (let i = 0; i < chatRoomUsers.length; i++) {
                const isMine = chatRoomUsers[i].userId == user.id;
                let chatRoomUserClass = styles.chatRoomUser;
                if (isMine)
                    chatRoomUserClass += ' ' + styles.mine;

                users.push(
                    <li key={i} className={chatRoomUserClass} onClick={() => openUserProfile(chatRoomUsers[i].userId)}>
                        {userProfile(chatRoomUsers[i].userId)}
                        {nickName(chatRoomUsers[i].userId)}
                    </li>
                );
            }
        }

        return (
            <ul className={styles.chatUserList}>
                {users}
            </ul>
        );
    }, [chat, user, userProfile, nickName, openUserProfile]);

    return (
        <div className={styles.chatRoomUserListWrapper}>
            {list()}
        </div>
    );
}