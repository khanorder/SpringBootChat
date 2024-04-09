import {Dispatch, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/chatImageDetailDialog.module.sass";
import Picture from "../../../public/images/picture.svg";
import Image from "next/image";
import CloseIcon from "../../../public/images/close-circle.svg";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveChatImageDetail} from "@/stores/reducers/ui";

export interface ChatImageDetailDialogProps {
    serverHost: string;
    chatDetailImageId: string;
    setChatDetailImageId: Dispatch<SetStateAction<string>>;
}

export default function ChatImageDetailDialog ({ serverHost, chatDetailImageId, setChatDetailImageId }: ChatImageDetailDialogProps) {
    const firstRender = useRef(true);
    const ui = useAppSelector(state => state.ui);
    const dispatch = useAppDispatch();
    const [dialogWrapperClass, setDialogWrapperClass] = useState<string>(styles.dialogWrapper);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    useEffect(() => {
        if (!firstRender.current) {
            if (ui.isActiveChatImageDetail) {
                setDialogWrapperClass(`${styles.dialogWrapper} ${styles.active}`);
            } else {
                setDialogWrapperClass(styles.dialogWrapper);
            }
        }

    }, [ui, dispatch, setDialogWrapperClass]);

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveChatImageDetail(false));
        setChatDetailImageId('');
    }, [setChatDetailImageId, dispatch]);

    const dialog = useCallback(() => {
        return (
            <div className={dialogWrapperClass}>
                <div className={styles.dialogPane} onClick={hideDialog}></div>
                <div className={styles.dialog}>
                    <div className={styles.dialogContent}>
                        <div className={styles.chatImageDetailEmpty} onClick={hideDialog}>&nbsp;</div>
                        {
                            chatDetailImageId
                                ?
                                <img className={styles.chatImageDetail}
                                     src={(chatDetailImageId ? `${serverHost}/api/chatImage/${chatDetailImageId}` : Picture)}
                                     alt='상세 이미지'/>
                                :
                                <></>
                        }
                        <div className={styles.chatImageDetailEmpty} onClick={hideDialog}>&nbsp;</div>
                    </div>
                    <div className={styles.dialogButtons}>
                        <button className={styles.dialogButton} onClick={hideDialog}>
                            <Image className={styles.dialogButtonCloseIcon} src={CloseIcon} alt='닫기'
                                   fill={true} priority={true}/></button>
                    </div>
                </div>
                <div className={styles.dialogPane} onClick={hideDialog}></div>
            </div>
        );
    }, [chatDetailImageId, dialogWrapperClass, hideDialog, serverHost]);

    return dialog();
}