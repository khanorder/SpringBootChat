import {
    Dispatch,
    RefObject, SetStateAction,
    useCallback,
    useEffect,
    useRef
} from "react";
import styles from "@/styles/chatDialogImojiInput.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {Defines} from "@/defines";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveImojiInput} from "@/stores/reducers/ui";
import dynamic from "next/dynamic";
import isEmpty from "lodash/isEmpty";
import {sendMessageReq} from "@/stores/reducers/webSocket";
import {v4 as uuid} from "uuid";
const LayoutCenterNakedDialog = dynamic(() => import("@/components/layouts/dialogCenterNaked"), { ssr: false });
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export interface DialogImojiInputProps {
    chatMessageInputRef: RefObject<HTMLTextAreaElement>;
    message: string;
    setMessage: Dispatch<SetStateAction<string>>;
}

export default function DialogImojiInput({ chatMessageInputRef, message, setMessage }: DialogImojiInputProps) {
    const firstRender = useRef(true);
    const chat = useAppSelector(state => state.chat);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveImojiInput(false));
    }, [dispatch]);

    const addEmoji = useCallback((emoji: string) => {
        setMessage(prev => prev + emoji);
    }, [setMessage]);

    const inputForm = useCallback(() => {
        return (
            <div className={styles.inputForm}>
                <EmojiPicker
                    className={styles.emojiPicker}
                    open={ui.isActiveImojiInput}
                    width="100%"
                    autoFocusSearch={false}
                    onEmojiClick={(emoji, event) => addEmoji(emoji.emoji)}
                />
            </div>
        );
    }, [ui, addEmoji]);

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
        hideDialog();
    }, [chat, webSocket, user, message, setMessage, hideDialog, dispatch]);

    const dialog = useCallback(() => {
        return (
            <LayoutCenterNakedDialog
                type={Defines.CenterDialogType.IMOJI_INPUT}
                size={Defines.CenterDialogSize.SMALL}
                buttons={
                    <>
                        <button className={`${styles.button} ${stylesCommon.button} ${stylesCommon.primaryButton}`}
                                onClick={sendMessage} title="전송">전송
                        </button>
                        <button className={`${styles.button} ${stylesCommon.button}`} onClick={hideDialog}
                                title="닫기">닫기
                        </button>
                    </>
                }>
                <div className={styles.chatImojiInputWrapper}>
                    {inputForm()}
                </div>
            </LayoutCenterNakedDialog>
        );
    }, [hideDialog, inputForm, sendMessage]);

    return dialog();
}