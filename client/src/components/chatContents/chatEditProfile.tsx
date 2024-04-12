import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import styles from "@/styles/chatEditProfile.module.sass";
import Image from "next/image";
import UserIcon from "../../../public/images/user-circle.svg";
import {setUserMessage, setUserName} from "@/stores/reducers/user";
import {saveUserMessageReq, saveUserNameReq} from "@/stores/reducers/webSocket";

export default function ChatEditProfile() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const user = useAppSelector(state => state.user);
    const [newUserName, setNewUserName] = useState<string>('');
    const [newUserMessage, setNewUserMessage] = useState<string>('');
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
            dispatch(setUserName(user.name));
            return;
        }

        if (10 < newUserName.trim().length) {
            alert('대화명은 10글자 이하로 입력해 주세요.');
            dispatch(setUserName(user.name));
            return;
        }

        if (newUserName.trim() != user.name) {
            dispatch(setUserName(newUserName.trim()))
            dispatch(saveUserNameReq());
        }
    }, [dispatch, user, newUserName]);

    const onKeyUpUserName = useCallback((e: any) => {
        if (e.key == 'Enter') {
        }
    }, []);

    const onChangeUserName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setNewUserName(e.target.value);
    }, [setNewUserName]);

    const onSaveUserMessage = useCallback(() => {
        if (128 < newUserMessage.trim().length) {
            alert('상태 메세지는 128글자 이내로 입력해 주세요.');
            dispatch(setUserMessage(user.message.trim()));
            return;
        }

        if (newUserMessage.trim() != user.message) {
            dispatch(setUserMessage(newUserMessage.trim()))
            dispatch(saveUserMessageReq());
        }
    }, [dispatch, user, newUserMessage]);

    const onKeyUpUserMessage = useCallback((e: any) => {
        if (e.key == 'Enter') {
        }
    }, []);

    const onChangeUserMessage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setNewUserMessage(e.target.value);
    }, [setNewUserMessage]);

    return (
        <div className={styles.editProfileWrapper}>
            <div className={styles.userThumb}>
                {
                    user.haveProfile
                        ?
                        <img className={styles.userThumbImage}
                             src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}/api/profileThumb/${user.id}`}
                             alt='사용자 프로필'/>
                        :
                        <Image className={styles.userThumbIcon} src={UserIcon} alt='사용자 프로필' fill={true}
                               priority={true}/>
                }
            </div>
            <div className={styles.userInfo}>
                <div className={styles.userName}>
                    <div className={styles.currentUserName}>{user.name}</div>
                    <div className={styles.userNameInputWrapper}>
                        <input className={styles.userNameInput} value={newUserName}
                               onKeyUp={e => onKeyUpUserName(e)}
                               onChange={e => onChangeUserName(e)}
                               onBlur={onSaveUserName}
                               onFocus={e => {
                                   setNewUserName(user.name)
                               }}
                               placeholder={appConfigs.isProd ? '대화명' : ''}/>
                    </div>
                </div>
                <div className={styles.separator}></div>
                <div className={styles.userMessage}>
                    <div className={styles.currentUserMessage}>{user.message}</div>
                    <div className={styles.userMessageInputWrapper}>
                        <input className={styles.userMessageInput} value={newUserMessage}
                               onKeyUp={e => onKeyUpUserMessage(e)}
                               onChange={e => onChangeUserMessage(e)}
                               onBlur={onSaveUserMessage}
                               onFocus={e => {
                                   setNewUserMessage(user.message)
                               }}
                               placeholder={appConfigs.isProd ? '상태 메세지' : ''}/>
                    </div>
                </div>
            </div>
        </div>
    );
}