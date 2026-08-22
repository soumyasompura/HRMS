-- ============================================
-- DAYFLOW HRMS DATABASE SCHEMA
-- ==========================================
-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hr', 'manager', 'employee') NOT NULL DEFAULT 'employee',
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    phone VARCHAR(20),
    address TEXT,
    department VARCHAR(100),
    designation VARCHAR(100),
    joining_date DATE,
    dob DATE,
    gender ENUM('male', 'female', 'other'),
    blood_group VARCHAR(5),
    nationality VARCHAR(50),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    profile_picture VARCHAR(255),
    two_factor_secret VARCHAR(255),
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_department (department),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- ============================================
-- 2. ATTENDANCE TABLE
-- ============================================
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in DATETIME,
    check_out DATETIME,
    total_hours DECIMAL(5,2),
    status ENUM('present', 'absent', 'half_day', 'on_leave', 'holiday') NOT NULL DEFAULT 'present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee_date (employee_id, date),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- ============================================
-- 3. LEAVE_BALANCES TABLE
-- ============================================
CREATE TABLE leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    year YEAR NOT NULL,
    paid_leave_total INT NOT NULL DEFAULT 0,
    paid_leave_used INT NOT NULL DEFAULT 0,
    sick_leave_total INT NOT NULL DEFAULT 0,
    sick_leave_used INT NOT NULL DEFAULT 0,
    unpaid_leave_used INT NOT NULL DEFAULT 0,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee_year (employee_id, year),
    CHECK (paid_leave_used <= paid_leave_total),
    CHECK (sick_leave_used <= sick_leave_total)
);

-- ============================================
-- 4. LEAVE_REQUESTS TABLE
-- ============================================
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type ENUM('paid', 'sick', 'unpaid') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    hr_comment TEXT,
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CHECK (end_date >= start_date),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- ============================================
-- 5. PAYROLL TABLE
-- ============================================
CREATE TABLE payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month TINYINT NOT NULL,
    year YEAR NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    allowances DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    net_salary DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
    effective_from DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee_month_year (employee_id, month, year),
    CHECK (month BETWEEN 1 AND 12),
    INDEX idx_payment_status (payment_status)
);

-- ============================================
-- 6. WORK_UPDATES TABLE
-- ============================================
CREATE TABLE work_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    project VARCHAR(150),
    work_title VARCHAR(200) NOT NULL,
    description TEXT,
    work_date DATE NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'blocked') NOT NULL DEFAULT 'pending',
    progress_percentage TINYINT NOT NULL DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (progress_percentage BETWEEN 0 AND 100),
    INDEX idx_status (status),
    INDEX idx_work_date (work_date)
);

-- ============================================
-- 7. ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_by INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_at (created_at)
);

-- ============================================
-- 8. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
);

-- ============================================
-- 9. AUDIT_LOGS TABLE
-- ============================================
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100),
    target_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_target (target_type, target_id),
    INDEX idx_created_at (created_at)
);