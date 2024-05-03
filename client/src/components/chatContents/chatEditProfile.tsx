import {
    ChangeEvent,
    createRef,
    Dispatch,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import styles from "@/styles/chatDialogEditProfile.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import Image from "next/image";
import RemoveIcon from "public/images/close-circle.svg";
import {setUserMessage, setNickName} from "@/stores/reducers/user";
import {removeUserProfileReq, saveUserMessageReq, saveNickNameReq, signOutReq} from "@/stores/reducers/webSocket";
import isEmpty from "lodash/isEmpty";
import {Helpers} from "@/helpers";
import {setIsActiveProfileImageInput} from "@/stores/reducers/ui";
import {Defines} from "@/defines";
import useCurrentUser from "@/components/common/useCurrentUser";
import {Domains} from "@/domains";
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;

export interface ChatEditProfileProps {
    profileImageInputRef: RefObject<HTMLInputElement>;
    setProfileImageMime: Dispatch<SetStateAction<Defines.AllowedImageType>>;
    setProfileSmallImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    setProfileLargeImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    profileImageMime: Defines.AllowedImageType;
    profileSmallImage: string|ArrayBuffer|null;
    profileLargeImage: string|ArrayBuffer|null;
}

export default function ChatEditProfile({profileImageInputRef, profileImageMime, profileSmallImage, profileLargeImage, setProfileImageMime, setProfileSmallImage, setProfileLargeImage }: ChatEditProfileProps) {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const user = useAppSelector(state => state.user);
    const [currentUser] = useCurrentUser();
    const [newNickName, setNewNickName] = useState<string>('');
    const [newUserMessage, setNewUserMessage] = useState<string>('');
    const nameInputRef = createRef<HTMLInputElement>();
    const messageInputRef = createRef<HTMLInputElement>();


    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const onSaveNickName = useCallback(() => {
        if (!newNickName.trim() || 2 > newNickName.trim().length) {
            alert('대화명은 2글자 이상으로 입력해주세요.');
            return;
        }

        if (10 < newNickName.trim().length) {
            alert('대화명은 10글자 이하로 입력해 주세요.');
            return;
        }

        if (newNickName.trim() != currentUser.nickName) {
            dispatch(setNickName(newNickName.trim()))
            dispatch(saveNickNameReq());
        }
    }, [dispatch, currentUser, newNickName]);

    const onKeyUpNickName = useCallback((e: any) => {
        if (e.key == 'Enter')
            nameInputRef.current?.blur();
    }, [nameInputRef]);

    const onChangeNickName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setNewNickName(e.target.value);
    }, [setNewNickName]);

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
            <Image className={styles.userThumbImage} src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${currentUser.userId}`} alt='내 프로필' width={120} height={120} />
        );
    }, [appConfigs, currentUser]);

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
            <div className={styles.userThumb}>
                <button className={styles.removeProfile}><Image src={RemoveIcon} alt="프로필 삭제" fill={true} priority={true} onClick={removeUserProfile} /></button>
                <label className={styles.profileImageInputLabel} htmlFor='profileImageInput' title='프로필 등록'>
                    {userProfileImage()}
                </label>
                <input ref={profileImageInputRef} onChange={onChangeProfileImageFile}
                       className={styles.profileImageInput} id='profileImageInput' type='file' accept='image/*'/>

            </div>
            <div className={styles.userInfo}>
                <div className={styles.nickName}>
                    <div className={styles.currentNickName}>{currentUser.nickName}</div>
                    <div className={styles.nickNameInputWrapper}>
                        <input className={styles.nickNameInput} value={newNickName} ref={nameInputRef}
                               onKeyUp={e => onKeyUpNickName(e)}
                               onChange={e => onChangeNickName(e)}
                               onBlur={onSaveNickName}
                               onFocus={e => {
                                   setNewNickName(currentUser.nickName)
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