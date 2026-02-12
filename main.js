/**
 * Assignment 1
 * Name: Farid Abdul Rehman
 * ID: 60304642
 * section 8
 * 
 */
const prompt = require("prompt-sync")();
const fs = require("fs/promises");

async function loadData(fileName) {
    /**
     * Loads and parses JSON data from a local file.
     * @param {string} fileName - The path or name of the JSON file.
     * @returns {Objects[]} returns list of objects from the JSON file.
     */

    const employees = await fs.readFile(fileName);
    return JSON.parse(employees);
}
async function writeToFile(newData, fileName) {
    /**
     * Stringifies data and writes it to a JSON file
     * @param {any[]} newData - The array of data to be saved.
     * @param {string} fileName - The destination file path.
     * @returns {void}
     */

    const newList = JSON.stringify(newData, null, 2); // null, 2 to auto formate the stringified json
    await fs.writeFile(fileName, newList, "utf-8");
}
async function showAllEmployees() {
    /**
     * Choice 1: Fetches and displays a formatted list of all employees.
     * @returns {void}
     */

    const employees = await loadData("employees.json");
    console.log("Employee ID Name\t\tPhone")
    console.log("----------- ------------------- ---------")
    for (let e of employees) {
        console.log(e.employeeId + "\t    " + e.name + "\t\t" + e.phone);
    }
}
function makeID4spacesLong(letter, idNum) {
    /**
      * Adds zeros to id strings to ensure it is 4 characters long
      * @param {string} letter - The prefix letter (e.g., 'E' or 'S').
      * @param {number|string} idNum - The numeric portion of the ID.
      * @returns {string} The formatted ID string (e.g., "E007" or "S002").
      */

    let zeros = "";
    let id = `${letter}${idNum}`;
    while (id.length < 4) {
        zeros = zeros + "0"
        id = `${letter}${zeros}${idNum}`
    }
    return id
}
async function addEmployee(name, phone) {
    /**
     * Choice 2: adds new employee to employees.json, givens incremental id to the new employee
     * @param {string} name - Name of the new employee
     * @param {string} phone - Phone number of the new employee
     * @returns {void}
     */




    //loading the employee data from previous function:
    let employees = await loadData("employees.json");

    //accessing the numeric part of the last employee's id:
    let lastEmployeeId = parseInt(employees[employees.length - 1].employeeId.slice(1));
    const id = makeID4spacesLong("E", lastEmployeeId + 1);


    employees.push({ "employeeId": id, "name": name, "phone": phone });

    await writeToFile(employees, "employees.json");

    console.log("Employee added...")
}



async function getEmployeeShifts(e_id) {
    /**
     * Retrieves an array of shift ids assigned to a specific employee.
     * @param {string} e_id - The unique identifier of the employee.
     * @returns {string[]} the array of shift ids
     */
    let assignments = await loadData("assignments.json");
    let shiftIds = []
    for (let a of assignments) {
        if (a.employeeId === e_id) {
            shiftIds.push(a.shiftId);
        }
    }
    return shiftIds;
}
async function assignEmployee(e_id, s_id) {

    /**
     * Choice 3: Validates existence and prevents duplicates before assigning an employee to a shift.
     * @param {string} e_id - The unique employee identifier.
     * @param {string} s_id - The unique shift identifier.
     * @returns {void}
     */
    let shifts = await loadData("shifts.json");
    let employees = await loadData("employees.json");


    // handling error messages:

    //making sure employee with e_id already exists:
    let e_exists = false;
    for (let e of employees) {
        if (e.employeeId === e_id) {
            e_exists = true;
            break;
        }
    }
    if (!e_exists) {
        console.log("Employee does not exist.")
        return;
    }
    //making sure shift with s_id already exists:
    let s_exists = false;
    for (let s of shifts) {
        if (s.shiftId === s_id) {
            s_exists = true;
            break;
        }
    }
    if (!s_exists) {
        console.log("Shift does not exist")
        return;
    }

    // make sure the employee is not assigned to the s_id shift
    const alreadyAssigned = (await getEmployeeShifts(e_id)).includes(s_id);
    if (alreadyAssigned) {
        console.log("Employee already assigned to shift")
        return
    }
    // end of checking errors

    //assigning employee e_id to s_id shift:
    let assignments = await loadData("assignments.json");
    assignments.push({
        "employeeId": e_id,
        "shiftId": s_id
    })
    await writeToFile(assignments, 'assignments.json');
    console.log("Shift Recorded");



}

async function viewEmployeeSchedule(e_id) {
    /**
     * Choice 4: Generates and logs a CSV-style schedule for a specific employee.
     * @param {string} e_id - The unique employee identifier.
     * @returns {Promise<void>}
     */



    // getting shiftIds as array from helper function:
    let currentShiftIds = await getEmployeeShifts(e_id);

    let allShifts = await loadData("shifts.json");
    console.log("date,startTime,endTime");
    for (let shift of allShifts) {
        if (currentShiftIds.includes(shift.shiftId)) {
            console.log(`${shift.date},${shift.startTime},${shift.endTime}`);

        }
    }


}


async function main() {
 /**
 * Application entry point; handles the main menu loop and user input routing.
 * @returns {Promise<void>}
 */
        while (true) {
        console.log(`1. Show all employees
2. Add new employee
3. Assign employee to shift
4. View employee schedule
5. Exit`);
        let choice = prompt("What is your choice>");
        if (choice === '1') {
            await showAllEmployees();

        } else if (choice === '2') {
            const name = prompt("Enter employee name: ");
            const phone = prompt("Enter phone number: ");
            await addEmployee(name, phone);

        } else if (choice === '3') {
            const employee_id = prompt("Enter employee ID: ");
            const shift_id = prompt(" Enter shift ID: ");
            await assignEmployee(employee_id, shift_id);

        } else if (choice === '4') {
            const employee_id = prompt("Enter employee ID: ");
            await viewEmployeeSchedule(employee_id);

        } else if (choice === '5') {
            console.log("exiting the looop");
            break;

        } else {
            console.log("Invalid Option");
        }
    }


}
main();
