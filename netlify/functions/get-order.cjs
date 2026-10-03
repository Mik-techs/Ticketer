exports.handler = async function(event, context) {
  try {
    const storageUrl = process.env.JSON_STORAGE_URL;
    if (!storageUrl) return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) };

    const id = (event.queryStringParameters && event.queryStringParameters.id) || null;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'id required' }) };

    const g = await fetch(storageUrl);
    if (!g.ok) return { statusCode: 404, body: JSON.stringify({ error: 'Storage not found' }) };
    const store = await g.json();
    const order = (store && store[id]) || null;
    if (!order) return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };

    return { statusCode: 200, body: JSON.stringify({ order }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
