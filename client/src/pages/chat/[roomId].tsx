import {createRef, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {GetServerSideProps} from "next";
import styles from "@/styles/chatRoom.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {enterChatRoomReq} from "@/stores/reducers/webSocket";
import {Helpers} from "@/helpers";
import dynamic from "next/dynamic";
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
const DialogChatDetail = dynamic(() => import("@/components/dialogs/dialogChatDetail"), { ssr: false });

interface ChatRoomProps {
    roomId: string;
    roomIdBase62: string;
    serverHost: string;
}

function ChatRoom({roomId, serverHost}: ChatRoomProps) {
    const firstRender = useRef(true);
    const chat = useAppSelector(state => state.chat);
    const user = useAppSelector(state => state.user);
    const webSocket = useAppSelector(state => state.webSocket);
    const dispatch = useAppDispatch();
    const chatMessageInputRef = createRef<HTMLTextAreaElement>();
    const [message, setMessage] = useState<string>('');
    const chatImageInputRef = createRef<HTMLInputElement>();
    const [chatImageMime, setChatImageMime] = useState<Defines.AllowedImageType>(Defines.AllowedImageType.NONE);
    const [chatOriginalImage, setChatOriginalImage] = useState<string|ArrayBuffer|null>(null);
    const [chatLargeImage, setChatLargeImage] = useState<string|ArrayBuffer|null>(null);
    const [chatSmallImage, setChatSmallImage] = useState<string|ArrayBuffer|null>(null);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const enterChatRoom = useCallback(() => {
        if (!webSocket.socket) {
            alert('연결 안됨');
        } else if (isEmpty(roomId)) {
            alert('채팅방 정보 없음');
        } else {
            dispatch(enterChatRoomReq(roomId));
        }
    }, [webSocket, dispatch, roomId]);

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
    }, [chat, enterChatRoom, roomId]);

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
                <DialogImojiInput chatMessageInputRef={chatMessageInputRef} message={message} setMessage={setMessage} />
                <ChatContents />
                <ChatInput
                    chatImageInputRef={chatImageInputRef}
                    chatMessageInputRef={chatMessageInputRef}
                    message={message}
                    setMessage={setMessage}
                    setChatImageMime={setChatImageMime}
                    setChatSmallImage={setChatSmallImage}
                    setChatLargeImage={setChatLargeImage}
                    setChatOriginalImage={setChatOriginalImage} />
            </>
        );
    }, [chat, enterUser, roomId, chatImageInputRef, chatMessageInputRef, message]);

    return (
        <>
            <DialogChatDetail />
            <DialogAddUserChatRoom/>
            <DialogChatRoomInfo/>
            <DialogChatDetailImage />
            <DialogChatImageInput
                chatImageInputRef={chatImageInputRef}
                setChatImageMime={setChatImageMime}
                setChatSmallImage={setChatSmallImage}
                setChatLargeImage={setChatLargeImage}
                setChatOriginalImage={setChatOriginalImage}
                chatImageMime={chatImageMime}
                chatSmallImage={chatSmallImage}
                chatLargeImage={chatLargeImage}
                chatOriginalImage={chatOriginalImage} />
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
                roomId: '',
                roomName: ''
            }
        };
    }

    let roomUUID: string = '';
    try {
        roomUUID = Helpers.getUUIDFromBase62(roomId as string ?? '');
    } catch (error) {
        if (!isProd) {
            console.error(`roomId: ` + roomId as string);
            console.error(error);
        }
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