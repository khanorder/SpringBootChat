import {useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import dynamic from "next/dynamic";
const ChatUsers = dynamic(() => import("@/components/chatContents/chatUsers"), { ssr: false });
const DialogCreateChatRoom = dynamic(() => import("@/components/dialogs/dialogCreateChatRoom"), { ssr: false });

export default function ChatMain() {
    const firstRender = useRef(true);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender, dispatch]);
    //#endregion

    return (
        <>
            <DialogCreateChatRoom/>
            <ChatUsers />
        </>
    );
}