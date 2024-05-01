import {createRef, ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {useAppSelector} from "@/hooks";
import styles from "@/styles/layout.module.sass";
import {Defines} from "@/defines";
import dynamic from "next/dynamic";
import isEmpty from "lodash/isEmpty";
import {Helpers} from "@/helpers";
import useCurrentUser from "@/components/common/useCurrentUser";
import {CommonAPI} from "@/apis/commonAPI";

const ChatDisconnected = dynamic(() => import("@/components/chatContents/chatDisconnected"), {ssr: false});
const ChatHeader = dynamic(() => import("@/components/chatContents/chatHeader"), {ssr: false});
const DialogProfile = dynamic(() => import("@/components/dialogs/dialogProfile"), {ssr: false});
const DialogNotification = dynamic(() => import("@/components/dialogs/dialogNotification"), {ssr: false});
const DialogSignUp = dynamic(() => import("@/components/dialogs/dialogSignUp"), {ssr: false});
const DialogSignIn = dynamic(() => import("@/components/dialogs/dialogSignIn"), {ssr: false});
const DialogChangeUser = dynamic(() => import("@/components/dialogs/dialogChangeUser"), {ssr: false});
const ChatGNB = dynamic(() => import("@/components/chatContents/chatGNB"), {ssr: false});
const Loading = dynamic(() => import("@/components/common/loading"), {ssr: false});
const AlreadySignIn = dynamic(() => import("@/components/common/alreadySignIn"), {ssr: false});
const ChatSignIn = dynamic(() => import("@/components/chatContents/chatSignIn"), {ssr: false});

export default function Layout({children}: { children: ReactNode }) {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const chat = useAppSelector(state => state.chat);
    const webSocket = useAppSelector(state => state.webSocket);
    const user = useAppSelector(state => state.user);
    const [currentUser] = useCurrentUser();
    const mainWrapper = createRef<HTMLDivElement>();
    const [isCheckSubscription, setIsCheckSubscription] = useState<boolean>(false);

    const handleResize = useCallback(() => {
        if (mainWrapper.current)
            mainWrapper.current.style.height = `${window.innerHeight}px`;

    }, [mainWrapper]);

    // useEffect(() => {
    //     if (!firstRender.current && !isCheckSubscription) {
    //         if (Defines.AuthStateType.SIGN_IN == user.authState && !isEmpty(user.id) || !isEmpty(currentUser.accessToken)) {
    //             CommonAPI.SubscribeNotification();
    //             setIsCheckSubscription(true);
    //         }
    //     }
    //
    // }, [firstRender, user, currentUser, isCheckSubscription, setIsCheckSubscription]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
        }
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        }

    }, [firstRender, handleResize]);
    //#endregion

    const layout = useCallback(() => {
        if (Defines.AuthStateType.ALREADY_SIGN_IN == user.authState)
            return <AlreadySignIn/>;

        const gnb = isEmpty(chat.currentChatRoomId) ? <ChatGNB/> : <></>;
        let contents = children;

        if (!webSocket) {

        } else {
            switch (webSocket.connectionState) {
                case WebSocket.CONNECTING:
                    if (Defines.AuthStateType.SIGN_IN === user.authState) {
                        contents =  <Loading/>;
                        break;
                    } else {
                        return <Loading/>;
                    }

                case WebSocket.CLOSED:
                    return <ChatDisconnected />;
            }
        }

        if (Defines.AuthStateType.NONE == user.authState || isEmpty(user.id) || isEmpty(currentUser.accessToken))
            return (
                <>
                    <DialogSignIn />
                    <DialogSignUp />
                    <DialogChangeUser />
                    <ChatSignIn />
                </>
            );

        return (
            <>
                <DialogSignUp />
                <DialogProfile/>
                <DialogNotification/>
                <ChatHeader/>
                {contents}
                {gnb}
            </>
        );
    }, [children, webSocket, chat, user, currentUser]);

    return (
        <main className={`${styles.main}${appConfigs.isProd ? '' : ` ${styles.dev}`}`} ref={mainWrapper}>
            {layout()}
        </main>
    );
}
