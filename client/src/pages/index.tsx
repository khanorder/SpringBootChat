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
import DefaultLayout from "@/components/layouts/default";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {setUserName} from "@/stores/reducers/user";
import {
    createChatRoomReq,
    enterChatRoomReq
} from "@/stores/reducers/webSocket";

interface HomeProps {
    isProd: boolean;
}

function Home({isProd}: HomeProps) {
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const [chatRoomName, setChatRoomName] = useState<string>('');
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
        } else {
            dispatch(createChatRoomReq(chatRoomName));
        }
    }, [webSocket, user, chatRoomName, dispatch]);

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

    const onKeyUpUserName = useCallback((e: any) => {
        if (e.key == 'Enter')
            createChatRoom();
    }, [createChatRoom]);

    const changeUserName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        dispatch(setUserName(e.target.value ? e.target.value.trim() : ''));
    }, [dispatch]);

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
                            <div className={styles.chatRoomName}>{isProd ? `${chat.roomList[i].roomName}[${chat.roomList[i].userCount}] 채팅방 입장` : ''}</div>
                        </button>
                    </li>
                )
            }

            return (
                <ul className={styles.chatRoomList}>{list}</ul>
            );
        }
    }, [chat, enterChatRoom, isProd]);

    const contents = useCallback(() => {
        if (!webSocket || WebSocket.OPEN !== webSocket.connectionState)
            return (
                <div style={{textAlign: 'center'}}>{isProd ? appConfigs.name : ''}</div>
            );

        return (
            <>
                <div className={styles.chatRoomInputWrapper}>
                    <input className={styles.userNameInput} value={user.name}
                           onKeyUp={e => onKeyUpUserName(e)}
                           onChange={e => changeUserName(e)}
                           placeholder={isProd ? '대화명' : ''}/>
                    <input className={styles.roomNameInput} value={chatRoomName}
                           onKeyUp={e => onKeyUpChatRoomName(e)}
                           onChange={e => changeChatRoomName(e)}
                           placeholder={isProd ? '채팅방 이름' : ''}/>
                    <button className={styles.createChatRoomButton} onClick={createChatRoom}>만들기
                    </button>
                </div>
                <div className={styles.chatRoomListWrapper}>
                    {chatRooms()}
                </div>
            </>
        );
    }, [
        isProd,
        webSocket,
        user,
        chatRoomName,
        changeChatRoomName,
        changeUserName,
        createChatRoom,
        chatRooms,
        onKeyUpUserName,
        onKeyUpChatRoomName,
        appConfigs
    ]);

    return (
        <main className={styles.main}>
            <div className={styles.title}>{ isProd ? appConfigs.name : ''}</div>
            {contents()}
        </main>
    )
}

Home.getLayout = function getLayout(page: ReactElement) {
    return (
        <DefaultLayout>{page}</DefaultLayout>
    );
}

Home.getInitialProps = ({res, err}: NextPageContext) => {
    return {isProd: ("production" === process.env.NODE_ENV)};
}

export default Home;