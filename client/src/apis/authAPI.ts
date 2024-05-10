import {Domains} from "@/domains";
import {Helpers} from "@/helpers";
import {Errors} from "@/defines/errors";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";

export namespace AuthAPI {

    export async function SignUpAsync(signUpRequest: Domains.SignUpRequest): Promise<Domains.SignUpResponse> {
        const serverHost = Helpers.getCookie("SERVER_HOST") ?? 'localhost:8080';
        const url = (serverHost.startsWith("localhost") || serverHost.startsWith("192.168") ? 'http://' : 'https://') + serverHost + "/auth/signUp";
        const signUpResponse = new Domains.SignUpResponse(Errors.SignUp.FAILED_TO_SIGN_UP);

        // const userInfo = Helpers.getCurrentUserInfoCookie();
        // if (null == userInfo || isEmpty(userInfo.accessToken))
        //     return signUpResponse;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signUpRequest)
            });

            if (200 == response.status) {
                const json = await response.json();
                signUpResponse.result = json.result;
                if (Errors.SignUp.UPGRADE_EXISTS_ACCOUNT === signUpResponse.result) {
                    signUpResponse.accessToken = json.accessToken;
                    signUpResponse.refreshToken = json.refreshToken;
                }
                return signUpResponse;
            }
        } catch (error) {
            console.error(error);
        }

        return signUpResponse;
    }

    export async function SignInAsync(signInRequest: Domains.SignInRequest): Promise<Domains.SignInResponse> {
        const serverHost = Helpers.getCookie("SERVER_HOST") ?? 'localhost:8080';
        const url = (serverHost.startsWith("localhost") || serverHost.startsWith("192.168") ? 'http://' : 'https://') + serverHost + "/auth/signIn";
        const signInResponse = new Domains.SignInResponse(Errors.SignIn.FAILED_TO_SIGN_IN, "", "");

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signInRequest)
            });

            if (200 == response.status) {
                const json = await response.json();
                signInResponse.result = json.result;
                signInResponse.accessToken = json.accessToken;
                signInResponse.refreshToken = json.refreshToken;
                return signInResponse;
            }
        } catch (error) {
            console.error(error);
        }

        return signInResponse;
    }

    export async function ChangePasswordAsync(signInRequest: Domains.ChangePasswordRequest): Promise<Domains.ChangePasswordResponse> {
        const serverHost = Helpers.getCookie("SERVER_HOST") ?? 'localhost:8080';
        const url = (serverHost.startsWith("localhost") || serverHost.startsWith("192.168") ? 'http://' : 'https://') + serverHost + "/auth/changePassword";
        const changePasswordResponse = new Domains.ChangePasswordResponse(Errors.ChangePassword.FAILED_TO_CHANGE);

        const userInfo = Helpers.getCurrentUserInfoCookie();
        if (null == userInfo || isEmpty(userInfo.accessToken))
            return changePasswordResponse;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify(signInRequest)
            });

            if (200 == response.status) {
                const json = await response.json();
                changePasswordResponse.result = json.result;
                return changePasswordResponse;
            }
        } catch (error) {
            console.error(error);
        }

        return changePasswordResponse;
    }

}