import styles from "@/styles/chatSignIn.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import Link from "next/link";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {checkAuthenticationReq, startGuestReq, getTokenUserInfoReq} from "@/stores/reducers/webSocket";
import {Domains} from "@/domains";
import {jwtDecode} from "jwt-decode";
import {Helpers} from "@/helpers";
import AuthedJwtPayload = Domains.AuthedJwtPayload;
import isEmpty from "lodash/isEmpty";
import {Defines} from "@/defines";

export default function ChatSignIn() {
    const firstRender = useRef(true);
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const checkAuthentication = useCallback(() => {
        if (isEmpty(user.token) || isEmpty(user.name)) {
            alert("기존 계정 정보가 없습니다.");
            return;
        }

        if (!confirm(`${user.name} 계정으로 다시 로그인 하시겠습니까?`))
            return;

        dispatch(checkAuthenticationReq());
    }, [dispatch, user]);

    const startGuest = useCallback(() => {
        dispatch(startGuestReq());
    }, [dispatch]);

    const signInButtons = useCallback(() => {
        const buttons: ReactElement[] = [];
        if (!isEmpty(user.token)) {
            dispatch(getTokenUserInfoReq(user.token));

            buttons.push(
                <button key={'existsTokenProfile'}
                        className={`${styles.button} ${styles.existsToken}`}
                        onClick={checkAuthentication} title={`${user.name} 계정으로 시작`}>
                    <img className={styles.profile} src={user.profileImageUrl} alt={user.name} title={user.name}/>
                </button>
            );
            buttons.push(
                <button key={'existsTokenName'}
                        className={`${styles.button} ${styles.existsToken} ${stylesCommon.button}`}
                        onClick={checkAuthentication} title={`${user.name} 계정으로 시작`}>
                    <span className={styles.name}>{user.name}</span>
                </button>
            );
        } else {
            buttons.push(
                <button key={'startGuest'}
                        className={`${styles.button} ${styles.createTempButton} ${stylesCommon.button}`}
                        onClick={startGuest}>
                    Guest 시작
                </button>
            );
        }


        return buttons;
    }, [user, checkAuthentication, startGuest]);

    return (
        <div className={styles.chatSignInWrapper}>
            <div className={styles.chatSignIn}>
                <div className={styles.signinEmpty}></div>
                <div className={styles.title}>

                </div>
                <div className={styles.buttons}>
                    {signInButtons()}
                </div>
                <div className={styles.signinEmpty}></div>
            </div>
        </div>
    );
}