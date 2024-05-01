import {createRef, useEffect, useRef, useState} from "react";
import {Defines} from "@/defines";
import dynamic from "next/dynamic";
const LayoutSlideDialog = dynamic(() => import("@/components/layouts/dialogSlide"), { ssr: false });
const ChatEditProfile = dynamic(() => import("@/components/chatContents/chatEditProfile"), { ssr: false });
const DialogProfileImageInput = dynamic(() => import("@/components/dialogs/dialogProfileImageInput"), { ssr: false });

export default function DialogProfile() {
    const firstRender = useRef(true);
    const profileImageInputRef = createRef<HTMLInputElement>();
    const [profileImageMime, setProfileImageMime] = useState<Defines.AllowedImageType>(Defines.AllowedImageType.NONE);
    const [profileLargeImage, setProfileLargeImage] = useState<string|ArrayBuffer|null>(null);
    const [profileSmallImage, setProfileSmallImage] = useState<string|ArrayBuffer|null>(null);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    return (
        <>
            <DialogProfileImageInput
                profileImageInputRef={profileImageInputRef}
                setProfileImageMime={setProfileImageMime}
                setProfileSmallImage={setProfileSmallImage}
                setProfileLargeImage={setProfileLargeImage}
                profileImageMime={profileImageMime}
                profileSmallImage={profileSmallImage}
                profileLargeImage={profileLargeImage}/>
            <LayoutSlideDialog type={Defines.SlideDialogType.PROFILE}>
                <ChatEditProfile
                    profileImageInputRef={profileImageInputRef}
                    setProfileImageMime={setProfileImageMime}
                    setProfileSmallImage={setProfileSmallImage}
                    setProfileLargeImage={setProfileLargeImage}
                    profileImageMime={profileImageMime}
                    profileSmallImage={profileSmallImage}
                    profileLargeImage={profileLargeImage}/>
            </LayoutSlideDialog>
        </>
    );
}