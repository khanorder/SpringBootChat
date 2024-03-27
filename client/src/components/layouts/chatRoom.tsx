import type {Metadata} from 'next'
import {ReactNode} from "react";
import Head from "next/head";

export const metadata: Metadata = {
    title: 'chat client',
    description: 'chat client',
}

export default function DefaultLayout({children}: { children: ReactNode }) {
    const title: string = '채팅 샘플';
    const subject: string = '채팅 샘플';
    const description: string = '웹소켓 구현, 채팅 샘플';
    const keyword: string = '채팅 샘플, 웹소캣, 채팅방';
    const author: string = '배장호';
    const copyright: string = '배장호';
    const url: string = 'chat.baejangho.com';
    const ogImage: string = '/images/logo-m3_gmbaejangho.gif';

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <meta name="title" content={title}/>
                <meta name="subject" content={subject}/>
                <meta name="description" content={description}/>
                <meta name="keyword" content={keyword}/>
                <meta name="author" content={author}/>
                <meta name="copyright" content={copyright}/>
                <meta property="og:title" content={title}/>
                <meta property="og:site_name" content={title}/>
                <meta property="og:type" content={title}/>
                <meta property="og:description" content={description}/>
                <meta property="og:url" content={url}/>
                <meta property="og:image" content={ogImage}/>
                <meta property="og:image:type" content="image/jpeg"/>
                <meta property="og:image:alt" content={title}/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={title}/>
                <meta name="twitter:description" content={description}/>
                <meta name="twitter:image" content={ogImage}/>
            </Head>
            {children}
        </>
    )
}
