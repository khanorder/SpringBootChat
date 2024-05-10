import {
    createRef,
    ReactElement, useCallback,
    useEffect,
    useRef, useState
} from "react";
import {GetStaticProps, NextPageContext} from "next";
import {useAppDispatch, useAppSelector} from "@/hooks";
import dynamic from "next/dynamic";
import isEmpty from "lodash/isEmpty";
import {exitChatRoomReq} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
import styles from "@/styles/settings.module.sass";
import useCurrentUser from "@/components/common/useCurrentUser";
const Layout = dynamic(() => import("@/components/layouts"), { ssr: false });
const DefaultLayout = dynamic(() => import("@/components/layouts/default"), { ssr: false });
const DialogProfileImageInput = dynamic(() => import("@/components/dialogs/dialogProfileImageInput"), { ssr: false });
const ListItem = dynamic(() => import("@/components/settings/listItem"), { ssr: false });
const PanelEditProfile = dynamic(() => import("@/components/settings/panelEditProfile"), { ssr: false });
const PanelSignUp = dynamic(() => import("@/components/settings/panelSignUp"), { ssr: false });
const PanelChangePassword = dynamic(() => import("@/components/settings/panelChangePassword"), { ssr: false });

function Settings() {
    const firstRender = useRef(true);
    const chat = useAppSelector(state => state.chat);
    const dispatch = useAppDispatch();
    const profileImageInputRef = createRef<HTMLInputElement>();
    const [profileImageMime, setProfileImageMime] = useState<Defines.AllowedImageType>(Defines.AllowedImageType.NONE);
    const [profileLargeImage, setProfileLargeImage] = useState<string|ArrayBuffer|null>(null);
    const [profileSmallImage, setProfileSmallImage] = useState<string|ArrayBuffer|null>(null);
    const [isOpenItemProfile, setIsOpenItemProfile] = useState<boolean>(false);
    const [isOpenItemSignUp, setIsOpenItemSignUp] = useState<boolean>(false);
    const [isOpenItemPassword, setIsOpenItemPassword] = useState<boolean>(false);
    const [currentUser] = useCurrentUser();

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

    const listItems = useCallback(() => {
        return (
            <ul className={styles.settingsWrapper}>
                <ListItem itemName={"프로필 설정"} isOpenItem={isOpenItemProfile} setIsOpenItem={setIsOpenItemProfile}>
                    <PanelEditProfile
                        isOpenItem={isOpenItemProfile}
                        profileImageInputRef={profileImageInputRef}
                        setProfileImageMime={setProfileImageMime}
                        setProfileSmallImage={setProfileSmallImage}
                        setProfileLargeImage={setProfileLargeImage}
                        profileImageMime={profileImageMime}
                        profileSmallImage={profileSmallImage}
                        profileLargeImage={profileLargeImage}
                    />
                </ListItem>
                {
                    Defines.AccountType.TEMP === currentUser.accountType
                        ?
                        <ListItem itemName={"계정등록"} isOpenItem={isOpenItemSignUp} setIsOpenItem={setIsOpenItemSignUp}>
                            <PanelSignUp isOpenItem={isOpenItemSignUp}/>
                        </ListItem>
                        :
                        <ListItem itemName={"비밀번호 변경"} isOpenItem={isOpenItemPassword} setIsOpenItem={setIsOpenItemPassword}>
                            <PanelChangePassword isOpenItem={isOpenItemPassword}/>
                        </ListItem>
                }
            </ul>
        );
    }, [currentUser, isOpenItemPassword, isOpenItemProfile, profileImageInputRef, profileImageMime, profileLargeImage, profileSmallImage]);

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
            {listItems()}
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

export default Settings;