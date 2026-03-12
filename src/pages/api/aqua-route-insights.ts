import type { APIRoute } from "astro";
import { getAquaRouteInsights } from "../../utils/serverAquaRouteInsights";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const insights = await getAquaRouteInsights({
      origin: body?.origin || {},
      destination: body?.destination || {},
      shipDate: body?.ship_date || body?.shipDate || null,
    });

    return new Response(JSON.stringify(insights), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(
      JSON.stringify({
        message: "Error fetching Aqua route insights",
        details: message,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
};
