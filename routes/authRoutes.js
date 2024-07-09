const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { registerController, loginController } = require('../controllers/authControllers');
const incomeController = require('../controllers/incomeControllers');
const expenseController = require('../controllers/expenseControllers');
const { getGoals, addGoal, updateGoalAllocation, deleteGoal } = require('../controllers/goalTrackerControllers');
const { getExpenseLimit, setExpenseLimit } = require('../controllers/expenseLimitControllers');
const profileControllers = require('../controllers/profileControllers');
const fcmTokenController =  require("../controllers/fcmTokenControllers") // Correct import
const notificationController = require("../controllers/notificationControllers");
const reminderControllers = require('../controllers/reminderControllers');

const router = express.Router();

// Authentication routes
router.post('/register', registerController);
router.post('/login', loginController);

// Routes requiring authentication
router.get('/income', authMiddleware, incomeController.getIncomes);
router.post('/income', authMiddleware, incomeController.addIncome);
router.delete('/income/:id', authMiddleware, incomeController.deleteIncome);

router.get('/expenses', authMiddleware, expenseController.getExpenses);
router.post('/expenses', authMiddleware, expenseController.addExpense);
router.delete('/expenses/:id', authMiddleware, expenseController.deleteExpense);

router.get('/goals', authMiddleware, getGoals);
router.post('/goals', authMiddleware, addGoal);
router.put('/goals/:id', authMiddleware, updateGoalAllocation);
router.delete('/goals/:id', authMiddleware, deleteGoal);

router.get('/expense-limit', authMiddleware, getExpenseLimit);
router.put('/expense-limit', authMiddleware, setExpenseLimit);

router.get('/profile', authMiddleware, profileControllers.getProfile);
router.put('/profile', authMiddleware, profileControllers.updateProfile);
router.put('/profile/update-password', authMiddleware, profileControllers.updatePassword);

router.get('/reminders', authMiddleware, reminderControllers.getReminders);
router.post('/reminders', authMiddleware, reminderControllers.addReminder);
router.delete('/reminders/:id', authMiddleware, reminderControllers.deleteReminder);
router.put('/reminders/:id/toggle', authMiddleware, reminderControllers.toggleReminderCompletion);

//fcm token update
router.put('/update-fcm-token',fcmTokenController)

// Find fcmToken and send notification
router.post('/sendnotification', notificationController);

module.exports = router;
