import {ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import styles from "@/styles/chatDialogCreateChatRoom.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import stylesTabPanel from "@/styles/tabPanel.module.sass";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {createChatRoomReq} from "@/stores/reducers/webSocket";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveCreateChatRoom} from "@/stores/reducers/ui";
import dynamic from "next/dynamic";
import {Domains} from "@/domains";
import deepmerge from "deepmerge";
import useGetUserInfo from "@/components/common/useGetUserInfo";
const LayoutCenterDialog = dynamic(() => import("@/components/layouts/dialogCenter"), { ssr: false });
const ChatSelectUsers = dynamic(() => import("@/components/chatContents/chatSelectUsers"), { ssr: false });

export default function DialogCreateChatRoom() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const [chatRoomName, setChatRoomName] = useState<string>('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [chatRoomOpenType, setChatRoomOpenType] = useState<Defines.RoomOpenType>(Defines.RoomOpenType.PRIVATE);
    const [getUserInfo] = useGetUserInfo();

    useEffect(() => {
        if (!firstRender.current) {
            if (!ui.isActiveCreateChatRoom) {
                setChatRoomName('');
                setChatRoomOpenType(Defines.RoomOpenType.PRIVATE);
                setSelectedUsers([]);
            }
        }

    }, [firstRender, ui, setChatRoomOpenType, setChatRoomName, setSelectedUsers]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const createChatRoom = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
            return;
        } else if (Defines.RoomOpenType.PRIVATE != chatRoomOpenType && Defines.RoomOpenType.PUBLIC != chatRoomOpenType) {
            alert('개설할 채팅방의 공개범위를 선택해주세요.');
            return;
        }

        if (Defines.RoomOpenType.PUBLIC === chatRoomOpenType) {
            if (isEmpty(chatRoomName)) {
                alert('채팅방 정보를 입력해주세요.');
                return;
            } else if (10 < chatRoomName.length) {
                alert('채팅방 이름은 10글자 이내로 입력해주세요.');
                return;
            }
        }
        dispatch(createChatRoomReq({openType: chatRoomOpenType, roomName: chatRoomName, userIds: selectedUsers}));
        dispatch(setIsActiveCreateChatRoom(false));
    }, [webSocket, chatRoomName, chatRoomOpenType, dispatch, selectedUsers]);

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
        setSelectedUsers([]);
    }, [dispatch, setChatRoomName, setChatRoomOpenType, setSelectedUsers]);

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
                const userInfo = getUserInfo(selectedUserId);
                list.push(<div key={i} className={stylesCommon.chip} onClick={e => onSelectUser(selectedUserId)}>{userInfo.userName}</div>);
            }
        }

        return (
            <div className={styles.selectedUserChips}>
                {list}
            </div>
        );
    }, [getUserInfo, selectedUsers, onSelectUser]);

    const dialog = useCallback(() => {
        let tabClassPrivate: string = stylesTabPanel.tab;
        let tabClassPublic: string = stylesTabPanel.tab;
        let panelClassPrivate: string = stylesTabPanel.panel;
        let panelClassPublic: string = stylesTabPanel.panel;

        switch (chatRoomOpenType) {
            case Defines.RoomOpenType.PRIVATE:
                tabClassPrivate += ` ${stylesTabPanel.active}`;
                panelClassPrivate += ` ${stylesTabPanel.active}`;
                break;

            case Defines.RoomOpenType.PUBLIC:
                tabClassPublic += ` ${stylesTabPanel.active}`;
                panelClassPublic += ` ${stylesTabPanel.active}`;
                break;
        }

        return (
            <LayoutCenterDialog
                type={Defines.CenterDialogType.CreateChatRoom}
                size={Defines.CenterDialogSize.Large}
                buttons={
                    <>
                        <button className={`${styles.button} ${stylesCommon.button} ${stylesCommon.primaryButton}`} onClick={createChatRoom}>생성</button>
                        <button className={`${styles.button} ${stylesCommon.button}`} onClick={hideDialog}>취소</button>
                    </>
                }>
                <div className={styles.chatRoomInputWrapper}>
                    <div className={stylesTabPanel.tabPanelWrapper}>
                        <div className={stylesTabPanel.tabs}>
                            <div className={tabClassPrivate}>
                                <button className={stylesTabPanel.button} onClick={e => onChangeChatRoomOpenType(Defines.RoomOpenType.PRIVATE)}>일반</button>
                            </div>
                            <div className={tabClassPublic}>
                                <button className={stylesTabPanel.button} onClick={e => onChangeChatRoomOpenType(Defines.RoomOpenType.PUBLIC)}>공개</button>
                            </div>
                        </div>
                        {selectedUserChips()}
                        <div>
                            <div className={stylesTabPanel.panels}>
                                <div className={panelClassPrivate}></div>
                                <div className={panelClassPublic}>
                                    <input className={styles.roomNameInput} value={chatRoomName}
                                           onKeyUp={e => onKeyUpChatRoomName(e)}
                                           onChange={e => changeChatRoomName(e)}
                                           placeholder={appConfigs.isProd ? '채팅방 이름' : ''}/>
                                </div>
                            </div>
                        </div>
                        <div className={styles.selectUserWrapper}>
                            <ChatSelectUsers selectedUsers={selectedUsers} onSelectUser={onSelectUser} />
                        </div>
                    </div>
                </div>
            </LayoutCenterDialog>
        );
    }, [appConfigs, changeChatRoomName, chatRoomName, chatRoomOpenType, onChangeChatRoomOpenType, onKeyUpChatRoomName, selectedUsers, setSelectedUsers]);

    return dialog();
}