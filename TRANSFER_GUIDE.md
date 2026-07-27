# IMS Petty Cash - How to Transfer & Use on Another Laptop

Here are the **3 easy ways** to transfer and use this software on another laptop or computer:

---

## Method 1: Open Live Web Link (Easiest - 0 Setup Required!) ⭐
No installation needed! Just open your browser on the new laptop:

1. Open Chrome/Edge/Safari and go to:
   👉 **`https://imsbanti.github.io/imspetty/`**
2. Log in with your password:
   - **Admin**: `admin123`
   - **Staff**: `user123`

### To Transfer Current Data to the New Laptop:
- **On Old Laptop**: Go to **`Cloud Sync`** tab -> Click **"Upload Data to Cloud"** (note your 6-digit Sync Code, e.g. `IMS-882914`).
- **On New Laptop**: Go to **`Cloud Sync`** tab -> Type code `IMS-882914` -> Click **"Download Data from Cloud"**.

---

## Method 2: Transfer via USB Pen Drive or Google Drive
To copy the entire software folder to the new laptop offline:

1. Copy the folder `E:\.gemini\antigravity\scratch\PettyCash` onto a USB Flash Drive or Google Drive.
2. Paste the folder onto the new laptop.
3. On the new laptop, open Command Prompt in that folder and run:
   ```bash
   npm install
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser!

---

## Method 3: Download Directly from GitHub
If the new laptop has Git and Node.js installed:

1. Open PowerShell on the new laptop and run:
   ```bash
   git clone https://github.com/IMSBANTI/imspetty.git
   cd imspetty
   npm install
   npm run dev
   ```
2. Open `http://localhost:3000` in your browser!
