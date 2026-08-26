// =====================================================================
// DOM REFERENCES — Sections & Navigation
// =====================================================================
const dashboardSec = document.getElementById("dashboard-section")
const logTransacSec = document.getElementById("log-transaction-section")
const transacRecordsSec = document.getElementById("transaction-records-section")
const accumulatedProfitSec = document.getElementById("accumulated-profit-section")
const settingsSec = document.getElementById("settings-section")
const logoutSec = document.getElementById("logout-section")
const sections = [dashboardSec, logTransacSec, transacRecordsSec, accumulatedProfitSec, settingsSec, logoutSec]

const dashboardNavBtn = document.getElementById("dashboard-nav-button")
const logTransacNavBtn = document.getElementById("log-transaction-nav-button")
const transacRecordsNavBtn = document.getElementById("transaction-records-nav-button")
const accumulatedProfitNavBtn = document.getElementById("accumulated-profit-nav-button")
const settingsNavBtn = document.getElementById("settings-nav-button")
const logoutNavBtn = document.getElementById("logout-nav-button")
const navBtns = [dashboardNavBtn, logTransacNavBtn, transacRecordsNavBtn, accumulatedProfitNavBtn, settingsNavBtn, logoutNavBtn]


// =====================================================================
// DOM REFERENCES — Log Transaction Form
// =====================================================================
const transacTypeInput = document.getElementById("transaction-type-input")
const transacTypeLabel = document.getElementById("transaction-type-label")

const mobileNumInput = document.getElementById("mobile-number-input")
const mobileNumberLabel = document.getElementById("mobile-number-label")

const refNumInput = document.getElementById("reference-number-input")
const refNumberLabel = document.getElementById("reference-number-label")

const transacAmountInput = document.getElementById("transaction-amount-input")
const transacAmountLabel = document.getElementById("transaction-amount-label")

const serviceAmountInput = document.getElementById("service-fee-input")
const serviceAmountLabel = document.getElementById("service-fee-label")

const saveTransacBtn = document.getElementById("save-transaction-button")


// =====================================================================
// DOM REFERENCES — Confirmation Modal
// =====================================================================
const confirmationModal = document.getElementById("confirmation-modal")

const cancelTransacBtn = document.getElementById("cancel-transaction-button")
const confirmTransacBtn = document.getElementById("confirm-transaction-button")

const modalTransacTypeDis = document.getElementById("modal-transaction-type-display")
const modalMobileDis = document.getElementById("modal-mobile-display")
const modalTransacAmountDis = document.getElementById("modal-transaction-amount-display")
const modalServiceAmountDis = document.getElementById("modal-service-fee-display")
const modalRefDis = document.getElementById("modal-reference-display")


// =====================================================================
// DOM REFERENCES — Transaction Records & Filters
// =====================================================================
const transacTableBody = document.getElementById("transaction-table-body")

const dateFilterSelect = document.getElementById("date-filter-select")

const customRangePopup = document.getElementById("custom-range-popup")

const customRangeBtn = document.getElementById("custom-range-apply-button")

const customRangeOption = document.getElementById("custom-range-option")
let activeCustomRangeOption = null

const startDateInput = document.getElementById("start-date-input")
const startDateLabel = document.getElementById("start-date-label")
const endDateInput = document.getElementById("end-date-input")
const endDateLabel = document.getElementById("end-date-label")

const transacFilterSelect = document.getElementById("transaction-filter-select")

const searchFilterInput = document.getElementById("search-filter-input")

const transacTableContainer = document.getElementById("transaction-table-container")
const paginationBar = document.getElementById("pagination-bar")
const noTransacVisual = document.getElementById("no-transaction-visual-container")
const clearFiltersBtn = document.getElementById("clear-filters-button")
const paginationPages = document.getElementById("pagination-pages")

const prevPageArrowBtn = document.getElementById("prev-page-arrow-button")
const nextPageArrowBtn = document.getElementById("next-page-arrow-button")

const allTransacBtn = document.getElementById("all-transactions-button");
const todayBtn = document.getElementById("today-button");
const yesterdayBtn = document.getElementById("yesterday-button");
const last7DaysBtn = document.getElementById("last-7-days-button");
const last30DaysBtn = document.getElementById("last-30-days-button");
const thisMonthBtn = document.getElementById("this-month-button");
const lastMonthBtn = document.getElementById("last-month-button");
const customRangePeriodBtn = document.getElementById("custom-range-button")
const periodBtns = [allTransacBtn, todayBtn, yesterdayBtn, last7DaysBtn, last30DaysBtn, thisMonthBtn, lastMonthBtn, customRangePeriodBtn]


const cashInDisplayTotal = document.getElementById("cash-in-display-total");
const cashOutDisplayTotal = document.getElementById("cash-out-display-total");
const serviceFeeDisplayTotal = document.getElementById("service-fee-display-total");


const customRangePopupAnalytics = document.getElementById("custom-range-popup-analytics")


