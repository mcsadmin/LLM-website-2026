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
  var labels = data.labels || [];
  var label = (data.label || '').trim();
  var screenshot = data.screenshot || null;

  if (!title) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Title is required' }) };
  }

  var teamId = 'a7276c5f-805f-4a67-a5e2-0228986892aa';
  var assigneeId = '053ca95e-aa9c-46c3-bc1b-dff7beeb39b9';

  async function linearQuery(query, variables) {
    var res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify({ query: query, variables: variables })
    });
    return res.json();
  }

  try {
    var screenshotUrl = null;

    if (screenshot && screenshot.data) {
      var uploadMutation = 'mutation FileUpload($size: Int!, $contentType: String!, $filename: String!) { fileUpload(size: $size, contentType: $contentType, filename: $filename) { uploadFile { uploadUrl assetUrl headers { key value } } } }';
      var fileBuffer = Buffer.from(screenshot.data, 'base64');
      var uploadResult = await linearQuery(uploadMutation, {
        size: fileBuffer.length,
        contentType: screenshot.contentType || 'image/png',
        filename: screenshot.filename || 'screenshot.png'
      });

      if (uploadResult.data && uploadResult.data.fileUpload && uploadResult.data.fileUpload.uploadFile) {
        var uploadFile = uploadResult.data.fileUpload.uploadFile;
        var uploadHeaders = {};
        if (uploadFile.headers) {
          uploadFile.headers.forEach(function(h) { uploadHeaders[h.key] = h.value; });
        }
        uploadHeaders['Content-Type'] = screenshot.contentType || 'image/png';
        uploadHeaders['Cache-Control'] = 'public, max-age=31536000';

        await fetch(uploadFile.uploadUrl, {
          method: 'PUT',
          headers: uploadHeaders,
          body: fileBuffer
        });

        screenshotUrl = uploadFile.assetUrl;
      }
    }

    if (screenshotUrl) {
      description = description
        ? description + '\n\n**Screenshot:**\n![screenshot](' + screenshotUrl + ')'
        : '**Screenshot:**\n![screenshot](' + screenshotUrl + ')';
    }

    var mutation = 'mutation CreateIssue($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id identifier url } } }';
    var input = {
      teamId: teamId,
      title: title,
      priority: priority,
      assigneeId: assigneeId
    };
    if (description) input.description = description;
    if (labels.length > 0) input.labelIds = labels;
    else if (label) input.labelIds = [label];

    var result = await linearQuery(mutation, { input: input });

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
