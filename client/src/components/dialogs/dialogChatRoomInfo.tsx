import {useEffect, useRef} from "react";
import {Defines} from "@/defines";
import dynamic from "next/dynamic";
const ChatRoomUsers = dynamic(() => import("@/components/chatContents/chatRoomUsers"), { ssr: false });
const LayoutSlideDialog = dynamic(() => import("@/components/layouts/dialogSlide"), { ssr: false });

export default function DialogChatRoomInfo() {
    const firstRender = useRef(true);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    return (
        <LayoutSlideDialog type={Defines.SlideDialogType.ChatRoomInfo}>
            <ChatRoomUsers />
        </LayoutSlideDialog>
    );
}