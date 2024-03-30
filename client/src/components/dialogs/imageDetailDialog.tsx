import {Dispatch, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/chat.module.sass";
import Picture from "public/images/Picture_icon_BLACK.svg";
import Image from "next/image";
import CloseIcon from "public/images/close-circle-svgrepo-com.svg";

export interface ChatImageDetailDialogProps {
    serverHost: string;
    chatDetailImageId: string;
    setChatDetailImageId: Dispatch<SetStateAction<string>>;
}

export default function ChatImageDetailDialog ({ serverHost, chatDetailImageId, setChatDetailImageId }: ChatImageDetailDialogProps) {
    const firstRender = useRef(true);
    const [chatImageDetailDialogWrapperClass, setChatImageDetailDialogWrapperClass] = useState<string>(styles.chatImageDetailDialogWrapper);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    useEffect(() => {
        if (chatDetailImageId) {
            setChatImageDetailDialogWrapperClass(`${styles.chatImageDetailDialogWrapper} ${styles.active}`);
        } else {
            setChatImageDetailDialogWrapperClass(styles.chatImageDetailDialogWrapper);
        }
    }, [chatDetailImageId, setChatImageDetailDialogWrapperClass]);

    const hideChatImageDetailDialog = useCallback(() => {
        setChatImageDetailDialogWrapperClass(styles.chatImageDetailDialogWrapper);
        setChatDetailImageId('');
    }, [setChatDetailImageId, setChatImageDetailDialogWrapperClass]);

    return (
        <div className={chatImageDetailDialogWrapperClass}>
            <div className={styles.chatImageDetailDialogPane} onClick={hideChatImageDetailDialog}></div>
            <div className={styles.chatImageDetailDialog}>
                <div className={styles.chatImageDetailDialogContent}>
                    <div className={styles.chatImageDetailEmpty} onClick={hideChatImageDetailDialog}>&nbsp;</div>
                    {
                        chatDetailImageId
                            ?
                            <img className={styles.chatImageDetail}
                                 src={(chatDetailImageId ? `${serverHost}/api/chatImage/${chatDetailImageId}` : Picture)}
                                 alt='상세 이미지'/>
                            :
                            <></>
                    }
                    <div className={styles.chatImageDetailEmpty} onClick={hideChatImageDetailDialog}>&nbsp;</div>
                </div>
                <div className={styles.chatImageDetailDialogButtons}>
                    <button className={styles.chatImageDetailDialogButton} onClick={hideChatImageDetailDialog}>
                        <Image className={styles.chatImageDetailDialogButtonCloseIcon} src={CloseIcon} alt='닫기'
                               fill={true} priority={true}/></button>
                </div>
            </div>
            <div className={styles.chatImageDetailDialogPane} onClick={hideChatImageDetailDialog}></div>
        </div>
    );
}