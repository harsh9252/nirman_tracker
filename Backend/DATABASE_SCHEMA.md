Project NirmanTracker {
  database_type: "MySQL"
}

Table users {
  id int [pk, increment]
  first_name varchar(255) [not null]
  last_name varchar(255) [not null]
  email varchar(255) [not null, unique]
  username varchar(255) [not null, unique]
  phone varchar(20)
  password varchar(255) [not null]
  role varchar(50) [note: 'Admin', 'Project Manager', 'HR', 'Site Manager', 'Office Staff', 'Field Rep']
  status varchar(50) [note: 'Active', 'Inactive']
  profile_image varchar(255)
  permissions json
  is_temp_password boolean
  created_at timestamp [default: `current_timestamp`]
}

Table clients {
  id int [pk, increment]
  client_name varchar(255) [not null]
  phone varchar(20) [not null]
  email varchar(255)
  company_name varchar(255)
  address text
  lead_id int
  conversion_date timestamp
}

Table leads {
  id int [pk, increment]
  contact_name varchar(255) [not null]
  phone varchar(20) [not null]
  email varchar(255)
  lead_status varchar(50)
  is_converted boolean
  is_lost boolean
}

Table projects {
  id int [pk, increment]
  project_name varchar(255) [not null]
  client_id int
  project_type varchar(50)
  status varchar(50) [note: 'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']
  start_date date [not null]
  expected_completion_date date
  actual_completion_date date
  estimated_budget decimal(15,2)
  actual_cost decimal(15,2)
  description text
  scope_of_work text
  created_by int
  assigned_to int
  created_at timestamp [default: `current_timestamp`]
}

Table tasks {
  id int [pk, increment]
  name varchar(255) [not null]
  project_id int
  assignTo int
  assignBy int
  status varchar(50)
  priority varchar(20)
  dueDate date
  latitude decimal(10,8)
  longitude decimal(11,8)
}

Table transactions {
  id int [pk, increment]
  project_id int
  type varchar(50) [not null]
  party_name varchar(255) [not null]
  amount decimal(15,2) [not null]
  date date [not null]
}

Table employees {
  id int [pk, increment]
  name varchar(255) [not null]
  designation varchar(100)
  department varchar(100)
  salary decimal(15,2)
  status varchar(50)
}

Table attendance {
  id int [pk, increment]
  employee_id int
  project_id int
  attendance_date date [not null]
  status varchar(20)
}

Table notifications {
  id int [pk, increment]
  user_id int
  message text
  is_read boolean
  created_at timestamp [default: `current_timestamp`]
}

Table taskcomments {
  id int [pk, increment]
  task_id int
  user_id int
  comment text
  created_at timestamp [default: `current_timestamp`]
}

/* Relationships */

Ref: projects.client_id > clients.id
Ref: projects.created_by > users.id
Ref: projects.assigned_to > users.id

Ref: clients.lead_id > leads.id

Ref: tasks.project_id > projects.id
Ref: tasks.assignTo > users.id
Ref: tasks.assignBy > users.id

Ref: transactions.project_id > projects.id

Ref: attendance.employee_id > employees.id
Ref: attendance.project_id > projects.id

Ref: notifications.user_id > users.id

Ref: taskcomments.task_id > tasks.id
Ref: taskcomments.user_id > users.id
