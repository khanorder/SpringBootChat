import {Domains} from "@/domains";
import {Helpers} from "@/helpers";
import {Errors} from "@/defines/errors";
import isEmpty from "lodash/isEmpty";

export namespace CommonAPI {

    export async function GetSubscribePublicKey(): Promise<boolean> {
        let publicKey: string = Helpers.getCookie("notifyPublicKey");
        if ("undefined" !== typeof publicKey && !isEmpty(publicKey))
            return true;

        const userInfo = Helpers.getCurrentUserInfoCookie();
        if (null == userInfo || isEmpty(userInfo.accessToken))
            return false;

        const serverHost = Helpers.getCookie("SERVER_HOST") ?? 'localhost:8080';
        const getPublicKeyUrl = (serverHost.startsWith("localhost") || serverHost.startsWith("192.168") ? 'http://' : 'https://') + serverHost + "/notify/getPublicKey";
        const responseGetPublicKey = await fetch(getPublicKeyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.accessToken}`
            },
            credentials: 'include'
        });

        if (200 == responseGetPublicKey.status) {
            const jsonGetPublicKey = await responseGetPublicKey.json();
            publicKey = jsonGetPublicKey.publicKey ?? '';
        }

        if (!publicKey) {
            return false;
        } else {
            Helpers.setCookie("notifyPublicKey", publicKey, 365);
            return true;
        }
    }

    export async function RegisterSubscription(): Promise<boolean> {
        const publicKey: string = Helpers.getCookie("notifyPublicKey");

        if ("undefined" === typeof publicKey || isEmpty(publicKey))
            return false;

        const userInfo = Helpers.getCurrentUserInfoCookie();
        if (null == userInfo || isEmpty(userInfo.accessToken))
            return false;

        const registration = await navigator.serviceWorker.register('/sw.js');
        await registration.update();

        const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: publicKey,
        };

        let pushSubscription: PushSubscription|null = null;
        try {
            pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
        } catch (subscriptionError) {
            console.error(subscriptionError);
        }

        if (null == pushSubscription)
            return false;

        const serverHost = Helpers.getCookie("SERVER_HOST") ?? 'localhost:8080';
        const url = (serverHost.startsWith("localhost") || serverHost.startsWith("192.168") ? 'http://' : 'https://') + serverHost + "/notify/subscription";
        const subscriptionRequest = new Domains.SubscriptionRequest(pushSubscription);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.accessToken}`
            },
            credentials: 'include',
            body: JSON.stringify(subscriptionRequest)
        });

        if (200 == response.status) {
            const json = await response.json();
            switch (json.result) {
                case Errors.SubscribeNotification.NONE:
                    alert('알림설정 완료.');
                    return true;

                case Errors.SubscribeNotification.REQUIRED_USER_ID:
                    alert('알림설정을 할 사용자 정보가 필요합니다.');
                    break;

                case Errors.SubscribeNotification.NOT_FOUND_USER:
                    alert('알림설정을 할 사용자가 없습니다.');
                    break;

                case Errors.SubscribeNotification.ALREADY_SUBSCRIBE:
                    break;

                default:
                    alert('알림설정 실패.');
                    break;
            }
        }

        return false;
    }

    export async function SubscribeNotification() {
        try {
            Notification.requestPermission()
                .then(async (status) => {
                    if ("denied" === status)
                        return;

                    if ('serviceWorker' in navigator) {
                        if (!await GetSubscribePublicKey())
                            return;

                        await RegisterSubscription();
                    }
                });
        } catch (error) {
            console.error(error);
        }
    }

    export async function SaveVisitAsync(request: Domains.SaveVisitRequest): Promise<boolean> {
        if (!request.fingerPrint)
            return false;

        const fp = request.fingerPrint;
        const fpNum = fp.getFingerprint();

        if (!fpNum)
            return false;

        const serverHost = Helpers.getCookie("SERVER_HOST") ?? 'localhost:8080';
        const url = (serverHost.startsWith("localhost") || serverHost.startsWith("192.168") ? 'http://' : 'https://') + serverHost + "/tracking/visit";
        let result = false;
        var visit = new Domains.Visit(
            request.session,
            fpNum,
            fp.getDeviceType(),
            fp.getDeviceVendor(),
            fp.getDeviceModel(),
            fp.getAgent(),
            fp.getBrowser(),
            fp.getBrowserVersion(),
            fp.getEngine(),
            fp.getEngineVersion(),
            fp.getOS(),
            fp.getOSVersion(),
            request.host,
            request.parameter,
            request.path,
            request.title,
            request.localTime
        );

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(visit)
            });

            if (200 == response.status) {
                const json = await response.json();
                if (json.result)
                    result = "true" == json.result || 1 == json.result;
            }
        } catch (error) {
            console.error(error);
        }
        return result;
    }

}