import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/lnbDialog.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {createChatRoomReq} from "@/stores/reducers/webSocket";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveLNB} from "@/stores/reducers/ui";
import ChatRoomUsers from "@/components/chatContents/chatRoomUsers";

export default function LnbDialog() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const [dialogWrapperClass, setDialogWrapperClass] = useState<string>(styles.dialogWrapper)

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    useEffect(() => {
        if (!firstRender.current) {
            if (ui.isActiveLNB) {
                setDialogWrapperClass(`${styles.dialogWrapper} ${styles.active}`);
            } else {
                setDialogWrapperClass(`${styles.dialogWrapper}`);
            }
        }

    }, [firstRender, ui, setDialogWrapperClass]);

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveLNB(false));
    }, [dispatch]);

    const dialog = useCallback(() => {
        return (
            <div className={dialogWrapperClass}>
                <div className={styles.dialog}>
                    <div className={styles.dialogContent}>
                        {
                            isEmpty(chat.currentChatRoomId)
                                ?
                                    <></>
                                :
                                    <ChatRoomUsers />
                        }
                    </div>
                    <div className={styles.dialogButtons}>
                        <button className={`${styles.dialogButton} ${stylesCommon.button}`} onClick={hideDialog}>취소</button>
                    </div>
                </div>
                <div className={styles.dialogPane} onClick={hideDialog}></div>
            </div>
        );
    }, [chat, dialogWrapperClass, hideDialog]);

    return dialog();
}