exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  var apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  var data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  var title = (data.title || '').trim();
  var description = (data.description || '').trim();
  var priority = parseInt(data.priority, 10) || 0;
  var label = (data.label || '').trim();

  if (!title) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Title is required' }) };
  }

  var teamId = 'a7276c5f-805f-4a67-a5e2-0228986892aa';

  var mutation = 'mutation CreateIssue($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id identifier url } } }';
  var input = {
    teamId: teamId,
    title: title,
    priority: priority
  };
  if (description) input.description = description;
  if (label) input.labelIds = [label];

  try {
    var res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify({ query: mutation, variables: { input: input } })
    });

    var result = await res.json();

    if (result.errors) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: result.errors[0].message })
      };
    }

    var issueCreate = result.data && result.data.issueCreate;
    if (!issueCreate || !issueCreate.success || !issueCreate.issue) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Issue creation failed' })
      };
    }

    var issue = issueCreate.issue;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        identifier: issue.identifier,
        url: issue.url
      })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to create issue' })
    };
  }
};
