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
            const fingerPrint = new FingerPrint();
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

            //
            // const bytesSession = Helpers.getByteArrayFromUUID(session);
            // const bytesFp = Helpers.getByteArrayFromLong(fp);
            // const bytesDeviceType = new Uint8Array(Buffer.from(deviceType.trim(), 'utf-8'));
            // const bytesDeviceTypeLength = new Uint8Array([bytesDeviceType.byteLength]);
            // const bytesDeviceVendor = new Uint8Array(Buffer.from(deviceVendor.trim(), 'utf-8'));
            // const bytesDeviceVendorLength = new Uint8Array([bytesDeviceVendor.byteLength]);
            // const bytesDeviceModel = new Uint8Array(Buffer.from(deviceModel.trim(), 'utf-8'));
            // const bytesDeviceModelLength = new Uint8Array([bytesDeviceModel.byteLength]);
            // const bytesAgent = new Uint8Array(Buffer.from(agent.trim(), 'utf-8'));
            // const bytesAgentLength = Helpers.getByteArrayFromInt(bytesAgent.byteLength);
            // const bytesBrowser = new Uint8Array(Buffer.from(browser.trim(), 'utf-8'));
            // const bytesBrowserLength = new Uint8Array([bytesBrowser.byteLength]);
            // const bytesBrowserVersion = new Uint8Array(Buffer.from(browserVersion.trim(), 'utf-8'));
            // const bytesBrowserVersionLength = new Uint8Array([bytesBrowserVersion.byteLength]);
            // const bytesEngine = new Uint8Array(Buffer.from(engine.trim(), 'utf-8'));
            // const bytesEngineLength = new Uint8Array([bytesEngine.byteLength]);
            // const bytesEngineVersion = new Uint8Array(Buffer.from(engineVersion.trim(), 'utf-8'));
            // const bytesEngineVersionLength = new Uint8Array([bytesEngineVersion.byteLength]);
            // const bytesOS = new Uint8Array(Buffer.from(os.trim(), 'utf-8'));
            // const bytesOSLength = new Uint8Array([bytesOS.byteLength]);
            // const bytesOSVersion = new Uint8Array(Buffer.from(osVersion.trim(), 'utf-8'));
            // const bytesOSVersionLength = new Uint8Array([bytesOSVersion.byteLength]);
            // const bytesHost = new Uint8Array(Buffer.from(host.trim(), 'utf-8'));
            // const bytesHostLength = new Uint8Array([bytesHost.byteLength]);
            // const bytesPath = new Uint8Array(Buffer.from(path.trim(), 'utf-8'));
            // const bytesPathLength = Helpers.getByteArrayFromInt(bytesPath.byteLength);
            // const bytesParameter = new Uint8Array(Buffer.from(parameter.trim(), 'utf-8'));
            // const bytesParameterLength = Helpers.getByteArrayFromInt(bytesParameter.byteLength);
            // const bytesTitle = new Uint8Array(Buffer.from(document.title.trim(), 'utf-8'));
            // const bytesTitleLength = Helpers.getByteArrayFromInt(bytesTitle.byteLength);
            // const bytesLocalTime = Helpers.getByteArrayFromLong(localTime.getTime());
            // const packet = new Uint8Array(
            //     bytesSession.byteLength +
            //     bytesFp.byteLength +
            //     bytesDeviceType.byteLength +
            //     bytesDeviceTypeLength.byteLength +
            //     bytesDeviceVendor.byteLength +
            //     bytesDeviceVendorLength.byteLength +
            //     bytesDeviceModel.byteLength +
            //     bytesDeviceModelLength.byteLength +
            //     bytesAgent.byteLength +
            //     bytesAgentLength.byteLength +
            //     bytesBrowser.byteLength +
            //     bytesBrowserLength.byteLength +
            //     bytesBrowserVersion.byteLength +
            //     bytesBrowserVersionLength.byteLength +
            //     bytesEngine.byteLength +
            //     bytesEngineLength.byteLength +
            //     bytesEngineVersion.byteLength +
            //     bytesEngineVersionLength.byteLength +
            //     bytesOS.byteLength +
            //     bytesOSLength.byteLength +
            //     bytesOSVersion.byteLength +
            //     bytesOSVersionLength.byteLength +
            //     bytesHost.byteLength +
            //     bytesHostLength.byteLength +
            //     bytesPath.byteLength +
            //     bytesPathLength.byteLength +
            //     bytesParameter.byteLength +
            //     bytesParameterLength.byteLength +
            //     bytesTitle.byteLength +
            //     bytesTitleLength.byteLength +
            //     bytesLocalTime.byteLength
            // );
            // packet.set(bytesSession);
            // packet.set(bytesFp);
            // packet.set(bytesDeviceType);
            // packet.set(bytesDeviceTypeLength);
            // packet.set(bytesDeviceVendor);
            // packet.set(bytesDeviceVendorLength);
            // packet.set(bytesDeviceModel);
            // packet.set(bytesDeviceModelLength);
            // packet.set(bytesAgent);
            // packet.set(bytesAgentLength);
            // packet.set(bytesBrowser);
            // packet.set(bytesBrowserLength);
            // packet.set(bytesBrowserVersion);
            // packet.set(bytesBrowserVersionLength);
            // packet.set(bytesEngine);
            // packet.set(bytesEngineLength);
            // packet.set(bytesEngineVersion);
            // packet.set(bytesEngineVersionLength);
            // packet.set(bytesOS);
            // packet.set(bytesOSLength);
            // packet.set(bytesOSVersion);
            // packet.set(bytesOSVersionLength);
            // packet.set(bytesHost);
            // packet.set(bytesHostLength);
            // packet.set(bytesPath);
            // packet.set(bytesPathLength);
            // packet.set(bytesParameter);
            // packet.set(bytesParameterLength);
            // packet.set(bytesTitle);
            // packet.set(bytesTitleLength);
            // packet.set(bytesLocalTime);
            // console.log("binary_length: " + packet.byteLength);
            // binary_length: 235
            // json_bytes_length: 477
            //
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