// =====================================================================
// APPLICATION STATE
// =====================================================================
// The single source of truth for every saved transaction. Populated from
// localStorage on load (see DATA PERSISTENCE below), and re-saved there
// every time it changes. The table, filters, and pagination all derive
// from this array — nothing else stores its own copy.
let transactions = []

// Pagination state: which page is currently showing, and how many rows
// each page holds. `currentPageNum` is 1-indexed to match the numbered
// buttons rendered in the pagination bar (see PAGINATION below).
let currentPageNum = 1
const MAX_ROWS_PER_PAGE = 6

// Maps each form field to the DOM elements and validator it needs during
// save-time validation (see FORM VALIDATION section below).
//
//   inputElement / inputLabel  - the <input>/<select> and its <label>,
//                                so blurError() can style/rename both.
//   inputExact + inputType     - the two words plugged into the error
//                                message, e.g. "Invalid Mobile Number!"
//   validator(value)           - returns true when `value` is INVALID.
//                                `() => false` means "never invalid on
//                                its own" — only emptiness is checked
//                                for that field (see getEmptyInputs()).
const inputMapInfo = {
    transactionType: {
        inputElement: transacTypeInput,
        inputLabel: transacTypeLabel,
        inputExact: "Transaction",
        inputType: "Type",
        validator: () => false
    },
    mobileNumber: {
        inputElement: mobileNumInput,
        inputLabel: mobileNumberLabel,
        inputExact: "Mobile",
        inputType: "Number",
        validator: (inputNumValue) => checkInputNumValidity(inputNumValue, 13, "09")
    },
    transactionAmount: {
        inputElement: transacAmountInput,
        inputLabel: transacAmountLabel,
        inputExact: "Transaction",
        inputType: "Amount",
        validator: amountValueValidity
    },
    serviceFeeAmount: {
        inputElement: serviceAmountInput,
        inputLabel: serviceAmountLabel,
        inputExact: "Service Fee",
        inputType: "Amount",
        validator: amountValueValidity
    },
    referenceNumber: {  
        inputElement: refNumInput,
        inputLabel: refNumberLabel,
        inputExact: "Reference",
        inputType: "Number",
        validator: (inputNumValue) => checkInputNumValidity(inputNumValue, 15, "")
    },
}



// =====================================================================
// DATA PERSISTENCE — localStorage
// =====================================================================
// Reads the saved `transactions` array (if any) into memory. Called once,
// on startup, before the first render — see INITIALIZATION at the bottom.
function loadFromLocalStorage() {
    const savedTransactions = localStorage.getItem("transactions")

    if (savedTransactions === null) {
        return
    }

    transactions = JSON.parse(savedTransactions)
}

// Writes the current in-memory `transactions` array to localStorage.
// Called every time a transaction is added (see saveTransaction() below)
// so a page refresh never loses data.
function saveToLocalStorage () {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    )
}


// =====================================================================
// SECTION NAVIGATION — switching between pages via the sidebar
// =====================================================================
// Hides every <section>, then reveals only `showSection`. Only one
// section is ever visible at a time.
function switchSections(showSection) {
    for (const section of sections) {
        section.classList.add("hidden") 
    }
    showSection.classList.remove("hidden")
}

// Clears the "active" highlight from every nav button, then applies it
// to `activeBtn`. Kept separate from switchSections() so both can be
// called together from each button's click handler below.
function switchActiveBtn(activeBtn) {
    for (const navBtn of navBtns) {
        navBtn.classList.remove("active")
    }
    activeBtn.classList.add("active")
}

dashboardNavBtn.addEventListener("click", ()=> {
    switchSections(dashboardSec)
    switchActiveBtn(dashboardNavBtn)
})

logTransacNavBtn.addEventListener("click", ()=> {
    switchSections(logTransacSec)
    switchActiveBtn(logTransacNavBtn)
})

transacRecordsNavBtn.addEventListener("click", ()=> {
    switchSections(transacRecordsSec)
    switchActiveBtn(transacRecordsNavBtn)
})

accumulatedProfitNavBtn.addEventListener("click", ()=> {
    switchSections(accumulatedProfitSec)
    switchActiveBtn(accumulatedProfitNavBtn)
    renderSumTotalInCards(transactions)
    switchPeriodBtnActive(allTransacBtn)
})

settingsNavBtn.addEventListener("click", ()=> {
    switchSections(settingsSec)
    switchActiveBtn(settingsNavBtn)
})

logoutNavBtn.addEventListener("click", ()=> {
    switchSections(logoutSec)
    switchActiveBtn(logoutNavBtn)
})


