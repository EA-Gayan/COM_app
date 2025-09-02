// services/pdfService.js
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import fs from "fs";
import path from "path";
import os from "os";

class PDFService {
  constructor() {
    // Use temporary directory that works in serverless environments
    this.tempDir = path.join(os.tmpdir(), "pdf_temp");
    this.ensureTempDirectory();

    // Company information
    this.companyInfo = {
      name: process.env.COMPANY_NAME || "Your Company Name",
      address:
        process.env.COMPANY_ADDRESS || "123 Business Street, City, State 12345",
      phone: process.env.COMPANY_PHONE || "(555) 123-4567",
      email: process.env.COMPANY_EMAIL || "info@company.com",
      logo: process.env.COMPANY_LOGO_PATH || null,
    };
  }

  // --- Ensure temp directory exists ---
  ensureTempDirectory() {
    try {
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
      }
    } catch (error) {
      console.warn("Temp directory not available, using in-memory PDF only.");
      this.tempDir = null; // fallback to buffer-only
    }
  }

  // --- Generate PDF file  ---
  async generateInvoice(order, options = {}) {
    return this.generateFile(order, "invoice", options);
  }

  async generateReceipt(order, options = {}) {
    return this.generateFile(order, "receipt", options);
  }

  async generateOrderConfirmation(order, options = {}) {
    return this.generateFile(order, "confirmation", options);
  }

  async generateFile(order, type, options = {}) {
    if (!this.tempDir) {
      // fallback to buffer-only
      return this.generateBuffer(order, type, options);
    }

    const filename =
      options.filename || `${type}-${order.orderId}-${Date.now()}.pdf`;
    const filepath = path.join(this.tempDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: "A4" });
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        switch (type) {
          case "receipt":
            this.buildReceiptContent(doc, order, options);
            break;
          case "confirmation":
            this.buildOrderConfirmationContent(doc, order, options);
            break;
          case "invoice":
          default:
            this.buildInvoiceContent(doc, order, options);
            break;
        }

        doc.end();
        stream.on("finish", () => resolve(filepath));
        stream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // --- Generate PDF buffer in memory ---
  async generateBuffer(order, type, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: "A4" });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        switch (type) {
          case "receipt":
            this.buildReceiptContent(doc, order, options);
            break;
          case "confirmation":
            this.buildOrderConfirmationContent(doc, order, options);
            break;
          case "invoice":
          default:
            this.buildInvoiceContent(doc, order, options);
            break;
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // --- PDF content builders ---
  buildInvoiceContent(doc, order, options = {}) {
    let y = 50;
    y = this.buildHeader(doc, "INVOICE", y, options);
    y = this.buildInvoiceDetails(doc, order, y);
    y = this.buildCustomerInfo(doc, order, y);
    y = this.buildItemsTable(doc, order.items, y, options);
    y = this.buildTotalsSection(doc, order.bills, y);
    this.buildFooter(doc, options);
  }

  buildReceiptContent(doc, order, options = {}) {
    let y = 20;
    doc.fontSize(16).font("Helvetica-Bold");
    doc.text(this.companyInfo.name, 20, y, { align: "center" });
    y += 20;
    doc.fontSize(8).font("Helvetica");
    doc.text(this.companyInfo.address, 20, y, { align: "center" });
    y += 15;
    doc.text(`Phone: ${this.companyInfo.phone}`, 20, y, { align: "center" });
    y += 20;

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("RECEIPT", 20, y, { align: "center" });
    y += 20;

    doc.fontSize(8).font("Helvetica");
    doc.text(`Receipt #: ${order.orderId}`, 20, y);
    y += 12;
    doc.text(
      `Date: ${new Date(order.createdAt || Date.now()).toLocaleString()}`,
      20,
      y
    );
    y += 12;
    doc.text(`Customer: ${order.customerDetails.name}`, 20, y);
    y += 20;

    doc.text("Items:", 20, y);
    y += 15;

    order.items.forEach((item) => {
      doc.text(`${item.name}`, 20, y);
      doc.text(
        `${item.quantity} x Rs ${item.pricePerQuantity.toFixed(2)}`,
        150,
        y
      );
      doc.text(`Rs ${item.price.toFixed(2)}`, 220, y);
      y += 12;
    });

    y += 10;
    doc.moveTo(20, y).lineTo(280, y).stroke();
    y += 10;

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text(`TOTAL: Rs ${order.bills.total.toFixed(2)}`, 20, y, {
      align: "center",
    });
    y += 20;

    doc.fontSize(8).font("Helvetica");
    doc.text("Thank you for your business!", 20, y, { align: "center" });
  }

  buildOrderConfirmationContent(doc, order, options = {}) {
    let y = 50;
    y = this.buildHeader(doc, "ORDER CONFIRMATION", y, options);

    doc.fontSize(12);
    doc.text(`Order #: ${order.orderId}`, 50, y);
    doc.text(
      `Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`,
      350,
      y
    );
    y += 20;
    doc.text(`Status: ${this.getOrderStatus(order.orderStatus)}`, 50, y);
    y += 30;

    y = this.buildCustomerInfo(doc, order, y);
    y = this.buildItemsTable(doc, order.items, y, options);
    y = this.buildTotalsSection(doc, order.bills, y);

    doc.fontSize(10);
    doc.text("We will notify you when your order ships.", 50, y + 20);
    doc.text("For questions about your order, please contact us.", 50, y + 35);
  }

  buildHeader(doc, title, y, options = {}) {
    if (this.companyInfo.logo && fs.existsSync(this.companyInfo.logo)) {
      try {
        doc.image(this.companyInfo.logo, 50, y, { width: 60 });
      } catch (error) {
        console.warn("Could not load logo:", error.message);
      }
    }

    doc.fontSize(20).font("Helvetica-Bold");
    doc.text(this.companyInfo.name, 120, y);
    doc.fontSize(10).font("Helvetica");
    doc.text(this.companyInfo.address, 120, y + 25);
    doc.text(
      `Phone: ${this.companyInfo.phone} | Email: ${this.companyInfo.email}`,
      120,
      y + 40
    );

    doc.fontSize(24).font("Helvetica-Bold");
    doc.text(title, 400, y, { align: "right" });

    return y + 90;
  }

  buildInvoiceDetails(doc, order, y) {
    doc.fontSize(12);
    doc.text(`Invoice #: ${order.orderId}`, 400, y);
    doc.text(
      `Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`,
      400,
      y + 15
    );

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    doc.text(`Due Date: ${dueDate.toLocaleDateString()}`, 400, y + 45);

    return y + 70;
  }

  buildCustomerInfo(doc, order, y) {
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 20;

    doc.fontSize(14).font("Helvetica-Bold");
    doc.text("Bill To:", 50, y);
    y += 20;

    doc.fontSize(12).font("Helvetica");
    doc.text(`Customer: ${order.customerDetails.name}`, 50, y);
    doc.text(`Phone: ${order.customerDetails.telNo}`, 50, y + 15);

    if (order.customerDetails.email) {
      doc.text(`Email: ${order.customerDetails.email}`, 50, y + 30);
      y += 15;
    }
    if (order.customerDetails.address) {
      doc.text(`Address: ${order.customerDetails.address}`, 50, y + 30);
      y += 15;
    }

    return y + 50;
  }

  buildItemsTable(doc, items, y, options = {}) {
    const tableTop = y;
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Description", 50, tableTop);
    doc.text("Qty", 250, tableTop, { width: 50, align: "center" });
    doc.text("Unit Price", 320, tableTop, { width: 80, align: "right" });
    doc.text("Amount", 450, tableTop, { width: 80, align: "right" });

    y = tableTop + 15;
    doc.moveTo(50, y).lineTo(530, y).stroke();
    let rowPos = y + 10;

    items.forEach((item) => {
      if (rowPos > doc.page.height - 150) {
        doc.addPage();
        rowPos = 50;
      }

      doc.fontSize(10);
      doc.text(item.name, 50, rowPos, { width: 180 });
      doc.text(item.quantity.toString(), 250, rowPos, {
        width: 50,
        align: "center",
      });
      doc.text(`Rs ${item.pricePerQuantity.toFixed(2)}`, 320, rowPos, {
        width: 80,
        align: "right",
      });
      doc.text(`Rs ${item.price.toFixed(2)}`, 450, rowPos, {
        width: 80,
        align: "right",
      });

      if (item.description && options.showItemDescriptions) {
        rowPos += 15;
        doc.fontSize(8).fillColor("gray");
        doc.text(item.description, 50, rowPos, { width: 180 });
        doc.fillColor("black");
      }

      rowPos += 20;
    });

    return rowPos + 10;
  }

  buildTotalsSection(doc, bills, y) {
    const x = 350;
    const amountX = 450;

    doc.moveTo(x, y).lineTo(530, y).stroke();
    y += 15;

    const subtotal = bills.total - (bills.tax || 0) + (bills.discount || 0);
    doc.fontSize(10);
    doc.text("Subtotal:", x, y);
    doc.text(`Rs ${subtotal.toFixed(2)}`, amountX, y, {
      width: 80,
      align: "right",
    });
    y += 15;

    if (bills.discount && bills.discount > 0) {
      doc.text("Discount:", x, y);
      doc.text(`-Rs ${bills.discount.toFixed(2)}`, amountX, y, {
        width: 80,
        align: "right",
      });
      y += 15;
    }

    if (bills.tax && bills.tax > 0) {
      doc.text("Tax:", x, y);
      doc.text(`Rs ${bills.tax.toFixed(2)}`, amountX, y, {
        width: 80,
        align: "right",
      });
      y += 15;
    }

    doc.moveTo(x, y).lineTo(530, y).stroke();
    y += 10;

    doc.fontSize(14).font("Helvetica-Bold");
    doc.text("Total:", x, y);
    doc.text(`Rs ${bills.total.toFixed(2)}`, amountX, y, {
      width: 80,
      align: "right",
    });

    return y + 30;
  }

  buildFooter(doc, options = {}) {
    const footerY = doc.page.height - 100;
    doc.fontSize(10).font("Helvetica");
    doc.text(
      options.footerMessage || "Thank you for your business!",
      50,
      footerY
    );
    doc.text(
      "For questions about this invoice, please contact us at:",
      50,
      footerY + 15
    );
    doc.text(
      `${this.companyInfo.phone} or ${this.companyInfo.email}`,
      50,
      footerY + 30
    );

    if (options.paymentTerms) {
      doc.text(`Payment Terms: ${options.paymentTerms}`, 50, footerY + 45);
    }
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

  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (error) {
      console.error("PDF cleanup error:", error);
    }
  }
}

export default new PDFService();
