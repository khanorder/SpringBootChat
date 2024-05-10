import {Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import {Defines} from "@/defines";
import dynamic from "next/dynamic";
import styles from "@/styles/settings.module.sass";
import isEmpty from "lodash/isEmpty";
const ChatEditProfile = dynamic(() => import("@/components/chatContents/chatEditProfile"), { ssr: false });

export interface PanelEditProfileProps {
    isOpenItem: boolean;
    profileImageInputRef: RefObject<HTMLInputElement>;
    setProfileImageMime: Dispatch<SetStateAction<Defines.AllowedImageType>>;
    setProfileSmallImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    setProfileLargeImage: Dispatch<SetStateAction<string|ArrayBuffer|null>>;
    profileImageMime: Defines.AllowedImageType;
    profileSmallImage: string|ArrayBuffer|null;
    profileLargeImage: string|ArrayBuffer|null;
    className?: string;
}

export default function PanelEditProfile({ isOpenItem, profileImageInputRef, setProfileImageMime, setProfileSmallImage, setProfileLargeImage, profileImageMime, profileSmallImage, profileLargeImage, className }: PanelEditProfileProps) {
    const firstRender = useRef(true);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const panel = useCallback(() => {
        let panelClass: string = styles.itemPanel;

        if (isOpenItem)
            panelClass += ` ${styles.opened}`;

        if (!isEmpty(className))
            panelClass += ` ${className}`;

        return (
            <div className={panelClass}>
                <ChatEditProfile
                    profileImageInputRef={profileImageInputRef}
                    setProfileImageMime={setProfileImageMime}
                    setProfileSmallImage={setProfileSmallImage}
                    setProfileLargeImage={setProfileLargeImage}
                    profileImageMime={profileImageMime}
                    profileSmallImage={profileSmallImage}
                    profileLargeImage={profileLargeImage}/>
            </div>
        );
    }, [isOpenItem, className, profileImageInputRef, setProfileImageMime, setProfileSmallImage, setProfileLargeImage, profileImageMime, profileSmallImage, profileLargeImage]);

    return panel();
}