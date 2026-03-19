exports.handler = async function(event) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  var data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  var email = (data.email || '').trim();
  if (!email || !email.includes('@')) {
    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Valid email required' }) };
  }

  var name = email.split('@')[0];

  try {
    var response = await fetch('https://mcs-odoo.odoo.com/web/hook/b36a8701-fd50-467f-b27d-235e9dc20cfa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, name: name })
    });

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ ok: true, status: response.status })
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: headers,
      body: JSON.stringify({ error: 'CRM webhook failed', detail: err.message })
    };
  }
};
