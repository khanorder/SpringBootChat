import {Domains} from "@/domains";
import {Helpers} from "@/helpers";
import isEmpty from "lodash/isEmpty";

export namespace ChatAPI {

    export async function UploadChatImageAsync(uploadChatImageReq: Domains.UploadChatImageRequest): Promise<boolean> {
        const serverHost = Helpers.getCookie("SERVER_HOST") ?? 'localhost:8080';
        const url = (serverHost.startsWith("localhost") || serverHost.startsWith("192.168") ? 'http://' : 'https://') + serverHost + "/api/uploadChatImage";
        let result = false;

        const userInfo = Helpers.getCurrentUserInfoCookie();
        if (null == userInfo || isEmpty(userInfo.accessToken))
            return result;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify(uploadChatImageReq)
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