const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('admin'));
router.get('/stats', ctrl.getDashboardStats);
router.get('/activities', ctrl.getRecentActivities);

module.exports = router;