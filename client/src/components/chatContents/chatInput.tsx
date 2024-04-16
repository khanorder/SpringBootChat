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
import {setIsActiveChatImageInput} from "@/stores/reducers/ui";
import dynamic from "next/dynamic";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });


export interface ChatInputProps {
    chatImageInputRef: RefObject<HTMLInputElement>;
    chatMessageInputRef: RefObject<HTMLTextAreaElement>;
    message: string;
    setMessage: Dispatch<SetStateAction<string>>;
    setChatSmallImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    setChatLargeImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
}

export default function ChatInput ({message, setMessage, chatImageInputRef, chatMessageInputRef, setChatSmallImage, setChatLargeImage}: ChatInputProps) {
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
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해 주세요.');
            return;
        } else if (!chat || isEmpty(chat.currentChatRoomId)) {
            alert('채팅방에 입장해 주세요.');
            return;
        } else if (isEmpty(message.trim())) {
            alert('메세지를 입력해 주세요.');
            setMessage(message.trim())
            return;
        } else if (300 < message.trim().length) {
            alert(`채팅내용은 300글자 이내로 입력해주세요.`);
            return;
        }
        dispatch(sendMessageReq({id: uuid(), type: Defines.ChatType.TALK, roomId: chat.currentChatRoomId, message: message}));
        setMessage('');
    }, [chat, webSocket, user, message, setMessage, dispatch]);

    const changeMessage = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(prev => {
            if (300 < e.target.value.toString().trim().length) {
                alert(`채팅내용은 300글자 이내로 입력해주세요.`);
                return prev.substring(0, 300);
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
        setEmojiPickerState(prev => { return !prev; });
    }, [setEmojiPickerState]);

    const addEmoji = useCallback((emoji: string) => {
        setMessage(prev => prev + emoji);
        //setEmojiPickerState(false);
    }, [setMessage]);

    const onChangeChatImageFile = useCallback(async () => {
        if (chatImageInputRef.current?.files && 0 < chatImageInputRef.current?.files.length) {
            const file = chatImageInputRef.current?.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    if (!e?.target?.result)
                        return;

                    const origDataURL = 'string' == typeof reader.result ? reader.result : '';
                    const smallDataURL = await Helpers.getDataURLResizeImage(origDataURL, 256, 256, file.type);
                    const largeDataURL = await Helpers.getDataURLResizeImage(origDataURL, 1024, 1024, file.type);
                    setChatSmallImage(smallDataURL);
                    setChatLargeImage(largeDataURL);
                }
                reader.readAsDataURL(file);
            }
            dispatch(setIsActiveChatImageInput(true));
        }
    }, [chatImageInputRef, setChatSmallImage, setChatLargeImage, dispatch]);
    
    const inputContents = useCallback(() => {
        return (
            <div className={`${styles.chatMessageInputArea}${appConfigs.isProd ? '' : ` ${styles.dev}`}`}>
                <div className={styles.chatMessageInputTopWrapper}>
                    <div className={styles.chatMessageLength}>{message.length}/300</div>
                    <div className={styles.chatImageButtonWrapper}>
                        <label className={`${styles.chatImageButton} ${stylesCommon.button}`} htmlFor='chatImageInput' title='이미지 전송'>
                            <Image src={Picture} alt={'이미지 전송'} width={20} height={20}/>
                        </label>
                        <input ref={chatImageInputRef} onChange={onChangeChatImageFile}
                               className={styles.chatImageInput} id='chatImageInput' type='file' accept='image/*'/>
                    </div>
                    <div className={styles.emojiWrapper}>
                        <button className={`${styles.emojiToggleButton} ${stylesCommon.button}` + (emojiPickerState ? ' ' + styles.active : '')} onClick={toggleEmojiPicker}>😊</button>
                        <EmojiPicker
                            className={styles.emojiPicker}
                            open={emojiPickerState}
                            width={320}
                            height={300}
                            onEmojiClick={(emoji, event) => addEmoji(emoji.emoji)}
                        />
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