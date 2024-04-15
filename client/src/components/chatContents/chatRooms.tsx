import {ReactElement, useCallback, useEffect, useRef} from "react";
import styles from "@/styles/chatRooms.module.sass";
import stylesCtxMenu from "@/styles/chatContextMenu.module.sass";
import {useAppDispatch, useAppSelector} from "@/hooks";
import dynamic from "next/dynamic";
import {Item, ItemParams, Menu, useContextMenu} from "react-contexify";
import {Domains} from "@/domains";
import {removeChatRoomReq} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
import Image from "next/image";
import CloseIcon from "public/images/close.svg";

const ChatRoom = dynamic(() => import("@/components/chatContents/chatRoom"), { ssr: false });
const ChatCreateRoomButton = dynamic(() => import("@/components/chatContents/chatCreateRoomButton"), { ssr: false });
const CreateChatRoomDialog = dynamic(() => import("@/components/dialogs/createChatRoomDialog"), { ssr: false });

export default function ChatRooms() {
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const firstRender = useRef(true);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const NON_PUBLIC_MENU_ID = 'nonePublicMenu';
    const PUBLIC_MENU_ID = 'publicMenu';

    const nonePublicContextMenu = useContextMenu({id: NON_PUBLIC_MENU_ID});
    const publicContextMenu = useContextMenu({id: PUBLIC_MENU_ID});

    const handleContextMenu = useCallback((event: any, chatRoom: Domains.ChatRoom) => {
        switch (chatRoom.openType) {
            case Defines.RoomOpenType.PREPARED:
                nonePublicContextMenu.show({
                    event,
                    props: {
                        target: chatRoom
                    }
                });
                break;

            case Defines.RoomOpenType.PRIVATE:
                nonePublicContextMenu.show({
                    event,
                    props: {
                        target: chatRoom
                    }
                });
                break;

            case Defines.RoomOpenType.PUBLIC:
                publicContextMenu.show({
                    event,
                    props: {
                        target: chatRoom
                    }
                });
                break;
        }
    }, [nonePublicContextMenu, publicContextMenu]);

    const handleItemClick = useCallback(({ id, event, props }: ItemParams) => {
        switch (id) {
            case "remove":
                dispatch(removeChatRoomReq(props.target.roomId))
                break;
        }
    }, [dispatch]);

    const list = useCallback(() => {
        if (!chat.chatRooms || 1 > chat.chatRooms.length) {
            return (
                <li className={styles.chatRoomListNone}>{appConfigs.isProd ? '개설된 채팅방이 없습니다.' : ''}</li>
            );
        } else {
            const list: ReactElement[] = [];
            for (let i = 0; i < chat.chatRooms.length; i++) {
                const chatRoom = chat.chatRooms[i];

                list.push(<ChatRoom key={i} chatRoom={chatRoom} onContextMenu={(e) => { handleContextMenu(e, chatRoom) }} />);
            }

            return list;
        }
    }, [appConfigs, chat]);

    const nonePublicMenu = useCallback(() => {
        return (
            <Menu className={stylesCtxMenu.menu} id={NON_PUBLIC_MENU_ID}>
                <Item className={stylesCtxMenu.menuItem} id="remove" onClick={handleItemClick}>
                    <div className={stylesCtxMenu.menuItemContent}>
                        <div className={stylesCtxMenu.menuItemIconWrapper}>
                            <Image className={stylesCtxMenu.menuItemIcon} src={CloseIcon} alt='삭제' width={15} height={15} />
                        </div>
                        <div className={stylesCtxMenu.menuName}>삭제</div>
                    </div>
                </Item>
            </Menu>
        );
    }, [handleItemClick]);

    return (
        <>
            <CreateChatRoomDialog />
            <div className={`${styles.chatRoomListWrapper}${appConfigs.isProd ? '' : ` ${styles.dev}`}`}>
                <ul className={styles.chatRoomList}>
                    {list()}
                </ul>
            </div>
            {nonePublicMenu()}
            <ChatCreateRoomButton />
        </>
    );
}