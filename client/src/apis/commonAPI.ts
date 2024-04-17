import {Domains} from "@/domains";
import {Helpers} from "@/helpers";
import {Errors} from "@/defines/errors";

export namespace CommonAPI {

    export async function SubscribeChatRoom(roomId: string, userId: string) {
        if (!roomId) {
            alert("채팅방 아이디를 입력해 주세요.");
            return;
        }

        if (!userId) {
            alert("유저 아이디를 입력해 주세요.");
            return;
        }

        try {
            Notification.requestPermission()
                .then(async (status) => {
                    if ("denied" === status) {
                        alert("브라우저 알림설정에서 알림차단을 해제해주세요.");
                        return;
                    }

                    if ('serviceWorker' in navigator) {
                        let publicKey: string = '';
                        const serverHost = Helpers.getCookie("SERVER_HOST") ?? 'localhost:8080';
                        const getPublicKeyUrl = (serverHost.startsWith("localhost") || serverHost.startsWith("192.168") ? 'http://' : 'https://') + serverHost + "/api/getPublicKey";
                        const responseGetPublicKey = await fetch(getPublicKeyUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });

                        if (200 == responseGetPublicKey.status) {
                            const jsonGetPublicKey = await responseGetPublicKey.json();
                            publicKey = jsonGetPublicKey.publicKey ?? '';
                        }

                        if (!publicKey) {
                            alert("푸쉬 알림 구독키 획득실패.");
                            return;
                        }

                        const registration = await navigator.serviceWorker.register('/sw.js');
                        const subscribeOptions = {
                            userVisibleOnly: true,
                            applicationServerKey: publicKey,
                        };
                        const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
                        const url = (serverHost.startsWith("localhost") ? 'http://' : 'https://') + serverHost + "/api/subscription";
                        const subscriptionRequest = new Domains.SubscriptionRequest(pushSubscription, roomId, userId);
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(subscriptionRequest)
                        });

                        if (200 == response.status) {
                            const json = await response.json();
                            switch (json.result) {
                                case Errors.SubscribeChatRoom.NONE:
                                    alert('알림설정 완료.');
                                    break;

                                case Errors.SubscribeChatRoom.ALREADY_SUBSCRIBE_ROOM:
                                    alert('이미 알림설정을 했습니다.');
                                    break;

                                default:
                                    alert('알림설정 실패.');
                                    break;
                            }
                        }
                        registration.waiting?.postMessage('SKIP_WAITING');
                    }
                });
        } catch (error) {
            console.error(error);
            alert('알림 설정 실패.');
        }
    }

    export async function SaveVisitAsync(visit: Domains.Visit): Promise<boolean> {
        const serverHost = Helpers.getCookie("SERVER_HOST") ?? 'localhost:8080';
        const url = (serverHost.startsWith("localhost") || serverHost.startsWith("192.168") ? 'http://' : 'https://') + serverHost + "/api/visit";
        let result = false;

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