import {Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import styles from "@/styles/chatImageInputDialog.module.sass";
import Picture from "../../../public/images/picture.svg";
import isEmpty from "lodash/isEmpty";
import {v4 as uuid} from "uuid";
import {ChatAPI} from "@/apis/chatAPI";
import {saveUserProfileReq, sendMessageReq} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
import {setIsActiveChatImageInput, setIsActiveProfileImageInput} from "@/stores/reducers/ui";

export interface ChatImageInputDialogProps {
    profileImageInputRef: RefObject<HTMLInputElement>;
    setProfileSmallImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    setProfileLargeImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    profileSmallImage: string|ArrayBuffer|null;
    profileLargeImage: string|ArrayBuffer|null;
}

export default function ProfileImageInputDialog({profileImageInputRef, profileSmallImage, profileLargeImage, setProfileSmallImage, setProfileLargeImage }: ChatImageInputDialogProps) {
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
            if (ui.isActiveProfileImageInput) {
                setDialogWrapperClass(`${styles.dialogWrapper} ${styles.active}`);
            } else {
                setDialogWrapperClass(`${styles.dialogWrapper}`);
            }
        }

    }, [firstRender, ui, setDialogWrapperClass]);

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveProfileImageInput(false));
        setProfileSmallImage('');
        setProfileLargeImage('');
        if (profileImageInputRef.current)
            profileImageInputRef.current.value = '';
    }, [dispatch, setProfileSmallImage, setProfileLargeImage, profileImageInputRef]);

    const onSendImage = useCallback(async () => {
        if (!webSocket.socket) {
            alert('연결 안됨');
            return;
        } else if (isEmpty(user.id)) {
            alert('로그인 후 이용해 주세요.');
            return;
        } else if (isEmpty(profileSmallImage) || isEmpty(profileLargeImage)) {
            alert('이미지를 선택해 주세요.');
            hideDialog();
            return;
        } else if (!profileImageInputRef.current || !profileImageInputRef.current.files || 1 > profileImageInputRef.current.files.length) {
            alert(`전송할 이미지를 선택해주세요.`);
            return;
        } else if (10485760 < profileImageInputRef.current.files[0].size) {
            alert(`파일크기 10MB 이하의 이미지만 전송 가능합니다.`);
            return;
        }

        dispatch(saveUserProfileReq({ smallData: (profileSmallImage ? (profileSmallImage as string) : ""), largeData: (profileLargeImage ? (profileLargeImage as string) : "") }));
        hideDialog();
    }, [webSocket, user, profileSmallImage, profileLargeImage, profileImageInputRef, hideDialog, dispatch]);

    const dialog = useCallback(() =>  {
        return (
            <div className={dialogWrapperClass}>
                <div className={styles.dialog}>
                    <div className={styles.dialogContent}>
                        {
                            profileLargeImage
                                ?
                                <img className={styles.chatImageThumb} src={'string' == typeof profileLargeImage ? profileLargeImage : Picture} alt='업로드 이미지' />
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
    }, [dialogWrapperClass, profileLargeImage, hideDialog, onSendImage]);

    return dialog();
}