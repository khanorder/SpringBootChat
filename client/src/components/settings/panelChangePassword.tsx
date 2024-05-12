import {ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState} from "react";
import dynamic from "next/dynamic";
import styles from "@/styles/settings.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import stylesChangePassword from "@/styles/settingsChangePassword.module.sass";
import isEmpty from "lodash/isEmpty";
import {useAppDispatch} from "@/hooks";
import {AuthAPI} from "@/apis/authAPI";
import {Errors} from "@/defines/errors";

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
    const [password, setPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('');
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!firstRender.current && !isOpenItem) {
            setPassword("");
            setNewPassword("");
            setNewPasswordConfirm("");
        }

    }, [firstRender, isOpenItem, setPassword, setNewPassword, setNewPasswordConfirm]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const onSubmit = useCallback(async () => {
        if (isEmpty(password.trim())) {
            alert("비밀번호를 입력해 주세요.");
            return;
        }

        if (isEmpty(newPassword.trim())) {
            alert("새 비밀번호를 입력해 주세요.");
            return;
        }

        if (4 > newPassword.length) {
            alert("비밀번호는 4글자 이상 입력해주세요.");
            return;
        }

        if (20 < newPassword.length) {
            alert("비밀번호는 20글자 이하로 입력해 주세요.");
            return;
        }

        if (isEmpty(newPasswordConfirm.trim())) {
            alert("새 비밀번호 확인을 입력해 주세요.");
            return;
        }

        if (newPassword !== newPasswordConfirm) {
            alert("새 비밀번호와 확인내용이 일치하지 않습니다.");
            return;
        }

        const response = await AuthAPI.ChangePasswordAsync({password: password, newPassword: newPassword, newPasswordConfirm: newPasswordConfirm});
        switch (response.result) {
            case Errors.ChangePassword.NONE:
                setPassword("");
                setNewPassword("");
                setNewPasswordConfirm("");
                alert("비밀번호 변경완료.");
                break;

            case Errors.ChangePassword.PASSWORD_REQUIRED:
                alert("기존 비밀번호를 입력해 주세요.");
                break;

            case Errors.ChangePassword.NEW_PASSWORD_REQUIRED:
                alert("새 비밀번호를 입력해 주세요.");
                break;

            case Errors.ChangePassword.NEW_PASSWORD_CONFIRM_REQUIRED:
                alert("새 비밀번호 확인을 입력해 주세요.");
                break;

            case Errors.ChangePassword.NEW_PASSWORD_NOT_MATCHED:
                alert("새 비밀번호와 확인내용이 일치하지 않습니다.");
                break;

            case Errors.ChangePassword.NOT_FOUND_USER:
                alert("사용자 정보를 찾을 수 없습니다.");
                break;

            case Errors.ChangePassword.PASSWORD_NOT_MATCHED:
                alert("기존 비밀번호가 일치하지 않습니다.");
                break;

            default:
                alert("비밀번호 변경 실패.");
                break;
        }
    }, [password, newPassword, newPasswordConfirm, setPassword, setNewPassword, setNewPasswordConfirm]);

    const onChangePassword = useCallback((e: ChangeEvent<HTMLInputElement>, changeType: ChangeType) => {
        let inputText = e.target?.value ? e.target.value.trim() : "";
        if (20 < inputText.length) {
            alert("비밀번호는 20글자 이하로 입력해 주세요.");
            inputText = inputText.substring(0, 20);
        }

        switch (changeType) {
            case ChangeType.PASSWORD:
                setPassword(inputText);
                break;

            case ChangeType.NEW_PASSWORD:
                setNewPassword(inputText);
                break;

            case ChangeType.NEW_PASSWORD_CONFIRM:
                setNewPasswordConfirm(inputText);
                break;

            default:
                break;
        }

    }, [setPassword, setNewPassword, setNewPasswordConfirm]);

    const onKeyUp = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter")
            onSubmit();
    }, [onSubmit]);

    const panel = useCallback(() => {
        let panelClass: string = styles.itemPanel;

        if (isOpenItem)
            panelClass += ` ${styles.opened}`;

        if (!isEmpty(className))
            panelClass += ` ${className}`;

        return (
            <div className={panelClass}>
                <div className={stylesChangePassword.inputForm}>
                    <div className={stylesChangePassword.inputWrapper}>
                        <label className={stylesChangePassword.inputLabel} htmlFor="postPassword">기존 비밀번호</label>
                        <input type="password" className={stylesChangePassword.input} id="postPassword" value={password}
                               onKeyUp={e => onKeyUp(e)}
                               onChange={(e) => onChangePassword(e, ChangeType.PASSWORD)}/>
                    </div>
                    <div className={stylesChangePassword.inputWrapper}>
                        <label className={stylesChangePassword.inputLabel} htmlFor="newPassword">새 비밀번호</label>
                        <input type="password" className={stylesChangePassword.input} id="newPassword"
                               value={newPassword} onKeyUp={e => onKeyUp(e)}
                               onChange={(e) => onChangePassword(e, ChangeType.NEW_PASSWORD)}/>
                    </div>
                    <div className={stylesChangePassword.inputWrapper}>
                        <label className={stylesChangePassword.inputLabel} htmlFor="confirmPassword">새 비밀번호 확인</label>
                        <input type="password" className={stylesChangePassword.input} id="confirmPassword"
                               value={newPasswordConfirm} onKeyUp={e => onKeyUp(e)}
                               onChange={(e) => onChangePassword(e, ChangeType.NEW_PASSWORD_CONFIRM)}/>
                    </div>
                </div>
                <div className={stylesChangePassword.buttons}>
                    <button className={`${stylesCommon.button} ${stylesCommon.primaryButton} ${stylesChangePassword.button}`} onClick={onSubmit}>변경</button>
                </div>
            </div>
        );
    }, [isOpenItem, className, password, newPassword, newPasswordConfirm, onKeyUp, onChangePassword, onSubmit]);

    return panel();
}