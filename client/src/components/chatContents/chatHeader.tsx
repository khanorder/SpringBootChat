import {useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {exitChatRoomReq} from "@/stores/reducers/webSocket";
import styles from "@/styles/chatHeader.module.sass";
import Image from "next/image";
import ArrowLeftIcon from "public/images/arrow-left.svg";
import {CommonAPI} from "@/apis/commonAPI";
import {toggleIsActiveLNB} from "@/stores/reducers/ui";
import {Defines} from "@/defines";

export default function ChatHeader() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();

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

    const title = useCallback(() => {
        let title = appConfigs.isProd ? appConfigs.name : "";
        if (chat && !isEmpty(chat.currentChatRoomId)) {
            const chatRoom = chat.chatRooms.find(_ => _.roomId == chat.currentChatRoomId);
            if (chatRoom)
                title = chatRoom.roomName;
        } else {
            switch (ui.activeTab) {
                case Defines.TabType.FOLLOW:
                    title = "친구";
                    break;

                case Defines.TabType.CHAT:
                    title = "채팅";
                    break;

                case Defines.TabType.SEARCH:
                    title = "검색";
                    break;
            }
        }

        if (!appConfigs.isProd)
            title = "테스트";

        return (
            <span className={styles.chatTitle}>{title}</span>
        );
    }, [appConfigs, chat, ui]);

    const leftButtons = useCallback(() => {
        if (!chat || isEmpty(chat.currentChatRoomId))
            return <></>;

        return (
            <div className={styles.chatHeaderLeftButtons}>
                <button className={styles.chatRoomExit} onClick={exitChatRoom} title='메인화면'><Image className={styles.chatRoomExitIcon} src={ArrowLeftIcon} alt='메인화면' width={18} height={18} /></button>
            </div>
        );
    }, [chat, exitChatRoom]);

    const toggleLNB = useCallback(() => {
        dispatch(toggleIsActiveLNB());
    }, [dispatch]);

    const lnb = useCallback(() => {
        let lnbButtonWrapperClass = styles.chatHeaderLNBButtonWrapper;
        if (ui.isActiveLNB)
            lnbButtonWrapperClass += ' ' + styles.active;

        return (
            <div className={lnbButtonWrapperClass}>
                <button className={styles.chatHeaderLNBButton} onClick={toggleLNB}>
                    <div className={`${styles.lnbLine} ${styles.lnbLine01}`}></div>
                    <div className={`${styles.lnbLine} ${styles.lnbLine02}`}></div>
                    <div className={`${styles.lnbLine} ${styles.lnbLine03}`}></div>
                </button>
            </div>
        );
    }, [ui, toggleLNB]);

    return (
        <div className={styles.chatHeaderWrapper}>
            <div className={styles.chatTitleWrapper}>
                {leftButtons()}
                {title()}
                { isEmpty(chat.currentChatRoomId) ? <></> : lnb()}
            </div>
        </div>
    );
}