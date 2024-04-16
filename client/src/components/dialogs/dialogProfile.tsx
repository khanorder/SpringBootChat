import {useEffect, useRef} from "react";
import {Defines} from "@/defines";
import dynamic from "next/dynamic";
const LayoutSlideDialog = dynamic(() => import("@/components/layouts/dialogSlide"), { ssr: false });
const ChatEditProfile = dynamic(() => import("@/components/chatContents/chatEditProfile"), { ssr: false });

export default function DialogProfile() {
    const firstRender = useRef(true);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    return (
        <LayoutSlideDialog type={Defines.SlideDialogType.Profile}>
            <ChatEditProfile/>
        </LayoutSlideDialog>
    );
}