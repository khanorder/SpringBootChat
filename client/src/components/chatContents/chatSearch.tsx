import {useAppDispatch, useAppSelector} from "@/hooks";
import {ReactElement, useCallback, useEffect, useRef} from "react";
import styles from "@/styles/chatSearch.module.sass";
import UserIcon from "public/images/user-circle.svg";
import AddUserIcon from "public/images/add-user.svg";
import ChatIcon from "public/images/chat.svg";
import Image from "next/image";
import {Menu, Item, useContextMenu, ItemParams} from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import {Domains} from "@/domains";
import {followReq} from "@/stores/reducers/webSocket";

export default function ChatSearch() {
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

    const MENU_ID = 'userMenu';

    const { show } = useContextMenu({ id: MENU_ID });

    const handleContextMenu = useCallback((event: any, user: Domains.User) => {
        show({
            event,
            props: {
                target: user
            }
        });
    }, [show]);

    const handleItemClick = useCallback(({ id, event, props }: ItemParams) => {
        switch (id) {
            case "follow":
                dispatch(followReq(props.target))
                break;

            case "chat":
                break;
        }
    }, [dispatch]);

    const connectedUsers = useCallback(() => {
        if (1 > user.connectedUsers.length)
            return <li className={styles.listNone}>접속중인 사용자가 없습니다.</li>;

        const list: ReactElement[] = [];

        for (let i = 0; i < user.connectedUsers.length; i++) {
            const connectedUser = user.connectedUsers[i];
            if (connectedUser.userId == user.id)
                continue;

            list.push(
                <li key={i} className={styles.user} onContextMenu={(e) => { handleContextMenu(e, connectedUser) }}>
                    <div className={styles.userThumb}>
                        <Image className={styles.userThumbIcon} src={UserIcon} alt='유저 프로필' fill={true} priority={true} />
                    </div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{connectedUser.userName}</div>
                        <div className={styles.userMessage}>★</div>
                    </div>
                </li>
            );
        }

        return list;
    }, [handleContextMenu, user]);

    const menu = useCallback(() => {
        return (
            <Menu className={styles.userMenu} id={MENU_ID}>
                <Item className={styles.userMenuItem} id="follow" onClick={handleItemClick}>
                    <div className={styles.userMenuItemContent}>
                        <div className={styles.userMenuItemIconWrapper}>
                            <Image className={styles.userMenuItemIcon} src={AddUserIcon} alt='친구추가' width={15} height={15} />
                        </div>
                        <div className={styles.userMenuName}>친구추가</div>
                    </div>
                </Item>
                <Item className={styles.userMenuItem} id="chat" onClick={handleItemClick}>
                    <div className={styles.userMenuItemContent}>
                        <div className={styles.userMenuItemIconWrapper}>
                            <Image className={styles.userMenuItemIcon} src={ChatIcon} alt='대화하기' width={15} height={15} />
                        </div>
                        <div className={styles.userMenuName}>채팅방 초대</div>
                    </div>
                </Item>
            </Menu>
        );
    }, [handleItemClick]);

    return (
        <div className={`${styles.searchWrapper}${appConfigs.isProd ? '' : ` ${styles.dev}`}`}>
            <div className={styles.sectionWrapper}>
                <div className={`${styles.sectionName} ${styles.follow}`}>접속중</div>
                <ul className={styles.userList}>
                    {connectedUsers()}
                </ul>
            </div>
            {menu()}
        </div>
    );
}