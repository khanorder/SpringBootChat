import {ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/chatDialogSignIn.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveSignIn} from "@/stores/reducers/ui";
import RemoveIcon from 'public/images/close.svg';
import dynamic from "next/dynamic";
import {Domains} from "@/domains";
import useUserInfos from "@/components/common/useUserInfos";
import Image from "next/image";
import {removeUserInfo, setUserId, setUserInfo, signIn} from "@/stores/reducers/user";
import {Helpers} from "@/helpers";
import {AuthAPI} from "@/apis/authAPI";
import {Errors} from "@/defines/errors";
import {checkAuthenticationReq, signInReq} from "@/stores/reducers/webSocket";
const LayoutCenterDialog = dynamic(() => import("@/components/layouts/dialogCenter"), { ssr: false });

export default function DialogSignUp() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const [userInfos] = useUserInfos();
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!firstRender.current && !ui.isActiveSignUp) {
            setUserName("");
            setPassword("");
        }

    }, [firstRender, ui, setUserName, setPassword]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveSignIn(false));
    }, [dispatch]);

    const onChangeUserName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        let inputText = e.target?.value ? e.target.value.trim() : "";
        if (inputText.matchAll(/[^a-zA-Z0-9_\-]/g).next().value) {
            alert("계정명은 영문, 숫자, 특수문자 '_', '-' 만 사용가능합니다.");
            inputText = inputText.replaceAll(/[^a-zA-Z0-9_\-]+/g, '');
        }

        if (10 < inputText.length) {
            alert("계정명은 10글자 이하로 입력해 주세요.");
            inputText = inputText.substring(0, 10);
        }
        setUserName(inputText);
    }, [setUserName]);

    const onChangePassword = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        let inputText = e.target?.value ? e.target.value.trim() : "";
        if (20 < inputText.length) {
            alert("비밀번호는 20글자 이하로 입력해 주세요.");
            inputText = inputText.substring(0, 20);
        }
        setPassword(inputText);
    }, [setPassword]);

    const onSignIn = useCallback(async () => {
        if (isEmpty(userName.trim())) {
            alert("계정이름을 입력해 주세요.");
            return;
        }

        if (isEmpty(password.trim())) {
            alert("비밀번호를 입력해 주세요.");
            return;
        }

        const response = await AuthAPI.SignInAsync({userName: userName, password: password});
        switch (response.result) {
            case Errors.SignIn.NONE:
                if (isEmpty(response.accessToken) || isEmpty(response.refreshToken)) {
                    alert("로그인 실패.");
                } else {
                    const authedJwt = Helpers.getAuthedJwt(response.accessToken);
                    if (!authedJwt || !authedJwt.id || !authedJwt.accountType || Defines.AccountType.NORMAL !== authedJwt.accountType || !authedJwt.nickName) {
                        alert("로그인 실패.");
                        break;
                    }

                    const userInfo: Domains.UserInfo = {
                        userId: authedJwt.id,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                        accountType: authedJwt.accountType,
                        nickName: authedJwt.nickName,
                        message: "",
                        haveProfile: false,
                        latestActiveAt: 0,
                        profileImageUrl: Domains.defaultProfileImageUrl
                    };

                    dispatch(setUserId(userInfo.userId));
                    dispatch(setUserInfo(userInfo));
                    dispatch(checkAuthenticationReq());
                    hideDialog();
                }
                break;

            case Errors.SignIn.USER_NAME_REQUIRED:
                alert("계정이름을 입력해 주세요.");
                break;

            case Errors.SignIn.PASSWORD_REQUIRED:
                alert("비밀번호를 입력해 주세요.");
                break;

            case Errors.SignIn.ALREADY_SIGN_IN:
                alert("이미 로그인 중입니다.");
                break;

            default:
                alert("로그인 실패.");
                break;
        }
    }, [userName, password, dispatch, hideDialog]);

    const inputForm = useCallback(() => {
        return (
            <div className={styles.inputForm}>
                <div className={`${styles.inputWrapper} ${styles.inputUserName}`}>
                    <input type="text" className={styles.input} value={userName} onChange={(e) => onChangeUserName(e)}/>
                </div>
                <div className={`${styles.inputWrapper} ${styles.inputPassword}`}>
                    <input type="password" className={styles.input} value={password} onChange={(e) => onChangePassword(e)}/>
                </div>
            </div>
        );
    }, [userName, password, onChangeUserName, onChangePassword]);

    const dialog = useCallback(() => {
        return (
            <LayoutCenterDialog
                type={Defines.CenterDialogType.SIGN_IN}
                size={Defines.CenterDialogSize.TINY}
                buttons={
                    <>
                        <button className={`${styles.button} ${stylesCommon.button} ${stylesCommon.primaryButton}`} onClick={onSignIn} title="로그인">로그인</button>
                        <button className={`${styles.button} ${stylesCommon.button}`} onClick={hideDialog} title="취소">취소</button>
                    </>
                }>
                <div className={styles.chatSignUpWrapper}>
                    <div className={styles.inputForm}>
                        {inputForm()}
                    </div>
                </div>
            </LayoutCenterDialog>
        );
    }, [hideDialog, inputForm, onSignIn]);

    return dialog();
}