let currentRole = "employee";

let leaveRequests = JSON.parse(localStorage.getItem("leaveRequests")) || [
    {
        employee: "Soumya Sompura",
        type: "Sick Leave",
        from: "2026-08-25",
        to: "2026-08-26",
        remarks: "Medical rest",
        status: "Pending"
    }
];

let checkedIn = localStorage.getItem("checkedIn") === "true";
let checkedOut = localStorage.getItem("checkedOut") === "true";


/* DATE */

document.getElementById("dateText").innerText =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });


/* ROLE SELECT */

function selectRole(role) {

    currentRole = role;

    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });

    if (role === "employee") {
        document.querySelectorAll(".tab")[0].classList.add("active");
        document.getElementById("roleHint").innerText = "Login as Employee";
    } else {
        document.querySelectorAll(".tab")[1].classList.add("active");
        document.getElementById("roleHint").innerText = "Login as Admin / HR Officer";
    }
}


/* LOGIN */

function login(event) {

    event.preventDefault();

    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    if (currentRole === "admin") {

        document.getElementById("userName").innerText = "HR Administrator";
        document.getElementById("userRole").innerText = "Admin / HR";
        document.getElementById("userAvatar").innerText = "A";

    } else {

        document.getElementById("userName").innerText = "Soumya Sompura";
        document.getElementById("userRole").innerText = "Employee";
        document.getElementById("userAvatar").innerText = "S";
    }

    createSidebar();
    showDashboard();
}


/* LOGOUT */

function logout() {

    document.getElementById("app").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
}


/* SIDEBAR */

function createSidebar() {

    let menu;

    if (currentRole === "employee") {

        menu = [
            ["🏠 Dashboard", "dashboard"],
            ["👤 My Profile", "profile"],
            ["🕒 Attendance", "attendance"],
            ["📅 Leave Requests", "leave"],
            ["💰 Payroll", "payroll"]
        ];

    } else {

        menu = [
            ["🏠 Dashboard", "dashboard"],
            ["👥 Employees", "employees"],
            ["🕒 Attendance", "attendance"],
            ["📅 Leave Approvals", "leave"],
            ["💰 Payroll", "payroll"]
        ];
    }

    document.getElementById("sidebarMenu").innerHTML =
        menu.map(item =>
            `<button class="nav-item" onclick="navigate('${item[1]}', this)">
                ${item[0]}
            </button>`
        ).join("");
}


function navigate(page, element) {

    document.querySelectorAll(".nav-item").forEach(item =>
        item.classList.remove("active")
    );

    if (element) {
        element.classList.add("active");
    }

    if (page === "dashboard") showDashboard();
    if (page === "profile") showProfile();
    if (page === "attendance") showAttendance();
    if (page === "leave") showLeave();
    if (page === "payroll") showPayroll();
    if (page === "employees") showEmployees();
}


/* DASHBOARD */

