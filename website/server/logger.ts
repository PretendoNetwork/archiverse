import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "url";
import { pushLogsToLoki } from "./grafana";
import { IncomingMessage, ServerResponse } from "http";
import { GetServerSidePropsContext } from "next";

// Create a type that encompasses both API routes and getServerSideProps
type LoggableRequest = NextApiRequest | GetServerSidePropsContext["req"];
type LoggableResponse = NextApiResponse | ServerResponse;

export async function logServerStats(
  req: LoggableRequest,
  res: LoggableResponse
) {
  const start = Number(req.headers["x-request-start"]);
  // let responseBody: any;

  // Intercept res.json and res.send if available
  // if ('json' in res && typeof res.json === 'function') {
  //   const originalJson = res.json;
  //   res.json = function (body: any) {
  //     responseBody = body;
  //     return originalJson.call(this, body);
  //   };
  // }

  // if ('send' in res && typeof res.send === 'function') {
  //   const originalSend = res.send;
  //   res.send = function (body: any) {
  //     responseBody = body;
  //     return originalSend.call(this, body);
  //   };
  // }

  res.on("finish", async () => {
    const end = Date.now();
    let duration = null;
    if (!isNaN(start)) {
      duration = end - start;
    }

    const parsedUrl = parse(req.url || "", true);
    const urlWithoutParams = parsedUrl.pathname;

    const logData: Record<string, any> = {
      method: req.method,
      url: urlWithoutParams,
      status: res.statusCode,
      durationMS: duration,
      searchParams: parsedUrl.query,
      userAgent: req.headers["user-agent"],
      referer: req.headers.referer || null,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    };

    if (
      (req as any).body &&
      ["POST", "PUT", "PATCH"].includes(req.method || "")
    ) {
      logData.requestBody = (req as any).body;
    }

    let level: "info" | "warning" | "error" | null = null;

    if (res.statusCode >= 200 && res.statusCode <= 399) {
      level = "info";
    } else if (res.statusCode >= 400 && res.statusCode <= 499) {
      level = "warning";
    } else if (res.statusCode >= 500 && res.statusCode <= 599) {
      level = "error";
    }

    await pushLogsToLoki(
      {
        service: "archiverse-web",
        job: "logger",
        level: level,
      },
      [`${JSON.stringify(logData)}`]
    );
  });
}
