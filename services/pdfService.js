// services/pdfService.js
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import fs from "fs";
import path from "path";

class PDFService {
  constructor() {
    this.tempDir = path.join(process.cwd(), "temp");
    this.ensureTempDirectory();

    // Company information - you can move this to env variables or config
    this.companyInfo = {
      name: process.env.COMPANY_NAME || "Your Company Name",
      address:
        process.env.COMPANY_ADDRESS || "123 Business Street, City, State 12345",
      phone: process.env.COMPANY_PHONE || "(555) 123-4567",
      email: process.env.COMPANY_EMAIL || "info@company.com",
      logo: process.env.COMPANY_LOGO_PATH || null, // Path to logo image
    };
  }

  /**
   * Generate invoice PDF
   * @param {Object} order - Order object
   * @param {Object} options - PDF generation options
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateInvoice(order, options = {}) {
    const filename =
      options.filename || `invoice-${order.orderId}-${Date.now()}.pdf`;
    const filepath = path.join(this.tempDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: "A4",
          ...options.documentOptions,
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Build invoice content
        this.buildInvoiceContent(doc, order, options);

        doc.end();

        stream.on("finish", () => resolve(filepath));
        stream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate receipt PDF (simpler format)
   * @param {Object} order - Order object
   * @param {Object} options - PDF generation options
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateReceipt(order, options = {}) {
    const filename =
      options.filename || `receipt-${order.orderId}-${Date.now()}.pdf`;
    const filepath = path.join(this.tempDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 30,
          size: [300, 600], // Receipt size
          ...options.documentOptions,
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Build receipt content
        this.buildReceiptContent(doc, order, options);

        doc.end();

        stream.on("finish", () => resolve(filepath));
        stream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate order confirmation PDF
   * @param {Object} order - Order object
   * @param {Object} options - PDF generation options
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateOrderConfirmation(order, options = {}) {
    const filename =
      options.filename ||
      `order-confirmation-${order.orderId}-${Date.now()}.pdf`;
    const filepath = path.join(this.tempDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: "A4" });
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Build order confirmation content
        this.buildOrderConfirmationContent(doc, order, options);

        doc.end();

        stream.on("finish", () => resolve(filepath));
        stream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Build invoice content
   * @private
   */
  buildInvoiceContent(doc, order, options = {}) {
    let yPosition = 50;

    // Header with company info and logo
    yPosition = this.buildHeader(doc, "INVOICE", yPosition, options);

    // Invoice details
    yPosition = this.buildInvoiceDetails(doc, order, yPosition);

    // Customer information
    yPosition = this.buildCustomerInfo(doc, order, yPosition);

    // Items table
    yPosition = this.buildItemsTable(doc, order.items, yPosition, options);

    // Totals section
    yPosition = this.buildTotalsSection(doc, order.bills, yPosition);

    // Footer
    this.buildFooter(doc, options);
  }

  /**
   * Build receipt content (compact format)
   * @private
   */
  buildReceiptContent(doc, order, options = {}) {
    let yPosition = 20;

    // Simple header
    doc.fontSize(16).font("Helvetica-Bold");
    doc.text(this.companyInfo.name, 20, yPosition, { align: "center" });
    yPosition += 20;

    doc.fontSize(8).font("Helvetica");
    doc.text(this.companyInfo.address, 20, yPosition, { align: "center" });
    yPosition += 15;
    doc.text(`Phone: ${this.companyInfo.phone}`, 20, yPosition, {
      align: "center",
    });
    yPosition += 20;

    // Receipt title and details
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("RECEIPT", 20, yPosition, { align: "center" });
    yPosition += 20;

    doc.fontSize(8).font("Helvetica");
    doc.text(`Receipt #: ${order.orderId}`, 20, yPosition);
    yPosition += 12;
    doc.text(
      `Date: ${new Date(order.createdAt || Date.now()).toLocaleString()}`,
      20,
      yPosition
    );
    yPosition += 12;
    doc.text(`Customer: ${order.customerDetails.name}`, 20, yPosition);
    yPosition += 20;

    // Simple items list
    doc.text("Items:", 20, yPosition);
    yPosition += 15;

    order.items.forEach((item) => {
      doc.text(`${item.name}`, 20, yPosition);
      doc.text(
        `${item.quantity} x Rs ${item.pricePerQuantity.toFixed(2)}`,
        150,
        yPosition
      );
      doc.text(`Rs ${item.price.toFixed(2)}`, 220, yPosition);
      yPosition += 12;
    });

    yPosition += 10;
    doc.moveTo(20, yPosition).lineTo(280, yPosition).stroke();
    yPosition += 10;

    // Total
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text(`TOTAL: Rs ${order.bills.total.toFixed(2)}`, 20, yPosition, {
      align: "center",
    });
    yPosition += 20;

    doc.fontSize(8).font("Helvetica");
    doc.text("Thank you for your business!", 20, yPosition, {
      align: "center",
    });
  }

