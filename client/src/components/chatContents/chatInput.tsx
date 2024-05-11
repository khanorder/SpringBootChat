import {ChangeEvent, Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/chatInput.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import Image from "next/image";
import Picture from "public/images/picture.svg";
import {Helpers} from "@/helpers";
import isEmpty from "lodash/isEmpty";
import {sendMessageReq} from "@/stores/reducers/webSocket";
import {v4 as uuid} from "uuid";
import {Defines} from "@/defines";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveChatImageInput, toggleIsActiveImojiInput} from "@/stores/reducers/ui";


export interface ChatInputProps {
    chatImageInputRef: RefObject<HTMLInputElement>;
    chatMessageInputRef: RefObject<HTMLTextAreaElement>;
    message: string;
    setMessage: Dispatch<SetStateAction<string>>;
    setChatImageMime: Dispatch<SetStateAction<Defines.AllowedImageType>>;
    setChatSmallImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    setChatLargeImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    setChatOriginalImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
}

export default function ChatInput ({message, setMessage, chatImageInputRef, chatMessageInputRef, setChatImageMime, setChatSmallImage, setChatLargeImage, setChatOriginalImage}: ChatInputProps) {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const webSocket = useAppSelector(state => state.webSocket);
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();
    const [emojiPickerState, setEmojiPickerState] = useState<boolean>(false);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const sendMessage = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
            return;
        } else if (isEmpty(user.id)) {
            alert('로그인 후 이용해 주세요.');
            return;
        } else if (!chat || isEmpty(chat.currentChatRoomId)) {
            alert('채팅방에 입장해 주세요.');
            return;
        } else if (isEmpty(message.trim())) {
            alert('메세지를 입력해 주세요.');
            setMessage(message.trim())
            return;
        } else if (65535 < message.trim().length) {
            alert(`채팅내용은 65535글자 이내로 입력해주세요.`);
            return;
        }
        dispatch(sendMessageReq({id: uuid(), type: Defines.ChatType.TALK, roomId: chat.currentChatRoomId, message: message}));
        setMessage('');
        chatMessageInputRef.current?.focus();
    }, [chat, webSocket, user, message, setMessage, chatMessageInputRef, dispatch]);

    const changeMessage = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(prev => {
            if (65535 < e.target.value.toString().trim().length) {
                alert(`채팅내용은 65535글자 이내로 입력해주세요.`);
                return prev.substring(0, 65535);
            }

            return e.target.value.toString() ?? '';
        });
    }, [setMessage]);

    const onKeyUpMessage = useCallback((e: any | KeyboardEvent) => {
        if (e.shiftKey && e.key == "Enter") {
            // 쉬프트 엔터 줄바꿈 허용
        } else if (e.key == 'Enter') {
            sendMessage();
        }
    }, [sendMessage]);

    const toggleEmojiPicker = useCallback(() => {
        dispatch(toggleIsActiveImojiInput());
    }, [dispatch]);

    const addEmoji = useCallback((emoji: string) => {
        setMessage(prev => prev + emoji);
        //setEmojiPickerState(false);
    }, [setMessage]);

    const onChangeChatImageFile = useCallback(async () => {
        if (chatImageInputRef.current?.files && 0 < chatImageInputRef.current?.files.length) {
            const file = chatImageInputRef.current?.files[0];
            if (file) {
                let mime: Defines.AllowedImageType;
                if ("image/png" === file.type.toLowerCase()) {
                    mime = Defines.AllowedImageType.PNG;
                } else if ("image/jpeg" === file.type.toLowerCase() || "image/jpg" === file.type.toLowerCase()) {
                    mime = Defines.AllowedImageType.JPG;
                } else if ("image/gif" === file.type.toLowerCase()) {
                    mime = Defines.AllowedImageType.GIF;
                } else if ("image/bmp" === file.type.toLowerCase()) {
                    mime = Defines.AllowedImageType.BMP;
                } else if (file.type.toLowerCase().startsWith("image/svg")) {
                    mime = Defines.AllowedImageType.SVG;
                } else {
                    mime = Defines.AllowedImageType.NONE;
                }

                if (0 < mime) {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        if (!e?.target?.result)
                            return;

                        const origDataURL = 'string' == typeof reader.result ? reader.result : '';
                        const smallDataURL = await Helpers.getDataURLResizeImage(origDataURL, 256, 256, file.type);
                        const largeDataURL = await Helpers.getDataURLResizeImage(origDataURL, 1024, 1024, file.type);
                        setChatOriginalImage(origDataURL);
                        setChatSmallImage(smallDataURL);
                        setChatLargeImage(largeDataURL);
                    }
                    reader.readAsDataURL(file);
                } else {
                    setChatSmallImage("");
                    setChatLargeImage("");
                    setChatOriginalImage("");
                }

                setChatImageMime(mime);
            }
            dispatch(setIsActiveChatImageInput(true));
        }
    }, [chatImageInputRef, setChatImageMime, setChatSmallImage, setChatLargeImage, setChatOriginalImage, dispatch]);
    
    const inputContents = useCallback(() => {
        return (
            <div className={styles.chatMessageInputArea}>
                <div className={styles.chatMessageInputTopWrapper}>
                    <div className={styles.chatMessageLength}>{message.length}/65535</div>
                    <div className={styles.chatImageButtonWrapper}>
                        <label className={`${styles.chatImageButton} ${stylesCommon.button}`} htmlFor='chatImageInput' title='이미지 전송'>
                            <Image src={Picture} alt={'이미지 전송'} width={20} height={20}/>
                        </label>
                        <input ref={chatImageInputRef} onChange={onChangeChatImageFile}
                               className={styles.chatImageInput} id='chatImageInput' type='file' accept='image/*'/>
                    </div>
                    <div className={styles.emojiWrapper}>
                        <button className={`${styles.emojiToggleButton} ${stylesCommon.button}` + (emojiPickerState ? ' ' + styles.active : '')} onClick={toggleEmojiPicker}>😊</button>
                    </div>
                </div>
                <div className={styles.chatMessageInputWrapper}>
                    <textarea ref={chatMessageInputRef}
                              value={message}
                              className={styles.chatMessageInput}
                              onKeyUp={e => onKeyUpMessage(e)}
                              onChange={e => changeMessage(e)}
                              placeholder={appConfigs.isProd ? '메세지를 입력해 주세요.' : ''}>
                        {message}
                    </textarea>
                    <button className={`${styles.chatSendButton} ${stylesCommon.button}`} onClick={sendMessage}>전송</button>
                </div>
            </div>
        );
    }, [appConfigs, addEmoji, changeMessage, chatImageInputRef, chatMessageInputRef, emojiPickerState, message, onChangeChatImageFile, onKeyUpMessage, sendMessage, toggleEmojiPicker]);

    return inputContents();
}