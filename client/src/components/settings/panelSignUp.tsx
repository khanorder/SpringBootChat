import {ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState} from "react";
import dynamic from "next/dynamic";
import styles from "@/styles/settings.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import stylesSignUp from "@/styles/settingsSignUp.module.sass";
import isEmpty from "lodash/isEmpty";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {AuthAPI} from "@/apis/authAPI";
import {Errors} from "@/defines/errors";
import useCurrentUser from "@/components/common/useCurrentUser";
import {Defines} from "@/defines";
import {Domains} from "@/domains";
import {setUserInfo} from "@/stores/reducers/user";

export enum ChangeType {
    PASSWORD = 0,
    NEW_PASSWORD = 1,
    NEW_PASSWORD_CONFIRM = 2
}

export interface ChangePasswordProps {
    isOpenItem: boolean;
    className?: string;
}

export default function PanelChangePassword({ isOpenItem, className }: ChangePasswordProps) {
    const firstRender = useRef(true);
    const user = useAppSelector(state => state.user);
    const [currentUser] = useCurrentUser();
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!firstRender.current && !isOpenItem) {
            setUserName("");
            setPassword("");
        }

    }, [firstRender, isOpenItem, setUserName, setPassword]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

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
    }, [user, userName, password, currentUser, dispatch]);

    const onKeyUp = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter")
            onSignUp();
    }, [onSignUp]);

    const inputForm = useCallback(() => {
        return (
            <div className={stylesSignUp.inputForm}>
                <div className={`${stylesSignUp.inputWrapper} ${stylesSignUp.inputUserName}`}>
                    <input type="text" className={stylesSignUp.input} value={userName} onKeyUp={e => onKeyUp(e)} onChange={(e) => onChangeUserName(e)}/>
                </div>
                <div className={`${stylesSignUp.inputWrapper} ${stylesSignUp.inputPassword}`}>
                    <input type="password" className={stylesSignUp.input} value={password} onKeyUp={e => onKeyUp(e)} onChange={(e) => onChangePassword(e)}/>
                </div>
            </div>
        );
    }, [userName, password, onChangeUserName, onChangePassword, onKeyUp]);

    const panel = useCallback(() => {
        let panelClass: string = styles.itemPanel;

        if (isOpenItem)
            panelClass += ` ${styles.opened}`;

        if (!isEmpty(className))
            panelClass += ` ${className}`;

        return (
            <div className={panelClass}>
                {inputForm()}
                <div className={stylesSignUp.buttons}>
                    <button className={`${stylesCommon.button} ${stylesCommon.primaryButton} ${stylesSignUp.button}`} onClick={onSignUp}>등록</button>
                </div>
            </div>
        );
    }, [isOpenItem, className, inputForm, onSignUp]);

    return panel();
}