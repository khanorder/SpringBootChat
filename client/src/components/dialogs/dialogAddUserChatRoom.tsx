import {ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/chatDialogCreateChatRoom.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import stylesTabPanel from "@/styles/tabPanel.module.sass";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {addUserChatRoomReq, createChatRoomReq} from "@/stores/reducers/webSocket";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveAddUser, setIsActiveCreateChatRoom} from "@/stores/reducers/ui";
import dynamic from "next/dynamic";
import {Domains} from "@/domains";
import deepmerge from "deepmerge";
import useOthersUserInfo from "@/components/common/useOthersUserInfo";
const LayoutCenterDialog = dynamic(() => import("@/components/layouts/dialogCenter"), { ssr: false });
const ChatSelectUsers = dynamic(() => import("@/components/chatContents/chatSelectUsers"), { ssr: false });

export default function DialogAddUserChatRoom() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [getOthersUserInfo] = useOthersUserInfo();

    useEffect(() => {
        if (!firstRender.current) {
            if (!ui.isActiveAddUser) {
                setSelectedUsers([]);
            }
        }

    }, [firstRender, ui, setSelectedUsers]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const addUserChatRoom = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
            return;
        }

        dispatch(addUserChatRoomReq(selectedUsers));
        dispatch(setIsActiveAddUser(false));
    }, [webSocket, dispatch, selectedUsers]);

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveAddUser(false));
        setSelectedUsers([]);
    }, [dispatch, setSelectedUsers]);

    const onSelectUser = useCallback((userId: string) => {
        if (isEmpty(userId)) {
            alert("사용자 아이디 필요합니다.");
            return;
        }

        setSelectedUsers(prev => {
            if (!prev)
                prev = [];

            if (prev.includes(userId)) {
                prev = prev.filter(_ => _ != userId);
            } else {
                prev.push(userId);
            }

            return deepmerge([], prev);
        });
    }, [setSelectedUsers]);

    const selectedUserChips = useCallback(() => {
        const list: ReactElement[] = [];

        if (0 < selectedUsers.length) {
            for (let i = 0; i < selectedUsers.length; i++) {
                const selectedUserId = selectedUsers[i];
                const userInfo = getOthersUserInfo(selectedUserId);
                list.push(<div key={i} className={stylesCommon.chip} onClick={e => onSelectUser(selectedUserId)}>{userInfo.nickName}</div>);
            }
        }

        return (
            <div className={styles.selectedUserChips}>
                {list}
            </div>
        );
    }, [getOthersUserInfo, selectedUsers, onSelectUser]);

    const dialog = useCallback(() => {

        return (
            <LayoutCenterDialog
                type={Defines.CenterDialogType.ADD_USER_CHAT_ROOM}
                size={Defines.CenterDialogSize.LARGE}
                buttons={
                    <>
                        <button className={`${styles.button} ${stylesCommon.button} ${stylesCommon.primaryButton}`} onClick={addUserChatRoom} title="초대">초대</button>
                        <button className={`${styles.button} ${stylesCommon.button}`} onClick={hideDialog} title="취소">취소</button>
                    </>
                }>
                <div className={styles.chatRoomInputWrapper}>
                    {selectedUserChips()}
                    <div className={styles.selectUserWrapper}>
                        <ChatSelectUsers selectedUsers={selectedUsers} onSelectUser={onSelectUser}/>
                    </div>
                </div>
            </LayoutCenterDialog>
        );
    }, [addUserChatRoom, hideDialog, onSelectUser, selectedUserChips, selectedUsers]);

    return dialog();
}