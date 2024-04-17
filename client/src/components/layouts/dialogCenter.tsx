import {ReactNode, useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Defines} from "@/defines";
import styles from "@/styles/chatDialogCenter.module.sass";
import Image from "next/image";
import CloseIcon from "public/images/close.svg";
import stylesCommon from "@/styles/common.module.sass";
import {
    setIsActiveAddUser,
    setIsActiveChatImageInput,
    setIsActiveCreateChatRoom,
    setIsActiveProfileImageInput
} from "@/stores/reducers/ui";

export interface LayoutDialogCenterProps {
    type: Defines.CenterDialogType;
    size?: Defines.CenterDialogSize;
    children: ReactNode;
    buttons: ReactNode;
}

export default function LayoutDialogSlide({ type, size, children, buttons }: LayoutDialogCenterProps) {
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
            case Defines.CenterDialogType.CREATE_CHAT_ROOM:
                dispatch(setIsActiveCreateChatRoom(false));
                break;

            case Defines.CenterDialogType.PROFILE_IMAGE_INPUT:
                dispatch(setIsActiveProfileImageInput(false));
                break;

            case Defines.CenterDialogType.CHAT_IMAGE_INPUT:
                dispatch(setIsActiveChatImageInput(false));
                break;

            case Defines.CenterDialogType.ADD_USER_CHAT_ROOM:
                dispatch(setIsActiveAddUser(false));
                break;
        }

    }, [type, dispatch]);

    const dialogLayout = useCallback(() => {
        let title = "";
        let dialogWrapperClass = `${styles.dialogWrapper}`;
        switch (type) {
            case Defines.CenterDialogType.CREATE_CHAT_ROOM:
                title = "채팅방 생성";
                if (ui.isActiveCreateChatRoom)
                    dialogWrapperClass += ` ${styles.active}`;
                break;

            case Defines.CenterDialogType.PROFILE_IMAGE_INPUT:
                title = "프로필 이미지 변경";
                if (ui.isActiveProfileImageInput)
                    dialogWrapperClass += ` ${styles.active}`;
                break;

            case Defines.CenterDialogType.CHAT_IMAGE_INPUT:
                title = "이미지 전송";
                if (ui.isActiveChatImageInput)
                    dialogWrapperClass += ` ${styles.active}`;
                break;

            case Defines.CenterDialogType.ADD_USER_CHAT_ROOM:
                title = "사용자 초대";
                if (ui.isActiveAddUser)
                    dialogWrapperClass += ` ${styles.active}`;
                break;
        }

        if ("undefined" !== typeof size) {
            switch (size) {
                case Defines.CenterDialogSize.SMALL:
                    dialogWrapperClass += ` ${styles.small}`;
                    break;

                case Defines.CenterDialogSize.MEDIUM:
                    dialogWrapperClass += ` ${styles.medium}`;
                    break;

                case Defines.CenterDialogSize.LARGE:
                    dialogWrapperClass += ` ${styles.large}`;
                    break;
            }
        }

        if (!appConfigs.isProd) {
            // title = "";
            dialogWrapperClass += ` ${styles.dev}`;
        }

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
                        {buttons}
                    </div>
                </div>
                <div className={styles.dialogPane} onClick={hideDialog}></div>
            </div>
        );
    }, [type, size, appConfigs, hideDialog, children, buttons, ui]);

    return dialogLayout();
}