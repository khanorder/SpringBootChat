import {ReactElement, useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Item, ItemParams, Menu, useContextMenu} from "react-contexify";
import {Domains} from "@/domains";
import {followReq, startChatReq, unfollowReq} from "@/stores/reducers/webSocket";
import styles from "@/styles/chatUsers.module.sass";
import stylesMyProfile from "@/styles/chatMyProfile.module.sass";
import Image from "next/image";
import AddUserIcon from "public/images/add-user.svg";
import ChatIcon from "public/images/chat.svg";
import CloseIcon from "public/images/close.svg";
import 'react-contexify/ReactContexify.css';
import dynamic from "next/dynamic";
import {Defines} from "@/defines";
import UserIcon from "../../../public/images/user-circle.svg";
import ChatMyProfile from "@/components/chatContents/chatMyProfile";
const ChatUserProfile = dynamic(() => import("@/components/chatContents/chatUserProfile"), { ssr: false });

enum UserListType {
    CONNECTED = 0,
    FOLLOW = 1,
    FOLLOWER = 2
}

export default function ChatUsers() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const user = useAppSelector(state => state.user);
    const ui = useAppSelector(state => state.ui);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const FOLLOW_MENU_ID = 'followMenu';
    const NORMAL_MENU_ID = 'normalMenu';

    const followContextMenu = useContextMenu({id: FOLLOW_MENU_ID});
    const normalContextMenu = useContextMenu({id: NORMAL_MENU_ID});

    const handleContextMenu = useCallback((event: any, state: UserListType, user: Domains.User) => {
        switch (state) {
            case UserListType.CONNECTED:
                normalContextMenu.show({
                    event,
                    props: {
                        target: user
                    }
                });
                break;

            case UserListType.FOLLOW:
                followContextMenu.show({
                    event,
                    props: {
                        target: user
                    }
                });
                break;

            case UserListType.FOLLOWER:
                normalContextMenu.show({
                    event,
                    props: {
                        target: user
                    }
                });
                break;
        }
    }, [followContextMenu, normalContextMenu]);

    const handleItemClick = useCallback(({ id, event, props }: ItemParams) => {
        switch (id) {
            case "follow":
                dispatch(followReq(props.target))
                break;

            case "unfollow":
                dispatch(unfollowReq(props.target))
                break;

            case "startChat":
                dispatch(startChatReq(props.target))
                break;
        }
    }, [dispatch]);

    const userList = useCallback((state: UserListType, userDatas: Domains.User[]) => {
        const list: ReactElement[] = [];

        for (let i = 0; i < userDatas.length; i++) {
            const userData = userDatas[i];
            if (user.id == userData.userId)
                continue;

            list.push(
                <li key={i} className={styles.user}
                    onClick={(e) => { handleContextMenu(e, state, userData) }}
                    onContextMenu={(e) => { handleContextMenu(e, state, userData) }}>
                    <ChatUserProfile userData={userData} />
                </li>
            );
        }

        return list;
    }, [handleContextMenu, user]);

    const userGroupName = useCallback((state: UserListType) => {
        switch (state) {
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

        if (1 > user.connectedUsers.length && 1 > user.follows.length && 1 > user.followers.length) {
            userLists.push(
                <div key={'users'} className={styles.sectionWrapper}>
                    <ul key={'listNone'} className={styles.userList}>
                        <li key={'userNone'} className={styles.userNone}>다른 사용자를 팔로우 해보세요.</li>
                    </ul>
                </div>
            );
        } else {
            if (0 < user.follows.length)
                userLists.push(userListGroup(UserListType.FOLLOW, user.follows));

            if (0 < user.followers.length)
                userLists.push(userListGroup(UserListType.FOLLOWER, user.followers));

            if (0 < user.connectedUsers.length)
                userLists.push(userListGroup(UserListType.CONNECTED, user.connectedUsers));
        }

        return userLists;
    }, [user, userListGroup]);

    const followMenu = useCallback(() => {
        return (
            <Menu className={styles.userMenu} id={FOLLOW_MENU_ID}>
                <Item className={styles.userMenuItem} id="unfollow" onClick={handleItemClick}>
                    <div className={styles.userMenuItemContent}>
                        <div className={styles.userMenuItemIconWrapper}>
                            <Image className={styles.userMenuItemIcon} src={CloseIcon} alt='언팔로우' width={15} height={15} />
                        </div>
                        <div className={styles.userMenuName}>언팔로우</div>
                    </div>
                </Item>
                <Item className={styles.userMenuItem} id="startChat" onClick={handleItemClick}>
                    <div className={styles.userMenuItemContent}>
                        <div className={styles.userMenuItemIconWrapper}>
                            <Image className={styles.userMenuItemIcon} src={ChatIcon} alt='채팅하기' width={15} height={15} />
                        </div>
                        <div className={styles.userMenuName}>채팅하기</div>
                    </div>
                </Item>
            </Menu>
        );
    }, [handleItemClick]);

    const followerMenu = useCallback(() => {
        return (
            <Menu className={styles.userMenu} id={NORMAL_MENU_ID}>
                <Item className={styles.userMenuItem} id="follow" onClick={handleItemClick}>
                    <div className={styles.userMenuItemContent}>
                        <div className={styles.userMenuItemIconWrapper}>
                            <Image className={styles.userMenuItemIcon} src={AddUserIcon} alt='팔로우' width={15} height={15} />
                        </div>
                        <div className={styles.userMenuName}>팔로우</div>
                    </div>
                </Item>
                <Item className={styles.userMenuItem} id="startChat" onClick={handleItemClick}>
                    <div className={styles.userMenuItemContent}>
                        <div className={styles.userMenuItemIconWrapper}>
                            <Image className={styles.userMenuItemIcon} src={ChatIcon} alt='채팅하기' width={15} height={15} />
                        </div>
                        <div className={styles.userMenuName}>채팅하기</div>
                    </div>
                </Item>
            </Menu>
        );
    }, [handleItemClick]);

    return (
        <div className={`${styles.usersWrapper}${appConfigs.isProd ? '' : ` ${styles.dev}`}`}>
            <ChatMyProfile />
            {users()}
            {followMenu()}
            {followerMenu()}
        </div>
    );
}