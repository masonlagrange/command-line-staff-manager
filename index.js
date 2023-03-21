const inquirer = require('inquirer')
const cTable = require('console.table')
const connection = require('./server')
const Employee = require('./lib/Employee')
const console = require('console')
const Role = require('./lib/Role')

// Inquirer prompt for main menu
function mainMenu() {
    return inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
            'View all employees',
            'Add employee',
            'Update employee role',
            'View all roles',
            'Add role',
            'View all departments',
            'Add deparment',
            'Exit'
        ]
    })
}

// Inquirer prompt to add a department
async function addDepartment() {
    const {newDept} = await inquirer.prompt({
            type: 'input',
            message: 'What is the name of the department',
            name: 'newDept',
    })
    await connection.promise().query(`INSERT INTO department (name) 
                    VALUES ('${newDept}');`)
}

// Function to define department list
const departmentList = async () => {
    const departmentListQuery = `SELECT name FROM department;`
    const departments = await connection.promise().query(departmentListQuery)
    return departments[0]
}

// Function to return role list
const roleList = async () => {
    const roleListQuery = `SELECT title AS name FROM role;`
    const roles = await connection.promise().query(roleListQuery)
    return roles[0]
}

// Function to return manager list
const managerList = async () => {
    const managerListQuery = `SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee;`
    const managers = await connection.promise().query(managerListQuery)
    const list = managers[0]
    return list
}

// Inquirer prompt to add a role
const addRole = async () => {
    const {newRole, newSalary, newRoleDept} = await inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the role?',
            name: 'newRole'
        },
        {
            type: 'input',
            message: 'What is the salary of the role?',
            name: 'newSalary'
        },
        {
            type: 'list',
            message: 'Which department does the role belong to?',
            name: 'newRoleDept',
            choices: await departmentList()
        }
    ])
    const roleDept = await connection.promise().query(`SELECT id FROM department WHERE name='${newRoleDept}'`)
    const deptFinal = JSON.stringify(roleDept[0])
    const deptID = deptFinal.match(/\d+/)
    const newRoleObj = new Role (newRole, newSalary, deptID[0])
    await connection.promise().query(`INSERT INTO role (title, salary, department_id) 
                    VALUES (${newRoleObj.getAdd()});`)
}

// Inquirer prompt to add an employee
const addEmployee = async () => {
    const {newEmpFName, newEmpLName, newEmpRole, newEmpManager} = await inquirer.prompt([
        {
            type: 'input',
            message: "What is the employee's first name?",
            name: 'newEmpFName',
        },
        {
            type: 'input',
            message: "What is the employee's last name?",
            name: 'newEmpLName',
        },
        {
            type: 'list',
            message: "What is the employee's role?",
            name: 'newEmpRole',
            choices: await roleList()
        },
        {
            type: 'list',
            message: "Who is the employee's manager?",
            name: 'newEmpManager',
            choices: await managerList()
        }
    ])
    // REGEX replacements and variable reassignments to retrieve proper formatting for IDs
    const empRole = await connection.promise().query(`SELECT id FROM role WHERE title='${newEmpRole}'`)
    const roleFinal = JSON.stringify(empRole[0])
    const roleID = roleFinal.match(/\d+/)
    const empSplitNames = newEmpManager.split(' ')
    const empManager = await connection.promise().query(`SELECT id FROM employee WHERE (first_name='${empSplitNames[0]}') AND (last_name='${empSplitNames[1]}')`)
    const managerFinal = JSON.stringify(empManager[0])
    const managerID = managerFinal.match(/\d+/)
    const newEmp = new Employee(newEmpFName, newEmpLName, roleID[0], managerID[0])
    
    await connection.promise().query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                    VALUES (${newEmp.getAdd()});`)
}

// Inquirer prompt to update an employee role
const updateRole = async () => {
    const {employeeChoice, newRoleChoice} = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeChoice',
            message: "Which employee's role do you want to update?",
            choices: await managerList()
        },
        {
            type: 'list',
            name: 'newRoleChoice',
            message: 'Which role do you want to assign the selected employee?',
            choices: await roleList()
        }
    ])  
    const empSplitNames = employeeChoice.split(' ')
    const empID = await connection.promise().query(`SELECT id FROM employee WHERE (first_name='${empSplitNames[0]}') AND (last_name='${empSplitNames[1]}')`)
    const idFinal = JSON.stringify(empID[0])
    const ID = idFinal.match(/\d+/)
    const empRoleUpdate = await connection.promise().query(`SELECT id FROM role WHERE title='${newRoleChoice}'`)
    const roleFinal = JSON.stringify(empRoleUpdate[0])
    const roleId = roleFinal.match(/\d+/)
    await connection.promise().query(`UPDATE employee SET role_id=${roleId} WHERE id=${ID}`)
}

// Init function
async function init() {
    // Loop the main menu until exit is picked
    let loopMain = true
    while(loopMain) {
        const { choice } = await mainMenu()

        // View all employees
        if(choice === 'View all employees') {
            const data = await connection.promise().query(`SELECT * FROM employee`)
            console.table(data[0])

        } // Add employee
        else if (choice === 'Add employee') {
            await addEmployee()
            
        } // Update employee 
        else if (choice === 'Update employee role') {
            await updateRole()

        } // View roles 
        else if (choice === 'View all roles') {
            const data = await connection.promise().query(`SELECT * FROM role`)
            console.table(data[0])

        } // Add role 
        else if (choice === 'Add role') {
            await addRole()

        } // View departments
        else if (choice === 'View all departments') {
            const data = await connection.promise().query(`SELECT * FROM department`)
            console.table(data[0])

        } // Add department
        else if (choice === 'Add deparment') {
            await addDepartment()
        } // Exit
        else if (choice === 'Exit') {
            loopMain = false
        }
    }
}
init()