import {Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import styles from "@/styles/chatImageInputDialog.module.sass";
import Picture from "public/images/Picture_icon_BLACK.svg";
import isEmpty from "lodash/isEmpty";
import {v4 as uuid} from "uuid";
import {Helpers} from "@/helpers";
import {ChatAPI} from "@/apis/chatAPI";
import {sendMessageReq} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
import {setIsActiveChatImageInput} from "@/stores/reducers/dialog";

export interface ChatImageInputDialogProps {
    roomId: string;
    chatImageInputRef: RefObject<HTMLInputElement>;
    setChatSmallImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    setChatLargeImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    chatSmallImage: string|ArrayBuffer|null;
    chatLargeImage: string|ArrayBuffer|null;
}

export default function ChatImageInputDialog({roomId, chatImageInputRef, chatSmallImage, chatLargeImage, setChatSmallImage, setChatLargeImage }: ChatImageInputDialogProps) {
    const firstRender = useRef(true);
    const webSocket = useAppSelector(state => state.webSocket);
    const user = useAppSelector(state => state.user);
    const dialogState = useAppSelector(state => state.dialog);
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
            if (dialogState.isActiveChatImageInput) {
                setDialogWrapperClass(`${styles.dialogWrapper} ${styles.active}`);
            } else {
                setDialogWrapperClass(`${styles.dialogWrapper}`);
            }
        }

    }, [firstRender, dialogState, setDialogWrapperClass]);

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveChatImageInput(false));
        setChatSmallImage('');
        setChatLargeImage('');
        if (chatImageInputRef.current)
            chatImageInputRef.current.value = '';
    }, [dispatch, setChatSmallImage, setChatLargeImage, chatImageInputRef]);

    const onSendImage = useCallback(async () => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(user.id)) {
            alert('채팅방에 입장해 주세요.');
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해 주세요.');
        } else if (isEmpty(chatSmallImage) || isEmpty(chatLargeImage)) {
            alert('이미지를 선택해 주세요.');
            hideDialog();
        } else if (!chatImageInputRef.current || !chatImageInputRef.current.files || 1 > chatImageInputRef.current.files.length) {
            alert(`전송할 이미지를 선택해주세요.`);
        } else if (10485760 < chatImageInputRef.current.files[0].size) {
            alert(`파일크기 10MB 이하의 이미지만 전송 가능합니다.`);
        } else {
            const chatId = uuid();
            const roomUUID = Helpers.getUUIDFromBase62(roomId?.toString() ?? '');
            await ChatAPI.UploadChatImageAsync({ chatId: chatId, roomId: roomUUID, userId: user.id, largeData: 'string' == typeof chatLargeImage ? chatLargeImage : '', smallData: 'string' == typeof chatSmallImage ? chatSmallImage : '' });
            dispatch(sendMessageReq({ id: chatId, type: Defines.ChatType.IMAGE, roomId: roomUUID, message: '' }));
            hideDialog();
        }
    }, [webSocket, user, chatSmallImage, chatLargeImage, chatImageInputRef, roomId, hideDialog, dispatch]);

    const dialog = useCallback(() =>  {
        return (
            <div className={dialogWrapperClass}>
                <div className={styles.dialog}>
                    <div className={styles.dialogContent}>
                        {
                            chatLargeImage
                                ?
                                <img className={styles.chatImageThumb} src={'string' == typeof chatLargeImage ? chatLargeImage : Picture} alt='업로드 이미지' />
                                :
                                <></>
                        }
                    </div>
                    <div className={styles.dialogButtons}>
                        <button className={styles.dialogButton} onClick={onSendImage}>전송</button>
                        <button className={styles.dialogButton} onClick={hideDialog}>취소</button>
                    </div>
                </div>
                <div className={styles.dialogPane} onClick={hideDialog}></div>
            </div>
        );
    }, [dialogWrapperClass, chatLargeImage, hideDialog, onSendImage]);

    return dialog();
}