import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

class PDFService {
  constructor() {
    this.tempDir = path.join(process.cwd(), "temp");
    this.ensureTempDirectory();
  }

  /**
   * Generate invoice PDF
   * @param {Object} order - Order object
   * @param {Object} options - PDF generation options
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateInvoice(order, options = {}) {
    const config = {
      companyName:
        options.companyName || process.env.COMPANY_NAME || "Sineth Studio",
      companyAddress:
        options.companyAddress ||
        process.env.COMPANY_ADDRESS ||
        "123 Business Street, City, State 12345",
      companyPhone:
        options.companyPhone || process.env.COMPANY_PHONE || "(555) 123-4567",
      companyEmail:
        options.companyEmail || process.env.COMPANY_EMAIL || "info@company.com",
      logo: options.logo || null,
      theme: options.theme || "default",
      ...options,
    };

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: "A4",
          info: {
            Title: `Invoice ${order._id}`,
            Author: config.companyName,
            Subject: "Invoice",
            Keywords: "invoice, order, receipt",
          },
        });

        const filename = `invoice-${order._id}-${Date.now()}.pdf`;
        const filepath = path.join(this.tempDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Build PDF content based on theme
        switch (config.theme) {
          case "modern":
            this.buildModernInvoice(doc, order, config);
            break;
          case "minimal":
            this.buildMinimalInvoice(doc, order, config);
            break;
          default:
            this.buildStandardInvoice(doc, order, config);
        }

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
   */
  async generateReceipt(order, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30, size: [400, 600] });
        const filename = `receipt-${order._id}-${Date.now()}.pdf`;
        const filepath = path.join(this.tempDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);
        this.buildReceipt(doc, order, options);
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
   */
  async generateOrderConfirmation(order, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `order-confirmation-${order._id}-${Date.now()}.pdf`;
        const filepath = path.join(this.tempDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);
        this.buildOrderConfirmation(doc, order, options);
        doc.end();

        stream.on("finish", () => resolve(filepath));
        stream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Build standard invoice layout
   */
  buildStandardInvoice(doc, order, config) {
    let yPos = 50;

    // Header with company info
    yPos = this.addCompanyHeader(doc, config, yPos);
    yPos += 20;

    // Invoice title and details
    yPos = this.addInvoiceHeader(doc, order, yPos);
    yPos += 30;

    // Customer details
    yPos = this.addCustomerDetails(doc, order, yPos);
    yPos += 30;

    // Items table
    yPos = this.addItemsTable(doc, order.items, yPos);
    yPos += 20;

    // Totals
    yPos = this.addTotalsSection(doc, order.bills, yPos);
    yPos += 30;

    // Footer
    this.addFooter(doc, config);
  }

  /**
   * Build modern invoice layout (with colors and styling)
   */
  buildModernInvoice(doc, order, config) {
    // Modern design with color accents
    const primaryColor = [41, 128, 185]; // Blue
    const accentColor = [52, 73, 94]; // Dark gray

    // Header background
    doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

    // Company name in white
    doc.fill("white").fontSize(28).text(config.companyName, 50, 40);
    doc.fontSize(12).text(config.companyAddress, 50, 75);
    doc.text(`${config.companyPhone} | ${config.companyEmail}`, 50, 90);

    // Invoice details box
    doc.rect(400, 40, 150, 60).stroke(accentColor);
    doc.fill(accentColor).fontSize(16).text("INVOICE", 410, 50);
    doc.fill("black").fontSize(10);
    doc.text(`#${order._id}`, 410, 70);
    doc.text(
      new Date(order.createdAt || Date.now()).toLocaleDateString(),
      410,
      85
    );

    let yPos = 150;

    // Customer section with accent line
    doc.rect(50, yPos, 500, 2).fill(primaryColor);
    yPos += 15;

    yPos = this.addCustomerDetails(doc, order, yPos);
    yPos += 30;

    // Items with alternating row colors
    yPos = this.addStyledItemsTable(doc, order.items, yPos, primaryColor);
    yPos += 20;

    // Totals with accent background
    yPos = this.addStyledTotalsSection(doc, order.bills, yPos, primaryColor);

    this.addFooter(doc, config);
  }

  /**
   * Build minimal invoice layout
   */
  buildMinimalInvoice(doc, order, config) {
    doc.fontSize(32).text("Invoice", 50, 50);
    doc
      .fontSize(10)
      .text(`#${order._id} • ${new Date().toLocaleDateString()}`, 50, 85);

    let yPos = 120;

    // Simple customer info
    doc.fontSize(12).text(`Bill to: ${order.customerDetails.name}`, 50, yPos);
    doc.text(`Phone: ${order.customerDetails.telNo}`, 50, yPos + 15);
    yPos += 50;

    // Clean items list
    yPos = this.addMinimalItemsList(doc, order.items, yPos);
    yPos += 30;

    // Simple total
    doc.fontSize(16).text(`Total: $${order.bills.total.toFixed(2)}`, 400, yPos);
  }

  /**
   * Add company header
   */
  addCompanyHeader(doc, config, yPos) {
    if (config.logo && fs.existsSync(config.logo)) {
      doc.image(config.logo, 50, yPos, { width: 80 });
      doc.fontSize(24).text(config.companyName, 150, yPos + 10);
      doc.fontSize(10).text(config.companyAddress, 150, yPos + 40);
      doc.text(
        `${config.companyPhone} | ${config.companyEmail}`,
        150,
        yPos + 55
      );
      return yPos + 80;
    } else {
      doc.fontSize(24).text(config.companyName, 50, yPos);
      doc.fontSize(10).text(config.companyAddress, 50, yPos + 30);
      doc.text(
        `${config.companyPhone} | ${config.companyEmail}`,
        50,
        yPos + 45
      );
      return yPos + 65;
    }
  }

  /**
   * Add invoice header
   */
  addInvoiceHeader(doc, order, yPos) {
    // Invoice title and number
    doc.fontSize(20).text("INVOICE", 400, yPos);
    doc.fontSize(12).text(`Invoice #: ${order._id}`, 400, yPos + 25);
    doc.text(
      `Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`,
      400,
      yPos + 40
    );
    doc.text(
      `Status: ${this.getOrderStatus(order.orderStatus)}`,
      400,
      yPos + 55
    );

    // Horizontal line
    doc
      .moveTo(50, yPos + 80)
      .lineTo(550, yPos + 80)
      .stroke();

    return yPos + 85;
  }

  /**
   * Add customer details
   */
  addCustomerDetails(doc, order, yPos) {
    doc.fontSize(14).text("Bill To:", 50, yPos);
    doc.fontSize(12).text(`${order.customerDetails.name}`, 50, yPos + 20);
    doc.text(`${order.customerDetails.telNo}`, 50, yPos + 35);

    return yPos + 60;
  }

  /**
   * Add items table
   */
  addItemsTable(doc, items, yPos) {
    // Table headers
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Description", 50, yPos);
    doc.text("Qty", 300, yPos);
    doc.text("Unit Price", 360, yPos);
    doc.text("Total", 450, yPos);

    // Header line
    yPos += 20;
    doc.moveTo(50, yPos).lineTo(520, yPos).stroke();
    yPos += 10;

    // Items
    doc.font("Helvetica");
    items.forEach((item) => {
      yPos += 20;

      // Check for page break
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      doc.text(item.name, 50, yPos, { width: 220 });
      doc.text(item.quantity.toString(), 300, yPos);
      doc.text(`$${item.pricePerQuantity.toFixed(2)}`, 360, yPos);
      doc.text(`$${item.price.toFixed(2)}`, 450, yPos);
    });

    return yPos + 30;
  }

  /**
   * Add styled items table (for modern theme)
   */
  addStyledItemsTable(doc, items, yPos, primaryColor) {
    // Header with background
    doc.rect(50, yPos, 470, 25).fill(primaryColor);
    doc.fill("white").fontSize(12).font("Helvetica-Bold");
    doc.text("Description", 60, yPos + 8);
    doc.text("Qty", 300, yPos + 8);
    doc.text("Unit Price", 360, yPos + 8);
    doc.text("Total", 450, yPos + 8);

    yPos += 25;
    let isEven = false;

    doc.fill("black").font("Helvetica");
    items.forEach((item) => {
      yPos += 20;

      // Alternating row colors
      if (isEven) {
        doc.rect(50, yPos - 2, 470, 20).fill([245, 245, 245]);
      }

      doc.fill("black");
      doc.text(item.name, 60, yPos, { width: 220 });
      doc.text(item.quantity.toString(), 300, yPos);
      doc.text(`$${item.pricePerQuantity.toFixed(2)}`, 360, yPos);
      doc.text(`$${item.price.toFixed(2)}`, 450, yPos);

      isEven = !isEven;
    });

    return yPos + 30;
  }

  /**
   * Add minimal items list
   */
  addMinimalItemsList(doc, items, yPos) {
    items.forEach((item) => {
      doc.text(`${item.quantity}x ${item.name}`, 50, yPos);
      doc.text(`$${item.price.toFixed(2)}`, 450, yPos);
      yPos += 20;
    });

    return yPos;
  }

  /**
   * Add totals section
   */
  addTotalsSection(doc, bills, yPos) {
    const totalsX = 350;

    // Subtotal calculation
    const subtotal = bills.total - (bills.tax || 0) + (bills.discount || 0);

    if (subtotal !== bills.total || bills.discount > 0 || bills.tax > 0) {
      doc.text(`Subtotal: $${subtotal.toFixed(2)}`, totalsX, yPos);
      yPos += 20;

      if (bills.discount > 0) {
        doc.text(`Discount: -$${bills.discount.toFixed(2)}`, totalsX, yPos);
        yPos += 20;
      }

      if (bills.tax > 0) {
        doc.text(`Tax: $${bills.tax.toFixed(2)}`, totalsX, yPos);
        yPos += 20;
      }

      // Total line
      doc.moveTo(totalsX, yPos).lineTo(520, yPos).stroke();
      yPos += 10;
    }

    // Total
    doc.fontSize(16).font("Helvetica-Bold");
    doc.text(`Total: $${bills.total.toFixed(2)}`, totalsX, yPos);

    return yPos + 40;
  }

  /**
   * Add styled totals section (for modern theme)
   */
  addStyledTotalsSection(doc, bills, yPos, primaryColor) {
    const totalsX = 320;
    const boxWidth = 200;

    // Background box
    doc.rect(totalsX, yPos, boxWidth, 80).fill([248, 249, 250]);
    doc.rect(totalsX, yPos, boxWidth, 80).stroke([200, 200, 200]);

    yPos += 15;
    const subtotal = bills.total - (bills.tax || 0) + (bills.discount || 0);

    doc.fill("black").fontSize(12);
    if (bills.discount > 0 || bills.tax > 0) {
      doc.text(`Subtotal: $${subtotal.toFixed(2)}`, totalsX + 15, yPos);
      yPos += 15;

      if (bills.discount > 0) {
        doc.text(
          `Discount: -$${bills.discount.toFixed(2)}`,
          totalsX + 15,
          yPos
        );
        yPos += 15;
      }

      if (bills.tax > 0) {
        doc.text(`Tax: $${bills.tax.toFixed(2)}`, totalsX + 15, yPos);
        yPos += 15;
      }
    }

    // Total with accent background
    doc.rect(totalsX, yPos, boxWidth, 25).fill(primaryColor);
    doc.fill("white").fontSize(14).font("Helvetica-Bold");
    doc.text(`Total: $${bills.total.toFixed(2)}`, totalsX + 15, yPos + 5);

    return yPos + 40;
  }

  /**
   * Build simple receipt
   */
  buildReceipt(doc, order, options) {
    const companyName = options.companyName || "Your Store";

    // Receipt header
    doc.fontSize(16).text(companyName, 50, 30, { align: "center" });
    doc.fontSize(10).text("RECEIPT", 50, 50, { align: "center" });
    doc.text(`#${order._id}`, 50, 65, { align: "center" });
    doc.text(new Date().toLocaleString(), 50, 80, { align: "center" });

    let yPos = 110;

    // Customer
    doc.text(`Customer: ${order.customerDetails.name}`, 30, yPos);
    yPos += 25;

    // Items
    doc.text("Items:", 30, yPos);
    yPos += 15;

    order.items.forEach((item) => {
      doc.text(`${item.quantity}x ${item.name}`, 40, yPos);
      doc.text(`$${item.price.toFixed(2)}`, 300, yPos);
      yPos += 15;
    });

    yPos += 10;
    doc.moveTo(40, yPos).lineTo(350, yPos).stroke();
    yPos += 15;

    // Total
    doc.fontSize(12).text(`TOTAL: $${order.bills.total.toFixed(2)}`, 40, yPos);

    // Thank you message
    yPos += 40;
    doc
      .fontSize(10)
      .text("Thank you for your business!", 50, yPos, { align: "center" });
  }

  /**
   * Build order confirmation
   */
  buildOrderConfirmation(doc, order, options) {
    doc.fontSize(24).text("Order Confirmation", 50, 50);
    doc.fontSize(12).text(`Order #: ${order._id}`, 50, 85);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 100);

    let yPos = 140;

    doc.fontSize(14).text("Thank you for your order!", 50, yPos);
    yPos += 30;

    doc.fontSize(12).text(`Customer: ${order.customerDetails.name}`, 50, yPos);
    doc.text(`Phone: ${order.customerDetails.telNo}`, 50, yPos + 15);
    yPos += 45;

    doc.text("Order Details:", 50, yPos);
    yPos += 20;

    order.items.forEach((item) => {
      doc.text(
        `• ${item.quantity}x ${item.name} - $${item.price.toFixed(2)}`,
        70,
        yPos
      );
      yPos += 20;
    });

    yPos += 20;
    doc.fontSize(14).text(`Total: $${order.bills.total.toFixed(2)}`, 50, yPos);

    yPos += 40;
    doc
      .fontSize(12)
      .text(
        "Your order is being processed and you will receive updates shortly.",
        50,
        yPos
      );
  }

  /**
   * Add footer
   */
  addFooter(doc, config) {
    const footerY = doc.page.height - 100;
    doc.fontSize(10).text("Thank you for your business!", 50, footerY);
    doc.text(
      "For questions about this invoice, please contact us.",
      50,
      footerY + 15
    );

    if (config.website) {
      doc.text(`Visit us: ${config.website}`, 50, footerY + 30);
    }
  }

  /**
   * Utility methods
   */
  ensureTempDirectory() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`PDF cleaned up: ${filePath}`);
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
   * Generate multiple PDF types at once
   */
  async generateMultiple(order, types = ["invoice"], options = {}) {
    const results = {};

    for (const type of types) {
      try {
        switch (type) {
          case "invoice":
            results.invoice = await this.generateInvoice(order, options);
            break;
          case "receipt":
            results.receipt = await this.generateReceipt(order, options);
            break;
          case "confirmation":
            results.confirmation = await this.generateOrderConfirmation(
              order,
              options
            );
            break;
          default:
            console.warn(`Unknown PDF type: ${type}`);
        }
      } catch (error) {
        console.error(`Error generating ${type}:`, error);
        results[type] = { error: error.message };
      }
    }

    return results;
  }
}

export default new PDFService();
