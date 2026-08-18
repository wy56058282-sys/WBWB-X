export const manifestColumns = [
  'id',
  'page',
  'order',
  'purpose',
  'sourceUrl',
  'calibrationPath',
  'replacementPath',
  'sourceWidth',
  'sourceHeight',
  'format',
  'status',
]
export const csvColumns = [...manifestColumns, 'notes']

function csvCell(value) {
  if (value === null) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function parseCsv(csv, filePath) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]

    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        cell += character
      }
    } else if (character === '"') {
      quoted = true
    } else if (character === ',') {
      row.push(cell)
      cell = ''
    } else if (character === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (character !== '\r') {
      cell += character
    }
  }

  if (quoted) throw new Error(`Unterminated quoted CSV cell in ${filePath}`)
  if (row.length > 0 || cell.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

export function csvFor(records, notesById = new Map()) {
  const rows = [
    csvColumns,
    ...records.map((record) => [
      ...manifestColumns.map((column) => record[column]),
      notesById.get(record.id) ?? '',
    ]),
  ]
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`
}
