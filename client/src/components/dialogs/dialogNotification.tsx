import {useEffect, useRef} from "react";
import dynamic from "next/dynamic";
import {Defines} from "@/defines";
const LayoutSlideDialog = dynamic(() => import("@/components/layouts/dialogSlide"), { ssr: false });
const ChatNotifications = dynamic(() => import("@/components/chatContents/chatNotifications"), { ssr: false });

export default function DialogNotification() {
    const firstRender = useRef(true);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    return (
        <LayoutSlideDialog type={Defines.SlideDialogType.NOTIFICATION}>
            <ChatNotifications />
        </LayoutSlideDialog>
    );
}