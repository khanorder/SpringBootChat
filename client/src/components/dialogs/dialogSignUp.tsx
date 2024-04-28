import {ChangeEvent, KeyboardEvent, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/chatDialogSignUp.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveSignUp} from "@/stores/reducers/ui";
import RemoveIcon from 'public/images/close.svg';
import dynamic from "next/dynamic";
import {Domains} from "@/domains";
import useUserInfos from "@/components/common/useUserInfos";
import Image from "next/image";
import {removeUserInfo, setUserId, setUserInfo} from "@/stores/reducers/user";
import {Helpers} from "@/helpers";
import {AuthAPI} from "@/apis/authAPI";
import {Errors} from "@/defines/errors";
import useCurrentUser from "@/components/common/useCurrentUser";
const LayoutCenterDialog = dynamic(() => import("@/components/layouts/dialogCenter"), { ssr: false });

export default function DialogSignUp() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const [currentUser] = useCurrentUser();
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
        dispatch(setIsActiveSignUp(false));
    }, [dispatch]);

    const onChangeUserName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        let inputText = e.target?.value ? e.target.value.trim() : "";
        const inValidText = inputText.matchAll(/[^a-zA-Z0-9_\-]/g)?.next()?.value;
        if (inValidText) {
            alert(`'${inValidText}'는 계정이름에 상용할 수없는 문자입니다.\n계정이름은 영문, 숫자, 특수문자 '_', '-' 만 사용가능합니다.`);
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

    const onSignUp = useCallback(async () => {
        let accessToken: string = "";
        if (Defines.AuthStateType.SIGN_IN === user.authState) {
            if (Defines.AccountType.TEMP !== currentUser.accountType) {
                alert("임시계정만 등록할 수 있습니다.");
                return;
            }

            if ("undefined" !== typeof currentUser.accessToken && !isEmpty(currentUser.accessToken))
                accessToken = currentUser.accessToken;
        }
        
        if (isEmpty(userName.trim())) {
            alert("계정이름을 입력해주세요.");
            return;
        }

        if (2 > userName.length) {
            alert("계정이름은 2글자 이상 입력해주세요.");
            return;
        }

        if (isEmpty(password.trim())) {
            alert("비밀번호를 입력해주세요.");
            return;
        }

        if (4 > password.length) {
            alert("비밀번호는 4글자 이상 입력해주세요.");
            return;
        }

        const response = await AuthAPI.SignUpAsync({userName: userName, password: password, token: accessToken});
        switch (response.result) {
            case Errors.SignUp.NONE:
                alert("계정생성 완료.");
                hideDialog();
                break;

            case Errors.SignUp.UPGRADE_EXISTS_ACCOUNT:
                const upgradeUser: Domains.UserInfo = {
                    userId: currentUser.userId,
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    accountType: Defines.AccountType.NORMAL,
                    nickName: currentUser.nickName,
                    message: currentUser.message,
                    haveProfile: currentUser.haveProfile,
                    latestActiveAt: currentUser.latestActiveAt,
                    profileImageUrl: currentUser.profileImageUrl
                }
                dispatch(setUserInfo(upgradeUser));
                alert("계정등록 완료.");
                hideDialog();
                break;
                
            case Errors.SignUp.USER_NAME_REQUIRED:
                alert("계정이름을 입력해주세요.");
                break;

            case Errors.SignUp.USER_NAME_TOO_SHORT:
                alert("계정이름은 2글자 이상 입력해주세요.");
                break;

            case Errors.SignUp.ALREADY_USED_USER_NAME:
                alert("이미 사용중인 계정이름 입니다.");
                break;

            case Errors.SignUp.PASSWORD_REQUIRED:
                alert("비밀번호를 입력해주세요.");
                break;

            case Errors.SignUp.PASSWORD_TOO_SHORT:
                alert("비밀번호는 4글자 이상 입력해주세요.");
                break;

            case Errors.SignUp.FAILED_TO_ISSUE_TOKEN:
                alert("등록한 계정의 토큰을 발급하는데 실패했습니다.\n다시 로그인 해주세요.");
                break;

            default:
                alert("계정생성 실패.");
                break;
        }
    }, [user, userName, password, currentUser, hideDialog, dispatch]);

    const onKeyUp = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSignUp();
        } else if (e.key === "Escape") {
            hideDialog();
        }
    }, [onSignUp, hideDialog]);

    const inputForm = useCallback(() => {
        return (
            <div className={styles.inputForm}>
                <div className={`${styles.inputWrapper} ${styles.inputUserName}`}>
                    <input type="text" className={styles.input} value={userName} onKeyUp={e => onKeyUp(e)} onChange={(e) => onChangeUserName(e)}/>
                </div>
                <div className={`${styles.inputWrapper} ${styles.inputPassword}`}>
                    <input type="password" className={styles.input} value={password} onKeyUp={e => onKeyUp(e)} onChange={(e) => onChangePassword(e)}/>
                </div>
            </div>
        );
    }, [userName, password, onChangeUserName, onChangePassword, onKeyUp]);

    const dialog = useCallback(() => {
        return (
            <LayoutCenterDialog
                type={Defines.CenterDialogType.SIGN_UP}
                size={Defines.CenterDialogSize.TINY}
                buttons={
                    <>
                        <button className={`${styles.button} ${stylesCommon.button} ${stylesCommon.primaryButton}`} onClick={onSignUp} title="등록">등록</button>
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
    }, [hideDialog, inputForm, onSignUp]);

    return dialog();
}