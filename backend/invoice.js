const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function createInvoice(invoiceData, filePath) {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text('Rechnung', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Kunde: ${invoiceData.customerAddress}`);
  doc.text(`Datum: ${new Date().toLocaleDateString('de-AT')}`);
  doc.moveDown();

  doc.text('Artikel:');
  invoiceData.items.forEach((item, index) => {
    doc.text(`${index + 1}. ${item.name} – ${item.price}`);
  });

  doc.moveDown();
  doc.text(`Gesamt: ${invoiceData.total}`, { bold: true });

  doc.end();
}

module.exports = createInvoice;
