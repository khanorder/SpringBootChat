'use client';
import styles from './page.module.css'
import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import {v4 as uuid} from 'uuid';
import {Helpers} from "@/helpers";
import {Defines} from "@/defines";
import {Errors} from "@/defines/errors";
import {PacketType, RoomId, UpdateChatRoom} from '../domain';
import * as flatbuffers from 'flatbuffers';

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
                const start = new Date();
                console.log("start: " + start.getTime() + " " + start.getMilliseconds())
                console.log(e.data);
                if (e.data instanceof ArrayBuffer) {
                    const byteLen = e.data.byteLength;
                    if (1 < byteLen) {
                        const flag= new Uint8Array(e.data, 0, 1);
                        console.log(flag);
                        switch (flag[0]) {
                            case Defines.PacketType.CREATE_CHAT_ROOM:
                                const result = new Uint8Array(e.data, 1, 1);
                                switch (result[0]) {
                                    case Errors.CreateChatRoom.NONE:
                                        const bytesRoomId = new Uint8Array(e.data, 2, byteLen - 2);
                                        const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                                        setChatRoomId(roomId);
                                        setChatRoomName('');
                                        break;

                                    case Errors.CreateChatRoom.EXISTS_ROOM:
                                        alert('이미 개설된 채팅방 이름입니다.');
                                        break;
                                }
                                break;

                            case Defines.PacketType.UPDATE_CHAT_ROOM:
                                const roomCountBytes = new Uint8Array(e.data, 1, 4);
                                const roomCount = Helpers.getIntFromByteArray(roomCountBytes);
                                // console.log("roomCount: " + roomCount);
                                // console.log("roomCountBytes: " + JSON.stringify(roomCountBytes));
                                const roomIds: string[] = [];
                                const roomNames: string[] = [];
                                const roomNameLengths: number[] = [];
                                for (let i = 0; i < roomCount; i++) {
                                    let roomIdBytes = new Uint8Array(e.data, 5 + (i * 16), 16);
                                    let roomId = Helpers.getUUIDFromByteArray(roomIdBytes);
                                    roomIds.push(roomId);
                                    let roomNameLengthBytes = new Uint8Array(e.data, (5 + roomCount * 16) + i, 1);
                                    let roomNameLength = roomNameLengthBytes[0];
                                    roomNameLengths.push(roomNameLength);
                                    let roomNameBytesOffset = 0;
                                    if (0 < roomNameLengths.length && 0 < i) {
                                        let prevRoomNameLengths = roomNameLengths.slice(0, i);
                                        if (0 < prevRoomNameLengths.length)
                                            roomNameBytesOffset = prevRoomNameLengths.reduce((p, c) => p + c);
                                    }
                                    let roomNameBytes = new Uint8Array(e.data, (5 + (roomCount * 16) + roomCount + roomNameBytesOffset), roomNameLengths[i]);
                                    let roomName =  new TextDecoder().decode(roomNameBytes);
                                    roomNames.push(roomName);
                                    // console.log(`roomId[${i}]: ` + roomId);
                                    // console.log(`roomIdBytes[${i}]: ` + JSON.stringify(roomIdBytes));
                                    // console.log(`roomName[${i}]: ` + roomName);
                                    // console.log(`roomNameBytes[${i}]: ` + JSON.stringify(roomNameBytes));
                                    // console.log(`roomNameLength[${i}]: ` + roomNameLength);
                                    // console.log(`roomNameLengthBytes[${i}]: ` + JSON.stringify(roomNameLengthBytes));
                                }
                                const updateResult = {
                                    "type": flag[0],
                                    "roomCount": roomCount,
                                    "roomIds": roomIds,
                                    "roomNames": roomNames
                                };
                                console.log(JSON.stringify(updateResult).length);
                                break;

                            case Defines.PacketType.ENTER_CHAT_ROOM:
                                break;

                            case Defines.PacketType.EXIT_CHAT_ROOM:
                                break;
                        }
                    }
                } else {

                }
                const end = new Date();
                console.log("end: " + end.getTime() + " " + end.getMilliseconds())
                console.log("elapsed: " + (end.getTime() - start.getTime()));
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

    const flatbufferDecodeTest = useCallback((bytes: Uint8Array) => {
        const start = new Date();
        console.log("decode start: " + start.getTime());
        let data = UpdateChatRoom.getRootAsUpdateChatRoom(new flatbuffers.ByteBuffer(bytes));
        const end = new Date();
        console.log("decode end: " + end.getTime());
        console.log("decode elapsed: " + (end.getTime() - start.getTime()));
    }, [])

    const flatbufferTest = useCallback(() => {
        const start = new Date();
        console.log("encode start: " + start.getTime());
        let builder = new flatbuffers.Builder();
        let uuid1 = uuid();
        let uuid2 = uuid();
        let id = RoomId.createRoomId(builder, builder.createByteVector(Helpers.getByteArrayFromUUID(uuid1)));
        let id2 = RoomId.createRoomId(builder, builder.createByteVector(Helpers.getByteArrayFromUUID(uuid2)));
        let name = builder.createString("test");
        let name2 = builder.createString("배장호");
        let ids = UpdateChatRoom.createRoomIdsVector(builder,[id, id2]);
        let names = UpdateChatRoom.createRoomNamesVector(builder,[name, name2]);
        let updateChatRoom = UpdateChatRoom.createUpdateChatRoom(builder, PacketType.UPDATE_CHAT_ROOM, ids, names);
        builder.finish(updateChatRoom);
        let buf = builder.asUint8Array();
        const end = new Date();
        console.log("encode end: " + end.getTime());
        console.log("encode elapsed: " + (end.getTime() - start.getTime()));
        flatbufferDecodeTest(buf);
    }, [flatbufferDecodeTest])

    const binaryDecodeTest = useCallback((bytes: Uint8Array) => {
        const start = new Date();
        console.log("decode start: " + start.getTime());
        const roomCountBytes = new Uint8Array(bytes, 1, 4);
        const roomCount = Helpers.getIntFromByteArray(roomCountBytes);
        console.log("roomCount: " + roomCount);
        console.log("roomCountBytes: " + JSON.stringify(roomCountBytes));
        const roomIds: string[] = [];
        const roomNames: string[] = [];
        const roomNameLengths: number[] = [];
        for (let i = 0; i < roomCount; i++) {
            let roomIdBytes = new Uint8Array(bytes, 5 + (i * 16), 16);
            let roomId = Helpers.getUUIDFromByteArray(roomIdBytes);
            roomIds.push(roomId);
            let roomNameLengthBytes = new Uint8Array(bytes, (5 + roomCount * 16) + i, 1);
            let roomNameLength = roomNameLengthBytes[0];
            roomNameLengths.push(roomNameLength);
            let roomNameBytesOffset = 0;
            if (0 < roomNameLengths.length && 0 < i) {
                let prevRoomNameLengths = roomNameLengths.slice(0, i);
                if (0 < prevRoomNameLengths.length)
                    roomNameBytesOffset = prevRoomNameLengths.reduce((p, c) => p + c);
            }
            let roomNameBytes = new Uint8Array(bytes, (5 + (roomCount * 16) + roomCount + roomNameBytesOffset), roomNameLengths[i]);
            let roomName =  new TextDecoder().decode(roomNameBytes);
            roomNames.push(roomName);
        }
        const updateResult = {
            "type": bytes[0],
            "roomCount": roomCount,
            "roomIds": roomIds,
            "roomNames": roomNames
        };
        console.log(updateResult)
        const end = new Date();
        console.log("decode end: " + end.getTime());
        console.log("decode elapsed: " + (end.getTime() - start.getTime()));
    }, [])

    const binaryTest = useCallback(() => {
        const start = new Date();
        console.log("encode start: " + start.getTime());
        let uuid1 = uuid();
        let uuid2 = uuid();
        let idBytes = Helpers.getByteArrayFromUUID(uuid1);
        let idBytes2 = Helpers.getByteArrayFromUUID(uuid2);
        let name = "test";
        let name2 = "배장호";
        let nameBytes = (new TextEncoder).encode(name);
        let nameBytes2 = (new TextEncoder).encode(name2);
        let nameBytesLength = nameBytes.length + nameBytes2.length;
        let updateChatRoom = new Uint8Array(1 + 4 + (16 * 2) + 2 + (nameBytesLength));
        updateChatRoom[0] = Defines.PacketType.UPDATE_CHAT_ROOM;
        let roomCountByte = Helpers.getByteArrayFromInt(2);
        updateChatRoom.set(roomCountByte, 1);
        updateChatRoom.set(idBytes, 5);
        updateChatRoom.set(idBytes2, 21);
        updateChatRoom[37] = nameBytes.length;
        updateChatRoom[38] = nameBytes2.length;
        updateChatRoom.set(nameBytes, 38);
        updateChatRoom.set(nameBytes2, 38 + nameBytes.length);
        console.log(updateChatRoom)
        const end = new Date();
        console.log("encode end: " + end.getTime());
        console.log("encode elapsed: " + (end.getTime() - start.getTime()));
        binaryDecodeTest(updateChatRoom);
    }, [binaryDecodeTest])

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
            const message = Helpers.getByteArrayFromUUID(chatRoomId);
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
                                    <button onClick={flatbufferTest}>Flatbuffers</button>
                                    <button onClick={binaryTest}>Binary</button>
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