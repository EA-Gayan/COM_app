// services/whatsAppTextService.js
import fetch from "node-fetch";

const WHATSAPP_API_URL = "https://graph.facebook.com/v22.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Send WhatsApp template message (works even if user hasn't messaged you recently)
 * @param {Object} options
 * @param {string} options.to - Recipient phone number (e.g., "947XXXXXXXX")
 * @param {string} options.templateName - Name of the approved WhatsApp template
 * @param {string} [options.languageCode="en_US"] - Template language
 */
export async function sendTemplateMessage({
  to,
  templateName,
  languageCode = "en_US",
}) {
  try {
    const formattedNumber = formatSriLankaNumber(to);

    const res = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedNumber,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
        },
      }),
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(`WhatsApp send error: ${JSON.stringify(data.error)}`);
    }

    console.log(`WhatsApp template message sent to ${formattedNumber}`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Format Sri Lanka phone number: 0XXXXXXXX → 94XXXXXXXX
 */
function formatSriLankaNumber(number) {
  let clean = number.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "94" + clean.substring(1);
  }
  return clean;
}