  /**
   * Build order confirmation content
   * @private
   */
  buildOrderConfirmationContent(doc, order, options = {}) {
    let yPosition = 50;

    // Header
    yPosition = this.buildHeader(doc, "ORDER CONFIRMATION", yPosition, options);

    // Order details
    doc.fontSize(12);
    doc.text(`Order #: ${order.orderId}`, 50, yPosition);
    doc.text(
      `Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`,
      350,
      yPosition
    );
    yPosition += 20;
    doc.text(
      `Status: ${this.getOrderStatus(order.orderStatus)}`,
      50,
      yPosition
    );
    yPosition += 30;

    // Customer info
    yPosition = this.buildCustomerInfo(doc, order, yPosition);

    // Items
    yPosition = this.buildItemsTable(doc, order.items, yPosition, options);

    // Order summary
    yPosition = this.buildTotalsSection(doc, order.bills, yPosition);

    // Additional info
    doc.fontSize(10);
    doc.text("We will notify you when your order ships.", 50, yPosition + 20);
    doc.text(
      "For questions about your order, please contact us.",
      50,
      yPosition + 35
    );
  }

  /**
   * Build document header
   * @private
   */
  buildHeader(doc, title, yPosition, options = {}) {
    // Add logo if available
    if (this.companyInfo.logo && fs.existsSync(this.companyInfo.logo)) {
      try {
        doc.image(this.companyInfo.logo, 50, yPosition, { width: 60 });
      } catch (error) {
        console.warn("Could not load company logo:", error.message);
      }
    }

    // Company info
    doc.fontSize(20).font("Helvetica-Bold");
    doc.text(this.companyInfo.name, 120, yPosition);

    doc.fontSize(10).font("Helvetica");
    doc.text(this.companyInfo.address, 120, yPosition + 25);
    doc.text(
      `Phone: ${this.companyInfo.phone} | Email: ${this.companyInfo.email}`,
      120,
      yPosition + 40
    );

    // Document title
    doc.fontSize(24).font("Helvetica-Bold");
    doc.text(title, 400, yPosition, { align: "right" });

    return yPosition + 90;
  }

  /**
   * Build invoice-specific details
   * @private
   */
  buildInvoiceDetails(doc, order, yPosition) {
    doc.fontSize(12);
    doc.text(`Invoice #: ${order.orderId}`, 400, yPosition);
    doc.text(
      `Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`,
      400,
      yPosition + 15
    );

    // Due date (you can customize this logic)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    doc.text(`Due Date: ${dueDate.toLocaleDateString()}`, 400, yPosition + 45);

    return yPosition + 70;
  }

  /**
   * Build customer information section
   * @private
   */
  buildCustomerInfo(doc, order, yPosition) {
    // Draw line
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 20;

    doc.fontSize(14).font("Helvetica-Bold");
    doc.text("Bill To:", 50, yPosition);
    yPosition += 20;

    doc.fontSize(12).font("Helvetica");
    doc.text(`Customer: ${order.customerDetails.name}`, 50, yPosition);
    doc.text(`Phone: ${order.customerDetails.telNo}`, 50, yPosition + 15);

    // Add more customer details if available
    if (order.customerDetails.email) {
      doc.text(`Email: ${order.customerDetails.email}`, 50, yPosition + 30);
      yPosition += 15;
    }

    if (order.customerDetails.address) {
      doc.text(`Address: ${order.customerDetails.address}`, 50, yPosition + 30);
      yPosition += 15;
    }

    return yPosition + 50;
  }

