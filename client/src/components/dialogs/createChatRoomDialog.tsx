import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/createChatRoomDialog.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {createChatRoomReq} from "@/stores/reducers/webSocket";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveCreateChatRoom} from "@/stores/reducers/ui";

export default function CreateChatRoomDialog() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const [chatRoomName, setChatRoomName] = useState<string>('');
    const [chatRoomOpenType, setChatRoomOpenType] = useState<Defines.RoomOpenType>(Defines.RoomOpenType.PRIVATE);
    const [dialogWrapperClass, setDialogWrapperClass] = useState<string>(styles.dialogWrapper)

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    useEffect(() => {
        if (!firstRender.current) {
            if (ui.isActiveCreateChatRoom) {
                setDialogWrapperClass(`${styles.dialogWrapper} ${styles.active}`);
            } else {
                setDialogWrapperClass(`${styles.dialogWrapper}`);
            }
        }

    }, [firstRender, ui, setDialogWrapperClass]);

    const createChatRoom = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
            return;
        } else if (isEmpty(chatRoomName)) {
            alert('채팅방 정보를 입력해주세요.');
            return;
        } else if (10 < chatRoomName.length) {
            alert('채팅방 이름은 10글자 이내로 입력해주세요.');
            return;
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해주세요.');
            return;
        } else if (10 < user.name.length) {
            alert('대화명은 10글자 이내로 입력해주세요.');
            return;
        } else if (Defines.RoomOpenType.PRIVATE != chatRoomOpenType && Defines.RoomOpenType.PUBLIC != chatRoomOpenType) {
            alert('개설할 채팅방의 공개범위를 선택해주세요.');
            return;
        }
        dispatch(createChatRoomReq({openType: chatRoomOpenType, roomName: chatRoomName}));
        dispatch(setIsActiveCreateChatRoom(false));
    }, [webSocket, user, chatRoomName, chatRoomOpenType, dispatch]);

    const onKeyUpChatRoomName = useCallback((e: any) => {
        if (e.key == 'Enter')
            createChatRoom();
    }, [createChatRoom]);

    const changeChatRoomName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setChatRoomName(prev => {
            if (10 < e.target.value.toString().trim().length) {
                alert(`채팅방 이름은 10글자 이내로 입력해주세요.`);
                return prev.substring(0, 10);
            }

            return e.target.value.toString() ?? '';
        });
    }, [setChatRoomName]);

    const onChangeChatRoomOpenType = useCallback((type: Defines.RoomOpenType) => {
        setChatRoomOpenType(type);
    }, [setChatRoomOpenType]);

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveCreateChatRoom(false));
        setChatRoomName('');
        setChatRoomOpenType(Defines.RoomOpenType.PRIVATE);
    }, [dispatch, setChatRoomName, setChatRoomOpenType]);

    const dialog = useCallback(() => {
        return (
            <div className={dialogWrapperClass}>
                <div className={styles.dialog}>
                    <div className={styles.dialogContent}>
                        <div className={styles.chatRoomInputWrapper}>
                            <div className={styles.chatRoomOpenTypeWrapper}>
                                <div className={styles.chatRoomOpenTypeInputWrapper}>
                                    <input
                                        className={styles.chatRoomOpenTypeInput}
                                        type="radio"
                                        name="chatRoomOpenType"
                                        id='publicChatRoom'
                                        checked={Defines.RoomOpenType.PUBLIC == chatRoomOpenType}
                                        onChange={e => {
                                        }}
                                        onClick={e => onChangeChatRoomOpenType(Defines.RoomOpenType.PUBLIC)}
                                    />
                                    <label className={styles.chatRoomOpenTypeInputLabel}
                                           htmlFor="publicChatRoom"
                                           onClick={e => onChangeChatRoomOpenType(Defines.RoomOpenType.PUBLIC)}>
                                        공개
                                    </label>
                                </div>
                                <div className={styles.chatRoomOpenTypeInputWrapper}>
                                    <input
                                        className={styles.chatRoomOpenTypeInput}
                                        type="radio"
                                        name="chatRoomOpenType"
                                        id="privateChatRoom"
                                        checked={Defines.RoomOpenType.PRIVATE == chatRoomOpenType}
                                        onChange={e => {
                                        }}
                                        onClick={e => onChangeChatRoomOpenType(Defines.RoomOpenType.PRIVATE)}
                                    />
                                    <label className={styles.chatRoomOpenTypeInputLabel} htmlFor="privateChatRoom"
                                           onClick={e => onChangeChatRoomOpenType(Defines.RoomOpenType.PRIVATE)}>
                                        비공개
                                    </label>
                                </div>
                            </div>
                            <input className={styles.roomNameInput} value={chatRoomName}
                                   onKeyUp={e => onKeyUpChatRoomName(e)}
                                   onChange={e => changeChatRoomName(e)}
                                   placeholder={appConfigs.isProd ? '채팅방 이름' : ''}/>
                        </div>
                    </div>
                    <div className={styles.dialogButtons}>
                        <button className={`${styles.dialogButton} ${stylesCommon.button} ${stylesCommon.primaryButton}`} onClick={createChatRoom}>생성</button>
                        <button className={`${styles.dialogButton} ${stylesCommon.button}`} onClick={hideDialog}>취소</button>
                    </div>
                </div>
                <div className={styles.dialogPane} onClick={hideDialog}></div>
            </div>
        );
    }, [appConfigs, changeChatRoomName, chatRoomName, chatRoomOpenType, createChatRoom, dialogWrapperClass, hideDialog, onChangeChatRoomOpenType, onKeyUpChatRoomName]);

    return dialog();
}