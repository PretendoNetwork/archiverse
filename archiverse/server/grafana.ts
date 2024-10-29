import axios from "axios";

const LOKI_ENDPOINT = process.env.GRAFANA_PUSH_URL;
const LOKI_USERNAME = process.env.GRAFANA_USERNAME;
const LOKI_PASSWORD = process.env.GRAFANA_PASSWORD;

if (
  process.env.NODE_ENV === "production" &&
  (!LOKI_ENDPOINT || !LOKI_USERNAME || !LOKI_PASSWORD)
) {
  throw Error(
    "LOKI_ENDPOINT, LOKI_USERNAME, or LOKI_PASSWORD are undefined! Please double check."
  );
}

export const pushLogsToLoki = async (
  stream: { [key: string]: string },
  messages: string[]
) => {
  const values = messages.map((message) => [
    String(Date.now() * 1000000), // Timestamp in nanoseconds
    message,
  ]);

  const logs = {
    streams: [
      {
        stream: stream,
        values: values,
      },
    ],
  };

  try {
    console.log("LOG:", stream, "\n", messages);

    if (process.env.NODE_ENV !== "production") {
      return;
    }
    const response = await axios.post(LOKI_ENDPOINT, logs, {
      auth: {
        username: LOKI_USERNAME,
        password: LOKI_PASSWORD,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(`Successfully pushed logs to Loki: ${response.status}`);
  } catch (error: any) {
    if (error.response) {
      // The request was made, and the server responded with a status code that falls out of the range of 2xx
      console.error(`Loki responded with status code ${error.response.status}`);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      // The request was made, but no response was received
      console.error("No response received from Loki");
      console.error("Request data:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request to Loki:", error.message);
    }
    if (error.isAxiosError) {
      console.error("Axios error details:", error.toJSON());
    }
  }
};
