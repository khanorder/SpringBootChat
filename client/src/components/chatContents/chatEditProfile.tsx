import {ChangeEvent, createRef, useCallback, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import styles from "@/styles/chatDialogEditProfile.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import Image from "next/image";
import RemoveIcon from "public/images/close-circle.svg";
import {setUserMessage, setUserName} from "@/stores/reducers/user";
import {removeUserProfileReq, saveUserMessageReq, saveUserNameReq, signOutReq} from "@/stores/reducers/webSocket";
import isEmpty from "lodash/isEmpty";
import {Helpers} from "@/helpers";
import {setIsActiveProfileImageInput} from "@/stores/reducers/ui";
import dynamic from "next/dynamic";
import {Defines} from "@/defines";
import useCurrentUser from "@/components/common/useCurrentUser";
const DialogProfileImageInput = dynamic(() => import("@/components/dialogs/dialogProfileImageInput"), { ssr: false });

export default function ChatEditProfile() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const user = useAppSelector(state => state.user);
    const [currentUser] = useCurrentUser();
    const [newUserName, setNewUserName] = useState<string>('');
    const [newUserMessage, setNewUserMessage] = useState<string>('');
    const nameInputRef = createRef<HTMLInputElement>();
    const messageInputRef = createRef<HTMLInputElement>();
    const profileImageInputRef = createRef<HTMLInputElement>();
    const [profileImageMime, setProfileImageMime] = useState<Defines.AllowedImageType>(Defines.AllowedImageType.NONE);
    const [profileLargeImage, setProfileLargeImage] = useState<string|ArrayBuffer|null>(null);
    const [profileSmallImage, setProfileSmallImage] = useState<string|ArrayBuffer|null>(null);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const onSaveUserName = useCallback(() => {
        if (!newUserName.trim() || 2 > newUserName.trim().length) {
            alert('대화명은 2글자 이상으로 입력해주세요.');
            return;
        }

        if (10 < newUserName.trim().length) {
            alert('대화명은 10글자 이하로 입력해 주세요.');
            return;
        }

        if (newUserName.trim() != currentUser.userName) {
            dispatch(setUserName(newUserName.trim()))
            dispatch(saveUserNameReq());
        }
    }, [dispatch, currentUser, newUserName]);

    const onKeyUpUserName = useCallback((e: any) => {
        if (e.key == 'Enter')
            nameInputRef.current?.blur();
    }, [nameInputRef]);

    const onChangeUserName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setNewUserName(e.target.value);
    }, [setNewUserName]);

    const onSaveUserMessage = useCallback(() => {
        if (128 < newUserMessage.trim().length) {
            alert('상태 메세지는 128글자 이내로 입력해 주세요.');
            return;
        }

        if (newUserMessage.trim() != currentUser.message) {
            dispatch(setUserMessage(newUserMessage.trim()))
            dispatch(saveUserMessageReq());
        }
    }, [dispatch, currentUser, newUserMessage]);

    const onKeyUpUserMessage = useCallback((e: any) => {
        if (e.key == 'Enter')
            messageInputRef.current?.blur();
    }, [messageInputRef]);

    const onChangeUserMessage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setNewUserMessage(e.target.value);
    }, [setNewUserMessage]);

    const onChangeProfileImageFile = useCallback(async () => {
        if (profileImageInputRef.current?.files && 0 < profileImageInputRef.current?.files.length) {
            const file = profileImageInputRef.current?.files[0];
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
                        setProfileSmallImage(smallDataURL);
                        setProfileLargeImage(largeDataURL);
                    }
                    reader.readAsDataURL(file);
                } else {
                    setProfileSmallImage("");
                    setProfileLargeImage("");
                }
                setProfileImageMime(mime);
            }
            dispatch(setIsActiveProfileImageInput(true));
        } else {
            setProfileSmallImage("");
            setProfileLargeImage("");
        }
    }, [profileImageInputRef, setProfileImageMime, setProfileSmallImage, setProfileLargeImage, dispatch]);

    const userProfileImage = useCallback(() => {
        return (
            <img className={styles.userThumbImage} src={currentUser.profileImageUrl} alt='내 프로필'/>
        );
    }, [currentUser]);

    const removeUserProfile = useCallback(() => {
        if (!currentUser.haveProfile || isEmpty(currentUser.profileImageUrl)) {
            alert("프로필 이미지가 없습니다.");
            return;
        }

        if (!confirm("프로필 이미지를 삭제하시겠습니까?"))
            return;

        dispatch(removeUserProfileReq());
    }, [currentUser, dispatch]);

    const signOut = useCallback(() => {
        let confirmMessage = "로그아웃 하시겠습니까?";

        if (confirm(confirmMessage))
            dispatch(signOutReq());
    }, [dispatch]);

    return (
        <div className={styles.editProfileWrapper}>
            <DialogProfileImageInput profileImageInputRef={profileImageInputRef} setProfileImageMime={setProfileImageMime} setProfileSmallImage={setProfileSmallImage} setProfileLargeImage={setProfileLargeImage} profileImageMime={profileImageMime} profileSmallImage={profileSmallImage} profileLargeImage={profileLargeImage}/>
            <div className={styles.userThumb}>
                <button className={styles.removeProfile}><Image src={RemoveIcon} alt="프로필 삭제" fill={true} priority={true} onClick={removeUserProfile} /></button>
                <label className={styles.profileImageInputLabel} htmlFor='profileImageInput' title='프로필 등록'>
                    {userProfileImage()}
                </label>
                <input ref={profileImageInputRef} onChange={onChangeProfileImageFile}
                       className={styles.profileImageInput} id='profileImageInput' type='file' accept='image/*'/>

            </div>
            <div className={styles.userInfo}>
                <div className={styles.userName}>
                    <div className={styles.currentUserName}>{currentUser.userName}</div>
                    <div className={styles.userNameInputWrapper}>
                        <input className={styles.userNameInput} value={newUserName} ref={nameInputRef}
                               onKeyUp={e => onKeyUpUserName(e)}
                               onChange={e => onChangeUserName(e)}
                               onBlur={onSaveUserName}
                               onFocus={e => {
                                   setNewUserName(currentUser.userName)
                               }}
                               placeholder={appConfigs.isProd ? '대화명' : ''}/>
                    </div>
                </div>
                <div className={styles.separator}></div>
                <div className={styles.userMessage}>
                    <div className={`${styles.currentUserMessage}${isEmpty(currentUser.message) ? ` ${styles.none}` : ""}`}>{isEmpty(currentUser.message) ? "내 상태를 공유해보세요." : currentUser.message}</div>
                    <div className={styles.userMessageInputWrapper}>
                        <input className={styles.userMessageInput} value={newUserMessage} ref={messageInputRef}
                               onKeyUp={e => onKeyUpUserMessage(e)}
                               onChange={e => onChangeUserMessage(e)}
                               onBlur={onSaveUserMessage}
                               onFocus={e => {
                                   setNewUserMessage(currentUser.message)
                               }}
                               placeholder={appConfigs.isProd ? '상태 메세지' : ''}/>
                    </div>
                </div>
            </div>
            <div className={styles.buttons}>
                <button className={`${stylesCommon.button} ${styles.signOutButton}`} onClick={signOut}>로그아웃</button>
            </div>
        </div>
    );
}