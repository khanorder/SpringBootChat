import {useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import Image from "next/image";
import ModifyIcon from "public/images/modify-icon.svg";
import styles from "@/styles/chatMyProfile.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {setIsActiveProfile, setIsActiveSignUp} from "@/stores/reducers/ui";
import isEmpty from "lodash/isEmpty";
import useCurrentUser from "@/components/common/useCurrentUser";
import {Defines} from "@/defines";
import {Domains} from "@/domains";
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;

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

    const signUp = useCallback(() => {
        dispatch(setIsActiveSignUp(true));
    }, [dispatch]);

    const userProfileImage = useCallback(() => {
        return (
            <img className={styles.userThumbImage} src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${currentUser.userId}?${(new Date()).getTime()}`} alt='내 프로필'/>
        );
    }, [appConfigs, currentUser]);

    return (
        <div className={`${styles.myProfileWrapper}${Defines.AccountType.TEMP === currentUser.accountType ? ` ${styles.tempUser}` : ''}`}>
            <div className={styles.userThumb} onClick={editProfile}>
                {userProfileImage()}
            </div>
            <div className={styles.userInfo} onClick={editProfile}>
                <div className={styles.nickName}>{currentUser.nickName}</div>
                <div className={`${styles.userMessage}${isEmpty(currentUser.message) ? ` ${styles.none}` : ""}`}>{isEmpty(currentUser.message) ? "내 상태를 공유해보세요." : currentUser.message}</div>
            </div>
            {
                Defines.AccountType.TEMP === currentUser.accountType
                    ?
                    <div className={styles.buttons}>
                        <button className={`${stylesCommon.button} ${styles.signUpButton} ${stylesCommon.primaryButton}`} onClick={signUp}>계정등록</button>
                    </div>
                    :
                    <></>
            }
            {/*<div className={styles.modifiable}>*/}
            {/*    <Image src={ModifyIcon} alt="프로필 수정" fill={true} priority={true} />*/}
            {/*</div>*/}
        </div>
    )
}