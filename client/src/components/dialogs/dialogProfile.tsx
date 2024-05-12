import {useCallback, useEffect, useRef, useState} from "react";
import {Defines} from "@/defines";
import dynamic from "next/dynamic";
import {useAppDispatch, useAppSelector} from "@/hooks";
import Image from "next/image";
import styles from "@/styles/chatDialogUserProfile.module.sass";
import useOthersUserInfo from "@/components/common/useOthersUserInfo";
import {Domains} from "@/domains";
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;
import isEmpty from "lodash/isEmpty";
import stylesCommon from "@/styles/common.module.sass";
import useCurrentUser from "@/components/common/useCurrentUser";
import {followReq, unfollowReq} from "@/stores/reducers/webSocket";
const LayoutSlideDialog = dynamic(() => import("@/components/layouts/dialogSlide"), { ssr: false });

export default function DialogMyProfile() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();
    const [currentUser] = useCurrentUser();
    const [getOthersUserInfo] = useOthersUserInfo();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion
    
    const follow = useCallback((user: Domains.User) => {
        dispatch(followReq(user));
    }, [dispatch]);

    const unfollow = useCallback((user: Domains.User) => {
        dispatch(unfollowReq(user));
    }, [dispatch]);

    const userProfile = useCallback(() => {
        const userInfo = getOthersUserInfo(ui.profileDetailUserId);
        const profileImageUrl = `${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${userInfo.userId}?${(new Date()).getTime()}`;
        const followUser = user.follows.find(_ => _.userId === userInfo.userId);

        return (
            <div className={styles.userProfileWrapper}>
                <div className={styles.userThumb}>
                    <div className={styles.profileImageWrapper}>
                        <Image className={styles.userThumbImage} src={profileImageUrl} alt={`${userInfo.nickName} 프로필`}
                               width={120} height={120}/>
                    </div>
                </div>
                <div className={styles.userInfo}>
                    <div className={styles.nickName}>
                        <div className={styles.currentNickName}>{userInfo.nickName}</div>
                    </div>
                    <div className={styles.separator}></div>
                    <div className={styles.userMessage}>
                        <div
                            className={`${styles.currentUserMessage}${isEmpty(userInfo.message) ? ` ${styles.none}` : ""}`}>{isEmpty(userInfo.message) ? "" : userInfo.message}</div>
                    </div>
                </div>
                {
                    currentUser.userId !== userInfo.userId
                        ?
                            <div className={styles.buttons}>
                                {
                                    followUser
                                        ?
                                            <button className={`${stylesCommon.button} ${styles.button}`} onClick={() => unfollow(userInfo)}>언팔로우</button>
                                        :
                                            <button className={`${stylesCommon.button} ${stylesCommon.primaryButton} ${styles.button}`} onClick={() => follow(userInfo)}>팔로우</button>
                                }
                            </div>
                        :
                            <></>
                }
            </div>
        );

    }, [getOthersUserInfo, ui, appConfigs, user, currentUser, unfollow, follow]);

    return (
        <LayoutSlideDialog type={Defines.SlideDialogType.PROFILE}>
            {userProfile()}
        </LayoutSlideDialog>
    );
}