// =====================================================================
// INPUT VALIDATION — shared helper
// =====================================================================
// Toggles the red error state (border + label text) on any form field.
// Used by every input's blur/focus handlers below, and by the
// save-time validation pass further down the file.
//
//   isInvalid                  - true = show the error state, false = clear it
//   inputElement / inputLabel  - the field and its <label> to restyle
//   inputExact + inputType     - plugged into the message, e.g.
//                                "Invalid Mobile Number!" when isInvalid,
//                                or the label reset to "Mobile Number" when not
function blurError(isInvalid, inputElement, inputLabel, inputExact, inputType) {
    if (isInvalid) {
        inputElement.classList.add("input-error")
        inputLabel.classList.add("input-error-label")
        inputLabel.innerText = `Invalid ${inputExact} ${inputType}!`
    } else {
        inputElement.classList.remove("input-error")
        inputLabel.classList.remove("input-error-label")
        inputLabel.innerText = `${inputExact} ${inputType}`
    }
}


// =====================================================================
// FIELD FORMATTING — Transaction Type
// =====================================================================
// The <select> has no formatting to do — this just clears its error
// state as soon as the user interacts with it again.
transacTypeInput.addEventListener("focus", ()=> {
    blurError(false, transacTypeInput, transacTypeLabel, "Transaction", "Type")
})


// =====================================================================
// FIELD FORMATTING — Mobile & Reference Number
// =====================================================================
// Groups a string of digits into "XXXX XXX XXXXXX"-style chunks as the
// user types (mobileNumInput uses maxLength 11, refNumInput uses 13 —
// see the two "input" listeners below). Purely cosmetic spacing; the
// digits themselves are untouched.
function inputNumberFormat(inputNumberValue, maxLength) {
    let formattedNumberValue;

     if (inputNumberValue.length > 7) {
        formattedNumberValue = `${inputNumberValue.slice(0, 4)} ${inputNumberValue.slice(4, 7)} ${inputNumberValue.slice(7, maxLength)}`
    } else if (inputNumberValue.length > 4) {
        formattedNumberValue = `${inputNumberValue.slice(0, 4)} ${inputNumberValue.slice(4, 7)}`
    } else {
        formattedNumberValue = inputNumberValue
    } return formattedNumberValue
}

// Returns true when a (formatted, spaced) number string is INVALID:
// non-empty but the wrong total length, or missing a required prefix.
// An empty value is treated as valid here on purpose — required-field
// checking is a separate concern, handled by getEmptyInputs().
//
//   maxLength      - expected length of the formatted string, spaces
//                    included (e.g. "0917 123 4567" = 13 chars)
//   requiredPrefix - e.g. "09" for mobile numbers; "" means no prefix
//                    is enforced (used for the Reference Number field)
function checkInputNumValidity(inputNumberValue, maxLength, requiredPrefix) {
    const isInputNumInvalid = inputNumberValue.length > 0 && 
                             (inputNumberValue.length !== maxLength || !inputNumberValue.startsWith(requiredPrefix))
    return isInputNumInvalid
} 

mobileNumInput.addEventListener("input", (e)=> {
    let mobileNumberValue = e.target.value.replace(/\D/g, "")
    const formattedMobNumVal = inputNumberFormat(mobileNumberValue, 11)
    e.target.value = formattedMobNumVal
})

mobileNumInput.addEventListener("blur", (e)=> {
    let mobileNumberValue = e.target.value
    const isMobNumInvalid = checkInputNumValidity(mobileNumberValue, 13, "09")
    blurError(isMobNumInvalid, mobileNumInput, mobileNumberLabel, "Mobile", "Number")
})

mobileNumInput.addEventListener("focus", ()=> {
    blurError(false, mobileNumInput, mobileNumberLabel, "Mobile", "Number")
})

refNumInput.addEventListener("input", (e)=> {
    let refNumberValue = e.target.value.replace(/\D/g, "")
    const formattedNumRefVal = inputNumberFormat(refNumberValue, 13)
    e.target.value = formattedNumRefVal
})

refNumInput.addEventListener("blur", (e)=> {
    let refNumberValue = e.target.value
    const isRefNumInvalid = checkInputNumValidity(refNumberValue, 15, "")
    blurError(isRefNumInvalid, refNumInput, refNumberLabel, "Reference", "Number")
})

refNumInput.addEventListener("focus", ()=> {
    blurError(false, refNumInput, refNumberLabel, "Reference", "Number")
})


// =====================================================================
// FIELD FORMATTING — Transaction & Service Fee Amount
// =====================================================================
// Strips anything that isn't a digit or a decimal point as the user
// types, and caps input to at most 2 decimal places and one "." —
// e.g. "12.5.6a" typed one keystroke at a time settles on "12.56".
function inputAmountFilter(inputAmountValue) {
    inputAmountValue = inputAmountValue.replace(/[^0-9.]/g, "")

    let numberBlocks = inputAmountValue.split(".")

    if (numberBlocks.length > 2) {
        inputAmountValue = numberBlocks[0] + "." + numberBlocks.slice(1).join("")
    }   
    if (inputAmountValue.includes(".")) {
        numberBlocks = inputAmountValue.split(".")

        inputAmountValue = numberBlocks[0] + "." + numberBlocks[1].slice(0, 2)
    }
    return inputAmountValue
}