function showDashboard() {

    document.getElementById("pageTitle").innerText = "Dashboard";

    let content = document.getElementById("content");

    if (currentRole === "employee") {

        content.innerHTML = `
            <div class="stats-grid">

                <div class="stat-card">
                    <div class="icon">🟢</div>
                    <h3>${checkedIn ? "Present" : "Not Checked In"}</h3>
                    <p>Today's Attendance</p>
                </div>

                <div class="stat-card">
                    <div class="icon">📅</div>
                    <h3>${leaveRequests.length}</h3>
                    <p>Leave Requests</p>
                </div>

                <div class="stat-card">
                    <div class="icon">⏳</div>
                    <h3>${leaveRequests.filter(x => x.status === "Pending").length}</h3>
                    <p>Pending Requests</p>
                </div>

                <div class="stat-card">
                    <div class="icon">💰</div>
                    <h3>₹72,000</h3>
                    <p>Monthly Salary</p>
                </div>

            </div>

            <div class="dashboard-grid">

                <div class="card">
                    <h3>Recent Activity</h3>

                    <div class="activity">
                        <div class="activity-icon">🕒</div>
                        <div>
                            <strong>${checkedIn ? "Checked in successfully" : "Ready to check in"}</strong>
                            <p>${checkedIn ? "Attendance recorded for today" : "Mark your attendance for today"}</p>
                        </div>
                    </div>

                    <div class="activity">
                        <div class="activity-icon">📅</div>
                        <div>
                            <strong>Leave Management</strong>
                            <p>Track and manage your leave requests.</p>
                        </div>
                    </div>

                </div>

                <div class="card">
                    <h3>Quick Actions</h3>

                    <button class="btn btn-primary"
                        onclick="showAttendance()">
                        Check Attendance
                    </button>

                    <br><br>

                    <button class="btn btn-primary"
                        onclick="showLeave()">
                        Apply for Leave
                    </button>
                </div>

            </div>
        `;

    } else {

        content.innerHTML = `
            <div class="stats-grid">

                <div class="stat-card">
                    <div class="icon">👥</div>
                    <h3>24</h3>
                    <p>Total Employees</p>
                </div>

                <div class="stat-card">
                    <div class="icon">🟢</div>
                    <h3>21</h3>
                    <p>Present Today</p>
                </div>

                <div class="stat-card">
                    <div class="icon">📅</div>
                    <h3>${leaveRequests.filter(x => x.status === "Pending").length}</h3>
                    <p>Pending Leaves</p>
                </div>

                <div class="stat-card">
                    <div class="icon">💰</div>
                    <h3>₹18.6L</h3>
                    <p>Monthly Payroll</p>
                </div>

            </div>

            <div class="dashboard-grid">

                <div class="card">
                    <h3>Pending Approvals</h3>

                    ${leaveRequests
                        .filter(x => x.status === "Pending")
                        .slice(0, 3)
                        .map(x => `
                            <div class="activity">
                                <div class="activity-icon">📅</div>
                                <div>
                                    <strong>${x.employee}</strong>
                                    <p>${x.type} · Pending Approval</p>
                                </div>
                            </div>
                        `).join("") || "<p>No pending approvals 🎉</p>"}

                </div>

                <div class="card">
                    <h3>Quick Overview</h3>

                    <div class="activity">
                        <div class="activity-icon">👥</div>
                        <div>
                            <strong>24 Employees</strong>
                            <p>Active workforce</p>
                        </div>
                    </div>

                    <div class="activity">
                        <div class="activity-icon">🟢</div>
                        <div>
                            <strong>87.5% Attendance</strong>
                            <p>Today's attendance rate</p>
                        </div>
                    </div>

                </div>

            </div>
        `;
    }
}


/* PROFILE */

function showProfile() {

    document.getElementById("pageTitle").innerText = "My Profile";

    document.getElementById("content").innerHTML = `

        <div class="profile-header">

            <div class="profile-avatar">S</div>

            <div>
                <h2>Soumya Sompura</h2>
                <p>Electronics Engineer · Employee ID: EMP1024</p>
            </div>

        </div>

        <div class="profile-details">

            <div class="detail-card">
                <span>Email</span>
                <strong>soumy@example.com</strong>
            </div>

            <div class="detail-card">
                <span>Phone</span>
                <strong>+91 98765 43210</strong>
            </div>

            <div class="detail-card">
                <span>Department</span>
                <strong>Engineering</strong>
            </div>

            <div class="detail-card">
                <span>Designation</span>
                <strong>Software Engineer</strong>
            </div>

            <div class="detail-card">
                <span>Joining Date</span>
                <strong>01 January 2025</strong>
            </div>

            <div class="detail-card">
                <span>Annual CTC</span>
                <strong>₹8,64,000</strong>
            </div>

        </div>
    `;
}


/* ATTENDANCE */

