# CSV Upload and Processing API

This project is a Node.js and Express-based backend application designed for efficient handling of large CSV file uploads.  
It processes and inserts thousands of records into a PostgreSQL database in batches while maintaining clean, modular code organization.

---

## Features

- Upload and parse CSV files via REST API (`/upload`)
- Batch data insertion for high performance
- PostgreSQL integration with proper schema handling
- Configurable batch size and file paths through environment variables
- Modular structure with controllers, routes, and utilities
- Supports large datasets (tested with 10,000+ records)

---

## Folder Structure