// Turns a raw amount ("1000" or "1000.5") into a display-ready peso
// string with thousands separators and exactly 2 decimals ("1,000.50").
// Runs on blur, once the user is done typing (see the "blur" listeners
// below) — inputAmountFilter() above handles the live, as-you-type pass.
function inputAmountFormat(inputAmountValue) {
    let filteredAmount = String(inputAmountValue).replace(/,/g, "")
    const [pesos, centavos] = filteredAmount.split(".")

    const formattedPesos = Number(pesos).toLocaleString("en-US")

    if (centavos !== undefined) {
        return `${formattedPesos}.${centavos}`
    } else {
        return `${formattedPesos}.00`
    }
}

// Returns true (INVALID) for zero, negative, or non-numeric amounts.
function amountValueValidity(inputAmountValue) {
    const amountFloatValue = parseFloat(inputAmountValue)

    if (amountFloatValue <= 0) {
        return true
    } else {
        return false
    }
}

// The inverse of inputAmountFormat(): strips thousands separators and
// drops a trailing ".00" so the field is easy to keep editing once the
// user clicks back into it (e.g. "1,000.00" -> "1000", but "1,000.50"
// stays "1000.50" since those cents are meaningful).
function focusUnformatReturn(formattedValue) {
    let unformattedValue = String(formattedValue)
    unformattedValue = unformattedValue.replace(/,/g, "")
    unformattedValue = unformattedValue.replace(/\.00$/, "")

    return unformattedValue
}

transacAmountInput.addEventListener("input", (e)=> {
    const transacAmountValue = e.target.value
    const filteredTransacAmount = inputAmountFilter(transacAmountValue)
    e.target.value = filteredTransacAmount
})

transacAmountInput.addEventListener("blur", (e)=> {
    if (e.target.value === "") return
    
    const transacAmountValue = e.target.value
    const formattedTransacAmount = inputAmountFormat(transacAmountValue)
    e.target.value = formattedTransacAmount

    const isInvalid = amountValueValidity(transacAmountValue)
    blurError(isInvalid, transacAmountInput, transacAmountLabel, "Transaction", "Amount")
})

transacAmountInput.addEventListener("focus", (e)=> {
    const unformattedValue = focusUnformatReturn(e.target.value)
    e.target.value = unformattedValue
    blurError(false, transacAmountInput, transacAmountLabel, "Transaction", "Amount")
})

serviceAmountInput.addEventListener("input", (e)=> {
    const serviceAmountValue = e.target.value
    const filteredServiceAmount = inputAmountFilter(serviceAmountValue)
    e.target.value = filteredServiceAmount
})

serviceAmountInput.addEventListener("blur", (e)=> {
    if (e.target.value === "") return

    const serviceAmountValue = e.target.value
    const formattedServiceAmount = inputAmountFormat(serviceAmountValue)
    e.target.value = formattedServiceAmount

    const isInvalid = amountValueValidity(serviceAmountValue)
    blurError(isInvalid, serviceAmountInput, serviceAmountLabel, "Service Fee", "Amount")
})

serviceAmountInput.addEventListener("focus", (e)=> {
    const unformattedValue = focusUnformatReturn(e.target.value)
    e.target.value = unformattedValue
    blurError(false, serviceAmountInput, serviceAmountLabel, "Service Fee", "Amount")
})


// =====================================================================
// FORM VALIDATION — runs right before a transaction is saved
// =====================================================================
// Snapshot of every form field's current raw value, keyed the same way
// as inputMapInfo/createTransactionData so all three stay in sync.
function readForm() {
    return {
        transactionType: transacTypeInput.value,
        mobileNumber: mobileNumInput.value,
        transactionAmount: transacAmountInput.value,
        serviceFeeAmount: serviceAmountInput.value,
        referenceNumber: refNumInput.value
    }    
}

// Returns the keys (from readForm()) of any field left blank.
function getEmptyInputs() {
    const formData = readForm()
    const emptyInputs = []

    for (const [inputKey, value] of Object.entries(formData)) {
        if (value.trim() === "") {
            emptyInputs.push(inputKey)
        }
    }
    return emptyInputs
}

// Returns the keys (from inputMapInfo) of any *filled-in* field that
// fails its own validator — e.g. a mobile number that's the wrong
// length. Empty fields are skipped here since getEmptyInputs() already
// covers "required but missing"; this is only about malformed values.
function getInvalidInputs() {
    const invalidInputs = []

    for (const[inputKey, inputMapValue] of Object.entries(inputMapInfo)) {
        if (inputMapValue.inputElement.value === "") {
            continue
        }
        if(inputMapValue.validator(inputMapValue.inputElement.value)) {
            invalidInputs.push(inputKey)
        }
    }
    return invalidInputs
}

