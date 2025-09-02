import FormData from "form-data";
import fetch from "node-fetch";

const WHATSAPP_API_URL = "https://graph.facebook.com/v22.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function sendDocument({ to, pdfBuffer, filename, caption = "" }) {
  try {
    const formattedNumber = formatSriLankaNumber(to);

    // --- Upload PDF to WhatsApp ---
    const formData = new FormData();
    formData.append("messaging_product", "whatsapp"); // required
    formData.append("file", pdfBuffer, {
      filename,
      contentType: "application/pdf",
    });

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
    if (!uploadData.id)
      throw new Error(`Media upload failed: ${JSON.stringify(uploadData)}`);

    // --- Send document message ---
    const messageRes = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedNumber,
          type: "document",
          document: {
            id: uploadData.id,
            filename,
            caption,
          },
        }),
      }
    );

    const messageData = await messageRes.json();
    if (messageData.error)
      throw new Error(
        `Message send failed: ${JSON.stringify(messageData.error)}`
      );

    console.log(`WhatsApp PDF sent to ${formattedNumber}`);
    return true;
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return false;
  }
}

function formatSriLankaNumber(number) {
  let clean = number.replace(/\D/g, "");
  if (clean.startsWith("0")) clean = "94" + clean.substring(1);
  return clean;
}
