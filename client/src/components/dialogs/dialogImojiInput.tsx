import {
    ChangeEvent,
    Dispatch,
    KeyboardEvent,
    ReactElement,
    RefObject, SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import styles from "@/styles/chatDialogImojiInput.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveImojiInput, setIsActiveSignIn} from "@/stores/reducers/ui";
import RemoveIcon from 'public/images/close.svg';
import dynamic from "next/dynamic";
import {Domains} from "@/domains";
import useUserInfos from "@/components/common/useUserInfos";
import Image from "next/image";
import {removeUserInfo, setUserId, setUserInfo, signIn} from "@/stores/reducers/user";
import {Helpers} from "@/helpers";
import {AuthAPI} from "@/apis/authAPI";
import {Errors} from "@/defines/errors";
import {checkAuthenticationReq, signInReq} from "@/stores/reducers/webSocket";
const LayoutCenterNakedDialog = dynamic(() => import("@/components/layouts/dialogCenterNaked"), { ssr: false });
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export interface DialogImojiInputProps {
    chatMessageInputRef: RefObject<HTMLTextAreaElement>;
    message: string;
    setMessage: Dispatch<SetStateAction<string>>;
}

export default function DialogImojiInput({ chatMessageInputRef, message, setMessage }: DialogImojiInputProps) {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const [userInfos] = useUserInfos();
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!firstRender.current && !ui.isActiveSignUp) {
            setUserName("");
            setPassword("");
        }

    }, [firstRender, ui, setUserName, setPassword]);

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

    const dialog = useCallback(() => {
        return (
            <LayoutCenterNakedDialog
                type={Defines.CenterDialogType.IMOJI_INPUT}
                size={Defines.CenterDialogSize.SMALL}>
                <div className={styles.chatImojiInputWrapper}>
                    {inputForm()}
                </div>
            </LayoutCenterNakedDialog>
        );
    }, [hideDialog, inputForm]);

    return dialog();
}