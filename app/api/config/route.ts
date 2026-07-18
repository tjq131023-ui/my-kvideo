/**
 * Config API Route
 * Exposes configuration status (never actual values) to the client
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || '';
const PERSIST_PASSWORD = process.env.PERSIST_PASSWORD !== 'false';
let SUBSCRIPTION_SOURCES = process.env.SUBSCRIPTION_SOURCES || process.env.NEXT_PUBLIC_SUBSCRIPTION_SOURCES || '';

// 自动拦截失效的默认 GitHub 视频源并重定向到本地静态文件目录下的 /test.json
if (!SUBSCRIPTION_SOURCES || (SUBSCRIPTION_SOURCES.includes('tianmengchong-jpg') && SUBSCRIPTION_SOURCES.includes('test.json'))) {
    SUBSCRIPTION_SOURCES = '/test.json';
}

export async function GET() {
    return NextResponse.json({
        hasEnvPassword: ACCESS_PASSWORD.length > 0,
        persistPassword: PERSIST_PASSWORD,
        subscriptionSources: SUBSCRIPTION_SOURCES,
    });
}

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        if (!ACCESS_PASSWORD) {
            return NextResponse.json({ valid: false, message: 'No env password set' });
        }

        const valid = password === ACCESS_PASSWORD;
        return NextResponse.json({ valid });
    } catch {
        return NextResponse.json({ valid: false, message: 'Invalid request' }, { status: 400 });
    }
}
