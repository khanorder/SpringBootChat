import {useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import Image from "next/image";
import ModifyIcon from "public/images/modify-icon.svg";
import styles from "@/styles/chatMyProfile.module.sass";
import {setIsActiveProfile} from "@/stores/reducers/ui";
import isEmpty from "lodash/isEmpty";
import useCurrentUser from "@/components/common/useCurrentUser";

export default function ChatMyProfile() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const user = useAppSelector(state => state.user);
    const [currentUser] = useCurrentUser();
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const editProfile = useCallback(() => {
        dispatch(setIsActiveProfile(true));
    }, [dispatch]);

    const userProfileImage = useCallback(() => {
        return (
            <img className={styles.userThumbImage} src={currentUser.profileImageUrl} alt='내 프로필'/>
        );
    }, [currentUser]);

    return (
        <div className={styles.myProfileWrapper} onClick={editProfile}>
            <div className={styles.userThumb}>
                {userProfileImage()}
            </div>
            <div className={styles.userInfo}>
                <div className={styles.userName}>{currentUser.userName}</div>
                <div className={`${styles.userMessage}${isEmpty(currentUser.message) ? ` ${styles.none}` : ""}`}>{isEmpty(currentUser.message) ? "내 상태를 공유해보세요." : currentUser.message}</div>
            </div>
            <div className={styles.modifiable}>
                <Image src={ModifyIcon} alt="프로필 수정" fill={true} priority={true} />
            </div>
        </div>
    )
}