  /**
   * Build items table
   * @private
   */
  buildItemsTable(doc, items, yPosition, options = {}) {
    const tableTop = yPosition;

    // Table headers
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Description", 50, tableTop);
    doc.text("Qty", 250, tableTop, { width: 50, align: "center" });
    doc.text("Unit Price", 320, tableTop, { width: 80, align: "right" });
    doc.text("Amount", 450, tableTop, { width: 80, align: "right" });

    // Header line
    yPosition = tableTop + 15;
    doc.moveTo(50, yPosition).lineTo(530, yPosition).stroke();

    // Table rows
    doc.font("Helvetica");
    let rowPosition = yPosition + 10;

    items.forEach((item, index) => {
      // Check if we need a new page
      if (rowPosition > doc.page.height - 150) {
        doc.addPage();
        rowPosition = 50;

        // Repeat headers on new page
        doc.fontSize(12).font("Helvetica-Bold");
        doc.text("Description", 50, rowPosition);
        doc.text("Qty", 250, rowPosition, { width: 50, align: "center" });
        doc.text("Unit Price", 320, rowPosition, { width: 80, align: "right" });
        doc.text("Amount", 450, rowPosition, { width: 80, align: "right" });

        rowPosition += 20;
        doc.moveTo(50, rowPosition).lineTo(530, rowPosition).stroke();
        rowPosition += 10;
        doc.font("Helvetica");
      }

      // Item row
      doc.fontSize(10);
      doc.text(item.name, 50, rowPosition, { width: 180 });
      doc.text(item.quantity.toString(), 250, rowPosition, {
        width: 50,
        align: "center",
      });
      doc.text(`Rs ${item.pricePerQuantity.toFixed(2)}`, 320, rowPosition, {
        width: 80,
        align: "right",
      });
      doc.text(`Rs ${item.price.toFixed(2)}`, 450, rowPosition, {
        width: 80,
        align: "right",
      });

      // Add item description if available
      if (item.description && options.showItemDescriptions) {
        rowPosition += 15;
        doc.fontSize(8).fillColor("gray");
        doc.text(item.description, 50, rowPosition, { width: 180 });
        doc.fillColor("black");
      }

      rowPosition += 20;
    });

    return rowPosition + 10;
  }

  /**
   * Build totals section
   * @private
   */
  buildTotalsSection(doc, bills, yPosition) {
    const totalsX = 350;
    const amountX = 450;

    // Separator line
    doc.moveTo(totalsX, yPosition).lineTo(530, yPosition).stroke();
    yPosition += 15;

    // Calculate subtotal
    const subtotal = bills.total - (bills.tax || 0) + (bills.discount || 0);

    // Subtotal
    doc.fontSize(10);
    doc.text("Subtotal:", totalsX, yPosition);
    doc.text(`Rs ${subtotal.toFixed(2)}`, amountX, yPosition, {
      width: 80,
      align: "right",
    });
    yPosition += 15;

    // Discount
    if (bills.discount && bills.discount > 0) {
      doc.text("Discount:", totalsX, yPosition);
      doc.text(`-Rs ${bills.discount.toFixed(2)}`, amountX, yPosition, {
        width: 80,
        align: "right",
      });
      yPosition += 15;
    }

    // Tax
    if (bills.tax && bills.tax > 0) {
      doc.text("Tax:", totalsX, yPosition);
      doc.text(`Rs ${bills.tax.toFixed(2)}`, amountX, yPosition, {
        width: 80,
        align: "right",
      });
      yPosition += 15;
    }

    // Total line
    doc.moveTo(totalsX, yPosition).lineTo(530, yPosition).stroke();
    yPosition += 10;

    // Total amount
    doc.fontSize(14).font("Helvetica-Bold");
    doc.text("Total:", totalsX, yPosition);
    doc.text(`Rs ${bills.total.toFixed(2)}`, amountX, yPosition, {
      width: 80,
      align: "right",
    });

    return yPosition + 30;
  }

  /**
   * Build document footer
   * @private
   */
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

    // Add payment terms if specified
    if (options.paymentTerms) {
      doc.text(`Payment Terms: ${options.paymentTerms}`, 50, footerY + 45);
    }
  }

  /**
   * Generate PDF buffer instead of file
   * @param {Object} order - Order object
   * @param {string} type - PDF type ('invoice', 'receipt', 'confirmation')
   * @param {Object} options - Generation options
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateBuffer(order, type, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: "A4" });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Generate content based on type
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

  // Utility methods
  ensureTempDirectory() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`PDF cleanup: ${path.basename(filePath)}`);
      }
    } catch (error) {
      console.error(`Failed to cleanup PDF ${filePath}:`, error);
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

  /**
   * Batch cleanup of old temp files
   * @param {number} maxAgeHours - Max age of files to keep (default 24 hours)
   */
  cleanupOldFiles(maxAgeHours = 24) {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          this.cleanupFile(filePath);
        }
      });
    } catch (error) {
      console.error("Error during batch cleanup:", error);
    }
  }
}

export default new PDFService();
