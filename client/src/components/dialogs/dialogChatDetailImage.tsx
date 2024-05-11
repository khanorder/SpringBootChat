import {useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/chatDialogImageDetail.module.sass";
import Picture from "public/images/picture.svg";
import Image from "next/image";
import CloseIcon from "public/images/close.svg";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveChatImageDetail, setChatDetailImageId} from "@/stores/reducers/ui";
import {Domains} from "@/domains";
import chatImageUrlPrefix = Domains.chatImageUrlPrefix;
import stylesCommon from "@/styles/common.module.sass";
import {ChatAPI} from "@/apis/chatAPI";
import {Errors} from "@/defines/errors";
import download from "downloadjs";
import { v4 as uuid } from "uuid";
import isEmpty from "lodash/isEmpty";

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

    const onDownload = useCallback(async () => {
        const response = await ChatAPI.DownloadChatImageAsync({ chatId: ui.chatDetailImageId });
        switch (response.result) {
            case Errors.DownloadChatImage.NONE:
                if (isEmpty(response.fileBase64) || isEmpty(response.mime)) {
                    alert("원본 데이터가 없습니다.");
                    return;
                }

                let fileName = response.fileName ?? ``;

                if (isEmpty(fileName)) {
                    fileName = uuid();
                    switch (response.mime) {
                        case "image/png":
                            fileName += ".png";
                            break;

                        case "image/jpeg":
                            fileName += ".jpg";
                            break;

                        case "image/gif":
                            fileName += ".gif";
                            break;

                        case "image/bmp":
                            fileName += ".bmp";
                            break;

                        case "image/svg+xml":
                            fileName += ".svg";
                            break;

                        default:
                            fileName += ".jpg";
                    }
                }

                download(Uint8Array.from(Buffer.from(response.fileBase64, "base64")), fileName, response.mime);
                break;

            default:
                alert(`원본 다운로드 실패!`);
                break;
        }
    }, [ui]);

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveChatImageDetail(false));
        dispatch(setChatDetailImageId(''));
    }, [dispatch]);

    const dialog = useCallback(() => {
        return (
            <div className={dialogWrapperClass}>
                <div className={styles.dialog}>
                    <div className={styles.dialogContent}>
                        <div className={styles.closeButtonWrapper}>
                            <button className={styles.closeButton} onClick={hideDialog} title='닫기'>
                                <Image className={styles.closeButtonIcon} src={CloseIcon} alt='닫기' fill={true} priority={true}/>
                            </button>
                        </div>
                        <div className={styles.chatImageDetailWrapper}>

                            {
                                ui.chatDetailImageId
                                    ?
                                    <img className={styles.chatImageDetail}
                                         src={(ui.chatDetailImageId ? `${appConfigs.serverProtocol}://${appConfigs.serverHost}${chatImageUrlPrefix}${ui.chatDetailImageId}` : Picture)}
                                         alt='상세 이미지'/>
                                    :
                                    <></>
                            }

                        </div>
                        <div className={styles.dialogButtons}>
                            <button className={`${styles.button} ${stylesCommon.button} ${stylesCommon.primaryButton}`}
                                    onClick={onDownload} title="원본">원본
                            </button>
                            <button className={`${styles.button} ${stylesCommon.button}`} onClick={hideDialog}
                                    title="닫기">닫기
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.dialogPane} onClick={hideDialog}></div>
            </div>
        );
    }, [appConfigs, ui, dialogWrapperClass, onDownload, hideDialog]);

    return dialog();
}