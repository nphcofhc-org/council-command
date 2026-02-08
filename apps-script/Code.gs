/**
 * NPHC Portal Apps Script (Sheets JSON API + Simple Write API)
 *
 * Goals:
 * - Zero manual copy/paste updates: use Google Forms + Sheet formulas/triggers, or POST updates here.
 * - Simple client reads: GET ?tab=TabName returns JSON rows for the tab.
 *
 * Deploy:
 * - Extensions -> Apps Script
 * - Deploy -> New deployment -> Web app
 * - Execute as: Me
 * - Who has access: Anyone (if you want the portal public)
 *
 * If you want basic protection without full auth, set API_TOKEN below and require it for GET/POST.
 */

// Optional shared secret for "good enough" protection. Leave empty for fully public.
var API_TOKEN = ""; // e.g. "change-me"

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function requireToken_(e) {
  if (!API_TOKEN) return;
  var token = (e && e.parameter && e.parameter.token) || "";
  if (token !== API_TOKEN) {
    throw new Error("Unauthorized");
  }
}

function getSheet_(tabName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName(tabName);
  if (!ws) throw new Error('Unknown tab "' + tabName + '"');
  return ws;
}

function getHeaders_(ws) {
  var values = ws.getDataRange().getValues();
  if (!values || values.length === 0) return [];
  return values[0].map(function (h) { return String(h || "").trim(); });
}

function rowsToObjects_(values) {
  if (!values || values.length < 2) return [];
  var headers = values[0].map(function (h) { return String(h || "").trim(); });
  return values.slice(1).filter(function(row){
    // ignore fully empty rows
    for (var i = 0; i < row.length; i++) if (row[i] !== "" && row[i] != null) return true;
    return false;
  }).map(function (row) {
    var obj = {};
    for (var i = 0; i < headers.length; i++) {
      var key = headers[i];
      if (!key) continue;
      obj[key] = row[i];
    }
    return obj;
  });
}

/**
 * GET endpoint.
 *
 * - `?tab=QuickLinks` returns JSON rows from that sheet.
 * - For SiteConfig you can either:
 *   - Use key/value rows with headers `key,value` (recommended), OR
 *   - Use a single-row sheet with many columns.
 *
 * This returns whatever shape your sheet stores; your frontend transform can handle it.
 */
function doGet(e) {
  requireToken_(e);
  var tab = (e && e.parameter && e.parameter.tab) || "";
  if (!tab) return jsonResponse_({ error: 'Missing required query param "tab".' });

  var ws = getSheet_(tab);
  var values = ws.getDataRange().getValues();
  var rows = rowsToObjects_(values);
  return jsonResponse_(rows);
}

/**
 * POST endpoint.
 *
 * Body JSON:
 * - action: "upsert" | "append" | "delete" | "replace"
 * - tab: string
 * - data: array of row objects
 *
 * Notes:
 * - Uses the first row as headers. Keys not in headers are ignored.
 * - For upsert/delete, requires `id` column.
 */
function doPost(e) {
  requireToken_(e);
  var payload = {};
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    return jsonResponse_({ ok: false, error: "Invalid JSON" });
  }

  var action = String(payload.action || "").toLowerCase();
  var tab = String(payload.tab || "");
  var data = payload.data || [];

  if (!action || !tab) return jsonResponse_({ ok: false, error: "Missing action/tab" });
  if (!Array.isArray(data)) return jsonResponse_({ ok: false, error: "data must be an array" });

  var ws = getSheet_(tab);
  var headers = getHeaders_(ws);
  if (headers.length === 0) return jsonResponse_({ ok: false, error: "Sheet has no header row" });

  if (action === "replace") {
    // Clears everything except the header row, then writes all data rows.
    if (ws.getLastRow() > 1) ws.getRange(2, 1, ws.getLastRow() - 1, ws.getLastColumn()).clearContent();
    appendRows_(ws, headers, data);
    return jsonResponse_({ ok: true, action: action, tab: tab, count: data.length });
  }

  if (action === "append") {
    appendRows_(ws, headers, data);
    return jsonResponse_({ ok: true, action: action, tab: tab, count: data.length });
  }

  if (action === "upsert") {
    var result = upsertRows_(ws, headers, data);
    return jsonResponse_({ ok: true, action: action, tab: tab, inserted: result.inserted, updated: result.updated });
  }

  if (action === "delete") {
    var deleted = deleteRows_(ws, headers, data);
    return jsonResponse_({ ok: true, action: action, tab: tab, deleted: deleted });
  }

  return jsonResponse_({ ok: false, error: "Unknown action: " + action });
}

