import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/gnbDialog.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {createChatRoomReq} from "@/stores/reducers/webSocket";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveGNB} from "@/stores/reducers/dialog";
import ChatRoomUsers from "@/components/chatContents/chatRoomUsers";

export default function GNBDialog() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const dialogState = useAppSelector(state => state.dialog);
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
            if (dialogState.isActiveGNB) {
                setDialogWrapperClass(`${styles.dialogWrapper} ${styles.active}`);
            } else {
                setDialogWrapperClass(`${styles.dialogWrapper}`);
            }
        }

    }, [firstRender, dialogState, setDialogWrapperClass]);

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveGNB(false));
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