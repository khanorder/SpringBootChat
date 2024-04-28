import {ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/chatDialogChangeUser.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveChangeUser} from "@/stores/reducers/ui";
import RemoveIcon from 'public/images/close.svg';
import dynamic from "next/dynamic";
import {Domains} from "@/domains";
import useUserInfos from "@/components/common/useUserInfos";
import Image from "next/image";
import {removeUserInfo, setUserId} from "@/stores/reducers/user";
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;
const LayoutCenterDialog = dynamic(() => import("@/components/layouts/dialogCenter"), { ssr: false });

export default function DialogChangeUser() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const [userInfos] = useUserInfos();
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveChangeUser(false));
    }, [dispatch]);

    const changeUser = useCallback((userInfo: Domains.UserInfo) => {
        if (isEmpty(userInfo.userId) || isEmpty(userInfo.nickName) || isEmpty(userInfo.refreshToken)) {
            alert("사용자 인증이 만료된 계정입니다.");
            return;
        }

        dispatch(setUserId(userInfo.userId));
        hideDialog();
    }, [dispatch, hideDialog]);
    
    const removeUser = useCallback((userId: string) => {
        const userInfo = userInfos.get(userId);
        if (!userInfo) {
            alert("삭제할 계정 정보가 없습니다.");
            return;
        }

        if (Defines.AccountType.TEMP === userInfo.accountType) {
            if (!confirm("Guest 계정은 삭제하면 다시 로그인 할 수 없습니다.\n계속 하시겠습니까?"))
                return;
        }
        dispatch(removeUserInfo(userId));
    }, [dispatch, userInfos]);

    const userList = useCallback(() => {
        const list: ReactElement[] = [];
        if (0 < userInfos.size) {
            const userIdList = Array.from(userInfos.keys());
            for (let i = 0; i < userIdList.length; i++) {
                const userId = userIdList[i];
                const userInfo = userInfos.get(userId);
                if (!userInfo)
                    continue;
                
                let userAccountWrapperClass = styles.userAccountWrapper;
                if (isEmpty(userInfo.userId) || isEmpty(userInfo.nickName) || isEmpty(userInfo.refreshToken))
                    userAccountWrapperClass += ` ${styles.expired}`;

                list.push(
                    <div key={i} className={userAccountWrapperClass} onClick={(e) => changeUser(userInfo)}>
                        <div className={styles.userProfileWrapper}>
                            <img className={styles.userProfileImage} src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${userInfo.userId}?${(new Date()).getTime()}`} alt={userInfo.nickName} />
                        </div>
                        <div className={styles.userInfoWrapper}>
                            <div className={styles.nickName}>{userInfo.nickName}</div>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <button className={styles.button} onClick={(e) => removeUser(userId)} title="계정정보 삭제"><Image src={RemoveIcon} alt="계정정보 삭제" fill={true} priority={true} /></button>
                        </div>
                    </div>
                );
            }
        }

        return list;
    }, [appConfigs, userInfos, changeUser, removeUser]);

    const dialog = useCallback(() => {
        return (
            <LayoutCenterDialog
                type={Defines.CenterDialogType.CHANGE_USER}
                size={Defines.CenterDialogSize.MEDIUM}
                buttons={
                    <button className={`${styles.button} ${stylesCommon.button}`} onClick={hideDialog} title="취소">취소</button>
                }>
                <div className={styles.chatChangeUserWrapper}>
                    <div className={styles.userList}>
                        {userList()}
                    </div>
                </div>
            </LayoutCenterDialog>
        );
    }, [hideDialog, userList]);

    return dialog();
}