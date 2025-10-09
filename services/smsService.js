import fetch from "node-fetch";

export async function sendSMS({ recipient, message }) {
  const apiKey = process.env.TEXT_LK_API_KEY;
  const senderId = "TextLKDemo";

  const payload = {
    recipient,
    sender_id: senderId,
    type: "plain",
    message,
  };

  try {
    const response = await fetch("https://app.text.lk/api/v3/sms/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Text.lk SMS Response:", result);
    return result;
  } catch (error) {
    console.error("SMS sending failed:", error);
    return { success: false, error: error.message };
  }
}