function showAttendance() {

    document.getElementById("pageTitle").innerText = "Attendance";

    let employeeActions = currentRole === "employee"
        ? `
            <div class="attendance-actions">
                <button class="btn btn-primary"
                    onclick="checkIn()"
                    ${checkedIn ? "disabled" : ""}>
                    ${checkedIn ? "✓ Checked In" : "Check In"}
                </button>

                <button class="btn btn-primary"
                    onclick="checkOut()"
                    ${!checkedIn || checkedOut ? "disabled" : ""}>
                    ${checkedOut ? "✓ Checked Out" : "Check Out"}
                </button>
            </div>
        `
        : "";

    let adminTable = currentRole === "admin"
        ? `
            <div class="table-container">
                <h3>Employee Attendance Records</h3>

                <table>
                    <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Check In</th>
                        <th>Status</th>
                    </tr>

                    <tr>
                        <td>Soumya Sompura</td>
                        <td>Engineering</td>
                        <td>09:15 AM</td>
                        <td><span class="status present">Present</span></td>
                    </tr>

                    <tr>
                        <td>Rahul Sharma</td>
                        <td>Design</td>
                        <td>09:02 AM</td>
                        <td><span class="status present">Present</span></td>
                    </tr>

                    <tr>
                        <td>Priya Patel</td>
                        <td>HR</td>
                        <td>-</td>
                        <td><span class="status leave">Leave</span></td>
                    </tr>

                    <tr>
                        <td>Aman Verma</td>
                        <td>Finance</td>
                        <td>-</td>
                        <td><span class="status absent">Absent</span></td>
                    </tr>

                </table>
            </div>
        `
        : `
            <div class="table-container">
                <h3>Weekly Attendance</h3>

                <table>
                    <tr>
                        <th>Day</th>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                    </tr>

                    <tr>
                        <td>Monday</td>
                        <td>18 Aug</td>
                        <td>09:12 AM</td>
                        <td>06:05 PM</td>
                        <td><span class="status present">Present</span></td>
                    </tr>

                    <tr>
                        <td>Tuesday</td>
                        <td>19 Aug</td>
                        <td>09:08 AM</td>
                        <td>06:10 PM</td>
                        <td><span class="status present">Present</span></td>
                    </tr>

                    <tr>
                        <td>Wednesday</td>
                        <td>20 Aug</td>
                        <td>-</td>
                        <td>-</td>
                        <td><span class="status leave">Leave</span></td>
                    </tr>

                    <tr>
                        <td>Thursday</td>
                        <td>21 Aug</td>
                        <td>09:20 AM</td>
                        <td>06:00 PM</td>
                        <td><span class="status present">Present</span></td>
                    </tr>

                </table>
            </div>
        `;

    document.getElementById("content").innerHTML = `
        ${currentRole === "employee" ? `
            <div class="attendance-status">
                <p>Today's Status</p>
                <div class="big-status">
                    ${checkedIn ? "PRESENT" : "NOT MARKED"}
                </div>

                <p>
                    Check In: ${checkedIn ? localStorage.getItem("checkInTime") : "--"}
                    <br>
                    Check Out: ${checkedOut ? localStorage.getItem("checkOutTime") : "--"}
                </p>
            </div>
        ` : ""}

        ${employeeActions}
        ${adminTable}
    `;
}


function checkIn() {

    checkedIn = true;

    let time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    localStorage.setItem("checkedIn", "true");
    localStorage.setItem("checkInTime", time);

    showAttendance();
}


function checkOut() {

    checkedOut = true;

    let time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    localStorage.setItem("checkedOut", "true");
    localStorage.setItem("checkOutTime", time);

    showAttendance();
}


/* LEAVE */

function showLeave() {

    document.getElementById("pageTitle").innerText =
        currentRole === "employee"
            ? "Leave Requests"
            : "Leave Approvals";

    if (currentRole === "employee") {

        document.getElementById("content").innerHTML = `

            <div class="form-card">

                <h3>Apply for Leave</h3>

                <form onsubmit="applyLeave(event)">

                    <label>Leave Type</label>

                    <select id="leaveType">
                        <option>Paid Leave</option>
                        <option>Sick Leave</option>
                        <option>Unpaid Leave</option>
                    </select>

                    <div class="form-row">

                        <div>
                            <label>From</label>
                            <input type="date" id="fromDate" required>
                        </div>

                        <div>
                            <label>To</label>
                            <input type="date" id="toDate" required>
                        </div>

                    </div>

                    <label>Remarks</label>

                    <textarea
                        id="remarks"
                        placeholder="Reason for leave">
                    </textarea>

                    <button class="primary-btn">
                        Submit Request
                    </button>

                </form>

            </div>

            <br>

            <div class="table-container">

                <h3>My Leave Requests</h3>

                <table>

                    <tr>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Status</th>
                    </tr>

                    ${leaveRequests.map(request => `
                        <tr>
                            <td>${request.type}</td>
                            <td>${request.from}</td>
                            <td>${request.to}</td>
                            <td>
                                <span class="status ${request.status.toLowerCase()}">
                                    ${request.status}
                                </span>
                            </td>
                        </tr>
                    `).join("")}

                </table>

            </div>
        `;

    } else {

        document.getElementById("content").innerHTML = `

            <div class="table-container">

                <h3>All Leave Requests</h3>

                <table>

                    <tr>
                        <th>Employee</th>
                        <th>Leave Type</th>
                        <th>Dates</th>
                        <th>Remarks</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>

                    ${leaveRequests.map((request, index) => `

                        <tr>

                            <td>${request.employee}</td>

                            <td>${request.type}</td>

                            <td>
                                ${request.from}<br>
                                ${request.to}
                            </td>

                            <td>${request.remarks || "-"}</td>

                            <td>
                                <span class="status ${request.status.toLowerCase()}">
                                    ${request.status}
                                </span>
                            </td>

                            <td>

                                ${request.status === "Pending"
                                    ? `
                                        <button class="btn btn-success"
                                            onclick="updateLeave(${index}, 'Approved')">
                                            Approve
                                        </button>

                                        <button class="btn btn-danger"
                                            onclick="updateLeave(${index}, 'Rejected')">
                                            Reject
                                        </button>
                                    `
                                    : "-"
                                }

                            </td>

                        </tr>

                    `).join("")}

                </table>

            </div>
        `;
    }
}