// Applies the red error state (via blurError()) to every field named
// in `invalidFieldArray`. Shared by both the "empty" and "invalid"
// passes in validateTransaction() below.
function showInputError(invalidFieldArray) {
    if (invalidFieldArray.length > 0) {
        for (const field of invalidFieldArray) {
            const inputMapValue = inputMapInfo[field]
            blurError(true, inputMapValue.inputElement, inputMapValue.inputLabel, inputMapValue.inputExact, inputMapValue.inputType)
        }
    }
}

// Full-form gate: flags every empty and every invalid field at once,
// then reports whether the form is clean enough to save. Called from
// showTransaction() before the confirmation modal is allowed to open.
function validateTransaction() {
    const emptyInputs = getEmptyInputs()
    const invalidInputs = getInvalidInputs()

    showInputError(emptyInputs)
    showInputError(invalidInputs)

    return emptyInputs.length === 0 && invalidInputs.length === 0
}


// =====================================================================
// TRANSACTION CRUD — build a record, render rows, preview, save, clear
// =====================================================================

// Reads the Log Transaction form and packages it into the object shape
// that gets pushed into `transactions`. `createdAt` (a real Date) drives
// every date-range filter; `dateTime` is the pre-formatted string shown
// in the table so it doesn't need reformatting on every render.
function createTransactionData() {
    return {
        createdAt: new Date(),
        dateTime: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric"
        }), 
        transactionType: transacTypeInput.value,
        mobileNumber: mobileNumInput.value,
        transactionAmount: transacAmountInput.value,
        serviceFeeAmount: serviceAmountInput.value,
        referenceNumber: refNumInput.value
    }
}

// Draws one table row per transaction in `transactionList` into the
// Transaction Records table. Expects an already-paginated slice — see
// getCurrentPageTransactions() in the PAGINATION section below — not
// the full `transactions` array.
function renderTransactions(transactionList) {
    transacTableBody.innerHTML = ""

    // Reused per row: which color class and which arrow icon to show,
    // based on that row's transaction type. Declared outside the loop
    // and reassigned each iteration rather than redeclared, since both
    // are only ever read right after being set for the current row.
    let classTextAdd;
    let imgAdd;

    for (const transaction of transactionList) {
        if (transaction.transactionType === "cash-in") {
            classTextAdd = "text-green"
            imgAdd = `<img src="images/arrow-up-icon.png" class="arrow-up-icon">`
        }

        else if (transaction.transactionType === "cash-out") {
            classTextAdd = "text-red"
            imgAdd = `<img src="images/arrow-down-icon.png" class="arrow-down-icon">`
        }

        const tableRow = `
            <tr>
                <td>${transaction.dateTime}</td>
                <td class="transac-type-td ${classTextAdd}">
                    <div class="transac-type-inner-div">
                        ${imgAdd}
                        ${transaction.transactionType}
                    </div>
                </td>
                <td>${transaction.mobileNumber}</td>
                <td>${transaction.referenceNumber}</td>
                <td class="${classTextAdd}">${transaction.transactionAmount}</td>
                <td>${transaction.serviceFeeAmount}</td>
            </tr>
            `
        transacTableBody.innerHTML += tableRow;
    }
}

// Swaps between the table view and the "No Transaction Records Found"
// empty state, based on whether `transactionList` (the *filtered*
// results, not just `transactions` as a whole) has anything in it.
function checkIfTransactionsIsEmpty(transactionList) {
    if (transactionList.length === 0) {
        noTransacVisual.classList.remove("hidden")
        transacTableContainer.classList.add("hidden")
    }
    else {
        noTransacVisual.classList.add("hidden")
        transacTableContainer.classList.remove("hidden")
    }
}

// Validates the Log Transaction form, and — only if it passes — copies
// its values into the confirmation modal and opens it. Triggered by the
// "Save Transaction" button; actually saving happens separately, once
// the user confirms (see confirmTransacBtn's listener below).
function showTransaction() {
    const modalMap = [
        {element: modalTransacTypeDis, value: transacTypeInput.value},
        {element: modalMobileDis, value: mobileNumInput.value},
        {element: modalTransacAmountDis, value: transacAmountInput.value},
        {element: modalServiceAmountDis, value: serviceAmountInput.value},
        {element: modalRefDis, value: refNumInput.value}
    ]

    const isFormValid = validateTransaction()
    if (!isFormValid) {
        return
    }
    for (const item of modalMap) {
        item.element.innerText = item.value
    }
    confirmationModal.showModal()
}

// Pushes a new transaction into state, persists it, and re-renders the
// Transaction Records table (in case it's the visible section).
function saveTransaction() {
    const transactionData = createTransactionData()
    transactions.push(transactionData)
    saveToLocalStorage()
    renderTransactionTable()
}

// Resets every Log Transaction form field back to blank, ready for the
// next entry. Called after a save is confirmed.
function clearTransaction() {
    for (const[inputMapKey, inputMapValue] of Object.entries(inputMapInfo)) {
        inputMapValue.inputElement.value = ""
    }
}

