/**
 * Assignment 2
 * Name: Farid Abdul Rehman
 * ID: 60304642
 * section 8
 * 
 */
const prompt = require("prompt-sync")();
const business = require("./business")

async function showAllEmployees(){
     /**
     * Choice 1: using business layer, Fetches and displays a formatted list of all employees.
     * @returns {void}
     */

    const employees = await business.getAllEmployees("employees.json");
    console.log("Employee ID Name\t\tPhone")
    console.log("----------- ------------------- ---------")
    for (let e of employees) {
        console.log(e.employeeId + "\t    " + e.name + "\t\t" + e.phone);
    }
}
async function viewEmployeeSchedule(e_id) {
    /**
     * Choice 4: gets employee shifts as list from business layer
     *  then, displays a CSV-style schedule from that list.
     * @param {string} e_id - The unique employee identifier.
     * @returns {Promise<void>}
     */




    // gets list of shifts assiciated with e_id:
    let allShifts = await business.getEmployeeSchedule(e_id)

    console.log("\ndate,startTime,endTime");
    for (let shift of allShifts) {
            console.log(`${shift.date},${shift.startTime},${shift.endTime}`);
    }
    console.log("\n")


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
            await business.addEmployee(name, phone);
            console.log("employee added...")

        } else if (choice === '3') {
            const employee_id = prompt("Enter employee ID: ");
            const shift_id = prompt(" Enter shift ID: ");
            const message = await business.assignEmployee(employee_id, shift_id);
            console.log("\n"+message+"\n");

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