function applyLeave(event) {

    event.preventDefault();

    let request = {
        employee: "Soumya Sompura",
        type: document.getElementById("leaveType").value,
        from: document.getElementById("fromDate").value,
        to: document.getElementById("toDate").value,
        remarks: document.getElementById("remarks").value,
        status: "Pending"
    };

    leaveRequests.push(request);

    localStorage.setItem(
        "leaveRequests",
        JSON.stringify(leaveRequests)
    );

    alert("Leave request submitted successfully!");

    showLeave();
}


function updateLeave(index, status) {

    leaveRequests[index].status = status;

    localStorage.setItem(
        "leaveRequests",
        JSON.stringify(leaveRequests)
    );

    showLeave();
}


/* EMPLOYEES */

function showEmployees() {

    document.getElementById("pageTitle").innerText = "Employees";

    document.getElementById("content").innerHTML = `

        <div class="table-container">

            <h3>Employee Directory</h3>

            <table>

                <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                </tr>

                <tr>
                    <td>EMP1024</td>
                    <td>Soumya Sompura</td>
                    <td>Engineering</td>
                    <td>Software Engineer</td>
                    <td><span class="status approved">Active</span></td>
                </tr>

                <tr>
                    <td>EMP1025</td>
                    <td>Rahul Sharma</td>
                    <td>Design</td>
                    <td>UI Designer</td>
                    <td><span class="status approved">Active</span></td>
                </tr>

                <tr>
                    <td>EMP1026</td>
                    <td>Priya Patel</td>
                    <td>Human Resources</td>
                    <td>HR Executive</td>
                    <td><span class="status approved">Active</span></td>
                </tr>

                <tr>
                    <td>EMP1027</td>
                    <td>Aman Verma</td>
                    <td>Finance</td>
                    <td>Financial Analyst</td>
                    <td><span class="status approved">Active</span></td>
                </tr>

            </table>

        </div>
    `;
}


/* PAYROLL */

function showPayroll() {

    document.getElementById("pageTitle").innerText = "Payroll";

    if (currentRole === "employee") {

        document.getElementById("content").innerHTML = `

            <div class="salary-card">

                <p>August 2026 Salary</p>

                <h2>₹72,000</h2>

                <p>Net Salary · Processed Successfully</p>

            </div>

            <br>

            <div class="table-container">

                <h3>Salary Structure</h3>

                <table>

                    <tr>
                        <td>Basic Salary</td>
                        <td>₹45,000</td>
                    </tr>

                    <tr>
                        <td>House Rent Allowance</td>
                        <td>₹15,000</td>
                    </tr>

                    <tr>
                        <td>Other Allowances</td>
                        <td>₹15,000</td>
                    </tr>

                    <tr>
                        <td>Deductions</td>
                        <td>-₹3,000</td>
                    </tr>

                    <tr>
                        <td><strong>Net Salary</strong></td>
                        <td><strong>₹72,000</strong></td>
                    </tr>

                </table>

            </div>
        `;

    } else {

        document.getElementById("content").innerHTML = `

            <div class="table-container">

                <h3>Employee Payroll Overview</h3>

                <table>

                    <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Monthly Salary</th>
                        <th>Status</th>
                    </tr>

                    <tr>
                        <td>Soumya Sompura</td>
                        <td>Engineering</td>
                        <td>₹72,000</td>
                        <td><span class="status approved">Processed</span></td>
                    </tr>

                    <tr>
                        <td>Rahul Sharma</td>
                        <td>Design</td>
                        <td>₹65,000</td>
                        <td><span class="status approved">Processed</span></td>
                    </tr>

                    <tr>
                        <td>Priya Patel</td>
                        <td>HR</td>
                        <td>₹58,000</td>
                        <td><span class="status pending">Pending</span></td>
                    </tr>

                </table>

            </div>
        `;
    }
}