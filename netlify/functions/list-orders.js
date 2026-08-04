exports.handler = async function(event, context) {
  // list-orders — admin only
  try {
    const token = event.headers['x-admin-token'];
    if (!token || token !== process.env.ADMIN_TOKEN) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };

    const storageUrl = process.env.JSON_STORAGE_URL;
    if (!storageUrl) return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) };

    const g = await fetch(storageUrl);
    if (!g.ok) return { statusCode: 500, body: JSON.stringify({ error: 'Failed to read storage' }) };
    const store = await g.json();
    return { statusCode: 200, body: JSON.stringify({ orders: store }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
