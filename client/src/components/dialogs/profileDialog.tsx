import {useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/slideDialog.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import CloseIcon from "public/images/close.svg";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveNotification, setIsActiveProfile} from "@/stores/reducers/ui";
import Image from "next/image";
import dynamic from "next/dynamic";
const ChatEditProfile = dynamic(() => import("@/components/chatContents/chatEditProfile"), { ssr: false });

export default function ProfileDialog() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveProfile(false));
    }, [dispatch]);

    const dialog = useCallback(() => {
        let dialogWrapperClass = `${styles.dialogWrapper}`;
        if (ui.isActiveProfile)
            dialogWrapperClass += ` ${styles.active}`;
        
        if (!appConfigs.isProd)
            dialogWrapperClass += ` ${styles.dev}`;
        
        return (
            <div className={dialogWrapperClass}>
                <div className={styles.dialog}>
                    <div className={styles.dialogHeader}>
                        <div className={styles.dialogTitle}>프로필</div>
                        <div className={styles.rightButtons}>
                            <button className={styles.closeButton} onClick={hideDialog} title='닫기'>
                                <Image className={styles.closeButtonIcon} src={CloseIcon} alt='닫기' fill={true} priority={true} />
                            </button>
                        </div>
                    </div>
                    <div className={styles.dialogContent}>
                        <ChatEditProfile/>
                    </div>
                    <div className={styles.dialogButtons}>
                        <button className={`${styles.dialogButton} ${stylesCommon.button}`} onClick={hideDialog} title="확인">확인</button>
                    </div>
                </div>
                <div className={styles.dialogPane} onClick={hideDialog}></div>
            </div>
        );
    }, [ui, appConfigs, hideDialog]);

    return dialog();
}