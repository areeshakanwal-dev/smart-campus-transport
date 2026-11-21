const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Har route ke liye authentication zaroori hai
router.use(authenticate);
router.use(authorize('admin')); // Sirf admin access kar sakta hai

// ----------------------------------------
// Dashboard Stats
// ----------------------------------------
router.get('/stats', ctrl.getDashboardStats);

// ----------------------------------------
// Driver Management Routes
// ----------------------------------------
router.get('/drivers', ctrl.getDrivers);
router.post('/drivers', ctrl.createDriver);
router.delete('/drivers/:id', ctrl.deleteDriver);

// ----------------------------------------
// Parent Management Routes
// ----------------------------------------
router.get('/parents', ctrl.getParents);
router.post('/parents', ctrl.createParent);
router.delete('/parents/:id', ctrl.deleteParent);

module.exports = router;