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
import {setIsActiveChangeUser, setIsActiveSignIn, setIsActiveSignUp} from "@/stores/reducers/ui";
import useUserInfos from "@/components/common/useUserInfos";
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;

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
        if (isEmpty(currentUser.accessToken) || isEmpty(currentUser.nickName)) {
            if (isEmpty(currentUser.refreshToken)) {
                alert("기존 계정 정보가 없습니다.");
                return;
            }
        }

        if (!confirm(`${currentUser.nickName} 계정으로 다시 로그인 하시겠습니까?`))
            return;

        dispatch(checkAuthenticationReq());
    }, [dispatch, currentUser]);

    const changeUser = useCallback(() => {
        dispatch(setIsActiveChangeUser(true));
    }, [dispatch]);

    const startGuest = useCallback(() => {
        dispatch(startGuestReq());
    }, [dispatch]);

    const signIn = useCallback(() => {
        dispatch(setIsActiveSignIn(true));
    }, [dispatch]);

    const signUp = useCallback(() => {
        dispatch(setIsActiveSignUp(true));
    }, [dispatch]);

    const signInButtons = useCallback(() => {
        const buttons: ReactElement[] = [];
        if (0 < userInfos.size && !isEmpty(currentUser.nickName)) {

            buttons.push(
                <div className={`${styles.buttonWrapper} ${styles.profileButtonWrapper}`} key={'existsTokenProfile'}>
                    {
                        1 < userInfos.size
                            ?
                            <button className={styles.changeUser} onClick={changeUser} title="계정변경">
                                <Image className={styles.changeUserIcon} src={ChangeIcon} alt="계정변경" fill={true} priority={true} />
                            </button>
                            :
                            <></>
                    }
                    <button className={`${styles.button} ${styles.existsToken}`} onClick={checkAuthentication} title={`${currentUser.nickName} 계정으로 시작`}>
                        <img className={styles.profile} src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${currentUser.userId}`} alt={currentUser.nickName} title={currentUser.nickName}/>
                    </button>
                </div>
            );

            buttons.push(
                <div className={styles.buttonWrapper} key={'existsTokenName'}>
                    <button className={`${styles.button} ${styles.existsToken} ${stylesCommon.button}`}
                            onClick={checkAuthentication} title={`${currentUser.nickName} 계정으로 시작`}>
                        <span className={styles.name}>{currentUser.nickName}</span>
                        <span className={styles.startText}>으로 시작</span>
                    </button>
                </div>
            );

            buttons.push(
                <div className={styles.buttonWrapper} key={'changeUser'}>
                    <button className={`${styles.button} ${stylesCommon.button}`} onClick={changeUser} title="계정변경">
                        <span className={styles.name}>계정변경</span>
                    </button>
                </div>
            );
        } else {
            buttons.push(
                <div className={styles.buttonWrapper} key={'startGuest'}>
                    <button className={`${styles.button} ${styles.createTempButton} ${stylesCommon.button}`} onClick={startGuest} title="Guest 시작">
                        Guest 시작
                    </button>
                </div>
            );
        }

        buttons.push(
            <div className={styles.buttonWrapper} key={'signIn'}>
                <button className={`${styles.button} ${styles.signInButton} ${stylesCommon.button} ${stylesCommon.primaryButton}`} onClick={signIn} title="로그인">
                    로그인
                </button>
            </div>
        );

        buttons.push(
            <div className={styles.buttonWrapper} key={'signUp'}>
                <button className={`${styles.button} ${styles.signUpButton} ${stylesCommon.button}`} onClick={signUp} title="계정생성">
                    계정생성
                </button>
            </div>
        );

        return buttons;
    }, [appConfigs, currentUser, userInfos, dispatch, changeUser, checkAuthentication, startGuest]);

    return (
        <div className={styles.chatSignInWrapper}>
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