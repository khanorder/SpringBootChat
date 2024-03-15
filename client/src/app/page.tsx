'use client';
import styles from './page.module.css'
import {ChangeEvent, KeyboardEventHandler, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {v4 as uuid} from 'uuid';
import {Helpers} from "@/helpers";
import {Defines} from "@/defines";
import {Errors} from "@/defines/errors";
import {Domains} from "@/domains";
import UpdateChatRoomRes = Domains.UpdateChatRoomRes;
import ChatRoom = Domains.ChatRoom;

export default function Home() {
    const firstRender = useRef(true);
    const [chatSocket, setWebsocket] = useState<WebSocket|null>(null);
    const [socketState, setSocketState] = useState<0|1|2|3>(WebSocket.CLOSED);
    const [chatRoomId, setChatRoomId] = useState<string>('');
    const [chatRoomName, setChatRoomName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [chatRoomList, setChatRoomList] = useState<Domains.ChatRoom[]>([]);
    const [chatDatas, setChatDatas] = useState<Map<string, Domains.Chat[]>>(new Map());
    const [message, setMessage] = useState<string>('');

    const connect = useCallback(() => {
        setSocketState(WebSocket.CONNECTING);
        if (null == chatSocket || WebSocket.CLOSED === socketState) {
            setUserName('');
            setChatRoomId('');
            setChatRoomName('');
            setChatRoomList([]);
            const newChatSocket = new WebSocket('ws://localhost:8080/ws/chat');
            newChatSocket.binaryType = 'arraybuffer';

            newChatSocket.onopen = function (e) {
                console.log('open server!')
                setSocketState(WebSocket.OPEN);
            };

            newChatSocket.onclose=function(e){
                console.log('disconnect');
                setSocketState(WebSocket.CLOSED);
            }

            newChatSocket.onerror = function (e){
                console.log(e);
                setSocketState(WebSocket.CLOSING);
            }

            //메세지 수신했을 때 이벤트.
            newChatSocket.onmessage = function (e) {
                const start = new Date();
                console.log("start: " + start.getTime() + " " + start.getMilliseconds())
                console.log(e.data);
                if (e.data instanceof ArrayBuffer) {
                    const byteLen = e.data.byteLength;
                    if (1 < byteLen) {
                        const flag= new Uint8Array(e.data, 0, 1);
                        console.log(Defines.PacketType[flag[0]]);
                        switch (flag[0]) {
                            case Defines.PacketType.CREATE_CHAT_ROOM:
                                const createChatRoomRes = Domains.CreateChatRoomRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, 17));
                                if (null == createChatRoomRes) {
                                    alert('데이터 형식 오류.');
                                    return;
                                }

                                switch (createChatRoomRes.result) {
                                    case Errors.CreateChatRoom.NONE:
                                        setChatRoomId(createChatRoomRes.roomId);
                                        break;

                                    case Errors.CreateChatRoom.EXISTS_ROOM:
                                        alert('이미 개설된 채팅방 이름입니다.');
                                        break;
                                }
                                break;

                            case Defines.PacketType.UPDATE_CHAT_ROOM:
                                const updateChatRoomRes= Domains.UpdateChatRoomRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));
                                setChatRoomList([]);
                                if (null != updateChatRoomRes && 0 < updateChatRoomRes.roomIds.length) {
                                    const list: ChatRoom[] = [];
                                    for (let i = 0; i < updateChatRoomRes.roomIds.length; i++) {
                                       list.push(new ChatRoom(updateChatRoomRes.roomIds[i], updateChatRoomRes.roomNames[i]));

                                    }
                                    setChatRoomList(list);
                                }
                                break;

                            case Defines.PacketType.ENTER_CHAT_ROOM:
                                const enterChatRoomRes = Domains.EnterChatRoomRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));
                                console.log(enterChatRoomRes)
                                if (null == enterChatRoomRes) {
                                    alert('데이터 형식 오류.');
                                    return;
                                }

                                switch (enterChatRoomRes.result) {
                                    case Errors.EnterChatRoom.NONE:
                                        setChatRoomId(enterChatRoomRes.roomId);
                                        const chatRoom = chatRoomList.find(_ => _.roomId == enterChatRoomRes.roomId);
                                        setChatRoomName(chatRoom?.roomName ?? '');
                                        break;

                                    case Errors.EnterChatRoom.NO_EXISTS_ROOM:
                                        alert('그런 채팅방은 없습니다..');
                                        break;

                                    case Errors.EnterChatRoom.ALREADY_IN_ROOM:
                                        alert('이미 입장한 채팅방 입니다.');
                                        break;
                                }
                                break;

                            case Defines.PacketType.EXIT_CHAT_ROOM:
                                const exitChatRoomRes = Domains.ExitChatRoomRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));
                                console.log(exitChatRoomRes)
                                if (null == exitChatRoomRes) {
                                    alert('데이터 형식 오류.');
                                    return;
                                }

                                switch (exitChatRoomRes.result) {
                                    case Errors.ExitChatRoom.NONE:
                                        break;
                                        
                                    case Errors.ExitChatRoom.ROOM_REMOVED:
                                        alert('삭제된 채팅방입니다.');
                                        break;
                                        
                                    case Errors.ExitChatRoom.NO_EXISTS_ROOM:
                                        alert('그 채팅방은 없습니다.');
                                        break;
                                        
                                    case Errors.ExitChatRoom.NOT_IN_ROOM:
                                        alert('현재 그 채팅방에 입장중이 아닙니다.');
                                        break;

                                    case Errors.ExitChatRoom.FAILED_TO_EXIT:
                                        alert('채팅방 나가기 실패.');
                                        break;
                                }
                                setChatRoomId('');
                                setChatRoomName('');
                                setUserName('');
                                break;

                            case Defines.PacketType.NOTICE_ENTER_CHAT_ROOM:
                                const noticeEnterChatRoomRes = Domains.NoticeEnterChatRoomRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));
                                console.log(noticeEnterChatRoomRes);
                                break;

                            case Defines.PacketType.NOTICE_EXIT_CHAT_ROOM:
                                const noticeExitChatRoomRes = Domains.NoticeExitChatRoomRes.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));
                                console.log(noticeExitChatRoomRes);
                                break;

                            case Defines.PacketType.TALK_CHAT_ROOM:
                                const chatRes = Domains.Chat.decode(new Uint8Array(e.data, 1, byteLen - 1).slice(0, byteLen - 1));
                                console.log(chatRes);
                                break;
                        }
                    }
                } else {

                }
                const end = new Date();
                console.log("end: " + end.getTime() + " " + end.getMilliseconds())
                console.log("elapsed: " + (end.getTime() - start.getTime()));
            }

            setWebsocket(newChatSocket);
        } else {
            console.log('이미 연결중');
        }
    }, [chatSocket, socketState, chatRoomList, setWebsocket, setSocketState, setChatRoomName, setChatRoomId, setUserName, setChatRoomList]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            connect();
        }

    }, [firstRender, socketState, connect]);
    //#endregion

    const createChatRoom = useCallback(() => {
        if (null == chatSocket) {
            alert('연결 안됨');
        } else if ('' == chatRoomName) {
            alert('채팅방 정보를 입력해주세요.');
        } else if ('' == userName) {
            alert('대화명을 입력해주세요.');
        } else if ('' != chatRoomId) {
            alert('이미 채팅방에 들어와 있습니다.');
        } else {
            const flag = new Uint8Array(1);
            flag[0] = Defines.PacketType.CREATE_CHAT_ROOM;
            const bytesChatRoomName = new Uint8Array(Buffer.from(chatRoomName.trim(), 'utf-8'));
            const bytesUserName = new Uint8Array(Buffer.from(userName.trim(), 'utf-8'));
            const bytesChatRoomNameLength = Helpers.getByteArrayFromInt(bytesChatRoomName.byteLength);
            const bytesUserNameLength = Helpers.getByteArrayFromInt(bytesUserName.byteLength);
            const packet = new Uint8Array(flag.byteLength + 8 + bytesChatRoomName.byteLength + bytesUserName.byteLength);
            packet.set(flag);
            packet.set(bytesChatRoomNameLength, flag.byteLength);
            packet.set(bytesUserNameLength, flag.byteLength + 4);
            packet.set(bytesChatRoomName, flag.byteLength + 8);
            packet.set(bytesUserName, flag.byteLength + 8 + bytesChatRoomName.byteLength);
            chatSocket.send(packet);
        }
    }, [chatSocket, chatRoomId, chatRoomName, userName]);

    const enterChatRoom = useCallback((enterChatRoomId: string) => {
        if (null == chatSocket) {
            alert('연결 안됨');
        } else if ('' == enterChatRoomId) {
            alert('채팅방 정보 없음');
        } else if ('' == userName) {
            alert('대화명을 입력해 주세요.');
        } else {
            const flag = new Uint8Array(1);
            flag[0] = Defines.PacketType.ENTER_CHAT_ROOM;
            const bytesChatRoomId = Helpers.getByteArrayFromUUID(enterChatRoomId.trim());
            const bytesUserName = new Uint8Array(Buffer.from(userName.trim(), 'utf8'));
            const packet = new Uint8Array(flag.byteLength + bytesChatRoomId.byteLength + bytesUserName.byteLength);
            packet.set(flag);
            packet.set(bytesChatRoomId, flag.byteLength);
            packet.set(bytesUserName, flag.byteLength + bytesChatRoomId.byteLength);
            chatSocket.send(packet);
        }
    }, [chatSocket, userName]);

    const exitChatRoom = useCallback(() => {
        if (null == chatSocket) {
            alert('연결 안됨');
        } else if ('' == chatRoomId) {
            alert('채팅방 정보 없음');
        } else {
            const flag = new Uint8Array(1);
            flag[0] = Defines.PacketType.EXIT_CHAT_ROOM;
            const message = Helpers.getByteArrayFromUUID(chatRoomId);
            const packet = new Uint8Array(flag.byteLength + message.byteLength);
            packet.set(flag);
            packet.set(message, flag.byteLength);
            chatSocket.send(packet);
        }
    }, [chatSocket, chatRoomId]);

    const sendMessage = useCallback(() => {
        if (null == chatSocket) {
            alert('연결 안됨');
        } else if ('' == chatRoomId) {
            alert('메세지를 보낼 채팅방에 입장해주세요.');
        } else if ('' == userName) {
            alert('대화명을 입력해 주세요.');
        } else {
            const flag = new Uint8Array(1);
            flag[0] = Defines.PacketType.TALK_CHAT_ROOM;
            const bytesChatRoomId = Helpers.getByteArrayFromUUID(chatRoomId.trim());
            const bytesUserName = new Uint8Array(Buffer.from(userName.trim(), 'utf8'));
            const bytesMessage = new Uint8Array(Buffer.from(message.trim(), 'utf8'));
            const bytesMessageByteLength = Helpers.getByteArrayFromInt(bytesMessage.byteLength);

            const packet = new Uint8Array(flag.byteLength + bytesChatRoomId.byteLength + 5 + bytesUserName.byteLength + bytesMessage.byteLength);
            console.log(packet.byteLength)
            packet.set(flag);
            packet.set(bytesChatRoomId, flag.byteLength);
            packet[17] = bytesUserName.byteLength;
            packet.set(bytesMessageByteLength, flag.byteLength + 17);
            packet.set(bytesUserName, flag.byteLength + 21);
            packet.set(bytesMessage, flag.byteLength + 21 + bytesUserName.byteLength);
            chatSocket.send(packet);
            setMessage('');
        }
    }, [chatSocket, chatRoomId, userName, message, setMessage]);

    const onKeyUpChatRoomName = useCallback((e: any) => {
        if (e.key == 'Enter')
            createChatRoom();
    }, [createChatRoom]);

    const changeChatRoomName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setChatRoomName(e.target.value ? e.target.value.trim() : '');
    }, [setChatRoomName]);

    const onKeyUpUserName = useCallback((e: any) => {
        if (e.key == 'Enter')
            createChatRoom();
    }, [createChatRoom]);

    const changeUserName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value ? e.target.value.trim() : '');
    }, [setUserName]);

    const onKeyUpMessage = useCallback((e: any) => {
        if (e.key == 'Enter')
            sendMessage();
    }, [sendMessage]);

    const changeMessage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value ? e.target.value.trim() : '');
    }, [setMessage]);

    const chatRooms = useCallback(() => {
        if (null == chatRoomList || 1 > chatRoomList.length) {
            return (
                <ul>
                    <li style={{ textAlign: 'center', listStyle: 'none' }}>없습니다.</li>
                </ul>
            );
        } else {
            const list: ReactElement[] = [];
            for (let i = 0; i < chatRoomList.length; i++) {
                list.push(<li key={i} style={{ listStyle: 'none' }}><strong>[{i + 1}]</strong> <button onClick={e => enterChatRoom(chatRoomList[i].roomId)}>입장</button> {chatRoomList[i].roomName}</li>)
            }

            return (
                <ul>{list}</ul>
            );
        }
    }, [chatRoomList, enterChatRoom]);

    const contents = useCallback(() => {
        return (
            <div>
                {
                    chatSocket && WebSocket.OPEN === socketState
                        ?
                        (
                            '' == chatRoomId
                                ?
                                <>
                                    <input value={userName} onKeyUp={e => onKeyUpUserName(e)} onChange={e => changeUserName(e)} placeholder={'대화명'} />
                                    &nbsp;
                                    <input value={chatRoomName} onKeyUp={e => onKeyUpChatRoomName(e)} onChange={e => changeChatRoomName(e)} placeholder={'채팅방 이름'} />
                                    &nbsp;
                                    <button onClick={createChatRoom}>만들기</button>
                                    <div style={{ marginTop: 20 }}>
                                        {chatRooms()}
                                    </div>
                                </>
                                :
                                <>
                                    <input value={message} onKeyUp={e => onKeyUpMessage(e)} onChange={e => changeMessage(e)} placeholder={'메세지를 입력해 주세요.'}/>
                                    <button onClick={sendMessage}>전송</button>
                                    &nbsp;
                                    <button onClick={exitChatRoom}>나가기</button>
                                </>
                        )
                        :
                        <button onClick={connect}>연결</button>
                }
            </div>
        );
    }, [chatSocket, socketState, chatRoomId, chatRoomName, userName, changeChatRoomName, changeUserName, createChatRoom, connect, message, sendMessage, chatRooms, exitChatRoom, changeMessage]);

    return (
        <main className={styles.main}>
            {contents()}
        </main>
    )
}