// services/whatsappService.js
import axios from "axios";
import fs from "fs";
import path from "path";
import pdfService from "./pdfService";

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL;
    this.token = process.env.WHATSAPP_TOKEN;

    // Twilio credentials (if using Twilio)
    this.twilioSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  }

  /**
   * Main method to send invoice via WhatsApp
   * @param {string} phoneNumber - Customer phone number
   * @param {Object} order - Order object
   * @param {Object} options - PDF and message options
   */
  async sendInvoice(phoneNumber, order, options = {}) {
    try {
      // Generate PDF invoice using PDF service
      const pdfPath = await pdfService.generateInvoice(
        order,
        options.pdfOptions
      );

      // Send via WhatsApp
      await this.sendDocument(
        phoneNumber,
        pdfPath,
        order,
        options.messageOptions
      );

      // Clean up the PDF file
      pdfService.cleanupFile(pdfPath);

      return { success: true, message: "Invoice sent successfully" };
    } catch (error) {
      console.error("WhatsApp service error:", error);
      throw error;
    }
  }

  /**
   * Send receipt via WhatsApp (compact format)
   * @param {string} phoneNumber - Customer phone number
   * @param {Object} order - Order object
   * @param {Object} options - Options
   */
  async sendReceipt(phoneNumber, order, options = {}) {
    try {
      const pdfPath = await pdfService.generateReceipt(
        order,
        options.pdfOptions
      );
      await this.sendDocument(phoneNumber, pdfPath, order, {
        ...options.messageOptions,
        caption: `📧 Your receipt for order #${
          order._id
        }\n\nTotal: $${order.bills.total.toFixed(2)}\n\nThank you! 🙏`,
      });
      pdfService.cleanupFile(pdfPath);

      return { success: true, message: "Receipt sent successfully" };
    } catch (error) {
      console.error("WhatsApp receipt error:", error);
      throw error;
    }
  }

  /**
   * Send order confirmation via WhatsApp
   * @param {string} phoneNumber - Customer phone number
   * @param {Object} order - Order object
   * @param {Object} options - Options
   */
  async sendOrderConfirmation(phoneNumber, order, options = {}) {
    try {
      const pdfPath = await pdfService.generateOrderConfirmation(
        order,
        options.pdfOptions
      );
      await this.sendDocument(phoneNumber, pdfPath, order, {
        ...options.messageOptions,
        caption: `✅ Order Confirmation #${
          order._id
        }\n\nYour order has been confirmed!\nWe'll notify you when it ships.\n\nTotal: $${order.bills.total.toFixed(
          2
        )}`,
      });
      pdfService.cleanupFile(pdfPath);

      return { success: true, message: "Order confirmation sent successfully" };
    } catch (error) {
      console.error("WhatsApp confirmation error:", error);
      throw error;
    }
  }

  /**
   * Send document via WhatsApp Business API
   */
  async sendDocument(phoneNumber, pdfPath, order, messageOptions = {}) {
    if (!this.apiUrl || !this.token) {
      throw new Error("WhatsApp API credentials not configured");
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    try {
      // Upload media first
      const mediaId = await this.uploadMedia(pdfPath);

      // Default caption
      const defaultCaption = `📄 Your invoice for order #${
        order._id
      }\n\nTotal: $${order.bills.total.toFixed(
        2
      )}\n\nThank you for your purchase! 🙏`;

      // Send document message
      const messageData = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "document",
        document: {
          id: mediaId,
          caption: messageOptions.caption || defaultCaption,
          filename: messageOptions.filename || `invoice-${order._id}.pdf`,
        },
      };

      const response = await axios.post(
        `${this.apiUrl}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`WhatsApp document sent successfully to ${phoneNumber}`);
      return response.data;
    } catch (error) {
      console.error(
        "WhatsApp API error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Upload media to WhatsApp
   */
  async uploadMedia(filePath) {
    try {
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: "application/pdf" });

      formData.append("file", blob, path.basename(filePath));
      formData.append("messaging_product", "whatsapp");

      const response = await axios.post(`${this.apiUrl}/media`, formData, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.id;
    } catch (error) {
      console.error(
        "Media upload error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Alternative: Send via Twilio WhatsApp
   */
  async sendViaTwilio(phoneNumber, pdfPath, order) {
    if (!this.twilioSid || !this.twilioToken || !this.twilioWhatsAppNumber) {
      throw new Error("Twilio credentials not configured");
    }

    const client = require("twilio")(this.twilioSid, this.twilioToken);

    try {
      // You'd need to upload the file to a public URL first
      const publicUrl = await this.uploadToPublicStorage(pdfPath);

      const message = await client.messages.create({
        from: `whatsapp:${this.twilioWhatsAppNumber}`,
        to: `whatsapp:${phoneNumber}`,
        body: `📄 Your invoice for order #${
          order._id
        }\n\nTotal: $${order.bills.total.toFixed(
          2
        )}\n\nThank you for your purchase! 🙏`,
        mediaUrl: [publicUrl],
      });

      console.log(`Twilio WhatsApp invoice sent successfully: ${message.sid}`);
      return message;
    } catch (error) {
      console.error("Twilio WhatsApp error:", error);
      throw error;
    }
  }

  /**
   * Send a simple text message
   */
  async sendTextMessage(phoneNumber, message) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    const messageData = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: { body: message },
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "WhatsApp text message error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Send order status update
   */
  async sendOrderStatusUpdate(
    phoneNumber,
    orderId,
    newStatus,
    additionalInfo = ""
  ) {
    const statusEmojis = {
      0: "⏳", // Pending
      1: "📦", // Processing
      2: "🚚", // Shipped
      3: "✅", // Delivered
      4: "❌", // Cancelled
    };

    const statusTexts = {
      0: "Pending",
      1: "Processing",
      2: "Shipped",
      3: "Delivered",
      4: "Cancelled",
    };

    const emoji = statusEmojis[newStatus] || "📋";
    const statusText = statusTexts[newStatus] || "Unknown";

    let message = `${emoji} *Order Status Update*\n\n`;
    message += `Order #: ${orderId}\n`;
    message += `Status: ${statusText}\n`;

    if (additionalInfo) {
      message += `\n${additionalInfo}\n`;
    }

    message += `\nThank you for your patience!`;

    return await this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Send template message (for WhatsApp Business API templates)
   */
  async sendTemplate(
    phoneNumber,
    templateName,
    languageCode = "en_US",
    components = []
  ) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    const messageData = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components: components,
      },
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`WhatsApp template sent successfully to ${phoneNumber}`);
      return response.data;
    } catch (error) {
      console.error(
        "WhatsApp template error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Send image message
   */
  async sendImage(phoneNumber, imagePath, caption = "") {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    try {
      // Upload image first
      const mediaId = await this.uploadMedia(imagePath, "image");

      const messageData = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "image",
        image: {
          id: mediaId,
          caption: caption,
        },
      };

      const response = await axios.post(
        `${this.apiUrl}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "WhatsApp image error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Send location message
   */
  async sendLocation(
    phoneNumber,
    latitude,
    longitude,
    name = "",
    address = ""
  ) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    const messageData = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "location",
      location: {
        latitude: latitude,
        longitude: longitude,
        name: name,
        address: address,
      },
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "WhatsApp location error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Send interactive button message
   */
  async sendButtonMessage(phoneNumber, bodyText, buttons = []) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    // Format buttons for WhatsApp API
    const formattedButtons = buttons.map((button, index) => ({
      type: "reply",
      reply: {
        id: button.id || `button_${index}`,
        title: button.title,
      },
    }));

    const messageData = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: bodyText,
        },
        action: {
          buttons: formattedButtons,
        },
      },
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "WhatsApp button message error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Send interactive list message
   */
  async sendListMessage(phoneNumber, bodyText, buttonText, sections = []) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    const messageData = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "interactive",
      interactive: {
        type: "list",
        body: {
          text: bodyText,
        },
        action: {
          button: buttonText,
          sections: sections,
        },
      },
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "WhatsApp list message error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId) {
    const messageData = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "WhatsApp mark as read error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Get media URL by ID
   */
  async getMediaUrl(mediaId) {
    try {
      const response = await axios.get(`${this.apiUrl}/media/${mediaId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      return response.data.url;
    } catch (error) {
      console.error(
        "Get media URL error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Download media
   */
  async downloadMedia(mediaUrl, downloadPath) {
    try {
      const response = await axios({
        method: "GET",
        url: mediaUrl,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        responseType: "stream",
      });

      const writer = fs.createWriteStream(downloadPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    } catch (error) {
      console.error(
        "Download media error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Bulk send messages
   */
  async bulkSendMessages(messages) {
    const results = [];

    for (const message of messages) {
      try {
        let result;

        switch (message.type) {
          case "text":
            result = await this.sendTextMessage(
              message.phoneNumber,
              message.content
            );
            break;
          case "document":
            result = await this.sendDocument(
              message.phoneNumber,
              message.filePath,
              message.order,
              message.options
            );
            break;
          case "template":
            result = await this.sendTemplate(
              message.phoneNumber,
              message.templateName,
              message.languageCode,
              message.components
            );
            break;
          default:
            throw new Error(`Unsupported message type: ${message.type}`);
        }

        results.push({
          success: true,
          phoneNumber: message.phoneNumber,
          result,
        });

        // Add delay to avoid rate limiting
        await this.delay(1000);
      } catch (error) {
        results.push({
          success: false,
          phoneNumber: message.phoneNumber,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Send order notification with interactive buttons
   */
  async sendOrderNotificationWithButtons(phoneNumber, order) {
    const buttons = [
      { id: "track_order", title: "Track Order" },
      { id: "contact_support", title: "Contact Support" },
      { id: "reorder", title: "Reorder" },
    ];

    const bodyText = `🎉 Order Confirmed!\n\nOrder #: ${
      order._id
    }\nTotal: ${order.bills.total.toFixed(2)}\n\nWhat would you like to do?`;

    return await this.sendButtonMessage(phoneNumber, bodyText, buttons);
  }

  /**
   * Send product catalog as list
   */
  async sendProductCatalog(phoneNumber, products) {
    const sections = [
      {
        title: "Our Products",
        rows: products.map((product) => ({
          id: product._id,
          title: product.name,
          description: `${product.price.toFixed(2)} - ${
            product.description || "Available now"
          }`,
        })),
      },
    ];

    return await this.sendListMessage(
      phoneNumber,
      "🛍️ Welcome to our store! Browse our products below:",
      "View Products",
      sections
    );
  }

  // Utility methods
  formatPhoneNumber(phoneNumber) {
    return phoneNumber.replace(/[^0-9]/g, "");
  }

  getOrderStatus(status) {
    const statuses = {
      0: "Pending",
      1: "Processing",
      2: "Shipped",
      3: "Delivered",
      4: "Cancelled",
    };
    return statuses[status] || "Unknown";
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Placeholder for public storage upload (implement based on your needs)
  async uploadToPublicStorage(filePath) {
    // Implement based on your storage solution (AWS S3, Cloudinary, etc.)
    throw new Error("Public storage upload not implemented");
  }

  /**
   * Webhook handler for incoming messages
   */
  async handleWebhook(webhookData) {
    try {
      const { entry } = webhookData;

      if (!entry || entry.length === 0) {
        return { success: false, message: "No entry data" };
      }

      const changes = entry[0].changes;
      if (!changes || changes.length === 0) {
        return { success: false, message: "No changes data" };
      }

      const value = changes[0].value;
      const messages = value.messages;

      if (!messages) {
        return { success: true, message: "No messages to process" };
      }

      // Process each message
      for (const message of messages) {
        await this.processIncomingMessage(message);
      }

      return { success: true, message: "Webhook processed successfully" };
    } catch (error) {
      console.error("Webhook processing error:", error);
      throw error;
    }
  }

  /**
   * Process individual incoming message
   */
  async processIncomingMessage(message) {
    const { from, type, text, button, list, document, image } = message;

    try {
      // Mark message as read
      await this.markAsRead(message.id);

      // Process based on message type
      switch (type) {
        case "text":
          await this.handleTextMessage(from, text.body);
          break;
        case "button":
          await this.handleButtonResponse(from, button.payload);
          break;
        case "interactive":
          if (list) {
            await this.handleListResponse(from, list.id);
          }
          break;
        case "document":
          await this.handleDocumentMessage(from, document);
          break;
        case "image":
          await this.handleImageMessage(from, image);
          break;
        default:
          console.log(`Unsupported message type: ${type}`);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      // Send error message to user
      await this.sendTextMessage(
        from,
        "Sorry, I encountered an error processing your message. Please try again later."
      );
    }
  }

  /**
   * Handle text message responses
   */
  async handleTextMessage(from, messageText) {
    const lowercaseText = messageText.toLowerCase();

    if (lowercaseText.includes("track") || lowercaseText.includes("order")) {
      // Handle order tracking request
      await this.sendTextMessage(
        from,
        "Please provide your order number to track your order."
      );
    } else if (
      lowercaseText.includes("support") ||
      lowercaseText.includes("help")
    ) {
      // Handle support request
      await this.sendTextMessage(
        from,
        "Our support team will contact you shortly. For urgent matters, call us at " +
          process.env.COMPANY_PHONE
      );
    } else {
      // Default response
      await this.sendTextMessage(
        from,
        "Thank you for your message. How can I help you today?"
      );
    }
  }

  /**
   * Handle button responses
   */
  async handleButtonResponse(from, buttonId) {
    switch (buttonId) {
      case "track_order":
        await this.sendTextMessage(
          from,
          "Please share your order number to track your order."
        );
        break;
      case "contact_support":
        await this.sendTextMessage(
          from,
          `Our support team is here to help!\n\nPhone: ${process.env.COMPANY_PHONE}\nEmail: ${process.env.COMPANY_EMAIL}`
        );
        break;
      case "reorder":
        await this.sendTextMessage(
          from,
          "Great! I'll help you reorder. Please let me know what you'd like to order."
        );
        break;
      default:
        await this.sendTextMessage(from, "Thank you for your response!");
    }
  }

  /**
   * Handle list responses
   */
  async handleListResponse(from, selectedItemId) {
    // This could be a product ID if you're sending product catalogs
    await this.sendTextMessage(
      from,
      `You selected: ${selectedItemId}. How can I help you with this?`
    );
  }

  /**
   * Handle document messages
   */
  async handleDocumentMessage(from, document) {
    await this.sendTextMessage(
      from,
      "Thank you for sending the document. We'll review it and get back to you."
    );
  }

  /**
   * Handle image messages
   */
  async handleImageMessage(from, image) {
    await this.sendTextMessage(
      from,
      "Thank you for sending the image. We've received it successfully."
    );
  }
}

export default new WhatsAppService();
