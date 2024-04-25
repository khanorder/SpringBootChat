import styles from "@/styles/chatSignIn.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import Link from "next/link";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {checkAuthenticationReq, startGuestReq, getTokenUserInfoReq} from "@/stores/reducers/webSocket";
import {Domains} from "@/domains";
import {jwtDecode} from "jwt-decode";
import {Helpers} from "@/helpers";
import isEmpty from "lodash/isEmpty";
import {Defines} from "@/defines";
import Image from "next/image";
import titleLogo01 from "public/images/logo01.jpg";
import titleLogo02 from "public/images/logo02.jpg";
import titleLogo03 from "public/images/logo03.jpg";
import titleLogo04 from "public/images/logo04.jpg";
import useCurrentUser from "@/components/common/useCurrentUser";
import ChangeIcon from "public/images/change.svg";
import {setIsActiveChangeUser} from "@/stores/reducers/ui";
import useUserInfos from "@/components/common/useUserInfos";

export default function ChatSignIn() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const user = useAppSelector(state => state.user);
    const [currentUser] = useCurrentUser();
    const [userInfos] = useUserInfos();
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const checkAuthentication = useCallback(() => {
        if (isEmpty(currentUser.accessToken) || isEmpty(currentUser.userName)) {
            if (isEmpty(currentUser.refreshToken)) {
                alert("기존 계정 정보가 없습니다.");
                return;
            }
        }

        if (!confirm(`${currentUser.userName} 계정으로 다시 로그인 하시겠습니까?`))
            return;

        dispatch(checkAuthenticationReq());
    }, [dispatch, currentUser]);

    const changeUser = useCallback(() => {
        console.log(currentUser.accessToken)
        console.log(currentUser.refreshToken)
        console.log(currentUser.userName)
        if (isEmpty(currentUser.accessToken) || isEmpty(currentUser.userName)) {
            if (isEmpty(currentUser.refreshToken)) {
                alert("기존 계정 정보가 없습니다.");
                return;
            }
        }
        
        dispatch(setIsActiveChangeUser(true));

    }, [dispatch, currentUser]);

    const startGuest = useCallback(() => {
        dispatch(startGuestReq());
    }, [dispatch]);

    const signInButtons = useCallback(() => {
        const buttons: ReactElement[] = [];
        if (0 < userInfos.size) {
            if (isEmpty(currentUser.userName))
                dispatch(getTokenUserInfoReq(isEmpty(currentUser.accessToken) ? currentUser.refreshToken : currentUser.accessToken));

            buttons.push(
                <div className={styles.buttonWrapper} key={'existsTokenProfile'}>
                    {
                        1 < userInfos.size
                            ?
                            <button className={styles.changeUser} onClick={changeUser} title="계정변경">
                                <Image className={styles.changeUserIcon} src={ChangeIcon} alt="계정변경" fill={true} priority={true} />
                            </button>
                            :
                            <></>
                    }
                    <button className={`${styles.button} ${styles.existsToken}`} onClick={checkAuthentication} title={`${currentUser.userName} 계정으로 시작`}>
                        <img className={styles.profile} src={currentUser.profileImageUrl} alt={currentUser.userName} title={currentUser.userName}/>
                    </button>
                </div>
            );

            buttons.push(
                <div className={styles.buttonWrapper} key={'existsTokenName'}>
                    <button className={`${styles.button} ${styles.existsToken} ${stylesCommon.button}`} onClick={checkAuthentication} title={`${currentUser.userName} 계정으로 시작`}>
                        <span className={styles.name}>{currentUser.userName}</span>
                    </button>
                </div>
            );

            if (1 < userInfos.size) {
                buttons.push(
                    <div className={styles.buttonWrapper} key={'changeUser'}>
                        <button className={`${styles.button} ${stylesCommon.button}`} onClick={changeUser} title="계정변경">
                            <span className={styles.name}>계정변경</span>
                        </button>
                    </div>
                );
            }
        }

        buttons.push(
            <div className={styles.buttonWrapper} key={'startGuest'}>
                <button className={`${styles.button} ${styles.createTempButton} ${stylesCommon.button}`} onClick={startGuest}>
                    Guest 시작
                </button>
            </div>
        );

        return buttons;
    }, [currentUser, userInfos, dispatch, changeUser, checkAuthentication, startGuest]);

    return (
        <div className={`${styles.chatSignInWrapper}${appConfigs.isProd ? '' : ` ${styles.dev}`}`}>
            <div className={styles.chatSignIn}>
                <div className={styles.signinEmpty}></div>
                <div className={styles.title}>
                    <div className={styles.titleLogoWrapper}>
                        <Image className={styles.titleLogo} src={titleLogo02} fill={true} priority={true} alt="ZTalk" />
                    </div>
                </div>
                <div className={styles.buttons}>
                    {signInButtons()}
                </div>
                <div className={styles.signinEmpty}></div>
            </div>
        </div>
    );
}