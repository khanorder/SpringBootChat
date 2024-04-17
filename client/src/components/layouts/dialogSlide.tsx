import {ReactNode, useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Defines} from "@/defines";
import styles from "@/styles/chatDialogSlide.module.sass";
import Image from "next/image";
import CloseIcon from "public/images/close.svg";
import stylesCommon from "@/styles/common.module.sass";
import {setIsActiveChatRoomInfo, setIsActiveNotification, setIsActiveProfile} from "@/stores/reducers/ui";

export interface LayoutDialogSlideProps {
    type: Defines.SlideDialogType;
    children: ReactNode;
}

export default function LayoutDialogSlide({ type, children }: LayoutDialogSlideProps) {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const hideDialog = useCallback(() => {
        switch (type) {
            case Defines.SlideDialogType.PROFILE:
                dispatch(setIsActiveProfile(false));
                break;

            case Defines.SlideDialogType.NOTIFICATION:
                dispatch(setIsActiveNotification(false));
                break;

            case Defines.SlideDialogType.CHAT_ROOM_INFO:
                dispatch(setIsActiveChatRoomInfo(false));
                break;
        }

    }, [type, dispatch]);

    const dialogLayout = useCallback(() => {
        let title = "";
        let dialogWrapperClass = `${styles.dialogWrapper}`;
        switch (type) {
            case Defines.SlideDialogType.PROFILE:
                title = "프로필";
                if (ui.isActiveProfile)
                    dialogWrapperClass += ` ${styles.active}`;
                break;

            case Defines.SlideDialogType.NOTIFICATION:
                title = "알림";
                if (ui.isActiveNotification)
                    dialogWrapperClass += ` ${styles.active}`;
                break;

            case Defines.SlideDialogType.CHAT_ROOM_INFO:
                title = "채팅방 정보";
                if (ui.isActiveChatRoomInfo)
                    dialogWrapperClass += ` ${styles.active}`;
                break;
        }

        if (!appConfigs.isProd)
            dialogWrapperClass += ` ${styles.dev}`;

        return (
            <div className={dialogWrapperClass}>
                <div className={styles.dialog}>
                    <div className={styles.dialogHeader}>
                        <div className={styles.dialogTitle}>{title}</div>
                        <div className={styles.rightButtons}>
                            <button className={styles.closeButton} onClick={hideDialog} title='닫기'>
                                <Image className={styles.closeButtonIcon} src={CloseIcon} alt='닫기' fill={true} priority={true}/>
                            </button>
                        </div>
                    </div>
                    <div className={styles.dialogContent}>
                        {children}
                    </div>
                    <div className={styles.dialogButtons}>
                        <button className={`${styles.dialogButton} ${stylesCommon.button}`} onClick={hideDialog} title="닫기">닫기</button>
                    </div>
                </div>
                <div className={styles.dialogPane} onClick={hideDialog}></div>
            </div>
        );
    }, [type, children, hideDialog, appConfigs, ui]);

    return dialogLayout();
}