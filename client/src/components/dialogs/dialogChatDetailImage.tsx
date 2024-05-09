import {useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/chatDialogImageDetail.module.sass";
import Picture from "public/images/picture.svg";
import Image from "next/image";
import CloseIcon from "public/images/close-circle.svg";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveChatImageDetail, setChatDetailImageId} from "@/stores/reducers/ui";
import {Domains} from "@/domains";
import chatImageUrlPrefix = Domains.chatImageUrlPrefix;

export default function DialogChatDetailImage () {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
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
        dispatch(setChatDetailImageId(''));
    }, [dispatch]);

    const dialog = useCallback(() => {
        return (
            <div className={dialogWrapperClass}>
                <div className={styles.dialogPane} onClick={hideDialog}></div>
                <div className={styles.dialog}>
                    <div className={styles.dialogContent}>
                        <div className={styles.chatImageDetailEmpty} onClick={hideDialog}>&nbsp;</div>
                        {
                            ui.chatDetailImageId
                                ?
                                <img className={styles.chatImageDetail}
                                     src={(ui.chatDetailImageId ? `${appConfigs.serverProtocol}://${appConfigs.serverHost}${chatImageUrlPrefix}${ui.chatDetailImageId}` : Picture)}
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
    }, [appConfigs, ui, dialogWrapperClass, hideDialog]);

    return dialog();
}