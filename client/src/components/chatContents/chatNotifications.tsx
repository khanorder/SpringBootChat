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
import useGetUserInfo from "@/components/common/useGetUserInfo";
import {useRouter} from "next/router";
import {Helpers} from "@/helpers";
import {setIsActiveNotification} from "@/stores/reducers/ui";

export default function ChatNotifications() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const notificationState = useAppSelector(state => state.notification);
    const dispatch = useAppDispatch();
    const [getUserInfo] = useGetUserInfo();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion
    
    const checkNotification = useCallback((notification: Domains.Notification) => {
        dispatch(setIsActiveNotification(false));
        dispatch(enterChatRoomReq(notification.url));
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

                const userInfo = getUserInfo(notification.targetId);
                let message = "";
                switch (notification.type) {
                    case Defines.NotificationType.FOLLOWER:
                        message = `'${userInfo.userName}'님이 당신을 팔로우 합니다.`;
                        break;

                    case Defines.NotificationType.START_CHAT:
                        message = `'${userInfo.userName}'님이 보낸 메세지가 있습니다.`;
                        break;
                }

                list.push(
                    <li key={i} className={notificationClass}>
                        <div className={styles.iconWrapper} onClick={(e) => checkNotification(notification)}>
                            <div className={styles.iconThumb}>
                                <img className={styles.iconImage}
                                     src={userInfo.profileImageUrl}
                                     alt='사용자 프로필'/>
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
    }, [getUserInfo, notificationState, appConfigs, checkNotification]);

    return (
            <div className={styles.chatNotificationsWrapper}>
            <ul className={styles.chatNotifications}>
                {notifications()}
            </ul>
        </div>
    );
}