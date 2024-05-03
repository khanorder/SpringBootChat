import styles from "@/styles/chatUserProfile.module.sass";
import {useCallback, useEffect, useRef} from "react";
import {useAppSelector} from "@/hooks";
import useOthersUserInfo from "@/components/common/useOthersUserInfo";
import {dayjs} from "@/helpers/localizedDayjs";
import useCurrentUser from "@/components/common/useCurrentUser";
import appConfigs from "@/stores/reducers/appConfigs";
import {Domains} from "@/domains";
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;
import Image from "next/image";

export interface ChatUserProfileProps {
    userId: string;
}

export default function ChatUserProfile({ userId }: ChatUserProfileProps) {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
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
                    <Image className={styles.userThumbImage} src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${userInfo.userId}`} alt='프로필' width={40} height={40}/>
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
    }, [appConfigs, getOthersUserInfo, userId]);

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