import {ReactElement, useCallback, useEffect, useRef} from "react";
import styles from '@/styles/chatNotifications.module.sass';
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Defines} from "@/defines";
import Image from "next/image";
import UserIcon from "public/images/user-circle.svg";
import CloseIcon from "public/images/close.svg";
import {Domains} from "@/domains";
import {dayjs} from "@/helpers/localizedDayjs";
import {checkNotificationReq, removeNotificationReq} from "@/stores/reducers/webSocket";

export default function ChatNotifications() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const notificationState = useAppSelector(state => state.notification);
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
    
    const checkNotification = useCallback((notification: Domains.Notification) => {
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

                switch (notification.type) {
                    case Defines.NotificationType.FOLLOWER:
                        list.push(
                            <li key={i} className={notificationClass} onClick={(e) => checkNotification(notification)}>
                                <div className={styles.iconWrapper}>
                                    <div className={styles.iconThumb}>
                                        {
                                            notification.haveIcon
                                                ?
                                                <img className={styles.iconImage}
                                                     src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}/api/profileThumb/${notification.targetId}`}
                                                     alt='사용자 프로필'/>
                                                :
                                                <Image className={styles.icon} src={UserIcon} alt='사용자 프로필' fill={true}
                                                       priority={true}/>
                                        }
                                    </div>
                                </div>
                                <div className={styles.infoWrapper}>
                                    <div className={styles.messageWrapper}>
                                        <div className={styles.message}>{notification.message}</div>
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
                        break;
                }

            }
        } else {
            list.push(<li key={'none'} className={styles.none}>알림이 없습니다.</li>)
        }

        return list;
    }, [notificationState, appConfigs, checkNotification]);

    return (
            <div className={styles.chatNotificationsWrapper}>
            <ul className={styles.chatNotifications}>
                {notifications()}
            </ul>
        </div>
    );
}