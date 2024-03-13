'use client';
import Image from 'next/image'
import styles from './page.module.css'
import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import { v4 as uuid } from 'uuid';
import {instanceOf} from "prop-types";
import {Helpers} from "@/helpers";
import {Defines} from "@/defines";
import {Errors} from "@/defines/errors";

export default function Home() {
    const firstRender = useRef(true);
    const [websoket, setWebsocket] = useState<WebSocket|null>(null);
    const [socketState, setSocketState] = useState<0|1|2|3>(WebSocket.CLOSED);
    const [chatRoomId, setChatRoomId] = useState<string>('');
    const [chatRoomName, setChatRoomName] = useState<string>('');

    const connect = useCallback(() => {
        setSocketState(WebSocket.CONNECTING);
        if (null == websoket || WebSocket.CLOSED === socketState) {
            const newsocket = new WebSocket('ws://localhost:8080/ws/chat');
            newsocket.binaryType = 'arraybuffer';

            newsocket.onopen = function (e) {
                console.log('open server!')
                setSocketState(WebSocket.OPEN);
            };

            newsocket.onclose=function(e){
                console.log('disconnet');
                setSocketState(WebSocket.CLOSED);
            }

            newsocket.onerror = function (e){
                console.log(e);
                setSocketState(WebSocket.CLOSING);
            }

            //메세지 수신했을 때 이벤트.
            newsocket.onmessage = function (e) {
                console.log(e.data);
                if (e.data instanceof ArrayBuffer) {
                    var byteLen = e.data.byteLength;
                    if (1 < byteLen) {
                        var flags = new Uint8Array(e.data, 0, 2);
                        console.log(flags);
                        switch (flags[0]) {
                            case Defines.PacketType.CREATE_CHAT_ROOM:
                                switch (flags[1]) {
                                    case Errors.CreateChatRoom.NONE:
                                        const bytesRoomId = new Uint8Array(e.data, 2, byteLen - 2);
                                        const roomId = Helpers.uuidFromByteArray(bytesRoomId);
                                        setChatRoomId(roomId);
                                        setChatRoomName('');
                                        break;

                                    case Errors.CreateChatRoom.EXISTS_ROOM:
                                        alert('이미 개설된 채팅방 이름입니다.');
                                        break;
                                }
                                break;


                            case Defines.PacketType.UPDATE_CHAT_ROOM:
                                break;

                            case Defines.PacketType.ENTER_CHAT_ROOM:
                                break;

                            case Defines.PacketType.EXIT_CHAT_ROOM:
                                break;
                        }
                    }
                } else {

                }
            }

            setWebsocket(newsocket);
        } else {
            console.log('이미 연결중');
        }
    }, [websoket, socketState, setWebsocket, setSocketState, setChatRoomName, setChatRoomId]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            connect();
        }

    }, [firstRender, socketState, connect]);
    //#endregion

    const changeChatRoomName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setChatRoomName(e.target.value ?? '');
    }, [setChatRoomName])

    const createChatRoom = useCallback(() => {
        if (null == websoket) {
            alert('연결 안됨');
        } else if ('' == chatRoomName) {
            alert('채팅방 정보를 입력해주세요.');
        } else if ('' != chatRoomId) {
            alert('이미 채팅방에 들어와 있습니다.');
        } else {
            const flag = new Uint8Array(1);
            flag[0] = Defines.PacketType.CREATE_CHAT_ROOM;
            const message = new Uint8Array(Buffer.from(chatRoomName ?? '', 'utf-8'));
            const packet = new Uint8Array(flag.length + message.length);
            packet.set(flag);
            packet.set(message, flag.length);
            websoket.send(packet);
        }
    }, [websoket, chatRoomId, chatRoomName]);

    const exitChatRoom = useCallback(() => {
        if (null == websoket) {
            alert('연결 안됨');
        } else if ('' == chatRoomId) {
            alert('채팅방 정보 없음');
        } else {
            console.log(chatRoomId);
            const flag = new Uint8Array(1);
            flag[0] = Defines.PacketType.EXIT_CHAT_ROOM;
            const message = Helpers.byteArrayFromUUID(chatRoomId);
            const packet = new Uint8Array(flag.length + message.length);
            packet.set(flag);
            packet.set(message, flag.length);
            websoket.send(packet);
        }
    }, [websoket, chatRoomId]);

    const sendMsg = useCallback(() => {
        console.log(websoket?.readyState)
        if (null == websoket) {
            alert('연결 안됨');
        } else {
            // var buffer = Buffer.from(JSON.stringify(talkMsg), 'utf-8');
            // console.log(buffer);
            // socket.send(JSON.stringify(talkMsg));
            var talkMsg={"type" : "TALK","roomId":uuid() ,"sender":"chee","message": 'test'};
            // websoket.send(JSON.stringify(talkMsg));
            // const test = { "flag": 2, "message": "test"};
            // const testPacket = new Uint8Array(Buffer.from(JSON.stringify(test), 'utf-8'));
            // console.log(testPacket);
            const message = new Uint8Array(Buffer.from('테스트', 'utf-8'));
            let flag = new Uint8Array(1);
            flag[0] = 1;
            const packet = new Uint8Array(flag.length + message.length);
            packet.set(flag);
            packet.set(message, flag.length);
            console.log(packet);
            websoket.send(packet);
            // let a = new Uint16Array(2);
            // a[0] = 65535;
            // a[1] = 127;
            // socket.send(a);
        }
    }, [websoket]);

    const contents = useCallback(() => {
        return (
            <div>
                {
                    websoket && WebSocket.OPEN === socketState
                        ?
                        (
                            '' == chatRoomId
                                ?
                                <>
                                    <input value={chatRoomName} onChange={e => changeChatRoomName(e)} placeholder={'채팅방 이름'} />
                                    &nbsp;
                                    <button onClick={createChatRoom}>만들기</button>
                                </>
                                :
                                <>
                                    <button onClick={exitChatRoom}>나가기</button>
                                    &nbsp;
                                    <button onClick={sendMsg}>전송</button>
                                </>
                        )
                        :
                        <button onClick={connect}>연결</button>
                }
            </div>
        );
    }, [websoket, socketState, chatRoomId, chatRoomName, changeChatRoomName, createChatRoom, connect, sendMsg]);

    return (
        <main className={styles.main}>
            {contents()}
        </main>
    )
}