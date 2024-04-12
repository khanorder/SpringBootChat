import {useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import Image from "next/image";
import UserIcon from "public/images/user-circle.svg";
import {Domains} from "@/domains";
import styles from "@/styles/chatMyProfile.module.sass";
import {setIsActiveProfile} from "@/stores/reducers/ui";
import isEmpty from "lodash/isEmpty";

export default function ChatMyProfile() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const user = useAppSelector(state => state.user);
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

    return (
        <div className={styles.myProfileWrapper} onClick={editProfile}>
            <div className={styles.userThumb}>
                {
                    user.haveProfile
                        ?
                        <img className={styles.userThumbImage}
                             src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}/api/profileThumb/${user.id}`}
                             alt='사용자 프로필'/>
                        :
                        <Image className={styles.userThumbIcon} src={UserIcon} alt='사용자 프로필' fill={true}
                               priority={true}/>
                }
            </div>
            <div className={styles.userInfo}>
                <div className={styles.userName}>{user.name}</div>
                <div className={`${styles.userMessage}${isEmpty(user.message) ? ` ${styles.none}` : ""}`}>{isEmpty(user.message) ? "내 상태를 공유해보세요." : user.message}</div>
            </div>
        </div>
    )
}