saveTransacBtn.addEventListener("click", ()=> {
    showTransaction()
})

cancelTransacBtn.addEventListener("click", ()=> {
    confirmationModal.close()
})

confirmTransacBtn.addEventListener("click", ()=> {
    saveTransaction()
    clearTransaction()
    confirmationModal.close() 
    console.log(transactions)
})


// =====================================================================
// DATE RANGE HELPERS — used by the Transaction Records filter pipeline
// =====================================================================
// Each helper takes a transaction array and returns the subset that
// falls inside a specific window. All of them read `transaction.createdAt`
// (a real Date, set in createTransactionData()) rather than the
// pre-formatted `dateTime` string. getFilteredArray() below picks
// exactly one of these to run, based on the date dropdown's value.

function getTodayTransactions(transactionArray) {
    const currentDate = new Date()

    return transactionArray.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)

        return (
            transactionDate.getFullYear() === currentDate.getFullYear() &&
            transactionDate.getMonth() === currentDate.getMonth() &&
            transactionDate.getDate() === currentDate.getDate() 
        )
    })
}

function getYesterdayTransactions(transactionArray) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    return transactionArray.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)

        return (
            transactionDate.getFullYear() === yesterday.getFullYear() &&
            transactionDate.getMonth() === yesterday.getMonth() &&
            transactionDate.getDate() === yesterday.getDate()
        )
    })
}

function getLast7DaysTransactions(transactionArray) {
    const currentDate = new Date()

    return transactionArray.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)
        const daysDifference = (currentDate - transactionDate) / 86400000

        return daysDifference >= 0 && daysDifference < 7
    })
}


function getLast30DaysTransactions(transactionArray) {
    const currentDate = new Date()
    
    return transactionArray.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)
        const daysDifference = (currentDate - transactionDate) / 86400000

        return daysDifference >= 0 && daysDifference < 30
    })
}

function getThisMonthTransactions(transactionArray) {
    const currentDate = new Date()

    return transactionArray.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)

        return (
            transactionDate.getFullYear() === currentDate.getFullYear() &&
            transactionDate.getMonth() === currentDate.getMonth()
        )
    })
}

function getLastMonthTransactions(transactionArray) {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    return transactionArray.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)

        return (
            transactionDate.getFullYear() === lastMonth.getFullYear() &&
            transactionDate.getMonth() === lastMonth.getMonth()
        )
    })
}

// Unlike the fixed windows above, this one takes explicit start/end
// Dates — filled in via the custom-range popup (see the filter pipeline
// below). Expects `endDate` to already have its time pushed to
// 23:59:59.999 so the whole end day is included, not just midnight.
function getCustomRangeTransactions(transactionArray,startDate, endDate) {
    return transactionArray.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)

        return transactionDate >= startDate && transactionDate <= endDate
    })
}


// =====================================================================
// FILTER PIPELINE — date + type + ref/mob search
// =====================================================================
// Single entry point for filtering: starts from a copy of the full
// `transactions` array, narrows it down step by step (date -> type ->
// search text), and returns whatever's left. Every filter control's
// "change"/"input" listener further down just re-renders off of this —
// none of them filter directly.
//
// Note: this function also reformats the search box's own value as a
// side effect (line below the type filter), so it's not a pure getter —
// it's meant to be called once per render, not sprinkled around freely.
function getFilteredArray() {
    let currentTransacArray = [...transactions]

    const dateValue = dateFilterSelect.value

    if (dateValue === "today") {
        currentTransacArray = getTodayTransactions(currentTransacArray)
    }
    else if (dateFilterSelect.value === "yesterday") {
        currentTransacArray = getYesterdayTransactions(currentTransacArray)
    }
    else if (dateFilterSelect.value === "last-7-days") {
        currentTransacArray = getLast7DaysTransactions(currentTransacArray)
    }
    else if (dateFilterSelect.value === "last-30-days") {
        currentTransacArray = getLast30DaysTransactions(currentTransacArray)
    }
    else if (dateFilterSelect.value === "this-month") {
        currentTransacArray = getThisMonthTransactions(currentTransacArray)
    }
    else if (dateFilterSelect.value === "last-month") {
        currentTransacArray = getLastMonthTransactions(currentTransacArray)
    }
    else if (dateFilterSelect.value === "active-custom-range") {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        endDate.setHours(23, 59, 59, 999);
        currentTransacArray = getCustomRangeTransactions(currentTransacArray, startDate, endDate)
    }

    const typeValue = transacFilterSelect.value

    if (typeValue === "cash-in") {
        currentTransacArray = currentTransacArray.filter((transaction) => {
            return transaction.transactionType === "cash-in"
        })
    }
    else if (typeValue === "cash-out") {
        currentTransacArray = currentTransacArray.filter((transaction) => {
            return transaction.transactionType === "cash-out"
        })
    }

    // Re-format the search box in place (digits only, grouped like the
    // Mobile/Reference fields) so it can be compared directly against
    // the stored, already-formatted values below.
    const rawSearchValue = searchFilterInput.value.replace(/\D/g, "");
    const formattedSearchValue = inputNumberFormat(rawSearchValue, 13)
    searchFilterInput.value = formattedSearchValue

    if (formattedSearchValue) {
        currentTransacArray = currentTransacArray.filter((transaction) => {
            return (
                transaction.mobileNumber.includes(formattedSearchValue) ||
                transaction.referenceNumber.includes(formattedSearchValue)
            )
        })
    }

    checkIfTransactionsIsEmpty(currentTransacArray)
    return currentTransacArray
}


