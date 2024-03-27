import type {Metadata} from 'next'
import {ReactNode, useEffect, useRef} from "react";
import {useAppSelector} from "@/hooks";
import style from "@/styles/layout.module.sass";
import {Defines} from "@/defines";

export const metadata: Metadata = {
    title: 'chat client',
    description: 'chat client',
}

export default function Layout({children}: { children: ReactNode }) {
    const firstRender = useRef(true);
    const webSocket = useAppSelector(state => state.webSocket);
    const user = useAppSelector(state => state.user);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    useEffect(() => {
        if (!firstRender.current) {

        }

    }, [firstRender]);

    if (Defines.AuthStateType.ALREADY_SIGN_IN == user.authState) {
        return <></>;
    }

    return (
        <>
            {
                webSocket
                    ?
                    WebSocket.OPEN === webSocket.connectionState
                        ?
                        children
                        :
                        <div className={style.loaderWrapper}>
                            <div className={style.loader}></div>
                        </div>
                    :
                    <></>
            }
        </>
    )
}
