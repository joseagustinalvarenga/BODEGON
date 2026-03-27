import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8080';

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
    const path = pathSegments.join('/');
    const search = request.nextUrl.search;
    const targetUrl = `${BACKEND}/api/${path}${search}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (key !== 'host') headers.set(key, value);
    });

    const isBodyMethod = !['GET', 'HEAD'].includes(request.method);
    const body = isBodyMethod ? await request.arrayBuffer() : undefined;

    try {
        const res = await fetch(targetUrl, { method: request.method, headers, body });

        const resHeaders = new Headers();
        res.headers.forEach((value, key) => {
            if (key !== 'transfer-encoding') resHeaders.set(key, value);
        });

        return new NextResponse(res.body, { status: res.status, headers: resHeaders });
    } catch (error) {
        console.error('Proxy error:', targetUrl, error);
        return NextResponse.json({ message: 'Backend no disponible' }, { status: 503 });
    }
}

type Ctx = { params: { path: string[] } | Promise<{ path: string[] }> };

async function getPath(ctx: Ctx) {
    const p = await Promise.resolve(ctx.params);
    return p.path;
}

export async function GET(req: NextRequest, ctx: Ctx) { return proxyRequest(req, await getPath(ctx)); }
export async function POST(req: NextRequest, ctx: Ctx) { return proxyRequest(req, await getPath(ctx)); }
export async function PUT(req: NextRequest, ctx: Ctx) { return proxyRequest(req, await getPath(ctx)); }
export async function PATCH(req: NextRequest, ctx: Ctx) { return proxyRequest(req, await getPath(ctx)); }
export async function DELETE(req: NextRequest, ctx: Ctx) { return proxyRequest(req, await getPath(ctx)); }
