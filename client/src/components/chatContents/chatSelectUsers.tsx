import {Dispatch, ReactElement, SetStateAction, useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Domains} from "@/domains";
import styles from "@/styles/chatSelectUsers.module.sass";
import dynamic from "next/dynamic";
import isEmpty from "lodash/isEmpty";
import deepmerge from "deepmerge";
const ChatUserProfile = dynamic(() => import("@/components/chatContents/chatUserProfile"), { ssr: false });

enum UserListType {
    LATEST_ACTIVE = 0,
    CONNECTED = 1,
    FOLLOW = 2,
    FOLLOWER = 3
}

export interface ChatSelectUsersProps {
    selectedUsers: string[];
    onSelectUser: (userId: string) => void;
}

export default function ChatSelectUsers({selectedUsers, onSelectUser}: ChatSelectUsersProps) {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const userList = useCallback((state: UserListType, userDatas: Domains.User[]) => {
        const list: ReactElement[] = [];

        for (let i = 0; i < userDatas.length; i++) {
            const userData = userDatas[i];
            if (user.id == userData.userId)
                continue;

            let userClass = styles.user;
            if (selectedUsers.includes(userData.userId))
                userClass += ` ${styles.selected}`;

            list.push(
                <li key={i} className={userClass} onClick={e => onSelectUser(userData.userId)}>
                    <div className={styles.selectRadioWrapper}>
                        <div className={styles.selectRadio}></div>
                    </div>
                    <div className={styles.selectUserProfileWrapper}>
                        <ChatUserProfile userId={userData.userId} />
                    </div>
                </li>
            );
        }

        return list;
    }, [user, selectedUsers, onSelectUser]);

    const userGroupName = useCallback((state: UserListType) => {
        switch (state) {
            case UserListType.LATEST_ACTIVE:
                return "최근활동";

            case UserListType.CONNECTED:
                return "접속중";

            case UserListType.FOLLOW:
                return "팔로우";

            case UserListType.FOLLOWER:
                return "팔로워";
        }
    }, []);

    const userListGroup = useCallback((state: UserListType, userDatas: Domains.User[]) => {
        const list: ReactElement[] = userList(state, userDatas);

        return (
            <div key={UserListType[state]} className={styles.sectionWrapper}>
                <div className={styles.sectionName}>{userGroupName(state)}</div>
                <ul className={styles.userList}>
                    {list}
                </ul>
            </div>
        );

    }, [userList, userGroupName]);

    const users = useCallback(() => {
        let userLists: ReactElement[] = [];

        if (0 < user.follows.length)
            userLists.push(userListGroup(UserListType.FOLLOW, user.follows));

        if (0 < user.followers.length)
            userLists.push(userListGroup(UserListType.FOLLOWER, user.followers));

        if (0 < user.connectedUsers.length)
            userLists.push(userListGroup(UserListType.CONNECTED, user.connectedUsers));

        if (0 < user.latestActiveUsers.length)
            userLists.push(userListGroup(UserListType.LATEST_ACTIVE, user.latestActiveUsers));

        return userLists;
    }, [user, userListGroup]);

    return (
        <div className={`${styles.usersWrapper}${appConfigs.isProd ? '' : ` ${styles.dev}`}`}>
            <div className={styles.userSections}>
                {users()}
            </div>
        </div>
    );
}