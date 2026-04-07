import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const TARGET_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.foryou-realestate.co/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'fyr_7084daf35cf6427f60e06bccd675f133b8a19ce4866cf941156bb4f38fba4016';
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || '2e9e9a3a8080f207cf1c684baaeff40dcd4404c10f4d2207340bb48ee8ccdccda3f4e2fde5bd74fa4d8f463e361c45c9437206a97abb772415263e3a69655a73';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path);
}

async function handleProxy(request: NextRequest, path: string[]) {
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  const fullPath = path.join('/');
  const targetUrl = `${TARGET_BASE_URL}/${fullPath}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const headers: any = {
      'x-api-key': API_KEY,
      'x-api-secret': API_SECRET,
    };

    // Forward auth header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const body = request.method !== 'GET' ? await request.json().catch(() => null) : undefined;

    const response = await axios({
       method: request.method,
       url: targetUrl,
       data: body,
       headers,
       validateStatus: () => true, // Don't throw on error statuses
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Proxy Error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Proxy failed to connect to backend' },
      { status: 500 }
    );
  }
}
