import {Fragment, ReactElement, useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Item, ItemParams, Menu, useContextMenu} from "react-contexify";
import {Domains} from "@/domains";
import {followReq, unfollowReq} from "@/stores/reducers/webSocket";
import styles from "@/styles/chatFollows.module.sass";
import Image from "next/image";
import UserIcon from "public/images/user-circle.svg";
import AddUserIcon from "public/images/add-user.svg";
import ChatIcon from "public/images/chat.svg";
import CloseIcon from "public/images/close.svg";
import 'react-contexify/ReactContexify.css';

enum UserListType {
    CONNECTED = 0,
    FOLLOW = 1,
    FOLLOWER = 2
}

export default function ChatFollows() {
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

    const followContextMenu = useContextMenu({ id: FOLLOW_MENU_ID });
    const normalContextMenu = useContextMenu({ id: NORMAL_MENU_ID });

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

            case "chat":
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
                    <div className={styles.userThumb}>
                        <Image className={styles.userThumbIcon} src={UserIcon} alt='사용자 프로필' fill={true} priority={true} />
                    </div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{userData.userName}</div>
                        <div className={styles.userMessage}>★</div>
                    </div>
                </li>
            );
        }

        return list;
    }, [handleContextMenu, user]);

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
            if (0 < user.follows.length) {
                const list: ReactElement[] = userList(UserListType.FOLLOW, user.follows);

                userLists.push(
                    <div key={'follows'} className={styles.sectionWrapper}>
                        <div className={styles.sectionName}>팔로우</div>
                        <ul className={styles.userList}>
                            {list}
                        </ul>
                    </div>
                )
            }

            if (0 < user.followers.length) {
                const list: ReactElement[] = userList(UserListType.FOLLOWER, user.followers);

                userLists.push(
                    <div key={'followers'} className={styles.sectionWrapper}>
                        <div className={styles.sectionName}>팔로워</div>
                        <ul className={styles.userList}>
                            {list}
                        </ul>
                    </div>
                )
            }

            if (0 < user.connectedUsers.length) {
                const list: ReactElement[] = userList(UserListType.CONNECTED, user.connectedUsers);

                userLists.push(
                    <div key={'connected'} className={styles.sectionWrapper}>
                        <div className={styles.sectionName}>접속중</div>
                        <ul className={styles.userList}>
                            {list}
                        </ul>
                    </div>
                )
            }
        }

        return userLists;
    }, [user, userList]);

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
                <Item className={styles.userMenuItem} id="chat" onClick={handleItemClick}>
                    <div className={styles.userMenuItemContent}>
                        <div className={styles.userMenuItemIconWrapper}>
                            <Image className={styles.userMenuItemIcon} src={ChatIcon} alt='대화하기' width={15} height={15} />
                        </div>
                        <div className={styles.userMenuName}>대화하기</div>
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
                <Item className={styles.userMenuItem} id="chat" onClick={handleItemClick}>
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
        <div className={`${styles.followWrapper}${appConfigs.isProd ? '' : ` ${styles.dev}`}`}>
            {users()}
            {followMenu()}
            {followerMenu()}
        </div>
    );
}