// --- Filter control listeners ---------------------------------------
// Every listener below does the same two things: reset to page 1 (since
// the old page number may no longer make sense against the new result
// set) and re-run renderTransactionTable(), which re-filters, re-slices,
// and redraws the table + pagination bar together.

dateFilterSelect.addEventListener("change", () => {
    if (dateFilterSelect.value === "custom-range") {
        customRangePopup.classList.remove("hidden")
    }
    else {
        customRangePopup.classList.add("hidden")
        currentPageNum = 1;
        renderTransactionTable()
    }
})

transacFilterSelect.addEventListener("change", () => {
    currentPageNum = 1;
    renderTransactionTable()
})

searchFilterInput.addEventListener("input", () => {
    currentPageNum = 1;
    renderTransactionTable()
})

// Applying a custom range dynamically injects/updates a temporary
// "active-custom-range" <option> in the dropdown itself, so the picked
// range shows up as the selected label (e.g. "Jan 1, 2026 - Jan 7, 2026").

function setCustomDate() {
        if (!startDateInput.value || !endDateInput.value) {
        blurError(true, startDateInput, startDateLabel, "Starting", "Date")
        blurError(true, endDateInput, endDateLabel, "End", "Date")
        return
    }

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    endDate.setHours(23, 59, 59, 999);

    const formattedStart = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    })

    const formattedEnd = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    })

    const formattedRange = `${formattedStart} - ${formattedEnd}`;

    if (!activeCustomRangeOption) {
        activeCustomRangeOption = document.createElement("option")
        activeCustomRangeOption.value = "active-custom-range"

        dateFilterSelect.insertBefore(
            activeCustomRangeOption,
            customRangeOption
        )
    }

    activeCustomRangeOption.textContent = formattedRange
    dateFilterSelect.value = activeCustomRangeOption.value

    customRangeOption.textContent = "Edit Custom Range"

    currentPageNum = 1;
    renderTransactionTable()

    customRangePopup.classList.add("hidden")
}



customRangeBtn.addEventListener("click", () => {
    setCustomDate()
})

startDateInput.addEventListener("focus", () => {
    blurError(false, startDateInput, startDateLabel, "Starting", "Date")
})

endDateInput.addEventListener("focus", () => {
    blurError(false, endDateInput, endDateLabel, "End", "Date")
})


clearFiltersBtn.addEventListener("click", () => {
    dateFilterSelect.value = "all-transactions"
    transacFilterSelect.value = "all-transaction-types"
    searchFilterInput.value = ""
    
    currentPageNum = 1;
    renderTransactionTable()
})

// =====================================================================
// PAGINATION — slicing the filtered list into pages, the page-number
// buttons, and the prev/next arrows
// =====================================================================
// How many pages the *current* filtered result set needs. Re-runs
// getFilteredArray() itself (rather than taking the array as a param)
// so callers can ask for this without having to filter first.
function getTotalPages() {
    const totalTransactions = getFilteredArray().length
    const totalPages = Math.ceil(totalTransactions / MAX_ROWS_PER_PAGE)

    return totalPages
}

// Slices out just the rows for `currentPageNum` from an already-filtered
// array. Page numbers are 1-indexed, so page 1 is index 0..MAX_ROWS_PER_PAGE.
function getCurrentPageTransactions(filteredArray) {
    const startIndex = (currentPageNum - 1) * MAX_ROWS_PER_PAGE
    const endIndex = startIndex + MAX_ROWS_PER_PAGE

    return filteredArray.slice(startIndex, endIndex)
}

// Rebuilds the row of numbered page buttons from scratch (1..totalPages),
// marking whichever one matches `currentPageNum` as active. Clicking a
// button jumps straight to that page and re-renders everything.
function renderPaginationNumbers() {
    paginationPages.innerHTML = ""

    const totalPageNum = getTotalPages()

    for (let pageNum = 1; pageNum <= totalPageNum; pageNum++) {
        const paginationNumBtn = document.createElement("button")
        paginationNumBtn.classList.add("pagination-page");

        if (pageNum == currentPageNum) {
            paginationNumBtn.classList.add("active-page-num")
        }

        paginationNumBtn.addEventListener("click", () => {
            currentPageNum = pageNum
            renderTransactionTable()
        })

        paginationNumBtn.textContent = pageNum
        paginationPages.appendChild(paginationNumBtn)
    }

    // No point showing pagination controls for a single page — hide the
    // whole bar until there's actually more than one page to move between.
    if (totalPageNum > 1) {
        paginationBar.classList.remove("hidden")
    }
    else {
        paginationBar.classList.add("hidden")
    }
}

