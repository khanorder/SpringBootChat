import type {Metadata} from 'next'
import {createRef, ReactNode, useCallback, useEffect, useRef} from "react";
import {useAppSelector} from "@/hooks";
import style from "@/styles/layout.module.sass";
import {Defines} from "@/defines";
import dynamic from "next/dynamic";
const GNBDialog = dynamic(() => import("@/components/dialogs/gnbDialog"), { ssr: false });
const ChatHeader = dynamic(() => import("@/components/chatContents/chatHeader"), { ssr: false });

export const metadata: Metadata = {
    title: 'chat client',
    description: 'chat client',
}

export default function Layout({children}: { children: ReactNode }) {
    const firstRender = useRef(true);
    const webSocket = useAppSelector(state => state.webSocket);
    const user = useAppSelector(state => state.user);
    const mainWrapper = createRef<HTMLDivElement>();

    const handleResize = useCallback(() => {
        if (mainWrapper.current)
            mainWrapper.current.style.height = `${window.innerHeight}px`;

    }, [mainWrapper]);

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

    if (Defines.AuthStateType.ALREADY_SIGN_IN == user.authState) {
        return <></>;
    }

    return (
        webSocket
            ?
            <main className={WebSocket.OPEN === webSocket.connectionState ? style.main : style.loaderWrapper} ref={mainWrapper}>
                <GNBDialog />
                <ChatHeader />
                {
                    WebSocket.OPEN === webSocket.connectionState
                        ?
                        children
                        :
                        <div className={style.loader}></div>
                }
            </main>
            :
            <></>
    )
}
