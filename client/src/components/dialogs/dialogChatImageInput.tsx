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
import {Helpers} from "@/helpers";
import stylesCommon from "@/styles/common.module.sass";
import dynamic from "next/dynamic";
const LayoutCenterDialog = dynamic(() => import("@/components/layouts/dialogCenter"), { ssr: false });

export interface DialogChatImageInputProps {
    chatImageInputRef: RefObject<HTMLInputElement>;
    setChatImageMime: Dispatch<SetStateAction<Defines.AllowedImageType>>;
    setChatSmallImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    setChatLargeImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    chatImageMime: Defines.AllowedImageType;
    chatSmallImage: string|ArrayBuffer|null;
    chatLargeImage: string|ArrayBuffer|null;
}

export default function DialogChatImageInput({chatImageInputRef, chatImageMime, chatSmallImage, chatLargeImage, setChatImageMime, setChatSmallImage, setChatLargeImage }: DialogChatImageInputProps) {
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
        setChatImageMime(Defines.AllowedImageType.NONE);
        setChatSmallImage('');
        setChatLargeImage('');
        if (chatImageInputRef.current)
            chatImageInputRef.current.value = '';
    }, [dispatch, setChatImageMime, setChatSmallImage, setChatLargeImage, chatImageInputRef]);

    const onSendImage = useCallback(async () => {
        if (!webSocket.socket) {
            alert('연결 안됨');
            return;
        } else if (isEmpty(user.id)) {
            alert('로그인 후 이용해 주세요.');
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

        let base64Large = "";
        let base64Small = "";
        switch (chatImageMime) {
            case Defines.AllowedImageType.SVG:
                base64Large = Helpers.encodeBase64(new Uint8Array(await chatImageInputRef.current.files[0].arrayBuffer()));
                break;

            default:
                base64Large = await Helpers.getDataURItoBase64((chatLargeImage ? (chatLargeImage as string) : ""));
                base64Small = await Helpers.getDataURItoBase64((chatSmallImage ? (chatSmallImage as string) : ""));
        }

        const chatId = uuid();
        const result = await ChatAPI.UploadChatImageAsync({ chatId: chatId, roomId: chat.currentChatRoomId, mime: chatImageMime, base64Large: base64Large, base64Small: base64Small });
        if (result) {
            dispatch(sendMessageReq({ id: chatId, type: Defines.ChatType.IMAGE, roomId: chat.currentChatRoomId, message: '' }));
        } else {
            alert("이미지 전송 실패.");
        }
        hideDialog();
    }, [chat, webSocket, user, chatImageMime, chatSmallImage, chatLargeImage, chatImageInputRef, hideDialog, dispatch]);

    const dialog = useCallback(() =>  {
        return (
            <LayoutCenterDialog
                type={Defines.CenterDialogType.CHAT_IMAGE_INPUT}
                size={Defines.CenterDialogSize.MEDIUM}
                buttons={
                    <>
                        <button className={`${styles.button} ${stylesCommon.button} ${stylesCommon.primaryButton}`} onClick={onSendImage} title="전송">전송</button>
                        <button className={`${styles.button} ${stylesCommon.button}`} onClick={hideDialog} title="취소">취소</button>
                    </>
                }>
                <div className={styles.chatImageInputWrapper}>
                    <div className={styles.inputForm}>
                        {
                            chatLargeImage
                                ?
                                <img className={styles.chatImageThumb} src={'string' == typeof chatLargeImage ? chatLargeImage : Picture} alt='업로드 이미지' />
                                :
                                <></>
                        }
                    </div>
                </div>
            </LayoutCenterDialog>
        );
    }, [chatLargeImage, hideDialog, onSendImage]);

    return dialog();
}