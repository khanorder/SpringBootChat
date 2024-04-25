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
import {setUserId} from "@/stores/reducers/user";
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
        if (isEmpty(userInfo.userId) || isEmpty(userInfo.userName) || isEmpty(userInfo.refreshToken)) {
            alert("만료된 계정입니다.");
            return;
        }

        dispatch(setUserId(userInfo.userId));
        hideDialog();
    }, [dispatch, hideDialog]);

    const userList = useCallback(() => {
        const list: ReactElement[] = [];
        if (0 < userInfos.size) {
            const userInfoList = Array.from(userInfos.values());
            for (let i = 0; i < userInfoList.length; i++) {
                const userInfo = userInfoList[i];
                let userAccountWrapperClass = styles.userAccountWrapper;
                if (isEmpty(userInfo.userId) || isEmpty(userInfo.userName) || isEmpty(userInfo.refreshToken))
                    userAccountWrapperClass += ` ${styles.expired}`;

                list.push(
                    <div key={i} className={userAccountWrapperClass} onClick={(e) => changeUser(userInfo)}>
                        <div className={styles.userProfileWrapper}>
                            <img className={styles.userProfileImage} src={userInfo.profileImageUrl} alt={userInfo.userName} />
                        </div>
                        <div className={styles.userInfoWrapper}>
                            <div className={styles.userName}>{userInfo.userName}</div>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <button className={styles.button}><Image src={RemoveIcon} alt="삭제" fill={true} priority={true} /></button>
                        </div>
                    </div>
                );
            }
        }

        return list;
    }, [userInfos, changeUser]);

    const dialog = useCallback(() => {
        return (
            <LayoutCenterDialog
                type={Defines.CenterDialogType.CHANGE_USER}
                size={Defines.CenterDialogSize.SMALL}
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