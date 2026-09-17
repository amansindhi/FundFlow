# 💰 FundFlow — Student Money Tracker

<div align="center">

![FundFlow](icon-192.png)

**A simple and modern personal finance tracker designed for students.**

[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-Personal%20Use-blue?style=for-the-badge)](LICENSE)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 💰 **Transaction Tracking** | Add and manage income and expenses with categories, descriptions and dates |
| 🔄 **Recurring Transactions** | Create weekly or monthly recurring income and expenses |
| 📊 **Financial Analytics** | View income, expenses, balance and monthly financial activity |
| 📈 **Expense Analysis** | Analyze spending and income through category-based information |
| 🎯 **Budget Tracker** | Set monthly or custom date-range budgets and monitor spending |
| 💵 **Savings Goals** | Create savings targets and track progress toward each goal |
| 🔍 **Transaction Search** | Search and filter transactions easily |
| ✏️ **Edit & Delete** | Update or remove existing transactions |
| 📁 **CSV Export** | Export transaction data for personal records and analysis |
| 🌙 **Dark / Light Mode** | Switch between light and dark themes |
| 📱 **Responsive Design** | Optimized for mobile and desktop screens |
| 📲 **PWA Installable** | Install FundFlow as an application on supported devices |
| ⚡ **Offline Support** | Service worker support for improved offline access |
| 🔒 **Local Data Storage** | Financial data is stored locally in the browser |

---

## 💰 Transaction Management

FundFlow provides a simple interface for managing daily financial activity.

Users can:

1. **Add Income** — Record money received from different sources.
2. **Add Expenses** — Record daily spending and categorize transactions.
3. **Choose Categories** — Organize transactions using categories.
4. **Set Dates** — Record the date associated with each transaction.
5. **Edit Transactions** — Update existing transaction information.
6. **Delete Transactions** — Remove unwanted records.
7. **Search Transactions** — Quickly find transactions using the search functionality.

---

## 🔄 Recurring Transactions

FundFlow supports recurring transactions for regular financial activities.

Users can create:

*   **Weekly transactions**
*   **Monthly transactions**

This can be used for recurring:

*   Allowance
*   Bills
*   Subscriptions
*   Regular expenses
*   Regular income

Recurring transactions help reduce the need to manually enter the same transaction repeatedly.

---

## 📊 Financial Analytics

FundFlow includes an analytics section for understanding financial activity.

The dashboard provides information such as:

*   Total Income
*   Total Expenses
*   Current Balance
*   Monthly financial activity
*   Income analysis
*   Expense analysis
*   Category-based spending information
*   Historical monthly information

Users can select different months to view their financial activity.

---

## 🎯 Budget Tracker

The Budget Tracker helps users control spending by setting financial limits.

Users can:

1. Create a budget.
2. Select a spending category.
3. Choose a budget period.
4. Set a budget limit.
5. Monitor spending against the selected limit.
6. Delete existing budgets.

FundFlow supports different budget periods, including:

*   **Monthly**
*   **Custom date range**

---

## 💵 Savings Goals

FundFlow provides a savings goal system for tracking financial targets.

Users can:

*   Create a savings goal
*   Set a target amount
*   Record the current saved amount
*   Add money toward a goal
*   Track savings progress
*   Delete savings goals

Example goals include:

*   Laptop
*   Smartphone
*   Trip
*   Gadgets
*   Emergency savings

---

## 📁 CSV Export

FundFlow provides CSV export functionality for transaction records.

Exported data can be used for:

*   Personal financial records
*   Spreadsheet analysis
*   Backup purposes
*   Further data processing

---

## 🌙 Dark / Light Mode

FundFlow supports both light and dark themes.

Users can switch between themes directly from the application interface for a more comfortable experience in different environments.

---

## 📱 Progressive Web App

FundFlow includes Progressive Web App functionality.

The project contains:

*   `manifest.json`
*   `sw.js`
*   192×192 application icon
*   512×512 application icon
*   Service Worker caching

The PWA structure allows FundFlow to behave more like an installable application on supported browsers and devices.

---

## 🔒 Data Storage & Privacy

FundFlow stores application data locally in the user's browser using **LocalStorage**.

### Data Flow

```text
User
  │
  ▼
FundFlow
  │
  ▼
Browser LocalStorage
  │
  ▼
Stored Locally on Device