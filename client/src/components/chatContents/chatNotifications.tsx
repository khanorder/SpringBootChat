import {ReactElement, useCallback, useEffect, useRef} from "react";
import styles from '@/styles/chatDialogNotifications.module.sass';
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Defines} from "@/defines";
import Image from "next/image";
import UserIcon from "public/images/user-circle.svg";
import CloseIcon from "public/images/close.svg";
import {Domains} from "@/domains";
import {dayjs} from "@/helpers/localizedDayjs";
import {checkNotificationReq, enterChatRoomReq, removeNotificationReq} from "@/stores/reducers/webSocket";
import useOthersUserInfo from "@/components/common/useOthersUserInfo";
import {useRouter} from "next/router";
import {Helpers} from "@/helpers";
import {setIsActiveNotification} from "@/stores/reducers/ui";
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;

export default function ChatNotifications() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const notificationState = useAppSelector(state => state.notification);
    const dispatch = useAppDispatch();
    const [getOthersUserInfo] = useOthersUserInfo();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion
    
    const checkNotification = useCallback((notification: Domains.Notification) => {
        dispatch(setIsActiveNotification(false));
        switch (notification.type) {
            case Defines.NotificationType.START_CHAT:
                dispatch(enterChatRoomReq(notification.url));
                break;

            case Defines.NotificationType.ADD_USER_CHAT_ROOM:
                dispatch(enterChatRoomReq(notification.url));
                break;
        }
        dispatch(checkNotificationReq(notification));
    }, [dispatch]);

    const removeNotification = useCallback((notification: Domains.Notification) => {
        dispatch(removeNotificationReq(notification));
    }, [dispatch]);

    const notifications = useCallback(() => {
        const list: ReactElement[] = [];

        if (0 < notificationState.notifications.length) {
            for (let i = 0; i < notificationState.notifications.length; i++) {
                const notification = notificationState.notifications[i];
                let notificationClass = styles.notification;
                if (notification.isCheck)
                    notificationClass += ` ${styles.checked}`;

                const userInfo = getOthersUserInfo(notification.targetId);
                let message = "";
                switch (notification.type) {
                    case Defines.NotificationType.FOLLOWER:
                        message = `'${userInfo.nickName}'님이 당신을 팔로우 합니다.`;
                        break;

                    case Defines.NotificationType.START_CHAT:
                        message = `'${userInfo.nickName}'님이 보낸 메세지가 있습니다.`;
                        break;

                    case Defines.NotificationType.ADD_USER_CHAT_ROOM:
                        message = `'${userInfo.nickName}'님이 당신을 채팅방에 초대했습니다.`;
                        break;
                }

                list.push(
                    <li key={i} className={notificationClass}>
                        <div className={styles.iconWrapper} onClick={(e) => checkNotification(notification)}>
                            <div className={styles.iconThumb}>
                                <Image className={styles.iconImage} src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${userInfo.userId}`} alt='사용자 프로필' width={40} height={40}/>
                            </div>
                        </div>
                        <div className={styles.infoWrapper} onClick={(e) => checkNotification(notification)}>
                            <div className={styles.messageWrapper}>
                                <div className={styles.message}>{message}</div>
                            </div>
                            <div className={styles.sendAtWrapper}>
                                <div className={styles.sendAt}>{dayjs(notification.sendAt).fromNow(true)}</div>
                            </div>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <button className={styles.removeButton} title='삭제' onClick={(e) => removeNotification(notification)}>
                                <Image className={styles.removeButtonIcon} src={CloseIcon} alt='삭제' fill={true} priority={true}/>
                            </button>
                        </div>
                    </li>
                );

            }
        } else {
            list.push(<li key={'none'} className={styles.none}>알림이 없습니다.</li>)
        }

        return list;
    }, [notificationState, getOthersUserInfo, checkNotification, removeNotification]);

    return (
        <div className={styles.chatNotificationsWrapper}>
            <ul className={styles.chatNotifications}>
                {notifications()}
            </ul>
        </div>
    );
}