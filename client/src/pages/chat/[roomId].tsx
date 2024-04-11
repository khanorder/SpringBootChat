import {createRef, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {GetServerSideProps} from "next";
import styles from "@/styles/chat.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {enterChatRoomReq} from "@/stores/reducers/webSocket";
import {Helpers} from "@/helpers";
import Head from "next/head";
import dynamic from "next/dynamic";
import {setIsProd} from "@/stores/reducers/appConfigs";
const Layout = dynamic(() => import("@/components/layouts"), { ssr: false });
const DefaultLayout = dynamic(() => import("@/components/layouts/default"), { ssr: false });
const ChatInput = dynamic(() => import("@/components/chatContents/chatInput"), { ssr: false });
const ChatImageInputDialog = dynamic(() => import("@/components/dialogs/chatImageInputDialog"), { ssr: false });
const NotFoundChatRoom = dynamic(() => import("@/components/chatContents/notFoundChatRoom"), { ssr: false });
const ChatImageDetailDialog = dynamic(() => import("@/components/dialogs/chatImageDetailDialog"), { ssr: false });
const ChatContents = dynamic(() => import("@/components/chatContents/chatContents"), { ssr: false });

interface ChatRoomProps {
    isProd: boolean;
    roomId: string;
    roomIdBase62: string;
    // roomName: string;
    // roomOpenType: Defines.RoomOpenType;
    serverHost: string;
}

function ChatRoom({isProd, roomId, roomIdBase62, serverHost}: ChatRoomProps) {
    const firstRender = useRef(true);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const chatMessageInputRef = createRef<HTMLTextAreaElement>();
    const [message, setMessage] = useState<string>('');
    const chatImageInputRef = createRef<HTMLInputElement>();
    const [chatLargeImage, setChatLargeImage] = useState<string|ArrayBuffer|null>(null);
    const [chatSmallImage, setChatSmallImage] = useState<string|ArrayBuffer|null>(null);
    const [chatDetailImageId, setChatDetailImageId] = useState<string>('');

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            dispatch(setIsProd(isProd));
        }

    }, [firstRender, dispatch, isProd]);
    //#endregion

    const enterChatRoom = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(roomId)) {
            alert('채팅방 정보 없음');
        } else if (isEmpty(user.name)) {
            alert('대화명을 입력해 주세요.');
        } else if (10 < user.name.length) {
            alert('대화명은 10글자 이내로 입력해주세요.');
        } else {
            dispatch(enterChatRoomReq(roomId));
        }
    }, [webSocket, user, dispatch, roomId]);

    const enterUser = useCallback(() => {
        const currentChatRoom = chat.chatRooms.find(_ => _.roomId == roomId);

        if (!currentChatRoom)
            return <NotFoundChatRoom />;

        return (
            <div className={styles.chatRoomEnterWrapper}>
                <div className={styles.chatRoomInputNotice}>
                    {isProd ? `'${currentChatRoom.roomName}' 채팅방에 입장하시겠습니까?` : ''}
                </div>
                <div className={styles.enterChatRoomButtonWrapper}>
                    <button className={`${styles.enterChatRoomButton} ${stylesCommon.button}`} onClick={enterChatRoom}>입장</button>
                </div>
            </div>
        );
    }, [isProd, chat, enterChatRoom]);

    const contents = useCallback(() => {
        if (isEmpty(roomId))
            return <NotFoundChatRoom />;

        const currentChatRoom = chat.chatRooms.find(_ => _.roomId == roomId);

        if (!currentChatRoom)
            return <NotFoundChatRoom />;

        if (isEmpty(chat.currentChatRoomId) || roomId != chat.currentChatRoomId)
            return enterUser();

        return (
            <>
                <ChatContents serverHost={serverHost} setChatDetailImageId={setChatDetailImageId} />
                <ChatInput
                    chatImageInputRef={chatImageInputRef}
                    chatMessageInputRef={chatMessageInputRef}
                    message={message}
                    setMessage={setMessage}
                    setChatSmallImage={setChatSmallImage}
                    setChatLargeImage={setChatLargeImage}
                />
            </>
        );
    }, [chat, enterUser, serverHost, roomId, chatImageInputRef, chatMessageInputRef, message]);

    return (
        <>
            <ChatImageDetailDialog
                chatDetailImageId={chatDetailImageId}
                setChatDetailImageId={setChatDetailImageId}
                serverHost={serverHost} />
            <ChatImageInputDialog
                chatImageInputRef={chatImageInputRef}
                setChatSmallImage={setChatSmallImage}
                setChatLargeImage={setChatLargeImage}
                chatSmallImage={chatSmallImage}
                chatLargeImage={chatLargeImage} />
            {contents()}
        </>
    );
}

ChatRoom.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            <DefaultLayout>{page}</DefaultLayout>
        </Layout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { roomId } = context.query;
    const isProd = ("production" === process.env.NODE_ENV);
    if (!roomId || isEmpty(roomId)) {
        return {
            props: {
                isProd: isProd,
                roomId: '',
                roomName: ''
            }
        };
    }

    let roomUUID: string = '';
    try {
        roomUUID = Helpers.getUUIDFromBase62(roomId as string ?? '');
    } catch (error) {
        if (!isProd)
            console.error(error);
    }
    const serverHost = process.env.SERVER_HOST ?? 'localhost:8080';
    const serverHostProp = ('production' === process.env.NODE_ENV ? 'https://' : 'http://') + serverHost;
    // let roomNameProp: string = '';
    // let roomOpenTypeProp: Defines.RoomOpenType = Defines.RoomOpenType.PRIVATE;
    //
    // const url = serverHostProp + "/api/room/" + roomUUID;
    // try {
    //     const response = await fetch(`${url}`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' }
    //     });
    //
    //     if (200 == response.status) {
    //         const json = await response.json();
    //         if (json.roomId && json.roomName) {
    //             roomNameProp = json.roomName;
    //             roomOpenTypeProp = json.roomOpenType;
    //         }
    //     }
    // } catch (error) {
    //     console.error(error);
    // }

    return {
        props: {
            isProd: ("production" === process.env.NODE_ENV),
            roomId: roomUUID,
            roomIdBase62: roomId,
            serverHost: serverHostProp
            // roomName: roomNameProp,
            // roomOpenType: roomOpenTypeProp,
        }
    };
}

export default ChatRoom;