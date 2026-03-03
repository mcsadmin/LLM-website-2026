# How to Submit an Issue

This guide explains how to use the internal issue submission page to report bugs, request features, or flag anything that needs attention.

## Accessing the Page

Go to: `https://localloop-merseyside.co.uk/team-9k4mp7vr2wq8nlxj/`

This page is hidden — it won't appear in the site navigation, search engines, or the sitemap. Bookmark it for easy access.

## Filling Out the Form

### Issue Title (required)
A short summary of the issue. Keep it clear and specific.
- Good: "Footer links broken on mobile"
- Avoid: "Something's wrong"

### Description (optional)
Add detail to help whoever picks this up. Include:
- What's happening vs what you expected
- Steps to reproduce (if it's a bug)
- Any relevant URLs or screenshots

### Priority
Choose from the dropdown:
| Priority | When to use |
|----------|-------------|
| No priority | Not yet assessed |
| Low | Nice to have, no rush |
| Medium | Should be done soon (default) |
| High | Important, needs attention this week |
| Urgent | Blocking or time-sensitive |

### Label
Tag the issue with the most relevant area:
- **Tech** — Code, infrastructure, or technical issues
- **Marketing** — Content, copy, or promotional items
- **Operations** — Process or workflow improvements
- **Admin** — Administrative tasks
- **LLM** — AI/language model related

Leave as "None" if unsure.

## Submitting

Click **Create Issue**. You'll see a confirmation with the issue identifier (e.g. MCS-42). The issue is now in the Linear workspace and can be viewed, assigned, and tracked there.

Click **Submit Another** to create additional issues.

## Troubleshooting

If you see an error:
1. Check your internet connection
2. Try again using the **Try Again** button
3. If it persists, the Linear API key may need to be refreshed in the Netlify environment variables

## Setup (for deployment)

The `LINEAR_API_KEY` environment variable must be set in Netlify for the form to work. This key connects to the MCS Shared workspace in Linear.