// The main render entry point for the Transaction Records section.
// Filters -> clamps the current page (in case a filter shrank the
// result set below it) -> slices out that page's rows -> redraws the
// table, the page-number buttons, and the arrow enabled/disabled state.
// Called after every save, filter change, and pagination click.
function renderTransactionTable() {
    const filteredArray = getFilteredArray()

    if (currentPageNum > getTotalPages()) {
        currentPageNum = 1;
    }

    const currentPageTransactions = getCurrentPageTransactions(filteredArray)

    renderTransactions(currentPageTransactions)
    renderPaginationNumbers()
    updatePaginationArrows()
}

// Disables the Prev arrow on page 1, and the Next arrow on the last page.
function updatePaginationArrows() {
    prevPageArrowBtn.disabled = currentPageNum === 1
    nextPageArrowBtn.disabled = currentPageNum === getTotalPages()
}

prevPageArrowBtn.addEventListener("click", () => {
    if (currentPageNum > 1) {
        currentPageNum--;
        renderTransactionTable();
    }
});

nextPageArrowBtn.addEventListener("click", () => {
    if (currentPageNum < getTotalPages()) {
        currentPageNum++;
        renderTransactionTable();
    }
});


function getTransactionAmountTotal(dateFilteredArray, transacTypeString) {
    let transactionAmount = 0

    for (const transaction of dateFilteredArray) {
        if (transaction.transactionType === transacTypeString) {
            transactionAmount = transactionAmount + parseFloat(transaction.transactionAmount.replace(/,/g, ""))
        }
    }
    
    return transactionAmount
}

function getServiceFeeTotal(dateFilteredArray) {
    let serviceFee = 0

    for (const transaction of dateFilteredArray) {
        serviceFee = serviceFee + parseFloat(transaction.serviceFeeAmount.replace(/,/g, ""))
    }
    return serviceFee
}


function renderSumTotalInCards(transactionArray) {
    cashInDisplayTotal.textContent = `₱${inputAmountFormat(getTransactionAmountTotal(transactionArray, "cash-in"))}`
    cashOutDisplayTotal.textContent  = `₱${inputAmountFormat(getTransactionAmountTotal(transactionArray, "cash-out"))}`
    serviceFeeDisplayTotal.textContent = `₱${inputAmountFormat(getServiceFeeTotal(transactionArray))}`
}

function switchPeriodBtnActive(showPeriodBtn) {
    for (const periodBtn of periodBtns) {
        periodBtn.classList.remove("profit-period-btn-active")
    }
    showPeriodBtn.classList.add("profit-period-btn-active")
    showCustomRangePopupAnalytics()
}

function showCustomRangePopupAnalytics() {
    if(customRangePeriodBtn.classList.contains("profit-period-btn-active")) {
        customRangePopupAnalytics.classList.remove("hidden")
    }
    else {
        customRangePopupAnalytics.classList.add("hidden")
    }
}



allTransacBtn.addEventListener("click", () => {
    renderSumTotalInCards(transactions)
    switchPeriodBtnActive(allTransacBtn)
});

todayBtn.addEventListener("click", () => {
    renderSumTotalInCards(getTodayTransactions(transactions))
    switchPeriodBtnActive(todayBtn)
});

yesterdayBtn.addEventListener("click", () => {
    renderSumTotalInCards(getYesterdayTransactions(transactions))
    switchPeriodBtnActive(yesterdayBtn)

});

last7DaysBtn.addEventListener("click", () => {
    renderSumTotalInCards(getLast7DaysTransactions(transactions))
    switchPeriodBtnActive(last7DaysBtn)
});

last30DaysBtn.addEventListener("click", () => {
    renderSumTotalInCards(getLast30DaysTransactions(transactions))
    switchPeriodBtnActive(last30DaysBtn)

});

thisMonthBtn.addEventListener("click", () => {
    renderSumTotalInCards(getThisMonthTransactions(transactions))
    switchPeriodBtnActive(thisMonthBtn)

});

lastMonthBtn.addEventListener("click", () => {
    renderSumTotalInCards(getLastMonthTransactions(transactions))
    switchPeriodBtnActive(lastMonthBtn)
});

customRangePeriodBtn.addEventListener("click", () => {
    switchPeriodBtnActive(customRangePeriodBtn)
})


// =====================================================================
// INITIALIZATION
// =====================================================================
// Load any saved transactions, then draw the Transaction Records table
// once so it's ready the moment that section is opened (rather than
// waiting for the nav button's click handler to trigger a first render).
loadFromLocalStorage()
renderTransactionTable()    