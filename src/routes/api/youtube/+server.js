import { json } from '@sveltejs/kit';
import { YOUTUBE_API_KEY } from '$env/static/private';

export async function GET({ url }) {
    const q = url.searchParams.get('q');
    const part = url.searchParams.get('part') || 'snippet';
    const type = url.searchParams.get('type') || 'video';
    const videoCategoryId = url.searchParams.get('videoCategoryId');
    const maxResults = url.searchParams.get('maxResults') || '8';
    const videoDuration = url.searchParams.get('videoDuration');
    const chart = url.searchParams.get('chart');
    const regionCode = url.searchParams.get('regionCode');
    const id = url.searchParams.get('id');

    let apiUrl = '';
    if (chart) {
        apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=${part}&chart=${chart}&maxResults=${maxResults}&regionCode=${regionCode || 'US'}&key=${YOUTUBE_API_KEY}`;
    } else if (id) {
        apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=${part}&id=${id}&key=${YOUTUBE_API_KEY}`;
    } else {
        apiUrl = `https://www.googleapis.com/youtube/v3/search?part=${part}&type=${type}&maxResults=${maxResults}&q=${encodeURIComponent(q)}&key=${YOUTUBE_API_KEY}`;
        if (videoCategoryId) apiUrl += `&videoCategoryId=${videoCategoryId}`;
        if (videoDuration) apiUrl += `&videoDuration=${videoDuration}`;
    }

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return json(data);
    } catch (error) {
        return json({ error: 'Failed to fetch from YouTube' }, { status: 500 });
    }
}
