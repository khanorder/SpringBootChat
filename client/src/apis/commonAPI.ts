import {Domains} from "@/domains";
import {Helpers} from "@/helpers";

export namespace CommonAPI {

    export async function SaveVisitAsync(visit: Domains.Visit): Promise<boolean> {
        const serverHost = Helpers.getCookie("SERVER_HOST") ?? 'localhost:8080';
        const url = (serverHost.startsWith("localhost") ? 'http://' : 'https://') + serverHost + "/api/visit";
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