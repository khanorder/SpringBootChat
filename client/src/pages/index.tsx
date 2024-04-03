import styles from 'src/styles/chat.module.sass'
import {
    ChangeEvent,
    ReactElement,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import {NextPageContext} from "next";
import MainLayout from "@/components/layouts/main";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {
    createChatRoomReq,
    enterChatRoomReq
} from "@/stores/reducers/webSocket";
import Layout from "@/components/layouts";
import {Defines} from "@/defines";
import {Helpers} from "@/helpers";

interface HomeProps {
    isProd: boolean;
}

function Home({isProd}: HomeProps) {
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const [chatRoomName, setChatRoomName] = useState<string>('');
    const [chatRoomOpenType, setChatRoomOpenType] = useState<Defines.RoomOpenType>(Defines.RoomOpenType.PRIVATE);
    const dispatch = useAppDispatch();
    const firstRender = useRef(true);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
        }

    }, [firstRender]);
    //#endregion

    const createChatRoom = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(chatRoomName)) {
            alert('채팅방 정보를 입력해주세요.');
        } else if (10 < chatRoomName.length) {
            alert('채팅방 이름은 10글자 이내로 입력해주세요.');
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해주세요.');
        } else if (10 < user.name.length) {
            alert('대화명은 10글자 이내로 입력해주세요.');
        } else if (Defines.RoomOpenType.PRIVATE != chatRoomOpenType && Defines.RoomOpenType.PUBLIC != chatRoomOpenType) {
            alert('개설할 채팅방의 공개범위를 선택해주세요.');
        } else {
            dispatch(createChatRoomReq({openType: chatRoomOpenType, roomName: chatRoomName}));
        } 
    }, [webSocket, user, chatRoomName, chatRoomOpenType, dispatch]);

    const enterChatRoom = useCallback((enterChatRoomId: string) => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(enterChatRoomId)) {
            alert('채팅방 정보 없음');
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해 주세요.');
        } else if (10 < user.name.length) {
            alert('대화명은 10글자 이내로 입력해주세요.');
        } else {
            dispatch(enterChatRoomReq(enterChatRoomId));
        }
    }, [webSocket, user, dispatch]);

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

    const chatRooms = useCallback(() => {
        if (!chat.roomList || 1 > chat.roomList.length) {
            return (
                <ul className={styles.chatRoomList}>
                    <li className={styles.chatRoomListItem}>{isProd ? '개설된 채팅방이 없습니다.' : ''}</li>
                </ul>
            );
        } else {
            const list: ReactElement[] = [];
            for (let i = 0; i < chat.roomList.length; i++) {
                list.push(
                    <li key={i} className={styles.chatRoomListItem}>
                        <button className={styles.chatRoomEnterButton} onClick={e => enterChatRoom(chat.roomList[i].roomId)}>
                            <div className={styles.chatRoomNameIcon}>
                                <div className={styles.chatRoomNameIconText}>
                                    {chat.roomList[i].roomName.substring(0, 1)}
                                </div>
                            </div>
                            <div className={styles.chatRoomInfoWrapper}>
                                <div className={styles.chatRoomNameWrapper}>
                                    <div className={styles.chatRoomName}>{chat.roomList[i].roomName}</div>
                                    {
                                        chat.roomList[i].userCount > 0
                                            ?
                                            <div className={styles.chatRoomUserCount}>{chat.roomList[i].userCount}</div>
                                            :
                                            <></>
                                    }
                                </div>
                                <div className={styles.chatRoomPreviewWrapper}>
                                    <div className={styles.chatRoomPreview}></div>
                                </div>
                            </div>
                            <div className={styles.chatRoomOpenType}>{Helpers.getChatRoomOpenTypeName(chat.roomList[i].openType)}</div>
                        </button>
                    </li>
                );
            }

            return (
                <ul className={styles.chatRoomList}>{list}</ul>
            );
        }
    }, [chat, enterChatRoom, isProd]);

    const onChangeChatRoomOpenType = useCallback((type: Defines.RoomOpenType) => {
        setChatRoomOpenType(type);
    }, [setChatRoomOpenType]);

    const contents = useCallback(() => {
        if (!webSocket || WebSocket.OPEN !== webSocket.connectionState)
            return (
                <div style={{textAlign: 'center'}}>{isProd ? appConfigs.name : ''}</div>
            );

        return (
            <>
                <div className={styles.chatRoomInputWrapper}>
                    <div className={styles.chatRoomOpenTypeWrapper}>
                        <div className={styles.chatRoomOpenTypeInputWrapper}>
                            <input
                                className={styles.chatRoomOpenTypeInput}
                                type="radio"
                                name="chatRoomOpenType"
                                id='publicChatRoom'
                                checked={Defines.RoomOpenType.PUBLIC == chatRoomOpenType}
                                onChange={e => {}}
                                onClick={e => onChangeChatRoomOpenType(Defines.RoomOpenType.PUBLIC)}
                            />
                            <label className={styles.chatRoomOpenTypeInputLabel} htmlFor="publicChatRoom" onClick={e => onChangeChatRoomOpenType(Defines.RoomOpenType.PUBLIC)}>
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
                                onChange={e => {}}
                                onClick={e => onChangeChatRoomOpenType(Defines.RoomOpenType.PRIVATE)}
                            />
                            <label className={styles.chatRoomOpenTypeInputLabel} htmlFor="privateChatRoom" onClick={e => onChangeChatRoomOpenType(Defines.RoomOpenType.PRIVATE)}>
                                비공개
                            </label>
                        </div>
                    </div>
                    <input className={styles.roomNameInput} value={chatRoomName}
                           onKeyUp={e => onKeyUpChatRoomName(e)}
                           onChange={e => changeChatRoomName(e)}
                           placeholder={isProd ? '채팅방 이름' : ''}/>
                    <button className={styles.createChatRoomButton} onClick={createChatRoom}>만들기</button>
                </div>
                <div className={styles.chatRoomListWrapper}>
                    {chatRooms()}
                </div>
            </>
        );
    }, [
        isProd,
        webSocket,
        chatRoomName,
        changeChatRoomName,
        createChatRoom,
        chatRooms,
        onKeyUpChatRoomName,
        appConfigs,
        onChangeChatRoomOpenType,
        chatRoomOpenType
    ]);

    return (
        <main className={styles.main}>
            <div className={styles.title}>{ isProd ? appConfigs.name : ''}</div>
            {contents()}
        </main>
    );
}

Home.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            <MainLayout>{page}</MainLayout>
        </Layout>
    );
}

Home.getInitialProps = ({res, err}: NextPageContext) => {
    return {isProd: ("production" === process.env.NODE_ENV)};
}

export default Home;