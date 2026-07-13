Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { platform, content, hashtags, framework, scheduledAt, mediaUrls, blogPostId, blogPostTitle } = body;

    if (!platform || !content) {
      return new Response(
        JSON.stringify({ error: "Platform and content are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Record<string, unknown> = {
      platform,
      received: true,
      timestamp: new Date().toISOString(),
    };

    // Forward to Make.com webhook if configured
    const makeWebhookUrl = Deno.env.get("MAKE_WEBHOOK_URL");
    if (makeWebhookUrl) {
      const webhookPayload = {
        platform,
        content,
        hashtags: hashtags || "",
        framework: framework || "",
        scheduledAt: scheduledAt || null,
        mediaUrls: mediaUrls || [],
        blogPostId: blogPostId || null,
        blogPostTitle: blogPostTitle || null,
        source: "hrly-admin-panel",
        timestamp: new Date().toISOString(),
      };

      try {
        const webhookResponse = await fetch(makeWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
        });

        results.webhookSent = webhookResponse.ok;
        results.webhookStatus = webhookResponse.status;

        if (!webhookResponse.ok) {
          results.webhookError = `Webhook returned ${webhookResponse.status}`;
        }
      } catch (webhookErr) {
        results.webhookSent = false;
        results.webhookError = webhookErr instanceof Error ? webhookErr.message : "Webhook request failed";
      }
    } else {
      results.webhookSent = false;
      results.webhookError = "MAKE_WEBHOOK_URL not configured";
    }

    // Platform-specific notes:
    // - LinkedIn: requires OAuth2 access token + organization ID, posts via LinkedIn Share API
    // - Facebook: requires Page Access Token + Page ID, posts via Graph API
    // - Instagram: requires Facebook Business account + Instagram Business ID, posts via Graph API
    // All platform tokens should be configured as Supabase secrets:
    //   LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORG_ID
    //   FACEBOOK_PAGE_TOKEN, FACEBOOK_PAGE_ID
    //   INSTAGRAM_BUSINESS_ID

    if (platform === "linkedin") {
      const linkedinToken = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
      const linkedinOrgId = Deno.env.get("LINKEDIN_ORG_ID");
      if (linkedinToken && linkedinOrgId) {
        try {
          const linkedinResponse = await fetch("https://api.linkedin.com/v2/posts", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${linkedinToken}`,
              "Content-Type": "application/json",
              "X-Restli-Protocol-Version": "2.0.0",
            },
            body: JSON.stringify({
              author: `urn:li:organization:${linkedinOrgId}`,
              commentary: `${content}${hashtags ? "\n\n" + hashtags : ""}`,
              lifecycleState: "PUBLISHED",
              visibility: "PUBLIC",
              distribution: {
                feedDistribution: "MAIN_FEED",
                targetEntities: [],
                thirdPartyDistributionChannels: [],
              },
            }),
          });
          results.linkedinPosted = linkedinResponse.ok;
          if (!linkedinResponse.ok) {
            results.linkedinError = `LinkedIn API returned ${linkedinResponse.status}`;
          }
        } catch (err) {
          results.linkedinPosted = false;
          results.linkedinError = err instanceof Error ? err.message : "LinkedIn API request failed";
        }
      } else {
        results.linkedinPosted = false;
        results.linkedinError = "LinkedIn credentials not configured";
      }
    }

    if (platform === "facebook") {
      const fbToken = Deno.env.get("FACEBOOK_PAGE_TOKEN");
      const fbPageId = Deno.env.get("FACEBOOK_PAGE_ID");
      if (fbToken && fbPageId) {
        try {
          const fbResponse = await fetch(
            `https://graph.facebook.com/v18.0/${fbPageId}/feed?access_token=${fbToken}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: `${content}${hashtags ? "\n\n" + hashtags : ""}`,
              }),
            }
          );
          const fbData = await fbResponse.json();
          results.facebookPosted = fbResponse.ok;
          if (fbData.id) results.facebookPostId = fbData.id;
          if (!fbResponse.ok) {
            results.facebookError = fbData.error?.message || `Facebook API returned ${fbResponse.status}`;
          }
        } catch (err) {
          results.facebookPosted = false;
          results.facebookError = err instanceof Error ? err.message : "Facebook API request failed";
        }
      } else {
        results.facebookPosted = false;
        results.facebookError = "Facebook credentials not configured";
      }
    }

    if (platform === "instagram") {
      const igToken = Deno.env.get("FACEBOOK_PAGE_TOKEN");
      const igBusinessId = Deno.env.get("INSTAGRAM_BUSINESS_ID");
      if (igToken && igBusinessId) {
        try {
          const igResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igBusinessId}/media?access_token=${igToken}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                caption: `${content}${hashtags ? "\n\n" + hashtags : ""}`,
                image_url: mediaUrls?.[0] || "https://hrly.pl/wp/wp-content/uploads/2021/07/analiza-danych-HR-1024x540.png",
              }),
            }
          );
          const igData = await igResponse.json();
          if (igData.id) {
            const publishResponse = await fetch(
              `https://graph.facebook.com/v18.0/${igBusinessId}/media_publish?access_token=${igToken}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ creation_id: igData.id }),
              }
            );
            results.instagramPosted = publishResponse.ok;
          } else {
            results.instagramPosted = false;
            results.instagramError = igData.error?.message || "Failed to create media container";
          }
        } catch (err) {
          results.instagramPosted = false;
          results.instagramError = err instanceof Error ? err.message : "Instagram API request failed";
        }
      } else {
        results.instagramPosted = false;
        results.instagramError = "Instagram credentials not configured";
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
