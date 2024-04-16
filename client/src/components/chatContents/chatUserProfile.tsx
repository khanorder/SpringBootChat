import styles from "@/styles/chatUserProfile.module.sass";
import {useCallback, useEffect, useRef} from "react";
import {useAppSelector} from "@/hooks";
import useGetUserInfo from "@/components/common/useGetUserInfo";
import {dayjs} from "@/helpers/localizedDayjs";

export interface ChatUserProfileProps {
    userId: string;
}

export default function ChatUserProfile({ userId }: ChatUserProfileProps) {
    const firstRender = useRef(true);
    const user = useAppSelector(state => state.user);
    const [getUserInfo] = useGetUserInfo();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
        }

    }, [firstRender]);
    //#endregion

    const userProfile = useCallback(() => {
        const userInfo = getUserInfo(userId);

        return (
            <div className={styles.userThumbWrapper}>
                <div className={styles.userThumb}>
                    <img className={styles.userThumbImage} src={userInfo.profileImageUrl} alt='프로필'/>
                </div>
                {
                    userInfo.online
                        ?
                        <div className={styles.online}></div>
                        :
                        <></>
                }
            </div>
        );
    }, [getUserInfo, userId]);

    const userName = useCallback(() => {
        const isMine = user.id == userId;
        const userInfo = getUserInfo(userId);

        return (
            <div className={styles.userInfo}>
                <div className={styles.userName}>{isMine ? user.name : userInfo.userName}</div>
                <div className={styles.userMessage}>{isMine ? user.message : userInfo.message}</div>
            </div>
        );
    }, [userId, getUserInfo, user]);

    const latestActive = useCallback(() => {
        const userInfo = getUserInfo(userId);

        return (
            <div className={styles.latestActive}>
                <div className={styles.activeTime}>
                    {dayjs(userInfo.latestActive).fromNow(true)}
                </div>
            </div>
        );
    }, [userId, getUserInfo]);

    return (
        <div className={styles.userProfileWrapper}>
            {userProfile()}
            {userName()}
            {latestActive()}
        </div>
    )
}