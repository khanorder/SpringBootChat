import '@/styles/globals.sass';
import type { AppProps } from 'next/app'
import {NextPage} from "next";
import {ReactElement, ReactNode, useEffect, useRef} from "react";
import wrapper from '@/stores/index';
import {ConnectedRouter} from "connected-next-router";
import {useRouter} from "next/router";
import {useAppDispatch} from "@/hooks";
import * as webSocketActions from "@/stores/reducers/webSocket";
import {Helpers} from "@/helpers";

export type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactNode
}

export type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
}

function App({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout = Component.getLayout ?? ((page) => page);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            const serverHost = Helpers.getCookie("SERVER_HOST");
            const socketURL = ('production' === process.env.NODE_ENV ? 'wss://' : "ws://") + (serverHost ?? "localhost:8080");

            firstRender.current = false;
            dispatch(webSocketActions.initSocket(socketURL));
        }
    }, [firstRender, dispatch]);

    return getLayout(
        <ConnectedRouter>
            <Component {...pageProps} />
        </ConnectedRouter>
    );
}

export default wrapper.withRedux(App);