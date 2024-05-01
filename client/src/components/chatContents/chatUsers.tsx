import {ReactElement, useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Item, ItemParams, Menu, useContextMenu} from "react-contexify";
import {Domains} from "@/domains";
import {followReq, startChatReq, unfollowReq} from "@/stores/reducers/webSocket";
import styles from "@/styles/chatUsers.module.sass";
import stylesCtxMenu from "@/styles/chatContextMenu.module.sass";
import Image from "next/image";
import AddUserIcon from "public/images/add-user.svg";
import ChatIcon from "public/images/chat.svg";
import CloseIcon from "public/images/close.svg";
import 'react-contexify/ReactContexify.css';
import dynamic from "next/dynamic";
const ChatMyProfile = dynamic(() => import("@/components/chatContents/chatMyProfile"), { ssr: false });
const ChatUserProfile = dynamic(() => import("@/components/chatContents/chatUserProfile"), { ssr: false });

enum UserListType {
    LATEST_ACTIVE = 0,
    CONNECTED = 1,
    FOLLOW = 2,
    FOLLOWER = 3
}

export default function ChatUsers() {
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

    const FOLLOW_MENU_ID = 'followMenu';
    const NORMAL_MENU_ID = 'normalMenu';

    const followContextMenu = useContextMenu({id: FOLLOW_MENU_ID});
    const normalContextMenu = useContextMenu({id: NORMAL_MENU_ID});

    const handleContextMenu = useCallback((event: any, state: UserListType, user: Domains.User) => {
        switch (state) {
            case UserListType.LATEST_ACTIVE:
                normalContextMenu.show({
                    event,
                    props: {
                        target: user
                    }
                });
                break;

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
                    <ChatUserProfile userId={userData.userId} />
                </li>
            );
        }

        return list;
    }, [handleContextMenu, user]);

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

        if (1 > user.follows.length && 1 > user.followers.length) {
            userLists.push(
                <div key={'users'} className={styles.sectionWrapper}>
                    <ul key={'listNone'} className={styles.userList}>
                        <li key={'userNone'} className={styles.userNone}>다른 사용자를 팔로우 해보세요.</li>
                    </ul>
                </div>
            );
        }

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

    const followMenu = useCallback(() => {
        return (
            <Menu className={stylesCtxMenu.menu} id={FOLLOW_MENU_ID}>
                <Item className={stylesCtxMenu.menuItem} id="unfollow" onClick={handleItemClick}>
                    <div className={stylesCtxMenu.menuItemContent}>
                        <div className={stylesCtxMenu.menuItemIconWrapper}>
                            <Image className={stylesCtxMenu.menuItemIcon} src={CloseIcon} alt='언팔로우' width={15} height={15} />
                        </div>
                        <div className={stylesCtxMenu.menuName}>언팔로우</div>
                    </div>
                </Item>
                <Item className={stylesCtxMenu.menuItem} id="startChat" onClick={handleItemClick}>
                    <div className={stylesCtxMenu.menuItemContent}>
                        <div className={stylesCtxMenu.menuItemIconWrapper}>
                            <Image className={stylesCtxMenu.menuItemIcon} src={ChatIcon} alt='채팅하기' width={15} height={15} />
                        </div>
                        <div className={stylesCtxMenu.menuName}>채팅하기</div>
                    </div>
                </Item>
            </Menu>
        );
    }, [handleItemClick]);

    const followerMenu = useCallback(() => {
        return (
            <Menu className={stylesCtxMenu.menu} id={NORMAL_MENU_ID}>
                <Item className={stylesCtxMenu.menuItem} id="follow" onClick={handleItemClick}>
                    <div className={stylesCtxMenu.menuItemContent}>
                        <div className={stylesCtxMenu.menuItemIconWrapper}>
                            <Image className={stylesCtxMenu.menuItemIcon} src={AddUserIcon} alt='팔로우' width={15} height={15} />
                        </div>
                        <div className={stylesCtxMenu.menuName}>팔로우</div>
                    </div>
                </Item>
                <Item className={stylesCtxMenu.menuItem} id="startChat" onClick={handleItemClick}>
                    <div className={stylesCtxMenu.menuItemContent}>
                        <div className={stylesCtxMenu.menuItemIconWrapper}>
                            <Image className={stylesCtxMenu.menuItemIcon} src={ChatIcon} alt='채팅하기' width={15} height={15} />
                        </div>
                        <div className={stylesCtxMenu.menuName}>채팅하기</div>
                    </div>
                </Item>
            </Menu>
        );
    }, [handleItemClick]);

    return (
        <div className={styles.usersWrapper}>
            <ChatMyProfile />
            <div className={styles.userSections}>
                {users()}
                {followMenu()}
                {followerMenu()}
            </div>
        </div>
    );
}