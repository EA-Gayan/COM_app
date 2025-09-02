import FormData from "form-data";
import fetch from "node-fetch";

const WHATSAPP_API_URL = "https://graph.facebook.com/v22.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function sendDocument({ to, pdfBuffer, filename, caption = "" }) {
  try {
    const formattedNumber = formatSriLankaNumber(to);
    console.log(`Attempting to send PDF to: ${formattedNumber}`);

    // --- Upload PDF to WhatsApp ---
    const formData = new FormData();
    formData.append("messaging_product", "whatsapp");
    formData.append("type", "document"); // This was missing!
    formData.append("file", pdfBuffer, {
      filename,
      contentType: "application/pdf",
    });

    console.log("Uploading PDF to WhatsApp...");
    const uploadRes = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/media`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          ...formData.getHeaders(),
        },
        body: formData,
      }
    );

    const uploadData = await uploadRes.json();
    console.log("Upload response:", uploadData);

    if (!uploadRes.ok) {
      throw new Error(
        `HTTP ${uploadRes.status}: ${uploadRes.statusText} - ${JSON.stringify(
          uploadData
        )}`
      );
    }

    if (!uploadData.id) {
      throw new Error(`Media upload failed: ${JSON.stringify(uploadData)}`);
    }

    console.log(`PDF uploaded successfully. Media ID: ${uploadData.id}`);

    // --- Send document message ---
    console.log("Sending document message...");
    const messagePayload = {
      messaging_product: "whatsapp",
      to: formattedNumber,
      type: "document",
      document: {
        id: uploadData.id,
        filename,
        caption,
      },
    };

    const messageRes = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messagePayload),
      }
    );

    const messageData = await messageRes.json();
    console.log("Message response:", messageData);

    if (!messageRes.ok) {
      throw new Error(
        `HTTP ${messageRes.status}: ${messageRes.statusText} - ${JSON.stringify(
          messageData
        )}`
      );
    }

    if (messageData.error) {
      throw new Error(
        `Message send failed: ${JSON.stringify(messageData.error)}`
      );
    }

    console.log(`WhatsApp PDF sent successfully to ${formattedNumber}`);
    console.log(`Message ID: ${messageData.messages[0].id}`);
    return true;
  } catch (error) {
    console.error("WhatsApp send error:", error.message);
    console.error("Full error:", error);
    return false;
  }
}

function formatSriLankaNumber(number) {
  let clean = number.replace(/\D/g, "");
  if (clean.startsWith("0")) clean = "94" + clean.substring(1);
  return clean;
}
