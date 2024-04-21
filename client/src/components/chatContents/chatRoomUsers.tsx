import {ReactElement, useCallback, useEffect, useRef} from "react";
import {useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import styles from "@/styles/chatRoomUsers.module.sass";
import {Domains} from "@/domains";
import useGetOthersUserInfo from "@/components/common/useGetOthersUserInfo";

export default function ChatRoomUsers() {
    const firstRender = useRef(true);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const [getOthersUserInfo] = useGetOthersUserInfo();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const userProfile = useCallback((userId: string) => {
        const isMine = user.id == userId;
        const userInfo = getOthersUserInfo(userId);

        return (
            <div className={styles.chatRoomUserProfileWrapper}>
                <img className={styles.chatRoomUserProfile} src={isMine ? user.profileImageUrl : userInfo.profileImageUrl} title={isMine ? user.name : userInfo.userName} alt={isMine ? user.name : userInfo.userName} />
            </div>
        );
    }, [getOthersUserInfo, user]);

    const userName = useCallback((userId: string) => {
        const isMine = user.id == userId;
        const userInfo = getOthersUserInfo(userId);

        return (
            <div className={styles.chatRoomUserInfo}>
                <div className={styles.userName}>{isMine ? user.name : userInfo.userName}</div>
                <div className={styles.userMessage}>{isMine ? user.message : userInfo.message}</div>
            </div>
        );
    }, [getOthersUserInfo, user]);

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
                    <li key={i} className={chatRoomUserClass}>
                        {userProfile(chatRoomUsers[i].userId)}
                        {userName(chatRoomUsers[i].userId)}
                    </li>
                );
            }
        }

        return (
            <ul className={styles.chatUserList}>
                {users}
            </ul>
        );
    }, [chat, user]);

    return (
        <div className={styles.chatRoomUserListWrapper}>
            {list()}
        </div>
    );
}