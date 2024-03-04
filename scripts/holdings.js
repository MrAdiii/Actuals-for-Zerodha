/**
 * @param {Object} tableElement
 * @param {Number} columnIndex
 */
function sumTableColumn(tableElement, columnIndex) {
  // Check if the provided arguments are valid
  if (!tableElement || !columnIndex) {
    throw new Error(
      "Invalid arguments: Please provide a table element and a column index"
    );
  }

  // Get all rows of the table
  const rows = tableElement.querySelectorAll("tr");

  // Initialize sum to 0
  let sum = 0;

  // Loop through each row
  for (const row of rows) {
    // Get the cell at the specified column index
    const cell = row.querySelector(`td:nth-child(${columnIndex + 1})`);

    // Check if the cell exists and has a numeric value
    if (cell && !isNaN(parseFloat(cell.textContent))) {
      // Add the cell value to the sum (convert to number first)
      sum += parseFloat(cell.textContent);
    }
  }

  // Return the calculated sum
  return sum;
}

/**
 * @param {Float} bp
 * @param {Float} sp
 * @param {Number} qty
 */
function calDelivery(bp, sp, qty, nse = true) {
  var turnover = parseFloat(parseFloat((bp + sp) * qty).toFixed(2));

  var brokerage = 0;

  var stt_total = Math.round(
    parseFloat(parseFloat(turnover * 0.001).toFixed(2))
  );

  var sebi_charges = parseFloat(parseFloat(turnover * 0.000001).toFixed(2));

  var exc_trans_charge = nse
    ? parseFloat(parseFloat(0.0000325 * turnover).toFixed(2))
    : parseFloat(parseFloat(0.0000375 * turnover).toFixed(2));

  var cc = 0;
  var dp = 15.93;
  if (sp == 0) dp = 0;

  var nse_ipft = nse
    ? parseFloat(parseFloat(0.000001 * turnover).toFixed(2))
    : 0;

  exc_trans_charge = parseFloat(
    parseFloat(exc_trans_charge + nse_ipft).toFixed(2)
  );

  var stax = parseFloat(
    parseFloat(0.18 * (brokerage + exc_trans_charge + sebi_charges)).toFixed(2)
  );

  var stamp_charges = Math.round(
    parseFloat(parseFloat(bp * qty * 0.00015).toFixed(2))
  );

  var total_tax = parseFloat(
    parseFloat(
      brokerage +
        stt_total +
        exc_trans_charge +
        cc +
        dp +
        stax +
        sebi_charges +
        stamp_charges
    ).toFixed(2)
  );

  var breakeven = parseFloat(parseFloat(total_tax / qty).toFixed(2));
  breakeven = isNaN(breakeven) ? 0 : breakeven;

  var net_profit = parseFloat(
    parseFloat((sp - bp) * qty - total_tax).toFixed(2)
  );

  return {
    turnover,
    brokerage,
    stt_total,
    exc_trans_charge,
    dp,
    stax,
    sebi_charges,
    stamp_charges,
    total_tax,
    breakeven,
    net_profit,
  };
}

/**
 * @param {String} text
 */
function trimNumber(text) {
  return Number(text.trim().replace(",", ""));
}

function delayedFunction() {
  console.log("Started");
  const table = document.querySelector("table");
  const theadTr = table.querySelector("thead tr");
  const holdings = table.querySelectorAll("tbody tr");

  if (table) {
    // Table found, perform your logic to insert elements
    console.log("Table found");

    // Create Charges Table header
    const thCharges = document.createElement("th");
    thCharges.classList.add("charges", "right", "sortable");
    thCharges.textContent = "Charges";

    // Insert Charges Header
    existingHeaders = theadTr.querySelectorAll("th");
    theadTr.insertBefore(
      thCharges,
      existingHeaders[existingHeaders.length - 1].nextSibling
    );

    // Create Actual Table header
    const thActual = document.createElement("th");
    thActual.classList.add("Actual", "right", "sortable");
    thActual.textContent = "Actual P/L";

    // Insert Actual Header
    existingHeaders = theadTr.querySelectorAll("th");
    theadTr.insertBefore(
      thActual,
      existingHeaders[existingHeaders.length - 1].nextSibling
    );

    for (const holding of holdings) {
      console.log(holding);
      const charges = calDelivery(
        (bp = trimNumber(holding.querySelectorAll("td")[2].textContent)),
        (sp = trimNumber(holding.querySelectorAll("td")[3].textContent)),
        (qty = trimNumber(holding.querySelectorAll("td")[1].textContent))
      );

      // Add Cell with data at the end of row
      newCell = document.createElement("td");
      newCell.classList.add("charges", "text-red");
      newCell.textContent = charges.total_tax;

      holding.appendChild(newCell);

      // Add Cell with data at the end of row
      newCell = document.createElement("td");
      newCell.classList.add(
        "actuals",
        charges.net_profit < 0 ? "text-red" : "text-green"
      );
      newCell.textContent = charges.net_profit;

      holding.appendChild(newCell);
    }

    // Create total charges table footer
    totalCharges = sumTableColumn(table, 8);
    footerRow = table.querySelector("tfoot tr");
    footerCell = document.createElement("td");
    footerCell.classList.add("charges", "text-red");
    footerCell.textContent = totalCharges;
    // Insert total charges in footer
    footerRow.insertBefore(
      footerCell,
      footerRow.querySelector("td:last-child").nextSibling
    );

    // Create total actual table footer
    actual = sumTableColumn(table, 9);
    footerRow = table.querySelector("tfoot tr");
    footerCell = document.createElement("td");
    footerCell.classList.add("actuals", actual < 0 ? "text-red" : "text-green");
    footerCell.textContent = actual;
    // Insert total actual in footer
    footerRow.insertBefore(
      footerCell,
      footerRow.querySelector("td:last-child").nextSibling
    );
  }
}

setTimeout(delayedFunction, 2000);
