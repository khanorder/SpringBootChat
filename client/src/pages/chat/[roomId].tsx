import {createRef, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {GetServerSideProps} from "next";
import styles from "@/styles/chatRoom.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {enterChatRoomReq} from "@/stores/reducers/webSocket";
import {Helpers} from "@/helpers";
import dynamic from "next/dynamic";
import {setIsProd} from "@/stores/reducers/appConfigs";
import {Defines} from "@/defines";
const Layout = dynamic(() => import("@/components/layouts"), { ssr: false });
const DefaultLayout = dynamic(() => import("@/components/layouts/default"), { ssr: false });
const ChatInput = dynamic(() => import("@/components/chatContents/chatInput"), { ssr: false });
const ChatNotFound = dynamic(() => import("@/components/chatContents/chatNotFound"), { ssr: false });
const ChatContents = dynamic(() => import("@/components/chatContents/chatContents"), { ssr: false });
const DialogAddUserChatRoom = dynamic(() => import("@/components/dialogs/dialogAddUserChatRoom"), {ssr: false});
const DialogChatRoomInfo = dynamic(() => import("@/components/dialogs/dialogChatRoomInfo"), {ssr: false});
const DialogChatImageInput = dynamic(() => import("@/components/dialogs/dialogChatImageInput"), { ssr: false });
const DialogChatDetailImage = dynamic(() => import("@/components/dialogs/dialogChatDetailImage"), { ssr: false });
const DialogImojiInput = dynamic(() => import("@/components/dialogs/dialogImojiInput"), { ssr: false });

interface ChatRoomProps {
    isProd: boolean;
    roomId: string;
    roomIdBase62: string;
    serverHost: string;
}

function ChatRoom({isProd, roomId, serverHost}: ChatRoomProps) {
    const firstRender = useRef(true);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const chatMessageInputRef = createRef<HTMLTextAreaElement>();
    const [message, setMessage] = useState<string>('');
    const chatImageInputRef = createRef<HTMLInputElement>();
    const [chatImageMime, setChatImageMime] = useState<Defines.AllowedImageType>(Defines.AllowedImageType.NONE);
    const [chatLargeImage, setChatLargeImage] = useState<string|ArrayBuffer|null>(null);
    const [chatSmallImage, setChatSmallImage] = useState<string|ArrayBuffer|null>(null);

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
        } else {
            dispatch(enterChatRoomReq(roomId));
        }
    }, [webSocket, user, dispatch, roomId]);

    const enterUser = useCallback(() => {
        const currentChatRoom = chat.chatRooms.find(_ => _.roomId == roomId);

        if (!currentChatRoom)
            return <ChatNotFound />;

        return (
            <div className={styles.chatRoomEnterWrapper}>
                <div className={styles.chatRoomInputNotice}>
                    {`'${currentChatRoom.roomName}' 채팅방에 입장하시겠습니까?`}
                </div>
                <div className={styles.enterChatRoomButtonWrapper}>
                    <button className={`${styles.enterChatRoomButton} ${stylesCommon.button}`} onClick={enterChatRoom}>입장</button>
                </div>
            </div>
        );
    }, [isProd, chat, enterChatRoom]);

    const contents = useCallback(() => {
        if (isEmpty(roomId))
            return <ChatNotFound />;

        const currentChatRoom = chat.chatRooms.find(_ => _.roomId == roomId);

        if (!currentChatRoom)
            return <ChatNotFound />;

        if (isEmpty(chat.currentChatRoomId) || roomId != chat.currentChatRoomId)
            return enterUser();

        return (
            <>
                <ChatContents />
                <DialogImojiInput chatMessageInputRef={chatMessageInputRef} message={message} setMessage={setMessage} />
                <ChatInput
                    chatImageInputRef={chatImageInputRef}
                    chatMessageInputRef={chatMessageInputRef}
                    message={message}
                    setMessage={setMessage}
                    setChatImageMime={setChatImageMime}
                    setChatSmallImage={setChatSmallImage}
                    setChatLargeImage={setChatLargeImage}
                />
            </>
        );
    }, [chat, enterUser, roomId, chatImageInputRef, chatMessageInputRef, message]);

    return (
        <>
            <DialogAddUserChatRoom/>
            <DialogChatRoomInfo/>
            <DialogChatDetailImage />
            <DialogChatImageInput
                chatImageInputRef={chatImageInputRef}
                setChatImageMime={setChatImageMime}
                setChatSmallImage={setChatSmallImage}
                setChatLargeImage={setChatLargeImage}
                chatImageMime={chatImageMime}
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

    return {
        props: {
            isProd: ("production" === process.env.NODE_ENV),
            roomId: roomUUID,
            roomIdBase62: roomId,
            serverHost: serverHostProp
        }
    };
}

export default ChatRoom;