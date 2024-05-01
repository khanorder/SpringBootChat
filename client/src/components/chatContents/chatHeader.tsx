import {useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {exitChatRoomReq} from "@/stores/reducers/webSocket";
import styles from "@/styles/chatHeader.module.sass";
import Image from "next/image";
import ArrowLeftIcon from "public/images/arrow-left.svg";
import {CommonAPI} from "@/apis/commonAPI";
import {
    toggleIsActiveAddUser,
    toggleIsActiveChatRoomInfo,
    toggleIsActiveCreateChatRoom,
    toggleIsActiveNotification
} from "@/stores/reducers/ui";
import {useRouter} from "next/router";

export default function ChatHeader() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const notification = useAppSelector(state => state.notification);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const router = useRouter();
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

        //await CommonAPI.SubscribeChatRoom(chat.currentChatRoomId ?? '', user.id);
    }, [chat, user]);

    const title = useCallback(() => {
        let title = appConfigs.isProd ? appConfigs.name : "";
        if (chat && !isEmpty(chat.currentChatRoomId)) {
            const chatRoom = chat.chatRooms.find(_ => _.roomId == chat.currentChatRoomId);
            if (chatRoom)
                title = chatRoom.roomName;
        } else {
            if ("/" == router.pathname) {
                title = "친구";
            } else if ("/rooms" == router.pathname) {
                title = "채팅";
            } else {
                title = appConfigs.name;
            }
        }

        return (
            <span className={styles.chatTitle}>{title}</span>
        );
    }, [appConfigs, chat, router]);

    const leftButtons = useCallback(() => {
        if (!chat || isEmpty(chat.currentChatRoomId))
            return <></>;

        return (
            <div className={styles.leftButtons}>
                <button className={styles.chatRoomExit} onClick={exitChatRoom} title='메인화면'><Image className={styles.chatRoomExitIcon} src={ArrowLeftIcon} alt='메인화면' width={18} height={18} /></button>
            </div>
        );
    }, [chat, exitChatRoom]);

    const toggleChatRoomInfo = useCallback(() => {
        dispatch(toggleIsActiveChatRoomInfo());
    }, [dispatch]);

    const toggleNotification = useCallback(() => {
        dispatch(toggleIsActiveNotification());
    }, [dispatch]);

    const toggleCreateChatRoom = useCallback(() => {
        dispatch(toggleIsActiveCreateChatRoom());
    }, [dispatch]);

    const toggleAddUser = useCallback(() => {
        dispatch(toggleIsActiveAddUser());
    }, [dispatch]);

    const notificationButton = useCallback(() => {
        let notificationWrapperClass = styles.notificationWrapper;
        if (ui.isActiveNotification)
            notificationWrapperClass += ' ' + styles.active;

        const toCheck = notification.notifications.filter(_ => !_.isCheck);
        if (0 < toCheck.length)
            notificationWrapperClass += ' ' + styles.toCheck;

        return (
            <div className={notificationWrapperClass}>
                <div className={styles.notificationButtonWrapper}>
                    <button className={styles.notificationButton} onClick={toggleNotification}></button>
                    <div className={styles.toCheckCount}>
                        <span className={styles.toCheckCountText}>{toCheck.length}</span>
                    </div>
                </div>
            </div>
        );
    }, [ui, notification, toggleNotification]);

    const createChatRoomButton = useCallback(() => {
        return (
            <div className={styles.createChatRoomWrapper}>
                <div className={styles.createChatRoomButtonWrapper}>
                    <button className={styles.createChatRoomButton} onClick={toggleCreateChatRoom}></button>
                </div>
            </div>
        );
    }, [toggleCreateChatRoom]);

    const addUserButton = useCallback(() => {
        return (
            <div className={styles.addUserWrapper}>
                <div className={styles.addUserButtonWrapper}>
                    <button className={styles.addUserButton} onClick={toggleAddUser}></button>
                </div>
            </div>
        );
    }, [toggleAddUser]);

    const chatRoomInfoButton = useCallback(() => {
        let chatRoomInfoButtonWrapperClass = styles.lnbButtonWrapper;
        if (ui.isActiveChatRoomInfo)
            chatRoomInfoButtonWrapperClass += ' ' + styles.active;

        return (
            <div className={chatRoomInfoButtonWrapperClass}>
                <button className={styles.lnbButton} onClick={toggleChatRoomInfo}>
                    <div className={`${styles.lnbLine} ${styles.lnbLine01}`}></div>
                    <div className={`${styles.lnbLine} ${styles.lnbLine02}`}></div>
                    <div className={`${styles.lnbLine} ${styles.lnbLine03}`}></div>
                </button>
            </div>
        );
    }, [ui, toggleChatRoomInfo]);

    return (
        <div className={styles.chatHeaderWrapper}>
            <div className={styles.titleWrapper}>
                {leftButtons()}
                {title()}
                {notificationButton()}
                {isEmpty(chat.currentChatRoomId) ? createChatRoomButton() : <></>}
                {isEmpty(chat.currentChatRoomId) ? <></> : addUserButton()}
                {isEmpty(chat.currentChatRoomId) ? <></> : chatRoomInfoButton()}
            </div>
        </div>
    );
}