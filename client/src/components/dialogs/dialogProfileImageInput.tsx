import {Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import styles from "@/styles/chatDialogImageInput.module.sass";
import Picture from "public/images/picture.svg";
import isEmpty from "lodash/isEmpty";
import {saveUserProfileReq} from "@/stores/reducers/webSocket";
import {setIsActiveProfileImageInput} from "@/stores/reducers/ui";
import {Helpers} from "@/helpers";
import {Defines} from "@/defines";
import stylesCommon from "@/styles/common.module.sass";
import dynamic from "next/dynamic";
const LayoutCenterDialog = dynamic(() => import("@/components/layouts/dialogCenter"), { ssr: false });

export interface ChatImageInputDialogProps {
    profileImageInputRef: RefObject<HTMLInputElement>;
    setProfileImageMime: Dispatch<SetStateAction<Defines.AllowedImageType>>;
    setProfileSmallImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    setProfileLargeImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    profileImageMime: Defines.AllowedImageType;
    profileSmallImage: string|ArrayBuffer|null;
    profileLargeImage: string|ArrayBuffer|null;
}

export default function DialogProfileImageInput({profileImageInputRef, profileImageMime, profileSmallImage, profileLargeImage, setProfileImageMime, setProfileSmallImage, setProfileLargeImage }: ChatImageInputDialogProps) {
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
        setProfileImageMime(Defines.AllowedImageType.NONE);
        setProfileSmallImage('');
        setProfileLargeImage('');
        if (profileImageInputRef.current)
            profileImageInputRef.current.value = '';
    }, [dispatch, setProfileImageMime, setProfileSmallImage, setProfileLargeImage, profileImageInputRef]);

    const onSendImage = useCallback(async () => {
        if (!webSocket.socket) {
            alert('연결 안됨');
            return;
        } else if (isEmpty(user.id)) {
            alert('로그인 후 이용해 주세요.');
            return;
        } else if (1 > profileImageMime || (Defines.AllowedImageType.SVG != profileImageMime && (isEmpty(profileSmallImage) || isEmpty(profileLargeImage)))) {
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

        let bytesLarge = new Uint8Array();
        let bytesSmall = new Uint8Array();
        switch (profileImageMime) {
            case Defines.AllowedImageType.SVG:
                bytesLarge = new Uint8Array(await profileImageInputRef.current.files[0].arrayBuffer());
                break;

            default:
                const blobLarge = Helpers.getDataURItoBlob((profileLargeImage ? (profileLargeImage as string) : ""));
                const blobSmall = Helpers.getDataURItoBlob((profileSmallImage ? (profileSmallImage as string) : ""));
                bytesLarge = new Uint8Array(await blobLarge.arrayBuffer());
                bytesSmall = new Uint8Array(await blobSmall.arrayBuffer());
        }

        dispatch(saveUserProfileReq({ mime: profileImageMime, bytesLarge: bytesLarge, bytesSmall: bytesSmall }));
        hideDialog();
    }, [webSocket, user, profileImageMime, profileSmallImage, profileLargeImage, profileImageInputRef, hideDialog, dispatch]);

    const dialog = useCallback(() =>  {
        return (
            <LayoutCenterDialog
                type={Defines.CenterDialogType.PROFILE_IMAGE_INPUT}
                size={Defines.CenterDialogSize.MEDIUM}
                buttons={
                    <>
                        <button className={`${styles.button} ${stylesCommon.button} ${stylesCommon.primaryButton}`}
                                onClick={onSendImage} title="전송">전송
                        </button>
                        <button className={`${styles.button} ${stylesCommon.button}`} onClick={hideDialog}
                                title="취소">취소
                        </button>
                    </>
                }>
                <div className={styles.chatImageInputWrapper}>
                    <div className={styles.inputForm}>
                        {
                            profileLargeImage
                                ?
                                <img className={styles.chatImageThumb} src={'string' == typeof profileLargeImage ? profileLargeImage : Picture} alt='업로드 이미지' />
                                :
                                <></>
                        }
                    </div>
                </div>
            </LayoutCenterDialog>
        );
    }, [profileLargeImage, hideDialog, onSendImage]);

    return dialog();
}