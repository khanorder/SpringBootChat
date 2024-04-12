import {ReactElement, useCallback, useEffect, useRef} from "react";
import styles from '@/styles/chatNotifications.module.sass';
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Defines} from "@/defines";
import Image from "next/image";
import UserIcon from "public/images/user-circle.svg";

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

    const notifications = useCallback(() => {
        const list: ReactElement[] = [];

        if (0 < notificationState.notifications.length) {
            for (let i = 0; i < notificationState.notifications.length; i++) {
                const notification = notificationState.notifications[i];
                let notificationClass = styles.notification;

                switch (notification.type) {
                    case Defines.NotificationType.FOLLOWER:
                        list.push(
                            <li key={i} className={notificationClass}>
                                <div className={styles.iconWrapper}>
                                    <div className={styles.iconThumb}>
                                        {
                                            notification.haveIcon
                                                ?
                                                <img className={styles.iconImage}
                                                     src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}/api/profileThumb/${notification.targetId}`}
                                                     alt='사용자 프로필'/>
                                                :
                                                <Image className={styles.icon} src={UserIcon} alt='사용자 프로필' fill={true} priority={true}/>
                                        }
                                    </div>
                                </div>
                                <div className={styles.infoWrapper}>
                                    <div className={styles.message}>{notification.message}</div>
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
    }, [notificationState]);

    return (
            <div className={styles.chatNotificationsWrapper}>
            <ul className={styles.chatNotifications}>
                {notifications()}
            </ul>
        </div>
    );
}