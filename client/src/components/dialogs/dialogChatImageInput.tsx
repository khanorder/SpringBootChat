import {Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import styles from "@/styles/chatDialogImageInput.module.sass";
import Picture from "public/images/picture.svg";
import isEmpty from "lodash/isEmpty";
import {v4 as uuid} from "uuid";
import {ChatAPI} from "@/apis/chatAPI";
import {sendMessageReq} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
import {setIsActiveChatImageInput} from "@/stores/reducers/ui";

export interface DialogChatImageInputProps {
    chatImageInputRef: RefObject<HTMLInputElement>;
    setChatSmallImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    setChatLargeImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    chatSmallImage: string|ArrayBuffer|null;
    chatLargeImage: string|ArrayBuffer|null;
}

export default function DialogChatImageInput({chatImageInputRef, chatSmallImage, chatLargeImage, setChatSmallImage, setChatLargeImage }: DialogChatImageInputProps) {
    const firstRender = useRef(true);
    const webSocket = useAppSelector(state => state.webSocket);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const ui = useAppSelector(state => state.ui);
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
            if (ui.isActiveChatImageInput) {
                setDialogWrapperClass(`${styles.dialogWrapper} ${styles.active}`);
            } else {
                setDialogWrapperClass(`${styles.dialogWrapper}`);
            }
        }

    }, [firstRender, ui, setDialogWrapperClass]);

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
            return;
        } else if (isEmpty(user.id)) {
            alert('로그인 후 이용해 주세요.');
            return;
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해 주세요.');
            return;
        } else if (!chat || isEmpty(chat.currentChatRoomId)) {
            alert('채팅방에 입장해 주세요.');
            return;
        } else if (isEmpty(chatSmallImage) || isEmpty(chatLargeImage)) {
            alert('이미지를 선택해 주세요.');
            hideDialog();
            return;
        } else if (!chatImageInputRef.current || !chatImageInputRef.current.files || 1 > chatImageInputRef.current.files.length) {
            alert(`전송할 이미지를 선택해주세요.`);
            return;
        } else if (10485760 < chatImageInputRef.current.files[0].size) {
            alert(`파일크기 10MB 이하의 이미지만 전송 가능합니다.`);
            return;
        }

        const chatId = uuid();
        await ChatAPI.UploadChatImageAsync({ chatId: chatId, roomId: chat.currentChatRoomId, userId: user.id, largeData: 'string' == typeof chatLargeImage ? chatLargeImage : '', smallData: 'string' == typeof chatSmallImage ? chatSmallImage : '' });
        dispatch(sendMessageReq({ id: chatId, type: Defines.ChatType.IMAGE, roomId: chat.currentChatRoomId, message: '' }));
        hideDialog();
    }, [chat, webSocket, user, chatSmallImage, chatLargeImage, chatImageInputRef, hideDialog, dispatch]);

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