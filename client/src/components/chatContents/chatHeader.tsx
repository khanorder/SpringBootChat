import {useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {exitChatRoomReq} from "@/stores/reducers/webSocket";
import styles from "@/styles/chatHeader.module.sass";
import Image from "next/image";
import ArrowLeftIcon from "public/images/arrow-left.svg";
import {CommonAPI} from "@/apis/commonAPI";
import {toggleIsActiveGNB} from "@/stores/reducers/dialog";
import {Defines} from "@/defines";

export default function ChatHeader() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const dialog = useAppSelector(state => state.dialog);
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
        let title = !appConfigs.isProd ? appConfigs.name : "";
        if (chat && !isEmpty(chat.currentChatRoomId)) {
            const chatRoom = chat.chatRooms.find(_ => _.roomId == chat.currentChatRoomId);
            if (chatRoom)
                title = chatRoom.roomName;
        } else {
            switch (dialog.activeTab) {
                case Defines.ActiveTab.Friend:
                    title = "친구";
                    break;

                case Defines.ActiveTab.Chat:
                    title = "채팅";
                    break;
            }
        }

        return (
            <span className={styles.chatTitle}>{title}</span>
        );
    }, [appConfigs, chat, dialog]);

    const leftButtons = useCallback(() => {
        if (!chat || isEmpty(chat.currentChatRoomId))
            return <></>;

        return (
            <div className={styles.chatHeaderLeftButtons}>
                <button className={styles.chatRoomExit} onClick={exitChatRoom} title='메인화면'><Image className={styles.chatRoomExitIcon} src={ArrowLeftIcon} alt='메인화면' width={18} height={18} /></button>
            </div>
        );
    }, [chat, exitChatRoom]);

    const toggleGNB = useCallback(() => {
        dispatch(toggleIsActiveGNB());
    }, [dispatch]);

    const gnb = useCallback(() => {
        let gnbButtonWrapperClass = styles.chatHeaderGNBButtonWrapper;
        if (dialog.isActiveGNB)
            gnbButtonWrapperClass += ' ' + styles.active;

        return (
            <div className={gnbButtonWrapperClass}>
                <button className={styles.chatHeaderGNBButton} onClick={toggleGNB}>
                    <div className={`${styles.gnbLine} ${styles.gnbLine01}`}></div>
                    <div className={`${styles.gnbLine} ${styles.gnbLine02}`}></div>
                    <div className={`${styles.gnbLine} ${styles.gnbLine03}`}></div>
                </button>
            </div>
        );
    }, [dialog, toggleGNB]);

    return (
        <div className={styles.chatHeaderWrapper}>
            <div className={styles.chatTitleWrapper}>
                {leftButtons()}
                {title()}
                {gnb()}
            </div>
        </div>
    );
}