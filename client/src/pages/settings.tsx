import {
    createRef,
    ReactElement, useCallback,
    useEffect,
    useRef, useState
} from "react";
import {GetStaticProps, NextPageContext} from "next";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsProd} from "@/stores/reducers/appConfigs";
import dynamic from "next/dynamic";
import isEmpty from "lodash/isEmpty";
import {exitChatRoomReq} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
const Layout = dynamic(() => import("@/components/layouts"), { ssr: false });
const DefaultLayout = dynamic(() => import("@/components/layouts/default"), { ssr: false });
const ChatEditProfile = dynamic(() => import("@/components/chatContents/chatEditProfile"), { ssr: false });
const DialogProfileImageInput = dynamic(() => import("@/components/dialogs/dialogProfileImageInput"), { ssr: false });

function Settings() {
    const firstRender = useRef(true);
    const chat = useAppSelector(state => state.chat);
    const profileImageInputRef = createRef<HTMLInputElement>();
    const [profileImageMime, setProfileImageMime] = useState<Defines.AllowedImageType>(Defines.AllowedImageType.NONE);
    const [profileLargeImage, setProfileLargeImage] = useState<string|ArrayBuffer|null>(null);
    const [profileSmallImage, setProfileSmallImage] = useState<string|ArrayBuffer|null>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (firstRender.current && !isEmpty(chat.currentChatRoomId))
            dispatch(exitChatRoomReq(chat.currentChatRoomId));

    }, [firstRender, dispatch, chat]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    return (
        <>
            <DialogProfileImageInput
                profileImageInputRef={profileImageInputRef}
                setProfileImageMime={setProfileImageMime}
                setProfileSmallImage={setProfileSmallImage}
                setProfileLargeImage={setProfileLargeImage}
                profileImageMime={profileImageMime}
                profileSmallImage={profileSmallImage}
                profileLargeImage={profileLargeImage}/>
            <ChatEditProfile
                profileImageInputRef={profileImageInputRef}
                setProfileImageMime={setProfileImageMime}
                setProfileSmallImage={setProfileSmallImage}
                setProfileLargeImage={setProfileLargeImage}
                profileImageMime={profileImageMime}
                profileSmallImage={profileSmallImage}
                profileLargeImage={profileLargeImage}/>
        </>
    );
}

Settings.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            <DefaultLayout>{page}</DefaultLayout>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async (context) => {
    return {
        props: {}
    };
}

// Main.getInitialProps = ({res, err}: NextPageContext) => {
//     return {isProd: ("production" === process.env.NODE_ENV)};
// }

export default Settings;