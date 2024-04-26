import styles from "@/styles/chatUserProfile.module.sass";
import {useCallback, useEffect, useRef} from "react";
import {useAppSelector} from "@/hooks";
import useOthersUserInfo from "@/components/common/useOthersUserInfo";
import {dayjs} from "@/helpers/localizedDayjs";
import useCurrentUser from "@/components/common/useCurrentUser";

export interface ChatUserProfileProps {
    userId: string;
}

export default function ChatUserProfile({ userId }: ChatUserProfileProps) {
    const firstRender = useRef(true);
    const user = useAppSelector(state => state.user);
    const [currentUser] = useCurrentUser();
    const [getOthersUserInfo] = useOthersUserInfo();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
        }

    }, [firstRender]);
    //#endregion

    const userProfile = useCallback(() => {
        const userInfo = getOthersUserInfo(userId);

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
    }, [getOthersUserInfo, userId]);

    const nickName = useCallback(() => {
        const isMine = user.id == userId;
        const userInfo = getOthersUserInfo(userId);

        return (
            <div className={styles.userInfo}>
                <div className={styles.nickName}>{isMine ? currentUser.nickName : userInfo.nickName}</div>
                <div className={styles.userMessage}>{isMine ? currentUser.message : userInfo.message}</div>
            </div>
        );
    }, [user, userId, getOthersUserInfo, currentUser]);

    const latestActive = useCallback(() => {
        const userInfo = getOthersUserInfo(userId);

        return (
            <div className={styles.latestActive}>
                <div className={styles.activeTime}>
                    {dayjs(userInfo.latestActive).fromNow(true)}
                </div>
            </div>
        );
    }, [userId, getOthersUserInfo]);

    return (
        <div className={styles.userProfileWrapper}>
            {userProfile()}
            {nickName()}
            {latestActive()}
        </div>
    )
}