function normalizeKey_(s) {
  return String(s || "").trim();
}

function objectToRow_(headers, obj) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    row.push(obj.hasOwnProperty(key) ? obj[key] : "");
  }
  return row;
}

function appendRows_(ws, headers, objects) {
  if (!objects.length) return;
  var rows = objects.map(function (o) { return objectToRow_(headers, o); });
  ws.getRange(ws.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
}

function getIdColumnIndex_(headers) {
  for (var i = 0; i < headers.length; i++) {
    if (normalizeKey_(headers[i]) === "id") return i;
  }
  return -1;
}

function buildIdRowMap_(ws, idColIndex) {
  var lastRow = ws.getLastRow();
  if (lastRow < 2) return {};
  var idValues = ws.getRange(2, idColIndex + 1, lastRow - 1, 1).getValues();
  var map = {};
  for (var i = 0; i < idValues.length; i++) {
    var id = String(idValues[i][0] || "").trim();
    if (id) map[id] = 2 + i; // sheet row number
  }
  return map;
}

function upsertRows_(ws, headers, objects) {
  var idColIndex = getIdColumnIndex_(headers);
  if (idColIndex === -1) throw new Error('Upsert requires an "id" column in header row');

  var idToRow = buildIdRowMap_(ws, idColIndex);
  var inserted = 0;
  var updated = 0;

  objects.forEach(function (obj) {
    var id = String(obj.id || "").trim();
    if (!id) throw new Error("Upsert requires id for each row object");

    var rowValues = objectToRow_(headers, obj);
    var existingRow = idToRow[id];
    if (existingRow) {
      ws.getRange(existingRow, 1, 1, headers.length).setValues([rowValues]);
      updated++;
    } else {
      ws.getRange(ws.getLastRow() + 1, 1, 1, headers.length).setValues([rowValues]);
      inserted++;
    }
  });

  return { inserted: inserted, updated: updated };
}

function deleteRows_(ws, headers, objects) {
  var idColIndex = getIdColumnIndex_(headers);
  if (idColIndex === -1) throw new Error('Delete requires an "id" column in header row');

  var ids = objects.map(function (o) { return String(o.id || "").trim(); }).filter(function (x) { return x; });
  if (!ids.length) return 0;

  var idToRow = buildIdRowMap_(ws, idColIndex);
  var rowsToDelete = ids.map(function (id) { return idToRow[id]; }).filter(function (r) { return !!r; });

  // Delete bottom-up to preserve row numbers.
  rowsToDelete.sort(function (a, b) { return b - a; });
  rowsToDelete.forEach(function (rowNum) { ws.deleteRow(rowNum); });
  return rowsToDelete.length;
}

/**
 * Optional helper: create tabs + write headers.
 *
 * Edit the table below to match your frontend `types.ts` fields.
 * Run `setupSheets()` once from the Apps Script editor.
 */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var schema = {
    "SiteConfig": ["key", "value"],
    "QuickLinks": ["id", "label", "iconName", "url", "row"],
    "Updates": ["id", "title", "date", "type"],
    "Officers": ["id", "name", "title", "chapter", "email", "phone", "status"],
    "Delegates": ["id", "name", "chapter", "role", "email", "phone", "status"],
    "GoverningDocs": ["id", "title", "type", "updated", "fileUrl"],
    "UpcomingMeetings": ["id", "title", "date", "time", "location", "type"],
    "MeetingRecords": ["id", "date", "title", "agendaFile", "minutesFile", "status"],
    "DelegateReports": ["id", "meetingCycle", "chapter", "submittedBy", "dateSubmitted", "status"],
    "Events": ["id", "title", "date", "location", "description", "type", "registration"],
    "EventArchive": ["id", "title", "date", "attendees", "status"],
    "EventFlyers": ["id", "title", "type", "date", "fileUrl"],
    "SignupForms": ["id", "title", "description", "deadline", "status", "formUrl"],
    "SharedForms": ["category", "id", "name", "description", "link"],
    "NationalOrgs": ["id", "name", "website", "founded"],
    "TrainingResources": ["id", "title", "description", "type", "updated", "fileUrl"],
    "InternalDocs": ["category", "iconName", "id", "name", "updated", "status"],
    "Tasks": ["id", "task", "assignedTo", "dueDate", "priority", "status"]
  };

  Object.keys(schema).forEach(function (tabName) {
    var headers = schema[tabName];
    var ws = ss.getSheetByName(tabName);
    if (!ws) ws = ss.insertSheet(tabName);
    ws.clearContents();
    ws.getRange(1, 1, 1, headers.length).setValues([headers]);
    ws.setFrozenRows(1);
  });
}

