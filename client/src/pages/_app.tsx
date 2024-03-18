import type { AppProps } from 'next/app'
import {NextPage} from "next";
import {ReactElement, ReactNode} from "react";

export type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactNode
}

export type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
}

export default function ChatApp({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout = Component.getLayout ?? ((page) => page);
    return getLayout(<Component {...pageProps} />);
}