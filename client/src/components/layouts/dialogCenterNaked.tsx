import {ReactNode, useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Defines} from "@/defines";
import styles from "@/styles/chatDialogCenterNaked.module.sass";
import Image from "next/image";
import CloseIcon from "public/images/close.svg";
import stylesCommon from "@/styles/common.module.sass";
import {
    setIsActiveAddUser, setIsActiveChangeUser,
    setIsActiveChatImageInput,
    setIsActiveCreateChatRoom, setIsActiveImojiInput,
    setIsActiveProfileImageInput, setIsActiveSignIn, setIsActiveSignUp
} from "@/stores/reducers/ui";

export interface LayoutDialogCenterProps {
    type: Defines.CenterDialogType;
    size?: Defines.CenterDialogSize;
    children: ReactNode;
    buttons?: ReactNode;
}

export default function LayoutDialogCenterNaked({ type, size, children, buttons }: LayoutDialogCenterProps) {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const user = useAppSelector(state => state.user);
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

            case Defines.CenterDialogType.CHANGE_USER:
                dispatch(setIsActiveChangeUser(false));
                break;

            case Defines.CenterDialogType.SIGN_UP:
                dispatch(setIsActiveSignUp(false));
                break;

            case Defines.CenterDialogType.SIGN_IN:
                dispatch(setIsActiveSignIn(false));
                break;

            case Defines.CenterDialogType.IMOJI_INPUT:
                dispatch(setIsActiveImojiInput(false));
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

            case Defines.CenterDialogType.CHANGE_USER:
                title = "계정변경";
                if (ui.isActiveChangeUser)
                    dialogWrapperClass += ` ${styles.active}`;
                break;

            case Defines.CenterDialogType.SIGN_UP:
                title = "계정생성";
                if (Defines.AuthStateType.SIGN_IN === user.authState)
                    title = "계정등록";

                if (ui.isActiveSignUp)
                    dialogWrapperClass += ` ${styles.active}`;
                break;

            case Defines.CenterDialogType.SIGN_IN:
                title = "로그인";
                if (ui.isActiveSignIn)
                    dialogWrapperClass += ` ${styles.active}`;
                break;

            case Defines.CenterDialogType.IMOJI_INPUT:
                title = "이모지 입력";
                if (ui.isActiveImojiInput)
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

        return (
            <div className={dialogWrapperClass}>
                <div className={styles.dialog}>
                    <div className={styles.dialogContent}>
                        <div className={styles.closeButtonWrapper}>
                            <button className={styles.closeButton} onClick={hideDialog} title='닫기'>
                                <Image className={styles.closeButtonIcon} src={CloseIcon} alt='닫기' fill={true} priority={true}/>
                            </button>
                        </div>
                        {children}
                        {
                            "undefined" === typeof buttons
                                ?
                                <></>
                                :
                                <div className={styles.dialogButtons}>
                                    {buttons}
                                </div>
                        }
                    </div>
                </div>
                <div className={styles.dialogPane} onClick={hideDialog}></div>
            </div>
        );
    }, [type, size, hideDialog, children, ui, user, buttons]);

    return dialogLayout();
}