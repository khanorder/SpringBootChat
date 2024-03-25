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
import { v4 as uuid } from 'uuid';
import {FingerPrint} from "@/helpers/fingerPrint";
import isEmpty from "lodash/isEmpty";
import { dayjs } from '@/helpers/localizedDayjs';
import {CommonAPI} from "@/apis/commonAPI";

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

    useEffect(() => {
        if (!firstRender.current && window) {
            var fingerPrint = new FingerPrint();
            const sessionName = 'viewer';
            const cookies = document.cookie.split(';');
            const userCookie = cookies.find(cookie => cookie.trim().startsWith(`${sessionName}=`));
            let session = uuid();
            if (userCookie) {
                session = userCookie.trim().substring(sessionName.length + 1);
            }
            Helpers.setCookie30Min(sessionName, session);

            const fp = fingerPrint.getFingerprint();
            if (null == fp) {
                return;
            }
            const deviceType = fingerPrint.getDeviceType();
            const deviceVendor = fingerPrint.getDeviceVendor();
            const deviceModel = fingerPrint.getDeviceModel();
            const agent = fingerPrint.getAgent();
            const browser = fingerPrint.getBrowser();
            const browserVersion = fingerPrint.getBrowserVersion();
            const engine = fingerPrint.getEngine();
            const engineVersion = fingerPrint.getEngineVersion();
            const os = fingerPrint.getOS();
            const osVersion = fingerPrint.getOSVersion();
            const host = location.host;
            const path = location.pathname;
            let parameter = '';
            const hrefArr = location.href.split("?", 2);
            if (hrefArr && hrefArr.length > 1 && false == isEmpty(hrefArr[1]))
                parameter = hrefArr[1];

            const localTime = dayjs.utc().toDate();
            CommonAPI.SaveVisitAsync({ session: session, fp: fp, deviceType: deviceType, deviceVendor: deviceVendor, deviceModel: deviceModel, agent: agent, browser: browser, browserVersion: browserVersion, engine: engine, engineVersion: engineVersion, os: os, osVersion: osVersion, host: host, path: path, parameter: parameter, title: document.title, localTime: localTime });
        }
    }, [firstRender, router]);

    return getLayout(
        <ConnectedRouter>
            <Component {...pageProps} />
        </ConnectedRouter>
    );
}

export default wrapper.withRedux(App);